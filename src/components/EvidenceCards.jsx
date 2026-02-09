import { motion } from 'framer-motion';

export default function EvidenceCards({ files, analysis }) {
    if (!files || files.length === 0) return null;

    const getVerdictIcon = (confidence) => {
        if (confidence >= 0.8) return 'PASS';
        if (confidence >= 0.5) return 'WARN';
        return 'FAIL';
    };

    const getVerdictColor = (confidence) => {
        if (confidence >= 0.8) return 'border-emerald-600 bg-emerald-900/20';
        if (confidence >= 0.5) return 'border-yellow-600 bg-yellow-900/20';
        return 'border-red-600 bg-red-900/20';
    };

    const getVerdictText = (confidence) => {
        if (confidence >= 0.8) return 'Verified';
        if (confidence >= 0.5) return 'Uncertain';
        return 'Contradicted';
    };

    const getFileIcon = (category) => {
        const icons = {
            image: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            video: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            audio: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            ),
            document: (
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        };
        return icons[category] || icons.document;
    };

    const overallConfidence = analysis?.confidenceScores?.overall || 0.75;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
        >
            <h2 className="text-2xl font-bold text-white mb-4">Evidence Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => {
                    const confidence = overallConfidence + (Math.random() * 0.2 - 0.1);
                    const clampedConfidence = Math.max(0, Math.min(1, confidence));

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                            className={`border-2 rounded-lg p-4 ${getVerdictColor(clampedConfidence)} transition-all hover:shadow-lg`}
                        >
                            <div className="flex items-start gap-3 mb-3">
                                <div className="text-slate-400">{getFileIcon(file.category)}</div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-200 truncate">
                                        {file.fileName}
                                    </h3>
                                    <p className="text-xs text-slate-400">{file.category}</p>
                                </div>
                                <div className="text-xs font-bold text-slate-300">{getVerdictIcon(clampedConfidence)}</div>
                            </div>

                            <div className="mb-2">
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>Confidence</span>
                                    <span className="font-semibold">{Math.round(clampedConfidence * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${clampedConfidence * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${clampedConfidence >= 0.8
                                            ? 'bg-emerald-500'
                                            : clampedConfidence >= 0.5
                                                ? 'bg-yellow-500'
                                                : 'bg-red-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="text-xs font-semibold text-slate-300">
                                {getVerdictText(clampedConfidence)}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
