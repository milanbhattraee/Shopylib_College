// routes/order.routes.js
import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getSingleOrder,
  cancelOrder,
  changeOrderStatus,
  requestReturn,
  approveReturn,
  rejectReturn,
} from "../controllers/order.controller.js";
import { permissionMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Auth required routes
router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getSingleOrder);
router.patch("/:orderId/cancel", cancelOrder);

// Return routes (user)
router.patch("/:orderId/return", requestReturn);

// Apply admin permission middleware to specific routes
router.patch(
  "/:orderId/status",
  permissionMiddleware("manageOrders"),
  changeOrderStatus
);

// Return routes (admin)
router.patch(
  "/:orderId/return/approve",
  permissionMiddleware("manageOrders"),
  approveReturn
);
router.patch(
  "/:orderId/return/reject",
  permissionMiddleware("manageOrders"),
  rejectReturn
);

export default router;
