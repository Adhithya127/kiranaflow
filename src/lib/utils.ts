import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function generateOrderNumber(): string {
  const now = new Date();
  const datePart = now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0");
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "new": return "bg-blue-100 text-blue-800";
    case "confirmed": return "bg-yellow-100 text-yellow-800";
    case "preparing": return "bg-orange-100 text-orange-800";
    case "ready": return "bg-green-100 text-green-800";
    case "completed": return "bg-gray-100 text-gray-800";
    case "cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "new": return "New";
    case "confirmed": return "Confirmed";
    case "preparing": return "Preparing";
    case "ready": return "Ready";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}
