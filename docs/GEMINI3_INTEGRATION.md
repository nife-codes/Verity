# Gemini 3 Orchestration System

## Overview
Two-phase forensic evidence analysis system using Gemini 3 API:
- **Phase 1**: Gemini Flash - Fast extraction from multimodal files
- **Phase 2**: Gemini Pro with Thinking Mode - Deep reasoning and contradiction detection

## Architecture

```
Files → Phase 1 (Flash) → Extracted Data → Phase 2 (Pro) → Analysis + Thinking Steps
```

### Phase 1: Extraction (Gemini Flash)
- Processes all files simultaneously (multimodal)
- Extracts timestamps, claims, locations, entities, metadata
- Returns structured JSON
- Fast and cost-effective

### Phase 2: Reasoning (Gemini Pro + Thinking Mode)
- Cross-references extracted data
- Detects contradictions and inconsistencies
- Builds timeline of events
- Identifies tampering indicators
- Shows reasoning process step-by-step
- Uses tool calling for specialized tasks

## Tool Calling

Gemini can autonomously call these tools:

1. **extractTimestamp(text, source)** - Parse timestamps from text
2. **detectContradiction(claim1, claim2, context)** - Compare claims
3. **calculateConfidence(evidence, factors)** - Score evidence reliability

## Usage

```javascript
import { processFiles } from './services/fileProcessor.js';
import { analyzeEvidence } from './services/gemini3.js';

// Step 1: Process uploaded files
const processResult = await processFiles(uploadedFiles);

// Step 2: Analyze with Gemini 3
const analysis = await analyzeEvidence(processResult.files);

if (analysis.success) {
  // Extraction results
  console.log('Extracted data:', analysis.extraction.data);
  
  // Analysis results
  console.log('Timeline:', analysis.analysis.result.timeline);
  console.log('Contradictions:', analysis.analysis.result.contradictions);
  console.log('Verdict:', analysis.analysis.result.verdict);
  
  // Thinking process (CRITICAL for hackathon demo!)
  console.log('Gemini\'s reasoning:');
  analysis.analysis.thinkingSteps.forEach(step => {
    console.log('🤔', step);
  });
}
```

## Response Structure

```javascript
{
  success: true,
  extraction: {
    data: {
      files: [
        {
          filename: "video.mp4",
          type: "video",
          timestamps: ["2024-01-15T14:30:00Z"],
          claims: ["Statement made in video"],
          locations: ["GPS: 40.7128, -74.0060"],
          entities: ["John Doe", "ABC Corp"],
          metadata: { duration: 120, camera: "iPhone 13" }
        }
      ]
    },
    rawResponse: "..."
  },
  analysis: {
    result: {
      timeline: [...],
      contradictions: [...],
      tamperingIndicators: [...],
      confidenceScores: { overall: 0.85 },
      verdict: "Evidence appears authentic",
      reasoning: "Detailed explanation..."
    },
    thinkingSteps: [
      "Analyzing timestamps across files...",
      "Cross-referencing metadata...",
      "Detected discrepancy in video timestamp..."
    ],
    toolCalls: [...],
    rawResponse: "..."
  },
  filesAnalyzed: 3,
  timestamp: "2024-01-15T14:30:00Z"
}
```

## Mock Mode

For development without API calls:

```javascript
import { mockAnalyzeEvidence } from './services/gemini3.js';

const mockResult = mockAnalyzeEvidence(processedFiles);
// Returns realistic mock data with thinking steps
```

## API Configuration

- **API Key**: Set in `gemini3.js` (currently hardcoded)
- **Models**: 
  - `gemini-3-flash` for extraction
  - `gemini-3-pro` for analysis
- **Endpoints**: Google Generative Language API v1beta

## Key Features for Hackathon

✅ **Multimodal Reasoning** - Processes video, audio, PDF, images together  
✅ **Thinking Mode** - Shows Gemini's reasoning process  
✅ **Tool Calling** - Autonomous tool orchestration  
✅ **Long Context** - Handles entire case files  
✅ **Two-Phase Architecture** - Optimized for speed + depth  

## Error Handling

- Graceful degradation if extraction fails
- Returns partial results when possible
- Detailed error messages for debugging
- Phase tracking (extraction vs analysis)

## Next Steps

1. Integrate with UI to display thinking steps
2. Add real-time progress indicators
3. Implement tool call execution
4. Build timeline visualization
5. Create contradiction highlight UI
