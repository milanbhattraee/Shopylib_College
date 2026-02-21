import express from "express";
import { getSiteStats } from "../controllers/stats.controller.js";

const router = express.Router();

router.get("/", getSiteStats);

export default router;
