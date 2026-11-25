import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import AuthShell from './AuthShell';
import SignWithGoogle from './signWithGoogle';
import Button from '../ui/Button';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/profile';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Đăng nhập thành công!');
      navigate(redirectTo);
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Đăng nhập" subtitle="Tiếp tục hành trình khám phá Lịch Sử & 34 tỉnh thành cùng HTLVN.">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="login-email">
            Email *
          </label>
          <input
            id="login-email"
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-heritage-ink" htmlFor="login-password">
              Mật khẩu *
            </label>
            <Link to="/forgotpass" className="text-xs font-semibold text-heritage-vermilion hover:underline">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
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
              Đang đăng nhập...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Đăng nhập
            </>
          )}
        </Button>
      </form>

      <div className="relative flex items-center justify-center">
        <span className="border-t border-heritage-border w-full" />
        <span className="bg-white px-3 text-xs font-medium text-heritage-muted shrink-0">hoặc</span>
        <span className="border-t border-heritage-border w-full" />
      </div>

      <SignWithGoogle redirectTo={redirectTo} onError={setError} />

      <p className="text-center text-sm text-heritage-muted">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold text-heritage-vermilion hover:underline">
          Đăng ký ngay
        </Link>
      </p>
    </AuthShell>
  );
}

export default Login;
