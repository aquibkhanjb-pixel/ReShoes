"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { UserMenu } from "@/components/UserMenu";

interface Shoe {
  _id: string;
  title: string;
  brand: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  size: number;
}

export default function BrowsePage() {
  const { isAuthenticated, token } = useAuthStore();
  const { itemCount, setItems } = useCartStore();
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchShoes();
  }, [category, search]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
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
    }
  };

  const fetchShoes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);

      const response = await fetch(`/api/shoes?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setShoes(data.shoes);
      }
    } catch (error) {
      console.error("Error fetching shoes:", error);
    } finally {
      setLoading(false);
    }
  };

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
            {isAuthenticated && (
              <Link href="/cart">
                <Button variant="ghost">Cart ({itemCount})</Button>
              </Link>
            )}
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-6">Browse Shoes</h1>

          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search shoes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={category === "" ? "default" : "outline"}
              onClick={() => setCategory("")}
            >
              All
            </Button>
            <Button
              variant={category === "men" ? "default" : "outline"}
              onClick={() => setCategory("men")}
            >
              Men
            </Button>
            <Button
              variant={category === "women" ? "default" : "outline"}
              onClick={() => setCategory("women")}
            >
              Women
            </Button>
            <Button
              variant={category === "unisex" ? "default" : "outline"}
              onClick={() => setCategory("unisex")}
            >
              Unisex
            </Button>
            <Button
              variant={category === "kids" ? "default" : "outline"}
              onClick={() => setCategory("kids")}
            >
              Kids
            </Button>
          </div>
        </div>

        {/* Shoes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 mb-2"></div>
                  <div className="h-4 bg-gray-200 w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shoes.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No shoes found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {shoes.map((shoe) => (
              <Link href={`/shoes/${shoe._id}`} key={shoe._id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
                    {shoe.images[0] && (
                      <img
                        src={shoe.images[0]}
                        alt={shoe.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {shoe.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {shoe.brand} • Size {shoe.size}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(shoe.price)}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                        {shoe.condition}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
