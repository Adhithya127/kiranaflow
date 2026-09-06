"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

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

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
].map((s) => ({ value: s, label: s }));

export default function ShopSetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  useEffect(() => {
    fetchExistingShop();
  }, []);

  const fetchExistingShop = async () => {
    try {
      const response = await fetch("/api/shop");
      if (response.ok) {
        const shop = await response.json();
        if (shop) {
          setName(shop.name || "");
          setDescription(shop.description || "");
          setCategory(shop.category || "");
          setPhone(shop.phone || "");
          setAddress(shop.address || "");
          setCity(shop.city || "");
          setState(shop.state || "");
          setPincode(shop.pincode || "");
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
    setIsSaving(true);

    try {
      const method = "POST";
      const response = await fetch("/api/shop", {
        method,
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save shop");
        return;
      }

      router.push("/dashboard/shop");
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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Set Up Your Shop</h1>
        <p className="text-gray-600 mt-1">
          Tell us about your shop to create your online presence
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Shop Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Adithya General Stores"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your shop..."
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
            placeholder="9876543210"
          />

          <Textarea
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Shop address"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Hyderabad"
            />
            <Select
              label="State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              options={indianStates}
              placeholder="Select state"
            />
          </div>

          <Input
            label="Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g., 500001"
            maxLength={6}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Shop
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
