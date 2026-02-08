export default function Timeline({ events }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Timeline</h2>
        <p className="text-gray-500">No timeline events found in the evidence.</p>
      </div>
    );
  }

  const getConfidenceBadge = (confidence) => {
    const colors = {
      'very_high': 'bg-green-100 text-green-800',
      'high': 'bg-blue-100 text-blue-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-red-100 text-red-800'
    };
    return colors[confidence] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (datetime) => {
    try {
      const date = new Date(datetime);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return datetime;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
      <h2 className="text-xl md:text-2xl font-semibold mb-6">Verified Timeline</h2>
      <div className="relative">
        <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
        
        {events.map((event, i) => (
          <div key={i} className="relative pl-10 md:pl-16 pb-8 last:pb-0">
            <div className="absolute left-2.5 md:left-6 top-1 w-3 h-3 md:w-5 md:h-5 rounded-full bg-blue-500 border-2 md:border-4 border-white shadow"></div>
            
            <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <p className="font-semibold text-sm md:text-base text-gray-900">{formatDate(event.datetime)}</p>
                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold self-start ${getConfidenceBadge(event.confidence)}`}>
                  {event.confidence.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm md:text-base text-gray-700 mb-2">{event.event}</p>
              
              {event.sources && event.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.sources.map((source, idx) => (
                    <span key={idx} className="text-xs bg-white px-2 py-1 rounded border border-gray-200 break-all">
                      {source}
                    </span>
                  ))}
                </div>
              )}
              
              {event.reasoning && (
                <p className="text-xs md:text-sm text-gray-600 italic">
                  {event.reasoning}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}