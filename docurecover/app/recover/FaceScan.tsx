'use client';

import React, { useEffect, useRef, useState } from 'react';
import { loadFaceApi, cropToDataUrl, MATCH_THRESHOLD } from '@/app/_lib/face';

type Phase = 'loading' | 'center' | 'left' | 'right' | 'capture' | 'flash' | 'result' | 'error';
type Hint = 'noFace' | 'closer' | 'center' | 'straight' | 'flashLost' | null;

export type FaceScanResult = {
  matched: boolean;
  similarity: number;
  selfie: string;
};

type Props = {
  isMs: boolean;
  referenceDescriptor: Float32Array;
  referenceImage: string;
  onComplete: (result: FaceScanResult) => void;
  onClose: () => void;
};

const FLASH_COLORS = ['#FF1E1E', '#1EFF3C', '#1E50FF'];
const FLASH_MS = 800;
const TURN_DELTA = 0.14;
const SAMPLES_NEEDED = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STEPS: { phase: Phase; en: string; ms: string }[] = [
  { phase: 'center', en: 'Position', ms: 'Kedudukan' },
  { phase: 'left', en: 'Turn left', ms: 'Ke kiri' },
  { phase: 'right', en: 'Turn right', ms: 'Ke kanan' },
  { phase: 'capture', en: 'Capture', ms: 'Tangkap' },
  { phase: 'flash', en: 'Light scan', ms: 'Imbasan cahaya' },
  { phase: 'result', en: 'Compare', ms: 'Banding' },
];

export default function FaceScan({ isMs, referenceDescriptor, referenceImage, onComplete, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<Phase>('loading');
  const [hint, setHint] = useState<Hint>(null);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<'camera' | 'model' | null>(null);
  const [result, setResult] = useState<FaceScanResult | null>(null);

  const phaseRef = useRef<Phase>('loading');
  const holdStartRef = useRef(0);
  const baselineYawRef = useRef(0.5);
  const samplesRef = useRef<Float32Array[]>([]);
  const selfieRef = useRef('');
  const flashIndexRef = useRef(-1);
  const flashSeenRef = useRef<boolean[]>([false, false, false]);
  const capturingRef = useRef(false);

  const t = (en: string, ms: string) => (isMs ? ms : en);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let faceApiRef: Awaited<ReturnType<typeof loadFaceApi>> | null = null;

    const go = (next: Phase) => {
      phaseRef.current = next;
      holdStartRef.current = 0;
      setPhase(next);
      setHint(null);
    };

    const heldFor = (condition: boolean, ms: number) => {
      if (!condition) {
        holdStartRef.current = 0;
        return false;
      }
      const now = performance.now();
      if (!holdStartRef.current) holdStartRef.current = now;
      return now - holdStartRef.current >= ms;
    };

    const stopCamera = () => {
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
    };

    const finish = () => {
      const faceapi = faceApiRef;
      if (!faceapi) return;
      const distances = samplesRef.current.map((d) => faceapi.euclideanDistance(d, referenceDescriptor));
      const best = Math.min(...distances);
      setResult({
        matched: best < MATCH_THRESHOLD,
        similarity: Math.max(0, Math.round((1 - best) * 100)),
        selfie: selfieRef.current,
      });
      stopCamera();
      go('result');
    };

    const runFlash = async () => {
      while (!cancelled) {
        flashSeenRef.current = [false, false, false];
        for (let i = 0; i < FLASH_COLORS.length; i++) {
          if (cancelled) return;
          flashIndexRef.current = i;
          setFlashColor(FLASH_COLORS[i]);
          await sleep(FLASH_MS);
        }
        flashIndexRef.current = -1;
        setFlashColor(null);
        if (flashSeenRef.current.every(Boolean)) {
          finish();
          return;
        }
        setHint('flashLost');
        await sleep(1200);
        setHint(null);
      }
    };

    const drawLandmarks = (points: { x: number; y: number }[] | null) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;
      if (canvas.width !== video.videoWidth) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!points || phaseRef.current === 'flash') return;
      ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
      for (const p of points) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
      } catch {
        if (!cancelled) {
          setErrorKind('camera');
          go('error');
        }
        return;
      }
      if (cancelled) {
        stopCamera();
        return;
      }

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play().catch(() => {});

      try {
        faceApiRef = await loadFaceApi();
      } catch {
        if (!cancelled) {
          setErrorKind('model');
          go('error');
        }
        stopCamera();
        return;
      }
      if (cancelled) return;

      const faceapi = faceApiRef;
      const tinyOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 });
      const ssdOptions = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 });
      go('center');

      const tick = async () => {
        if (cancelled) return;
        const current = phaseRef.current;
        if (current === 'result' || current === 'error') return;

        const detection = video.readyState >= 2
          ? await faceapi.detectSingleFace(video, tinyOptions).withFaceLandmarks()
          : undefined;
        if (cancelled) return;

        drawLandmarks(detection ? detection.landmarks.positions : null);

        if (!detection) {
          holdStartRef.current = 0;
          if (current !== 'flash') setHint('noFace');
        } else {
          const pts = detection.landmarks.positions;
          const jawStart = pts[0];
          const jawEnd = pts[16];
          const noseTip = pts[30];
          // 0.5 = facing camera. Rises when the user turns to their left, falls to their right.
          const yaw = (noseTip.x - jawStart.x) / (jawEnd.x - jawStart.x);

          const box = detection.detection.box;
          const cx = (box.x + box.width / 2) / video.videoWidth;
          const cy = (box.y + box.height / 2) / video.videoHeight;
          const bigEnough = box.width / video.videoWidth > 0.22;
          const centered = cx > 0.3 && cx < 0.7 && cy > 0.25 && cy < 0.75;

          if (current === 'flash') {
            if (flashIndexRef.current >= 0) flashSeenRef.current[flashIndexRef.current] = true;
          } else if (current === 'center') {
            if (!bigEnough) setHint('closer');
            else if (!centered) setHint('center');
            else if (Math.abs(yaw - 0.5) > 0.12) setHint('straight');
            else {
              setHint(null);
              if (heldFor(true, 700)) {
                baselineYawRef.current = yaw;
                go('left');
              }
            }
          } else if (current === 'left') {
            setHint(null);
            if (heldFor(yaw > baselineYawRef.current + TURN_DELTA, 350)) go('right');
          } else if (current === 'right') {
            setHint(null);
            if (heldFor(yaw < baselineYawRef.current - TURN_DELTA, 350)) go('capture');
          } else if (current === 'capture') {
            const facingCamera = Math.abs(yaw - baselineYawRef.current) < 0.08;
            if (!facingCamera || !centered) {
              setHint('straight');
            } else if (!capturingRef.current) {
              setHint(null);
              capturingRef.current = true;
              const full = await faceapi
                .detectSingleFace(video, ssdOptions)
                .withFaceLandmarks()
                .withFaceDescriptor();
              capturingRef.current = false;
              if (cancelled) return;
              if (full) {
                if (samplesRef.current.length === 0) {
                  selfieRef.current = cropToDataUrl(
                    video, full.detection.box, video.videoWidth, video.videoHeight, true
                  );
                }
                samplesRef.current.push(full.descriptor);
                if (samplesRef.current.length >= SAMPLES_NEEDED) {
                  go('flash');
                  runFlash();
                }
              }
            }
          }
        }

        requestAnimationFrame(() => {
          tick();
        });
      };

      tick();
    };

    start();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [attempt, referenceDescriptor]);

  const retry = () => {
    phaseRef.current = 'loading';
    samplesRef.current = [];
    selfieRef.current = '';
    capturingRef.current = false;
    setResult(null);
    setErrorKind(null);
    setFlashColor(null);
    setHint(null);
    setPhase('loading');
    setAttempt((a) => a + 1);
  };

  const instruction: Record<Phase, string> = {
    loading: t('Starting camera and face scanner...', 'Memulakan kamera dan pengimbas wajah...'),
    center: t('Position your face inside the circle', 'Letakkan wajah anda di dalam bulatan'),
    left: t('Slowly turn your head to the LEFT', 'Pusingkan kepala anda ke KIRI perlahan-lahan'),
    right: t('Now turn your head to the RIGHT', 'Sekarang pusingkan kepala anda ke KANAN'),
    capture: t('Look straight at the camera', 'Pandang terus ke kamera'),
    flash: t('Hold still, scanning with light...', 'Jangan bergerak, mengimbas dengan cahaya...'),
    result: '',
    error: '',
  };

  const hintText: Record<Exclude<Hint, null>, string> = {
    noFace: t('No face detected', 'Wajah tidak dikesan'),
    closer: t('Move closer to the camera', 'Dekatkan wajah ke kamera'),
    center: t('Move your face to the centre', 'Gerakkan wajah ke tengah'),
    straight: t('Face the camera directly', 'Hadapkan wajah terus ke kamera'),
    flashLost: t('Keep your face in the circle during the light scan. Retrying...', 'Kekalkan wajah dalam bulatan semasa imbasan cahaya. Mencuba semula...'),
  };

  const stepIndex = STEPS.findIndex((s) => s.phase === phase);
  const ringColor =
    phase === 'flash' ? 'border-white' : hint ? 'border-amber-400' : phase === 'loading' ? 'border-slate-600' : 'border-emerald-400';

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6 transition-colors duration-150"
      style={{ backgroundColor: flashColor ?? '#0A0E1A' }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white text-xl"
        aria-label={t('Close', 'Tutup')}
      >
        ×
      </button>

      {phase === 'error' ? (
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">
            {errorKind === 'camera'
              ? t('Camera access needed', 'Akses kamera diperlukan')
              : t('Face scanner failed to load', 'Pengimbas wajah gagal dimuatkan')}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {errorKind === 'camera'
              ? t(
                  'Allow camera access in your browser settings (the camera icon in the address bar), then try again.',
                  'Benarkan akses kamera dalam tetapan pelayar (ikon kamera di bar alamat), kemudian cuba lagi.'
                )
              : t('Check your connection and try again.', 'Semak sambungan anda dan cuba lagi.')}
          </p>
          <button onClick={retry} className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold">
            {t('Try again', 'Cuba lagi')}
          </button>
        </div>
      ) : phase === 'result' && result ? (
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-3">{result.matched ? '✅' : '❌'}</div>
          <h3 className="text-xl font-bold text-white mb-1">
            {result.matched ? t('Face matched', 'Wajah sepadan') : t('Face does not match', 'Wajah tidak sepadan')}
          </h3>
          <p className="text-sm text-slate-400 mb-6">
            {result.matched
              ? t('Your face matches the photo on your document.', 'Wajah anda sepadan dengan gambar pada dokumen anda.')
              : t(
                  'Your face does not match the document photo. Try better lighting, or upload a clearer document photo.',
                  'Wajah anda tidak sepadan dengan gambar dokumen. Cuba dengan pencahayaan lebih baik, atau muat naik gambar dokumen yang lebih jelas.'
                )}
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div>
              <img src={referenceImage} alt="" className="w-28 h-28 object-cover rounded-xl border border-white/10" />
              <div className="text-xs text-slate-400 mt-1">{t('Document', 'Dokumen')}</div>
            </div>
            <div className="text-2xl text-slate-500">⇄</div>
            <div>
              <img src={result.selfie} alt="" className="w-28 h-28 object-cover rounded-xl border border-white/10" />
              <div className="text-xs text-slate-400 mt-1">{t('Camera', 'Kamera')}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>{t('Similarity', 'Keserupaan')}</span>
              <span className={result.matched ? 'text-emerald-400' : 'text-red-400'}>{result.similarity}%</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${result.matched ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${result.similarity}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t('Required to pass', 'Diperlukan untuk lulus')}: {Math.round((1 - MATCH_THRESHOLD) * 100)}%
            </div>
          </div>

          {result.matched ? (
            <button
              onClick={() => onComplete(result)}
              className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              {t('Continue', 'Teruskan')}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold">
                {t('Change document', 'Tukar dokumen')}
              </button>
              <button onClick={retry} className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                {t('Scan again', 'Imbas semula')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          <h3 className="text-lg font-semibold text-white mb-1 text-center drop-shadow">
            {t('Face Verification', 'Pengesahan Wajah')}
          </h3>
          <p className="text-base text-white/90 mb-6 text-center min-h-[1.5rem] drop-shadow">{instruction[phase]}</p>

          <div className="relative flex items-center justify-center">
            {phase === 'left' && (
              <div className="absolute -left-14 text-5xl text-sky-400 animate-pulse">←</div>
            )}
            {phase === 'right' && (
              <div className="absolute -right-14 text-5xl text-sky-400 animate-pulse">→</div>
            )}

            <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 ${ringColor} bg-black transition-colors`}>
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover -scale-x-100"
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
              {phase === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
                </div>
              )}
              {phase !== 'loading' && phase !== 'flash' && (
                <div className="absolute inset-x-0 h-0.5 bg-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.9)] animate-[scanline_2.4s_ease-in-out_infinite]" />
              )}
            </div>
          </div>

          <p className="text-sm text-amber-300 mt-4 min-h-[1.25rem] text-center drop-shadow">{hint ? hintText[hint] : ''}</p>

          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            {STEPS.map((s, i) => (
              <div
                key={s.phase}
                className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                  i < stepIndex
                    ? 'bg-emerald-600/80 text-white'
                    : i === stepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-black/40 text-slate-400'
                }`}
              >
                {i < stepIndex ? '✓ ' : ''}
                {isMs ? s.ms : s.en}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
