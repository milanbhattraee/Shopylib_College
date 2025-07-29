import { 
  User, Order, OrderItem, Product, ProductVariant, Category, 
  Coupon, Review, sequelize 
} from "../models/index.model.js";
import { Op, fn, col, literal,QueryTypes } from "sequelize";



export const getDashboardOverview = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const periodDays = Math.max(1, Math.min(365, parseInt(period) || 30)); // Validate period
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);
    startDate.setHours(0, 0, 0, 0); // Start of day for consistency

    const confirmedOrderStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const baseOrderFilter = { createdAt: { [Op.gte]: startDate } };
    const confirmedOrderFilter = { 
      ...baseOrderFilter,
      status: { [Op.in]: confirmedOrderStatuses }
    };

    // Execute all queries in parallel for better performance
    const [
      totalRevenue,
      totalOrders,
      confirmedOrdersCount,
      totalCustomers,
      activeProducts,
      totalDiscount,
      orderStatusDistribution,
      topCategories
    ] = await Promise.all([
      // Total Revenue (only from confirmed orders)
      Order.sum('subtotal', { where: confirmedOrderFilter }),
      
      // Total Orders (all orders)
      Order.count({ where: baseOrderFilter }),
      
      // Confirmed Orders Count (for accurate AOV calculation)
      Order.count({ where: confirmedOrderFilter }),
      
      // New Customers in period
      User.count({
        where: { 
          role: 'customer',
          createdAt: { [Op.gte]: startDate }
        }
      }),
      
      // Active Products (current snapshot, not time-bound)
      Product.count({ where: { isActive: true } }),
      
      // Total Discount Given
      Order.sum('discountAmount', { where: baseOrderFilter }),
      
      // Order Status Distribution
      Order.findAll({
        attributes: [
          'status',
          [fn('COUNT', col('id')), 'count'],
          [fn('SUM', col('subtotal')), 'revenue']
        ],
        where: baseOrderFilter,
        group: ['status'],
        order: [[fn('COUNT', col('id')), 'DESC']],
        raw: true
      }),
      
      // Top Performing Categories - using raw query for better control
      sequelize.query(`
        SELECT 
          c.id,
          c.name,
          COUNT(DISTINCT oi.id) as "totalOrders",
          SUM(oi.quantity) as "totalSold",
          SUM(oi.quantity * oi.price) as "revenue"
        FROM categories c
        INNER JOIN products p ON c.id = p."categoryId" AND p."deletedAt" IS NULL
        INNER JOIN order_items oi ON p.id = oi."productId"
        INNER JOIN orders o ON oi."orderId" = o.id
        WHERE c."deletedAt" IS NULL
          AND o."createdAt" >= :startDate
          AND o.status IN (:confirmedStatuses)
        GROUP BY c.id, c.name
        HAVING SUM(oi.quantity * oi.price) > 0
        ORDER BY revenue DESC
        LIMIT 5
      `, {
        replacements: { 
          startDate: startDate.toISOString(), 
          confirmedStatuses: confirmedOrderStatuses 
        },
        type: QueryTypes.SELECT
      })
    ]);

    // Calculate metrics with proper null handling
    const safeRevenue = Number(totalRevenue) || 0;
    const safeDiscount = Number(totalDiscount) || 0;
    const avgOrderValue = confirmedOrdersCount > 0 ? safeRevenue / confirmedOrdersCount : 0;
    
    // Calculate growth metrics (optional: requires previous period data)
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
    
    const [previousRevenue, previousOrders] = await Promise.all([
      Order.sum('subtotal', {
        where: {
          createdAt: { [Op.between]: [previousPeriodStart, startDate] },
          status: { [Op.in]: confirmedOrderStatuses }
        }
      }),
      Order.count({
        where: {
          createdAt: { [Op.between]: [previousPeriodStart, startDate] }
        }
      })
    ]);

    const safePreviousRevenue = Number(previousRevenue) || 0;
    const revenueGrowth = safePreviousRevenue > 0 
      ? ((safeRevenue - safePreviousRevenue) / safePreviousRevenue * 100) 
      : safeRevenue > 0 ? 100 : 0;
    
    const orderGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders * 100) 
      : totalOrders > 0 ? 100 : 0;

    // Format top categories with better structure
    const formattedTopCategories = topCategories.map(category => ({
      id: parseInt(category.id),
      name: category.name,
      totalOrders: parseInt(category.totalOrders) || 0,
      totalSold: parseInt(category.totalSold) || 0,
      revenue: Math.round((parseFloat(category.revenue) || 0) * 100) / 100
    }));

    // Format order status distribution
    const formattedOrderStatus = orderStatusDistribution.map(status => ({
      status: status.status,
      count: parseInt(status.count) || 0,
      revenue: Math.round((parseFloat(status.revenue) || 0) * 100) / 100,
      percentage: totalOrders > 0 ? Math.round((parseInt(status.count) / totalOrders) * 100 * 100) / 100 : 0
    }));

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue: Math.round(safeRevenue * 100) / 100,
          totalOrders,
          confirmedOrders: confirmedOrdersCount,
          totalCustomers,
          activeProducts,
          avgOrderValue: Math.round(avgOrderValue * 100) / 100,
          totalDiscount: Math.round(safeDiscount * 100) / 100,
          revenueGrowth: Math.round(revenueGrowth * 100) / 100,
          orderGrowth: Math.round(orderGrowth * 100) / 100
        },
        orderStatusDistribution: formattedOrderStatus,
        topCategories: formattedTopCategories,
        metadata: {
          period: `${periodDays} days`,
          startDate: startDate.toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          currency: 'USD' // Make this configurable based on your app
        }
      },
      message: "Dashboard overview retrieved successfully"
    });

  } catch (error) {
    console.error("Dashboard overview error:", error);
    
    // More detailed error handling
    let errorMessage = "Failed to retrieve dashboard overview";
    let statusCode = 500;
    
    if (error.name === 'SequelizeConnectionError') {
      errorMessage = "Database connection error";
      statusCode = 503;
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = "Invalid query parameters";
      statusCode = 400;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getSalesAnalytics = async (req, res) => {
  try {
    const { 
      period = '30', 
      groupBy = 'day', // day, week, month, year
      startDate: customStart,
      endDate: customEnd,
      timezone = 'UTC'
    } = req.query;

    // Validate groupBy parameter
    const validGroupBy = ['day', 'week', 'month', 'year'];
    const selectedGroupBy = validGroupBy.includes(groupBy) ? groupBy : 'day';

    let startDate, endDate;
    
    if (customStart && customEnd) {
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      
      // Validate date range
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD format."
        });
      }
      
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: "Start date must be before end date."
        });
      }
    } else {
      const periodDays = Math.max(1, Math.min(365, parseInt(period) || 30));
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - periodDays);
    }

    // Set time boundaries for consistency
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const confirmedOrderStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    const dateFilter = { [Op.between]: [startDate, endDate] };
    const confirmedOrderFilter = {
      createdAt: dateFilter,
      status: { [Op.in]: confirmedOrderStatuses }
    };

    // Execute all queries in parallel
    const [
      salesOverTime,
      topProducts,
      revenueByPaymentMethod,
      customerSegmentation,
      conversionMetrics
    ] = await Promise.all([
      // Sales over time with proper date truncation
      Order.findAll({
        attributes: [
          [fn('DATE_TRUNC', selectedGroupBy, col('createdAt')), 'period'],
          [fn('COUNT', col('id')), 'orderCount'],
          [fn('SUM', col('subtotal')), 'revenue'],
          [fn('SUM', col('discountAmount')), 'discount'],
          [fn('AVG', col('subtotal')), 'avgOrderValue'],
          [fn('COUNT', fn('DISTINCT', col('userId'))), 'uniqueCustomers']
        ],
        where: confirmedOrderFilter,
        group: [fn('DATE_TRUNC', selectedGroupBy, col('createdAt'))],
        order: [[fn('DATE_TRUNC', selectedGroupBy, col('createdAt')), 'ASC']],
        raw: true
      }),

      // Top selling products using raw query to avoid association issues
      sequelize.query(`
        SELECT 
          p.id,
          p.name,
          p.price,
          SUM(oi.quantity) as "totalSold",
          SUM(oi.quantity * oi.price) as "revenue",
          COUNT(DISTINCT o.id) as "orderCount",
          AVG(oi.price) as "avgPrice"
        FROM products p
        INNER JOIN order_items oi ON p.id = oi."productId"
        INNER JOIN orders o ON oi."orderId" = o.id
        WHERE p."deletedAt" IS NULL
          AND o."createdAt" BETWEEN :startDate AND :endDate
          AND o.status IN (:confirmedStatuses)
        GROUP BY p.id, p.name, p.price
        HAVING SUM(oi.quantity * oi.price) > 0
        ORDER BY revenue DESC
        LIMIT 10
      `, {
        replacements: { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString(),
          confirmedStatuses: confirmedOrderStatuses 
        },
        type: QueryTypes.SELECT
      }),

      // Revenue by payment method
      Order.findAll({
        attributes: [
          'paymentMethod',
          [fn('COUNT', col('id')), 'orderCount'],
          [fn('SUM', col('subtotal')), 'revenue'],
          [fn('AVG', col('subtotal')), 'avgOrderValue'],
          [fn('SUM', col('discountAmount')), 'totalDiscount']
        ],
        where: {
          createdAt: dateFilter,
          paymentStatus: 'paid',
          status: { [Op.in]: confirmedOrderStatuses }
        },
        group: ['paymentMethod'],
        order: [[fn('SUM', col('subtotal')), 'DESC']],
        raw: true
      }),

      // Customer segmentation (new vs returning)
      sequelize.query(`
        WITH customer_orders AS (
          SELECT 
            o."userId",
            COUNT(*) as order_count,
            SUM(o.subtotal) as total_spent,
            MIN(o."createdAt") as first_order_date
          FROM orders o
          WHERE o."createdAt" BETWEEN :startDate AND :endDate
            AND o.status IN (:confirmedStatuses)
          GROUP BY o."userId"
        ),
        customer_classification AS (
          SELECT 
            CASE 
              WHEN first_order_date >= :startDate THEN 'new'
              ELSE 'returning'
            END as customer_type,
            COUNT(*) as customer_count,
            SUM(total_spent) as revenue,
            AVG(total_spent) as avg_spent_per_customer,
            AVG(order_count) as avg_orders_per_customer
          FROM customer_orders
          GROUP BY customer_type
        )
        SELECT * FROM customer_classification
      `, {
        replacements: { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString(),
          confirmedStatuses: confirmedOrderStatuses 
        },
        type: QueryTypes.SELECT
      }),

      // Conversion metrics
      sequelize.query(`
        SELECT 
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
          COUNT(CASE WHEN status IN (:confirmedStatuses) THEN 1 END) as confirmed_orders,
          COUNT(*) as total_orders,
          CAST(
            (COUNT(CASE WHEN status IN (:confirmedStatuses) THEN 1 END)::numeric / 
             NULLIF(COUNT(*), 0) * 100) AS DECIMAL(10,2)
          ) as conversion_rate
        FROM orders
        WHERE "createdAt" BETWEEN :startDate AND :endDate
      `, {
        replacements: { 
          startDate: startDate.toISOString(), 
          endDate: endDate.toISOString(),
          confirmedStatuses: confirmedOrderStatuses 
        },
        type: QueryTypes.SELECT
      })
    ]);

    // Fill gaps in time series data
    const fillTimeSeriesGaps = (data, groupBy) => {
      if (!data.length) return [];
      
      const filled = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      
      while (current <= end) {
        const periodStart = new Date(current);
        let periodKey;
        
        switch (groupBy) {
          case 'day':
            periodKey = periodStart.toISOString().split('T')[0];
            current.setDate(current.getDate() + 1);
            break;
          case 'week':
            periodKey = `${periodStart.getFullYear()}-W${Math.ceil(periodStart.getDate() / 7)}`;
            current.setDate(current.getDate() + 7);
            break;
          case 'month':
            periodKey = `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}`;
            current.setMonth(current.getMonth() + 1);
            break;
          case 'year':
            periodKey = periodStart.getFullYear().toString();
            current.setFullYear(current.getFullYear() + 1);
            break;
        }
        
        const existingData = data.find(item => 
          new Date(item.period).toISOString().split('T')[0] === periodStart.toISOString().split('T')[0]
        );
        
        filled.push(existingData || {
          period: periodStart.toISOString(),
          orderCount: 0,
          revenue: 0,
          discount: 0,
          avgOrderValue: 0,
          uniqueCustomers: 0
        });
      }
      
      return filled;
    };

    // Process and format data
    const formattedSalesOverTime = fillTimeSeriesGaps(salesOverTime, selectedGroupBy).map(item => ({
      period: item.period,
      orderCount: parseInt(item.orderCount) || 0,
      revenue: Math.round((parseFloat(item.revenue) || 0) * 100) / 100,
      discount: Math.round((parseFloat(item.discount) || 0) * 100) / 100,
      avgOrderValue: Math.round((parseFloat(item.avgOrderValue) || 0) * 100) / 100,
      uniqueCustomers: parseInt(item.uniqueCustomers) || 0
    }));

    const formattedTopProducts = topProducts.map(product => ({
      id: parseInt(product.id),
      name: product.name,
      price: Math.round((parseFloat(product.price) || 0) * 100) / 100,
      totalSold: parseInt(product.totalSold) || 0,
      revenue: Math.round((parseFloat(product.revenue) || 0) * 100) / 100,
      orderCount: parseInt(product.orderCount) || 0,
      avgPrice: Math.round((parseFloat(product.avgPrice) || 0) * 100) / 100
    }));

    const formattedPaymentMethods = revenueByPaymentMethod.map(item => ({
      paymentMethod: item.paymentMethod || 'unknown',
      orderCount: parseInt(item.orderCount) || 0,
      revenue: Math.round((parseFloat(item.revenue) || 0) * 100) / 100,
      avgOrderValue: Math.round((parseFloat(item.avgOrderValue) || 0) * 100) / 100,
      totalDiscount: Math.round((parseFloat(item.totalDiscount) || 0) * 100) / 100,
      percentage: 0 // Will be calculated below
    }));

    // Calculate percentage for payment methods
    const totalPaymentRevenue = formattedPaymentMethods.reduce((sum, item) => sum + item.revenue, 0);
    formattedPaymentMethods.forEach(item => {
      item.percentage = totalPaymentRevenue > 0 
        ? Math.round((item.revenue / totalPaymentRevenue) * 100 * 100) / 100 
        : 0;
    });

    const formattedCustomerSegmentation = customerSegmentation.map(item => ({
      customerType: item.customer_type,
      customerCount: parseInt(item.customer_count) || 0,
      revenue: Math.round((parseFloat(item.revenue) || 0) * 100) / 100,
      avgSpentPerCustomer: Math.round((parseFloat(item.avg_spent_per_customer) || 0) * 100) / 100,
      avgOrdersPerCustomer: Math.round((parseFloat(item.avg_orders_per_customer) || 0) * 100) / 100
    }));

    const metrics = conversionMetrics[0] || {};
    const formattedConversionMetrics = {
      pendingOrders: parseInt(metrics.pending_orders) || 0,
      cancelledOrders: parseInt(metrics.cancelled_orders) || 0,
      confirmedOrders: parseInt(metrics.confirmed_orders) || 0,
      totalOrders: parseInt(metrics.total_orders) || 0,
      conversionRate: parseFloat(metrics.conversion_rate) || 0
    };

    // Calculate summary statistics
    const totalRevenue = formattedSalesOverTime.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = formattedSalesOverTime.reduce((sum, item) => sum + item.orderCount, 0);
    const totalCustomers = formattedSalesOverTime.reduce((sum, item) => sum + item.uniqueCustomers, 0);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalOrders,
          totalCustomers,
          avgOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
          conversionRate: formattedConversionMetrics.conversionRate
        },
        salesOverTime: formattedSalesOverTime,
        topProducts: formattedTopProducts,
        revenueByPaymentMethod: formattedPaymentMethods,
        customerSegmentation: formattedCustomerSegmentation,
        conversionMetrics: formattedConversionMetrics,
        metadata: {
          period: { 
            startDate: startDate.toISOString().split('T')[0], 
            endDate: endDate.toISOString().split('T')[0], 
            groupBy: selectedGroupBy,
            timezone 
          },
          dataPoints: formattedSalesOverTime.length,
          topProductsCount: formattedTopProducts.length
        }
      },
      message: "Sales analytics retrieved successfully"
    });

  } catch (error) {
    console.error("Sales analytics error:", error);
    
    // Enhanced error handling
    let errorMessage = "Failed to retrieve sales analytics";
    let statusCode = 500;
    
    if (error.name === 'SequelizeConnectionError') {
      errorMessage = "Database connection error";
      statusCode = 503;
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = "Invalid query parameters";
      statusCode = 400;
    } else if (error.name === 'SequelizeDatabaseError') {
      errorMessage = "Database query error";
      statusCode = 500;
    }
    
    return res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack
      } : undefined
    });
  }
};

export const getProductAnalytics = async (req, res) => {
  try {
    const { period = '30', categoryId, debug = false } = req.query;
    
    // Validate period parameter
    const periodInt = parseInt(period);
    if (isNaN(periodInt) || periodInt < 1 || periodInt > 365) {
      return res.status(400).json({
        success: false,
        message: "Period must be a number between 1 and 365 days"
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodInt);
    startDate.setHours(0, 0, 0, 0);

    const debugInfo = {
      startDate: startDate.toISOString(),
      period: periodInt,
      categoryId: categoryId || null
    };

    // First, let's check if we have any products at all
    const totalProducts = await Product.findAll({
      attributes: ['id', 'name', 'isActive'],
      limit: 5,
      raw: true
    }).catch(error => {
      console.error("Basic product query error:", error);
      return [];
    });

    debugInfo.sampleProducts = totalProducts;

    // Check if we have any categories
    const totalCategories = await Category.findAll({
      attributes: ['id', 'name'],
      limit: 5,
      raw: true
    }).catch(error => {
      console.error("Basic category query error:", error);
      return [];
    });

    debugInfo.sampleCategories = totalCategories;

    // Check if we have any orders in the date range
    const recentOrders = await Order.findAll({
      attributes: ['id', 'status', 'createdAt'],
      where: {
        createdAt: { [Op.gte]: startDate },
        status: { [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] }
      },
      limit: 5,
      raw: true
    }).catch(error => {
      console.error("Basic order query error:", error);
      return [];
    });

    debugInfo.sampleOrders = recentOrders;

    // Check if we have any order items - FIXED: Check both productId and variantId
    const recentOrderItems = await OrderItem.findAll({
      attributes: ['id', 'productId', 'productVarientId', 'quantity', 'price'],
      include: [{
        model: Order,
        as: 'order',
        attributes: ['status', 'createdAt'],
        where: {
          createdAt: { [Op.gte]: startDate },
          status: { [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      }],
      limit: 10,
      raw: true
    }).catch(error => {
      console.error("Basic order items query error:", error);
      return [];
    });

    debugInfo.sampleOrderItems = recentOrderItems;

    // Product performance query with sales data
    let productPerformance = [];
    try {
      // FIXED: Updated query to handle both direct product sales and variant sales
      const productSalesQuery = `
        SELECT 
          p.id,
          p.name,
          p.price,
          p."stockQuantity",
          p."categoryId",
          p."isActive",
          c.name as category_name,
          COALESCE(SUM(
            CASE 
              WHEN oi."productVarientId" IS NULL THEN oi.quantity 
              ELSE 0 
            END
          ), 0) as direct_sold,
          COALESCE(SUM(
            CASE 
              WHEN oi."productVarientId" IS NOT NULL THEN oi.quantity 
              ELSE 0 
            END
          ), 0) as variant_sold,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
          COUNT(DISTINCT oi.id) as order_count
        FROM products p
        LEFT JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN order_items oi ON p.id = oi."productId"
        LEFT JOIN orders o ON oi."orderId" = o.id 
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND o."createdAt" >= $1
        WHERE p."isActive" = true
        ${categoryId ? 'AND p."categoryId" = $2' : ''}
        GROUP BY p.id, p.name, p.price, p."stockQuantity", p."categoryId", p."isActive", c.name
        ORDER BY revenue DESC
        LIMIT 20
      `;

      const bindParams = categoryId ? [startDate, categoryId] : [startDate];
      const productSalesResults = await sequelize.query(productSalesQuery, {
        bind: bindParams,
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.productSalesResults = productSalesResults.length;
      debugInfo.sampleProductSales = productSalesResults.slice(0, 2);

      // Convert to expected format
      productPerformance = productSalesResults.map(row => ({
        id: row.id,
        name: row.name,
        price: row.price,
        stockQuantity: row.stockQuantity,
        categoryId: row.categoryId,
        isActive: row.isActive,
        category: { name: row.category_name },
        directSold: parseInt(row.direct_sold || 0),
        variantSold: parseInt(row.variant_sold || 0),
        totalSold: parseInt(row.total_sold || 0),
        revenue: parseFloat(row.revenue || 0),
        orderCount: parseInt(row.order_count || 0)
      }));

    } catch (error) {
      console.error("Product sales query error:", error);
      debugInfo.productSalesQueryError = error.message;
      
      // Fallback to basic product query without sales data
      try {
        const whereClause = categoryId ? { categoryId: categoryId, isActive: true } : { isActive: true };
        productPerformance = await Product.findAll({
          attributes: ['id', 'name', 'price', 'stockQuantity', 'categoryId', 'isActive'],
          where: whereClause,
          include: [{
            model: Category,
            as: 'category',
            attributes: ['name'],
            required: false
          }],
          limit: 20,
          raw: false
        });
        
        // Add zero sales data for fallback
        productPerformance = productPerformance.map(product => ({
          ...product.toJSON(),
          directSold: 0,
          variantSold: 0,
          totalSold: 0,
          revenue: 0,
          orderCount: 0
        }));
      } catch (fallbackError) {
        debugInfo.fallbackError = fallbackError.message;
        productPerformance = [];
      }
    }

    // Low stock products
    const lowStockProducts = await Product.findAll({
      attributes: ['id', 'name', 'stockQuantity', 'lowStockThreshold'],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.col('stockQuantity'), 
            Op.lte, 
            sequelize.col('lowStockThreshold')
          ),
          { isActive: true }
        ]
      },
      include: [{
        model: Category,
        as: 'category',
        attributes: ['name'],
        required: false
      }],
      limit: 10,
      raw: false
    }).catch(error => {
      console.error("Low stock query error:", error);
      debugInfo.lowStockQueryError = error.message;
      return [];
    });

    // Category performance with sales data
    let categoryPerformance = [];
    try {
      const categorySalesQuery = `
        SELECT 
          c.id,
          c.name,
          COUNT(DISTINCT p.id) as product_count,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
          COUNT(DISTINCT oi.id) as order_count
        FROM categories c
        LEFT JOIN products p ON c.id = p."categoryId" AND p."isActive" = true
        LEFT JOIN order_items oi ON p.id = oi."productId"
        LEFT JOIN orders o ON oi."orderId" = o.id 
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND o."createdAt" >= $1
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
      `;

      const categorySalesResults = await sequelize.query(categorySalesQuery, {
        bind: [startDate],
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.categorySalesResults = categorySalesResults.length;
      debugInfo.sampleCategorySales = categorySalesResults.slice(0, 2);

      categoryPerformance = categorySalesResults.map(row => ({
        id: row.id,
        name: row.name,
        productCount: parseInt(row.product_count || 0),
        totalSold: parseInt(row.total_sold || 0),
        revenue: parseFloat(row.revenue || 0),
        orderCount: parseInt(row.order_count || 0)
      }));

    } catch (error) {
      console.error("Category sales query error:", error);
      debugInfo.categorySalesQueryError = error.message;
      
      // Fallback to basic category query
      try {
        const basicCategories = await Category.findAll({
          attributes: ['id', 'name'],
          limit: 10,
          raw: false
        });
        categoryPerformance = basicCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          productCount: 0,
          totalSold: 0,
          revenue: 0,
          orderCount: 0
        }));
      } catch (fallbackError) {
        debugInfo.categoryFallbackError = fallbackError.message;
        categoryPerformance = [];
      }
    }

    // FIXED: Top Variants Query - This was the main issue
    let topVariants = [];
    try {
      const topVariantsQuery = `
        SELECT 
          pv.id,
          pv.sku,
          pv.name as variant_name,
          p.name as product_name,
          p.id as product_id,
          pv.price,
          pv."stockQuantity",
          pv."isActive",
          c.name as category_name,
          COALESCE(SUM(oi.quantity), 0) as total_sold,
          COALESCE(SUM(oi.quantity * oi.price), 0) as revenue,
          COUNT(DISTINCT oi.id) as order_count,
          COUNT(DISTINCT o.id) as unique_orders
        FROM product_variants pv
        LEFT JOIN products p ON pv."productId" = p.id
        LEFT JOIN categories c ON p."categoryId" = c.id
        LEFT JOIN order_items oi ON pv.id = oi."productVarientId"
        LEFT JOIN orders o ON oi."orderId" = o.id 
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND o."createdAt" >= $1
        WHERE pv."isActive" = true
        ${categoryId ? 'AND p."categoryId" = $2' : ''}
        GROUP BY pv.id, pv.sku, pv.name, p.name, p.id, pv.price, pv."stockQuantity", pv."isActive", c.name
        ORDER BY revenue DESC, total_sold DESC
        LIMIT 20
      `;

      const bindParams = categoryId ? [startDate, categoryId] : [startDate];
      const topVariantResults = await sequelize.query(topVariantsQuery, {
        bind: bindParams,
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.topVariantsResults = topVariantResults.length;
      debugInfo.sampleTopVariants = topVariantResults.slice(0, 2);

      topVariants = topVariantResults.map(row => ({
        id: row.id,
        sku: row.sku,
        name: row.variant_name,
        productId: row.product_id,
        productName: row.product_name,
        categoryName: row.category_name,
        price: parseFloat(row.price || 0),
        stockQuantity: parseInt(row.stockQuantity || 0),
        isActive: row.isActive,
        totalSold: parseInt(row.total_sold || 0),
        revenue: parseFloat(row.revenue || 0),
        orderCount: parseInt(row.order_count || 0),
        uniqueOrders: parseInt(row.unique_orders || 0)
      }));

    } catch (error) {
      console.error("Top variants query error:", error);
      debugInfo.topVariantsQueryError = error.message;
      
      // Fallback to basic variant query
      try {
        const basicVariants = await ProductVariant.findAll({
          attributes: ['id', 'sku', 'name', 'price', 'stockQuantity', 'isActive'],
          include: [{
            model: Product,
            as: 'product',
            attributes: ['name', 'id'],
            include: [{
              model: Category,
              as: 'category',
              attributes: ['name'],
              required: false
            }],
            where: categoryId ? { categoryId: categoryId } : undefined
          }],
          where: { isActive: true },
          limit: 20,
          raw: false
        });
        
        topVariants = basicVariants.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          productId: variant.product?.id,
          productName: variant.product?.name,
          categoryName: variant.product?.category?.name,
          price: parseFloat(variant.price || 0),
          stockQuantity: parseInt(variant.stockQuantity || 0),
          isActive: variant.isActive,
          totalSold: 0,
          revenue: 0,
          orderCount: 0,
          uniqueOrders: 0
        }));
      } catch (fallbackError) {
        debugInfo.variantFallbackError = fallbackError.message;
        topVariants = [];
      }
    }

    // Low Stock Variants - FIXED
    let lowStockVariants = [];
    try {
      lowStockVariants = await ProductVariant.findAll({
        attributes: ['id', 'sku', 'name', 'stockQuantity', 'isActive', 'price'],
        where: {
          stockQuantity: { [Op.lte]: 10 },
          isActive: true
        },
        include: [{
          model: Product,
          as: 'product',
          attributes: ['name', 'lowStockThreshold'],
          include: [{
            model: Category,
            as: 'category',
            attributes: ['name'],
            required: false
          }],
          where: categoryId ? { categoryId: categoryId } : undefined
        }],
        limit: 20,
        raw: false
      });

      debugInfo.lowStockVariantsCount = lowStockVariants.length;

    } catch (error) {
      console.error("Low stock variants query error:", error);
      debugInfo.lowStockVariantsError = error.message;
      lowStockVariants = [];
    }

    // Variant counts - FIXED
    let totalVariants = 0;
    let activeVariants = 0;
    let lowStockVariantCount = 0;
    try {
      const variantCountQuery = `
        SELECT 
          COUNT(*) as total_variants,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_variants,
          COUNT(CASE WHEN "stockQuantity" <= 10 AND "isActive" = true THEN 1 END) as low_stock_variants
        FROM product_variants pv
        ${categoryId ? `
          LEFT JOIN products p ON pv."productId" = p.id
          WHERE p."categoryId" = $1
        ` : ''}
      `;

      const bindParams = categoryId ? [categoryId] : [];
      const [countResult] = await sequelize.query(variantCountQuery, {
        bind: bindParams,
        type: sequelize.QueryTypes.SELECT
      });

      totalVariants = parseInt(countResult.total_variants || 0);
      activeVariants = parseInt(countResult.active_variants || 0);
      lowStockVariantCount = parseInt(countResult.low_stock_variants || 0);

    } catch (error) {
      console.error("Variant count error:", error);
      debugInfo.variantCountError = error.message;
    }

    // Helper functions
    const safeParseFloat = (value, defaultValue = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const safeParseInt = (value, defaultValue = 0) => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Calculate total revenue from all sources
    const productRevenue = (productPerformance || []).reduce((sum, product) => {
      return sum + safeParseFloat(product.revenue);
    }, 0);

    const variantRevenue = (topVariants || []).reduce((sum, variant) => {
      return sum + safeParseFloat(variant.revenue);
    }, 0);

    // Format response with debug info
    const response = {
      success: true,
      data: {
        topProducts: (productPerformance || []).map(product => ({
          id: product.id,
          name: product.name,
          price: safeParseFloat(product.price),
          stockQuantity: safeParseInt(product.stockQuantity),
          category: product.category?.name || 'No Category',
          isActive: product.isActive,
          directSold: safeParseInt(product.directSold),
          variantSold: safeParseInt(product.variantSold),
          totalSold: safeParseInt(product.totalSold),
          revenue: Math.round(safeParseFloat(product.revenue) * 100) / 100,
          orderCount: safeParseInt(product.orderCount)
        })),
        lowStockProducts: (lowStockProducts || []).map(product => ({
          id: product.id,
          name: product.name,
          stockQuantity: safeParseInt(product.stockQuantity),
          lowStockThreshold: safeParseInt(product.lowStockThreshold, 5),
          category: product.category?.name || 'No Category'
        })),
        topVariants: topVariants.map(variant => ({
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          productId: variant.productId,
          productName: variant.productName || 'No Product',
          categoryName: variant.categoryName || 'No Category',
          price: Math.round(safeParseFloat(variant.price) * 100) / 100,
          stockQuantity: safeParseInt(variant.stockQuantity),
          isActive: variant.isActive,
          totalSold: safeParseInt(variant.totalSold),
          revenue: Math.round(safeParseFloat(variant.revenue) * 100) / 100,
          orderCount: safeParseInt(variant.orderCount),
          uniqueOrders: safeParseInt(variant.uniqueOrders)
        })),
        lowStockVariants: (lowStockVariants || []).map(variant => ({
          id: variant.id,
          sku: variant.sku,
          name: variant.name,
          stockQuantity: safeParseInt(variant.stockQuantity),
          productName: variant.product?.name || 'No Product',
          categoryName: variant.product?.category?.name || 'No Category',
          isActive: variant.isActive,
          price: Math.round(safeParseFloat(variant.price) * 100) / 100,
          lowStockThreshold: safeParseInt(variant.product?.lowStockThreshold, 5)
        })),
        categoryPerformance: (categoryPerformance || []).map(category => ({
          id: category.id,
          name: category.name,
          productCount: safeParseInt(category.productCount),
          totalSold: safeParseInt(category.totalSold),
          revenue: Math.round(safeParseFloat(category.revenue) * 100) / 100,
          orderCount: safeParseInt(category.orderCount)
        })),
        summary: {
          totalProducts: (productPerformance || []).length,
          lowStockCount: (lowStockProducts || []).length,
          totalVariants: totalVariants,
          activeVariants: activeVariants,
          lowStockVariantCount: lowStockVariantCount,
          activeCategories: (categoryPerformance || []).length,
          totalRevenue: Math.round((productRevenue + variantRevenue) * 100) / 100,
          productRevenue: Math.round(productRevenue * 100) / 100,
          variantRevenue: Math.round(variantRevenue * 100) / 100
        },
        period: `${periodInt} days`,
        categoryFilter: categoryId ? parseInt(categoryId) : null,
        generatedAt: new Date().toISOString()
      },
      message: "Product analytics retrieved successfully",
      ...(debug === 'true' ? { debug: debugInfo } : {})
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Product analytics error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve product analytics",
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }
};

export const getCouponAnalytics = async (req, res) => {
  try {
    const { period = '30', debug = false } = req.query;
    
    // Validate period parameter
    const periodInt = parseInt(period);
    if (isNaN(periodInt) || periodInt < 1 || periodInt > 365) {
      return res.status(400).json({
        success: false,
        message: "Period must be a number between 1 and 365 days"
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodInt);
    startDate.setHours(0, 0, 0, 0);

    const debugInfo = {
      startDate: startDate.toISOString(),
      period: periodInt
    };

    // Helper functions
    const safeParseFloat = (value, defaultValue = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const safeParseInt = (value, defaultValue = 0) => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // FIXED: Coupon performance using proper many-to-many relationship
    let couponPerformance = [];
    try {
      const couponPerformanceQuery = `
        SELECT 
          c.id,
          c.code,
          c.name,
          c.type,
          c.value,
          c."usageLimit",
          c."usedCount",
          c."maxDiscountAmount",
          c."minimumAmount",
          c."isActive",
          c."startDate",
          c."endDate",
          COUNT(DISTINCT oc."orderId") as actual_usage,
          COUNT(DISTINCT o.id) as successful_orders,
          COALESCE(SUM(o."discountAmount"), 0) as total_discount_given,
          COALESCE(AVG(o."subtotal"), 0) as avg_order_value,
          COALESCE(SUM(o."subtotal"), 0) as total_order_value
        FROM coupons c
        LEFT JOIN order_coupons oc ON c.id = oc."couponId"
        LEFT JOIN orders o ON oc."orderId" = o.id 
          AND o."createdAt" >= $1
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        WHERE c."isActive" = true
        GROUP BY c.id, c.code, c.name, c.type, c.value, c."usageLimit", c."usedCount", 
                 c."maxDiscountAmount", c."minimumAmount", c."isActive", c."startDate", c."endDate"
        ORDER BY total_discount_given DESC, actual_usage DESC
        LIMIT 20
      `;

      const couponResults = await sequelize.query(couponPerformanceQuery, {
        bind: [startDate],
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.couponPerformanceResults = couponResults.length;
      debugInfo.sampleCouponResults = couponResults.slice(0, 2);

      couponPerformance = couponResults.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: safeParseFloat(coupon.value),
        usageLimit: safeParseInt(coupon.usageLimit),
        usedCount: safeParseInt(coupon.usedCount),
        maxDiscountAmount: safeParseFloat(coupon.maxDiscountAmount),
        minimumAmount: safeParseFloat(coupon.minimumAmount),
        isActive: coupon.isActive,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
        actualUsage: safeParseInt(coupon.actual_usage),
        successfulOrders: safeParseInt(coupon.successful_orders),
        totalDiscountGiven: safeParseFloat(coupon.total_discount_given),
        avgOrderValue: safeParseFloat(coupon.avg_order_value),
        totalOrderValue: safeParseFloat(coupon.total_order_value),
        usageRate: coupon.usageLimit > 0 ? 
          Math.round((safeParseInt(coupon.actual_usage) / safeParseInt(coupon.usageLimit)) * 100) : null,
        effectivenessScore: safeParseFloat(coupon.total_discount_given) > 0 ? 
          Math.round((safeParseFloat(coupon.total_order_value) / safeParseFloat(coupon.total_discount_given)) * 100) / 100 : 0
      }));

    } catch (error) {
      console.error("Coupon performance query error:", error);
      debugInfo.couponPerformanceError = error.message;
      
      // Fallback to basic coupon query
      try {
        const basicCoupons = await Coupon.findAll({
          attributes: ['id', 'code', 'name', 'type', 'value', 'usageLimit', 'usedCount', 
                      'maxDiscountAmount', 'minimumAmount', 'isActive', 'startDate', 'endDate'],
          where: { isActive: true },
          limit: 20,
          order: [['usedCount', 'DESC']],
          raw: true
        });
        
        couponPerformance = basicCoupons.map(coupon => ({
          ...coupon,
          actualUsage: 0,
          successfulOrders: 0,
          totalDiscountGiven: 0,
          avgOrderValue: 0,
          totalOrderValue: 0,
          usageRate: coupon.usageLimit > 0 ? 
            Math.round((coupon.usedCount / coupon.usageLimit) * 100) : null,
          effectivenessScore: 0
        }));
      } catch (fallbackError) {
        debugInfo.couponFallbackError = fallbackError.message;
        couponPerformance = [];
      }
    }

    // FIXED: Coupon conversion rate analysis
    let couponConversion = [];
    try {
      const couponConversionQuery = `
        SELECT 
          c.id,
          c.code,
          c.name,
          c.type,
          c.value,
          c."isActive",
          COUNT(DISTINCT oc."orderId") as orders_with_coupon,
          COUNT(DISTINCT CASE WHEN o.status IN ('confirmed', 'processing', 'shipped', 'delivered') 
                              THEN oc."orderId" END) as successful_orders_with_coupon,
          COALESCE(SUM(CASE WHEN o.status IN ('confirmed', 'processing', 'shipped', 'delivered') 
                              THEN o."discountAmount" ELSE 0 END), 0) as total_discount_given,
          COALESCE(AVG(CASE WHEN o.status IN ('confirmed', 'processing', 'shipped', 'delivered') 
                              THEN o."subtotal" END), 0) as avg_order_value_with_coupon,
          -- Calculate conversion rate based on successful orders
          ROUND(
            CASE 
              WHEN COUNT(DISTINCT oc."orderId") > 0 
              THEN (COUNT(DISTINCT CASE WHEN o.status IN ('confirmed', 'processing', 'shipped', 'delivered') 
                                        THEN oc."orderId" END)::float / COUNT(DISTINCT oc."orderId")) * 100
              ELSE 0 
            END,
            2
          ) as success_rate
        FROM coupons c
        LEFT JOIN order_coupons oc ON c.id = oc."couponId"
        LEFT JOIN orders o ON oc."orderId" = o.id AND o."createdAt" >= $1
        WHERE c."isActive" = true
        GROUP BY c.id, c.code, c.name, c.type, c.value, c."isActive"
        HAVING COUNT(DISTINCT oc."orderId") > 0
        ORDER BY success_rate DESC, total_discount_given DESC
        LIMIT 15
      `;

      const conversionResults = await sequelize.query(couponConversionQuery, {
        bind: [startDate],
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.couponConversionResults = conversionResults.length;
      debugInfo.sampleConversionResults = conversionResults.slice(0, 2);

      couponConversion = conversionResults.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        type: coupon.type,
        value: safeParseFloat(coupon.value),
        isActive: coupon.isActive,
        ordersWithCoupon: safeParseInt(coupon.orders_with_coupon),
        successfulOrdersWithCoupon: safeParseInt(coupon.successful_orders_with_coupon),
        successRate: safeParseFloat(coupon.success_rate),
        totalDiscountGiven: safeParseFloat(coupon.total_discount_given),
        avgOrderValueWithCoupon: safeParseFloat(coupon.avg_order_value_with_coupon)
      }));

    } catch (error) {
      console.error("Coupon conversion query error:", error);
      debugInfo.couponConversionError = error.message;
      couponConversion = [];
    }

    // FIXED: Discount impact analysis with better comparisons
    let discountImpact = [];
    try {
      const discountImpactQuery = `
        SELECT 
          CASE 
            WHEN o."discountAmount" > 0 THEN 'With Coupon'
            ELSE 'Without Coupon'
          END as order_type,
          COUNT(o.id) as order_count,
          ROUND(AVG(o."subtotal"), 2) as avg_order_value,
          ROUND(AVG(o."discountAmount"), 2) as avg_discount,
          COALESCE(SUM(o."discountAmount"), 0) as total_discount,
          COALESCE(SUM(o."subtotal"), 0) as total_order_value,
          -- Calculate average discount percentage
          ROUND(
            CASE 
              WHEN AVG(o."subtotal") > 0 
              THEN (AVG(o."discountAmount") / AVG(o."subtotal")) * 100
              ELSE 0 
            END,
            2
          ) as avg_discount_percentage
        FROM orders o
        WHERE o."createdAt" >= $1
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY 
          CASE 
            WHEN o."discountAmount" > 0 THEN 'With Coupon'
            ELSE 'Without Coupon'
          END
        ORDER BY order_type DESC
      `;

      const impactResults = await sequelize.query(discountImpactQuery, {
        bind: [startDate],
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.discountImpactResults = impactResults.length;
      debugInfo.sampleImpactResults = impactResults;

      discountImpact = impactResults.map(impact => ({
        orderType: impact.order_type,
        orderCount: safeParseInt(impact.order_count),
        avgOrderValue: safeParseFloat(impact.avg_order_value),
        avgDiscount: safeParseFloat(impact.avg_discount),
        totalDiscount: safeParseFloat(impact.total_discount),
        totalOrderValue: safeParseFloat(impact.total_order_value),
        avgDiscountPercentage: safeParseFloat(impact.avg_discount_percentage)
      }));

    } catch (error) {
      console.error("Discount impact query error:", error);
      debugInfo.discountImpactError = error.message;
      discountImpact = [];
    }

    // FIXED: Active vs Inactive coupons summary
    let couponSummary = {};
    try {
      const summaryQuery = `
        SELECT 
          COUNT(*) as total_coupons,
          COUNT(CASE WHEN "isActive" = true THEN 1 END) as active_coupons,
          COUNT(CASE WHEN "isActive" = false THEN 1 END) as inactive_coupons,
          COUNT(CASE WHEN "endDate" < NOW() THEN 1 END) as expired_coupons,
          COUNT(CASE WHEN "usedCount" >= "usageLimit" THEN 1 END) as exhausted_coupons,
          COALESCE(AVG("value"), 0) as avg_coupon_value,
          COALESCE(SUM("usedCount"), 0) as total_usage_count
        FROM coupons
      `;

      const [summaryResult] = await sequelize.query(summaryQuery, {
        type: sequelize.QueryTypes.SELECT
      });

      couponSummary = {
        totalCoupons: safeParseInt(summaryResult.total_coupons),
        activeCoupons: safeParseInt(summaryResult.active_coupons),
        inactiveCoupons: safeParseInt(summaryResult.inactive_coupons),
        expiredCoupons: safeParseInt(summaryResult.expired_coupons),
        exhaustedCoupons: safeParseInt(summaryResult.exhausted_coupons),
        avgCouponValue: safeParseFloat(summaryResult.avg_coupon_value),
        totalUsageCount: safeParseInt(summaryResult.total_usage_count)
      };

    } catch (error) {
      console.error("Coupon summary query error:", error);
      debugInfo.couponSummaryError = error.message;
      couponSummary = {
        totalCoupons: 0,
        activeCoupons: 0,
        inactiveCoupons: 0,
        expiredCoupons: 0,
        exhaustedCoupons: 0,
        avgCouponValue: 0,
        totalUsageCount: 0
      };
    }

    // FIXED: Top users by coupon usage
    let topCouponUsers = [];
    try {
      const topUsersQuery = `
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          a.email,
          COUNT(DISTINCT oc."couponId") as unique_coupons_used,
          COUNT(DISTINCT oc."orderId") as orders_with_coupons,
          COALESCE(SUM(o."discountAmount"), 0) as total_savings,
          COALESCE(AVG(o."discountAmount"), 0) as avg_savings_per_order,
          COALESCE(SUM(o."subtotal"), 0) as total_order_value,
          ROUND(
            CASE 
              WHEN SUM(o."subtotal") > 0 
              THEN (SUM(o."discountAmount") / SUM(o."subtotal")) * 100
              ELSE 0 
            END,
            2
          ) as savings_percentage
        FROM users u
        LEFT JOIN auth a ON u."authId" = a.id
        JOIN orders o ON u.id = o."userId"
        JOIN order_coupons oc ON o.id = oc."orderId"
        WHERE o."createdAt" >= $1
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
        GROUP BY u.id, u."firstName", u."lastName", a.email
        HAVING COUNT(DISTINCT oc."orderId") > 0
        ORDER BY total_savings DESC, orders_with_coupons DESC
        LIMIT 10
      `;

      const topUsersResults = await sequelize.query(topUsersQuery, {
        bind: [startDate],
        type: sequelize.QueryTypes.SELECT
      });

      debugInfo.topCouponUsersResults = topUsersResults.length;
      debugInfo.sampleTopUsers = topUsersResults.slice(0, 2);

      topCouponUsers = topUsersResults.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        uniqueCouponsUsed: safeParseInt(user.unique_coupons_used),
        ordersWithCoupons: safeParseInt(user.orders_with_coupons),
        totalSavings: safeParseFloat(user.total_savings),
        avgSavingsPerOrder: safeParseFloat(user.avg_savings_per_order),
        totalOrderValue: safeParseFloat(user.total_order_value),
        savingsPercentage: safeParseFloat(user.savings_percentage)
      }));

      // If no results from the complex query, try a simpler approach
      if (topCouponUsers.length === 0) {
        debugInfo.tryingFallbackTopUsers = true;
        
        const fallbackQuery = `
          SELECT 
            u.id,
            u."firstName",
            u."lastName",
            COUNT(DISTINCT o.id) as orders_with_discount,
            COALESCE(SUM(o."discountAmount"), 0) as total_savings
          FROM users u
          JOIN orders o ON u.id = o."userId"
          WHERE o."createdAt" >= $1
            AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
            AND o."discountAmount" > 0
          GROUP BY u.id, u."firstName", u."lastName"
          ORDER BY total_savings DESC
          LIMIT 10
        `;

        const fallbackResults = await sequelize.query(fallbackQuery, {
          bind: [startDate],
          type: sequelize.QueryTypes.SELECT
        });

        topCouponUsers = fallbackResults.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: null,
          uniqueCouponsUsed: 0,
          ordersWithCoupons: safeParseInt(user.orders_with_discount),
          totalSavings: safeParseFloat(user.total_savings),
          avgSavingsPerOrder: 0,
          totalOrderValue: 0,
          savingsPercentage: 0
        }));

        debugInfo.fallbackTopUsersResults = fallbackResults.length;
      }

    } catch (error) {
      console.error("Top coupon users query error:", error);
      debugInfo.topCouponUsersError = error.message;
      
      // Final fallback - get users with any discount orders
      try {
        const finalFallbackQuery = `
          SELECT 
            u.id,
            u."firstName",
            u."lastName",
            COUNT(o.id) as discount_orders,
            SUM(o."discountAmount") as total_discount
          FROM users u
          JOIN orders o ON u.id = o."userId"
          WHERE o."discountAmount" > 0
            AND o."createdAt" >= $1
          GROUP BY u.id, u."firstName", u."lastName"
          ORDER BY total_discount DESC
          LIMIT 5
        `;

        const finalResults = await sequelize.query(finalFallbackQuery, {
          bind: [startDate],
          type: sequelize.QueryTypes.SELECT
        });

        topCouponUsers = finalResults.map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: null,
          uniqueCouponsUsed: 0,
          ordersWithCoupons: safeParseInt(user.discount_orders),
          totalSavings: safeParseFloat(user.total_discount),
          avgSavingsPerOrder: 0,
          totalOrderValue: 0,
          savingsPercentage: 0
        }));

        debugInfo.finalFallbackUsed = true;
        debugInfo.finalFallbackResults = finalResults.length;
      } catch (finalError) {
        debugInfo.finalFallbackError = finalError.message;
        topCouponUsers = [];
      }
    }

    // Calculate total metrics
    const totalDiscountGiven = couponPerformance.reduce((sum, coupon) => 
      sum + coupon.totalDiscountGiven, 0);
    
    const totalOrdersWithCoupons = couponPerformance.reduce((sum, coupon) => 
      sum + coupon.successfulOrders, 0);

    const response = {
      success: true,
      data: {
        topCoupons: couponPerformance,
        couponConversion: couponConversion,
        discountImpact: discountImpact,
        topCouponUsers: topCouponUsers,
        summary: {
          ...couponSummary,
          totalDiscountGivenInPeriod: Math.round(totalDiscountGiven * 100) / 100,
          totalOrdersWithCoupons: totalOrdersWithCoupons,
          avgDiscountPerOrder: totalOrdersWithCoupons > 0 ? 
            Math.round((totalDiscountGiven / totalOrdersWithCoupons) * 100) / 100 : 0
        },
        period: `${periodInt} days`,
        generatedAt: new Date().toISOString()
      },
      message: "Coupon analytics retrieved successfully",
      ...(debug === 'true' ? { debug: debugInfo } : {})
    };

    return res.status(200).json(response);

  } catch (error) {
    console.error("Coupon analytics error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve coupon analytics",
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
  }
};

export const getInventoryAnalytics = async (req, res) => {
  try {
    const { categoryId } = req.query;

    // Stock levels overview
    const stockOverview = await Product.findAll({
      attributes: [
        [literal('CASE WHEN "stockQuantity" = 0 THEN \'Out of Stock\' WHEN "stockQuantity" <= "lowStockThreshold" THEN \'Low Stock\' ELSE \'In Stock\' END'), 'stockStatus'],
        [fn('COUNT', col('id')), 'productCount'],
        [fn('SUM', col('stockQuantity')), 'totalStock']
      ],
      where: {
        isActive: true,
        ...(categoryId && { categoryId })
      },
      group: [literal('CASE WHEN "stockQuantity" = 0 THEN \'Out of Stock\' WHEN "stockQuantity" <= "lowStockThreshold" THEN \'Low Stock\' ELSE \'In Stock\' END')],
      raw: true
    });

    // Top moving products (last 30 days)
    const topMovingProducts = await Product.findAll({
      attributes: [
        'id', 'name', 'stockQuantity', 'lowStockThreshold',
        [fn('COALESCE', fn('SUM', col('orderItems.quantity')), 0), 'soldQuantity']
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: [],
          include: [{
            model: Order,
            as: 'order',
            attributes: [],
            where: {
              createdAt: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
              status: ['confirmed', 'processing', 'shipped', 'delivered']
            }
          }]
        }
      ],
      where: {
        isActive: true,
        ...(categoryId && { categoryId })
      },
      group: ['Product.id', 'category.id'],
      order: [[literal('soldQuantity'), 'DESC']],
      limit: 20
    });

    // Slow moving products
    const slowMovingProducts = await Product.findAll({
      attributes: [
        'id', 'name', 'stockQuantity', 'price', 'createdAt',
        [fn('COALESCE', fn('SUM', col('orderItems.quantity')), 0), 'soldQuantity']
      ],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          attributes: [],
          include: [{
            model: Order,
            as: 'order',
            attributes: [],
            where: {
              createdAt: { [Op.gte]: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
              status: ['confirmed', 'processing', 'shipped', 'delivered']
            }
          }]
        }
      ],
      where: {
        isActive: true,
        stockQuantity: { [Op.gt]: 0 },
        ...(categoryId && { categoryId })
      },
      group: ['Product.id', 'category.id'],
      having: literal('COALESCE(SUM(orderItems.quantity), 0) <= 2'),
      order: [['createdAt', 'ASC']],
      limit: 20
    });

    return res.status(200).json({
      success: true,
      data: {
        stockOverview: stockOverview.map(item => ({
          stockStatus: item.stockStatus,
          productCount: parseInt(item.productCount),
          totalStock: parseInt(item.totalStock || 0)
        })),
        topMovingProducts: topMovingProducts.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category?.name,
          stockQuantity: product.stockQuantity,
          lowStockThreshold: product.lowStockThreshold,
          soldQuantity: parseInt(product.getDataValue('soldQuantity')),
          turnoverRate: product.stockQuantity > 0 ? 
            Math.round((parseInt(product.getDataValue('soldQuantity')) / product.stockQuantity) * 100) / 100 : 0
        })),
        slowMovingProducts: slowMovingProducts.map(product => ({
          id: product.id,
          name: product.name,
          category: product.category?.name,
          stockQuantity: product.stockQuantity,
          price: product.price,
          soldQuantity: parseInt(product.getDataValue('soldQuantity')),
          daysInInventory: Math.floor((new Date() - new Date(product.createdAt)) / (1000 * 60 * 60 * 24))
        }))
      },
      message: "Inventory analytics retrieved successfully"
    });

  } catch (error) {
    console.error("Inventory analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve inventory analytics",
      error: error.message
    });
  }
};

export const getCustomerAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    // Validate period parameter
    const periodInt = parseInt(period);
    if (isNaN(periodInt) || periodInt < 1 || periodInt > 365) {
      return res.status(400).json({
        success: false,
        message: "Period must be a number between 1 and 365 days"
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodInt);
    startDate.setHours(0, 0, 0, 0); // Start of day

    // Customer acquisition over time
    const customerAcquisition = await User.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'newCustomers']
      ],
      where: {
        role: 'customer',
        createdAt: { 
          [Op.gte]: startDate,
          [Op.lte]: new Date() // Ensure we don't get future dates
        }
      },
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true
    }).catch(error => {
      console.error("Customer acquisition query error:", error);
      return [];
    });

    // Customer lifetime value with better error handling
    const customerLTV = await User.findAll({
      attributes: [
        'id', 'firstName', 'lastName',
        [fn('COUNT', col('orders.id')), 'totalOrders'],
        [fn('COALESCE', fn('SUM', col('orders.subtotal')), 0), 'totalSpent'],
        [fn('COALESCE', fn('AVG', col('orders.subtotal')), 0), 'avgOrderValue'],
        [fn('MIN', col('orders.createdAt')), 'firstOrder'],
        [fn('MAX', col('orders.createdAt')), 'lastOrder']
      ],
      include: [{
        model: Order,
        as: 'orders',
        attributes: [],
        where: {
          status: {
            [Op.in]: ['confirmed', 'processing', 'shipped', 'delivered']
          }
        },
        required: false // LEFT JOIN instead of INNER JOIN
      }],
      where: { 
        role: 'customer',
        firstName: { [Op.ne]: null },
        lastName: { [Op.ne]: null }
      },
      group: ['User.id', 'User.firstName', 'User.lastName'],
      having: literal('COUNT(orders.id) > 0'),
      order: [[literal('CAST(COALESCE(SUM(orders.subtotal), 0) AS DECIMAL)'), 'DESC']],
      limit: 50,
      raw: true
    }).catch(error => {
      console.error("Customer LTV query error:", error);
      return [];
    });

    // Customer segmentation with better SQL and error handling
    const customerSegmentation = await sequelize.query(`
      SELECT 
        CASE 
          WHEN COALESCE(order_count, 0) = 0 THEN 'No Orders'
          WHEN order_count = 1 THEN 'One-time'
          WHEN order_count BETWEEN 2 AND 5 THEN 'Regular'
          WHEN order_count BETWEEN 6 AND 10 THEN 'Loyal'
          ELSE 'VIP'
        END as segment,
        COUNT(*) as customer_count,
        COALESCE(AVG(total_spent), 0) as avg_spent
      FROM (
        SELECT 
          u.id,
          COUNT(o.id) as order_count,
          COALESCE(SUM(o.subtotal), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o."userId" 
          AND o.status IN ('confirmed', 'processing', 'shipped', 'delivered')
          AND o."deletedAt" IS NULL
        WHERE u.role = 'customer' 
          AND u."deletedAt" IS NULL
        GROUP BY u.id
      ) customer_stats
      GROUP BY 
        CASE 
          WHEN COALESCE(order_count, 0) = 0 THEN 'No Orders'
          WHEN order_count = 1 THEN 'One-time'
          WHEN order_count BETWEEN 2 AND 5 THEN 'Regular'
          WHEN order_count BETWEEN 6 AND 10 THEN 'Loyal'
          ELSE 'VIP'
        END
      ORDER BY 
        CASE 
          WHEN segment = 'VIP' THEN 1
          WHEN segment = 'Loyal' THEN 2
          WHEN segment = 'Regular' THEN 3
          WHEN segment = 'One-time' THEN 4
          ELSE 5
        END
    `, { 
      type: sequelize.QueryTypes.SELECT,
      logging: console.log // Enable logging for debugging
    }).catch(error => {
      console.error("Customer segmentation query error:", error);
      return [];
    });

    // Geographic distribution with null checks and better error handling
    const geographicDistribution = await User.findAll({
      attributes: [
        [literal("COALESCE(address->>'city', 'Unknown')"), 'city'],
        [literal("COALESCE(address->>'province', 'Unknown')"), 'province'],
        [fn('COUNT', col('id')), 'customerCount']
      ],
      where: {
        role: 'customer',
        [Op.or]: [
          { address: { [Op.ne]: null } },
          { address: { [Op.ne]: {} } }
        ]
      },
      group: [
        literal("COALESCE(address->>'city', 'Unknown')"), 
        literal("COALESCE(address->>'province', 'Unknown')")
      ],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 20,
      raw: true
    }).catch(error => {
      console.error("Geographic distribution query error:", error);
      return [];
    });

    // Helper function to safely parse numbers
    const safeParseFloat = (value, defaultValue = 0) => {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const safeParseInt = (value, defaultValue = 0) => {
      const parsed = parseInt(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    // Format response data with null checks
    const formattedResponse = {
      success: true,
      data: {
        customerAcquisition: (customerAcquisition || []).map(item => ({
          date: item?.date || null,
          newCustomers: safeParseInt(item?.newCustomers)
        })),
        topCustomers: (customerLTV || []).slice(0, 10).map(customer => ({
          id: customer?.id || null,
          name: `${customer?.firstName || 'Unknown'} ${customer?.lastName || ''}`.trim(),
          totalOrders: safeParseInt(customer?.totalOrders),
          totalSpent: Math.round(safeParseFloat(customer?.totalSpent) * 100) / 100,
          avgOrderValue: Math.round(safeParseFloat(customer?.avgOrderValue) * 100) / 100,
          firstOrder: customer?.firstOrder || null,
          lastOrder: customer?.lastOrder || null
        })),
        customerSegmentation: (customerSegmentation || []).map(segment => ({
          segment: segment?.segment || 'Unknown',
          customerCount: safeParseInt(segment?.customer_count),
          avgSpent: Math.round(safeParseFloat(segment?.avg_spent) * 100) / 100
        })),
        geographicDistribution: (geographicDistribution || []).map(geo => ({
          city: geo?.city || 'Unknown',
          province: geo?.province || 'Unknown',
          customerCount: safeParseInt(geo?.customerCount)
        })),
        period: `${periodInt} days`,
        generatedAt: new Date().toISOString()
      },
      message: "Customer analytics retrieved successfully"
    };

    return res.status(200).json(formattedResponse);

  } catch (error) {
    console.error("Customer analytics error:", error);
    
    // Return more specific error information in development
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve customer analytics",
      error: isDevelopment ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : "Internal server error"
    });
  }
};

export const getOrderAnalytics = async (req, res) => {
  try {
    const { period = '30', status } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const whereClause = {
      createdAt: { [Op.gte]: startDate },
      ...(status && { status })
    };

    // Order trends over time
    const orderTrends = await Order.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'day', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('subtotal')), 'revenue'],
        [fn('AVG', col('subtotal')), 'avgOrderValue']
      ],
      where: whereClause,
      group: [fn('DATE_TRUNC', 'day', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'day', col('createdAt')), 'ASC']],
      raw: true
    });

    // Order status distribution
    const statusDistribution = await Order.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('subtotal')), 'revenue']
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['status'],
      raw: true
    });

    // Payment method analysis
    const paymentMethodAnalysis = await Order.findAll({
      attributes: [
        'paymentMethod',
        'paymentStatus',
        [fn('COUNT', col('id')), 'count'],
        [fn('SUM', col('subtotal')), 'revenue']
      ],
      where: { createdAt: { [Op.gte]: startDate } },
      group: ['paymentMethod', 'paymentStatus'],
      raw: true
    });

    // Order fulfillment times
    const fulfillmentTimes = await sequelize.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM ("shippedAt" - "createdAt"))/3600) as avg_hours_to_ship,
        AVG(EXTRACT(EPOCH FROM ("deliveredAt" - "createdAt"))/3600) as avg_hours_to_deliver,
        COUNT(CASE WHEN "shippedAt" IS NOT NULL THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN "deliveredAt" IS NOT NULL THEN 1 END) as delivered_orders
      FROM orders 
      WHERE "createdAt" >= :startDate
    `, {
      replacements: { startDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Top customers by order frequency
    const topCustomersByOrders = await User.findAll({
      attributes: [
        'id', 'firstName', 'lastName',
        [fn('COUNT', col('orders.id')), 'orderCount'],
        [fn('SUM', col('orders.subtotal')), 'totalSpent'],
        [fn('AVG', col('orders.subtotal')), 'avgOrderValue']
      ],
      include: [{
        model: Order,
        as: 'orders',
        attributes: [],
        where: whereClause
      }],
      where: { role: 'customer' },
      group: ['User.id'],
      order: [[literal('orderCount'), 'DESC']],
      limit: 10
    });

    return res.status(200).json({
      success: true,
      data: {
        orderTrends: orderTrends.map(trend => ({
          date: trend.date,
          orderCount: parseInt(trend.orderCount),
          revenue: Math.round(parseFloat(trend.revenue || 0) * 100) / 100,
          avgOrderValue: Math.round(parseFloat(trend.avgOrderValue || 0) * 100) / 100
        })),
        statusDistribution: statusDistribution.map(item => ({
          status: item.status,
          count: parseInt(item.count),
          revenue: Math.round(parseFloat(item.revenue || 0) * 100) / 100
        })),
        paymentMethodAnalysis: paymentMethodAnalysis.map(item => ({
          paymentMethod: item.paymentMethod,
          paymentStatus: item.paymentStatus,
          count: parseInt(item.count),
          revenue: Math.round(parseFloat(item.revenue || 0) * 100) / 100
        })),
        fulfillmentMetrics: {
          avgHoursToShip: Math.round(parseFloat(fulfillmentTimes[0]?.avg_hours_to_ship || 0) * 100) / 100,
          avgHoursToDeliver: Math.round(parseFloat(fulfillmentTimes[0]?.avg_hours_to_deliver || 0) * 100) / 100,
          shippedOrders: parseInt(fulfillmentTimes[0]?.shipped_orders || 0),
          deliveredOrders: parseInt(fulfillmentTimes[0]?.delivered_orders || 0)
        },
        topCustomers: topCustomersByOrders.map(customer => ({
          id: customer.id,
          name: `${customer.firstName} ${customer.lastName}`,
          orderCount: parseInt(customer.getDataValue('orderCount')),
          totalSpent: Math.round(parseFloat(customer.getDataValue('totalSpent')) * 100) / 100,
          avgOrderValue: Math.round(parseFloat(customer.getDataValue('avgOrderValue')) * 100) / 100
        })),
        period: `${period} days`
      },
      message: "Order analytics retrieved successfully"
    });

  } catch (error) {
    console.error("Order analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve order analytics",
      error: error.message
    });
  }
};

export const getReviewAnalytics = async (req, res) => {
  try {
    const { period = '30', productId } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const whereClause = {
      createdAt: { [Op.gte]: startDate },
      ...(productId && { productId })
    };

    // Overall review statistics
    const reviewStats = await Review.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalReviews'],
        [fn('AVG', col('rating')), 'avgRating'],
        [fn('COUNT', col('comment')), 'reviewsWithComments']
      ],
      where: whereClause,
      raw: true
    });

    // Rating distribution
    const ratingDistribution = await Review.findAll({
      attributes: [
        'rating',
        [fn('COUNT', col('id')), 'count']
      ],
      where: whereClause,
      group: ['rating'],
      order: [['rating', 'ASC']],
      raw: true
    });

    // Top rated products
    const topRatedProducts = await Product.findAll({
      attributes: [
        'id', 'name',
        [fn('COUNT', col('reviews.id')), 'reviewCount'],
        [fn('AVG', col('reviews.rating')), 'avgRating']
      ],
      include: [{
        model: Review,
        as: 'reviews',
        attributes: [],
        where: { createdAt: { [Op.gte]: startDate } }
      }],
      group: ['Product.id'],
      having: literal('COUNT(reviews.id) >= 3'),
      order: [[literal('avgRating'), 'DESC']],
      limit: 20
    });

    // Most reviewed products
    const mostReviewedProducts = await Product.findAll({
      attributes: [
        'id', 'name',
        [fn('COUNT', col('reviews.id')), 'reviewCount'],
        [fn('AVG', col('reviews.rating')), 'avgRating']
      ],
      include: [{
        model: Review,
        as: 'reviews',
        attributes: [],
        where: { createdAt: { [Op.gte]: startDate } }
      }],
      group: ['Product.id'],
      order: [[literal('reviewCount'), 'DESC']],
      limit: 20
    });

    // Review trends over time
    const reviewTrends = await Review.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'day', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'reviewCount'],
        [fn('AVG', col('rating')), 'avgRating']
      ],
      where: whereClause,
      group: [fn('DATE_TRUNC', 'day', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'day', col('createdAt')), 'ASC']],
      raw: true
    });

    return res.status(200).json({
      success: true,
      data: {
        reviewStats: {
          totalReviews: parseInt(reviewStats[0]?.totalReviews || 0),
          avgRating: Math.round(parseFloat(reviewStats[0]?.avgRating || 0) * 100) / 100,
          reviewsWithComments: parseInt(reviewStats[0]?.reviewsWithComments || 0)
        },
        ratingDistribution: ratingDistribution.map(item => ({
          rating: item.rating,
          count: parseInt(item.count)
        })),
        topRatedProducts: topRatedProducts.map(product => ({
          id: product.id,
          name: product.name,
          reviewCount: parseInt(product.getDataValue('reviewCount')),
          avgRating: Math.round(parseFloat(product.getDataValue('avgRating')) * 100) / 100
        })),
        mostReviewedProducts: mostReviewedProducts.map(product => ({
          id: product.id,
          name: product.name,
          reviewCount: parseInt(product.getDataValue('reviewCount')),
          avgRating: Math.round(parseFloat(product.getDataValue('avgRating')) * 100) / 100
        })),
        reviewTrends: reviewTrends.map(trend => ({
          date: trend.date,
          reviewCount: parseInt(trend.reviewCount),
          avgRating: Math.round(parseFloat(trend.avgRating) * 100) / 100
        })),
        period: `${period} days`
      },
      message: "Review analytics retrieved successfully"
    });

  } catch (error) {
    console.error("Review analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve review analytics",
      error: error.message
    });
  }
};