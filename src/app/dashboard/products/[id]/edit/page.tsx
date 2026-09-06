"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const units = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "Kilogram" },
  { value: "gram", label: "Gram" },
  { value: "litre", label: "Litre" },
  { value: "packet", label: "Packet" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" },
  { value: "strip", label: "Strip" },
  { value: "dozen", label: "Dozen" },
];

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [mrp, setMrp] = useState("");
  const [unit, setUnit] = useState("piece");
  const [stock, setStock] = useState("0");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState("");
  const [sku, setSku] = useState("");

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (response.ok) {
        const product = await response.json();
        setName(product.name || "");
        setDescription(product.description || "");
        setPrice(product.price?.toString() || "");
        setMrp(product.mrp?.toString() || "");
        setUnit(product.unit || "piece");
        setStock(product.stock?.toString() || "0");
        setCategoryId(product.categoryId || "");
        setImage(product.image || "");
        setSku(product.sku || "");
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !price) {
      setError("Name and price are required");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          price,
          mrp: mrp || null,
          unit,
          stock,
          categoryId: categoryId || null,
          image: image || null,
          sku: sku || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update product");
        return;
      }

      router.push("/dashboard/products");
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
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">
          Update product details
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
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              step="0.01"
            />
            <Input
              label="MRP (₹)"
              type="number"
              value={mrp}
              onChange={(e) => setMrp(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={units}
            />
            <Input
              label="Stock Quantity"
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              min="0"
            />
          </div>

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            placeholder="Select category"
          />

          <Input
            label="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />

          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          />

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/products")}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
