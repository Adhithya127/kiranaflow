"use client";

import Link from "next/link";
import { Store, Package, ShoppingCart, BarChart3, Sparkles } from "lucide-react";
import { Providers } from "@/components/providers";

export default function HomePage() {
  return (
    <Providers>
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Store className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">KiranaFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/shops"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Browse Shops
              </Link>
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Start Your Shop
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Retail Operating System
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                Run Your Shop
                <br />
                <span className="text-emerald-600">Smarter, Not Harder</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                The operating system for local businesses in India. Manage inventory,
                understand sales, delight customers, and let AI help you make
                better business decisions.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Start Free
                </Link>
                <Link
                  href="/shops"
                  className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Browse Shops
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Everything Your Shop Needs
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From digital storefront to intelligent business insights, KiranaFlow
                grows with your business.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Store className="w-6 h-6" />}
                title="Digital Storefront"
                description="Create your online presence. Let customers browse your products and place orders anytime."
              />
              <FeatureCard
                icon={<Package className="w-6 h-6" />}
                title="Product Management"
                description="Easy product catalog with categories, pricing, and stock tracking. Add products in seconds."
              />
              <FeatureCard
                icon={<ShoppingCart className="w-6 h-6" />}
                title="Order Management"
                description="Receive orders, track status, and manage fulfillment all from one dashboard."
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Business Insights"
                description="Understand what's selling, what's not, and make data-driven decisions for your shop."
              />
              <FeatureCard
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
                title="Fast & Mobile"
                description="Works beautifully on your phone. Manage your shop on the go."
              />
              <FeatureCard
                icon={<Sparkles className="w-6 h-6" />}
                title="AI-Powered"
                description="Smart recommendations, demand forecasting, and automated insights coming soon."
              />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Shop?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of shop owners who are already using KiranaFlow.
            </p>
            <Link
              href="/register"
              className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-500" />
              <span className="text-lg font-bold text-white">KiranaFlow</span>
            </div>
            <p className="text-sm">
              Built for Indian local businesses
            </p>
          </div>
        </div>
      </footer>
    </div>
    </Providers>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
