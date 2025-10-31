import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Shoe from "@/models/Shoe";
import User from "@/models/User";

// GET all products for admin (including pending)
async function getAdminProducts(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filter query
    const filter: any = {};
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [shoes, total] = await Promise.all([
      Shoe.find(filter)
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Shoe.countDocuments(filter),
    ]);

    // Fetch seller details for each shoe
    const shoesWithSellers = await Promise.all(
      shoes.map(async (shoe) => {
        const seller = await User.findById(shoe.seller)
          .select("name email profileImage")
          .lean();
        return {
          ...shoe,
          seller: seller || null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      shoes: shoesWithSellers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get admin products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getAdminProducts, { roles: ["admin"] });
