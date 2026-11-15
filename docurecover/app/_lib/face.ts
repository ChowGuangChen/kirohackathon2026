type FaceApi = typeof import('@vladmandic/face-api');

const MODEL_URL = '/face-models';

// face-api's recommended euclidean distance cut-off for "same person".
export const MATCH_THRESHOLD = 0.6;

let faceApiPromise: Promise<FaceApi> | null = null;

export function loadFaceApi(): Promise<FaceApi> {
  if (!faceApiPromise) {
    faceApiPromise = (async () => {
      const faceapi = await import('@vladmandic/face-api');
      // ready() exists at runtime but is missing from face-api's bundled tf typings.
      await (faceapi.tf as unknown as { ready: () => Promise<void> }).ready();
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      return faceapi;
    })().catch((err) => {
      faceApiPromise = null;
      throw err;
    });
  }
  return faceApiPromise;
}

export type DocumentFace = {
  descriptor: Float32Array;
  faceImage: string;
  previewUrl: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function cropToDataUrl(
  source: CanvasImageSource,
  box: { x: number; y: number; width: number; height: number },
  sourceWidth: number,
  sourceHeight: number,
  mirror = false
): string {
  const pad = 0.35;
  const x = Math.max(0, box.x - box.width * pad);
  const y = Math.max(0, box.y - box.height * pad);
  const w = Math.min(sourceWidth - x, box.width * (1 + pad * 2));
  const h = Math.min(sourceHeight - y, box.height * (1 + pad * 2));
  const size = 200;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = Math.round((size * h) / w);
  const ctx = canvas.getContext('2d')!;
  if (mirror) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, x, y, w, h, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function extractDocumentFace(file: File): Promise<DocumentFace | null> {
  const faceapi = await loadFaceApi();
  const previewUrl = URL.createObjectURL(file);
  const img = await loadImage(previewUrl);

  const result = await faceapi
    .detectSingleFace(img, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.4 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result) {
    URL.revokeObjectURL(previewUrl);
    return null;
  }

  return {
    descriptor: result.descriptor,
    faceImage: cropToDataUrl(img, result.detection.box, img.naturalWidth, img.naturalHeight),
    previewUrl,
  };
}
