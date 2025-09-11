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

      const profilePicture = {
        data: defaultBuffer,
        contentType: "image/png",
      };

      // create new user
      const newUser = new User({
        firstName: normalize(firstName),
        lastName: normalize(lastName),
        username: normalize(username),
        email: normalize(email),
        phoneNumber: normalize(phone),
        password: hashed,
        profilePicture,
      });

      await newUser.save();

      res
        .status(201)
        .json({ msg: "User registered successfully", result: true });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).json({ result: false, msg: "Server error", err });
    }
  });
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
