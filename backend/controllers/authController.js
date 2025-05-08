// controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ msg: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashed });
    await newUser.save();

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
      user.credits += 10; // for example, 10 credits daily
    }

    user.lastLogin = now;
    await user.save();

    res.json({
      result: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        credits: user.credits,
        profileCompleted: user.profileCompleted,
      },
    });
  } catch (err) {
    res.status(500).json({ result: false, msg: "Server error", err });
  }
};
