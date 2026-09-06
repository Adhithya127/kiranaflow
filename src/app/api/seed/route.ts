import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SEED_SECRET = "kiranaflow-seed-2024-xK9mP";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.secret !== SEED_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: "demo@kiranaflow.com" },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Already seeded", userId: existingUser.id });
    }

    const hashedPassword = await bcrypt.hash("password123", 12);

    const user = await prisma.user.create({
      data: {
        email: "demo@kiranaflow.com",
        password: hashedPassword,
        name: "Demo Shopkeeper",
        phone: "9876543210",
        role: "owner",
      },
    });

    const shop = await prisma.shop.create({
      data: {
        name: "Adithya General Stores",
        slug: "adithya-general-stores",
        description: "Your trusted neighborhood store for all daily essentials. We stock fresh groceries, household items, and more at fair prices.",
        category: "general",
        phone: "9876543210",
        address: "12-3-456, Main Road",
        city: "Hyderabad",
        state: "Telangana",
        pincode: "500001",
        isOpen: true,
        userId: user.id,
      },
    });

    const catGroceries = await prisma.category.create({ data: { name: "Groceries", sortOrder: 1, shopId: shop.id } });
    const catDairy = await prisma.category.create({ data: { name: "Dairy & Beverages", sortOrder: 2, shopId: shop.id } });
    const catSnacks = await prisma.category.create({ data: { name: "Snacks", sortOrder: 3, shopId: shop.id } });
    const catHousehold = await prisma.category.create({ data: { name: "Household", sortOrder: 4, shopId: shop.id } });
    const catPersonal = await prisma.category.create({ data: { name: "Personal Care", sortOrder: 5, shopId: shop.id } });

    const products = [
      { name: "Basmati Rice", description: "Premium quality basmati rice, 1kg pack", price: 180, mrp: 200, unit: "kg", stock: 50, categoryId: catGroceries.id },
      { name: "Wheat Atta", description: "Freshly milled whole wheat flour, 5kg pack", price: 250, mrp: 280, unit: "packet", stock: 30, categoryId: catGroceries.id },
      { name: "Toor Dal", description: "Premium toor dal, 1kg pack", price: 140, mrp: 160, unit: "kg", stock: 25, categoryId: catGroceries.id },
      { name: "Mustard Oil", description: "Pure mustard oil, 1 litre", price: 180, mrp: 200, unit: "litre", stock: 20, categoryId: catGroceries.id },
      { name: "Amul Butter", description: "Amul pasteurized butter, 100g", price: 56, mrp: 60, unit: "piece", stock: 25, categoryId: catDairy.id },
      { name: "Amul Taaza Milk", description: "Homogenised toned milk, 500ml", price: 30, mrp: 32, unit: "packet", stock: 40, categoryId: catDairy.id },
      { name: "Brooke Bond Red Label Tea", description: "Red label natural care tea, 250g", price: 68, mrp: 75, unit: "packet", stock: 35, categoryId: catDairy.id },
      { name: "Nescafe Classic Coffee", description: "Classic coffee, 50g jar", price: 175, mrp: 190, unit: "piece", stock: 15, categoryId: catDairy.id },
      { name: "Maggi Noodles", description: "2-minute masala noodles, 70g pack", price: 14, mrp: 14, unit: "piece", stock: 100, categoryId: catSnacks.id },
      { name: "Lays Classic Salted Chips", description: "Classic salted potato chips, 52g", price: 20, mrp: 20, unit: "piece", stock: 40, categoryId: catSnacks.id },
      { name: "Parle-G Biscuits", description: "Glucose biscuits, 80g pack", price: 10, mrp: 10, unit: "packet", stock: 120, categoryId: catSnacks.id },
      { name: "Surf Excel Detergent", description: "Matic liquid detergent, 1 litre", price: 155, mrp: 175, unit: "litre", stock: 18, categoryId: catHousehold.id },
      { name: "Vim Dishwash Liquid", description: "Lemon dishwash liquid, 500ml", price: 99, mrp: 110, unit: "piece", stock: 22, categoryId: catHousehold.id },
      { name: "Lifebuoy Soap", description: "Total 10 soap bar, 100g", price: 38, mrp: 42, unit: "piece", stock: 50, categoryId: catPersonal.id },
      { name: "Colgate Toothpaste", description: "Colgate MaxFresh, 100g", price: 85, mrp: 95, unit: "piece", stock: 30, categoryId: catPersonal.id },
      { name: "Head & Shoulders Shampoo", description: "Smooth & Silky, 180ml", price: 190, mrp: 210, unit: "piece", stock: 20, categoryId: catPersonal.id },
    ];

    for (const product of products) {
      await prisma.product.create({ data: { ...product, shopId: shop.id, isAvailable: true } });
    }

    return NextResponse.json({
      message: "Database seeded successfully",
      user: { email: user.email, password: "password123" },
      shop: shop.name,
      productCount: products.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
