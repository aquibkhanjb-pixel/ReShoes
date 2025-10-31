import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import { createPaymentIntent } from "@/lib/stripe";
import Shoe from "@/models/Shoe";
import { z } from "zod";

const createPaymentSchema = z.object({
  shoeId: z.string(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = createPaymentSchema.parse(body);

    // Get shoe details
    const shoe = await Shoe.findById(validatedData.shoeId);

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    if (shoe.status !== "available") {
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

    // Create payment intent
    const paymentIntent = await createPaymentIntent(shoe.price, {
      shoeId: shoe._id.toString(),
      userId: req.user!.userId,
      shoeTitle: shoe.title,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: shoe.price,
    });
  } catch (error: any) {
    console.error("Create payment intent error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
