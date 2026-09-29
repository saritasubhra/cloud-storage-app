import { Router } from "express";
import checkAuth from "../middlewares/auth.js";
import {
  createShare,
  listShares,
  revokeShare,
  resolvePublicShare,
  verifyPublicSharePassword,
} from "../controllers/shareController.js";

const router = Router();

// Owner-only - managing your own share links
router.post("/", checkAuth, createShare);
router.get("/", checkAuth, listShares);
router.delete("/:id", checkAuth, revokeShare);

// Public - anyone with the link, no login required
router.get("/public/:token", resolvePublicShare);
router.post("/public/:token/verify", verifyPublicSharePassword);

export default router;
