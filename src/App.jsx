import { useState } from 'react';
import FileUpload from './components/FileUpload';
import { MOCK_ANALYSIS } from './utils/mockData';
import { extractContentFromFiles, masterAnalysis } from './services/gemini';
import ThinkingMode from './components/ThinkingMode';
import Timeline from './components/Timeline';
import Contradictions from './components/Contradictions';
import DownloadReport from './components/DownloadReport';

const USE_MOCK = true;

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
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysis(MOCK_ANALYSIS);
        setStage('results');
        return;
      }
  
      setProgress('Extracting content from files...');
      const extractedContent = await extractContentFromFiles(files);
  
      setProgress('Analyzing evidence and detecting contradictions...');
      const analysisResult = await masterAnalysis(extractedContent);
  
      setAnalysis(analysisResult);
      setStage('results');
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
      setStage('error');
    }
  };

  const handleTryDemo = () => {
    setStage('processing');
    setProgress('Loading demo analysis...');
    
    setTimeout(() => {
      setAnalysis(MOCK_ANALYSIS);
      setStage('results');
    }, 1500);
  };

  if (stage === 'upload') {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 py-12">
          
          <header className="mb-12">
            <h1 className="text-4xl font-semibold text-slate-900 mb-3">
              Verity
            </h1>
            <p className="text-lg text-slate-600 mb-2">
              Forensic verification for contradictory evidence
            </p>
            <p className="text-base text-slate-500 max-w-2xl">
              Analyzes multiple evidence sources to reconstruct timelines, identify contradictions, and assess credibility.
            </p>
          </header>
  
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-base mb-2 text-slate-900">
                Multimodal Processing
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Handles documents, images, audio, and video in a single analysis
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-base mb-2 text-slate-900">
                Reasoning Transparency
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Displays step-by-step analysis process and confidence levels
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-base mb-2 text-slate-900">
                Source Assessment
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Evaluates credibility based on evidence type and corroboration
              </p>
            </div>
          </div>
  
          <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2 text-slate-900">
              Demo Analysis
            </h2>
            <p className="text-sm text-slate-600 mb-5">
              Pre-loaded case examining potential insider trading through document analysis
            </p>
            <button
              onClick={handleTryDemo}
              className="w-full bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-base hover:bg-blue-800 transition-colors duration-200"
            >
              Load Demo Case
            </button>
          </div>
  
          <div className="text-center mb-6">
            <span className="text-sm text-slate-400 font-medium">
              or analyze your own evidence
            </span>
          </div>
  
          <FileUpload onFilesUploaded={handleFilesUploaded} />
  
          <footer className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Applications: Journalism, Legal Discovery, Compliance Auditing, Academic Research
            </p>
          </footer>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-slate-900">Analysis Results</h1>
            <div className="flex gap-3">
              <DownloadReport analysis={analysis} />
              <button
                onClick={() => setStage('upload')}
                className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-medium transition-colors duration-200"
              >
                New Analysis
              </button>
            </div>
          </div>
          
          <ThinkingMode thinkingText={analysis.thinking} />
          <Timeline events={analysis.timeline} />
          <Contradictions contradictions={analysis.contradictions} />

          {analysis.summary && (
            <div className="bg-white border border-slate-200 rounded-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-3 text-slate-900">Summary</h2>
              <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;