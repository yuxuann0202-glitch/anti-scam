import React, { useState } from 'react';
import '../styles/InputForm.css';

function LinkInput({ onScan, t }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const normalizeUrl = (str) => {
    const trimmed = str.trim();
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const isValidURL = (str) => {
    try {
      new URL(normalizeUrl(str));
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleScan = async () => {
    if (!url.trim()) {
      setError(t('labelPasteLink'));
      return;
    }

    const normalized = normalizeUrl(url);

    if (!isValidURL(url)) {
      setError(t('errorInvalidLink'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/scan-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalized, lang: t('langCode') || 'en', aiModel: 'auto' })
      });

      const result = await response.json();

      if (result.success) {
        onScan({
          type: 'link',
          content: normalized,
          scanMode: 'auto',
          ...result.data
        });
        setUrl('');
      } else {
        setError(t('failSave'));
      }
    } catch (error) {
      setError(t('connError'));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
    } catch (err) {
      setError(t('connError'));
    }
  };

  return (
    <div className="input-form" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
      <div className="form-group" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <label htmlFor="url-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          {t('labelPasteLink')}
        </label>
        <input
          id="url-input"
          type="text"
          className={`text-input ${error ? 'error' : ''}`}
          style={{ padding: '16px 20px', fontSize: '1.05rem' }}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError('');
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleScan();
            }
          }}
          placeholder={t('placeholderLink')}
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="input-actions" style={{ position: 'relative' }}>
        <button className="btn-secondary" onClick={handlePaste}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          {t('btnPaste')}
        </button>
        <button
          className="btn-primary"
          onClick={handleScan}
          disabled={isLoading || !url.trim()}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              {t('checking')}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              {t('btnCheckLink')}
            </>
          )}
        </button>
      </div>

      <div className="info-box">
        <p>{t('linkInfo')}</p>
      </div>
    </div>
  );
}

export default LinkInput;