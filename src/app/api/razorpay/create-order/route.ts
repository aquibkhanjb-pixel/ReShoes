import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import { createRazorpayOrder } from "@/lib/razorpay";
import Shoe from "@/models/Shoe";
import { z } from "zod";

const createOrderSchema = z.object({
  shoeId: z.string(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

    // Get shoe details
    const shoe = await Shoe.findById(validatedData.shoeId);

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    if (shoe.status !== "approved") {
      return NextResponse.json(
        { error: "Shoe is not available" },
        { status: 400 }
      );
    }

    // Cannot buy own shoe
    if (shoe.seller.toString() === req.user!.userId) {
      return NextResponse.json(
        { error: "Cannot buy your own shoe" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount: shoe.price,
      currency: "INR",
      receipt: `shoe_${shoe._id}`,
      notes: {
        shoeId: String(shoe._id),
        userId: req.user!.userId,
        shoeTitle: shoe.title,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: shoe.price,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Create Razorpay order error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create Razorpay order" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
