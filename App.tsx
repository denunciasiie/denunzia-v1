import React, { useState } from 'react';
import { useNavigate, HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { AdminPanel } from './components/AdminPanel';
import { About } from './components/About';
import { SecurityGateway } from './components/SecurityGateway';
import { SplashScreen } from './components/SplashScreen';


// Page Transition Wrapper Component
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {children}
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [hasAcceptedSecurity, setHasAcceptedSecurity] = useState(false);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleProceed = (targetPath?: string) => {
    setHasAcceptedSecurity(true);
    if (targetPath) {
      setTimeout(() => navigate(targetPath), 0);
    }
  };

  return (
    <>
      {/* Splash Screen - Shows first on initial load */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Security Gateway Overlay */}
      {!showSplash && !hasAcceptedSecurity && (
        <div className="fixed inset-0 z-[9999] bg-[#020617] overflow-y-auto">
          <SecurityGateway onProceed={handleProceed} />
        </div>
      )}

      <Routes>
        <Route path="/" element={<Layout onReset={() => setHasAcceptedSecurity(false)} />}>
          <Route index element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          } />
          <Route path="denunciar" element={
            <PageTransition>
              <ReportForm />
            </PageTransition>
          } />
          <Route path="informacion" element={
            <PageTransition>
              <About />
            </PageTransition>
          } />
          <Route path="admin" element={
            <PageTransition>
              <AdminPanel />
            </PageTransition>
          } />
          <Route path="*" element={
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <h2 className="text-4xl font-cyber mb-4">404</h2>
              <p>Recurso no localizado</p>
            </div>
          } />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;