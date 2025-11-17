import User from "../models/User.js";

export const checkUserStatus = async (req, res, next) => {
  try {
    let user;

    // Register route → email from req.body
    if (req.body && req.body.email) {
      user = await User.findOne({ email: req.body.email });
    } 
    // Protected routes → userId from JWT
    else if (req.user && req.user.userId) {
      user = await User.findById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.disabled) {
      return res.status(403).json({
        message: "Your account is disabled due to 3 warnings. Contact support.",
      });
    }

    req.user = user; // attach full mongoose user doc
    next();
  } catch (error) {
    res.status(500).json({ message: "Error checking user status", error: error.message });
  }
};
