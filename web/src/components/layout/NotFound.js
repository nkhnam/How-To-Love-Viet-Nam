import React from 'react';
import { Compass, Home } from 'lucide-react';
import MainLayout from './MainLayout';
import Button from '../ui/Button';

/**
 * Friendly Heritage 404 page when navigating to an unknown route.
 */
function NotFound() {
  return (
    <MainLayout>
      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-heritage-vermilion-soft text-heritage-vermilion mb-6">
          <Compass className="w-8 h-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-heritage-gold mb-2">Lỗi 404</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink mb-4">
          Không tìm thấy trang này
        </h1>
        <p className="text-heritage-muted text-base mb-8">
          Đường dẫn bạn truy cập có thể đã thay đổi hoặc không tồn tại. Bạn có thể quay về trang chủ hoặc khám phá
          bản đồ 63 tỉnh thành Việt Nam.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button to="/" variant="primary" size="lg">
            <Home className="w-4 h-4" />
            Về trang chủ
          </Button>
          <Button to="/provinces" variant="outline" size="lg">
            <Compass className="w-4 h-4" />
            Khám phá 63 tỉnh thành
          </Button>
        </div>
      </section>
    </MainLayout>
  );
}

export default NotFound;
