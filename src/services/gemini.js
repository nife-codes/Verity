/**
 * Gemini 3 Orchestration Service
 * Two-phase analysis system for forensic evidence verification
 * Phase 1: Gemini Flash - Fast extraction from multimodal files
 * Phase 2: Gemini Pro with Thinking Mode - Deep reasoning and contradiction detection
 */

// Configuration
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDghUlhCIYPzn5vNPxij6waAXW5URCf_AU';
const USE_MOCK = false; // Set to true for development without API calls

const GEMINI_FLASH_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';
const GEMINI_PRO_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

// Tool definitions for Gemini to call
const TOOLS = [
    {
        name: 'extractTimestamp',
        description: 'Extract and parse timestamp from text or metadata',
        parameters: {
            type: 'object',
            properties: {
                text: {
                    type: 'string',
                    description: 'Text containing timestamp information',
                },
                source: {
                    type: 'string',
                    description: 'Source of the timestamp (e.g., "video_metadata", "audio_transcript")',
                },
            },
            required: ['text', 'source'],
        },
    },
    {
        name: 'detectContradiction',
        description: 'Compare two claims or pieces of evidence to detect contradictions',
        parameters: {
            type: 'object',
            properties: {
                claim1: {
                    type: 'string',
                    description: 'First claim or piece of evidence',
                },
                claim2: {
                    type: 'string',
                    description: 'Second claim or piece of evidence',
                },
                context: {
                    type: 'string',
                    description: 'Additional context about the claims',
                },
            },
            required: ['claim1', 'claim2'],
        },
    },
    {
        name: 'calculateConfidence',
        description: 'Calculate confidence score for a piece of evidence or finding',
        parameters: {
            type: 'object',
            properties: {
                evidence: {
                    type: 'string',
                    description: 'The evidence to evaluate',
                },
                factors: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Factors affecting confidence (e.g., metadata_present, multiple_sources)',
                },
            },
            required: ['evidence'],
        },
    },
];

/**
 * PHASE 1: Extract structured data from each file using Gemini Flash
 * @param {Object[]} files - Array of processed files with base64 data
 * @returns {Promise<Object>} Extraction results
 */
export async function extractWithFlash(files) {
    try {
        const parts = [];

        // Add instruction
        parts.push({
            text: `You are a forensic evidence extraction system. Analyze each file and extract:
1. File type and format
2. All timestamps and dates (from metadata AND content)
3. Key claims, statements, or events
4. Location data (GPS, addresses mentioned)
5. People, organizations, or entities mentioned
6. Any technical metadata (camera model, software used, etc.)

Return a JSON object with this structure:
{
  "files": [
    {
      "filename": "...",
      "type": "...",
      "timestamps": [...],
      "claims": [...],
      "locations": [...],
      "entities": [...],
      "metadata": {...}
    }
  ]
}

Be thorough and precise. Extract EVERYTHING that could be forensically relevant.`,
        });

        // Add each file
        files.forEach((file) => {
            if (file.base64) {
                parts.push({
                    inlineData: {
                        mimeType: file.fileType,
                        data: file.base64,
                    },
                });
                parts.push({
                    text: `File: ${file.fileName} (${file.category})`,
                });
            }
        });

        const response = await fetch(`${GEMINI_FLASH_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts,
                    },
                ],
                generationConfig: {
                    temperature: 0.1, // Low temperature for factual extraction
                    maxOutputTokens: 8192,
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini Flash API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const extractedText = data.candidates[0]?.content?.parts[0]?.text;

        // Parse JSON response
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { files: [] };

        return {
            success: true,
            extractedData,
            rawResponse: extractedText,
            thinkingSteps: [], // Flash doesn't use thinking mode
        };
    } catch (error) {
        console.error('Error in Flash extraction:', error);
        return {
            success: false,
            error: error.message,
            extractedData: null,
        };
    }
}

/**
 * PHASE 2: Deep reasoning with Gemini Pro + Thinking Mode
 * @param {Object} extractedData - Data from Phase 1
 * @param {Object[]} files - Original files for reference
 * @returns {Promise<Object>} Analysis results with thinking process
 */
export async function analyzeWithProThinking(extractedData, files) {
    try {
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

SHOW YOUR THINKING PROCESS:
- Explain each step of your reasoning
- Show how you cross-reference information
- Explain why you flag contradictions
- Justify your confidence scores

Use the available tools when needed:
- extractTimestamp() to parse dates
- detectContradiction() to compare claims
- calculateConfidence() to score findings

Return a JSON object with:
{
  "timeline": [...],
  "contradictions": [...],
  "tamperingIndicators": [...],
  "confidenceScores": {...},
  "verdict": "...",
  "reasoning": "..."
}`;

        const response = await fetch(`${GEMINI_PRO_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
                tools: [
                    {
                        functionDeclarations: TOOLS,
                    },
                ],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 8192,
                    // Enable thinking mode
                    thinkingConfig: {
                        enabled: true,
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini Pro API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        // Extract thinking steps
        const thinkingSteps = [];
        const analysisText = data.candidates[0]?.content?.parts
            .map((part) => {
                if (part.thought) {
                    thinkingSteps.push(part.thought);
                }
                return part.text;
            })
            .filter(Boolean)
            .join('\n');

        // Handle tool calls if present
        const toolCalls = data.candidates[0]?.content?.parts
            .filter((part) => part.functionCall)
            .map((part) => part.functionCall);

        // Parse JSON response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        const analysisResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return {
            success: true,
            analysis: analysisResult,
            thinkingSteps,
            toolCalls: toolCalls || [],
            rawResponse: analysisText,
        };
    } catch (error) {
        console.error('Error in Pro analysis:', error);
        return {
            success: false,
            error: error.message,
            analysis: null,
            thinkingSteps: [],
        };
    }
}

/**
 * Main orchestration function - runs both phases
 * @param {Object[]} processedFiles - Files from fileProcessor.js
 * @returns {Promise<Object>} Complete analysis results
 */
export async function analyzeEvidence(processedFiles) {
    try {
        // Filter only successful files with base64 data
        const validFiles = processedFiles.filter((f) => f.success && f.base64);

        if (validFiles.length === 0) {
            return {
                success: false,
                error: 'No valid files to analyze',
            };
        }

        console.log(`🔍 Starting analysis of ${validFiles.length} files...`);

        // PHASE 1: Extract with Flash
        console.log('⚡ Phase 1: Extracting data with Gemini Flash...');
        const extractionResult = await extractWithFlash(validFiles);

        if (!extractionResult.success) {
            return {
                success: false,
                error: `Extraction failed: ${extractionResult.error}`,
                phase: 'extraction',
            };
        }

        console.log('✅ Extraction complete');

        // PHASE 2: Analyze with Pro + Thinking
        console.log('🧠 Phase 2: Deep analysis with Gemini Pro (Thinking Mode)...');
        const analysisResult = await analyzeWithProThinking(
            extractionResult.extractedData,
            validFiles
        );

        if (!analysisResult.success) {
            return {
                success: false,
                error: `Analysis failed: ${analysisResult.error}`,
                phase: 'analysis',
                extractionResult, // Return extraction even if analysis fails
            };
        }

        console.log('✅ Analysis complete');

        // Combine results
        return {
            success: true,
            extraction: {
                data: extractionResult.extractedData,
                rawResponse: extractionResult.rawResponse,
            },
            analysis: {
                result: analysisResult.analysis,
                thinkingSteps: analysisResult.thinkingSteps,
                toolCalls: analysisResult.toolCalls,
                rawResponse: analysisResult.rawResponse,
            },
            filesAnalyzed: validFiles.length,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('Error in evidence analysis:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Mock analysis for development (when USE_MOCK is true in fileProcessor)
 */
export function mockAnalyzeEvidence(processedFiles) {
    return {
        success: true,
        extraction: {
            data: {
                files: processedFiles.map((f) => ({
                    filename: f.fileName,
                    type: f.category,
                    timestamps: ['2024-01-15T14:30:00Z'],
                    claims: ['Mock claim from ' + f.fileName],
                    locations: [],
                    entities: [],
                    metadata: f.metadata,
                })),
            },
            rawResponse: 'Mock extraction response',
        },
        analysis: {
            result: {
                timeline: [
                    { time: '2024-01-15T14:30:00Z', event: 'Mock event', source: processedFiles[0]?.fileName },
                ],
                contradictions: [
                    {
                        type: 'timestamp_mismatch',
                        description: 'Mock contradiction detected',
                        severity: 'medium',
                    },
                ],
                tamperingIndicators: [],
                confidenceScores: {
                    overall: 0.75,
                    metadata: 0.8,
                    content: 0.7,
                },
                verdict: 'MOCK: Evidence appears mostly authentic with minor inconsistencies',
                reasoning: 'This is a mock analysis for development purposes.',
            },
            thinkingSteps: [
                '🤔 Analyzing timestamps across files...',
                '🤔 Cross-referencing metadata...',
                '🤔 Checking for contradictions...',
            ],
            toolCalls: [],
            rawResponse: 'Mock analysis response',
        },
        filesAnalyzed: processedFiles.length,
        timestamp: new Date().toISOString(),
    };
}

export default {
    analyzeEvidence,
    mockAnalyzeEvidence,
    extractWithFlash,
    analyzeWithProThinking,
};
