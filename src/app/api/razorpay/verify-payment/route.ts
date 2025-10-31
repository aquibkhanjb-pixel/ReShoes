import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import { verifyRazorpayPayment, fetchRazorpayPayment } from "@/lib/razorpay";
import { z } from "zod";

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

async function handler(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = verifyPaymentSchema.parse(body);

    // Verify payment signature
    const isValid = await verifyRazorpayPayment(
      validatedData.razorpay_order_id,
      validatedData.razorpay_payment_id,
      validatedData.razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Fetch payment details
    const payment = await fetchRazorpayPayment(
      validatedData.razorpay_payment_id
    );

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      payment: {
        id: payment.id,
        orderId: payment.order_id,
        amount: payment.amount / 100, // Convert from paise to rupees
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
      },
    });
  } catch (error: any) {
    console.error("Verify Razorpay payment error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
