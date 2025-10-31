"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, CartItem } from "@/store/cartStore";
import { Trash2, ShoppingBag } from "lucide-react";
import { UserMenu } from "@/components/UserMenu";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();
  const { items, setItems, removeItemFromStore, itemCount } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setItems(data.cart.items || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (shoeId: string) => {
    setRemoving(shoeId);
    try {
      const response = await fetch(`/api/cart/${shoeId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        removeItemFromStore(shoeId);
      } else {
        alert(data.error || "Failed to remove item from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item from cart");
    } finally {
      setRemoving(null);
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.shoe.price, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            ReShoe
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/cart">
              <Button variant="ghost">
                Cart ({itemCount})
              </Button>
            </Link>
            <UserMenu />
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="h-8 w-8" />
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <span className="text-muted-foreground">({itemCount} items)</span>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">
                Add some shoes to get started!
              </p>
              <Link href="/browse">
                <Button size="lg">Browse Shoes</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item._id}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link href={`/shoes/${item.shoe._id}`}>
                        <div className="w-32 h-32 bg-gray-100 rounded overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition">
                          {item.shoe.images[0] && (
                            <img
                              src={item.shoe.images[0]}
                              alt={item.shoe.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex-1">
                        <Link href={`/shoes/${item.shoe._id}`}>
                          <h3 className="text-xl font-semibold mb-1 hover:text-primary cursor-pointer">
                            {item.shoe.title}
                          </h3>
                        </Link>
                        <p className="text-muted-foreground mb-2">
                          {item.shoe.brand}
                        </p>
                        <div className="flex gap-4 text-sm mb-3">
                          <span className="capitalize">
                            Size: {item.shoe.size}
                          </span>
                          <span className="capitalize">
                            Condition: {item.shoe.condition}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Seller: {item.shoe.seller.name}
                        </p>
                      </div>

                      {/* Price and Actions */}
                      <div className="flex flex-col items-end justify-between">
                        <p className="text-2xl font-bold text-primary">
                          {formatPrice(item.shoe.price)}
                        </p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemove(item.shoe._id)}
                          disabled={removing === item.shoe._id}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {removing === item.shoe._id ? "Removing..." : "Remove"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Subtotal ({itemCount} items)
                      </span>
                      <span className="font-semibold">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">Calculated at checkout</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full mb-3" size="lg" disabled>
                    Proceed to Checkout
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Note: Currently, you can only buy shoes individually from the shoe details page.
                  </p>

                  <Link href="/browse">
                    <Button variant="outline" className="w-full mt-3">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
