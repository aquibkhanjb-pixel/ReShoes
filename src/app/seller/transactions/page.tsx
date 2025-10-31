"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { formatPrice } from "@/lib/utils";

export default function SellerTransactionsPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>(null);
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
    fetchTransactions();
  }, [user, mounted]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions);
        setTotals(data.totals);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
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
        <h1 className="text-3xl font-bold mb-6">Transactions & Earnings</h1>

        {/* Summary Cards */}
        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatPrice(totals.totalSales || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Platform Commission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatPrice(totals.totalCommission || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Your Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(totals.totalSellerEarnings || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All your sales and earnings breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8">Loading...</p>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No transactions yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Start selling to see your earnings here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction: any) => (
                  <div
                    key={transaction._id}
                    className="flex flex-col md:flex-row gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{transaction.order?.shoe?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Order #{transaction.order?._id?.slice(-8)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()} •{" "}
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </p>
                      {transaction.payoutStatus && (
                        <span
                          className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
                            transaction.payoutStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : transaction.payoutStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          Payout: {transaction.payoutStatus}
                        </span>
                      )}
                    </div>

                    <div className="text-right md:min-w-[200px]">
                      <p className="text-sm text-muted-foreground">Sale Amount</p>
                      <p className="font-semibold">{formatPrice(transaction.amount)}</p>

                      <p className="text-sm text-muted-foreground mt-2">
                        Commission ({transaction.commissionRate}%)
                      </p>
                      <p className="text-sm text-red-600">
                        -{formatPrice(transaction.commissionAmount)}
                      </p>

                      <p className="text-sm text-muted-foreground mt-2">
                        Your Earnings
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(transaction.sellerEarnings)}
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
