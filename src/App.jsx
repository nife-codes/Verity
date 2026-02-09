import { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './components/FileUpload';
import { MOCK_ANALYSIS } from './utils/mockData';
import { analyzeEvidence, mockAnalyzeEvidence } from './services/gemini';
import { processFiles } from './services/fileProcessor';
import ThinkingMode from './components/ThinkingMode';
import Timeline from './components/Timeline';
import Contradictions from './components/Contradictions';
import ContradictionMap from './components/ContradictionMap';
import EvidenceCards from './components/EvidenceCards';
import DownloadReport from './components/DownloadReport';
import BubbleScene from './components/BubbleScene';

const USE_MOCK = false;

function App() {
  const [stage, setStage] = useState('upload');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const handleFilesUploaded = async (files) => {
    setStage('processing');
    setError(null);

    try {
      if (USE_MOCK) {
        setProgress('Processing files and extracting metadata...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockProcessed = await processFiles(files);

        setProgress('Phase 1: Extracting data with Gemini Flash...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        setProgress('Phase 2: Deep analysis with Gemini Pro (Thinking Mode)...');
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockResult = mockAnalyzeEvidence(mockProcessed.files);

        // Transform to match expected format
        setAnalysis({
          thinking: mockResult.analysis.thinkingSteps.join('\n\n'),
          thinkingSteps: mockResult.analysis.thinkingSteps,
          timeline: mockResult.analysis.result.timeline,
          contradictions: mockResult.analysis.result.contradictions,
          summary: mockResult.analysis.result.verdict,
          confidenceScores: mockResult.analysis.result.confidenceScores,
          rawResult: mockResult
        });
        setStage('results');
        return;
      }


      setProgress('Processing files and extracting metadata...');
      const processResult = await processFiles(files);

      if (!processResult.success) {
        throw new Error(processResult.error || 'File processing failed');
      }

      setProgress('Phase 1: Extracting data with Gemini Flash...');
      setProgress('Phase 2: Deep analysis with Gemini Pro (Thinking Mode)...');

      const analysisResult = await analyzeEvidence(processResult.files);

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Transform to match expected format
      setAnalysis({
        thinking: analysisResult.analysis.thinkingSteps.join('\n\n'),
        thinkingSteps: analysisResult.analysis.thinkingSteps,
        timeline: analysisResult.analysis.result.timeline || [],
        contradictions: analysisResult.analysis.result.contradictions || [],
        summary: analysisResult.analysis.result.verdict || 'Analysis complete',
        confidenceScores: analysisResult.analysis.result.confidenceScores,
        rawResult: analysisResult
      });
      setStage('results');
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setStage('error');
    }
  };

  const handleTryDemo = () => {
    setStage('processing');
    setProgress('Loading demo analysis');

    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStage('results');
    }, 1500);
  };

  if (stage === 'upload') {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <BubbleScene />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

          <motion.header
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-8xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Anta, sans-serif' }}>
              VERITY
            </h1>
            <p className="text-sm uppercase tracking-widest text-emerald-400 mb-8 font-mono">
              Forensic Evidence Verification System
            </p>
          </motion.header>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <button
              onClick={handleTryDemo}
              className="px-8 py-4 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-all duration-200"
            >
              Launch Forensic Analysis
            </button>

            <button
              onClick={handleTryDemo}
              className="px-8 py-4 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-emerald-500 hover:text-emerald-400 transition-all duration-200"
            >
              View Sample Audit
            </button>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6 mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
              <h3 className="text-base font-semibold mb-2 text-white uppercase tracking-wide font-mono">
                Multimodal Processing
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Handles documents, images, audio, and video in a single analysis
              </p>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
              <h3 className="text-base font-semibold mb-2 text-white uppercase tracking-wide font-mono">
                Reasoning Transparency
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Displays step-by-step analysis process and confidence levels
              </p>
            </div>

            <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300">
              <h3 className="text-base font-semibold mb-2 text-white uppercase tracking-wide font-mono">
                Source Assessment
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Evaluates credibility based on evidence type and corroboration
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="text-center mb-6">
              <span className="text-sm uppercase tracking-wider text-slate-500 font-mono">
                or upload evidence for verification
              </span>
            </div>
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </motion.div>

          <motion.footer
            className="mt-16 pt-8 border-t border-slate-800 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <p className="text-xs text-slate-600 uppercase tracking-wider font-mono">
              Applications: Journalism • Legal Discovery • Compliance Auditing • Academic Research
            </p>
          </motion.footer>
        </div>
      </div>
    );
  }

  if (stage === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full px-6">
          <div className="bg-white border border-slate-200 rounded-lg p-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-700"></div>
              </div>

              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Processing Evidence
              </h3>

              <div className="w-full space-y-3 mt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${progress.includes('Extracting') || progress.includes('Analyzing') ? 'bg-blue-700' : 'bg-slate-300'}`}></div>
                  <p className="text-sm text-slate-600">
                    {progress.includes('Extracting') ? 'Extracting content...' : progress.includes('Extracting') ? 'Content extracted' : 'Awaiting extraction'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${progress.includes('Analyzing') ? 'bg-blue-700 animate-pulse' : progress.includes('Loading') ? 'bg-blue-700' : 'bg-slate-300'}`}></div>
                  <p className="text-sm text-slate-600">
                    {progress.includes('Analyzing') ? 'Analyzing evidence...' : progress.includes('Loading') ? 'Analysis complete' : 'Awaiting analysis'}
                  </p>
                </div>
              </div>

              {progress && (
                <p className="text-xs text-slate-400 mt-6 text-center">
                  {progress}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-2xl p-8">
          <div className="text-5xl mb-4 text-red-500">×</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">Analysis Failed</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => setStage('upload')}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Analysis Results</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <DownloadReport analysis={analysis} />
              <button
                onClick={() => setStage('upload')}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-medium transition-colors duration-200 text-sm md:text-base"
              >
                New Analysis
              </button>
            </div>
          </motion.div>

          <ThinkingMode thinkingText={analysis.thinking} thinkingSteps={analysis.thinkingSteps} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <EvidenceCards files={analysis.rawResult?.files || []} analysis={analysis} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <ContradictionMap contradictions={analysis.contradictions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Timeline events={analysis.timeline} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Contradictions contradictions={analysis.contradictions} />
          </motion.div>

          {analysis.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mt-6 shadow-md"
            >
              <h2 className="text-xl font-semibold mb-3 text-slate-900">Final Verdict</h2>
              <p className="text-slate-700 leading-relaxed text-lg">{analysis.summary}</p>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
}

export default App;