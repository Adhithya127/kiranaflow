"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Camera, Upload, Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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

interface AIRecognition {
  name: string;
  description: string;
  category: string;
  unit: string;
  mrp: number | null;
  confidence: number;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState<"idle" | "success" | "partial" | "error">("idle");
  const [recognitionMessage, setRecognitionMessage] = useState("");

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
        setImagePreview(product.image || null);
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImagePreview(dataUrl);
      setImage(dataUrl);

      setIsRecognizing(true);
      setRecognitionStatus("idle");

      try {
        const response = await fetch("/api/ai/recognize-product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, mimeType: file.type }),
        });

        const result = await response.json();
        if (!response.ok) {
          setRecognitionStatus("error");
          setRecognitionMessage(result.error || "Recognition failed");
          return;
        }

        const recognition = result as AIRecognition;
        if (recognition.confidence >= 0.7) {
          setRecognitionStatus("success");
          setRecognitionMessage(`AI identified "${recognition.name}" with ${Math.round(recognition.confidence * 100)}% confidence`);
        } else if (recognition.confidence >= 0.3) {
          setRecognitionStatus("partial");
          setRecognitionMessage(`AI guessed with ${Math.round(recognition.confidence * 100)}% confidence — review below`);
        } else {
          setRecognitionStatus("partial");
          setRecognitionMessage("AI could not confidently identify the product");
        }

        if (recognition.name && recognition.name !== "Unknown Product") setName(recognition.name);
        if (recognition.description) setDescription(recognition.description);
        if (recognition.unit) setUnit(recognition.unit);
        if (recognition.mrp) setMrp(recognition.mrp.toString());
        if (recognition.category) {
          const matched = categories.find((c) => c.name.toLowerCase() === recognition.category.toLowerCase());
          if (matched) setCategoryId(matched.id);
        }
      } catch (err) {
        setRecognitionStatus("error");
        setRecognitionMessage(err instanceof Error ? err.message : "Failed to analyze image");
      } finally {
        setIsRecognizing(false);
      }
    };
    reader.readAsDataURL(file);
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
          name, description, price, mrp: mrp || null, unit, stock,
          categoryId: categoryId || null, image: image || null, sku: sku || null,
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
        <p className="text-gray-600 mt-1">Update product details</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg mx-auto" />
                    {isRecognizing && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-white animate-spin mx-auto mb-2" />
                          <p className="text-white text-sm font-medium">AI analyzing...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {recognitionStatus !== "idle" && (
                    <div className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                      recognitionStatus === "success" ? "bg-green-50 text-green-700" :
                      recognitionStatus === "partial" ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {recognitionStatus === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                      <p className="font-medium">{recognitionMessage}</p>
                    </div>
                  )}
                  <div className="flex justify-center gap-3">
                    <Button type="button" variant="outline" onClick={() => { setImagePreview(null); setImage(""); setRecognitionStatus("idle"); }}>
                      Remove
                    </Button>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isRecognizing}>
                      <Camera className="w-4 h-4 mr-2" />Retake
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-emerald-600" />
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Upload a product photo for AI recognition</p>
                  <p className="text-sm text-gray-500 mb-3">Or skip and fill details manually</p>
                  <div className="flex items-center justify-center gap-3">
                    <Button type="button" variant="primary" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" />Take Photo
                    </Button>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />Upload
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
          </div>

          <Input label="Product Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Selling Price (₹)" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01" />
            <Input label="MRP (₹)" type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} min="0" step="0.01" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} options={units} />
            <Input label="Stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} min="0" />
          </div>

          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
          />

          <Input label="Image URL" value={image} onChange={(e) => setImage(e.target.value)} helperText="Paste a URL or upload above" />
          <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} />

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>Cancel</Button>
            <Button type="submit" isLoading={isSaving}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
