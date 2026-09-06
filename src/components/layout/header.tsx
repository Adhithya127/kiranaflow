"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Store } from "lucide-react";
import { useCartStore } from "@/store/cart";

export function Header() {
  const { data: session } = useSession();
  const itemCount = useCartStore((s) => s.getItemCount());
  const shopName = useCartStore((s) => s.shopName);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-600" />
            <span className="text-xl font-bold text-gray-900">KiranaFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/shops"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Browse Shops
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {shopName && (
              <span className="hidden sm:inline text-sm text-gray-500">
                Shopping from: <span className="font-medium text-gray-900">{shopName}</span>
              </span>
            )}
            
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {session.user.name || "Dashboard"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
