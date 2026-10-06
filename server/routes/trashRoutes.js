import { Router } from "express";
import checkAuth from "../middlewares/auth.js";
import verifyCronSecret from "../middlewares/verifyCronSecret.js";
import {
  listTrash,
  restoreItem,
  deleteForever,
  emptyTrash,
  purgeExpiredTrash,
} from "../controllers/trashController.js";

const router = Router();

// Cron-only - secured by CRON_SECRET, not a user session. Declared before
// the checkAuth-guarded routes below since it's a completely separate
// auth mechanism.
router.get("/purge-expired", verifyCronSecret, purgeExpiredTrash);

// Everything else requires a logged-in user
router.use(checkAuth);

router.get("/", listTrash);
router.delete("/", emptyTrash);
router.post("/:type/:id/restore", restoreItem);
router.delete("/:type/:id", deleteForever);

export default router;
