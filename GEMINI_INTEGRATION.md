# Gemini 3 Integration Guide

This document explains how Verity integrates with Gemini 3 Pro and our approach to handling preview-tier quota limitations.

---

## 🎯 Integration Strategy

Verity is **natively designed for Gemini 3 Pro's advanced reasoning capabilities**, with a pragmatic approach to quota management during the preview period.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Verity UI                            │
│  (Sample Selector + Custom Upload + Results Display)       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Analysis Router                           │
│  • Sample Mode → Pre-validated Gemini 3 Pro output         │
│  • Custom Mode → Live API calls with fallback              │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐          ┌────────────────────┐
│ Golden Samples│          │  Gemini API Client │
│  (AI Studio)  │          │  (@google/genai)   │
└───────────────┘          └────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
            ┌──────────┐    ┌──────────┐   ┌──────────┐
            │ Gemini 3 │    │ Gemini 3 │   │ Gemini   │
            │   Pro    │    │  Flash   │   │ 2.0 Flash│
            └──────────┘    └──────────┘   └──────────┘
             (Primary)      (Fallback 1)   (Fallback 2)
```

---

## 📊 Demo Modes

### 1. Sample Evidence Mode (Primary Demo Path)

**Purpose**: Showcase Gemini 3 Pro's full capabilities without quota limitations.

**How it works**:
1. Pre-validated analysis generated using Gemini 3 Pro via AI Studio
2. Stored in `src/data/goldenSamples.js`
3. Simulates progressive thinking steps for realistic UX
4. Uses actual Gemini 3 Pro output (not fabricated)

**Sample Case**: Corporate Insider Trading
- **Files**: 5 multimodal sources (transcripts, emails, access logs, financial statements)
- **Analysis**: 6 thinking steps showing deep reasoning
- **Output**: Timeline, contradictions, tampering indicators, verdict
- **Validated**: February 9, 2026 via AI Studio

**Code Location**: `src/data/goldenSamples.js`

```javascript
export const GOLDEN_SAMPLES = [
  {
    id: "insider-trading",
    name: "Corporate Insider Trading Case",
    gemini3Output: {
      modelUsed: "Gemini 3 Pro",
      validatedDate: "2026-02-09",
      thinkingSteps: [ /* 6 actual reasoning steps */ ],
      analysis: { /* Real Gemini 3 Pro output */ }
    }
  }
];
```

### 2. Custom Upload Mode (Live Analysis)

**Purpose**: Demonstrate live Gemini integration with graceful degradation.

**Fallback Strategy**:
```javascript
try {
  // Attempt 1: Gemini 3 Pro (best quality)
  return await analyzeWithGemini3Pro(files);
} catch (quotaError) {
  try {
    // Attempt 2: Gemini 3 Flash (good quality, better quota)
    return await analyzeWithGemini3Flash(files);
  } catch (flashError) {
    // Attempt 3: Gemini 2.0 Flash (stable fallback)
    return await analyzeWithGemini2Flash(files);
  }
}
```

**Status Indicators**: Transparent badges show which model is active:
- ✓ Gemini 3 Pro (Live) - Green
- ⚠ Gemini 3 Flash (Fallback) - Yellow
- ⚠ Gemini 2.0 Flash (Fallback) - Orange

---

## 🧠 Gemini 3 Pro Features Used

### 1. Thinking Mode

**What it does**: Exposes the model's reasoning process step-by-step.

**Why it matters**: Forensic analysis requires transparency. Judges and investigators need to understand *how* conclusions were reached, not just *what* they are.

**Implementation**:
```javascript
const model = genAI.getGenerativeModel({ 
  model: "gemini-3-pro-preview",
  generationConfig: {
    thinkingMode: true
  }
});
```

**Example Output**:
```
Step 1: Analyzing Forensic Evidence
Step 2: Refining Temporal Data
Step 3: Evaluating Contradictions
Step 4: Investigating Anomalies
Step 5: Uncovering Stock Transaction Data
Step 6: Constructing Timeline of Events
```

### 2. Multimodal Analysis

**Supported formats**:
- 📄 PDFs (transcripts, financial statements)
- 🖼️ Images (access logs, screenshots)
- 📝 Text files (interviews, emails)

**How we use it**:
```javascript
const fileParts = files.map(file => ({
  inlineData: {
    data: file.base64Data,
    mimeType: file.mimeType
  }
}));

const result = await model.generateContent([
  { text: FORENSIC_ANALYSIS_PROMPT },
  ...fileParts
]);
```

### 3. Structured Output

**Request format**:
```javascript
const prompt = `Analyze these files and return JSON with:
{
  "timeline": [...],
  "contradictions": [...],
  "confidenceScores": {...},
  "verdict": "..."
}`;
```

**Gemini 3 Pro excels at**:
- Extracting precise timestamps from metadata
- Cross-referencing claims across documents
- Assigning credibility scores based on source type
- Detecting temporal inconsistencies

---

## 📝 Sample Validation Process

### How We Created Golden Samples

1. **Prepared Mock Evidence**
   - Created realistic forensic scenario (insider trading)
   - Generated 5 evidence files in `mock-evidence/`

2. **Ran Analysis in AI Studio**
   - Uploaded files to Google AI Studio
   - Used Gemini 3 Pro with thinking mode enabled
   - Captured full output including reasoning steps

3. **Extracted Structured Data**
   - Copied thinking steps verbatim
   - Extracted timeline, contradictions, verdict
   - Preserved confidence scores and credibility assessments

4. **Stored in Code**
   - Added to `src/data/goldenSamples.js`
   - Included validation date and model version
   - Linked to actual mock files

### Verification

You can verify our samples by:
1. Uploading the same files from `mock-evidence/` to AI Studio
2. Using Gemini 3 Pro with thinking mode
3. Comparing output to `goldenSamples.js`

---

## 🔧 Code Architecture

### Key Files

| File | Purpose |
|------|---------|
| `src/services/gemini.js` | Gemini API client with fallback logic |
| `src/data/goldenSamples.js` | Pre-validated Gemini 3 Pro outputs |
| `src/components/SampleSelector.jsx` | UI for choosing sample cases |
| `src/components/ApiStatusBadge.jsx` | Shows which model is active |
| `src/components/ThinkingMode.jsx` | Displays reasoning steps |

### Environment Variables

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

### Model Configuration

```javascript
// Primary: Gemini 3 Pro
const GEMINI_3_PRO = 'gemini-3-pro-preview';

// Fallback 1: Gemini 3 Flash
const GEMINI_3_FLASH = 'gemini-3-flash-preview';

// Fallback 2: Gemini 2.0 Flash (stable)
const GEMINI_2_FLASH = 'gemini-2.0-flash-exp';
```

---

## 🎯 Why This Approach?

### For Hackathon Judges

✅ **Always works** - No quota errors during evaluation
✅ **Shows real capabilities** - Authentic Gemini 3 Pro output
✅ **Transparent** - Clear about what's sample vs. live
✅ **Production-ready** - Handles real-world constraints

### For Production Use

✅ **Graceful degradation** - Falls back when quota exceeded
✅ **Cost-effective** - Uses cheaper models when appropriate
✅ **User-aware** - Shows which model is being used
✅ **Scalable** - Can add quota management, caching, etc.

---

## 📊 Performance Characteristics

| Model | Quota (Free Tier) | Quality | Speed | Use Case |
|-------|------------------|---------|-------|----------|
| Gemini 3 Pro | Limited | Excellent | Slower | Complex forensic analysis |
| Gemini 3 Flash | Moderate | Good | Fast | Simpler cases |
| Gemini 2.0 Flash | Generous | Good | Fast | High-volume processing |

---

## 🚀 Future Enhancements

- [ ] Add quota monitoring dashboard
- [ ] Implement request caching
- [ ] Support batch analysis
- [ ] Add more golden samples (fraud, tampering, etc.)
- [ ] Real-time collaboration features
- [ ] Export to legal report formats

---

## 📚 References

- [Gemini 3 Pro Documentation](https://ai.google.dev/gemini-api/docs)
- [Google AI Studio](https://aistudio.google.com/)
- [Thinking Mode Guide](https://ai.google.dev/gemini-api/docs/thinking)
- [@google/generative-ai SDK](https://www.npmjs.com/package/@google/generative-ai)

---

## 💡 Key Takeaway

Verity demonstrates that **production-ready Gemini 3 applications** can be built today by combining:
1. **Real Gemini 3 Pro capabilities** (via AI Studio validation)
2. **Pragmatic quota management** (golden samples + fallback)
3. **Transparent UX** (show users which model is active)

This approach ensures judges can evaluate the full potential of Gemini 3 while acknowledging preview-tier constraints.
