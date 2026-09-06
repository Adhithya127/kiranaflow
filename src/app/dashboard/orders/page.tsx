"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    unit: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  total: number;
  notes: string | null;
  deliveryAddress: string | null;
  deliveryPhone: string | null;
  createdAt: string;
  customer: {
    name: string;
    phone: string;
    email: string | null;
  };
  items: OrderItem[];
}

const statusOptions = [
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setOrders(
          orders.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {newOrdersCount > 0 && (
            <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
              {newOrdersCount} new
            </span>
          )}
        </div>
        <p className="text-gray-600 mt-1">
          Manage incoming customer orders
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse"
            >
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/6" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500">
            Orders will appear here when customers place them
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() =>
                  setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )
                }
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{order.customer.name}</span>
                        <span>{order.customer.phone}</span>
                        <span>
                          {new Date(order.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} items
                      </p>
                    </div>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Order Items
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-600">
                              {item.product.name} x {item.quantity}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(item.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                      {order.notes && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-500 font-medium">
                            Notes:
                          </p>
                          <p className="text-sm text-gray-700">{order.notes}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Customer Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-500">Name: </span>
                          {order.customer.name}
                        </p>
                        <p>
                          <span className="text-gray-500">Phone: </span>
                          {order.customer.phone}
                        </p>
                        {order.customer.email && (
                          <p>
                            <span className="text-gray-500">Email: </span>
                            {order.customer.email}
                          </p>
                        )}
                        {order.deliveryAddress && (
                          <p>
                            <span className="text-gray-500">Address: </span>
                            {order.deliveryAddress}
                          </p>
                        )}
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Update Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.map((status) => (
                            <Button
                              key={status.value}
                              size="sm"
                              variant={
                                order.status === status.value
                                  ? "primary"
                                  : "outline"
                              }
                              onClick={() =>
                                updateStatus(order.id, status.value)
                              }
                              isLoading={updatingStatus === order.id}
                              disabled={
                                order.status === status.value ||
                                updatingStatus === order.id
                              }
                            >
                              {status.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
