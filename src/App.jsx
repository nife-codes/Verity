import { useState } from 'react';
import FileUpload from './components/FileUpload';
import { MOCK_ANALYSIS } from './utils/mockData';
import { uploadFilesToGemini, extractContentFromFiles, masterAnalysis } from './services/gemini';

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
        await new Promise(resolve => setTimeout(resolve, 2000));
        setAnalysis(MOCK_ANALYSIS);
        setStage('results');
        return;
      }

      setProgress('Uploading files to Gemini...');
      const uploadedFiles = await uploadFilesToGemini(files);

      setProgress('Extracting content from files...');
      const extractedContent = await extractContentFromFiles(uploadedFiles);

      setProgress('Analyzing evidence and detecting contradictions...');
      const analysisResult = await masterAnalysis(extractedContent);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Analysis Results</h1>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Reasoning Process
            </h2>
            <pre className="text-sm text-blue-800 whitespace-pre-wrap font-mono">
              {analysis.thinking}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
            {analysis.timeline.map((event, i) => (
              <div key={i} className="mb-4 pb-4 border-b last:border-b-0">
                <p className="font-semibold">{event.datetime}</p>
                <p className="text-gray-700">{event.event}</p>
                <p className="text-sm text-gray-500">
                  Confidence: {event.confidence}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Contradictions</h2>
            {analysis.contradictions.map((c, i) => (
              <div key={i} className="border border-red-200 rounded p-4 mb-4">
                <p className="font-semibold text-red-600">{c.severity.toUpperCase()}</p>
                <p className="mt-2"><strong>Claim A:</strong> {c.claim_a.statement}</p>
                <p><strong>Claim B:</strong> {c.claim_b.statement}</p>
                <p className="mt-2 text-green-700"><strong>Verdict:</strong> {c.verdict}</p>
                <p className="text-sm text-gray-600">Confidence: {(c.confidence * 100).toFixed(0)}%</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStage('upload')}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Analyze New Evidence
          </button>
        </div>
      </div>
    );
  }
}

export default App;