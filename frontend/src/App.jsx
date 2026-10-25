import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import OverviewDashboard from './components/OverviewDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// UI and Contexts
import { ToastProvider, useToast } from './components/ui/ToastContext';
import TourModal from './components/ui/TourModal';

// Project 1: SecureTunnel
import TlsVisualizer from './components/tunnel/TlsVisualizer';
import SshVisualizer from './components/tunnel/SshVisualizer';
import IpsecVisualizer from './components/tunnel/IpsecVisualizer';

// Project 2: Sentinel
import FirewallManager from './components/sentinel/FirewallManager';
import IdsDashboard from './components/sentinel/IdsDashboard';
import ThreatEncyclopedia from './components/sentinel/ThreatEncyclopedia';

import { Shield, Radio, Flame, Sparkles } from 'lucide-react';

function AppContent() {
  const [activeProject, setActiveProject] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('tls');
  const [currentUser, setCurrentUser] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Layout & UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [demoTrigger, setDemoTrigger] = useState(0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const { success, info } = useToast();

  // Health check ping to FastAPI backend
  const checkBackendHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 6000);
    return () => clearInterval(interval);
  }, []);

  // Theme toggle side-effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  const handleSelectModule = (projectId, subTabId) => {
    setActiveProject(projectId);
    setActiveSubTab(subTabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRunDemo = () => {
    setIsDemoRunning(true);
    setDemoTrigger((prev) => prev + 1);
    info('Demo Mode: Automatically populating sample data & simulating workflow...', 3500);
    setTimeout(() => {
      setIsDemoRunning(false);
    }, 1500);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070b14] text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col font-sans transition-colors duration-200`}>
      
      {/* Persistent Left Sidebar */}
      <Sidebar
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        activeSubTab={activeSubTab}
        setActiveSubTab={setActiveSubTab}
        currentUser={currentUser}
        backendOnline={backendOnline}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main App Content Area (Pushed by sidebar on desktop) */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        
        {/* Top Header Bar */}
        <TopBar
          activeProject={activeProject}
          activeSubTab={activeSubTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenTour={() => setIsTourOpen(true)}
          onRunDemo={handleRunDemo}
          isDemoRunning={isDemoRunning}
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode(!isDarkMode)}
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null);
            success('Signed out successfully');
          }}
          onOpenAuth={() => handleSelectModule('securetunnel', 'tls')}
          backendOnline={backendOnline}
        />

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* VIEW 0: SUITE OVERVIEW */}
          {activeProject === 'overview' && (
            <OverviewDashboard 
              onSelectModule={handleSelectModule} 
              onOpenTour={() => setIsTourOpen(true)}
            />
          )}

          {/* VIEW 1: SECURETUNNEL */}
          {activeProject === 'securetunnel' && (
            <ErrorBoundary>
              {activeSubTab === 'tls' && (
                <TlsVisualizer 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('securetunnel', 'ssh')}
                />
              )}
              {activeSubTab === 'ssh' && (
                <SshVisualizer 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('securetunnel', 'ipsec')}
                />
              )}
              {activeSubTab === 'ipsec' && (
                <IpsecVisualizer 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('sentinel', 'firewall')}
                />
              )}
            </ErrorBoundary>
          )}

          {/* VIEW 2: SENTINEL */}
          {activeProject === 'sentinel' && (
            <ErrorBoundary>
              {activeSubTab === 'firewall' && (
                <FirewallManager 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('sentinel', 'ids')}
                />
              )}
              {activeSubTab === 'ids' && (
                <IdsDashboard 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('sentinel', 'threats')}
                />
              )}
              {activeSubTab === 'threats' && (
                <ThreatEncyclopedia 
                  demoTrigger={demoTrigger}
                  onNavigateNext={() => handleSelectModule('overview', 'overview')}
                />
              )}
            </ErrorBoundary>
          )}

        </main>

        {/* High-Tech Status Footer */}
        <footer className={`border-t ${isDarkMode ? 'border-slate-800/80 bg-[#070b14]/90 text-slate-400' : 'border-slate-300 bg-white text-slate-600'} py-6 px-4 sm:px-8 text-xs font-mono transition-colors`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="font-bold tracking-wider text-slate-200">CYBERLAB SUITE 2.0</span>
              <span>—</span>
              <span className="text-slate-400">SecureTunnel • Sentinel</span>
            </div>

            <div className="flex items-center space-x-4 text-[11px]">
              <span className="text-slate-400">FastAPI & React 19 Core</span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Zero Mock Cryptographic Engine</span>
              </span>
            </div>
          </div>
        </footer>

      </div>

      {/* Guided Tour Modal */}
      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigate={handleSelectModule}
      />

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
