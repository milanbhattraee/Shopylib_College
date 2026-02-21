import { Router } from "express";
import upload from "../config/multer.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getActiveBanners,
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} from "../controllers/banner.controller.js";

const router = Router();

// Public: Get active banners for homepage
router.get("/active", getActiveBanners);

// Admin routes (require auth)
router.get("/", authMiddleware, getAllBanners);
router.get("/:id", authMiddleware, getBannerById);
router.post("/", authMiddleware, upload.single("image"), createBanner);
router.put("/:id", authMiddleware, upload.single("image"), updateBanner);
router.delete("/:id", authMiddleware, deleteBanner);
router.patch("/:id/toggle", authMiddleware, toggleBannerStatus);

export default router;
