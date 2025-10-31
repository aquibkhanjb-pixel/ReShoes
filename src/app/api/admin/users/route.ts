import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import User from "@/models/User";
import Shoe from "@/models/Shoe";
import Order from "@/models/Order";

// GET all users
async function getUsers(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const filter: any = {};
    if (role && role !== "all") {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        if (user.role === "seller") {
          const [totalListings, totalSales] = await Promise.all([
            Shoe.countDocuments({ seller: user._id }),
            Order.countDocuments({ seller: user._id, status: "delivered" }),
          ]);

          const salesData = await Order.aggregate([
            { $match: { seller: user._id, status: "delivered" } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          return {
            ...user,
            stats: {
              totalListings,
              totalSales,
              totalRevenue: salesData[0]?.total || 0,
            },
          };
        } else if (user.role === "customer") {
          const totalOrders = await Order.countDocuments({ buyer: user._id });
          const ordersData = await Order.aggregate([
            { $match: { buyer: user._id } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ]);

          return {
            ...user,
            stats: {
              totalOrders,
              totalSpent: ordersData[0]?.total || 0,
            },
          };
        }

        return user;
      })
    );

    return NextResponse.json({
      success: true,
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getUsers, { roles: ["admin"] });
