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

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

export async function extractContentFromFiles(files) {
  const model = genAI.getGenerativeModel({ 
    model: MODELS.FLASH
  });

  const allContent = [];

  for (const file of files) {
    try {
      const base64Data = await fileToBase64(file);
      
      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: file.type,
            data: base64Data
          }
        },
        {
          text: `Extract information from this evidence file. Return JSON format:
{
  "source": "${file.name}",
  "type": "audio|video|document|image",
  "claims": [
    {
      "claim": "exact statement or fact",
      "timestamp": "time or date mentioned",
      "speaker": "person who made claim if applicable",
      "context": "surrounding context"
    }
  ],
  "people_mentioned": ["list of people"],
  "dates_mentioned": ["list of dates"],
  "locations_mentioned": ["list of places"],
  "key_facts": ["important facts"]
}`
        }
      ]);

      const extracted = JSON.parse(result.response.text());
      allContent.push(extracted);
    } catch (error) {
      console.error(`Failed to extract from ${file.name}:`, error);
      allContent.push({
        source: file.name,
        error: "Failed to extract content"
      });
    }
  }

  return allContent;
}

export async function masterAnalysis(allExtractedContent) {
  const model = genAI.getGenerativeModel({ 
    model: MODELS.FLASH,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  });

  const prompt = `You are VERITY - a forensic verification AI.

EVIDENCE:
${JSON.stringify(allExtractedContent, null, 2)}

TASK:
1. Build a chronological timeline of events
2. Identify all contradictions between sources
3. Assess credibility of each source
4. Determine what is likely true vs false
5. Show your reasoning process step-by-step

Return JSON:
{
  "thinking": "detailed step-by-step reasoning explaining your analysis process",
  "timeline": [
    {
      "datetime": "ISO format or best estimate",
      "event": "what happened",
      "sources": ["which files support this"],
      "confidence": "very_high|high|medium|low",
      "reasoning": "why this confidence level"
    }
  ],
  "contradictions": [
    {
      "id": "C1",
      "severity": "critical|major|minor",
      "claim_a": {
        "statement": "first claim",
        "source": "filename",
        "credibility": "high|medium|low"
      },
      "claim_b": {
        "statement": "conflicting claim",
        "source": "filename",
        "credibility": "high|medium|low"
      },
      "analysis": "explanation of conflict",
      "verdict": "which claim is more credible and why",
      "confidence": 0.XX
    }
  ],
  "summary": "overall assessment of what the evidence shows"
}`;

  try {
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error("Master analysis failed:", error);
    throw error;
  }
}