// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import formidable from "formidable";
import axios from "axios";
const normalize = (val) => (Array.isArray(val) ? val[0] : val);
const fetchImageBuffer = async (url) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data, "binary");
};

export const register = async (req, res) => {
  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields) => {
    if (err) {
      console.error("Formidable parse error:", err);
      return res.status(500).json({ msg: "Error parsing form data" });
    }

    try {
      const { firstName, lastName, username, email, password, phone } = fields;

      // check if email exists
      const exist = await User.findOne({ email: normalize(email) });
      if (exist) return res.status(400).json({ msg: "Email already exists" });

      // hash password
      const hashed = await bcrypt.hash(normalize(password), 10);

      // always fetch default profile pic from URL
      const defaultBuffer = await fetchImageBuffer(
        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
      );
      // Generate email verification token
      const verificationToken = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: "1d" } // valid for 1 day
      );
      const profilePicture = {
        data: defaultBuffer,
        contentType: "image/png",
      };
      const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

      // create new user
      const newUser = new User({
        firstName: normalize(firstName),
        lastName: normalize(lastName),
        username: normalize(username),
        email: normalize(email),
        phoneNumber: normalize(phone),
        password: hashed,
        profilePicture,
        verificationToken,
      });

      await newUser.save();

      res.status(201).json({
        msg: "User registered successfully",
        verifyUrl: verifyUrl,
        result: true,
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ result: false, msg: "Server error", err });
    }
  });
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 2. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ msg: "Email is already verified" });
    }

    // 3. Generate new token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4. Save token in DB
    user.verificationToken = token;
    await user.save();

    // 5. Create verification URL
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;

    res.json({
      msg: "Verification email resent successfully",
      verifyUrl: verifyUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      email: decoded.email,
      verificationToken: token,
    });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined; // remove token after verification
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Email verified successfully! You can now log in.",
    });
  } catch (err) {
    res.status(400).json({ success: false, msg: "Invalid or expired token" });
  }
};
export const UniqueUsername = async (req, res) => {
  try {
    const { username } = req.body;

    const exist = await User.findOne({ username });

    if (exist) return res.status(400).json({ msg: "username already exists" });

    res.status(201).json({ msg: "User registered successfully", result: true });
  } catch (err) {
    res.status(500).json({ result: false, msg: "Server error", err });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!user.isVerified) {
      return res.status(403).json({
        msg: "Please verify your email before logging in",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Award daily login credit if needed
    const now = new Date();
    const lastLogin = new Date(user.lastLogin || 0);
    const diff = now.getDate() !== lastLogin.getDate();

    if (diff) {
      user.credits += 10;
    }

    user.lastLogin = now;
    await user.save();

    res.json({
      result: true,
      token,
      user: {
        id: user._id,
        FirstName: user.firstName,
        LastName: user.lastName,
        username: user.username,
        role: user.role,
        credits: user.credits,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ result: false, msg: "Server error", err });
  }
};

// POST /auth/forgot-password
export const forgetpassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  // generate token
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  res.json({
    msg: "Password reset link sent to your email",
    resetUrl: resetUrl,
  });
};

// POST /auth/reset-password/:token
export const resetpassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (
      !user ||
      user.resetPasswordToken !== token ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: "Password has been reset successfully" });
  } catch (error) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
};
