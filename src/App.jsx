import { useState } from 'react';
import { motion } from 'framer-motion';
import FileUpload from './components/FileUpload';
import SampleSelector from './components/SampleSelector';
import ApiStatusBadge from './components/ApiStatusBadge';
import { MOCK_ANALYSIS } from './utils/mockData';
import { analyzeEvidence, mockAnalyzeEvidence } from './services/gemini';
import { processFiles } from './services/fileProcessor';
import ThinkingMode from './components/ThinkingMode';
import Timeline from './components/Timeline';
import Contradictions from './components/Contradictions';
import ContradictionMap from './components/ContradictionMap';
import EvidenceCards from './components/EvidenceCards';
import DownloadReport from './components/DownloadReport';


const USE_MOCK = false;

function App() {
  const [stage, setStage] = useState('upload');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const [isSampleMode, setIsSampleMode] = useState(false);

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

  const handleSampleSelected = async (sample) => {
    setStage('processing');
    setProgress('Loading sample evidence...');
    setIsSampleMode(true);
    setApiStatus('gemini-3-pro-sample');

    // Initialize with empty analysis
    setAnalysis({
      thinkingSteps: [],
      thinking: '',
      timeline: [],
      contradictions: [],
      tamperingIndicators: [],
      confidenceScores: {},
      summary: '',
      files: sample.files
    });

    // Wait a bit before starting
    await new Promise(resolve => setTimeout(resolve, 500));
    setStage('results');

    // Simulate progressive thinking steps (one at a time, no duplicates)
    for (let i = 0; i < sample.gemini3Output.thinkingSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200)); // Slower for smoother effect

      setAnalysis(prev => ({
        ...prev,
        thinkingSteps: sample.gemini3Output.thinkingSteps.slice(0, i + 1), // Only include up to current step
        thinking: sample.gemini3Output.thinkingSteps.slice(0, i + 1).join('\n\n')
      }));
    }

    // Display final analysis after all thinking steps
    await new Promise(resolve => setTimeout(resolve, 800));
    setAnalysis({
      thinking: sample.gemini3Output.thinkingSteps.join('\n\n'),
      thinkingSteps: sample.gemini3Output.thinkingSteps,
      timeline: sample.gemini3Output.analysis.timeline,
      contradictions: sample.gemini3Output.analysis.contradictions,
      tamperingIndicators: sample.gemini3Output.analysis.tamperingIndicators || [],
      confidenceScores: sample.gemini3Output.analysis.confidenceScores,
      summary: sample.gemini3Output.analysis.verdict,
      files: sample.files
    });
  };

  const handleTryDemo = () => {
    setStage('processing');
    setProgress('Loading demo analysis');
    setApiStatus(null);
    setIsSampleMode(false);

    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStage('results');
    }, 1500);
  };

  if (stage === 'upload') {
    return (
      <div className="min-h-screen cyber-grid-bg relative overflow-hidden">

        {apiStatus && <ApiStatusBadge status={apiStatus} />}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">

          <motion.header
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-8xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: 'Anta, sans-serif' }}>
              VERITY
            </h1>
            <p className="text-sm uppercase tracking-widest text-emerald-400 mb-2 font-mono">
              Forensic Evidence Verification System
            </p>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Powered by Gemini 3 Pro's advanced reasoning capabilities
            </p>
          </motion.header>

          {/* PRIMARY CTA - Sample Evidence */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-3">
                Try Sample Evidence
                <span className="ml-3 px-2 py-1 bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-[10px] font-mono rounded-full align-middle">
                  RECOMMENDED
                </span>
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl mx-auto">
                Pre-validated Gemini 3 Pro analysis • Works instantly • No quota limits
              </p>
            </div>

            {/* Sample Selector - Now the star of the show */}
            <SampleSelector onSelectSample={handleSampleSelected} />
          </motion.div>

          {/* Divider */}
          <div className="relative my-16">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-black text-slate-500 uppercase tracking-wider font-mono">
                Or Upload Your Own Evidence
              </span>
            </div>
          </div>

          {/* SECONDARY OPTION - Custom Upload */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold text-white mb-3">
                Custom Evidence Analysis
              </h3>
              <p className="text-slate-400 text-sm mb-6">
                Upload your own files for live analysis with automatic fallback if quota exceeded
              </p>

              <button
                onClick={handleTryDemo}
                className="px-8 py-4 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-emerald-500 hover:text-emerald-400 hover:bg-slate-800/80 transition-all duration-200"
              >
                Launch Custom Analysis
              </button>

              <p className="text-xs text-slate-500 mt-4 font-mono">
                Note: May use Gemini 2.0 Flash if Gemini 3 quota is exceeded
              </p>
            </div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
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
      <div className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <div className="max-w-md w-full px-6">
          <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-8 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-emerald-500"></div>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">
                Processing Evidence
              </h3>

              <div className="w-full space-y-3 mt-6">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${progress.includes('Extracting') || progress.includes('Analyzing') ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                  <p className="text-sm text-slate-300">
                    {progress.includes('Extracting') ? 'Extracting content...' : progress.includes('Extracting') ? 'Content extracted' : 'Awaiting extraction'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${progress.includes('Analyzing') ? 'bg-emerald-500 animate-pulse' : progress.includes('Loading') ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                  <p className="text-sm text-slate-300">
                    {progress.includes('Analyzing') ? 'Analyzing evidence...' : progress.includes('Loading') ? 'Analysis complete' : 'Awaiting analysis'}
                  </p>
                </div>
              </div>

              {progress && (
                <p className="text-xs text-slate-500 mt-6 text-center">
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
      <div className="min-h-screen cyber-grid-bg flex items-center justify-center">
        <div className="text-center max-w-2xl p-8">
          <div className="text-5xl mb-4 text-red-500">×</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Analysis Failed</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => setStage('upload')}
            className="px-6 py-3 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-all duration-200"
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