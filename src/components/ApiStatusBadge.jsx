import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiStatusBadge({ status }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'gemini-3-pro-sample':
                return {
                    icon: '✓',
                    text: 'Gemini 3 Pro',
                    subtext: 'Pre-validated Sample',
                    color: 'emerald',
                    bgClass: 'bg-emerald-500/20',
                    borderClass: 'border-emerald-500/50',
                    textClass: 'text-emerald-400'
                };
            case 'gemini-3-pro-live':
                return {
                    icon: '✓',
                    text: 'Gemini 3 Pro',
                    subtext: 'Live Analysis',
                    color: 'emerald',
                    bgClass: 'bg-emerald-500/20',
                    borderClass: 'border-emerald-500/50',
                    textClass: 'text-emerald-400'
                };
            case 'gemini-3-flash':
                return {
                    icon: '⚠',
                    text: 'Gemini 3 Flash',
                    subtext: 'Pro quota exceeded',
                    color: 'yellow',
                    bgClass: 'bg-yellow-500/20',
                    borderClass: 'border-yellow-500/50',
                    textClass: 'text-yellow-400'
                };
            case 'gemini-2-flash':
                return {
                    icon: '⚠',
                    text: 'Gemini 2.0 Flash',
                    subtext: 'Fallback mode',
                    color: 'orange',
                    bgClass: 'bg-orange-500/20',
                    borderClass: 'border-orange-500/50',
                    textClass: 'text-orange-400'
                };
            default:
                return null;
        }
    };

    const config = getStatusConfig();
    if (!config) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-6 right-6 z-50"
            >
                <div className={`${config.bgClass} ${config.borderClass} border backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg`}>
                    <div className="flex items-center gap-3">
                        <span className={`text-xl ${config.textClass}`}>{config.icon}</span>
                        <div>
                            <div className={`font-semibold ${config.textClass} text-sm font-mono`}>
                                {config.text}
                            </div>
                            <div className="text-xs text-slate-400">
                                {config.subtext}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
