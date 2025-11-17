import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "../utils/email.js";
import Interviewer from "../models/Interviewer.js";
import Meeting from "../models/Meeting.js";
const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "your_jwt_secret";
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    secret,
    { expiresIn: "7d" }
  );
};

// 🔹 Login Controller (JWT + bcrypt)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found, please register first" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "User does not have a password set. Please register again." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT
    const token = generateToken(user);

    // Prepare user object without password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Login successful",
      user: {
        ...userObj,
        coins: user.coins,
        rating: user.averageRating,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in login", error: error.message });
  }
};

// 🔹 Register Controller (JWT + bcrypt)
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    let existing = await User.findOne({ email });
    if (existing) {

      return res.status(400).json({ message: "User already registered. Please login." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstName);

    // Generate JWT
    const token = generateToken(user);

    // Prepare user object without password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: "User registered successfully",  
      user: {
        ...userObj,
        coins: user.coins,
        rating: user.averageRating,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Error in registration", error: error.message });
  }
};


export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Use values from the User document only (do not mix with interviewer profile)
    const interviewsTaken = user.interviewsTaken || 0;
    const interviewsGiven = user.interviewsGiven || 0;
    const averageRating = (user.ratingSum && interviewsTaken > 0) ? (user.ratingSum / interviewsTaken) : 0;

    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      coins: user.coins,
      interviewsGiven,
      interviewsTaken,
      averageRating: averageRating.toFixed(1),
      warnings: user.warningCount || 0,
      disabled: user.disabled || false,
    });
  } catch (err) {
    console.error("❌ Error fetching stats:", err);
    res
      .status(500)
      .json({ message: "Error fetching stats", error: err.message });
  }
};
