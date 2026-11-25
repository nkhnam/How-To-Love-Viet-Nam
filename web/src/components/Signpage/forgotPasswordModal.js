import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '../firebase';
import AuthShell from './AuthShell';
import Button from '../ui/Button';
import { getFirebaseErrorMessage } from '../../utils/firebaseErrors';

function ForgotPasswordModal() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMsg('Đã gửi liên kết đặt lại mật khẩu đến hộp thư của bạn. Vui lòng kiểm tra email (bao gồm mục Spam).');
    } catch (err) {
      setErrorMsg(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đặt lại mật khẩu"
      subtitle="Nhập địa chỉ email đã đăng ký, chúng tôi sẽ gửi liên kết tạo mật khẩu mới."
    >
      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-heritage-jade" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="reset-email">
            Email tài khoản *
          </label>
          <input
            id="reset-email"
            type="email"
            required
            placeholder="hocsinh@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
          />
        </div>

        <Button type="submit" variant="primary" size="md" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Gửi liên kết đặt lại mật khẩu
            </>
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-heritage-muted">
        Nhớ lại mật khẩu rồi?{' '}
        <Link to="/login" className="font-semibold text-heritage-vermilion hover:underline">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthShell>
  );
}

export default ForgotPasswordModal;
