import { NextRequest, NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/api-middleware";
import Cart from "@/models/Cart";

// DELETE remove item from cart
async function removeFromCart(
  req: AuthenticatedRequest,
  { params }: { params: { shoeId: string } }
) {
  try {
    const { shoeId } = params;

    const cart = await Cart.findOne({ user: req.user!.userId });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // Remove item from cart
    cart.items = cart.items.filter(
      (item: any) => item.shoe.toString() !== shoeId
    );

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
      message: "Item removed from cart",
      cart: {
        _id: cart._id,
        items: cart.items,
        itemCount: cart.items.length,
      },
    });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(removeFromCart);
