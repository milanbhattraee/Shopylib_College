// routes/user.routes.js
import { Router } from "express";
import {
  createUser,
  getAllAdmins,
  getUserProfile,
  updateProfile,
  updateUserAvatar,
  updateUserPermissions,
  updateUserProfile,
} from "../controllers/user.controller.js";
import {
  authMiddleware,
  permissionMiddleware,
} from "../middleware/auth.middleware.js";
import upload from "../config/multer.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getUserProfile);
router.patch("/", upload.fields([{ name: "avatar", maxCount: 1 }]), updateProfile);

router.patch(
  "/updateAvatar",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateUserAvatar
);

// Apply permission middleware to all routes below
router.use(permissionMiddleware("manageUsers"));

// Admin routes
router.post(
  "/create",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  createUser
);
router.get("/info/:userId", getUserProfile);
router.get("/admins", getAllAdmins);
router.patch(
  "/:userId",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateUserProfile
);

router.patch("/:userId/updatePermissions", updateUserPermissions);

export default router;
