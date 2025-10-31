"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

interface Shoe {
  _id: string;
  title: string;
  brand: string;
  price: number;
  images: string[];
  condition: string;
  category: string;
  size: number;
  description: string;
  status: string;
  seller: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
}

export default function ShoeDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [shoe, setShoe] = useState<Shoe | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchShoe();
    }
  }, [params.id]);

  const fetchShoe = async () => {
    try {
      const response = await fetch(`/api/shoes/${params.id}`);
      const data = await response.json();
      if (data.success) {
        setShoe(data.shoe);
      }
    } catch (error) {
      console.error("Error fetching shoe:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    // TODO: Implement Razorpay checkout
    alert("Razorpay payment integration coming soon! Add your Razorpay keys to .env.local");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Shoe not found</h2>
          <Link href="/browse">
            <Button>Browse Shoes</Button>
          </Link>
        </div>
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
            {isAuthenticated ? (
              <Link href={user?.role === "seller" ? "/seller" : "/admin"}>
                <Button variant="outline">Dashboard</Button>
              </Link>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {shoe.images[selectedImage] && (
                <img
                  src={shoe.images[selectedImage]}
                  alt={shoe.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {shoe.images.length > 1 && (
              <div className="flex gap-2">
                {shoe.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded border-2 overflow-hidden ${
                      selectedImage === idx
                        ? "border-primary"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${shoe.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="text-4xl font-bold mb-2">{shoe.title}</h1>
            <p className="text-xl text-muted-foreground mb-4">{shoe.brand}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(shoe.price)}
              </span>
              <span className="bg-secondary px-3 py-1 rounded capitalize">
                {shoe.condition}
              </span>
              {shoe.status === "sold" && (
                <span className="bg-red-500 text-white px-3 py-1 rounded">
                  Sold
                </span>
              )}
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Size</p>
                    <p className="font-semibold">{shoe.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-semibold capitalize">{shoe.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-semibold capitalize">{shoe.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold capitalize">{shoe.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{shoe.description}</p>
            </div>

            {shoe.seller && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-3">Seller Information</h2>
                  <div className="flex items-center gap-4">
                    {shoe.seller.profileImage ? (
                      <img
                        src={shoe.seller.profileImage}
                        alt={shoe.seller.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {shoe.seller.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-lg">{shoe.seller.name}</p>
                      <p className="text-sm text-muted-foreground">{shoe.seller.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-4">
              {shoe.status === "available" ? (
                <>
                  <Button size="lg" className="flex-1" onClick={handleBuyNow}>
                    Buy Now
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1">
                    Add to Cart
                  </Button>
                </>
              ) : (
                <Button size="lg" className="flex-1" disabled>
                  Not Available
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
