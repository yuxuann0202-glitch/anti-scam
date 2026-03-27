import React from 'react';
import '../styles/Header.css';

function Header({ onLogoClick, currentLang, setLang, t, user, logout }) {
  const avatarLetter = user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const displayName = user?.displayName || user?.email?.split('@')[0] || '';

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left" onClick={onLogoClick} style={{ cursor: 'pointer' }}>
          <div className="logo-text">
            <h1>ANTI SCAM</h1>
          </div>
        </div>

        <div className="header-center">
          <h2>{t('headerTitle')}</h2>
        </div>

        <div className="header-right">
          <div className="lang-container">
            <select
              className="lang-selector-premium"
              value={currentLang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en">English (US)</option>
              <option value="ms">Bahasa Melayu</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="ta">தமிழ் (Tamil)</option>
            </select>
          </div>

          {user && (
            <div className="header-user">
              <div className="user-avatar">{avatarLetter}</div>
              <span className="user-name">{displayName}</span>
              <button className="logout-btn" onClick={logout} title={t('navLogout')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;