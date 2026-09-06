"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Store, ShoppingCart, Plus, Minus, Search, MapPin, Phone, Package } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { useCartStore } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  mrp: number | null;
  unit: string;
  stock: number;
  image: string | null;
  isAvailable: boolean;
  category: {
    id: string;
    name: string;
  } | null;
}

interface ShopData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  logo: string | null;
  banner: string | null;
  isOpen: boolean;
}

export default function ShopPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [shop, setShop] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { items, addItem, removeItem, updateQuantity } = useCartStore();
  const shopId = useCartStore((s) => s.shopId);

  useEffect(() => {
    fetchShopData();
  }, [slug]);

  const fetchShopData = async () => {
    try {
      const shopResponse = await fetch(`/api/shops/by-slug?slug=${slug}`);
      if (!shopResponse.ok) {
        setIsLoading(false);
        return;
      }
      const shopData = await shopResponse.json();
      setShop(shopData);

      const productsResponse = await fetch(
        `/api/products?shop=${slug}`
      );
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData);

        const categoryMap = new Map<string, string>();
        productsData.forEach((p: Product) => {
          if (p.category) {
            categoryMap.set(p.category.id, p.category.name);
          }
        });
        setCategories(
          Array.from(categoryMap.entries()).map(([id, name]) => ({ id, name }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch shop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category?.id === selectedCategory;
    const matchesSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.id === productId);
    return item?.quantity || 0;
  };

  const handleAddToCart = (product: Product) => {
    if (!shop) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        image: product.image,
      },
      shop.id,
      shop.name
    );
  };

  if (isLoading) {
    return (
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          </div>
        </div>
      </Providers>
    );
  }

  if (!shop) {
    return (
      <Providers>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex flex-col items-center justify-center h-96">
            <Store className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Shop not found
            </h2>
            <p className="text-gray-500">
              This shop may not exist or is currently closed.
            </p>
          </div>
        </div>
      </Providers>
    );
  }

  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                ) : (
                  <Store className="w-10 h-10 text-emerald-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{shop.name}</h1>
                {shop.description && (
                  <p className="text-gray-600 mt-1 max-w-2xl">{shop.description}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {shop.category && (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                      {shop.category}
                    </span>
                  )}
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
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {products.length === 0
                  ? "No products yet"
                  : "No products match your search"}
              </h3>
              <p className="text-gray-500">
                {products.length === 0
                  ? "This shop hasn't added any products yet"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold bg-red-600 px-3 py-1 rounded-full text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {product.category && (
                      <span className="text-xs text-emerald-600 font-medium">
                        {product.category.name}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 mt-1">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-sm text-gray-500">
                          /{product.unit}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            {formatCurrency(product.mrp)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      {getItemQuantity(product.id) > 0 &&
                      shopId === shop.id ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                const qty = getItemQuantity(product.id);
                                if (qty === 1) {
                                  removeItem(product.id);
                                } else {
                                  updateQuantity(product.id, qty - 1);
                                }
                              }}
                              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {getItemQuantity(product.id)}
                            </span>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <Link
                            href="/cart"
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            View Cart
                          </Link>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="w-full bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Providers>
  );
}
