import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, BookOpen, Sparkles, Compass } from 'lucide-react';
import BrandLogo from '../ui/BrandLogo';

/**
 * Unified dark-ink Heritage Footer shared across the web app.
 */
function Footer() {
  return (
    <footer className="bg-heritage-ink text-stone-300 border-t-[3px] border-heritage-gold">
      <div className="max-w-[1280px] mx-auto px-[16px] sm:px-[24px] py-[56px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-[40px]">
          <div className="lg:col-span-5 space-y-[16px]">
            <Link to="/" className="inline-block">
              <BrandLogo variant="dark" showSubtitle size="lg" />
            </Link>
            <p className="text-[14px] leading-relaxed text-stone-400 max-w-md">
              Dự án giáo dục STEM hỗ trợ học sinh THPT học tập và ôn luyện bộ môn Lịch Sử và Giáo dục Địa phương theo
              chương trình GDPT 2018 qua bản đồ 63 tỉnh thành, Flashcard 3D, Quiz và Trợ lý AI.
            </p>
            <div className="flex flex-wrap items-center gap-[16px] pt-[4px] text-[13px] text-stone-400">
              <span className="inline-flex items-center gap-[6px]">
                <MapPin className="w-[15px] h-[15px] text-heritage-gold" />
                Đi khắp Việt Nam, ngay tại nhà
              </span>
              <span className="inline-flex items-center gap-[6px]">
                <Mail className="w-[15px] h-[15px] text-heritage-gold" />
                htlvn.stem@gmail.com
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-[12px]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-white flex items-center gap-[6px]">
              <Compass className="w-[15px] h-[15px] text-heritage-gold" />
              Khám phá
            </h4>
            <ul className="space-y-[10px] text-[14px]">
              <li>
                <Link to="/provinces" className="hover:text-white transition-colors">
                  Atlas 63 Tỉnh thành
                </Link>
              </li>
              <li>
                <Link to="/provinces?region=bac" className="hover:text-white transition-colors">
                  Miền Bắc
                </Link>
              </li>
              <li>
                <Link to="/provinces?region=trung" className="hover:text-white transition-colors">
                  Miền Trung
                </Link>
              </li>
              <li>
                <Link to="/provinces?region=nam" className="hover:text-white transition-colors">
                  Miền Nam
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 space-y-[12px]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-white flex items-center gap-[6px]">
              <BookOpen className="w-[15px] h-[15px] text-heritage-gold" />
              Học tập &amp; AI
            </h4>
            <ul className="space-y-[10px] text-[14px]">
              <li>
                <Link to="/elearning" className="hover:text-white transition-colors">
                  Bài giảng E-learning
                </Link>
              </li>
              <li>
                <Link to="/pratice" className="hover:text-white transition-colors">
                  Luyện tập chuyên đề
                </Link>
              </li>
              <li>
                <Link to="/listquiz" className="hover:text-white transition-colors">
                  Kho Quiz trắc nghiệm
                </Link>
              </li>
              <li>
                <Link to="/bot" className="hover:text-white transition-colors inline-flex items-center gap-[6px]">
                  <Sparkles className="w-[14px] h-[14px] text-teal-400" />
                  Trợ lý học tập AI
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-[12px]">
            <h4 className="text-[13px] font-bold uppercase tracking-wider text-white">Cộng đồng</h4>
            <ul className="space-y-[10px] text-[14px]">
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Diễn đàn Blog
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition-colors">
                  Hồ sơ học tập
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Liên hệ &amp; Góp ý
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-[40px] pt-[24px] border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-[12px] text-[13px] text-stone-500">
          <p>© {new Date().getFullYear()} HTLVN — How To Love Vietnam. Dự án STEM Lịch Sử &amp; GDĐP.</p>
          <p>63 Tỉnh thành · Di sản Việt Nam Đương đại</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
