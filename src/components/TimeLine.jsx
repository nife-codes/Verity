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
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 mb-6 backdrop-blur-sm">
        <h2 className="text-2xl font-semibold mb-4 text-white">Timeline</h2>
        <p className="text-slate-400">No timeline events found in the evidence.</p>
      </div>
    );
  }

  const getConfidenceBadge = (confidence) => {
    const colors = {
      very_high: 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/30',
      high: 'bg-blue-900/30 text-blue-400 border border-blue-500/30',
      medium: 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30',
      low: 'bg-red-900/30 text-red-400 border border-red-500/30',
    };
    return colors[confidence] || 'bg-slate-800 text-slate-400 border border-slate-600';
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
      className="mb-8"
    >
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-white">Verified Timeline</h2>
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
            stroke="#374151"
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
              className="absolute left-2.5 md:left-6 top-1 w-3 h-3 md:w-5 md:h-5 rounded-full bg-blue-500 border-2 md:border-4 border-slate-900 shadow-lg z-10"
            />

            <motion.div
              initial={{ scale: 0.95 }}
              animate={visibleEvents.includes(i) ? { scale: 1 } : { scale: 0.95 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 md:p-4 hover:border-blue-500/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <p className="font-semibold text-sm md:text-base text-white">
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

              <p className="text-sm md:text-base text-slate-300 mb-2 font-medium">
                {event.event}
              </p>

              {event.sources && event.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {event.sources.map((source, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700 break-all"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              )}

              {event.reasoning && (
                <p className="text-xs md:text-sm text-slate-500 italic">
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