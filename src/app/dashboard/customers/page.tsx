"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Users, Phone, IndianRupee, ShoppingCart } from "lucide-react";

interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (q?: string) => {
    try {
      const url = q ? `/api/customers?search=${encodeURIComponent(q)}` : "/api/customers";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch {
      console.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchCustomers(search);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Customers who have placed orders at your shop</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
          Search
        </button>
      </form>

      {customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No customers found. Customers appear here after placing orders.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Orders</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/dashboard/customers/${c.id}`} className="font-medium text-gray-900 hover:text-emerald-600">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {c.phone}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                      {c.totalOrders}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
                      {c.totalSpent.toLocaleString("en-IN")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right text-sm text-gray-500">
                    {c.lastOrderDate
                      ? new Date(c.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
