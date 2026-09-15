import { Router } from "express";
import checkAuth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";
import { uploadFile, downloadFile, deleteFile } from "../controllers/fileController.js";

const router = Router();

// Every route below requires a logged-in user
router.use(checkAuth);

router.post("/upload", upload.single("file"), uploadFile);
router.get("/:id/download", downloadFile);
router.delete("/:id", deleteFile);

export default router;
