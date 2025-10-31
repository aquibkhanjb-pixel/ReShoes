"use client";

import { useRouter } from "next/navigation";
import { User, LogOut, ShoppingBag, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { clearCart } = useCartStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    clearCart();
    router.push("/login");
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case "admin":
        return "/admin";
      case "seller":
        return "/seller";
      case "customer":
        return "/customer/orders";
      default:
        return "/";
    }
  };

  const getDashboardLabel = () => {
    switch (user.role) {
      case "admin":
        return "Admin Dashboard";
      case "seller":
        return "Seller Dashboard";
      case "customer":
        return "My Orders";
      default:
        return "Dashboard";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
          )}
          <span className="hidden md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground capitalize mt-1">
              Role: {user.role}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>{getDashboardLabel()}</span>
        </DropdownMenuItem>
        {user.role === "customer" && (
          <DropdownMenuItem onClick={() => router.push("/cart")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>My Cart</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
