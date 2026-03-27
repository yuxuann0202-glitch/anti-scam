import React, { useState } from 'react';
import MessageInput from './MessageInput';
import LinkInput from './LinkInput';
import ImageUpload from './ImageUpload';
import '../styles/Input.css';

function InputInterface({ onScan, onViewHistory, t }) {
  const [activeTab, setActiveTab] = useState('message');

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <div className="welcome-section">
          <h2>{t('checkTitle')}</h2>
          <p>{t('checkSubtitle')}</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-button ${activeTab === 'message' ? 'active' : ''}`}
            onClick={() => setActiveTab('message')}
          >
            <span className="tab-icon">{t('tabMessage')}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            <span className="tab-icon">{t('tabLink')}</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
            onClick={() => setActiveTab('image')}
          >
            <span className="tab-icon">{t('tabImage')}</span>
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'message' && <MessageInput onScan={onScan} t={t} />}
          {activeTab === 'link' && <LinkInput onScan={onScan} t={t} />}
          {activeTab === 'image' && <ImageUpload onScan={onScan} t={t} />}
        </div>

        <button className="history-button" onClick={onViewHistory}>
          {t('btnViewHistory')}
        </button>
      </div>

      <div className="info-panel">
        <h3>{t('infoPanelTitle')}</h3>
        <ul className="scam-list">
          <li>
            <strong>{t('scamParcel')}</strong>
            <p>{t('scamParcelDesc')}</p>
          </li>
          <li>
            <strong>{t('scamOtp')}</strong>
            <p>{t('scamOtpDesc')}</p>
          </li>
          <li>
            <strong>{t('scamInvest')}</strong>
            <p>{t('scamInvestDesc')}</p>
          </li>
          <li>
            <strong>{t('scamPhishing')}</strong>
            <p>{t('scamPhishingDesc')}</p>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InputInterface;