import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID) {
  throw new Error("RAZORPAY_KEY_ID is not defined");
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("RAZORPAY_KEY_SECRET is not defined");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export interface RazorpayOrderOptions {
  amount: number; // Amount in currency subunits (e.g., paise for INR)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<any> {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(options.amount * 100), // Convert to paise
      currency: options.currency || "INR",
      receipt: options.receipt || `receipt_${Date.now()}`,
      notes: options.notes || {},
    });

    return order;
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    throw error;
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return generatedSignature === signature;
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return false;
  }
}

export async function fetchRazorpayPayment(paymentId: string): Promise<any> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error("Razorpay fetch payment error:", error);
    throw error;
  }
}

export async function captureRazorpayPayment(
  paymentId: string,
  amount: number,
  currency: string = "INR"
): Promise<any> {
  try {
    const payment = await razorpay.payments.capture(
      paymentId,
      Math.round(amount * 100),
      currency
    );
    return payment;
  } catch (error) {
    console.error("Razorpay capture payment error:", error);
    throw error;
  }
}

export default razorpay;
