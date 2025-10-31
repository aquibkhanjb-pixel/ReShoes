import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Shoe from "@/models/Shoe";
import User from "@/models/User";

// GET seller's own products (all statuses)
async function getSellerProducts(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get("sort") || "-createdAt";

    // Fetch ALL shoes for this seller (regardless of status)
    const shoes = await Shoe.find({ seller: req.user!.userId })
      .sort(sort)
      .lean();

    // Fetch seller details for each shoe
    const shoesWithSeller = await Promise.all(
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
      shoes: shoesWithSeller,
    });
  } catch (error: any) {
    console.error("Get seller products error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getSellerProducts, { roles: ["seller"] });
