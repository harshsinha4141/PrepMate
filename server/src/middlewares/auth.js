import jwt from "jsonwebtoken";

export const jwtAuth = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, secret);

    // 🔑 Always attach userId in the same key
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    console.log("JWT decoded payload:", decoded);
    console.log("Setting req.user.userId:", decoded.userId);

    next();
  } catch (err) {
    console.error("JWT Auth error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }

    return res.status(401).json({ error: "Invalid token" });
  }
};



// import jwt from "jsonwebtoken";
// import User from "../models/User.js"; // ✅ Import your User model

// export const jwtAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization || "";
//     const token = authHeader.replace("Bearer ", "").trim();

//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const secret = process.env.JWT_SECRET || "your_jwt_secret";
//     const decoded = jwt.verify(token, secret);

//     // ✅ Fetch full user document from DB
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ✅ Attach full user object
//     req.user = user;

//     console.log("✅ Authenticated user:", user._id);
//     next();
//   } catch (err) {
//     console.error("JWT Auth error:", err.message);

//     if (err.name === "TokenExpiredError") {
//       return res
//         .status(401)
//         .json({ error: "Token expired. Please login again." });
//     }

//     return res.status(401).json({ error: "Invalid token" });
//   }
// };
