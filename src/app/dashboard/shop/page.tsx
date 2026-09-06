"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const shopCategories = [
  { value: "general", label: "General Store / Kirana" },
  { value: "grocery", label: "Grocery Store" },
  { value: "medical", label: "Medical / Pharmacy" },
  { value: "cosmetics", label: "Cosmetics Store" },
  { value: "electronics", label: "Electronics / Accessories" },
  { value: "stationery", label: "Stationery Shop" },
  { value: "supermarket", label: "Small Supermarket" },
  { value: "other", label: "Other" },
];

export default function ShopProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [slug, setSlug] = useState("");
  const [shopId, setShopId] = useState("");

  useEffect(() => {
    fetchShop();
  }, []);

  const fetchShop = async () => {
    try {
      const response = await fetch("/api/shop");
      if (response.ok) {
        const shop = await response.json();
        if (shop) {
          setShopId(shop.id);
          setSlug(shop.slug);
          setName(shop.name || "");
          setDescription(shop.description || "");
          setCategory(shop.category || "");
          setPhone(shop.phone || "");
          setAddress(shop.address || "");
          setCity(shop.city || "");
          setState(shop.state || "");
          setPincode(shop.pincode || "");
          setIsOpen(shop.isOpen);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shop:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          phone,
          address,
          city,
          state,
          pincode,
          isOpen,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save shop");
        return;
      }

      setSuccess("Shop updated successfully");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (!shopId) {
    router.push("/dashboard/shop/setup");
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shop Profile</h1>
          <p className="text-gray-600 mt-1">Manage your shop details</p>
        </div>
        <Link
          href={`/shops/${slug}`}
          target="_blank"
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View Storefront
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              Shop Status
            </label>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isOpen ? "bg-emerald-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isOpen ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-gray-500">
              {isOpen ? "Open for orders" : "Closed"}
            </span>
          </div>

          <Input
            label="Shop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Select
            label="Shop Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={shopCategories}
            placeholder="Select category"
          />

          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Textarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>

          <Input
            label="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
          />

          <div className="flex gap-4 pt-4">
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
