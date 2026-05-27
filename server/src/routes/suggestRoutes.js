import { Router } from "express";
import { suggestTime } from "../controllers/suggestController.js";

const router = Router();

router.get("/suggest-time", suggestTime);

export default router;
