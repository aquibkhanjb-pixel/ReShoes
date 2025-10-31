"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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
    fetchUsers();
  }, [user, mounted, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?role=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
          <Link href="/admin" className="text-2xl font-bold text-primary">
            Admin - User Management
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/admin">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="ghost">Products</Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="ghost">Settings</Button>
            </Link>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">User Management</h1>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All Users
            </Button>
            <Button
              variant={filter === "seller" ? "default" : "outline"}
              onClick={() => setFilter("seller")}
            >
              Sellers
            </Button>
            <Button
              variant={filter === "customer" ? "default" : "outline"}
              onClick={() => setFilter("customer")}
            >
              Customers
            </Button>
            <Button
              variant={filter === "admin" ? "default" : "outline"}
              onClick={() => setFilter("admin")}
            >
              Admins
            </Button>
          </div>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "all" && "All Users"}
              {filter === "seller" && "Sellers"}
              {filter === "customer" && "Customers"}
              {filter === "admin" && "Administrators"}
            </CardTitle>
            <CardDescription>{users.length} user(s) found</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No users found
              </p>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    {/* User Avatar */}
                    {u.profileImage ? (
                      <img
                        src={u.profileImage}
                        alt={u.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-primary">
                          {u.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* User Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{u.name}</h3>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                          {u.role}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Joined: {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* User Stats */}
                    {u.stats && (
                      <div className="text-right">
                        {u.role === "seller" && (
                          <>
                            <p className="text-sm font-semibold">
                              {u.stats.totalListings} Listings
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {u.stats.totalSales} Sales
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(u.stats.totalRevenue)} Revenue
                            </p>
                          </>
                        )}
                        {u.role === "customer" && (
                          <>
                            <p className="text-sm font-semibold">
                              {u.stats.totalOrders} Orders
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {formatPrice(u.stats.totalSpent)} Spent
                            </p>
                          </>
                        )}
                      </div>
                    )}
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
