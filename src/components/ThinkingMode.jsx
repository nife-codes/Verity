import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChartIcon,
  SearchIcon,
  ExclamationIcon,
  CalendarIcon,
  LinkIcon,
  ClockIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  BrainIcon
} from './Icons';

export default function ThinkingMode({ thinkingText, thinkingSteps }) {
  const steps = thinkingSteps || (thinkingText ? thinkingText.split('\n\n').filter(s => s.trim()) : []);
  const totalSteps = 6;
  const isAnalyzing = steps.length < totalSteps;

  const getStepIcon = (step) => {
    if (!step || typeof step !== 'string') return BrainIcon;
    const stepLower = step.toLowerCase();
    if (stepLower.includes('extract') || stepLower.includes('processing')) return BarChartIcon;
    if (stepLower.includes('analyz') || stepLower.includes('examin')) return SearchIcon;
    if (stepLower.includes('contradiction') || stepLower.includes('conflict') || stepLower.includes('evaluating')) return ExclamationIcon;
    if (stepLower.includes('timeline') || stepLower.includes('chronolog') || stepLower.includes('temporal')) return CalendarIcon;
    if (stepLower.includes('cross-reference') || stepLower.includes('compar')) return LinkIcon;
    if (stepLower.includes('metadata') || stepLower.includes('timestamp')) return ClockIcon;
    if (stepLower.includes('complete') || stepLower.includes('success')) return CheckCircleIcon;
    if (stepLower.includes('confidence') || stepLower.includes('score') || stepLower.includes('stock') || stepLower.includes('transaction')) return TrendingUpIcon;
    return BrainIcon;
  };

  const getStepColor = (step) => {
    if (!step || typeof step !== 'string') return 'border-blue-500 bg-blue-900/20';
    const stepLower = step.toLowerCase();
    if (stepLower.includes('contradiction') || stepLower.includes('conflict') || stepLower.includes('evaluating')) {
      return 'border-red-500 bg-red-900/20';
    }
    if (stepLower.includes('timeline') || stepLower.includes('temporal') || stepLower.includes('constructing')) {
      return 'border-purple-500 bg-purple-900/20';
    }
    if (stepLower.includes('stock') || stepLower.includes('transaction') || stepLower.includes('uncovering')) {
      return 'border-orange-500 bg-orange-900/20';
    }
    if (stepLower.includes('investigating') || stepLower.includes('anomal')) {
      return 'border-yellow-500 bg-yellow-900/20';
    }
    return 'border-blue-500 bg-blue-900/20';
  };

  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-900/50 border border-slate-700 rounded-xl shadow-lg p-6 mb-6 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4 gap-3">
        <BrainIcon className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">
            Reasoning Process
          </h3>
          <p className="text-xs text-blue-400 uppercase tracking-wide font-mono">
            Gemini 3 Pro • Thinking Mode Active
          </p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-blue-400 font-mono">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>
            </motion.div>
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const IconComponent = getStepIcon(step);
            return (
              <motion.div
                key={`step-${index}`}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className={`border-l-2 ${getStepColor(step)} pl-4 py-3 rounded-r-lg`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-400">
                        Step {index + 1}/{totalSteps}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {step}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {!isAnalyzing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 pt-4 border-t border-slate-700"
        >
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircleIcon className="w-5 h-5" />
            <span className="font-medium">Analysis Complete</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}