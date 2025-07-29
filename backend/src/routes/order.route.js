// routes/order.routes.js
import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getSingleOrder,
  cancelOrder,
  changeOrderStatus,
  getMyOrders,
} from "../controllers/order.controller.js";
import { permissionMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Auth required routes
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/get/:orderId", getSingleOrder);
router.patch("/:orderId/cancel", cancelOrder);

// Apply admin permission middleware to specific routes

router.use(permissionMiddleware("manageOrders"));

router.get("/:userId", getUserOrders);
router.patch("/:orderId/status", changeOrderStatus);

export default router;
