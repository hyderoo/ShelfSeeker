// BarcodeScanner.js - camera barcode scanning with the built-in BarcodeDetector API.
// Supported in Chrome and Edge (desktop and Android). Other browsers get the
// manual ISBN input instead - the caller decides what to show when unsupported.
import React, { useEffect, useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './BarcodeScanner.css';

export const isBarcodeScanSupported = () =>
  typeof window !== 'undefined' &&
  'BarcodeDetector' in window &&
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

const BarcodeScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream = null;
    let active = true;
    let timer = null;

    async function start() {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        // books are printed as EAN-13 (Bookland); accept the other common ones too
        const wanted = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39']
          .filter((format) => formats.includes(format));
        if (wanted.length === 0) {
          throw new Error('unsupported-formats');
        }
        const detector = new window.BarcodeDetector({ formats: wanted });

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        video.srcObject = stream;
        await video.play();

        timer = setInterval(async () => {
          if (!active || !video || video.readyState < 2) return;
          try {
            const codes = await detector.detect(video);
            if (codes.length > 0) {
              onDetected(codes[0].rawValue);
            }
          } catch (detectError) {
            // a single failed frame is normal - keep scanning
          }
        }, 400);
      } catch (startError) {
        if (!active) return;
        if (startError && (startError.name === 'NotAllowedError' || startError.name === 'SecurityError')) {
          setError('Camera access was denied. Allow camera permission in your browser, or type the ISBN manually.');
        } else if (startError && startError.name === 'NotFoundError') {
          setError('No camera found on this device. Type the ISBN manually instead.');
        } else {
          setError('Camera scanning is not available here. Type the ISBN manually instead.');
        }
      }
    }

    start();

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected]);

  return (
    <div className='scanner-panel' role='dialog' aria-label='Barcode scanner'>
      <div className='scanner-panel-header'>
        <span>Point the camera at the book&apos;s barcode</span>
        <button type='button' onClick={onClose} aria-label='Close scanner'>
          <FaTimes size={18} />
        </button>
      </div>
      {error ? (
        <p className='scanner-error'>{error}</p>
      ) : (
        <div className='scanner-video-wrap'>
          <video ref={videoRef} muted playsInline aria-label='Camera view for barcode scanning' />
          <div className='scanner-reticle' aria-hidden='true' />
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
