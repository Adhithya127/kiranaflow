import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getVisionProvider } from "@/lib/ai";

export async function POST(request: Request) {
  const session = await auth();
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const base64Data = image.includes(",")
      ? image.split(",")[1]
      : image;

    const provider = getVisionProvider();
    const result = await provider.recognizeProduct(
      base64Data,
      mimeType || "image/jpeg"
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Product recognition error:", error);
    return NextResponse.json(
      {
        error: "Failed to recognize product",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
