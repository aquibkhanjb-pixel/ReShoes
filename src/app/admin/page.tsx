"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchAnalytics();
    fetchSettings();
  }, [user, mounted]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
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
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
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
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.users.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.users.customers || 0} customers •{" "}
                {analytics?.users.sellers || 0} sellers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.shoes.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.shoes.available || 0} available •{" "}
                {analytics?.shoes.sold || 0} sold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.orders.total || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics?.orders.pending || 0} pending •{" "}
                {analytics?.orders.delivered || 0} delivered
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(analytics?.financial.totalRevenue || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatPrice(analytics?.financial.totalCommission || 0)}{" "}
                commission earned
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Platform earnings and payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Commission Earned
                </span>
                <span className="font-semibold">
                  {formatPrice(analytics?.financial.totalCommission || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Seller Earnings
                </span>
                <span className="font-semibold">
                  {formatPrice(analytics?.financial.totalSellerEarnings || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Pending Payouts
                </span>
                <span className="font-semibold text-orange-600">
                  {formatPrice(analytics?.financial.pendingPayouts || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm font-medium">Commission Rate</span>
                <span className="font-semibold">
                  {settings?.commissionRate || 10}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Sellers</CardTitle>
              <CardDescription>Best performing sellers</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics?.topSellers && analytics.topSellers.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topSellers.slice(0, 5).map((seller: any, index: number) => (
                    <div key={seller._id} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{seller.seller.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {seller.orderCount} sales
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(seller.totalSales)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(seller.totalEarnings)} earned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No sales data yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {analytics.recentOrders.map((order: any) => (
                  <div
                    key={order._id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {order.shoe?.images?.[0] && (
                      <img
                        src={order.shoe.images[0]}
                        alt={order.shoe.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{order.shoe?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Buyer: {order.buyer?.name} • Seller: {order.seller?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(order.amount)}
                      </p>
                      <p
                        className={`text-sm ${
                          order.status === "delivered"
                            ? "text-green-600"
                            : order.status === "pending"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No orders yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 flex gap-4 flex-wrap">
          <Link href="/admin/users">
            <Button>Manage Users</Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline">Manage Products</Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline">Platform Settings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
