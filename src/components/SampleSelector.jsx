import React from 'react';
import { motion } from 'framer-motion';
import { GOLDEN_SAMPLES } from '../data/goldenSamples';

export default function SampleSelector({ onSelectSample }) {
    return (
        <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
        >
            <div className="bg-slate-900/50 border border-emerald-500/30 rounded-lg p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <h3 className="text-xl font-semibold text-white uppercase tracking-wide font-mono">
                        Try Sample Evidence
                    </h3>
                    <span className="ml-auto px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono rounded-full border border-emerald-500/30">
                        Gemini 3 Pro Validated
                    </span>
                </div>

                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    Experience Verity's full capabilities with pre-validated Gemini 3 Pro analysis.
                    These samples demonstrate advanced reasoning, contradiction detection, and forensic timeline reconstruction.
                </p>

                <div className="grid md:grid-cols-1 gap-4">
                    {GOLDEN_SAMPLES.map((sample, index) => (
                        <motion.button
                            key={sample.id}
                            onClick={() => onSelectSample(sample)}
                            className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-6 text-left transition-all duration-300"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="text-white font-semibold mb-1">{sample.name}</h4>
                                    <p className="text-slate-400 text-sm">{sample.description}</p>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-mono rounded border border-orange-500/30">
                                        {sample.complexity}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-mono rounded border border-blue-500/30">
                                        {sample.category}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                <span>{sample.files.length} files</span>
                                <span>•</span>
                                <span>{sample.gemini3Output.thinkingSteps.length} reasoning steps</span>
                                <span>•</span>
                                <span>{sample.gemini3Output.analysis.contradictions.length} contradictions</span>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                                <div className="flex -space-x-2">
                                    {sample.files.slice(0, 4).map((file, i) => (
                                        <div
                                            key={i}
                                            className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-400"
                                            title={file.fileName}
                                        >
                                            {file.category === 'pdf' ? '📄' : file.category === 'image' ? '🖼️' : '📝'}
                                        </div>
                                    ))}
                                    {sample.files.length > 4 && (
                                        <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                                            +{sample.files.length - 4}
                                        </div>
                                    )}
                                </div>
                                <span className="ml-auto text-emerald-400 group-hover:translate-x-1 transition-transform">
                                    Analyze →
                                </span>
                            </div>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                        </motion.button>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-slate-800/30 rounded border border-slate-700/50">
                    <div className="flex items-start gap-3">
                        <span className="text-emerald-400 text-lg">ℹ️</span>
                        <div className="text-xs text-slate-400 leading-relaxed">
                            <strong className="text-slate-300">About Sample Mode:</strong> These analyses were generated using Gemini 3 Pro via AI Studio
                            and represent authentic model output. Sample mode ensures evaluators can experience full capabilities without quota limitations.
                            For custom uploads, see the upload section below.
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
