"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending-approval");
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
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
    fetchProducts();
  }, [user, mounted, filter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/products?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProducts(data.shoes);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "approve" }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Product approved successfully!");
        fetchProducts();
      } else {
        alert(data.error || "Failed to approve product");
      }
    } catch (error) {
      console.error("Error approving product:", error);
      alert("Failed to approve product");
    }
  };

  const handleReject = async (productId: string) => {
    const reason = rejectionReason[productId] || "";
    if (!reason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "reject",
          rejectionReason: reason,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Product rejected successfully!");
        setRejectionReason({ ...rejectionReason, [productId]: "" });
        fetchProducts();
      } else {
        alert(data.error || "Failed to reject product");
      }
    } catch (error) {
      console.error("Error rejecting product:", error);
      alert("Failed to reject product");
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
            Admin - Product Management
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/admin">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost">Users</Button>
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
          <h1 className="text-3xl font-bold mb-4">Product Management</h1>
          <div className="flex gap-2">
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
              variant={filter === "" ? "default" : "outline"}
              onClick={() => setFilter("")}
            >
              All Products
            </Button>
          </div>
        </div>

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === "pending-approval" && "Pending Products"}
              {filter === "approved" && "Approved Products"}
              {filter === "rejected" && "Rejected Products"}
              {filter === "" && "All Products"}
            </CardTitle>
            <CardDescription>
              {products.length} product(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : products.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No products found
              </p>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
                  >
                    {/* Product Image */}
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full md:w-32 h-32 object-cover rounded"
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {product.brand} • Size {product.size} • {product.category}
                      </p>
                      <p className="text-sm mt-2">{product.description}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-sm bg-secondary px-2 py-1 rounded capitalize">
                          {product.condition}
                        </span>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            product.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : product.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Seller: {product.seller?.name} ({product.seller?.email})
                      </p>
                      {product.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2">
                          Rejection Reason: {product.rejectionReason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {product.status === "pending-approval" && (
                      <div className="flex flex-col gap-2 md:w-64">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(product._id)}
                          className="w-full"
                        >
                          Approve
                        </Button>
                        <Input
                          placeholder="Rejection reason..."
                          value={rejectionReason[product._id] || ""}
                          onChange={(e) =>
                            setRejectionReason({
                              ...rejectionReason,
                              [product._id]: e.target.value,
                            })
                          }
                          className="text-sm"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(product._id)}
                          className="w-full"
                        >
                          Reject
                        </Button>
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
