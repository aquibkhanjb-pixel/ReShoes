import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Cart from "@/models/Cart";
import Shoe from "@/models/Shoe";
import { z } from "zod";

const addToCartSchema = z.object({
  shoeId: z.string(),
});

// GET user's cart
async function getCart(req: AuthenticatedRequest) {
  try {
    let cart = await Cart.findOne({ user: req.user!.userId }).populate({
      path: "items.shoe",
      populate: {
        path: "seller",
        select: "name email",
      },
    });

    if (!cart) {
      // Create empty cart if doesn't exist
      cart = await Cart.create({
        user: req.user!.userId,
        items: [],
      });
    }

    // Filter out items where shoe is null (deleted shoes)
    const validItems = cart.items.filter((item: any) => item.shoe !== null);

    return NextResponse.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validItems,
        itemCount: validItems.length,
      },
    });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

// POST add item to cart
async function addToCart(req: AuthenticatedRequest) {
  try {
    const body = await req.json();
    const validatedData = addToCartSchema.parse(body);

    // Check if shoe exists and is available
    const shoe = await Shoe.findById(validatedData.shoeId);

    if (!shoe) {
      return NextResponse.json({ error: "Shoe not found" }, { status: 404 });
    }

    if (shoe.status !== "approved") {
      return NextResponse.json(
        { error: "Shoe is not available for purchase" },
        { status: 400 }
      );
    }

    // Cannot add own shoe to cart
    if (shoe.seller.toString() === req.user!.userId) {
      return NextResponse.json(
        { error: "Cannot add your own shoe to cart" },
        { status: 400 }
      );
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user!.userId });

    if (!cart) {
      cart = await Cart.create({
        user: req.user!.userId,
        items: [],
      });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item: any) => item.shoe.toString() === validatedData.shoeId
    );

    if (existingItem) {
      return NextResponse.json(
        { error: "Item already in cart" },
        { status: 400 }
      );
    }

    // Add item to cart
    cart.items.push({
      shoe: shoe._id as any,
      addedAt: new Date(),
    });

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: "items.shoe",
      populate: {
        path: "seller",
        select: "name email",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Item added to cart",
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.items.length,
      },
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(getCart);
export const POST = withAuth(addToCart);
