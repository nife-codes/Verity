import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ThinkingMode Component - Progressive Display of Gemini's Reasoning
 * Shows each thinking step with visual indicators and animations
 */
export default function ThinkingMode({ thinkingText, thinkingSteps }) {
  const [displayedSteps, setDisplayedSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  // Use thinkingSteps array if provided, otherwise parse thinkingText
  const steps = thinkingSteps || (thinkingText ? thinkingText.split('\n\n').filter(s => s.trim()) : []);

  useEffect(() => {
    if (!steps || steps.length === 0) return;

    setDisplayedSteps([]);
    setCurrentStepIndex(0);
    setIsTyping(true);

    // Progressive reveal of thinking steps
    let index = 0;
    const interval = setInterval(() => {
      if (index < steps.length) {
        setDisplayedSteps(prev => [...prev, steps[index]]);
        setCurrentStepIndex(index);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 800); // Show new step every 800ms

    return () => clearInterval(interval);
  }, [thinkingText, thinkingSteps]);

  if (!steps || steps.length === 0) return null;

  // Get icon for step based on content
  const getStepIcon = (step) => {
    const stepLower = step.toLowerCase();
    if (stepLower.includes('extract') || stepLower.includes('processing')) return '📊';
    if (stepLower.includes('analyz') || stepLower.includes('examin')) return '🔍';
    if (stepLower.includes('contradiction') || stepLower.includes('conflict')) return '⚠️';
    if (stepLower.includes('timeline') || stepLower.includes('chronolog')) return '📅';
    if (stepLower.includes('cross-reference') || stepLower.includes('compar')) return '🔗';
    if (stepLower.includes('metadata') || stepLower.includes('timestamp')) return '⏱️';
    if (stepLower.includes('complete') || stepLower.includes('success')) return '✅';
    if (stepLower.includes('confidence') || stepLower.includes('score')) return '📈';
    return '🧠';
  };

  // Get color for step
  const getStepColor = (step) => {
    const stepLower = step.toLowerCase();
    if (stepLower.includes('contradiction') || stepLower.includes('conflict')) return 'border-red-500 bg-red-50';
    if (stepLower.includes('complete') || stepLower.includes('success')) return 'border-green-500 bg-green-50';
    if (stepLower.includes('warning') || stepLower.includes('caution')) return 'border-yellow-500 bg-yellow-50';
    return 'border-blue-500 bg-blue-50';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 rounded-lg mb-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-2xl">🧠</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">
            Reasoning Process
          </h3>
          <p className="text-xs text-blue-600 uppercase tracking-wide font-mono">
            Gemini 3 Pro • Thinking Mode Active
          </p>
        </div>
        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-mono">
            <div className="animate-pulse">●</div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayedSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`border-l-2 ${getStepColor(step)} pl-4 py-3 rounded-r-lg`}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5">
                  {getStepIcon(step)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">
                      Step {index + 1}/{steps.length}
                    </span>
                    {index === currentStepIndex && isTyping && (
                      <span className="text-blue-600 animate-pulse text-xs">●</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {step}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator for next step */}
        {isTyping && displayedSteps.length < steps.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-l-2 border-slate-300 bg-slate-50 pl-4 py-3 rounded-r-lg"
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-300 border-t-blue-600"></div>
              <span className="text-xs text-slate-500 font-mono">
                Processing next step...
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {!isTyping && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-blue-200"
        >
          <p className="text-xs text-blue-600 font-mono text-center">
            ✓ Reasoning complete • {steps.length} steps analyzed
          </p>
        </motion.div>
      )}
    </div>
  );
}