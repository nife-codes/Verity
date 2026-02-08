# Verity

**Forensic truth verification powered by Gemini 3's reasoning engine**

[![Gemini 3 Hackathon](https://img.shields.io/badge/Gemini%203-Hackathon-blue)](https://gemini3.devpost.com)
[![Built with Gemini API](https://img.shields.io/badge/Built%20with-Gemini%20API-orange)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## What is Verity?

Verity analyzes contradictory evidence across multiple formats—video, audio, documents, images—to reconstruct verified timelines and detect inconsistencies. Unlike summarization tools, Verity **shows its reasoning process** using Gemini 3's thinking mode, proving why you can trust its conclusions.

### The Problem
Journalists, investigators, and fact-checkers drown in conflicting sources. When evidence contradicts itself, determining truth is manual, time-consuming, and error-prone.

### The Solution
Verity uses **Gemini 3's advanced reasoning** to:
- Extract claims from multimodal evidence
- Reason through contradictions transparently  
- Reconstruct verified timelines
- Assess source credibility
- Generate forensic reports

## Key Features

- **Transparent Reasoning**: See Gemini 3's thinking process in real-time
- **Multimodal Analysis**: Process video, audio, images, PDFs, and text
- **Contradiction Detection**: Automatically flag conflicting claims
- **Source Credibility**: Assess reliability based on evidence type
- **Verified Timelines**: Reconstruct events with confidence scores
- **Forensic Reports**: Generate downloadable analysis documents

## Demo

[Live Demo](...) | [Demo Video](https://youtube.com/...)

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **AI**: Gemini 3 Pro (reasoning) + Gemini 3 Flash (extraction)
- **API**: Google Gemini API with Thinking Mode
- **Deployment**: Vercel

## Installation

```bash
# Clone repository
git clone https://github.com/nife-codes/verity.git
cd verity

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Run development server
npm run dev
```

## Usage

1. **Upload Evidence**: Drag and drop files (video, audio, images, PDFs)
2. **Watch Verity Think**: See the reasoning process in real-time
3. **Review Timeline**: Examine the reconstructed sequence of events
4. **Check Contradictions**: View flagged inconsistencies with analysis
5. **Export Report**: Download the forensic analysis

## How It Works

Verity uses a two-stage analysis pipeline:

### Stage 1: Content Extraction
- Uploads files to Gemini File API
- Extracts structured claims using **Gemini 3 Flash**
- Identifies people, dates, locations, and key facts

### Stage 2: Master Reasoning
- Sends all extracted content to **Gemini 3 Pro**
- Reconstructs timeline with source citations
- Detects contradictions and assesses credibility
- **Thinking Mode** exposes the reasoning process
- Generates comprehensive forensic report

## Use Cases

- **Investigative Journalism**: Verify sources before publication
- **Legal Investigation**: Analyze witness testimony for inconsistencies
- **Fact-Checking**: Verify claims across multiple sources
- **Corporate Compliance**: Detect timeline discrepancies in documentation

## Gemini 3 Integration

Verity showcases Gemini 3's unique capabilities:

- **Thinking Mode**: `thinkingLevel: "high"` for transparent reasoning
- **Multimodal Understanding**: Process diverse evidence formats
- **Long Context**: Analyze multiple sources simultaneously
- **File API**: Handle large video/audio files efficiently
- **Structured Output**: Generate JSON for reliable parsing

## Contributing

Built for the [Gemini 3 Global Hackathon](https://gemini3.devpost.com).

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Disclaimer

Verity is an analysis tool, not a replacement for human judgment. It assesses probability, not absolute truth. Always verify critical findings with additional investigation.

## Acknowledgments

- Built with [Gemini 3 API](https://ai.google.dev/gemini-api)
- Inspired by the need for transparent AI reasoning
- Created for investigators, journalists, and truth-seekers

---

**Note**: This is a hackathon project demonstrating Gemini 3's reasoning capabilities. For production use, additional security, compliance, and validation features would be required.
