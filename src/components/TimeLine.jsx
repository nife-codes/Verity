import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Timeline({ events }) {
  const [visibleEvents, setVisibleEvents] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    setVisibleEvents([]);
    events.forEach((_, index) => {
      setTimeout(() => {
        setVisibleEvents((prev) => [...prev, index]);
      }, index * 300);
    });
  }, [events]);

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
      very_high: 'bg-green-100 text-green-800',
      high: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-red-100 text-red-800',
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
        minute: '2-digit',
      });
    } catch {
      return datetime;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6"
    >
      <h2 className="text-xl md:text-2xl font-semibold mb-6">Verified Timeline</h2>
      <div className="relative">
        <svg
          className="absolute left-4 md:left-8 top-0"
          style={{ height: '100%', width: '2px' }}
        >
          <motion.line
            x1="1"
            y1="0"
            x2="1"
            y2="100%"
            stroke="#3b82f6"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </svg>

        {events.map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -50 }}
            animate={
              visibleEvents.includes(i)
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -50 }
            }
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative pl-10 md:pl-16 pb-8 last:pb-0"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={visibleEvents.includes(i) ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="absolute left-2.5 md:left-6 top-1 w-3 h-3 md:w-5 md:h-5 rounded-full bg-blue-500 border-2 md:border-4 border-white shadow-lg"
            />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={visibleEvents.includes(i) ? { scale: 1 } : { scale: 0.95 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 md:p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <p className="font-semibold text-sm md:text-base text-gray-900">
                  {formatDate(event.datetime)}
                </p>
                <span
                  className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold self-start ${getConfidenceBadge(
                    event.confidence
                  )}`}
                >
                  {event.confidence.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <p className="text-sm md:text-base text-gray-700 mb-2 font-medium">
                {event.event}
              </p>

              {event.sources && event.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-200 break-all"
                    >
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
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}