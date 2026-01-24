import { GoogleGenerativeAI, GoogleAIFileManager } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY not found in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

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

export async function uploadFilesToGemini(files) {
  const uploadedFiles = [];

  for (const file of files) {
    try {
      const uploadResult = await fileManager.uploadFile(file, {
        mimeType: file.type,
        displayName: file.name
      });

      let fileStatus = await fileManager.getFile(uploadResult.name);
      while (fileStatus.state === "PROCESSING") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        fileStatus = await fileManager.getFile(uploadResult.name);
      }

      uploadedFiles.push({
        uri: uploadResult.uri,
        mimeType: uploadResult.mimeType,
        name: file.name
      });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }

  return uploadedFiles;
}

export async function extractContentFromFiles(uploadedFiles) {
  const model = genAI.getGenerativeModel({ 
    model: MODELS.FLASH
  });

  const allContent = [];

  for (const fileData of uploadedFiles) {
    try {
      const result = await model.generateContent([
        {
          fileData: {
            fileUri: fileData.uri,
            mimeType: fileData.mimeType
          }
        },
        {
          text: `Extract information from this evidence file. Return JSON format:
{
  "source": "${fileData.name}",
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
      console.error(`Failed to extract from ${fileData.name}:`, error);
      allContent.push({
        source: fileData.name,
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