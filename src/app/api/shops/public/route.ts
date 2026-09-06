import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const shops = await prisma.shop.findMany({
      where: { isOpen: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        address: true,
        city: true,
        phone: true,
        logo: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(shops);
  } catch (error) {
    console.error("Public shops GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch shops" },
      { status: 500 }
    );
  }
}
