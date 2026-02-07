import { GoogleGenAI, Type, Schema, FunctionDeclaration } from "@google/genai";
import { BrandAnalysis, CreativePlan, PlannedAsset, AssetType } from "../types/index";

// Helper to ensure we have a valid API key setup
export const ensureApiKey = async (): Promise<string> => {
  // Check if we are in an environment that requires user selection (Veo/Pro Image)
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
       // We don't block here, but the UI should handle the "connect" button.
       // However, strictly speaking for this service, we assume the key is ready or process.env is set.
    }
  }
  return process.env.API_KEY || '';
};

export const promptSelectKey = async () => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  } else {
    console.warn("AI Studio environment not detected. Unable to open key selector.");
  }
};

const getAI = async () => {
    // Always recreate to ensure latest key is picked up
    const key = process.env.API_KEY;
    if (!key) {
        console.warn("API Key not found in process.env");
    }
    return new GoogleGenAI({ apiKey: key });
};

// 1. Analyze Brand and Create Plan
export const analyzeBrandAndPlan = async (brandPrompt: string): Promise<CreativePlan> => {
  const ai = await getAI();
  
  const analysisSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      analysis: {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          personality: { type: Type.STRING },
          colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
          targetAudience: { type: Type.STRING },
          designStyle: { type: Type.STRING },
        },
        required: ["brandName", "personality", "colorPalette", "targetAudience", "designStyle"],
      },
      assets: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["LOGO", "SOCIAL_POST", "STORYBOARD_FRAME", "COPYWRITING"] },
            description: { type: Type.STRING },
            rationale: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            copyPrompt: { type: Type.STRING },
            aspectRatio: { type: Type.STRING },
          },
          required: ["id", "type", "description", "rationale"],
        }
      }
    },
    required: ["analysis", "assets"],
  };

  const systemInstruction = `
    You are a World-Class Creative Director and Brand Strategist. 
    Your goal is to interpret a raw user prompt into a cohesive brand identity and a concrete plan for marketing assets.
    
    1. Analyze the prompt for brand vibes, colors, and audience.
    2. Create a plan with exactly 4 distinct high-quality assets:
       - 1 Main Logo (Type: LOGO)
       - 1 Instagram/Social Media Visual (Type: SOCIAL_POST)
       - 1 Storyboard Frame for a commercial (Type: STORYBOARD_FRAME)
       - 1 Catchy Slogan/Tagline (Type: COPYWRITING)
    
    For IMAGE assets (Logo, Social, Storyboard), provide a highly detailed, artistic 'imagePrompt' optimized for a high-end image generation model. Include lighting, style, and composition details.
    For TEXT assets (Copywriting), provide a 'copyPrompt' that instructs a copywriter model.
    For mixed assets (Social Post), provide both.
    
    Ensure the visual style is consistent across all assets.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: brandPrompt,
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  const text = response.text || "{}";
  try {
    return JSON.parse(text) as CreativePlan;
  } catch (e) {
    console.error("Failed to parse plan JSON", e);
    throw new Error("Failed to generate a valid creative plan.");
  }
};

// 2. Generate Image Asset
export const generateImageAsset = async (asset: PlannedAsset): Promise<string> => {
  const ai = await getAI();
  const modelName = 'gemini-3-pro-image-preview'; // Nano Banana Pro

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { text: asset.imagePrompt || asset.description },
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: asset.aspectRatio as any || "1:1",
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image generation failed:", error);
    // Explicitly throw error so UI handles the failed state rather than showing a placeholder
    throw error;
  }
};

// 3. Generate Text Asset
export const generateTextAsset = async (asset: PlannedAsset, brandContext: BrandAnalysis): Promise<string> => {
  const ai = await getAI();
  
  const prompt = `
    Brand Context: ${JSON.stringify(brandContext)}
    Task: ${asset.copyPrompt || asset.description}
    
    Write creative, punchy, and brand-aligned copy. Keep it concise.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Content generation failed.";
};