export default function Contradictions({ contradictions }) {
    if (!contradictions || contradictions.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Contradictions</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">No contradictions detected. All evidence sources are consistent.</p>
          </div>
        </div>
      );
    }
  
    const getSeverityColor = (severity) => {
      const colors = {
        'critical': 'border-red-500 bg-red-50',
        'major': 'border-orange-500 bg-orange-50',
        'minor': 'border-yellow-500 bg-yellow-50'
      };
      return colors[severity] || 'border-gray-300 bg-gray-50';
    };
  
    const getSeverityIcon = (severity) => {
      const icons = {
        'critical': '🔴',
        'major': '🟡',
        'minor': '⚪'
      };
      return icons[severity] || '⚪';
    };
  
    const getCredibilityColor = (credibility) => {
      const colors = {
        'high': 'text-green-700',
        'medium': 'text-yellow-700',
        'low': 'text-red-700'
      };
      return colors[credibility] || 'text-gray-700';
    };
  
    return (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-semibold mb-6">
          Contradictions Detected ({contradictions.length})
        </h2>
        
        <div className="space-y-4">
          {contradictions.map((c, i) => (
            <div key={i} className={`border-l-4 rounded-lg p-4 md:p-5 ${getSeverityColor(c.severity)}`}>
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
                <span className="text-2xl">{getSeverityIcon(c.severity)}</span>
                <div className="flex-1">
                  <p className="font-bold text-base md:text-lg mb-1">
                    {c.severity.toUpperCase()} Contradiction
                  </p>
                  <p className="text-xs md:text-sm text-gray-600">ID: {c.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs md:text-sm text-gray-600">Confidence</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">
                    {(c.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
      
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-1">CLAIM A</p>
                  <p className="text-sm mb-2 break-words">{c.claim_a.statement}</p>
                  <p className="text-xs text-gray-600 break-all">Source: {c.claim_a.source}</p>
                  <p className={`text-xs font-semibold ${getCredibilityColor(c.claim_a.credibility)}`}>
                    Credibility: {c.claim_a.credibility.toUpperCase()}
                  </p>
                </div>
      
                <div className="bg-white rounded p-3 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-1">CLAIM B</p>
                  <p className="text-sm mb-2 break-words">{c.claim_b.statement}</p>
                  <p className="text-xs text-gray-600 break-all">Source: {c.claim_b.source}</p>
                  <p className={`text-xs font-semibold ${getCredibilityColor(c.claim_b.credibility)}`}>
                    Credibility: {c.claim_b.credibility.toUpperCase()}
                  </p>
                </div>
              </div>
      
              {c.analysis && (
                <div className="bg-white rounded p-3 border border-gray-200 mb-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">ANALYSIS</p>
                  <p className="text-sm text-gray-700 break-words">{c.analysis}</p>
                </div>
              )}
      
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-xs font-semibold text-green-700 mb-1">VERDICT</p>
                <p className="text-sm text-green-800 font-medium break-words">{c.verdict}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }