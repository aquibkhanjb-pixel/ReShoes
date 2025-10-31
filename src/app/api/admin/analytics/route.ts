import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import User from "@/models/User";
import Shoe from "@/models/Shoe";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";

async function getAnalytics(req: AuthenticatedRequest) {
  try {
    // Get counts
    const [
      totalUsers,
      totalCustomers,
      totalSellers,
      totalShoes,
      availableShoes,
      soldShoes,
      totalOrders,
      pendingOrders,
      deliveredOrders,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "seller" }),
      Shoe.countDocuments(),
      Shoe.countDocuments({ status: "available" }),
      Shoe.countDocuments({ status: "sold" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "processing"] } }),
      Order.countDocuments({ status: "delivered" }),
    ]);

    // Get financial stats
    const financialStats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalCommission: { $sum: "$commission" },
          totalSellerEarnings: { $sum: "$sellerEarnings" },
          pendingPayouts: {
            $sum: {
              $cond: [
                { $eq: ["$payoutStatus", "pending"] },
                "$sellerEarnings",
                0,
              ],
            },
          },
        },
      },
    ]);

    const financial = financialStats[0] || {
      totalRevenue: 0,
      totalCommission: 0,
      totalSellerEarnings: 0,
      pendingPayouts: 0,
    };

    // Recent orders
    const recentOrders = await Order.find()
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("shoe", "title images price")
      .sort("-createdAt")
      .limit(10)
      .lean();

    // Top sellers
    const topSellers = await Transaction.aggregate([
      {
        $group: {
          _id: "$seller",
          totalSales: { $sum: "$amount" },
          totalEarnings: { $sum: "$sellerEarnings" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },
      {
        $project: {
          _id: 1,
          totalSales: 1,
          totalEarnings: 1,
          orderCount: 1,
          "seller.name": 1,
          "seller.email": 1,
          "seller.profileImage": 1,
        },
      },
    ]);

    // Sales over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesOverTime = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$amount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          customers: totalCustomers,
          sellers: totalSellers,
        },
        shoes: {
          total: totalShoes,
          available: availableShoes,
          sold: soldShoes,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
        },
        financial,
        recentOrders,
        topSellers,
        salesOverTime,
      },
    });
  } catch (error: any) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAnalytics, { roles: ["admin"] });
