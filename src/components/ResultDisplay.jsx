import React, { useState, useEffect, useRef } from 'react';
import '../styles/Result.css';

const RING_C = 339.29; // 2 * π * 54

function ResultDisplay({ result, onBack, t, lang, onUpdateResult, user }) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isRescanning, setIsRescanning] = useState(false);

  const { isScam, riskLevel, confidence = 0, whitelistMatch, type: resultType } = result;
  const isUncertain = confidence < 80 && !result.isDeepScanned;

  // Color theme based on verdict + risk level
  const theme = isScam
    ? riskLevel === 'Medium'
      ? { color: '#ffb020', glow: 'rgba(255,176,32,0.25)', bg: 'rgba(255,176,32,0.1)', dim: 'rgba(255,176,32,0.15)' }
      : { color: '#ff3b5c', glow: 'rgba(255,59,92,0.25)', bg: 'rgba(255,59,92,0.1)', dim: 'rgba(255,59,92,0.15)' }
    : { color: '#00d4aa', glow: 'rgba(0,212,170,0.25)', bg: 'rgba(0,212,170,0.1)', dim: 'rgba(0,212,170,0.15)' };

  const ringOffset = RING_C * (1 - confidence / 100);

  const handleDeepScan = async () => {
    setIsRescanning(true);
    try {
      const endpointMap = { message: '/api/scan-message', link: '/api/scan-link', image: '/api/scan-image' };
      const bodyMap = {
        message: { message: result.content, lang, aiModel: 'deep' },
        link:    { url: result.content, lang, aiModel: 'deep' },
        image:   { image: result.image, lang, aiModel: 'deep' }
      };
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}${endpointMap[result.type]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyMap[result.type])
      });
      const data = await response.json();
      if (data.success) {
        onUpdateResult({ ...data.data, scanMode: 'deep', isDeepScanned: true });
      }
    } catch (e) {
      console.error('Deep scan error:', e);
    } finally {
      setIsRescanning(false);
    }
  };

  // Translatable display values (for live language switching without re-scan)
  const [displayData, setDisplayData] = useState({
    explanation: result.explanation,
    advice: result.advice || [],
    scamType: result.scamType || ''
  });
  const scanLangRef = useRef(lang);
  const originalDataRef = useRef({
    explanation: result.explanation,
    advice: result.advice || [],
    scamType: result.scamType || ''
  });

  // Reset when a new scan result arrives
  useEffect(() => {
    scanLangRef.current = lang;
    const newData = {
      explanation: result.explanation,
      advice: result.advice || [],
      scamType: result.scamType || ''
    };
    originalDataRef.current = newData;
    setDisplayData(newData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Live translation when language changes (no re-scan needed)
  useEffect(() => {
    if (result.whitelistMatch) return;

    if (lang === scanLangRef.current) {
      setDisplayData({ ...originalDataRef.current });
      return;
    }

    const translateResult = async () => {
      setIsTranslating(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/translate-result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            explanation: originalDataRef.current.explanation,
            advice: originalDataRef.current.advice,
            scamType: originalDataRef.current.scamType,
            targetLang: lang
          })
        });
        const data = await response.json();
        if (data.success) {
          setDisplayData({
            explanation: data.data.explanation,
            advice: data.data.advice || originalDataRef.current.advice,
            scamType: data.data.scamType || originalDataRef.current.scamType
          });
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    };
    translateResult();
  }, [lang, result.whitelistMatch, result.explanation]);

  const handleSaveReport = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/save-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: result.content || result.extractedText || 'Unknown Content',
          isScam: result.isScam,
          riskLevel: result.riskLevel,
          scamType: result.scamType,
          explanation: result.explanation,
          advice: result.advice,
          confidence: result.confidence,
          type: result.type || 'message',
          userId: user?.uid || null
        })
      });
      const data = await response.json();
      setSaveMessage(data.success ? t('successSave') : t('failSave'));
    } catch (error) {
      setSaveMessage(t('connError'));
    } finally {
      setIsSaving(false);
    }
  };

  const typeLabel = resultType === 'image' ? 'Image' : resultType === 'link' ? 'Link' : 'Message';

  return (
    <div className="result-container">
    <div className="rd-inner">
      {/* ── Nav ── */}
      <div className="rd-nav">
        <button className="back-button" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          {t('btnBack')}
        </button>
        <div className="rd-nav-badges">
          {result.scanMode === 'deep' && (
            <span className="rd-badge rd-badge--deep">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
              </svg>
              {t('aiModeDeep')}
            </span>
          )}
          <span className="rd-badge rd-badge--type">{typeLabel}</span>
        </div>
      </div>

      {/* ── Hero Verdict ── */}
      <div
        className="rd-hero"
        style={{ '--theme-color': theme.color, '--theme-glow': theme.glow, '--theme-bg': theme.bg }}
      >
        <div className="rd-hero-left">
          <div className="rd-verdict-icon" style={{ background: theme.bg, boxShadow: `0 0 32px ${theme.glow}` }}>
            {isScam ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={theme.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
            )}
          </div>
          <div className="rd-verdict-body">
            <h1 className="rd-verdict-title" style={{ color: theme.color }}>
              {isScam ? t('verdictScamTitle') : t('verdictSafeTitle')}
            </h1>
            <div className="rd-verdict-meta">
              <span className="rd-risk-badge" style={{ background: theme.dim, color: theme.color }}>
                {t('riskLevel')}: {t(`riskLevel${riskLevel || 'Low'}`)}
              </span>
              {displayData.scamType && !isTranslating && (
                <span className="rd-type-badge">{displayData.scamType}</span>
              )}
            </div>
          </div>
        </div>

        {/* Confidence ring */}
        <div className="rd-ring-wrap">
          <svg className="rd-ring" width="118" height="118" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7"/>
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={theme.color} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={RING_C} strokeDashoffset={ringOffset}
              className="rd-ring-progress"
            />
            <text x="60" y="53" textAnchor="middle" fill={theme.color}
              style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'Syne, sans-serif' }}>
              {confidence}%
            </text>
            <text x="60" y="73" textAnchor="middle" fill="rgba(240,244,255,0.45)"
              style={{ fontSize: '13px', fontFamily: 'DM Sans, sans-serif' }}>
              {t('confidenceLabel')}
            </text>
          </svg>
        </div>
      </div>

      {/* ── What we found ── */}
      <div className="rd-card rd-card--anim-1">
        <div className="rd-card-header">
          <div className="rd-card-icon" style={{ background: theme.bg, color: theme.color }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <h3 className="rd-card-title">
            {t('analysisDetails')}
            {isTranslating && <span className="translating-badge">{t('analyzing')}...</span>}
          </h3>
        </div>
        <div
          className="rd-explanation"
          style={{ background: theme.bg, borderLeftColor: theme.color }}
        >
          {isTranslating ? (
            <span className="rd-translating">{t('analyzing')}...</span>
          ) : (
            whitelistMatch
              ? (resultType === 'link' ? t('officialLink', { type: whitelistMatch }) : t('legitimate', { type: whitelistMatch }))
              : displayData.explanation
          )}
        </div>
      </div>

      {/* ── Embedded Links (message type only) ── */}
      {resultType === 'message' && result.embeddedLinks && result.embeddedLinks.length > 0 && (
        <div className="rd-card rd-card--anim-2">
          <div className="rd-card-header">
            <div className="rd-card-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,244,255,0.6)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <h3 className="rd-card-title">{t('embeddedLinksTitle')}</h3>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {result.embeddedLinks.map((link, i) => {
              const riskColor = link.isWhitelisted ? '#00d4aa' : link.riskLevel === 'High' ? '#ff3b5c' : link.riskLevel === 'Medium' ? '#ffb020' : '#00d4aa';
              const riskLabel = link.isWhitelisted ? t('embeddedLinkOfficial') : link.riskLevel === 'High' ? t('embeddedLinkHigh') : link.riskLevel === 'Medium' ? t('embeddedLinkMedium') : t('embeddedLinkSafe');
              const displayUrl = link.url.length > 45 ? link.url.substring(0, 45) + '…' : link.url;
              return (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', borderLeft: `3px solid ${riskColor}` }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={riskColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    {link.isScam && !link.isWhitelisted
                      ? <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                      : <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></>
                    }
                  </svg>
                  <span style={{ flex: 1, fontSize: '12px', color: 'rgba(240,244,255,0.7)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{displayUrl}</span>
                  <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 700, color: riskColor, background: `${riskColor}18`, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>{riskLabel}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── What you should do ── */}
      {displayData.advice && displayData.advice.length > 0 && (
        <div className="rd-card rd-card--anim-2">
          <div className="rd-card-header">
            <div className="rd-card-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,244,255,0.6)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a2 2 0 0 0-2-2l-3.5 4.5V17c1.5 0 3-1.5 5-1.5H19a2 2 0 0 0 2-2V13a2 2 0 0 0-2-2h-3.5"/><path d="M5 21V12a2 2 0 0 1 2-2h1.5l0 11"/>
              </svg>
            </div>
            <h3 className="rd-card-title">{t('recommendedActions')}</h3>
          </div>
          <ul className="rd-advice-list">
            {whitelistMatch ? (
              (resultType === 'link'
                ? ['verifiedLink', 'safelyClick', 'checkDomain']
                : ['verified', 'proceed', 'officialChannels']
              ).map((key, index) => (
                <li key={index} className="rd-advice-item">
                  <span className="rd-advice-num" style={{ background: theme.dim, color: theme.color }}>{index + 1}</span>
                  <span className="rd-advice-text">{t(key)}</span>
                </li>
              ))
            ) : (
              displayData.advice.map((item, index) => (
                <li key={index} className="rd-advice-item">
                  <span className="rd-advice-num" style={{ background: theme.dim, color: theme.color }}>{index + 1}</span>
                  <span className="rd-advice-text">{isTranslating ? '...' : item}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* ── Stay safe out there ── */}
      <div className="rd-card rd-card--anim-3">
        <div className="rd-card-header">
          <div className="rd-card-icon" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(240,244,255,0.6)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 className="rd-card-title">{t('safetyGuidelines')}</h3>
        </div>
        <div className="rd-tips-grid">
          <div className="rd-tip">
            <div className="rd-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="rd-tip-body">
              <div className="rd-tip-title">{t('guidelineVerify')}</div>
              <p className="rd-tip-desc">{t('guidelineVerifyDesc')}</p>
            </div>
          </div>
          <div className="rd-tip">
            <div className="rd-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div className="rd-tip-body">
              <div className="rd-tip-title">{t('guidelineProtect')}</div>
              <p className="rd-tip-desc">{t('guidelineProtectDesc')}</p>
            </div>
          </div>
          <div className="rd-tip">
            <div className="rd-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <div className="rd-tip-body">
              <div className="rd-tip-title">{t('guidelineCheck')}</div>
              <p className="rd-tip-desc">{t('guidelineCheckDesc')}</p>
            </div>
          </div>
          <div className="rd-tip">
            <div className="rd-tip-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div className="rd-tip-body">
              <div className="rd-tip-title">{t('guidelineTrust')}</div>
              <p className="rd-tip-desc">{t('guidelineTrustDesc')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scan Deeper (uncertain only) ── */}
      {isUncertain && (
        <div className="rd-cta rd-cta--uncertain rd-card--anim-4">
          <div className="rd-cta-body">
            <h4>{t('resultUncertain', { confidence })}</h4>
            <p>{t('deepScanPrompt')}</p>
          </div>
          <button
            className="rd-btn rd-btn--amber"
            onClick={handleDeepScan}
            disabled={isRescanning}
          >
            {isRescanning ? (
              <><span className="rd-spinner"/>{t('analyzingDeeper')}</>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
                </svg>
                {t('scanDeeper')}
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Save Report ── */}
      <div className="rd-cta rd-card--anim-5">
        <div className="rd-cta-body">
          <h4>{t('helpProtectOthers')}</h4>
          <p>{t('helpProtectDesc')}</p>
          {saveMessage && <p className="rd-save-msg">{saveMessage}</p>}
        </div>
        <button
          className="rd-btn rd-btn--primary"
          onClick={handleSaveReport}
          disabled={isSaving || isTranslating}
        >
          {isSaving ? (
            <><span className="rd-spinner"/>{t('analyzing')}</>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
              </svg>
              {t('btnSaveReport')}
            </>
          )}
        </button>
      </div>

      {/* ── Footer ── */}
      <div className="rd-footer">
        <button className="rd-btn rd-btn--ghost" onClick={onBack}>
          {t('btnScanAgain')}
        </button>
      </div>
    </div>
    </div>
  );
}

export default ResultDisplay;
