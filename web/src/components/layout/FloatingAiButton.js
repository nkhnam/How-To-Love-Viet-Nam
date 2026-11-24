import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const HIDDEN_PREFIXES = ['/bot', '/chatbot', '/ai', '/messages', '/login', '/register', '/forgotpass'];

/**
 * Floating quick-access launcher to HTLVN's internal AI Assistant (replaces external Coze widget).
 */
function FloatingAiButton() {
  const { pathname } = useLocation();

  const isQuizRunner = /^\/listquiz\/.+/.test(pathname);
  const isHidden = isQuizRunner || HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isHidden) return null;

  return (
    <Link
      to="/ai"
      aria-label="Mở Trợ lý AI HTLVN"
      className="fixed bottom-[20px] right-[20px] z-30 inline-flex items-center gap-[8px] px-[16px] py-[11px] rounded-full bg-heritage-jade text-white text-[14px] font-semibold shadow-lg hover:bg-teal-800 hover:-translate-y-0.5 transition-all duration-200 border border-teal-500/30"
    >
      <Sparkles className="w-[18px] h-[18px]" />
      <span className="hidden sm:inline">Hỏi Trợ lý AI</span>
    </Link>
  );
}

export default FloatingAiButton;
