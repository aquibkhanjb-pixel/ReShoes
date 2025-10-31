import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest, withDB } from "@/lib/api-middleware";
import Shoe from "@/models/Shoe";
import User from "@/models/User"; // Import User model for population
import Review from "@/models/Review";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { z } from "zod";

const updateShoeSchema = z.object({
  title: z.string().min(3).optional(),
  brand: z.string().min(2).optional(),
  size: z.number().min(1).max(20).optional(),
  condition: z.enum(["new", "like-new", "good", "fair", "worn"]).optional(),
  price: z.number().min(0).optional(),
  description: z.string().min(10).optional(),
  images: z.array(z.string()).optional(),
  category: z.enum(["men", "women", "unisex", "kids"]).optional(),
  status: z.enum(["pending-approval", "approved", "rejected", "sold"]).optional(),
});

interface RouteContext {
  params: { id: string };
}

// GET single shoe
async function getShoe(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const shoe = await Shoe.findById(params.id).lean();

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    // Fetch seller details separately to avoid populate issues
    const seller = await User.findById(shoe.seller).select("name email profileImage").lean();

    // Increment view count (need to update directly since we used lean())
    await Shoe.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    // Get reviews for this shoe
    const reviews = await Review.find({ shoe: params.id })
      .populate("user", "name profileImage")
      .sort("-createdAt")
      .limit(10);

    return NextResponse.json({
      success: true,
      shoe: {
        ...shoe,
        seller: seller || null,
      },
      reviews,
    });
  } catch (error: any) {
    console.error("Get shoe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch shoe" },
      { status: 500 }
    );
  }
}

// PUT update shoe
async function updateShoe(
  req: AuthenticatedRequest,
  { params }: RouteContext
) {
  try {
    const shoe = await Shoe.findById(params.id);

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    // Check if user owns this shoe or is admin
    if (
      shoe.seller.toString() !== req.user!.userId &&
      req.user!.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this shoe" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateShoeSchema.parse(body);

    // Upload new images if provided
    if (validatedData.images && validatedData.images.length > 0) {
      const imageUrls = await uploadMultipleImages(
        validatedData.images,
        "reshoe/shoes"
      );
      validatedData.images = imageUrls;
    }

    // If shoe was rejected and seller is editing, reset to pending-approval
    if (shoe.status === "rejected" && req.user!.role === "seller") {
      shoe.status = "pending-approval";
      shoe.approvalStatus = "pending";
      shoe.rejectionReason = "";
    }

    // Update shoe
    Object.assign(shoe, validatedData);
    await shoe.save();

    const updatedShoe = await Shoe.findById(shoe._id).populate(
      "seller",
      "name email"
    );

    return NextResponse.json({
      success: true,
      message: "Shoe updated successfully",
      shoe: updatedShoe,
    });
  } catch (error: any) {
    console.error("Update shoe error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update shoe" },
      { status: 500 }
    );
  }
}

// DELETE shoe
async function deleteShoe(
  req: AuthenticatedRequest,
  { params }: RouteContext
) {
  try {
    const shoe = await Shoe.findById(params.id);

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    // Check if user owns this shoe or is admin
    if (
      shoe.seller.toString() !== req.user!.userId &&
      req.user!.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this shoe" },
        { status: 403 }
      );
    }

    // Check if shoe is already sold
    if (shoe.status === "sold") {
      return NextResponse.json(
        { error: "Cannot delete a sold shoe" },
        { status: 400 }
      );
    }

    await Shoe.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "Shoe deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete shoe error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete shoe" },
      { status: 500 }
    );
  }
}

export const GET = withDB(getShoe);
export const PUT = withAuth(updateShoe);
export const DELETE = withAuth(deleteShoe);
