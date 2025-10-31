import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Shoe from "@/models/Shoe";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const approveSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

// POST approve or reject product
async function approveProduct(req: AuthenticatedRequest, { params }: RouteContext) {
  try {
    const body = await req.json();
    const { action, rejectionReason } = approveSchema.parse(body);

    const shoe = await Shoe.findById(params.id);

    if (!shoe) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (action === "approve") {
      shoe.status = "approved";
      shoe.approvalStatus = "approved";
      shoe.rejectionReason = "";
    } else {
      shoe.status = "rejected";
      shoe.approvalStatus = "rejected";
      shoe.rejectionReason = rejectionReason || "No reason provided";
    }

    await shoe.save();

    return NextResponse.json({
      success: true,
      message: `Product ${action === "approve" ? "approved" : "rejected"} successfully`,
      shoe,
    });
  } catch (error: any) {
    console.error("Approve product error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export const POST = withAuth(approveProduct, { roles: ["admin"] });
