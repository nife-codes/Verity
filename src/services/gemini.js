import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const USE_MOCK = false;

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use Gemini 2.0 Flash with Thinking Mode for better free tier quota
const FLASH_MODEL = 'gemini-2.0-flash-thinking-exp-1219';

export async function extractWithFlash(files) {
    if (USE_MOCK) {
        return mockExtractWithFlash(files);
    }

    try {
        const model = genAI.getGenerativeModel({ model: FLASH_MODEL });

        const fileParts = files.map((file) => ({
            inlineData: {
                data: file.base64Data.split(',')[1],
                mimeType: file.mimeType,
            },
        }));

        const prompt = `You are a forensic data extraction specialist. Extract ALL relevant information from these files.

For EACH file, extract:
1. All timestamps (from metadata AND content)
2. All claims, statements, or events mentioned
3. Any identifying information (names, locations, etc.)
4. Key facts or data points

Return a JSON object with this structure:
{
  "files": [
    {
      "fileName": "...",
      "category": "image/video/audio/document",
      "extractedData": {
        "timestamps": ["..."],
        "claims": ["..."],
        "entities": ["..."],
        "keyFacts": ["..."]
      }
    }
  ]
}`;

        const result = await model.generateContent([prompt, ...fileParts]);
        const response = result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { files: [] };

        return {
            success: true,
            extractedData,
        };
    } catch (error) {
        console.error('Flash extraction error:', error);
        throw new Error(`Gemini Flash extraction error: ${error.message}`);
    }
}

export async function analyzeWithProThinking(extractedData) {
    if (USE_MOCK) {
        return mockAnalyzeWithProThinking(extractedData);
    }

    try {
        const model = genAI.getGenerativeModel({
            model: FLASH_MODEL,
            generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 8192,
            }
        });

        const prompt = `You are a forensic evidence analyst. You have extracted data from multiple files.

EXTRACTED DATA:
${JSON.stringify(extractedData, null, 2)}

YOUR TASK:
1. Cross-reference all timestamps across files - look for inconsistencies
2. Compare claims and statements - detect contradictions
3. Build a timeline of events
4. Identify evidence tampering indicators (metadata mismatches, impossible sequences)
5. Calculate confidence scores for each finding
6. Provide a final verdict on evidence integrity

CRITICAL: SHOW YOUR REASONING STEP-BY-STEP
Format your thinking process as clear, numbered steps:
Step 1: [What you're analyzing]
Step 2: [What you discovered]
Step 3: [Your conclusion]

For each step:
- Explain what you're examining
- Show how you cross-reference information
- Explain why you flag contradictions
- Justify your confidence scores

After showing your reasoning steps, return a JSON object with:
{
  "timeline": [...],
  "contradictions": [...],
  "tamperingIndicators": [...],
  "confidenceScores": {...},
  "verdict": "...",
  "reasoning": "..."
}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract thinking steps from the response
        const thinkingSteps = [];
        const lines = text.split('\n');
        for (const line of lines) {
            if (line.match(/^Step \d+:/i) || line.match(/^\d+\./)) {
                thinkingSteps.push(line.trim());
            }
        }

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return {
            success: true,
            analysis: analysisResult,
            thinkingSteps: thinkingSteps.length > 0 ? thinkingSteps : [
                'Analyzing timestamps across files...',
                'Cross-referencing metadata...',
                'Detecting contradictions...',
                'Building timeline...',
                'Calculating confidence scores...',
                'Formulating verdict...'
            ],
            toolCalls: [],
        };
    } catch (error) {
        console.error('Pro analysis error:', error);
        throw new Error(`Gemini Pro analysis error: ${error.message}`);
    }
}

export async function mockExtractWithFlash(files) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
        success: true,
        extractedData: {
            files: files.map((file) => ({
                fileName: file.fileName,
                category: file.category,
                extractedData: {
                    timestamps: ['2025-03-05T08:42:00', '2025-03-15T10:15:00'],
                    claims: ['Sample claim from ' + file.fileName],
                    entities: ['Sample entity'],
                    keyFacts: ['Sample fact from ' + file.fileName],
                },
            })),
        },
    };
}

export async function mockAnalyzeWithProThinking(extractedData) {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
        success: true,
        analysis: {
            timeline: [
                {
                    datetime: '2025-03-05T08:42:00',
                    event: 'Sample event 1',
                    sources: ['file1.pdf'],
                    confidence: 'high',
                    reasoning: 'Based on metadata',
                },
            ],
            contradictions: [
                {
                    id: 'C1',
                    severity: 'high',
                    claim_a: {
                        statement: 'Sample claim A',
                        source: 'file1.pdf',
                        credibility: 'high',
                    },
                    claim_b: {
                        statement: 'Sample claim B',
                        source: 'file2.pdf',
                        credibility: 'medium',
                    },
                    analysis: 'Sample contradiction analysis',
                    verdict: 'Sample verdict',
                    confidence: 0.85,
                },
            ],
            tamperingIndicators: [],
            confidenceScores: {
                overall: 0.85,
                metadata: 0.90,
                content: 0.80,
            },
            verdict: 'Sample verdict',
            reasoning: 'Sample reasoning',
        },
        thinkingSteps: [
            'Analyzing timestamps across files...',
            'Cross-referencing metadata...',
            'Detecting contradictions...',
            'Building timeline...',
            'Calculating confidence scores...',
            'Formulating verdict...',
        ],
        toolCalls: [],
    };
}

export async function analyzeEvidence(files) {
    try {
        const extractionResult = await extractWithFlash(files);

        if (!extractionResult.success) {
            throw new Error('Extraction failed');
        }

        const analysisResult = await analyzeWithProThinking(extractionResult.extractedData);

        if (!analysisResult.success) {
            throw new Error('Analysis failed');
        }

        return {
            success: true,
            thinking: analysisResult.thinkingSteps?.join('\n\n') || '',
            thinkingSteps: analysisResult.thinkingSteps || [],
            timeline: analysisResult.analysis.timeline || [],
            contradictions: analysisResult.analysis.contradictions || [],
            tamperingIndicators: analysisResult.analysis.tamperingIndicators || [],
            confidenceScores: analysisResult.analysis.confidenceScores || {
                overall: 0,
                metadata: 0,
                content: 0,
            },
            summary: analysisResult.analysis.verdict || 'Analysis complete',
            rawResult: extractionResult,
        };
    } catch (error) {
        console.error('Analysis error:', error);
        throw error;
    }
}

export async function mockAnalyzeEvidence(files) {
    const extractionResult = await mockExtractWithFlash(files);
    const analysisResult = await mockAnalyzeWithProThinking(extractionResult.extractedData);

    return {
        success: true,
        thinking: analysisResult.thinkingSteps.join('\n\n'),
        thinkingSteps: analysisResult.thinkingSteps,
        timeline: analysisResult.analysis.timeline,
        contradictions: analysisResult.analysis.contradictions,
        tamperingIndicators: analysisResult.analysis.tamperingIndicators,
        confidenceScores: analysisResult.analysis.confidenceScores,
        summary: analysisResult.analysis.verdict,
        rawResult: extractionResult,
    };
}
