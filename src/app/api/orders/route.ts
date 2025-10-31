import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Order from "@/models/Order";
import Shoe from "@/models/Shoe";
import Transaction from "@/models/Transaction";
import Settings from "@/models/Settings";
import { getSellerEarnings, calculateCommission } from "@/lib/utils";
import { z } from "zod";

const createOrderSchema = z.object({
  shoeId: z.string(),
  paymentId: z.string(),
  shippingAddress: z.object({
    fullName: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
});

// GET user orders
async function getOrders(req: AuthenticatedRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const skip = (page - 1) * limit;

    const filter: any = {};

    // Show orders based on role
    if (req.user!.role === "customer") {
      filter.buyer = req.user!.userId;
    } else if (req.user!.role === "seller") {
      filter.seller = req.user!.userId;
    }
    // Admin can see all orders

    if (status) {
      filter.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("buyer", "name email")
        .populate("seller", "name email")
        .populate("shoe")
        .sort("-createdAt")
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST create new order
async function createOrder(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

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

    // Get commission rate from settings
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ commissionRate: 10 });
    }

    // Create order
    const order = await Order.create({
      buyer: req.user!.userId,
      shoe: shoe._id,
      seller: shoe.seller,
      paymentId: validatedData.paymentId,
      amount: shoe.price,
      shippingAddress: validatedData.shippingAddress,
      status: "pending",
    });

    // Update shoe status
    shoe.status = "sold";
    await shoe.save();

    // Create transaction
    const commission = calculateCommission(shoe.price, settings.commissionRate);
    const sellerEarnings = getSellerEarnings(shoe.price, settings.commissionRate);

    await Transaction.create({
      seller: shoe.seller,
      order: order._id,
      amount: shoe.price,
      commission,
      commissionRate: settings.commissionRate,
      sellerEarnings,
      payoutStatus: "pending",
    });

    const populatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("shoe");

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        order: populatedOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create order error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrders);
export const POST = withAuth(createOrder);
