import { NextRequest, NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth-helpers";
import { getVisionProvider } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { image, mimeType } = body;

    if (!image) return NextResponse.json({ error: "Image data is required" }, { status: 400 });

    const base64Data = image.includes(",") ? image.split(",")[1] : image;

    const provider = getVisionProvider();
    const result = await provider.recognizeProduct(base64Data, mimeType || "image/jpeg");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Product recognition error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("429") || message.includes("insufficient_quota") || message.includes("no credits")) {
      return NextResponse.json(
        { error: "AI service is out of credits. Please add credits at platform.openai.com or fill details manually." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Failed to recognize product. Please fill details manually." },
      { status: 500 }
    );
  }
}
