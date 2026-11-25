import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Upload, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import AuthShell from './AuthShell';
import Button from '../ui/Button';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';
import { uploadImageWithFallback } from '../../utils/imageUpload';

function Register() {
  const navigate = useNavigate();
  const [fname, setFname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePic(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!fname.trim()) {
      setError('Vui lòng nhập tên hiển thị của bạn.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần có tối thiểu 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = cred.user;
      let photoURL = '';

      if (profilePic) {
        photoURL = await uploadImageWithFallback(profilePic, `profilePics/${user.uid}`, {
          maxWidth: 256,
          quality: 0.8,
        });
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: email.trim(),
        firstName: fname.trim(),
        photo: photoURL,
      });

      toast.success('Chào mừng bạn gia nhập HTLVN!');
      navigate('/profile');
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Đăng ký tài khoản" subtitle="Tạo hồ sơ học tập miễn phí để lưu Hộ chiếu 63 tỉnh và điểm Quiz.">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={previewUrl || '/logo192.png'}
            alt="Ảnh đại diện"
            className="w-16 h-16 rounded-full object-cover border border-heritage-border bg-heritage-paper shrink-0"
          />
          <label className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-heritage-border bg-heritage-cream/60 hover:bg-heritage-paper text-xs font-semibold text-heritage-ink cursor-pointer transition-colors">
            <Upload className="w-4 h-4 text-heritage-vermilion" />
            <span>{profilePic ? profilePic.name : 'Chọn ảnh đại diện (tùy chọn)'}</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="reg-name">
            Tên hiển thị *
          </label>
          <input
            id="reg-name"
            type="text"
            required
            maxLength={30}
            placeholder="Ví dụ: Nguyễn Minh Anh"
            value={fname}
            onChange={(e) => setFname(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="reg-email">
            Email *
          </label>
          <input
            id="reg-email"
            type="email"
            required
            autoComplete="email"
            placeholder="hocsinh@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="reg-password">
            Mật khẩu (tối thiểu 6 ký tự) *
          </label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-heritage-muted hover:text-heritage-ink cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo tài khoản...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Tạo tài khoản
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-heritage-muted">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-heritage-vermilion hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}

export default Register;
