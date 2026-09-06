import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { userId },
    });

    if (!shop) {
      return NextResponse.json([]);
    }

    const categories = await prisma.category.findMany({
      where: { shopId: shop.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shop = await prisma.shop.findUnique({
      where: { userId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Please create a shop first" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findFirst({
      where: { shopId: shop.id, name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    const maxOrder = await prisma.category.aggregate({
      where: { shopId: shop.id },
      _max: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        name,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        shopId: shop.id,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
