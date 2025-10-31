import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Order from "@/models/Order";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
});

// GET single order
async function getOrder(req: AuthenticatedRequest, { params }: RouteContext) {
  try {
    const order = await Order.findById(params.id)
      .populate("buyer", "name email profileImage")
      .populate("seller", "name email profileImage")
      .populate("shoe");

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check authorization
    if (
      req.user!.role !== "admin" &&
      order.buyer.toString() !== req.user!.userId &&
      order.seller.toString() !== req.user!.userId
    ) {
      return NextResponse.json(
        { error: "Not authorized to view this order" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("Get order error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT update order status
async function updateOrder(req: AuthenticatedRequest, { params }: RouteContext) {
  try {
    const order = await Order.findById(params.id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only seller or admin can update order status
    if (
      req.user!.role !== "admin" &&
      order.seller.toString() !== req.user!.userId
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this order" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = updateOrderSchema.parse(body);

    order.status = validatedData.status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .populate("shoe");

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update order error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getOrder);
export const PUT = withAuth(updateOrder);
