import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { z } from "zod";

const createReviewSchema = z.object({
  shoeId: z.string(),
  orderId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

// POST create review
async function createReview(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = createReviewSchema.parse(body);

    // Check if order exists and belongs to user
    const order = await Order.findById(validatedData.orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyer.toString() !== req.user!.userId) {
      return NextResponse.json(
        { error: "Not authorized to review this order" },
        { status: 403 }
      );
    }

    // Check if order is delivered
    if (order.status !== "delivered") {
      return NextResponse.json(
        { error: "Can only review delivered orders" },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user!.userId,
      shoe: validatedData.shoeId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this shoe" },
        { status: 400 }
      );
    }

    // Create review
    const review = await Review.create({
      user: req.user!.userId,
      shoe: validatedData.shoeId,
      order: validatedData.orderId,
      rating: validatedData.rating,
      comment: validatedData.comment,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name profileImage"
    );

    return NextResponse.json(
      {
        success: true,
        message: "Review created successfully",
        review: populatedReview,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create review error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(createReview);
