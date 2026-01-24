import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY not found in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3-pro-preview"
};

export async function testGeminiConnection() {
  try {
    const model = genAI.getGenerativeModel({ 
      model: MODELS.FLASH
    });
    
    const result = await model.generateContent("test");
    
    return {
      success: true,
      message: result.response.text(),
      modelUsed: MODELS.FLASH
    };
  } catch (error) {
    if (error.message.includes("429")) {
      return {
        success: false,
        message: "Quota exceeded. Wait 60 seconds and try again."
      };
    }
    return {
      success: false,
      message: error.message
    };
  }
}

export async function extractContentFromFiles(fileURIs) {
  const model = genAI.getGenerativeModel({ 
    model: MODELS.FLASH
  });

  const allContent = [];

  for (const fileData of fileURIs) {
    const result = await model.generateContent([
      {
        fileData: {
          fileUri: fileData.uri,
          mimeType: fileData.mimeType
        }
      },
      {
        text: `Extract claims, dates, people mentioned, and key facts. Return JSON format:
{
  "source": "filename",
  "claims": [{"claim": "...", "timestamp": "...", "speaker": "..."}],
  "people_mentioned": ["..."],
  "dates_mentioned": ["..."],
  "key_facts": ["..."]
}`
      }
    ]);

    allContent.push(JSON.parse(result.response.text()));
  }

  return allContent;
}

export async function masterAnalysis(allExtractedContent) {
  const model = genAI.getGenerativeModel({ 
    model: MODELS.PRO,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    },
    thinkingConfig: {
      includeThoughts: true,
      thinkingLevel: "high"
    }
  });

  const prompt = `You are VERITY - a forensic verification AI.

EVIDENCE:
${JSON.stringify(allExtractedContent, null, 2)}

TASK:
1. Build a chronological timeline
2. Identify all contradictions
3. Determine credibility of each source
4. Show your reasoning process

Return JSON:
{
  "thinking": "step-by-step reasoning",
  "timeline": [
    {
      "datetime": "ISO format",
      "event": "what happened",
      "sources": ["files"],
      "confidence": "very_high|high|medium|low",
      "reasoning": "why"
    }
  ],
  "contradictions": [
    {
      "id": "C1",
      "severity": "critical|major|minor",
      "claim_a": {
        "statement": "...",
        "source": "...",
        "credibility": "high|medium|low"
      },
      "claim_b": {
        "statement": "...",
        "source": "...",
        "credibility": "high|medium|low"
      },
      "verdict": "which is true",
      "confidence": 0.XX
    }
  ],
  "summary": "overall assessment"
}`;

  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}