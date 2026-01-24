import { useState } from 'react';

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

  return (
    <div className="w-full max-w-4xl mx-auto p-8">
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
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
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-6xl mb-4">📁</div>
          <p className="text-xl text-gray-700 mb-2">
            Drag and drop evidence files
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse
          </p>
          <p className="text-xs text-gray-400">
            Accepts: Audio, Video, PDF, Images
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">
            Uploaded Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-4 rounded-lg shadow"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {file.type.includes('audio') ? '🎵' :
                     file.type.includes('video') ? '🎬' :
                     file.type.includes('pdf') ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={files.length < 2}
            className={`w-full mt-6 py-4 rounded-lg font-semibold text-lg transition ${
              files.length >= 2
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {files.length < 2
              ? `Upload at least 2 files (${files.length}/2)`
              : `Analyze ${files.length} Evidence Files`}
          </button>
        </div>
      )}
    </div>
  );
}