export default function Contradictions({ contradictions }) {
  if (!contradictions || contradictions.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-4 text-white">Contradictions</h2>
        <div className="bg-emerald-900/20 border border-emerald-900/30 rounded-lg p-4">
          <p className="text-emerald-400">No contradictions detected. All evidence sources are consistent.</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': 'border-red-500 bg-red-900/20',
      'major': 'border-orange-500 bg-orange-900/20',
      'minor': 'border-yellow-500 bg-yellow-900/20'
    };
    return colors[severity] || 'border-slate-600 bg-slate-800';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      'critical': 'CRITICAL',
      'major': 'MAJOR',
      'minor': 'MINOR'
    };
    return icons[severity] || 'MINOR';
  };

  const getCredibilityColor = (credibility) => {
    const colors = {
      'high': 'text-emerald-400',
      'medium': 'text-yellow-400',
      'low': 'text-red-400'
    };
    return colors[credibility] || 'text-slate-400';
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 md:p-6 backdrop-blur-sm">
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-white">
        Contradictions Detected ({contradictions.length})
      </h2>

      <div className="space-y-4">
        {contradictions.map((c, i) => (
          <div key={i} className={`border-l-4 rounded-lg p-4 md:p-5 ${getSeverityColor(c.severity)}`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
              <span className="text-xs font-bold px-2 py-1 bg-slate-800 text-white rounded">{getSeverityIcon(c.severity)}</span>
              <div className="flex-1">
                <p className="font-bold text-base md:text-lg mb-1 text-white">
                  {c.severity.toUpperCase()} Contradiction
                </p>
                <p className="text-xs md:text-sm text-slate-400">ID: {c.id}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs md:text-sm text-slate-400">Confidence</p>
                <p className="text-xl md:text-2xl font-bold text-blue-400">
                  {(c.confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-800 rounded p-3 border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 mb-1">CLAIM A</p>
                <p className="text-sm mb-2 break-words text-slate-200">{c.claim_a.statement}</p>
                <p className="text-xs text-slate-400 break-all">Source: {c.claim_a.source}</p>
                <p className={`text-xs font-semibold ${getCredibilityColor(c.claim_a.credibility)}`}>
                  Credibility: {c.claim_a.credibility.toUpperCase()}
                </p>
              </div>

              <div className="bg-slate-800 rounded p-3 border border-slate-700">
                <p className="text-xs font-semibold text-slate-400 mb-1">CLAIM B</p>
                <p className="text-sm mb-2 break-words text-slate-200">{c.claim_b.statement}</p>
                <p className="text-xs text-slate-400 break-all">Source: {c.claim_b.source}</p>
                <p className={`text-xs font-semibold ${getCredibilityColor(c.claim_b.credibility)}`}>
                  Credibility: {c.claim_b.credibility.toUpperCase()}
                </p>
              </div>
            </div>

            {c.analysis && (
              <div className="bg-slate-800 rounded p-3 border border-slate-700 mb-3">
                <p className="text-xs font-semibold text-slate-400 mb-1">ANALYSIS</p>
                <p className="text-sm text-slate-300 break-words">{c.analysis}</p>
              </div>
            )}

            <div className="bg-emerald-900/20 border border-emerald-900/30 rounded p-3">
              <p className="text-xs font-semibold text-emerald-400 mb-1">VERDICT</p>
              <p className="text-sm text-emerald-300 font-medium break-words">{c.verdict}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}