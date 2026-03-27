import React from 'react';
import '../styles/History.css';

function History({ history, onBack, onClear, t }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Low':
        return '#2e7d32';
      case 'Medium':
        return '#ff6d00';
      case 'High':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  return (
    <div className="history-container">
      <button className="back-button" onClick={onBack}>
        {t('btnBack')}
      </button>

      <div className="history-card">
        <div className="history-header">
          <h2>{t('historyTitle')}</h2>
          <p className="history-subtitle">
            {history.length === 0 
              ? t('historyEmptyDesc') 
              : t('historySubtitle', { count: history.length })}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-content">
              <h3>{t('historyEmpty')}</h3>
              <p>{t('historyEmptyDesc')}</p>
              <button className="btn-start" onClick={onBack}>
                {t('btnStartScanning')}
              </button>
            </div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="item-content">
                  <div className="content-text">
                    <p className="content-preview">
                      {(item.content || 'Image Scan').length > 60
                        ? (item.content || 'Image Scan').substring(0, 60) + '...'
                        : (item.content || 'Image Scan')}
                    </p>
                    <p className="content-details">
                      <span className="content-type">{item.type.toUpperCase()}</span>
                      <span className="dot">•</span>
                      <span className="content-time">{formatDate(item.timestamp)}</span>
                    </p>
                  </div>
                </div>

                <div className="item-result">
                  <span 
                    className="risk-badge"
                    style={{ 
                      borderColor: getRiskColor(item.riskLevel),
                      backgroundColor: getRiskColor(item.riskLevel) + '15',
                      color: getRiskColor(item.riskLevel)
                    }}
                  >
                    {t(`riskLevel${item.riskLevel || 'Low'}`)}
                  </span>
                  <p className="result-label">
                    {item.isScam ? t('verdictScam') : t('verdictSafe')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-actions">
          <button className="btn-clear" onClick={onClear}>{t('btnClearHistory')}</button>
        </div>
      )}
    </div>
  );
}

export default History;