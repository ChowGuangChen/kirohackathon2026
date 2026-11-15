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
      ctx.fillStyle = 'rgba(163, 230, 53, 0.95)';
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
  const flashing = flashColor !== null;
  const ringColor = flashing
    ? 'border-white'
    : hint
    ? 'border-amber-400'
    : phase === 'loading'
    ? 'border-stone-300'
    : 'border-lime-500';
  const primaryButton = 'px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-400 text-lime-950 font-semibold transition-colors';
  const secondaryButton =
    'px-6 py-3 rounded-lg bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 font-semibold transition-colors';

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-4 sm:px-6 transition-colors duration-150 overflow-y-auto"
      style={{ backgroundColor: flashColor ?? '#FBF8EF' }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-900/10 hover:bg-stone-900/20 text-stone-800 text-xl"
        aria-label={t('Close', 'Tutup')}
      >
        ×
      </button>

      {phase === 'error' ? (
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-stone-900 mb-2">
            {errorKind === 'camera'
              ? t('Camera access needed', 'Akses kamera diperlukan')
              : t('Face scanner failed to load', 'Pengimbas wajah gagal dimuatkan')}
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            {errorKind === 'camera'
              ? t(
                  'Allow camera access in your browser settings (the camera icon in the address bar), then try again.',
                  'Benarkan akses kamera dalam tetapan pelayar (ikon kamera di bar alamat), kemudian cuba lagi.'
                )
              : t('Check your connection and try again.', 'Semak sambungan anda dan cuba lagi.')}
          </p>
          <button onClick={retry} className={primaryButton}>
            {t('Try again', 'Cuba lagi')}
          </button>
        </div>
      ) : phase === 'result' && result ? (
        <div className="max-w-md w-full text-center py-8">
          <div
            className={`w-14 h-14 mx-auto mb-3 rounded-full flex items-center justify-center text-2xl font-bold ${
              result.matched ? 'bg-lime-500 text-lime-950' : 'bg-red-100 text-red-600'
            }`}
          >
            {result.matched ? '✓' : '✗'}
          </div>
          <h3 className="text-xl font-bold text-stone-900 mb-1">
            {result.matched ? t('Face matched', 'Wajah sepadan') : t('Face does not match', 'Wajah tidak sepadan')}
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            {result.matched
              ? t('Your face matches the photo on your document.', 'Wajah anda sepadan dengan gambar pada dokumen anda.')
              : t(
                  'Your face does not match the document photo. Try better lighting, or upload a clearer document photo.',
                  'Wajah anda tidak sepadan dengan gambar dokumen. Cuba dengan pencahayaan lebih baik, atau muat naik gambar dokumen yang lebih jelas.'
                )}
          </p>

          <div className="flex items-center justify-center gap-4 mb-4">
            <div>
              <img src={referenceImage} alt="" className="w-28 h-28 object-cover rounded-xl border border-stone-200" />
              <div className="text-xs text-stone-500 mt-1">{t('Document', 'Dokumen')}</div>
            </div>
            <div className="text-2xl text-stone-400">⇄</div>
            <div>
              <img src={result.selfie} alt="" className="w-28 h-28 object-cover rounded-xl border border-stone-200" />
              <div className="text-xs text-stone-500 mt-1">{t('Camera', 'Kamera')}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-stone-600 mb-1">
              <span>{t('Similarity', 'Keserupaan')}</span>
              <span className={`font-semibold ${result.matched ? 'text-lime-700' : 'text-red-600'}`}>{result.similarity}%</span>
            </div>
            <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${result.matched ? 'bg-lime-500' : 'bg-red-500'}`}
                style={{ width: `${result.similarity}%` }}
              />
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              {t('Required to pass', 'Diperlukan untuk lulus')}: {Math.round((1 - MATCH_THRESHOLD) * 100)}%
            </div>
          </div>

          {result.matched ? (
            <button onClick={() => onComplete(result)} className={`w-full ${primaryButton}`}>
              {t('Continue', 'Teruskan')}
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={onClose} className={`flex-1 ${secondaryButton}`}>
                {t('Change document', 'Tukar dokumen')}
              </button>
              <button onClick={retry} className={`flex-1 ${primaryButton}`}>
                {t('Scan again', 'Imbas semula')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center py-8">
          <h3 className={`text-lg font-semibold mb-1 text-center ${flashing ? 'text-white drop-shadow' : 'text-stone-900'}`}>
            {t('Face Verification', 'Pengesahan Wajah')}
          </h3>
          <p className={`text-base mb-6 text-center min-h-[1.5rem] ${flashing ? 'text-white drop-shadow' : 'text-stone-700'}`}>
            {instruction[phase]}
          </p>

          <div className={`relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden border-4 ${ringColor} bg-stone-900 transition-colors`}>
            <video
              ref={videoRef}
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover -scale-x-100"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
            {phase === 'loading' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-stone-500 border-t-lime-400 rounded-full animate-spin" />
              </div>
            )}
            {phase !== 'loading' && !flashing && (
              <div className="absolute inset-x-0 h-0.5 bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.9)] animate-[scanline_2.4s_ease-in-out_infinite]" />
            )}
            {phase === 'left' && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-5xl font-bold text-lime-400 drop-shadow animate-pulse">←</div>
            )}
            {phase === 'right' && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-5xl font-bold text-lime-400 drop-shadow animate-pulse">→</div>
            )}
          </div>

          <p className={`text-sm font-medium mt-4 min-h-[1.25rem] text-center ${flashing ? 'text-white drop-shadow' : 'text-amber-700'}`}>
            {hint ? hintText[hint] : ''}
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-4 flex-wrap">
            {STEPS.map((s, i) => (
              <div
                key={s.phase}
                className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                  i < stepIndex
                    ? 'bg-lime-500 text-lime-950'
                    : i === stepIndex
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-500'
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
