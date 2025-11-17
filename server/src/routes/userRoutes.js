import express from "express";
import { checkUserStatus } from "../middlewares/checkUserStatus.js";
import { loginUser, registerUser,getUserStats } from "../controllers/userController.js";

const router = express.Router();

// Login and Register routes are public
router.post("/login", checkUserStatus, loginUser);
router.post("/register", registerUser);
router.get("/stats/:id",getUserStats);

// Example: Protect other routes with jwtAuth
// router.get("/profile", jwtAuth, (req, res) => { ... });

export default router;
