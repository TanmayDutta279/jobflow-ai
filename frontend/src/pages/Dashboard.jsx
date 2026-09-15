import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import { Briefcase, Target, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    atsScore: 0,
    skills: [],
    suggestions: [
      "Upload your resume to see your ATS Score.",
      "Get personalized improvement tips by uploading a resume.",
      "See which job roles fit your specific skills."
    ]
  });

  useEffect(() => {
    // Load stats from localStorage if available
    const savedStats = localStorage.getItem('jobflow_resume_stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }

    const fetchJobs = async () => {
      try {
        const resumeText = localStorage.getItem('jobflow_resume_text') || '';
        const response = await api.post('/jobs', { resumeText });
        setJobs(response.data);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const name = currentUser?.email?.split('@')[0] || 'User';
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="p-8 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="mb-8">
        <h1 className="text-4xl font-extrabold text-white tracking-tight flex items-center">
          Good morning, {capitalizedName} <span className="ml-2 inline-block origin-bottom-right hover:rotate-12 transition-transform cursor-default">👋</span>
        </h1>
        <p className="text-slate-500 mt-2 text-lg">Welcome to your intelligent jobs dashboard</p>
      </motion.div>

      {/* Purple Stats Banner */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2rem] p-8 text-white mb-8 shadow-xl shadow-indigo-500/20 flex flex-wrap relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900 opacity-10 rounded-full -mt-32 -mr-32 border-[12px] border-white"></div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-900 opacity-5 rounded-full -mt-20 -mr-20"></div>

        <div className="w-full mb-6 relative z-10">
          <h2 className="font-bold text-indigo-100 tracking-wider uppercase text-sm">Resume Overview</h2>
        </div>
        
        <div className="flex flex-wrap items-center w-full justify-between pr-8 z-10">
          <div className="mb-4 pr-8 border-r border-indigo-400/30">
            <div className="text-4xl font-bold">{stats.atsScore}</div>
            <div className="text-indigo-200 text-sm font-medium mt-1">ATS Score</div>
          </div>
          <div className="mb-4 px-8 border-r border-indigo-400/30">
            <div className="text-4xl font-bold">{stats.skills?.length || 0}</div>
            <div className="text-indigo-200 text-sm font-medium mt-1">Skills Found</div>
          </div>
          <div className="mb-4 px-8 border-r border-indigo-400/30">
            <div className="text-4xl font-bold">{jobs.length || 0}</div>
            <div className="text-indigo-200 text-sm font-medium mt-1">Live Jobs</div>
          </div>
          <div className="mb-4 pl-8">
            <div className="text-4xl font-bold">{stats.atsScore > 75 ? 'Strong' : stats.atsScore > 50 ? 'Average' : 'Weak'}</div>
            <div className="text-indigo-200 text-sm font-medium mt-1">Profile Strength</div>
          </div>
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (Explore Jobs & Goals) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Explore Jobs */}
          <motion.div variants={fadeUp} whileHover={{ y: -5 }} className="glass-card rounded-[2rem] p-8">
            <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Explore Jobs</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Find your next job opportunity tailored precisely to your resume.</p>
            <Link to="/match" className="inline-flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors shadow-sm">
              <Briefcase className="w-4 h-4 mr-2" />
              Find jobs
            </Link>
          </motion.div>

          {/* Goals (Improvement Tips) */}
          <motion.div variants={fadeUp} className="glass-card rounded-[2rem] p-8 flex-1">
            <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Goals</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium">Work on defining and setting your goals!</p>
            <Link to="/upload" className="inline-flex items-center px-5 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-colors mb-6 shadow-sm">
              <Target className="w-4 h-4 mr-2" />
              Set my goals
            </Link>

            <div className="mt-6 border-t border-slate-800 pt-6">
              <h4 className="text-sm font-extrabold text-white mb-4 tracking-tight">Improvement Tips</h4>
              <ul className="space-y-4">
                {stats.suggestions.map((tip, index) => (
                  <motion.li whileHover={{ x: 5 }} key={index} className="flex items-start text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 transition-transform cursor-default">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mt-1 mr-3 flex-shrink-0 shadow-sm"></span>
                    <span className="leading-relaxed font-medium">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Right Column (Manage Contacts / Recent Matches / Jobs Table) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* My Jobs Table */}
          <motion.div variants={fadeUp} className="glass-card rounded-[2rem] overflow-hidden flex-1 flex flex-col">
            <div className="p-8 border-b border-slate-800">
              <h3 className="text-xl font-extrabold text-white tracking-tight">Suggested Roles</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Live listings ranked against your resume skills</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Job Title</th>
                    <th className="px-6 py-4">Source</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                        <div className="animate-pulse space-y-4">
                          <div className="h-4 bg-slate-800 rounded w-3/4 mx-auto"></div>
                          <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto"></div>
                        </div>
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                        Upload a resume to get tailored job suggestions.
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-950 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                              {job.company.charAt(0)}
                            </div>
                            <span className="font-semibold text-white">{job.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 font-medium">{job.title}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">
                            {job.source}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold text-xs"
                          >
                            Apply Link <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
};

export default Dashboard;
