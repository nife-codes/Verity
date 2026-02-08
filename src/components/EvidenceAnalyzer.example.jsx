import React, { useState } from 'react';
import { processFiles } from '../services/fileProcessor.js';
import { analyzeEvidence, mockAnalyzeEvidence } from '../services/gemini3.js';

/**
 * Example React component showing Gemini 3 integration
 * Displays thinking steps and analysis results
 */
function EvidenceAnalyzer() {
    const [files, setFiles] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [currentPhase, setCurrentPhase] = useState('');

    const handleFileUpload = (event) => {
        const uploadedFiles = Array.from(event.target.files);
        setFiles(uploadedFiles);
        setResult(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        if (files.length === 0) {
            setError('Please upload files first');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setCurrentPhase('Processing files...');

        try {
            // Step 1: Process files (extract metadata, convert to base64)
            const processResult = await processFiles(files);

            if (!processResult.success) {
                throw new Error(processResult.error);
            }

            setCurrentPhase('Extracting data with Gemini Flash...');

            // Step 2: Analyze with Gemini 3
            const analysisResult = await analyzeEvidence(processResult.files);

            if (!analysisResult.success) {
                throw new Error(analysisResult.error);
            }

            setResult(analysisResult);
            setCurrentPhase('Complete!');
        } catch (err) {
            console.error('Analysis error:', err);
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleMockAnalyze = async () => {
        setAnalyzing(true);
        setCurrentPhase('Running mock analysis...');

        try {
            const processResult = await processFiles(files);
            const mockResult = mockAnalyzeEvidence(processResult.files);
            setResult(mockResult);
            setCurrentPhase('Complete!');
        } catch (err) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="evidence-analyzer">
            <h2>Forensic Evidence Analyzer</h2>

            {/* File Upload */}
            <div className="upload-section">
                <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={analyzing}
                />
                <p>{files.length} file(s) selected</p>
            </div>

            {/* Action Buttons */}
            <div className="actions">
                <button onClick={handleAnalyze} disabled={analyzing || files.length === 0}>
                    {analyzing ? 'Analyzing...' : 'Analyze Evidence'}
                </button>
                <button onClick={handleMockAnalyze} disabled={analyzing || files.length === 0}>
                    Mock Analysis (Dev)
                </button>
            </div>

            {/* Current Phase */}
            {analyzing && (
                <div className="phase-indicator">
                    <p>⚡ {currentPhase}</p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="error">
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="results">
                    {/* Thinking Steps - CRITICAL FOR DEMO */}
                    {result.analysis.thinkingSteps.length > 0 && (
                        <div className="thinking-steps">
                            <h3>🧠 Gemini's Reasoning Process</h3>
                            <div className="thinking-list">
                                {result.analysis.thinkingSteps.map((step, index) => (
                                    <div key={index} className="thinking-step">
                                        <span className="step-number">{index + 1}</span>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    {result.analysis.result.timeline && (
                        <div className="timeline">
                            <h3>📅 Timeline</h3>
                            <ul>
                                {result.analysis.result.timeline.map((event, index) => (
                                    <li key={index}>
                                        <strong>{event.time}</strong>: {event.event}
                                        <span className="source">({event.source})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contradictions */}
                    {result.analysis.result.contradictions && result.analysis.result.contradictions.length > 0 && (
                        <div className="contradictions">
                            <h3>⚠️ Contradictions Detected</h3>
                            <ul>
                                {result.analysis.result.contradictions.map((contradiction, index) => (
                                    <li key={index} className={`severity-${contradiction.severity}`}>
                                        <strong>{contradiction.type}</strong>: {contradiction.description}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Tampering Indicators */}
                    {result.analysis.result.tamperingIndicators && result.analysis.result.tamperingIndicators.length > 0 && (
                        <div className="tampering">
                            <h3>🚨 Tampering Indicators</h3>
                            <ul>
                                {result.analysis.result.tamperingIndicators.map((indicator, index) => (
                                    <li key={index}>{indicator}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Confidence Scores */}
                    {result.analysis.result.confidenceScores && (
                        <div className="confidence">
                            <h3>📊 Confidence Scores</h3>
                            <div className="scores">
                                {Object.entries(result.analysis.result.confidenceScores).map(([key, value]) => (
                                    <div key={key} className="score-item">
                                        <span className="score-label">{key}:</span>
                                        <div className="score-bar">
                                            <div
                                                className="score-fill"
                                                style={{ width: `${value * 100}%` }}
                                            />
                                        </div>
                                        <span className="score-value">{(value * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verdict */}
                    {result.analysis.result.verdict && (
                        <div className="verdict">
                            <h3>⚖️ Verdict</h3>
                            <p className="verdict-text">{result.analysis.result.verdict}</p>
                            {result.analysis.result.reasoning && (
                                <details>
                                    <summary>Show detailed reasoning</summary>
                                    <p>{result.analysis.result.reasoning}</p>
                                </details>
                            )}
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="metadata">
                        <p>
                            <small>
                                Analyzed {result.filesAnalyzed} files at {new Date(result.timestamp).toLocaleString()}
                            </small>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default EvidenceAnalyzer;
