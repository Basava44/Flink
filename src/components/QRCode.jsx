import React, { useState, useEffect } from 'react';
import { generateQRDataURL } from '../lib/qrcode';

const QRCode = ({ value, size = 200, dark = '#000000', light = '#ffffff', className = '' }) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    if (!value) return;
    try {
      const url = generateQRDataURL(value, size, { dark, light });
      setDataUrl(url);
    } catch (err) {
      console.error('QR generation failed:', err);
    }
  }, [value, size, dark, light]);

  if (!dataUrl) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className={className}
    />
  );
};

export default QRCode;
