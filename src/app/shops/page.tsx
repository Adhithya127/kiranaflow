"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  logo: string | null;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await fetch("/api/shops/public");
      if (response.ok) {
        const data = await response.json();
        setShops(data);
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Browse Shops</h1>
            <p className="text-gray-600 mt-2">
              Discover local businesses in your area
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-16">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No shops yet
              </h3>
              <p className="text-gray-500">
                Be the first shop owner to join KiranaFlow
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/shops/${shop.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Store className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {shop.name}
                  </h3>
                  {shop.category && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full mb-2">
                      {shop.category}
                    </span>
                  )}
                  {shop.description && (
                    <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                      {shop.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {(shop.address || shop.city) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {shop.city || shop.address}
                      </span>
                    )}
                    {shop.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {shop.phone}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </Providers>
  );
}
