import React, { useState } from 'react';
import './Onboarding.css';

const STEPS = [
  {
    titleKey: 'onboardStep1Title',
    descKey: 'onboardStep1Desc',
    tipKey: 'onboardStep1Tip',
    pageKey: 'message',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    titleKey: 'onboardStep2Title',
    descKey: 'onboardStep2Desc',
    tipKey: 'onboardStep2Tip',
    pageKey: 'link',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    titleKey: 'onboardStep3Title',
    descKey: 'onboardStep3Desc',
    tipKey: 'onboardStep3Tip',
    pageKey: 'image',
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
];

function Onboarding({ t, userUid, onDone, onNavigate }) {
  const [step, setStep] = useState(0);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      setStep(s => s + 1);
    }
  };

  const finish = () => {
    localStorage.setItem(`hasSeenOnboarding_${userUid}`, '1');
    onDone();
  };

  const handleTryNow = () => {
    localStorage.setItem(`hasSeenOnboarding_${userUid}`, '1');
    onNavigate(current.pageKey);
  };

  return (
    <div className="onboarding-overlay" onClick={(e) => { if (e.target === e.currentTarget) finish(); }}>
      <div className="onboarding-modal">
        {/* Skip */}
        <button className="onboarding-skip" onClick={finish}>
          {t('onboardSkip')}
        </button>

        {/* Step indicator */}
        <div className="onboarding-badge">{t('onboardBadge', { step: step + 1, total: STEPS.length })}</div>

        {/* Icon */}
        <div className="onboarding-icon" style={{ color: 'var(--primary-accent)' }}>
          {current.icon}
        </div>

        {/* Content */}
        <h2 className="onboarding-title">{t(current.titleKey)}</h2>
        <p className="onboarding-desc">{t(current.descKey)}</p>

        {/* Tip box */}
        <div className="onboarding-tip">
          <span className="onboarding-tip-icon">💡</span>
          <span>{t(current.tipKey)}</span>
        </div>

        {/* Progress dots */}
        <div className="onboarding-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`onboarding-dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="onboarding-actions">
          <button className="onboarding-btn-secondary" onClick={handleTryNow}>
            {t('onboardTryNow')}
          </button>
          <button className="onboarding-btn-primary" onClick={handleNext}>
            {isLast ? t('onboardFinish') : t('onboardNext')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
