import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, Layers, Sparkles } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

/**
 * Shared Heritage split-screen layout for Login, Register, and Forgot Password views.
 */
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex bg-heritage-cream">
      {/* Left Heritage Panel (Desktop) */}
      <aside className="hidden lg:flex lg:w-5/12 xl:w-[46%] relative overflow-hidden bg-stone-950 text-white flex-col justify-between p-10">
        <img
          src="/Img/background5.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div
          className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-950/65 to-heritage-vermilion-dark/45"
          aria-hidden="true"
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link to="/" aria-label="Trang chủ HTLVN">
            <BrandLogo variant="dark" showSubtitle size="lg" />
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <blockquote className="font-serif text-2xl xl:text-3xl font-bold leading-snug text-white">
            &ldquo;Dân ta phải biết sử ta, cho tường gốc tích nước nhà Việt Nam.&rdquo;
          </blockquote>
          <p className="text-sm text-stone-300 leading-relaxed">
            Đồng hành cùng học sinh THPT khám phá 63 tỉnh thành, ôn luyện Lịch Sử – GDĐP chuẩn GDPT 2018 và lưu giữ
            Hộ chiếu Di sản cá nhân.
          </p>

          <div className="space-y-3 pt-2 text-xs sm:text-sm text-stone-200">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-amber-300" />
              </span>
              <span>Hộ chiếu Di sản đồng bộ tiến độ 63 tỉnh thành</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-amber-300" />
              </span>
              <span>Lưu điểm Quiz, thẻ Flashcard 3D và kế hoạch học tập</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-teal-300" />
              </span>
              <span>Lưu lịch sử hỏi đáp cùng Trợ lý AI chuyên sâu</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-stone-400">© {new Date().getFullYear()} HTLVN — How To Love Vietnam</p>
      </aside>

      {/* Right Form Column */}
      <main className="flex-1 flex flex-col justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-heritage-muted hover:text-heritage-vermilion transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Về trang chủ
            </Link>
            <div className="lg:hidden">
              <BrandLogo variant="light" size="sm" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-heritage-border shadow-card p-6 sm:p-8 space-y-6">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">{title}</h1>
              {subtitle && <p className="mt-1.5 text-sm text-heritage-muted">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AuthShell;
