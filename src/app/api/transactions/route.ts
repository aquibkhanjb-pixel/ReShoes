import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Transaction from "@/models/Transaction";

// GET transactions
async function getTransactions(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const payoutStatus = searchParams.get("payoutStatus");

    const skip = (page - 1) * limit;

    const filter: any = {};

    // Sellers can only see their own transactions
    if (req.user!.role === "seller") {
      filter.seller = req.user!.userId;
    }
    // Admin can see all transactions

    if (payoutStatus) {
      filter.payoutStatus = payoutStatus;
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("seller", "name email")
        .populate("order")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    // Calculate totals
    const totals = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCommission: { $sum: "$commission" },
          totalSellerEarnings: { $sum: "$sellerEarnings" },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      totals: totals[0] || {
        totalAmount: 0,
        totalCommission: 0,
        totalSellerEarnings: 0,
      },
    });
  } catch (error: any) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getTransactions, { roles: ["seller", "admin"] });
