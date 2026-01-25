import { useState } from 'react';
import FileUpload from './components/FileUpload';
import { MOCK_ANALYSIS } from './utils/mockData';
import { extractContentFromFiles, masterAnalysis } from './services/gemini';
import ThinkingMode from './components/ThinkingMode';
import Timeline from './components/Timeline';
import Contradictions from './components/Contradictions';

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
        console.log('Using mock data');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysis(MOCK_ANALYSIS);
        setStage('results');
        return;
      }
  
      console.log('Starting real analysis with', files.length, 'files');
  
      setProgress('Extracting content from files...');
      const extractedContent = await extractContentFromFiles(files);
      console.log('Extracted content:', extractedContent);
  
      setProgress('Analyzing evidence and detecting contradictions...');
      const analysisResult = await masterAnalysis(extractedContent);
      console.log('Analysis result:', analysisResult);
  
      setAnalysis(analysisResult);
      setStage('results');
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'Analysis failed. Please try again.');
      setStage('error');
    }
  };

  if (stage === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Verity
          </h1>
          <p className="text-xl text-gray-600">
            Forensic Truth Verification Engine
          </p>
        </div>
        <FileUpload onFilesUploaded={handleFilesUploaded} />
      </div>
    );
  }

  if (stage === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 mb-2">Analyzing evidence...</p>
          <p className="text-sm text-gray-500">{progress}</p>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-2xl p-8">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Failed</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => setStage('upload')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Analysis Results</h1>
            <button
              onClick={() => setStage('upload')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Analyze New Evidence
            </button>
          </div>
          
          <ThinkingMode thinkingText={analysis.thinking} />
          <Timeline events={analysis.timeline} />
          <Contradictions contradictions={analysis.contradictions} />

          {analysis.summary && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-4">Summary</h2>
              <p className="text-gray-700">{analysis.summary}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default App;