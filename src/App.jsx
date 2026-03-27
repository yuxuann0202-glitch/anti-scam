import React, { useState, useEffect } from 'react';
import './styles/variables.css';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MessageInput from './components/MessageInput';
import LinkInput from './components/LinkInput';
import ImageUpload from './components/ImageUpload';
import ResultDisplay from './components/ResultDisplay';
import History from './components/History';
import Onboarding from './components/Onboarding';
import translations from './translations';
import './styles/Auth.css';

function AppContent() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [scanResult, setScanResult] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [lang, setLang] = useState('en');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      const key = `hasSeenOnboarding_${user.uid}`;
      if (!localStorage.getItem(key)) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['en'][key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  if (loading) {
    return (
      <div className="auth-loading">
        <span className="auth-spinner" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage t={t} />;
  }

  const handleScan = (inputData) => {
    const stamped = { ...inputData, timestamp: Date.now() };
    setScanResult(stamped);
    setScanHistory([stamped, ...scanHistory]);
    setActivePage('results');
  };

  const clearHistory = () => setScanHistory([]);

  return (
    <div className="app">
      {showOnboarding && (
        <Onboarding
          t={t}
          userUid={user.uid}
          onDone={() => setShowOnboarding(false)}
          onNavigate={(page) => { setActivePage(page); setShowOnboarding(false); }}
        />
      )}
      <Header
        onLogoClick={() => setActivePage('dashboard')}
        currentLang={lang}
        setLang={setLang}
        t={t}
        user={user}
        logout={logout}
      />

      <div className="app-container">
        <Sidebar activePage={activePage} onPageChange={setActivePage} t={t} logout={logout} />

        <main className="app-main">
          {activePage === 'dashboard' && <Dashboard t={t} />}

          {activePage === 'message' && (
            <div className="scanner-view">
              <h2>{t('tabMessage')}</h2>
              <MessageInput onScan={handleScan} t={t} />
            </div>
          )}

          {activePage === 'link' && (
            <div className="scanner-view">
              <h2>{t('tabLink')}</h2>
              <LinkInput onScan={handleScan} t={t} />
            </div>
          )}

          {activePage === 'image' && (
            <div className="scanner-view">
              <h2>{t('tabImage')}</h2>
              <ImageUpload onScan={handleScan} t={t} />
            </div>
          )}

          {activePage === 'results' && scanResult && (
            <ResultDisplay
              result={scanResult}
              onBack={() => setActivePage(scanResult.type)}
              t={t}
              lang={lang}
              user={user}
              onUpdateResult={(updatedResult) => setScanResult(prev => ({ ...prev, ...updatedResult }))}
            />
          )}

          {activePage === 'history' && (
            <History
              history={scanHistory}
              onBack={() => setActivePage('dashboard')}
              onClear={clearHistory}
              t={t}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
