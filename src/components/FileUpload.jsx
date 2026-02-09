import { useState } from 'react';
import { VideoIcon, AudioIcon, ImageIcon, DocumentIcon } from './Icons';

export default function FileUpload({ onFilesUploaded }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList);
    const validFiles = newFiles.filter(file => {
      const validTypes = [
        'audio/mpeg', 'audio/mp3', 'audio/wav',
        'video/mp4', 'video/quicktime',
        'application/pdf',
        'image/png', 'image/jpeg', 'image/jpg'
      ];
      return validTypes.includes(file.type);
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = () => {
    if (files.length >= 2) {
      onFilesUploaded(files);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('audio')) return <AudioIcon className="w-8 h-8 text-slate-400" />;
    if (type.includes('video')) return <VideoIcon className="w-8 h-8 text-slate-400" />;
    if (type.includes('pdf')) return <DocumentIcon className="w-8 h-8 text-slate-400" />;
    return <ImageIcon className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors duration-200 ${dragActive
            ? 'border-blue-500 bg-blue-900/20'
            : 'border-slate-700 bg-slate-900/50'
          }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept=".mp3,.wav,.mp4,.mov,.pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
        />

        <label htmlFor="file-upload" className="cursor-pointer block">
          <div className="text-5xl mb-3 text-slate-500">+</div>
          <p className="text-base text-white mb-1 font-medium">
            Upload evidence files
          </p>
          <p className="text-sm text-slate-400">
            Drag and drop or click to browse
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Supports: Audio, Video, PDF, Images
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-5">
          <p className="text-sm font-medium text-slate-400 mb-3">
            Files ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-sm text-slate-500 hover:text-red-600 font-medium ml-3 flex-shrink-0 transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={files.length < 2}
            className={`w-full mt-4 py-3 px-4 rounded-lg font-medium text-base transition-all duration-200 ${files.length >= 2
                ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
          >
            {files.length < 2
              ? `Upload at least 2 files (${files.length}/2)`
              : `Analyze ${files.length} Files`}
          </button>
        </div>
      )}
    </div>
  );
}