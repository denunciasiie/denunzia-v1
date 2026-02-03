import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ReportForm } from './components/ReportForm';
import { AdminPanel } from './components/AdminPanel';
import { About } from './components/About';
import { SecurityGateway } from './components/SecurityGateway';

function App() {
  // Initialize from sessionStorage to avoid re-prompting on reload
  const [hasAcceptedSecurity, setHasAcceptedSecurity] = useState(() => {
    try {
      return sessionStorage.getItem('security_accepted') === 'true';
    } catch (e) {
      return false;
    }
  });

  const handleProceed = () => {
    try {
      sessionStorage.setItem('security_accepted', 'true');
    } catch (e) {
      console.error('Storage access blocked', e);
    }
    setHasAcceptedSecurity(true);
  };

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Security Gateway Overlay - Blocks interaction until accepted, but allows SEO content to load behind */}
        {!hasAcceptedSecurity && (
          <div className="fixed inset-0 z-[9999] bg-slate-900 overflow-y-auto">
            <SecurityGateway onProceed={handleProceed} />
          </div>
        )}

        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <>
                <Helmet>
                  <title>DenunZIA | Sistema de Inteligencia Ética y Denuncia Anónima</title>
                  <meta name="description" content="Sistema Integrado de Inteligencia Ética y Criminal. Plataforma segura para denuncias anónimas, protección de alertadores y análisis de inteligencia." />
                  <link rel="canonical" href="https://denunzia.ai/" />
                </Helmet>
                <Dashboard />
              </>
            } />
            <Route path="denunciar" element={
              <>
                <Helmet>
                  <title>Realizar Denuncia Anónima Segura - Cifrado RSA-4096</title>
                  <meta name="description" content="Formulario de alta seguridad para reportes ciudadanos. Cifrado RSA-4096 de extremo a extremo, protección total de identidad y red TOR." />
                  <link rel="canonical" href="https://denunzia.ai/denunciar" />
                </Helmet>
                <ReportForm />
              </>
            } />
            <Route path="informacion" element={
              <>
                <Helmet>
                  <title>Información del Sistema | DenunZIA</title>
                  <meta name="description" content="Conozca cómo nuestra tecnología de cifrado E2EE y red TOR protege a los alertadores." />
                  <link rel="canonical" href="https://denunzia.ai/informacion" />
                </Helmet>
                <About />
              </>
            } />
            <Route path="admin" element={
              <>
                <Helmet>
                  <title>Acceso Administrativo | DenunZIA</title>
                  <meta name="robots" content="noindex" />
                </Helmet>
                <AdminPanel />
              </>
            } />
            {/* Fallback para 404 */}
            <Route path="*" element={
              <>
                <Helmet>
                  <title>Página no encontrada | DenunZIA</title>
                  <meta name="robots" content="noindex" />
                </Helmet>
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <h2 className="text-4xl font-cyber mb-4">404</h2>
                  <p>Recurso no localizado</p>
                </div>
              </>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;