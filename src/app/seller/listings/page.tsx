"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function SellerListingsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [shoes, setShoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user || user.role !== "seller") {
      router.push("/login");
      return;
    }
    fetchShoes();
  }, [user, mounted, filter]);

  const fetchShoes = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/seller/products?sort=-createdAt", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // API already filters by seller
        let sellerShoes = data.shoes;

        // Apply status filter
        if (filter !== "all") {
          sellerShoes = sellerShoes.filter((shoe: any) => shoe.status === filter);
        }

        setShoes(sellerShoes);
      }
    } catch (error) {
      console.error("Error fetching shoes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/seller" className="text-2xl font-bold text-primary">
            ReShoe - Seller
          </Link>
          <div className="flex gap-4">
            <Link href="/seller">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">All Listings</h1>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "pending-approval" ? "default" : "outline"}
            onClick={() => setFilter("pending-approval")}
          >
            Pending Approval
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
          >
            Approved
          </Button>
          <Button
            variant={filter === "rejected" ? "default" : "outline"}
            onClick={() => setFilter("rejected")}
          >
            Rejected
          </Button>
          <Button
            variant={filter === "sold" ? "default" : "outline"}
            onClick={() => setFilter("sold")}
          >
            Sold
          </Button>
        </div>

        {/* Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Products ({shoes.length})</CardTitle>
            <CardDescription>Manage all your shoe listings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : shoes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No listings found</p>
                <Link href="/seller/add-product">
                  <Button>List Your First Shoe</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {shoes.map((shoe: any) => (
                  <div
                    key={shoe._id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
                  >
                    {shoe.images?.[0] && (
                      <img
                        src={shoe.images[0]}
                        alt={shoe.title}
                        className="w-full md:w-32 h-32 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{shoe.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {shoe.brand} • Size {shoe.size} • {shoe.category}
                      </p>
                      <p className="text-sm mt-2 line-clamp-2">{shoe.description}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(shoe.price)}
                        </span>
                        <span className="text-sm bg-secondary px-2 py-1 rounded capitalize">
                          {shoe.condition}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                      <span
                        className={`text-sm px-3 py-1 rounded ${
                          shoe.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : shoe.status === "pending-approval"
                            ? "bg-yellow-100 text-yellow-700"
                            : shoe.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {shoe.status === "pending-approval"
                          ? "Pending Approval"
                          : shoe.status === "approved"
                          ? "Approved"
                          : shoe.status === "rejected"
                          ? "Rejected"
                          : shoe.status}
                      </span>
                      {shoe.rejectionReason && (
                        <p className="text-xs text-red-600 mt-2 max-w-xs text-right">
                          Reason: {shoe.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Views: {shoe.views || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
