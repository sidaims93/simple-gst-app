import express from "express";
const router = express.Router();
export default router;

import { signup, verifyEmail } from "../controllers/Auth/RegisterController.js";
import login from "../controllers/Auth/LoginController.js";
import passwordReset from "../controllers/Auth/PasswordResetController.js";

/* GET users listing. */
router.post("/register", signup);
router.post("/login", login);
router.get("/verify/email", verifyEmail);
router.post("/password/reset", passwordReset);
