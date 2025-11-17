import React, { useState, useRef } from 'react';
import { Upload, Camera, Activity, Sparkles, RotateCcw, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function UploadSection({ onPrediction, onImageUpload, persistedImage }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(persistedImage || null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Restore preview from persisted image on mount
  React.useEffect(() => {
    if (persistedImage && !preview) {
      setPreview(persistedImage);
    }
  }, [persistedImage]);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        // Notify parent to persist image
        if (onImageUpload) {
          onImageUpload(reader.result);
        }
      };
      reader.readAsDataURL(selectedFile);
      setPrediction(null);
    }
  };

  const handleInputChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileChange(droppedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setPrediction(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Clear persisted image
    sessionStorage.removeItem('uploadedImage');
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  const handlePredict = async () => {
    if (!file) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Prediction failed');
      
      const result = await response.json();
      
      const transformedResult = {
        disease: result.predictions.best.label,
        confidence: result.predictions.best.score,
        all_predictions: result.predictions.topk.reduce((acc, item) => {
          acc[item.label] = item.score;
          return acc;
        }, {})
      };
      
      setPrediction(transformedResult);
      onPrediction(transformedResult);
      
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Content Container */}
      <div className="relative p-8 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-2xl shadow-lg">
              <Camera className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-1">
                Deteksi Kulit
              </h2>
              <p className="text-slate-600 text-sm font-medium">Upload & Analisis dengan AI</p>
            </div>
          </div>
          
          {preview && !loading && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-rose-600 hover:scale-105 transition-all font-semibold shadow-md"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          )}
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-3xl p-10 text-center mb-8 transition-all duration-300 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50 scale-[1.02] shadow-xl'
              : preview
              ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              {/* Image Preview with Face Guide Overlay */}
              <div className="relative inline-block">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-96 mx-auto rounded-2xl shadow-xl object-cover border-2 border-slate-200" 
                />
                
                {/* Face Detection Guide Overlay */}
                {!prediction && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg className="w-full h-full max-w-md max-h-96" viewBox="0 0 200 200">
                      {/* Head outline */}
                      <ellipse 
                        cx="100" 
                        cy="100" 
                        rx="60" 
                        ry="80" 
                        fill="none" 
                        stroke="rgba(16, 185, 129, 0.4)" 
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        className="animate-pulse"
                      />
                      {/* Corner guides */}
                      <circle cx="70" cy="70" r="3" fill="rgba(16, 185, 129, 0.6)" className="animate-ping" />
                      <circle cx="130" cy="70" r="3" fill="rgba(16, 185, 129, 0.6)" className="animate-ping" style={{ animationDelay: '0.2s' }} />
                      <circle cx="70" cy="130" r="3" fill="rgba(16, 185, 129, 0.6)" className="animate-ping" style={{ animationDelay: '0.4s' }} />
                      <circle cx="130" cy="130" r="3" fill="rgba(16, 185, 129, 0.6)" className="animate-ping" style={{ animationDelay: '0.6s' }} />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 justify-center">
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-600 font-semibold transition-all shadow-md hover:shadow-lg">
                  <Upload size={20} />
                  Ganti Foto
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleInputChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block">
              <div className="relative inline-block mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-6 rounded-full inline-block shadow-lg">
                  {isDragging ? (
                    <ImageIcon className="text-white animate-bounce" size={80} />
                  ) : (
                    <Upload className="text-white" size={80} />
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-slate-900 text-xl font-black">
                  {isDragging ? 'Drop gambar di sini' : 'Drag & Drop gambar atau klik untuk upload'}
                </p>
                <p className="text-sm text-slate-600 font-medium">PNG, JPG, JPEG (max. 10MB)</p>
                
                {/* Upload Tips */}
                <div className="mt-6 p-4 bg-white border border-emerald-200 rounded-xl shadow-md">
                  <p className="text-slate-900 font-bold mb-2">Tips untuk hasil terbaik:</p>
                  <ul className="text-sm text-slate-700 space-y-1 text-left font-medium">
                    <li>✓ Pastikan area kulit terlihat jelas</li>
                    <li>✓ Gunakan pencahayaan yang cukup</li>
                    <li>✓ Posisikan wajah di tengah frame</li>
                    <li>✓ Hindari blur atau gambar terlalu gelap</li>
                  </ul>
                </div>
              </div>
              
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleInputChange} 
                className="hidden" 
              />
            </label>
          )}
        </div>

        {/* Predict Button */}
        {preview && !prediction && (
          <button
            onClick={handlePredict}
            disabled={!file || loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:scale-[1.02] text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Menganalisis Kondisi Kulit...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Activity size={24} />
                Deteksi Sekarang
              </span>
            )}
          </button>
        )}

        {/* Prediction Result */}
        {prediction && (
          <div className="mt-6 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl shadow-lg animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="font-black text-slate-900 text-xl">Hasil Deteksi</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-4xl font-black text-slate-900 mb-3">
                {prediction.disease}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 shadow-md"
                    style={{ width: `${(prediction.confidence * 100)}%` }}
                  ></div>
                </div>
                <span className="text-emerald-600 font-black text-xl min-w-[60px] text-right">
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Top 3 Predictions */}
            <div className="pt-4 border-t border-emerald-200">
              <p className="text-sm text-slate-700 font-bold mb-3 flex items-center gap-2">
                <Activity size={16} />
                Kemungkinan Lainnya:
              </p>
              <div className="space-y-3">
                {Object.entries(prediction.all_predictions || {})
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 3)
                  .map(([disease, prob], idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg hover:bg-slate-50 transition-all shadow-sm border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-teal-500' : 'bg-cyan-500'
                        }`}></div>
                        <span className="text-slate-900 font-semibold">{disease}</span>
                      </div>
                      <span className="text-emerald-600 font-bold">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl">
              <p className="text-cyan-800 text-sm text-center font-semibold">
                Ingin konsultasi lebih lanjut? Klik tombol chat di pojok kanan bawah!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}