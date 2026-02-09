export const MOCK_ANALYSIS = {
  thinking: `Analyzing timestamps across files...

Cross-referencing metadata...

CEO interview claims March 15 first knowledge. But email from March 8 says "as we discussed this morning". Security log shows March 5 meeting with CEO present.

This is a direct contradiction. Documentary evidence (email, security log) has higher credibility than testimony.

Timeline shows CEO knew by March 5, not March 15. Stock sales on March 6-7 immediately after meeting are suspicious.

Conclusion: CEO is lying. Documentary proof contradicts testimony.`,

  thinkingSteps: [
    'Analyzing timestamps across files...',
    'Cross-referencing metadata...',
    'CEO interview claims March 15 first knowledge. But email from March 8 says "as we discussed this morning". Security log shows March 5 meeting with CEO present.',
    'This is a direct contradiction. Documentary evidence (email, security log) has higher credibility than testimony.',
    'Timeline shows CEO knew by March 5, not March 15. Stock sales on March 6-7 immediately after meeting are suspicious.',
    'Conclusion: CEO is lying. Documentary proof contradicts testimony.'
  ],

  timeline: [
    {
      datetime: "2025-03-05T08:42:00",
      event: "CEO attended confidential acquisition meeting",
      sources: ["security_log.png"],
      confidence: "very_high",
      reasoning: "Computer-generated access log with timestamp"
    },
    {
      datetime: "2025-03-06",
      event: "CEO sold 50,000 shares",
      sources: ["stock_trades.pdf"],
      confidence: "very_high",
      reasoning: "Brokerage statement, one day after meeting"
    },
    {
      datetime: "2025-03-08T09:47:00",
      event: "Email references morning strategy session",
      sources: ["email_evidence.pdf"],
      confidence: "very_high",
      reasoning: "Email metadata confirms date and content"
    },
    {
      datetime: "2025-03-15",
      event: "Board meeting presentation",
      sources: ["board_meeting_transcript.pdf"],
      confidence: "very_high",
      reasoning: "Official transcript"
    },
    {
      datetime: "2025-03-20",
      event: "CEO claims first learned March 15",
      sources: ["ceo_interview.mp3"],
      confidence: "high claim was made, low claim is true",
      reasoning: "Contradicted by documentary evidence"
    }
  ],

  contradictions: [
    {
      id: "C1",
      severity: "critical",
      claim_a: {
        statement: "I first learned about acquisition on March 15",
        source: "ceo_interview.mp3",
        credibility: "low"
      },
      claim_b: {
        statement: "CEO attended meeting March 5",
        source: "security_log.png",
        credibility: "very_high"
      },
      analysis: "CEO testimony directly contradicts security log and email evidence",
      verdict: "CEO knew by March 5, not March 15",
      confidence: 0.98
    }
  ],

  confidenceScores: {
    overall: 0.95,
    metadata: 0.98,
    content: 0.92
  },

  summary: "Documentary evidence proves CEO had knowledge by March 5. March 15 claim is false. Stock sales suggest insider trading.",

  rawResult: {
    files: [
      { fileName: 'security_log.png', category: 'image' },
      { fileName: 'stock_trades.pdf', category: 'document' },
      { fileName: 'email_evidence.pdf', category: 'document' },
      { fileName: 'board_meeting_transcript.pdf', category: 'document' },
      { fileName: 'ceo_interview.mp3', category: 'audio' }
    ]
  }
};