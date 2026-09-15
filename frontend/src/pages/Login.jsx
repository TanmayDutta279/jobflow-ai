import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Sparkles, Target, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate('/');
    } catch (err) {
      setError('Failed to authenticate. Please try again.');
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 overflow-hidden font-sans">
      {/* Left Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md space-y-8 glass p-10 rounded-[2rem] relative"
        >
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>

          <div className="relative">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                JobFlow AI
              </span>
            </div>
            
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Enter your details to access your dashboard.' : 'Start analyzing your resume with AI today.'}
            </p>
          </div>

          <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </motion.div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-xl border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-200 transition-all sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-xl border-slate-700 bg-slate-900/80 px-4 py-3 text-white placeholder-slate-400 focus:border-indigo-500 focus:bg-slate-900 focus:ring-2 focus:ring-indigo-200 transition-all sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="group relative flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 px-4 text-sm font-bold text-white hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-lg shadow-indigo-500/25"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <div className="text-center pt-2">
              <button
                type="button"
                className="text-sm text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-4">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Right Column - Presentation */}
      <div className="hidden lg:flex lg:w-1/2 mesh-bg relative items-center justify-center p-12">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="max-w-lg w-full z-10"
        >
          <motion.div variants={fadeUp} className="mb-8 inline-flex items-center px-4 py-2 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/50 text-indigo-800 font-bold text-sm shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-indigo-600" /> Hackathon Edition
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Unlock your career potential with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI precision.</span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg text-slate-200 font-medium mb-10 leading-relaxed">
            Upload your resume, bypass ATS filters, and let our intelligent engine match you with the exact roles where you'll thrive.
          </motion.p>

          <div className="space-y-4">
            {[
              { icon: Target, title: "Smart ATS Scoring", desc: "Know exactly how your resume performs against automated filters." },
              { icon: Zap, title: "Instant Role Matching", desc: "Discover the best-fitting jobs tailored uniquely to your skills." },
              { icon: Sparkles, title: "Actionable Feedback", desc: "Get targeted suggestions to improve your resume instantly." }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeUp} className="flex items-start p-4 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm">
                <div className="bg-slate-900 p-2.5 rounded-xl shadow-sm mr-4 text-indigo-600">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-300 font-medium mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')] opacity-50"></div>
      </div>
    </div>
  );
};

export default Login;
