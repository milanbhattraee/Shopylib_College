import { Coupon,Order,OrderCoupon, Cart } from "../models/index.model.js";
import { Op } from "sequelize";


// api
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      type,
      value,
      maxDiscountAmount,
      minimumAmount,
      usageLimit,
      usageLimitPerUser = 1,
      startDate,
      endDate,
      isActive = true,
      isGlobal = true,
      applicableProducts = [],
    } = req.body;

    // Validate input
    if (!code || !name || !type || !value) {
      return res.status(400).json({
        success: false,
        message: "Code, name, type, and value are required",
      });
    }

    // Validate percentage coupon
    if (type === "percentage" && value > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    // Validate dates
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create coupon
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      name,
      description,
      type,
      value,
      maxDiscountAmount,
      minimumAmount,
      usageLimit,
      usageLimitPerUser,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive,
      isGlobal,
      applicableProducts: isGlobal ? [] : applicableProducts,
    });

    return res.status(201).json({
      success: true,
      data: coupon,
      message: "Coupon created successfully",
    });
  } catch (error) {
    console.error("Create coupon error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
    });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      type,
      value,
      maxDiscountAmount,
      minimumAmount,
      usageLimit,
      usageLimitPerUser,
      startDate,
      endDate,
      isActive,
      isGlobal,
      applicableProducts,
    } = req.body;

    // Check if coupon exists
    const existingCoupon = await Coupon.findByPk(id);
    if (!existingCoupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    // Validate percentage coupon if type or value is being updated
    const updatedType = type !== undefined ? type : existingCoupon.type;
    const updatedValue = value !== undefined ? value : existingCoupon.value;

    if (updatedType === "percentage" && updatedValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    // Validate dates if they are being updated
    const updatedStartDate =
      startDate !== undefined ? startDate : existingCoupon.startDate;
    const updatedEndDate =
      endDate !== undefined ? endDate : existingCoupon.endDate;

    if (
      updatedStartDate &&
      updatedEndDate &&
      new Date(updatedStartDate) >= new Date(updatedEndDate)
    ) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Prepare update data
    const updateData = {};

    if (code !== undefined) updateData.code = code.toUpperCase();
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = value;
    if (maxDiscountAmount !== undefined)
      updateData.maxDiscountAmount = maxDiscountAmount;
    if (minimumAmount !== undefined) updateData.minimumAmount = minimumAmount;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (usageLimitPerUser !== undefined)
      updateData.usageLimitPerUser = usageLimitPerUser;
    if (startDate !== undefined)
      updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined)
      updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isGlobal !== undefined) {
      updateData.isGlobal = isGlobal;
      // If changing to global, clear applicable products
      if (isGlobal) {
        updateData.applicableProducts = [];
      }
    }
    if (applicableProducts !== undefined && !updateData.isGlobal) {
      updateData.applicableProducts = applicableProducts;
    }

    // Update coupon
    await existingCoupon.update(updateData);

    // Fetch updated coupon to return
    const updatedCoupon = await Coupon.findByPk(id);

    return res.status(200).json({
      success: true,
      data: updatedCoupon,
      message: "Coupon updated successfully",
    });
  } catch (error) {
    console.error("Update coupon error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update coupon",
    });
  }
};


export const removeCoupon = async (req, res) => {
  const { couponId } = req.params;

  try {
    const coupon = await Coupon.findByPk(couponId);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    await coupon.destroy();

    return res.status(200).json({
      success: true,
      message: "Coupon removed successfully",
    });
  } catch (error) {
    console.error("Remove coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to remove coupon",
    });
  }
};

export const restoreCoupon = async (req, res) => {
  const { couponId } = req.params;

  try {
    const coupon = await Coupon.findOne({
      where: { id: couponId },
      paranoid: false,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (coupon.deletedAt === null) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not deleted",
      });
    }

    await coupon.restore();

    return res.status(200).json({
      success: true,
      message: "Coupon restored successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Restore coupon error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to restore coupon",
    });
  }
};


export const getCouponUsage = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50, includeDetails = false } = req.query;
    const { couponId } = req.params;
    // Validate input
    if (!couponId) {
      return res.status(400).json({
        success: false,
        message: "Coupon ID is required",
      });
    }

    // Check if coupon exists
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = { couponId };
    if (userId) {
      whereClause.userId = userId;
    }

    // Build include clause based on includeDetails parameter
    const includeClause = [
      {
        model: Order,
        attributes: ['id', 'userId', 'orderNumber', 'subtotal', 'shippingAmount', 'discountAmount', 'status', 'createdAt'],
        ...(userId && { where: { userId } })
      },
      {
        model: Coupon,
        attributes: ['id', 'code', 'name', 'type', 'value', 'maxDiscountAmount', 'minimumAmount']
      }
    ];

    if (includeDetails === 'true') {
      includeClause[0].include = [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'phone'],
          as: 'user',
          include: [
            {
              model: Auth,
              attributes: ['email'],
              as: 'auth'
            }
          ]
        }
      ];
    }

    // Get coupon usage records from OrderCoupon table
    const { count, rows: usageRecords } = await OrderCoupon.findAndCountAll({
      where: whereClause,
      include: includeClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true
    });

    // Calculate usage statistics
    const totalUsages = count;
    
    // Get unique users who used this coupon
    const uniqueUsersQuery = await OrderCoupon.findAll({
      where: { couponId },
      include: [
        {
          model: Order,
          attributes: ['userId'],
          required: true
        }
      ],
      attributes: [],
      group: ['Order.userId'],
      raw: true
    });
    const uniqueUsers = uniqueUsersQuery.length;

    // Calculate total discount given by this specific coupon
    // We need to calculate individual coupon contributions, not total order discount
    const totalDiscountQuery = await OrderCoupon.findAll({
      where: { couponId },
      include: [
        {
          model: Order,
          attributes: ['subtotal', 'shippingAmount', 'discountAmount'],
          required: true,
          include: [
            {
              model: Coupon,
              through: { attributes: [] },
              attributes: ['id', 'type', 'value', 'maxDiscountAmount', 'minimumAmount'],
              as: 'coupons'
            }
          ]
        }
      ]
    });
    
    let totalDiscountGiven = 0;
    
    for (const record of totalDiscountQuery) {
      const order = record.Order;
      const orderSubtotal = parseFloat(order.subtotal) || 0;
      const appliedCoupons = order.coupons || [];
      const currentCoupon = appliedCoupons.find(c => c.id === couponId);
      
      if (currentCoupon && appliedCoupons.length > 0) {
        // Calculate individual coupon discount
        let individualDiscount = 0;
        
        if (currentCoupon.type === 'percentage') {
          individualDiscount = (orderSubtotal * parseFloat(currentCoupon.value)) / 100;
          
          // Apply max discount limit
          if (currentCoupon.maxDiscountAmount) {
            individualDiscount = Math.min(individualDiscount, parseFloat(currentCoupon.maxDiscountAmount));
          }
        } else if (currentCoupon.type === 'fixed') {
          individualDiscount = Math.min(parseFloat(currentCoupon.value), orderSubtotal);
          
          // Apply max discount limit if specified
          if (currentCoupon.maxDiscountAmount) {
            individualDiscount = Math.min(individualDiscount, parseFloat(currentCoupon.maxDiscountAmount));
          }
        }
        
        totalDiscountGiven += individualDiscount;
      }
    }

    // Get user-specific usage if userId is provided
    let userUsageStats = null;
    if (userId) {
      const userUsages = await OrderCoupon.findAll({
        include: [
          {
            model: Order,
            where: { userId },
            attributes: ['subtotal', 'shippingAmount', 'discountAmount', 'createdAt'],
            required: true,
            include: [
              {
                model: Coupon,
                through: { attributes: [] },
                attributes: ['id', 'type', 'value', 'maxDiscountAmount', 'minimumAmount'],
                as: 'coupons'
              }
            ]
          }
        ],
        where: { couponId }
      });

      let userTotalSavings = 0;
      let userTotalOrderValue = 0;

      for (const usage of userUsages) {
        const order = usage.Order;
        const orderSubtotal = parseFloat(order.subtotal) || 0;
        const shipping = parseFloat(order.shippingAmount) || 0;
        const appliedCoupons = order.coupons || [];
        const currentCoupon = appliedCoupons.find(c => c.id === couponId);
        
        userTotalOrderValue += orderSubtotal + shipping;
        
        if (currentCoupon) {
          // Calculate individual coupon discount for this order
          let individualDiscount = 0;
          
          if (currentCoupon.type === 'percentage') {
            individualDiscount = (orderSubtotal * parseFloat(currentCoupon.value)) / 100;
            
            // Apply max discount limit
            if (currentCoupon.maxDiscountAmount) {
              individualDiscount = Math.min(individualDiscount, parseFloat(currentCoupon.maxDiscountAmount));
            }
          } else if (currentCoupon.type === 'fixed') {
            individualDiscount = Math.min(parseFloat(currentCoupon.value), orderSubtotal);
            
            // Apply max discount limit if specified
            if (currentCoupon.maxDiscountAmount) {
              individualDiscount = Math.min(individualDiscount, parseFloat(currentCoupon.maxDiscountAmount));
            }
          }
          
          userTotalSavings += individualDiscount;
        }
      }

      userUsageStats = {
        totalUsages: userUsages.length,
        totalSavings: Math.round(userTotalSavings * 100) / 100,
        totalOrderValue: Math.round(userTotalOrderValue * 100) / 100,
        remainingUsages: coupon.usageLimitPerUser ? 
          Math.max(0, coupon.usageLimitPerUser - userUsages.length) : 'unlimited',
        firstUsed: userUsages.length > 0 ? 
          userUsages[userUsages.length - 1].Order.createdAt : null,
        lastUsed: userUsages.length > 0 ? 
          userUsages[0].Order.createdAt : null
      };
    }

    // Calculate coupon performance metrics
    const usageRate = coupon.usageLimit ? 
      Math.round((totalUsages / coupon.usageLimit) * 100) : null;
    
    const averageDiscountPerUsage = totalUsages > 0 ? 
      Math.round((totalDiscountGiven / totalUsages) * 100) / 100 : 0;

    // Prepare response data
    const responseData = {
      couponDetails: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: coupon.value,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minimumAmount: coupon.minimumAmount,
        usageLimit: coupon.usageLimit,
        usageLimitPerUser: coupon.usageLimitPerUser,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        isGlobal: coupon.isGlobal,
        startDate: coupon.startDate,
        endDate: coupon.endDate
      },
      usageStatistics: {
        totalUsages,
        uniqueUsers,
        totalDiscountGiven: Math.round(totalDiscountGiven * 100) / 100,
        averageDiscountPerUsage,
        usageRate,
        remainingUsages: coupon.usageLimit ? 
          Math.max(0, coupon.usageLimit - totalUsages) : 'unlimited'
      },
      usageRecords: await Promise.all(usageRecords.map(async record => {
        // Calculate individual coupon discount for display
        const order = await Order.findByPk(record.orderId, {
          include: [
            {
              model: Coupon,
              through: { attributes: [] },
              attributes: ['id', 'type', 'value', 'maxDiscountAmount', 'minimumAmount'],
              as: 'coupons'
            },
            ...(includeDetails === 'true' ? [{
              model: User,
              attributes: ['id', 'firstName', 'lastName', 'phone'],
              as: 'user',
              include: [
                {
                  model: Auth,
                  attributes: ['email'],
                  as: 'auth'
                }
              ]
            }] : [])
          ]
        });

        let individualCouponDiscount = 0;
        if (order && order.coupons) {
          const currentCoupon = order.coupons.find(c => c.id === couponId);
          const orderSubtotal = parseFloat(order.subtotal) || 0;
          
          if (currentCoupon) {
            if (currentCoupon.type === 'percentage') {
              individualCouponDiscount = (orderSubtotal * parseFloat(currentCoupon.value)) / 100;
              
              // Apply max discount limit
              if (currentCoupon.maxDiscountAmount) {
                individualCouponDiscount = Math.min(individualCouponDiscount, parseFloat(currentCoupon.maxDiscountAmount));
              }
            } else if (currentCoupon.type === 'fixed') {
              individualCouponDiscount = Math.min(parseFloat(currentCoupon.value), orderSubtotal);
              
              // Apply max discount limit if specified
              if (currentCoupon.maxDiscountAmount) {
                individualCouponDiscount = Math.min(individualCouponDiscount, parseFloat(currentCoupon.maxDiscountAmount));
              }
            }
          }
        }

        return {
          id: record.id,
          orderId: record.orderId,
          couponId: record.couponId,
          usedAt: record.createdAt,
          individualCouponDiscount: Math.round(individualCouponDiscount * 100) / 100,
          order: {
            id: record.Order.id,
            orderNumber: record.Order.orderNumber,
            userId: record.Order.userId,
            subtotal: record.Order.subtotal,
            shippingAmount: record.Order.shippingAmount,
            totalDiscountAmount: record.Order.discountAmount, // Total discount from all coupons
            totalAmount: (parseFloat(record.Order.subtotal) + parseFloat(record.Order.shippingAmount) - parseFloat(record.Order.discountAmount)).toFixed(2),
            status: record.Order.status,
            createdAt: record.Order.createdAt,
            appliedCouponsCount: order?.coupons?.length || 0,
            ...(includeDetails === 'true' && order?.user && {
              user: {
                id: order.user.id,
                firstName: order.user.firstName,
                lastName: order.user.lastName,
                phone: order.user.phone,
                email: order.user.auth?.email || null
              }
            })
          }
        };
      })),
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    };

    // Add user-specific stats if userId was provided
    if (userUsageStats) {
      responseData.userUsageStats = userUsageStats;
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      message: "Coupon usage retrieved successfully"
    });

  } catch (error) {
    console.error("Get coupon usage error:", error);

    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        message: "Database error occurred",
        error: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve coupon usage",
      error: error.message
    });
  }
};


export const getAllCoupons = async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await Coupon.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      data: {
        coupons: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all coupons error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get coupons",
    });
  }
};

// ************************************************************************************************


export const applyCouponToOrder = async (couponCodes, userId, orderProducts, transaction = null) => {
  console.log(orderProducts, "orderProducts in applyCouponToOrder");
    try {
        const applySingleCoupon = async (coupon, userId, orderProducts, transaction) => {
            try {
                // Step 1: Validate coupon status and dates
                const now = new Date();
                if (!coupon.isActive) {
                    return {
                        success: false,
                        message: "Coupon is not active",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }
                if (coupon.startDate && new Date(coupon.startDate) > now) {
                    return {
                        success: false,
                        message: "Coupon is not yet valid",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }
                if (coupon.endDate && new Date(coupon.endDate) < now) {
                    return {
                        success: false,
                        message: "Coupon has expired",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 2: Check overall usage limit
                if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
                    return {
                        success: false,
                        message: "Coupon usage limit exceeded",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 3: Get existing coupon usage for this user from OrderCoupon table
                const existingUsages = await OrderCoupon.findAll({
                    include: [
                        {
                            model: Order,
                            where: { userId },
                            required: true,
                        },
                    ],
                    where: { couponId: coupon.id },
                    transaction,
                });

                console.log(`Existing usages for user ${userId} and coupon ${coupon.id}:`, existingUsages.length);

                const userUsageCount = existingUsages.length;

                // Check per-user usage limit
                if (coupon.usageLimitPerUser && userUsageCount >= coupon.usageLimitPerUser) {
                    return {
                        success: false,
                        message: "You have reached the usage limit for this coupon",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 4: Determine eligible products
                let eligibleProducts = [...orderProducts];

                // Filter by applicable products if not global
                if (!coupon.isGlobal && coupon.applicableProducts && coupon.applicableProducts.length > 0) {
                    eligibleProducts = orderProducts.filter((product) =>
                        coupon.applicableProducts.includes(product.productId)
                    );
                    if (eligibleProducts.length === 0) {
                        return {
                            success: false,
                            message: "Coupon is not applicable to any products in your order",
                            discountAmount: 0,
                            updatedProducts: orderProducts,
                        };
                    }
                }

                console.log(`Eligible products: ${eligibleProducts.length}`);
                if (eligibleProducts.length === 0) {
                    return {
                        success: false,
                        message: "No products available for this coupon",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 5: Calculate total order amount for minimum amount validation
                const totalEligibleAmount = eligibleProducts.reduce((sum, product) => {
                    const unitPrice = product.variant
                        ? parseFloat(product.variant.price)
                        : parseFloat(product.product.price);
                    return sum + (unitPrice * product.quantity);
                }, 0);

                console.log(`Total eligible amount: ${totalEligibleAmount}, Minimum required: ${coupon.minimumAmount}`);

                // Check minimum amount requirement BEFORE calculating discount
                if (coupon.minimumAmount && totalEligibleAmount < coupon.minimumAmount) {
                    return {
                        success: false,
                        message: `Minimum order amount of $${coupon.minimumAmount} required for eligible products. Current eligible amount: $${totalEligibleAmount.toFixed(2)}`,
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 6: Calculate remaining usage for this user
                const remainingUsage = coupon.usageLimitPerUser
                    ? coupon.usageLimitPerUser - userUsageCount
                    : 1; // Default to 1 usage per order if no limit specified

                if (remainingUsage <= 0) {
                    return {
                        success: false,
                        message: "You have reached the usage limit for this coupon",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 7: Calculate discount amount
                let discountAmount = coupon.type === "percentage" ?
                    (totalEligibleAmount * parseFloat(coupon.value)) / 100 :
                    Math.min(parseFloat(coupon.value), totalEligibleAmount);

                console.log(`Calculated discount amount: $${discountAmount}`);

                // Apply max discount limit for percentage coupons
                if (coupon.type === "percentage" && coupon.maxDiscountAmount) {
                    discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount));
                }

                // Apply max discount limit for fixed coupons (if specified)
                if (coupon.type === "fixed" && coupon.maxDiscountAmount) {
                    discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount));
                }

                // Round to 2 decimal places
                console.log(`Discount amount before rounding: $${discountAmount}`);
                discountAmount = Math.round(discountAmount * 100) / 100;
                console.log(`Final discount amount after all checks: $${discountAmount}`);

                // Ensure discount is positive
                if (discountAmount <= 0) {
                    return {
                        success: false,
                        message: "No discount applicable",
                        discountAmount: 0,
                        updatedProducts: orderProducts,
                    };
                }

                // Step 8: Update order products with applied coupon
                const updatedProducts = orderProducts.map((product) => {
                    if (eligibleProducts.some(p => p.productId === product.productId)) {
                        if (!product.appliedCoupons) {
                            product.appliedCoupons = [];
                        }
                        product.appliedCoupons.push({
                            couponId: coupon.id,
                            couponCode: coupon.code,
                            discountAmount: discountAmount,
                            appliedToPrice: totalEligibleAmount,
                            couponType: coupon.type,
                            couponValue: coupon.value,
                        });
                    }
                    return product;
                });

                console.log(`Updated products after applying coupon: ${updatedProducts.length}`);
                return {
                    success: true,
                    message: `Coupon ${coupon.code} applied successfully`,
                    discountAmount: Math.round(discountAmount * 100) / 100,
                    usageCount: 1, // One usage per coupon application
                    updatedProducts: updatedProducts,
                    couponDetails: {
                        id: coupon.id,
                        code: coupon.code,
                        name: coupon.name,
                        type: coupon.type,
                        value: coupon.value,
                        maxDiscountAmount: coupon.maxDiscountAmount,
                    },
                };

            } catch (error) {
                console.error(`Error processing coupon ${coupon.code}:`, error);
                return {
                    success: false,
                    message: "Error processing coupon",
                    discountAmount: 0,
                    updatedProducts: orderProducts,
                    error: error.message,
                };
            }
        };

        // Ensure couponCodes is always an array
        const codesArray = Array.isArray(couponCodes) ? couponCodes : [couponCodes];

        // Step 1: Validate input
        if (!codesArray || codesArray.length === 0) {
            return {
                success: false,
                totalDiscountAmount: 0,
                updatedProducts: orderProducts,
                appliedCoupons: [],
                failedCoupons: [],
            };
        }

        if (!orderProducts || orderProducts.length === 0) {
            return {
                success: false,
                totalDiscountAmount: 0,
                updatedProducts: [],
                appliedCoupons: [],
                failedCoupons: codesArray.map((code) => ({
                    code: code,
                    reason: "No products in order",
                })),
            };
        }

        // Step 2: Get coupons by codes
        const coupons = await Coupon.findAll({
            where: {
                code: {
                    [Op.in]: codesArray
                }
            },
            transaction,
        });

        if (coupons.length === 0) {
            return {
                success: false,
                totalDiscountAmount: 0,
                updatedProducts: orderProducts,
                appliedCoupons: [],
                failedCoupons: codesArray.map((code) => ({
                    code: code,
                    reason: "Coupon not found",
                })),
            };
        }

        // Step 3: Check for codes that weren't found
        const foundCodes = coupons.map(c => c.code);
        const notFoundCodes = codesArray.filter(code => !foundCodes.includes(code));
        const failedCoupons = notFoundCodes.map(code => ({
            code: code,
            reason: "Coupon not found",
        }));

        // Step 4: Sort coupons by priority (percentage first, then by value descending)
        // This ensures optimal discount application
        const sortedCoupons = coupons.sort((a, b) => {
            if (a.type === "percentage" && b.type === "fixed") return -1;
            if (a.type === "fixed" && b.type === "percentage") return 1;
            return parseFloat(b.value) - parseFloat(a.value);
        });

        let totalDiscountAmount = 0;
        let updatedProducts = [...orderProducts];
        const appliedCoupons = [];

        // Step 5: Apply each coupon sequentially
        for (const coupon of sortedCoupons) {
            console.log(`Processing coupon: ${coupon.code}`);
            console.log(userId, "userId");
            console.log(updatedProducts, "updatedProducts");

            const result = await applySingleCoupon(
                coupon,
                userId,
                updatedProducts,
                transaction
            );
            console.log(result, "result of applySingleCoupon");

            if (result.success) {
                totalDiscountAmount += result.discountAmount;
                updatedProducts = result.updatedProducts;
                appliedCoupons.push({
                    couponId: coupon.id,
                    couponCode: coupon.code,
                    discountAmount: result.discountAmount,
                    usageCount: result.usageCount,
                    couponDetails: result.couponDetails,
                });
                            await coupon.increment("usedCount", { by: 1, transaction });
            } else {
                failedCoupons.push({
                    couponId: coupon.id,
                    couponCode: coupon.code,
                    reason: result.message,
                });
            }


        }
        

        // Step 6: Return final result
        return {
            success: appliedCoupons.length > 0,
            totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
            updatedProducts: updatedProducts,
            appliedCoupons: appliedCoupons,
            failedCoupons: failedCoupons,
            message: appliedCoupons.length > 0 
                ? `Successfully applied ${appliedCoupons.length} coupon(s)` 
                : "No coupons could be applied",
        };

    } catch (error) {
        console.error("Error applying coupon to order:", error);
        return {
            success: false,
            message: "Error applying coupon",
            totalDiscountAmount: 0,
            updatedProducts: orderProducts,
            appliedCoupons: [],
            failedCoupons: [],
            error: error.message,
        };
    }
};

export const applyCoupon = async (req, res) => {
  const {items, couponCodes} = req.body;
  const userId = req.user.id;
  let orderProducts = [];

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart items are required",
      status: "error",
    });
  }
  
  if (!couponCodes || couponCodes.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Coupon codes are required",
      status: "error",
    });
  }

  for (const item of items) {
    const cartItem = await Cart.findOne({
      where: {
        id: item,
        userId: userId,
      },
      include: [
        {
          association: "product",
        },
        {
          association: "variant",
        },
      ],
    });

    if (!cartItem || !cartItem.id || !cartItem.product) {
      throw new Error("Cart item is invalid !!");
    }

    orderProducts.push({
      productId: cartItem.product.id,
      product: cartItem.product,
      variant: cartItem.variant,
      quantity: cartItem.quantity,
    });
  }

  try {
    const applySingleCoupon = async (coupon, userId, orderProducts) => {
      try {
        // Step 1: Validate coupon status and dates
        const now = new Date();
        if (!coupon.isActive) {
          return {
            success: false,
            message: "Coupon is not active",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }
        if (coupon.startDate && new Date(coupon.startDate) > now) {
          return {
            success: false,
            message: "Coupon is not yet valid",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }
        if (coupon.endDate && new Date(coupon.endDate) < now) {
          return {
            success: false,
            message: "Coupon has expired",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 2: Check overall usage limit
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return {
            success: false,
            message: "Coupon usage limit exceeded",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 3: Get existing coupon usage for this user from OrderCoupon table
        const existingUsages = await OrderCoupon.findAll({
          include: [
            {
              model: Order,
              where: { userId },
              required: true,
            },
          ],
          where: { couponId: coupon.id },
        });

        console.log(`Existing usages for user ${userId} and coupon ${coupon.id}:`, existingUsages.length);

        const userUsageCount = existingUsages.length;

        // Check per-user usage limit
        if (coupon.usageLimitPerUser && userUsageCount >= coupon.usageLimitPerUser) {
          return {
            success: false,
            message: "You have reached the usage limit for this coupon",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 4: Determine eligible products
        let eligibleProducts = [...orderProducts];

        // Filter by applicable products if not global
        if (!coupon.isGlobal && coupon.applicableProducts && coupon.applicableProducts.length > 0) {
          eligibleProducts = orderProducts.filter((product) =>
            coupon.applicableProducts.includes(product.productId)
          );
          if (eligibleProducts.length === 0) {
            return {
              success: false,
              message: "Coupon is not applicable to any products in your order",
              discountAmount: 0,
              updatedProducts: orderProducts,
            };
          }
        }

        console.log(`Eligible products: ${eligibleProducts.length}`);
        if (eligibleProducts.length === 0) {
          return {
            success: false,
            message: "No products available for this coupon",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 5: Calculate total order amount for minimum amount validation
        const totalEligibleAmount = eligibleProducts.reduce((sum, product) => {
          const unitPrice = product.variant
            ? parseFloat(product.variant.price)
            : parseFloat(product.product.price);
          return sum + (unitPrice * product.quantity);
        }, 0);

        console.log(`Total eligible amount: ${totalEligibleAmount}, Minimum required: ${coupon.minimumAmount}`);

        // Check minimum amount requirement BEFORE calculating discount
        if (coupon.minimumAmount && totalEligibleAmount < coupon.minimumAmount) {
          return {
            success: false,
            message: `Minimum order amount of $${coupon.minimumAmount} required for eligible products. Current eligible amount: $${totalEligibleAmount.toFixed(2)}`,
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 6: Calculate remaining usage for this user
        const remainingUsage = coupon.usageLimitPerUser
          ? coupon.usageLimitPerUser - userUsageCount
          : 1; // Default to 1 usage per order if no limit specified

        if (remainingUsage <= 0) {
          return {
            success: false,
            message: "You have reached the usage limit for this coupon",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 7: Calculate discount amount
        let discountAmount = coupon.type === "percentage" ?
          (totalEligibleAmount * parseFloat(coupon.value)) / 100 :
          Math.min(parseFloat(coupon.value), totalEligibleAmount);

        console.log(`Calculated discount amount: $${discountAmount}`);

        // Apply max discount limit for percentage coupons
        if (coupon.type === "percentage" && coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount));
        }

        // Apply max discount limit for fixed coupons (if specified)
        if (coupon.type === "fixed" && coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, parseFloat(coupon.maxDiscountAmount));
        }

        // Round to 2 decimal places
        console.log(`Discount amount before rounding: $${discountAmount}`);
        discountAmount = Math.round(discountAmount * 100) / 100;
        console.log(`Final discount amount after all checks: $${discountAmount}`);

        // Ensure discount is positive
        if (discountAmount <= 0) {
          return {
            success: false,
            message: "No discount applicable",
            discountAmount: 0,
            updatedProducts: orderProducts,
          };
        }

        // Step 8: Update order products with applied coupon
        const updatedProducts = orderProducts.map((product) => {
          if (eligibleProducts.some(p => p.productId === product.productId)) {
            if (!product.appliedCoupons) {
              product.appliedCoupons = [];
            }
            product.appliedCoupons.push({
              couponId: coupon.id,
              couponCode: coupon.code,
              discountAmount: discountAmount,
              appliedToPrice: totalEligibleAmount,
              couponType: coupon.type,
              couponValue: coupon.value,
            });
          }
          return product;
        });

        console.log(`Updated products after applying coupon: ${updatedProducts.length}`);
        return {
          success: true,
          message: `Coupon ${coupon.code} applied successfully`,
          discountAmount: Math.round(discountAmount * 100) / 100,
          usageCount: 1, // One usage per coupon application
          updatedProducts: updatedProducts,
          couponDetails: {
            id: coupon.id,
            code: coupon.code,
            name: coupon.name,
            type: coupon.type,
            value: coupon.value,
            maxDiscountAmount: coupon.maxDiscountAmount,
          },
        };

      } catch (error) {
        console.error(`Error processing coupon ${coupon.code}:`, error);
        return {
          success: false,
          message: "Error processing coupon",
          discountAmount: 0,
          updatedProducts: orderProducts,
          error: error.message,
        };
      }
    };

    // Ensure couponCodes is always an array
    const codesArray = Array.isArray(couponCodes) ? couponCodes : [couponCodes];

    // Step 1: Validate input
    if (!codesArray || codesArray.length === 0) {
      return res.json({
        success: false,
        totalDiscountAmount: 0,
        updatedProducts: orderProducts,
        appliedCoupons: [],
        failedCoupons: [],
      });
    }

    if (!orderProducts || orderProducts.length === 0) {
      return res.json({
        success: false,
        totalDiscountAmount: 0,
        updatedProducts: [],
        appliedCoupons: [],
        failedCoupons: codesArray.map((code) => ({
          code: code,
          reason: "No products in order",
        })),
      });
    }

    // Step 2: Get coupons by codes
    const coupons = await Coupon.findAll({
      where: {
        code: {
          [Op.in]: codesArray
        }
      },
    });

    if (coupons.length === 0) {
      return res.json({
        success: false,
        totalDiscountAmount: 0,
        updatedProducts: orderProducts,
        appliedCoupons: [],
        failedCoupons: codesArray.map((code) => ({
          code: code,
          reason: "Coupon not found",
        })),
      });
    }

    // Step 3: Check for codes that weren't found
    const foundCodes = coupons.map(c => c.code);
    const notFoundCodes = codesArray.filter(code => !foundCodes.includes(code));
    const failedCoupons = notFoundCodes.map(code => ({
      code: code,
      reason: "Coupon not found",
    }));

    // Step 4: Sort coupons by priority (percentage first, then by value descending)
    // This ensures optimal discount application
    const sortedCoupons = coupons.sort((a, b) => {
      if (a.type === "percentage" && b.type === "fixed") return -1;
      if (a.type === "fixed" && b.type === "percentage") return 1;
      return parseFloat(b.value) - parseFloat(a.value);
    });

    let totalDiscountAmount = 0;
    let updatedProducts = [...orderProducts];
    const appliedCoupons = [];

    // Step 5: Apply each coupon sequentially
    for (const coupon of sortedCoupons) {
      console.log(`Processing coupon: ${coupon.code}`);
      console.log(userId, "userId");
      console.log(updatedProducts, "updatedProducts");

      const result = await applySingleCoupon(
        coupon,
        userId,
        updatedProducts,
      );
      console.log(result, "result of applySingleCoupon");

      if (result.success) {
        totalDiscountAmount += result.discountAmount;
        updatedProducts = result.updatedProducts;
        appliedCoupons.push({
          couponId: coupon.id,
          couponCode: coupon.code,
          discountAmount: result.discountAmount,
          usageCount: result.usageCount,
          couponDetails: result.couponDetails,
        });
      } else {
        failedCoupons.push({
          couponId: coupon.id,
          couponCode: coupon.code,
          reason: result.message,
        });
      }
    }

     

    // Step 6: Return final result
    return res.json({
      success: appliedCoupons.length > 0,
      totalDiscountAmount: Math.round(totalDiscountAmount * 100) / 100,
      updatedProducts: updatedProducts,
      appliedCoupons: appliedCoupons,
      failedCoupons: failedCoupons,
      message: appliedCoupons.length > 0 
        ? `Successfully applied ${appliedCoupons.length} coupon(s)` 
        : "No coupons could be applied",
    });

  } catch (error) {
    console.error("Error applying coupon to order:", error);
    return res.status(500).json({
      success: false,
      message: "Error applying coupon",
      totalDiscountAmount: 0,
      updatedProducts: orderProducts,
      appliedCoupons: [],
      failedCoupons: [],
      error: error.message,
    });
  }
};