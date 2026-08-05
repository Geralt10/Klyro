import { Types } from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { OrderStatus } from "../order/order.enums.js";
import { orderModel } from "../order/order.model.js";
import { ProductStatus } from "../products/product.enums.js";
import { productModel } from "../products/product.model.js";
import { sellerModel } from "./seller.model.js";

const dashboardStatuses = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.DISPATCHED,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
] as const;

type DashboardOrderStatus = (typeof dashboardStatuses)[number];

interface ProductMetrics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockProducts: number;
}

interface OrderMetrics {
  orderStatus: Array<{ _id: DashboardOrderStatus; count: number }>;
  deliveredSales: Array<{ totalRevenue: number; totalUnitsSold: number }>;
}

interface MonthlyRevenueMetrics {
  _id: { year: number; month: number };
  revenue: number;
}

interface MonthlyOrderMetrics {
  _id: { year: number; month: number };
  orders: number;
}

const getLastSixMonthStart = () => {
  const now = new Date();

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
};

const buildLastSixMonths = () => {
  const start = getLastSixMonthStart();

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1)
    );

    return `${date.getUTCFullYear()}-${String(
      date.getUTCMonth() + 1
    ).padStart(2, "0")}`;
  });
};

export const getSellerDashboardService = async (userId: string) => {
  const seller = await sellerModel
    .findOne({ userId })
    .select("_id")
    .lean();

  if (!seller) {
    throw new ApiError(404, "Seller profile not found.");
  }

  const sellerId = seller._id as Types.ObjectId;
  const sixMonthsStart = getLastSixMonthStart();

  const [productMetrics, orderMetrics, monthlyRevenueData, monthlyOrdersData, recentOrders, lowStockProducts, topSellingProducts] =
    await Promise.all([
      productModel.aggregate<ProductMetrics>([
        { $match: { seller: sellerId } },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            activeProducts: {
              $sum: {
                $cond: [{ $eq: ["$status", ProductStatus.ACTIVE] }, 1, 0],
              },
            },
            inactiveProducts: {
              $sum: {
                $cond: [{ $ne: ["$status", ProductStatus.ACTIVE] }, 1, 0],
              },
            },
            outOfStockProducts: {
              $sum: {
                $cond: [{ $eq: [{ $sum: "$inventory.stock" }, 0] }, 1, 0],
              },
            },
          },
        },
      ]),

      orderModel.aggregate<OrderMetrics>([
        { $match: { "orderItems.sellerId": sellerId } },
        {
          $facet: {
            orderStatus: [
              {
                $group: {
                  _id: "$orderStatus",
                  count: { $sum: 1 },
                },
              },
            ],
            deliveredSales: [
              { $match: { orderStatus: OrderStatus.DELIVERED } },
              { $unwind: "$orderItems" },
              { $match: { "orderItems.sellerId": sellerId } },
              {
                $group: {
                  _id: null,
                  totalRevenue: {
                    $sum: {
                      $multiply: [
                        "$orderItems.finalPrice",
                        "$orderItems.quantity",
                      ],
                    },
                  },
                  totalUnitsSold: { $sum: "$orderItems.quantity" },
                },
              },
            ],
          },
        },
      ]),

      orderModel.aggregate<MonthlyRevenueMetrics>([
        {
          $match: {
            "orderItems.sellerId": sellerId,
            orderStatus: OrderStatus.DELIVERED,
            deliveredAt: { $gte: sixMonthsStart },
          },
        },
        { $unwind: "$orderItems" },
        { $match: { "orderItems.sellerId": sellerId } },
        {
          $group: {
            _id: {
              year: { $year: "$deliveredAt" },
              month: { $month: "$deliveredAt" },
            },
            revenue: {
              $sum: {
                $multiply: ["$orderItems.finalPrice", "$orderItems.quantity"],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      orderModel.aggregate<MonthlyOrderMetrics>([
        {
          $match: {
            "orderItems.sellerId": sellerId,
            createdAt: { $gte: sixMonthsStart },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      orderModel.aggregate([
        { $match: { "orderItems.sellerId": sellerId } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            pipeline: [{ $project: { name: 1 } }],
            as: "customer",
          },
        },
        {
          $project: {
            _id: 0,
            orderNumber: 1,
            orderStatus: 1,
            createdAt: 1,
            customerName: { $ifNull: [{ $first: "$customer.name" }, ""] },
            grandTotal: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$orderItems",
                      as: "item",
                      cond: { $eq: ["$$item.sellerId", sellerId] },
                    },
                  },
                  as: "item",
                  in: {
                    $multiply: ["$$item.finalPrice", "$$item.quantity"],
                  },
                },
              },
            },
          },
        },
      ]),

      productModel.aggregate([
        {
          $match: {
            seller: sellerId,
            inventory: { $elemMatch: { stock: { $lte: 5 } } },
          },
        },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: 1,
            image: { $arrayElemAt: ["$images.url", 0] },
            remainingStock: { $min: "$inventory.stock" },
          },
        },
        { $sort: { remainingStock: 1, name: 1 } },
        { $limit: 10 },
      ]),

      orderModel.aggregate([
        {
          $match: {
            "orderItems.sellerId": sellerId,
            orderStatus: OrderStatus.DELIVERED,
          },
        },
        { $unwind: "$orderItems" },
        { $match: { "orderItems.sellerId": sellerId } },
        {
          $group: {
            _id: "$orderItems.productId",
            name: { $first: "$orderItems.name" },
            image: { $first: "$orderItems.image" },
            unitsSold: { $sum: "$orderItems.quantity" },
            revenue: {
              $sum: {
                $multiply: ["$orderItems.finalPrice", "$orderItems.quantity"],
              },
            },
          },
        },
        { $sort: { unitsSold: -1, revenue: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: 1,
            image: 1,
            unitsSold: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

  const productSummary: ProductMetrics = productMetrics[0] ?? {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    outOfStockProducts: 0,
  };
  const orderSummary: OrderMetrics = orderMetrics[0] ?? {
    orderStatus: [],
    deliveredSales: [],
  };
  const orderStatusCounts = new Map<DashboardOrderStatus, number>(
    orderSummary.orderStatus.map(({ _id, count }) => [_id, count])
  );
  const deliveredSales = orderSummary.deliveredSales[0] ?? {
    totalRevenue: 0,
    totalUnitsSold: 0,
  };
  const months = buildLastSixMonths();
  const monthlyRevenueByMonth = new Map(
    monthlyRevenueData.map(({ _id, revenue }) => [
      `${_id.year}-${String(_id.month).padStart(2, "0")}`,
      revenue,
    ])
  );
  const monthlyOrdersByMonth = new Map(
    monthlyOrdersData.map(({ _id, orders }) => [
      `${_id.year}-${String(_id.month).padStart(2, "0")}`,
      orders,
    ])
  );

  const orderStatus = Object.fromEntries(
    dashboardStatuses.map((status) => [status, orderStatusCounts.get(status) ?? 0])
  ) as Record<DashboardOrderStatus, number>;

  return {
    overview: {
      ...productSummary,
      totalOrders: dashboardStatuses.reduce(
        (total, status) => total + (orderStatusCounts.get(status) ?? 0),
        0
      ),
      confirmedOrders: orderStatus[OrderStatus.CONFIRMED],
      processingOrders: orderStatus[OrderStatus.PROCESSING],
      dispatchedOrders: orderStatus[OrderStatus.DISPATCHED],
      deliveredOrders: orderStatus[OrderStatus.DELIVERED],
      cancelledOrders: orderStatus[OrderStatus.CANCELLED],
      totalRevenue: deliveredSales.totalRevenue,
      totalUnitsSold: deliveredSales.totalUnitsSold,
    },
    orderStatus,
    monthlyRevenue: months.map((month) => ({
      month,
      revenue: monthlyRevenueByMonth.get(month) ?? 0,
    })),
    monthlyOrders: months.map((month) => ({
      month,
      orders: monthlyOrdersByMonth.get(month) ?? 0,
    })),
    recentOrders,
    lowStockProducts,
    topSellingProducts,
  };
};
