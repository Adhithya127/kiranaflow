"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewProductPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

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
    fetchCategories();
  }, []);

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

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (response.ok) {
        const cat = await response.json();
        setCategories([...categories, cat]);
        setCategoryId(cat.id);
        setNewCategory("");
        setShowNewCategory(false);
      }
    } catch (error) {
      console.error("Failed to add category:", error);
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
      const response = await fetch("/api/products", {
        method: "POST",
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
        setError(data.error || "Failed to create product");
        return;
      }

      router.push("/dashboard/products");
    } catch {
      setError("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
        <p className="text-gray-600 mt-1">
          Add a new product to your catalog
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
            placeholder="e.g., Amul Butter 100g"
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description (optional)"
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
              helperText="Optional"
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className="text-sm text-emerald-600 hover:text-emerald-700"
              >
                {showNewCategory ? "Cancel" : "+ Add New"}
              </button>
            </div>
            {showNewCategory ? (
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Category name"
                />
                <Button
                  type="button"
                  onClick={handleAddCategory}
                  variant="secondary"
                >
                  Add
                </Button>
              </div>
            ) : (
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                placeholder="Select category"
              />
            )}
          </div>

          <Input
            label="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg (optional)"
            helperText="Paste a URL for the product image"
          />

          <Input
            label="SKU"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Stock keeping unit (optional)"
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
              Add Product
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
