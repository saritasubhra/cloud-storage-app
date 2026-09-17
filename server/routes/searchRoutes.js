import { Router } from "express";
import checkAuth from "../middlewares/auth.js";
import { search } from "../controllers/searchController.js";

const router = Router();

router.use(checkAuth);

router.get("/", search);

export default router;
