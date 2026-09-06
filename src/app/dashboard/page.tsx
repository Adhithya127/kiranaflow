"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, Package, ShoppingCart, TrendingUp } from "lucide-react";

interface DashboardStats {
  productCount: number;
  orderCount: number;
  totalRevenue: number;
  newOrders: number;
  shopName: string | null;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    productCount: 0,
    orderCount: 0,
    totalRevenue: 0,
    newOrders: 0,
    shopName: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || "Shopkeeper"}
        </h1>
        <p className="text-gray-600 mt-1">
          {stats.shopName
            ? `Managing ${stats.shopName}`
            : "Set up your shop to get started"}
        </p>
      </div>

      {!stats.shopName && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-900">
                Set up your shop
              </h3>
              <p className="text-emerald-700 mt-1">
                Create your shop profile to start selling online. Add your shop
                name, description, and details.
              </p>
              <Link
                href="/dashboard/shop/setup"
                className="inline-block mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Set Up Shop
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<Package className="w-6 h-6" />}
          label="Products"
          value={stats.productCount.toString()}
          color="blue"
        />
        <StatsCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="Total Orders"
          value={stats.orderCount.toString()}
          color="purple"
        />
        <StatsCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          color="green"
        />
        <StatsCard
          icon={<ShoppingCart className="w-6 h-6" />}
          label="New Orders"
          value={stats.newOrders.toString()}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/products/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-500">Add a new product to your catalog</p>
              </div>
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Orders</p>
                <p className="text-sm text-gray-500">Check and manage incoming orders</p>
              </div>
            </Link>
            {stats.shopName && (
              <Link
                href={`/shops/${stats.shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                target="_blank"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Storefront</p>
                  <p className="text-sm text-gray-500">See how your shop looks to customers</p>
                </div>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          {stats.orderCount === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Orders will appear here once customers start placing them
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              View all orders in the Orders section
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
