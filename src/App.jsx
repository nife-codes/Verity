import { useState } from 'react'
import { testGeminiConnection } from './services/gemini'

function App() {
  const [message, setMessage] = useState('Click the button to test Gemini API connection')
  const [loading, setLoading] = useState(false)
  const [tested, setTested] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setMessage('Testing Gemini API connection...')
    
    const result = await testGeminiConnection()
    
    if (result.success) {
      setMessage(`SUCCESS!\n\n${result.message}${result.note ? '\n\n' + result.note : ''}`)
      setTested(true)
    } else {
      setMessage(`FAILED\n\n${result.message}\n\nCheck your .env file and make sure VITE_GEMINI_API_KEY is set correctly.`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Verity
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Forensic Truth Verification Engine
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-lg text-gray-700 whitespace-pre-line">{message}</p>
        </div>
        <button 
          onClick={testAPI}
          disabled={loading}
          className={`px-8 py-4 rounded-lg transition text-lg font-semibold ${
            tested 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:bg-gray-400`}
        >
          {loading ? 'Testing...' : tested ? 'API Connected' : 'Test Gemini API'}
        </button>
      </div>
    </div>
  )
}

export default App