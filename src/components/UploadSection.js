import React, { useState, useRef } from 'react';
import { Upload, Camera, Activity, Sparkles, RotateCcw, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function UploadSection({ onPrediction }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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
    <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl shadow-2xl border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-500">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent"></div>
      
      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 blur-xl animate-pulse"></div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Content Container */}
      <div className="relative p-8 lg:p-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm p-4 rounded-2xl border border-emerald-500/30">
                <Camera className="text-emerald-400" size={32} />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-1">
                Deteksi Kulit
              </h2>
              <p className="text-emerald-300/70 text-sm">Upload & Analisis dengan AI</p>
            </div>
          </div>
          
          {preview && !loading && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-500/20 to-red-500/20 border border-rose-500/40 rounded-xl text-rose-300 hover:from-rose-500/30 hover:to-red-500/30 hover:scale-105 transition-all backdrop-blur-sm shadow-lg hover:shadow-rose-500/50"
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
          className={`border-2 border-dashed rounded-3xl p-10 text-center mb-8 backdrop-blur-xl transition-all duration-300 ${
            isDragging
              ? 'border-emerald-400 bg-emerald-500/30 scale-[1.02] shadow-2xl shadow-emerald-500/50'
              : preview
              ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10'
              : 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10'
          }`}
        >
          {preview ? (
            <div className="space-y-4">
              {/* Image Preview with Face Guide Overlay */}
              <div className="relative inline-block">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="max-h-96 mx-auto rounded-2xl shadow-2xl object-cover border-2 border-emerald-500/30" 
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
                <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all backdrop-blur-sm">
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
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                {isDragging ? (
                  <ImageIcon className="relative text-emerald-400 animate-bounce" size={80} />
                ) : (
                  <Upload className="relative text-emerald-400" size={80} />
                )}
              </div>
              
              <div className="space-y-3">
                <p className="text-gray-200 text-xl font-semibold">
                  {isDragging ? 'Drop gambar di sini' : 'Drag & Drop gambar atau klik untuk upload'}
                </p>
                <p className="text-sm text-gray-400">PNG, JPG, JPEG (max. 10MB)</p>
                
                {/* Upload Tips */}
                <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-emerald-300 font-semibold mb-2">💡 Tips untuk hasil terbaik:</p>
                  <ul className="text-sm text-gray-300 space-y-1 text-left">
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
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-emerald-500/50 hover:scale-[1.02] text-lg"
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
          <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl backdrop-blur-sm animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-emerald-400" size={24} />
              <h3 className="font-bold text-emerald-300 text-xl">Hasil Deteksi</h3>
            </div>
            
            <div className="mb-4">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-3">
                {prediction.disease}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000 shadow-lg shadow-emerald-500/50"
                    style={{ width: `${(prediction.confidence * 100)}%` }}
                  ></div>
                </div>
                <span className="text-emerald-400 font-bold text-xl min-w-[60px] text-right">
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {/* Top 3 Predictions */}
            <div className="pt-4 border-t border-emerald-500/30">
              <p className="text-sm text-emerald-300 font-semibold mb-3 flex items-center gap-2">
                <Activity size={16} />
                Kemungkinan Lainnya:
              </p>
              <div className="space-y-3">
                {Object.entries(prediction.all_predictions || {})
                  .sort(([_, a], [__, b]) => b - a)
                  .slice(0, 3)
                  .map(([disease, prob], idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg backdrop-blur-sm hover:bg-slate-800/50 transition-all">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-teal-500' : 'bg-cyan-500'
                        }`}></div>
                        <span className="text-gray-200 font-medium">{disease}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{(prob * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
              <p className="text-cyan-300 text-sm text-center">
                💬 Ingin konsultasi lebih lanjut? Klik tombol chat di pojok kanan bawah!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}