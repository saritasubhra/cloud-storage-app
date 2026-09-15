import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/authController.js";
import checkAuth from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", checkAuth, getMe);

export default router;
