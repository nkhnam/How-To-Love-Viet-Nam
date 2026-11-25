import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../components/firebase';

/**
 * Resizes and compresses an image file/blob via offscreen canvas to a compact JPEG data URL
 * so uploads continue working cleanly when Firebase Storage billing (HTTP 402) blocks bucket writes.
 */
function compressFileToDataUrl(file, { maxWidth = 960, quality = 0.78 } = {}) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const targetW = Math.max(1, Math.round(img.width * scale));
        const targetH = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

/**
 * Attempts Firebase Storage upload first, falling back to compressed inline data URL
 * if Storage rejects writes (e.g. billing disabled / HTTP 402 / quota).
 */
export async function uploadImageWithFallback(file, storagePath, options = {}) {
  if (!file) return '';
  try {
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (err) {
    console.warn('Firebase Storage unavailable, using compressed image fallback:', err?.code || err?.message);
    return compressFileToDataUrl(file, options);
  }
}
