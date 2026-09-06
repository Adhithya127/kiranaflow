export interface ProductRecognition {
  name: string;
  description: string;
  category: string;
  unit: string;
  mrp: number | null;
  confidence: number;
}

export interface VisionProvider {
  recognizeProduct(imageBase64: string, mimeType: string): Promise<ProductRecognition>;
}

export type { ProductRecognition as AIRProductRecognition };
