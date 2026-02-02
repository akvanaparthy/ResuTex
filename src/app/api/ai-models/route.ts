import { NextResponse } from "next/server";

interface ModelInfo {
  id: string;
  name: string;
}

// Chat/text model patterns for filtering
const OPENAI_CHAT_PATTERNS = [
  /^gpt-5/,
  /^gpt-4/,
  /^gpt-3\.5-turbo/,
  /^o1/,
  /^o3/,
  /^o4/,
];

const GEMINI_CHAT_PATTERNS = [
  /gemini-2/,
  /gemini-1\.5/,
  /gemini-pro/,
];

// Filter out non-chat models
function isOpenAIChatModel(modelId: string): boolean {
  // Exclude vision, embedding, audio, image models
  if (modelId.includes("embedding") || modelId.includes("whisper") || 
      modelId.includes("tts") || modelId.includes("dall-e") ||
      modelId.includes("audio") || modelId.includes("realtime")) {
    return false;
  }
  return OPENAI_CHAT_PATTERNS.some(pattern => pattern.test(modelId));
}

function isGeminiChatModel(modelId: string): boolean {
  // Exclude embedding, vision-only models
  if (modelId.includes("embedding") || modelId.includes("aqa") ||
      modelId.includes("imagen") || modelId.includes("code-")) {
    return false;
  }
  return GEMINI_CHAT_PATTERNS.some(pattern => pattern.test(modelId));
}

// POST fetch models from provider
export async function POST(req: Request) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: "Provider and API key are required" },
        { status: 400 }
      );
    }

    let models: ModelInfo[] = [];

    switch (provider) {
      case "openai": {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json(
            { error: error.error?.message || "Failed to fetch OpenAI models" },
            { status: response.status }
          );
        }

        const data = await response.json();
        models = data.data
          .filter((m: { id: string }) => isOpenAIChatModel(m.id))
          .map((m: { id: string }) => ({
            id: m.id,
            name: m.id,
          }))
          .sort((a: ModelInfo, b: ModelInfo) => {
            // Sort by version - prefer newer models
            const getScore = (id: string) => {
              if (id.includes("gpt-4o")) return 100;
              if (id.includes("gpt-4-turbo")) return 90;
              if (id.includes("gpt-4")) return 80;
              if (id.includes("o1")) return 70;
              if (id.includes("gpt-3.5")) return 50;
              return 0;
            };
            return getScore(b.id) - getScore(a.id);
          });
        break;
      }

      case "anthropic": {
        // Anthropic now has a models list API: GET /v1/models
        const response = await fetch("https://api.anthropic.com/v1/models", {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
        });

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json(
            { error: error.error?.message || "Failed to fetch Anthropic models" },
            { status: response.status }
          );
        }

        const data = await response.json();
        models = (data.data || [])
          .filter((m: { id: string }) => {
            // Only include Claude chat models, exclude embedding/legacy
            return m.id.includes("claude") && !m.id.includes("embed");
          })
          .map((m: { id: string; display_name?: string }) => ({
            id: m.id,
            name: m.display_name || m.id,
          }))
          .sort((a: ModelInfo, b: ModelInfo) => {
            // Sort by version - prefer newer models
            const getScore = (id: string) => {
              if (id.includes("claude-sonnet-4") || id.includes("claude-4")) return 100;
              if (id.includes("claude-3-5") || id.includes("claude-3.5")) return 90;
              if (id.includes("opus")) return 85;
              if (id.includes("sonnet")) return 80;
              if (id.includes("haiku")) return 70;
              return 0;
            };
            return getScore(b.id) - getScore(a.id);
          });
        break;
      }

      case "gemini": {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (!response.ok) {
          const error = await response.json();
          return NextResponse.json(
            { error: error.error?.message || "Failed to fetch Gemini models" },
            { status: response.status }
          );
        }

        const data = await response.json();
        models = (data.models || [])
          .filter((m: { name: string; supportedGenerationMethods?: string[] }) => {
            const modelId = m.name.replace("models/", "");
            // Only include models that support generateContent
            const supportsGenerate = m.supportedGenerationMethods?.includes("generateContent");
            return supportsGenerate && isGeminiChatModel(modelId);
          })
          .map((m: { name: string; displayName?: string }) => ({
            id: m.name.replace("models/", ""),
            name: m.displayName || m.name.replace("models/", ""),
          }))
          .sort((a: ModelInfo, b: ModelInfo) => {
            // Prefer newer versions
            const getScore = (id: string) => {
              if (id.includes("2.5")) return 100;
              if (id.includes("2.0") || id.includes("-2-")) return 90;
              if (id.includes("1.5-pro")) return 80;
              if (id.includes("1.5-flash")) return 70;
              if (id.includes("pro")) return 60;
              return 0;
            };
            return getScore(b.id) - getScore(a.id);
          });
        break;
      }

      default:
        return NextResponse.json(
          { error: "Unknown provider" },
          { status: 400 }
        );
    }

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
