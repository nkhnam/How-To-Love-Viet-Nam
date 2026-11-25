import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

/**
 * Clean Google Sign-In button with inline SVG logo and user-doc initialization.
 */
function SignWithGoogle({ redirectTo = '/profile', onError }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(
            userRef,
            {
              firstName: user.displayName || user.email?.split('@')[0] || 'Thành viên',
              email: user.email || '',
              photo: user.photoURL || '',
            },
            { merge: true },
          );
        }
      }
      toast.success('Đăng nhập bằng Google thành công!');
      navigate(redirectTo);
    } catch (error) {
      const msg = getFirebaseErrorMessage(error, 'Không thể đăng nhập bằng Google.');
      if (onError) onError(msg);
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className="w-full h-11 px-4 rounded-xl border border-heritage-border bg-white hover:bg-heritage-paper text-sm font-semibold text-heritage-ink flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
          />
        </svg>
      )}
      <span>Tiếp tục với Google</span>
    </button>
  );
}

export default SignWithGoogle;
