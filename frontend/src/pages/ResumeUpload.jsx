import React, { useState, useCallback } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setResult(null);
      } else {
        alert("Please upload a PDF file.");
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setLoadingStep(1);
    
    // Simulate multi-step AI process for better UX
    setTimeout(() => setLoadingStep(2), 1500);
    setTimeout(() => setLoadingStep(3), 3000);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await api.post('/upload-resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(response.data);
      localStorage.setItem('jobflow_resume_text', response.data.resumeText);
      localStorage.setItem('jobflow_resume_stats', JSON.stringify({
        atsScore: response.data.atsScore,
        suggestions: response.data.suggestions,
        skills: response.data.skills,
        jobRoles: response.data.jobRoles,
        analysisSource: response.data.analysisSource
      }));
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to analyze resume.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const loadingSteps = [
    "Extracting text from PDF...",
    "AI is analyzing your skills...",
    "Generating ATS Score and insights..."
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-[80vh] flex flex-col justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-3">AI Resume Analyzer</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Upload your resume to instantly bypass ATS filters and get customized job matches.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-[2rem] p-10 relative overflow-hidden shadow-xl border border-indigo-100"
      >
        {/* Decorative BG */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 -mr-20 -mt-20"></div>

        {!result ? (
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
              file ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-950 cursor-pointer'
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Analyzing Resume</h3>
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={loadingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-indigo-600 font-medium"
                  >
                    {loadingSteps[loadingStep - 1] || "Finalizing..."}
                  </motion.p>
                </AnimatePresence>
                
                <div className="w-64 h-2 bg-slate-800 rounded-full mt-6 overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: `${(loadingStep / 3) * 100}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                  />
                </div>
              </div>
            ) : (
              <div className="relative">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-20 h-20 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm relative z-10"
                >
                  {file ? <FileText className="w-10 h-10" /> : <UploadCloud className="w-10 h-10" />}
                </motion.div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {file ? file.name : 'Drag and drop your resume'}
                </h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'We currently support PDF files up to 5MB in size.'}
                </p>

                {!file ? (
                  <label className="inline-flex cursor-pointer items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl relative z-20">
                    <span>Select a file</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex justify-center space-x-4 relative z-20">
                    <button 
                      onClick={() => setFile(null)}
                      className="px-6 py-3 bg-slate-900 text-slate-200 border border-slate-700 rounded-xl font-semibold hover:bg-slate-950 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpload}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Analyze with AI
                    </motion.button>
                  </div>
                )}
                
                {/* Make the entire dropzone clickable when no file is present */}
                {!file && (
                   <input 
                   type="file" 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0" 
                   accept="application/pdf"
                   onChange={handleFileChange}
                 />
                )}
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 bg-green-900/30 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-900/50">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Analysis Complete!</h2>
            <p className="text-slate-500 text-lg mb-3">We found {result.skills.length} core skills and calculated your ATS score.</p>
            <span className="inline-flex px-3 py-1 rounded-full bg-indigo-900/30 text-indigo-300 border border-indigo-900/50 text-xs font-bold">Powered by AI</span>
            
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-3 bg-slate-800 text-slate-200 rounded-xl font-bold hover:bg-slate-700 transition-colors"
              >
                Upload another
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30"
              >
                View Dashboard <ArrowRight className="w-4 h-4 ml-2" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ResumeUpload;
