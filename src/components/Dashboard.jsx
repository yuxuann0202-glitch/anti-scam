import React from 'react';
import '../styles/Dashboard.css';

function Dashboard({ t }) {
  const commonScams = [
    {
      title: t('scamParcel'),
      desc: t('scamParcelDesc'),
      icon: null,
      color: '#2563eb'
    },
    {
      title: t('scamOtp'),
      desc: t('scamOtpDesc'),
      icon: null,
      color: '#d4426b'
    },
    {
      title: t('scamInvest'),
      desc: t('scamInvestDesc'),
      icon: null,
      color: '#2d7a5c'
    },
    {
      title: t('scamPhishing'),
      desc: t('scamPhishingDesc'),
      icon: null,
      color: '#e8a028'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>{t('infoPanelTitle')}</h1>
        <p className="dashboard-subtitle">{t('tagline')}</p>
      </div>

      <div className="scam-grid">
        {commonScams.map((scam, index) => (
          <div key={index} className="scam-card" style={{ '--accent': scam.color }}>
            <h3>{scam.title}</h3>
            <p>{scam.desc}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-warning">
        <div className="warning-icon-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div className="warning-text">
          <strong>{t('alertTitle')}</strong> {t('alertDesc')}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
