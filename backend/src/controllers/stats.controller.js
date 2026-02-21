import { User, Product, Order } from "../models/index.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getSiteStats = asyncHandler(async (req, res) => {
  const [customers, products, deliveredOrders] = await Promise.all([
    User.count(),
    Product.count({ where: { isActive: true } }),
    Order.count({ where: { status: "delivered" } }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, { customers, products, deliveredOrders }, "Stats fetched")
  );
});
