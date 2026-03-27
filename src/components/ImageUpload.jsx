import React, { useState, useRef } from 'react';
import '../styles/InputForm.css';

function ImageUpload({ onScan, t }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError(t('uploadHint'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('uploadHint'));
      return;
    }

    setImage(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!preview) {
      setError(t('labelUploadImg'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/scan-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: preview, lang: t('langCode') || 'en', aiModel: 'auto' })
      });

      const result = await response.json();

      if (result.success) {
        onScan({
          type: 'image',
          content: image ? image.name : 'Image Scan',
          image: preview,
          scanMode: 'auto',
          ...result.data
        });
        setImage(null);
        setPreview(null);
      } else {
        setError(t('failSave'));
      }
    } catch (error) {
      setError(t('connError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      fileInputRef.current.files = e.dataTransfer.files;
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  return (
    <div className="input-form">
      <div className="form-group">
        <label>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          {t('labelUploadImg')}
        </label>
        <div
          className="upload-area"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {preview ? (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <button
                type="button"
                className="remove-image"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                  setPreview(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="upload-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p className="upload-text">{t('uploadPlaceholder')}</p>
              <p className="upload-hint">{t('uploadHint')}</p>
            </div>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="input-actions" style={{ position: 'relative' }}>

        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          {t('btnChooseFile')}
        </button>
        <button
          className="btn-primary"
          onClick={handleScan}
          disabled={isLoading || !preview}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              {t('analyzing')}
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              {t('btnCheckImage')}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ImageUpload;