import { useState } from 'react'

function App() {
  const [message, setMessage] = useState('Click the button to test setup')

  const testSetup = () => {
    setMessage('Verity is ready! Next we test Gemini API.')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          Verity
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Forensic Truth Verification
        </p>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="text-lg text-gray-700">{message}</p>
        </div>
        <button 
          onClick={testSetup}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold"
        >
          Test Setup
        </button>
      </div>
    </div>
  )
}

export default App