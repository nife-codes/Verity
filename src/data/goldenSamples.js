/**
 * Golden Path Samples - Pre-validated Gemini 3 Pro Outputs
 * 
 * These samples contain ACTUAL Gemini 3 Pro analysis from AI Studio,
 * demonstrating the model's advanced reasoning capabilities for forensic analysis.
 * 
 * Use these for hackathon demos to showcase Gemini 3 without quota limitations.
 */

export const GOLDEN_SAMPLES = [
    {
        id: "insider-trading",
        name: "Corporate Insider Trading Case",
        description: "CEO stock sales + acquisition timeline analysis with Material Non-Public Information (MNPI)",
        category: "Financial Fraud",
        complexity: "High",
        files: [
            {
                fileName: "quarterly_meeting_transcript.pdf",
                fileType: "application/pdf",
                category: "pdf",
                description: "Board meeting transcript where CEO admits to March 5th meetings"
            },
            {
                fileName: "ceo_interview_script.txt",
                fileType: "text/plain",
                category: "document",
                description: "Public interview where CEO claims ignorance until March 15th"
            },
            {
                fileName: "executive_floor_access_log.png",
                fileType: "image/png",
                category: "image",
                description: "Digital access logs showing CEO at strategic session"
            },
            {
                fileName: "merrill_lynch_statement.pdf",
                fileType: "application/pdf",
                category: "pdf",
                description: "Brokerage statement showing suspicious stock sales"
            },
            {
                fileName: "email_martinez_chen.pdf",
                fileType: "application/pdf",
                category: "pdf",
                description: "VP email to CEO about acquisition valuation"
            }
        ],

        // ACTUAL Gemini 3 Pro output from AI Studio (February 2026)
        gemini3Output: {
            modelUsed: "Gemini 3 Pro",
            validatedDate: "2026-02-09",
            thinkingSteps: [
                "Analyzing Forensic Evidence - I'm currently focused on analyzing uploaded files like transcripts and emails. My goal is to pinpoint contradictions and inconsistencies within the material.",

                "Refining Temporal Data - I'm now extracting and processing timestamps and dates from the provided files, aiming to construct a detailed timeline of events. I'm cross-referencing these elements against the claims made within each document.",

                "Evaluating Contradictions - I've uncovered a significant inconsistency: the CEO claims he first learned of Zenith Corp on March 15th, 2025. However, an email from March 8th, 2025, references a strategy session discussing Zenith Corp with the CEO.",

                "Investigating Anomalies Further - I've just reviewed additional data points. Specifically, I've noted a meeting on March 8, 2025, involving the CEO and several VPs and legal representatives. I'm also analyzing a Merrill Lynch account statement for the CEO, which details significant stock sales in the days leading up to the public announcement.",

                "Uncovering Stock Transaction Data - I'm now diving into the implications of the CEO's stock trades. The Merrill Lynch statement is raising red flags; the phrasing 'Total potential gain avoided' on the stock sales looks strange. It implies the CEO sold stock before an anticipated price hike.",

                "Constructing Timeline of Events - I'm now consolidating the timeline from various sources to solidify the sequence of events. The CEO initially mentioned informal conversations started in late February, with more serious discussions beginning on March 5th. This contrasts with his later statement in an interview on March 20th where he claimed to have heard about Zenith Corp on March 15th."
            ],

            analysis: {
                timeline: [
                    {
                        datetime: "2025-02-25T00:00:00Z",
                        event: "Informal conversations with Zenith begin via investment banking contacts.",
                        sources: ["quarterly_meeting_transcript.pdf"],
                        confidence: "medium",
                        reasoning: "Mentioned by CEO during board meeting; dates are approximate ('late February')."
                    },
                    {
                        datetime: "2025-03-05T08:42:15Z",
                        event: "CEO Michael Chen attends Executive Strategic Session with VP Martinez and Legal regarding Zenith.",
                        sources: ["executive_floor_access_log.png", "quarterly_meeting_transcript.pdf"],
                        confidence: "high",
                        reasoning: "Digital access logs provide precise entry/exit timestamps for specific personnel."
                    },
                    {
                        datetime: "2025-03-05T16:01:00Z",
                        event: "Michael Chen places orders to sell 80,000 TECH shares after market close.",
                        sources: ["merrill_lynch_statement.pdf"],
                        confidence: "high",
                        reasoning: "Brokerage statements are regulated financial records."
                    },
                    {
                        datetime: "2025-03-08T09:47:00Z",
                        event: "VP Martinez emails CEO Chen valuation numbers discussed in that morning's strategy session.",
                        sources: ["email_martinez_chen.pdf"],
                        confidence: "high",
                        reasoning: "Email metadata includes specific date/time and direct addressing of the CEO."
                    },
                    {
                        datetime: "2025-03-15T10:15:23Z",
                        event: "Quarterly Board Meeting: CEO presents Zenith acquisition for the first time formally.",
                        sources: ["quarterly_meeting_transcript.pdf"],
                        confidence: "high",
                        reasoning: "Internal corporate record of board proceedings."
                    },
                    {
                        datetime: "2025-03-16T00:00:00Z",
                        event: "Public announcement of Zenith Corporation acquisition.",
                        sources: ["merrill_lynch_statement.pdf"],
                        confidence: "high",
                        reasoning: "Confirmed by regulatory note on financial statement."
                    },
                    {
                        datetime: "2025-03-20T00:00:00Z",
                        event: "CEO Interview: Chen claims he first heard of the deal on March 15.",
                        sources: ["ceo_interview_script.txt"],
                        confidence: "high",
                        reasoning: "Transcript of direct interview; however, content is factually contradicted by other evidence."
                    }
                ],

                contradictions: [
                    {
                        id: "C1",
                        severity: "critical",
                        claim_a: {
                            statement: "I was informed on March 15th, 2025... That was the absolute first time I heard anything about Zenith Corp.",
                            source: "ceo_interview_script.txt",
                            credibility: "low"
                        },
                        claim_b: {
                            statement: "Our first formal meeting with Zenith was March 5th... The valuation analysis I shared with Michael on March 8th suggests a fair price point.",
                            source: "quarterly_meeting_transcript.pdf",
                            credibility: "high"
                        },
                        analysis: "The CEO claims 100% ignorance of the deal prior to March 15 in a public interview, but previously admitted in a recorded board meeting to having discussions as early as February and meetings on March 5.",
                        verdict: "Perjury/False Public Statement",
                        confidence: 0.99
                    },
                    {
                        id: "C2",
                        severity: "high",
                        claim_a: {
                            statement: "Any meetings that may have occurred were handled by our VP of Corporate Development without my involvement or knowledge.",
                            source: "ceo_interview_script.txt",
                            credibility: "low"
                        },
                        claim_b: {
                            statement: "08:42:15 - Chen, Michael (CEO) | Room: Conf Room A | Event: EXECUTIVE STRATEGIC SESSION | Attendees: CEO + Corp Dev + Legal.",
                            source: "executive_floor_access_log.png",
                            credibility: "high"
                        },
                        analysis: "Access logs prove the CEO was physically present in the strategic session on March 5, contradicting his claim that meetings were handled without his knowledge.",
                        verdict: "Documented Deception",
                        confidence: 0.98
                    }
                ],

                tamperingIndicators: [
                    {
                        type: "Suspicious Trading Pattern",
                        description: "Stock sales executed immediately after confidential strategic meeting",
                        severity: "critical",
                        evidence: "80,000 shares sold on March 5th, same day as Executive Strategic Session",
                        regulatoryImplication: "Potential SEC Regulation 10b-5 violation (insider trading)"
                    }
                ],

                confidenceScores: {
                    overall: 0.96,
                    metadata: 0.98,
                    content: 0.94
                },

                verdict: "The evidence demonstrates a clear pattern of deception by CEO Michael Chen. Digital logs, internal emails, and board transcripts confirm he was deeply involved in the Zenith acquisition from March 5 onwards. His public denial on March 20 is a complete fabrication, likely intended to hide the fact that he traded $10.2 million in stock immediately after obtaining non-public strategic information.",

                reasoning: "Documentary evidence (transcript, email, access logs, financial records) provides a high-confidence trail of CEO involvement contradicting public statements. The temporal correlation between the March 5th strategic session and immediate stock sales suggests Material Non-Public Information (MNPI) was used for trading decisions."
            }
        }
    }
];
