import React, { useState, useEffect, useRef } from 'react';
import { Camera, QrCode, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import jsQR from 'jsqr';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  studentId?: string;
  admissionNo?: string;
}

export const QrAttendanceScannerModal: React.FC<QrAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentId,
  admissionNo
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const stopCamera = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setScanning(true);
    setFeedback(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        scanQRCodeFrame();
      }
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setCameraError(err.message || 'Unable to access device camera. Please enter the session code manually below.');
      setScanning(false);
    }
  };

  const scanQRCodeFrame = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        stopCamera();
        handleProcessCode(code.data);
        return;
      }
    }

    animationFrameId.current = requestAnimationFrame(scanQRCodeFrame);
  };

  const handleProcessCode = async (codeValue: string) => {
    if (!codeValue.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/app/education/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': localStorage.getItem('erp_user_id') || ''
        },
        body: JSON.stringify({
          sessionCodeOrToken: codeValue.trim(),
          studentId,
          admissionNo,
          deviceInfo: `${navigator.userAgent} (${window.screen.width}x${window.screen.height})`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: data.message || 'Attendance verified and recorded successfully!' });
        setTimeout(() => {
          onSuccess(data);
          onClose();
        }, 1600);
      } else {
        setFeedback({ type: 'error', message: data.message || data.error || 'Invalid or expired attendance session.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Connection error recording attendance.' });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Attendance QR Scanner</h3>
              <p className="text-[11px] text-slate-400">Scan lecturer's live session QR code</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Scanner Viewport */}
          <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-dashed border-slate-700">
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraError ? 'hidden' : ''}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!cameraError && scanning && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                <div className="w-48 h-48 border-2 border-blue-500 rounded-xl relative">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-blue-400 -mt-1 -ml-1 rounded-tl-sm"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-blue-400 -mt-1 -mr-1 rounded-tr-sm"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-blue-400 -mb-1 -ml-1 rounded-bl-sm"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-blue-400 -mb-1 -mr-1 rounded-br-sm"></div>
                  <div className="w-full h-0.5 bg-blue-400/80 shadow-sm animate-pulse absolute top-1/2 -translate-y-1/2"></div>
                </div>
                <p className="mt-3 text-[11px] text-white/90 bg-black/60 px-3 py-1 rounded-full font-medium">
                  Align QR Code within frame
                </p>
              </div>
            )}

            {cameraError && (
              <div className="p-4 text-center text-slate-300 space-y-2">
                <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs text-blue-400 hover:text-blue-300 underline font-medium inline-flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  <span>Retry Camera</span>
                </button>
              </div>
            )}
          </div>

          {/* Feedback messages */}
          {feedback && (
            <div
              className={`p-3 rounded-xl flex items-start space-x-2.5 text-xs ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Or Enter Session Code Manually
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. ATT-2026-X89K"
                value={manualCode}
                onChange={e => setManualCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                disabled={!manualCode.trim() || submitting}
                onClick={() => handleProcessCode(manualCode)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {submitting ? 'Verifying...' : 'Check In'}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Attendance scans are cryptographically verified and recorded in your student academic log.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
