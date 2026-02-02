import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface VariantOption {
  blockId: string;
  blockName: string;
  latexContent: string;
}

interface VariantGroupData {
  groupId: string;
  groupName: string;
  variants: VariantOption[];
}

interface AISelectionResult {
  groupId: string;
  selectedBlockId: string;
}

// Build the prompt for AI
function buildPrompt(
  jobDescription: string,
  variantGroups: VariantGroupData[]
): string {
  let prompt = `You are an expert resume consultant. Given a job description and multiple variant groups of resume content, select the best variant from each group that best matches the job requirements.

JOB DESCRIPTION:
${jobDescription}

VARIANT GROUPS TO EVALUATE:
`;

  variantGroups.forEach((group, idx) => {
    prompt += `\n--- Group ${idx + 1}: ${group.groupName} (ID: ${group.groupId}) ---\n`;
    group.variants.forEach((variant, vIdx) => {
      prompt += `\nVariant ${vIdx + 1} (ID: ${variant.blockId}, Name: ${variant.blockName}):\n`;
      prompt += `${variant.latexContent}\n`;
    });
  });

  prompt += `\n\nINSTRUCTIONS:
1. For each variant group, select exactly ONE variant that best matches the job description
2. Consider: relevant skills, keywords, achievements, and experience alignment
3. Return your selection as a valid JSON array

RESPOND ONLY WITH A JSON ARRAY in this exact format (no other text):
[{"groupId": "group-id-here", "selectedBlockId": "block-id-here"}, ...]`;

  return prompt;
}

// Call OpenAI API
async function callOpenAI(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Call Anthropic API
async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Anthropic API error");
  }

  const data = await response.json();
  return data.content[0].text;
}

// Call Gemini API
async function callGemini(
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Gemini API error");
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// Parse AI response to extract JSON
function parseAIResponse(response: string): AISelectionResult[] {
  // Try to extract JSON from the response
  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No valid JSON array found in AI response");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate structure
  if (!Array.isArray(parsed)) {
    throw new Error("AI response is not an array");
  }

  for (const item of parsed) {
    if (!item.groupId || !item.selectedBlockId) {
      throw new Error("Invalid selection format in AI response");
    }
  }

  return parsed;
}

// POST - Perform AI-based variant selection
export async function POST(req: Request) {
  try {
    const { jobDescription, variantGroups } = await req.json();

    if (!jobDescription || !variantGroups || variantGroups.length === 0) {
      return NextResponse.json(
        { error: "Job description and variant groups are required" },
        { status: 400 }
      );
    }

    // Get AI config from settings
    const settings = await prisma.appSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings?.aiProvider || !settings?.aiApiKey || !settings?.aiModel) {
      return NextResponse.json(
        { error: "AI is not configured. Please configure AI in Settings." },
        { status: 400 }
      );
    }

    const { aiProvider, aiApiKey, aiModel } = settings;

    // Build the prompt
    const prompt = buildPrompt(jobDescription, variantGroups);

    // Call the appropriate AI API
    let aiResponse: string;

    switch (aiProvider) {
      case "openai":
        aiResponse = await callOpenAI(aiApiKey, aiModel, prompt);
        break;
      case "anthropic":
        aiResponse = await callAnthropic(aiApiKey, aiModel, prompt);
        break;
      case "gemini":
        aiResponse = await callGemini(aiApiKey, aiModel, prompt);
        break;
      default:
        return NextResponse.json(
          { error: "Unknown AI provider" },
          { status: 400 }
        );
    }

    // Parse the response
    const selections = parseAIResponse(aiResponse);

    return NextResponse.json({ selections });
  } catch (error) {
    console.error("Error in AI selection:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI selection failed" },
      { status: 500 }
    );
  }
}
