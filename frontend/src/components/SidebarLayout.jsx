import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Target, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Resume', path: '/upload', icon: FileText },
    { name: 'Job Matcher', path: '/match', icon: Target },
  ];

  return (
    <div className="flex h-screen bg-transparent font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col justify-between hidden md:flex shadow-xl z-50">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-50">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Briefcase className="h-6 w-6" />
              <span className="text-lg font-bold text-white tracking-tight">JobFlow AI</span>
            </div>
          </div>
          <nav className="p-4 space-y-1 mt-4">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-500 hover:bg-slate-950 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile at Bottom */}
        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-950 rounded-xl cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">Test User</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;
