"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Mail, MapPin, IndianRupee, ShoppingCart, Package } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  orders: Order[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-orange-100 text-orange-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-yellow-100 text-yellow-700",
  ready: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        setCustomer(await res.json());
      }
    } catch {
      console.error("Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Customer Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {customer.phone}</div>
          {customer.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {customer.email}</div>}
          {customer.address && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> {customer.address}</div>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1"><ShoppingCart className="w-4 h-4" /> {customer.totalOrders}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-bold text-green-600 flex items-center justify-center gap-1"><IndianRupee className="w-4 h-4" /> {customer.totalSpent.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Customer Since</p>
            <p className="text-sm font-semibold text-gray-900">{new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Purchase History</h2>
        {customer.orders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {customer.orders.map((order) => (
              <div key={order.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-mono text-sm font-semibold text-gray-900">#{order.orderNumber}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">₹{order.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {order.items.map((item) => (
                    <span key={item.id} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      <Package className="w-3 h-3" /> {item.product.name} × {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
