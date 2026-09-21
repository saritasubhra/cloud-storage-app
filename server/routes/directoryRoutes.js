import { Router } from "express";
import checkAuth from "../middlewares/auth.js";
import {
  createDirectory,
  getDirectoryContents,
  updateDirectory,
  deleteDirectory,
} from "../controllers/directoryController.js";

const router = Router();

// Every route below requires a logged-in user
router.use(checkAuth);

router.post("/", createDirectory);
router.get("/", getDirectoryContents);
router.patch("/:id", updateDirectory);
router.delete("/:id", deleteDirectory);

export default router;
