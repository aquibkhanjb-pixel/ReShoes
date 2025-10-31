"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function SellerDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [shoes, setShoes] = useState([]);
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    soldShoes: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
  });
  const [loading, setLoading] = useState(true);
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
    fetchDashboardData();
  }, [user, mounted]);

  const fetchDashboardData = async () => {
    try {
      // Fetch seller's shoes (all statuses)
      const shoesRes = await fetch("/api/seller/products?sort=-createdAt", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const shoesData = await shoesRes.json();

      // Fetch seller's orders
      const ordersRes = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const ordersData = await ordersRes.json();

      // Fetch transactions
      const transactionsRes = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const transactionsData = await transactionsRes.json();

      if (shoesData.success) {
        // API already filters by seller, no need to filter again
        setShoes(shoesData.shoes);

        setStats({
          totalListings: shoesData.shoes.length,
          soldShoes: shoesData.shoes.filter((s: any) => s.status === "sold").length,
          totalEarnings: transactionsData.totals?.totalSellerEarnings || 0,
          pendingPayouts: transactionsData.totals?.totalSellerEarnings || 0,
        });
      }

      if (ordersData.success) {
        setSales(ordersData.orders);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
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
          <h1 className="text-2xl font-bold text-primary">Seller Dashboard</h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Rejection Notification */}
        {shoes.filter((s: any) => s.status === "rejected").length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900">
                  {shoes.filter((s: any) => s.status === "rejected").length} Product
                  {shoes.filter((s: any) => s.status === "rejected").length > 1 ? "s" : ""} Rejected
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  Some of your products have been rejected by admin. Please review the rejection reasons below and resubmit with corrections.
                </p>
                <Link href="/seller/listings?filter=rejected">
                  <Button size="sm" variant="outline" className="mt-3 border-red-300 text-red-700 hover:bg-red-100">
                    View Rejected Products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pending Approval Notification */}
        {shoes.filter((s: any) => s.status === "pending-approval").length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏳</span>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">
                  {shoes.filter((s: any) => s.status === "pending-approval").length} Product
                  {shoes.filter((s: any) => s.status === "pending-approval").length > 1 ? "s" : ""} Pending Approval
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your products are waiting for admin approval. You'll be notified once they're reviewed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalListings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sold Shoes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.soldShoes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.totalEarnings)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(stats.pendingPayouts)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/seller/add-product">
            <Button size="lg">List New Shoe</Button>
          </Link>
          <Link href="/seller/listings">
            <Button size="lg" variant="outline">
              View All Listings
            </Button>
          </Link>
          <Link href="/seller/transactions">
            <Button size="lg" variant="outline">
              View Transactions
            </Button>
          </Link>
        </div>

        {/* Recent Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Your Listings</CardTitle>
            <CardDescription>Manage your shoe listings</CardDescription>
          </CardHeader>
          <CardContent>
            {shoes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No listings yet. Start by listing your first shoe!
              </p>
            ) : (
              <div className="space-y-4">
                {shoes.slice(0, 5).map((shoe: any) => (
                  <div
                    key={shoe._id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <img
                      src={shoe.images[0]}
                      alt={shoe.title}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{shoe.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {shoe.brand} • Size {shoe.size}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(shoe.price)}</p>
                      <p
                        className={`text-sm ${
                          shoe.status === "approved"
                            ? "text-green-600"
                            : shoe.status === "pending-approval"
                            ? "text-yellow-600"
                            : shoe.status === "rejected"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}
                      >
                        {shoe.status === "pending-approval"
                          ? "Pending Approval"
                          : shoe.status === "approved"
                          ? "Approved"
                          : shoe.status === "rejected"
                          ? "Rejected"
                          : shoe.status}
                      </p>
                      {shoe.rejectionReason && (
                        <p className="text-xs text-red-600 mt-1 max-w-xs">
                          Reason: {shoe.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
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
