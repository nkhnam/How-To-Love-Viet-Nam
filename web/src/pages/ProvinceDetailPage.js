import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, Navigate, Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  Utensils,
  Landmark,
  Theater,
  Compass,
  Globe,
  Layers,
  Images,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info,
  Building2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import NotFound from '../components/layout/NotFound';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import FlashcardDeck from '../components/provinces/FlashcardDeck';
import ProvinceGallery from '../components/provinces/ProvinceGallery';
import { PROVINCES, PROVINCE_BY_SLUG, SLUG_MIGRATION_MAP } from '../data/provinces';
import { usePassport } from '../hooks/usePassport';

/**
 * Unified 4-Tab Detail Page for all 34 official provinces & cities (NQ 202/2025/QH15):
 * Supports merged constituent sub-regions, multi-view 360 tours, 3D Flashcards, and Gallery.
 */
function ProvinceDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const province = PROVINCE_BY_SLUG[slug];

  const validTabs = ['overview', '360', 'flashcards', 'gallery'];
  const paramTab = searchParams.get('tab');
  const activeTab = validTabs.includes(paramTab) ? paramTab : 'overview';
  const cardTypeParam = ['all', 'dltc', 'dtls'].includes(searchParams.get('type'))
    ? searchParams.get('type')
    : 'all';

  const [slideIndex, setSlideIndex] = useState(0);
  const [pauseSlide, setPauseSlide] = useState(false);
  const [activeSubIdx, setActiveSubIdx] = useState(0);
  const [active360Idx, setActive360Idx] = useState(0);

  const { isDiscovered, toggleDiscovered, masteredSet, setCardMastered } = usePassport();

  useEffect(() => {
    setSlideIndex(0);
    setActiveSubIdx(0);
    setActive360Idx(0);
  }, [slug]);

  const slides = useMemo(() => {
    if (!province) return [];
    return province.slideshowImages?.length ? province.slideshowImages : [province.coverImage].filter(Boolean);
  }, [province]);

  useEffect(() => {
    if (slides.length <= 1 || pauseSlide) return undefined;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, pauseSlide]);

  const neighbors = useMemo(() => {
    if (!province) return { prev: null, next: null };
    const sameRegion = PROVINCES.filter((p) => p.region === province.region);
    const idx = sameRegion.findIndex((p) => p.slug === province.slug);
    if (idx === -1) return { prev: null, next: null };
    return {
      prev: sameRegion[(idx - 1 + sameRegion.length) % sameRegion.length],
      next: sameRegion[(idx + 1) % sameRegion.length],
    };
  }, [province]);

  if (!province && SLUG_MIGRATION_MAP[slug]) {
    return <Navigate to={`/provinces/${SLUG_MIGRATION_MAP[slug]}${location.search}`} replace />;
  }

  if (!province) {
    return <NotFound />;
  }

  const discovered = isDiscovered(province.slug);
  const totalCards = (province.dltcCards?.length || 0) + (province.dtlsCards?.length || 0);
  const constituents = province.constituents || [];
  const activeConstituent = constituents[activeSubIdx] || constituents[0] || province;
  const views360 = province.views360?.length
    ? province.views360
    : province.view
    ? [{ label: province.name, url: province.view }]
    : [];
  const active360 = views360[active360Idx] || views360[0] || null;

  const handleTabChange = (nextTab) => {
    const next = new URLSearchParams(searchParams);
    if (nextTab === 'overview') next.delete('tab');
    else next.set('tab', nextTab);
    if (nextTab !== 'flashcards') next.delete('type');
    setSearchParams(next, { replace: true });
  };

  const handlePassportToggle = () => {
    const added = toggleDiscovered(province.slug);
    if (added) {
      toast.success(`Đã đóng dấu Hộ chiếu: ${province.name}!`);
    } else {
      toast.info(`Đã bỏ dấu Hộ chiếu: ${province.name}`);
    }
  };

  const tabItems = [
    { key: 'overview', label: 'Tổng quan & Văn hóa', icon: BookOpen },
    { key: '360', label: 'Khám phá 360°', icon: Globe },
    { key: 'flashcards', label: 'Flashcard 3D', icon: Layers, count: totalCards },
    { key: 'gallery', label: 'Thư viện ảnh', icon: Images, count: province.galleryImages?.length || 0 },
  ];

  return (
    <MainLayout transparentNavbar>
      {/* HERO SLIDESHOW BANNER */}
      <section
        className="relative h-[52vh] min-h-[370px] max-h-[540px] flex items-end bg-stone-950 text-white overflow-hidden"
        onMouseEnter={() => setPauseSlide(true)}
        onMouseLeave={() => setPauseSlide(false)}
      >
        {slides.map((imgSrc, idx) => (
          <img
            key={imgSrc}
            src={imgSrc}
            alt={`${province.name} ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              idx === slideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))}
        <div
          className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/45 to-stone-950/60"
          aria-hidden="true"
        />

        {/* Slide Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
              aria-label="Ảnh trước"
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-950/45 hover:bg-stone-950/75 text-white backdrop-blur-sm transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setSlideIndex((prev) => (prev + 1) % slides.length)}
              aria-label="Ảnh tiếp theo"
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-stone-950/45 hover:bg-stone-950/75 text-white backdrop-blur-sm transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-24">
          <Breadcrumb
            dark
            className="mb-3"
            items={[
              { label: 'Trang chủ', to: '/' },
              { label: '34 Tỉnh thành', to: '/provinces' },
              { label: province.regionLabel, to: `/provinces?region=${province.region}` },
              { label: province.name },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="glass">{province.regionLabel}</Badge>
                <Badge variant="glass">{province.unitType}</Badge>
                {province.isMerged && (
                  <Badge variant="glass">Hợp nhất: {province.mergedFrom.join(' + ')}</Badge>
                )}
                {totalCards > 0 && (
                  <Badge variant="glass">
                    <Layers className="w-3 h-3" />
                    {totalCards} thẻ Flashcard 3D
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-sm">
                {province.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handlePassportToggle}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                  discovered
                    ? 'bg-heritage-jade text-white border-teal-400 shadow-lg'
                    : 'bg-white/95 text-heritage-ink border-white hover:bg-white shadow-md'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${discovered ? 'text-white' : 'text-heritage-vermilion'}`} />
                {discovered ? 'Đã đóng dấu Hộ chiếu' : 'Đánh dấu đã khám phá'}
              </button>

              {slides.length > 1 && (
                <div className="flex items-center gap-1.5 bg-stone-950/45 backdrop-blur-sm px-2.5 py-2 rounded-full">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      aria-label={`Chọn ảnh ${idx + 1}`}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === slideIndex ? 'w-6 bg-amber-300' : 'w-2 bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STICKY 4-TAB BAR */}
      <div className="sticky top-[72px] z-20 bg-heritage-cream/95 backdrop-blur-md border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Tabs items={tabItems} activeKey={activeTab} onChange={handleTabChange} />
        </div>
      </div>

      {/* TAB CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Official 2025 Resolution Summary Banner */}
            <Card className="bg-heritage-paper border-heritage-border space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <Badge variant="gold" className="mb-1.5">
                    Nghị quyết 202/2025/QH15
                  </Badge>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-heritage-ink">
                    Thông tin hành chính sau sắp xếp ({province.name})
                  </h2>
                  <p className="text-sm text-heritage-muted mt-1">{province.resolutionNote}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white rounded-xl border border-heritage-border p-3.5">
                  <p className="text-xs font-semibold text-heritage-muted">Diện tích tự nhiên</p>
                  <p className="font-serif text-lg font-bold text-heritage-ink mt-0.5">{province.areaKm2}</p>
                </div>
                <div className="bg-white rounded-xl border border-heritage-border p-3.5">
                  <p className="text-xs font-semibold text-heritage-muted">Quy mô dân số (2025)</p>
                  <p className="font-serif text-lg font-bold text-heritage-vermilion mt-0.5">
                    {province.population2025}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-heritage-border p-3.5 flex items-center gap-2.5">
                  <Building2 className="w-5 h-5 text-heritage-jade shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-heritage-muted">Trung tâm hành chính</p>
                    <p className="font-serif text-base font-bold text-heritage-ink">{province.adminCenter}</p>
                  </div>
                </div>
              </div>

              {constituents.length > 1 && (
                <div className="pt-3 border-t border-heritage-border/80 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-heritage-ink mr-1">
                    Xem tư liệu từng vùng hợp thành:
                  </span>
                  {constituents.map((sub, idx) => (
                    <button
                      key={sub.slug}
                      type="button"
                      onClick={() => setActiveSubIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        activeSubIdx === idx
                          ? 'bg-heritage-vermilion text-white border-heritage-vermilion'
                          : 'bg-white text-heritage-ink border-heritage-border hover:bg-white/80'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Block 1: Geography & Overview */}
            <Card className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                {activeConstituent.map ? (
                  <img
                    src={activeConstituent.map}
                    alt={`Bản đồ địa lý ${activeConstituent.name}`}
                    className="w-full rounded-xl border border-heritage-border object-cover bg-heritage-paper"
                  />
                ) : (
                  <img
                    src={activeConstituent.coverImage}
                    alt={activeConstituent.name}
                    className="w-full rounded-xl border border-heritage-border object-cover"
                  />
                )}
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div>
                  <Badge variant="vermilion" className="mb-2">
                    Đặc điểm tự nhiên &amp; dân cư
                  </Badge>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">
                    Tổng quan về {constituents.length > 1 ? activeConstituent.name : province.name}
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-heritage-ink">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-vermilion-soft text-heritage-vermilion shrink-0 mt-0.5">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Giới thiệu</p>
                      <p className="text-heritage-muted mt-0.5">{activeConstituent.introduction}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-gold-soft text-amber-800 shrink-0 mt-0.5">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Dân số &amp; Diện tích</p>
                      <p className="text-heritage-muted mt-0.5">
                        {constituents.length > 1 ? activeConstituent.popularity : province.popularity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-jade-soft text-heritage-jade shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Vị trí địa lý</p>
                      <p className="text-heritage-muted mt-0.5">{activeConstituent.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Block 2: Culture & History */}
            <Card className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5 order-2 lg:order-1">
                <div>
                  <Badge variant="gold" className="mb-2">
                    Bản sắc địa phương
                  </Badge>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">
                    Văn hóa, Kiến trúc &amp; Ẩm thực ({activeConstituent.name})
                  </h2>
                </div>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-gold-soft text-amber-800 shrink-0 mt-0.5">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Ẩm thực đặc trưng</p>
                      <p className="text-heritage-muted mt-0.5">{activeConstituent.cuisine}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-vermilion-soft text-heritage-vermilion shrink-0 mt-0.5">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Công trình &amp; Kiến trúc</p>
                      <p className="text-heritage-muted mt-0.5">{activeConstituent.building}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-heritage-jade-soft text-heritage-jade shrink-0 mt-0.5">
                      <Theater className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-heritage-ink">Văn hóa &amp; Lễ hội</p>
                      <p className="text-heritage-muted mt-0.5">{activeConstituent.culture}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 order-1 lg:order-2">
                {activeConstituent.map2 ? (
                  <img
                    src={activeConstituent.map2}
                    alt={`Văn hóa và lịch sử ${activeConstituent.name}`}
                    loading="lazy"
                    className="w-full rounded-xl border border-heritage-border object-cover bg-heritage-paper"
                  />
                ) : (
                  <img
                    src={province.galleryImages?.[0] || activeConstituent.coverImage}
                    alt={activeConstituent.name}
                    loading="lazy"
                    className="w-full rounded-xl border border-heritage-border object-cover"
                  />
                )}
              </div>
            </Card>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleTabChange('flashcards')}
                className="text-left p-5 rounded-2xl bg-white border border-heritage-border shadow-card hover:border-heritage-gold hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-heritage-gold-soft text-amber-800 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-heritage-ink">Học Flashcard 3D ({totalCards})</h3>
                <p className="text-sm text-heritage-muted mt-1">
                  Ôn tập danh lam thắng cảnh &amp; di tích lịch sử của {province.name}.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-heritage-vermilion">
                  Mở bộ thẻ <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('360')}
                className="text-left p-5 rounded-2xl bg-white border border-heritage-border shadow-card hover:border-heritage-jade hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-heritage-jade-soft text-heritage-jade flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-heritage-ink">Ngắm {province.name} 360°</h3>
                <p className="text-sm text-heritage-muted mt-1">
                  Trải nghiệm góc nhìn toàn cảnh thực tế ảo ngay trên trình duyệt.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-heritage-jade">
                  Mở góc nhìn 360° <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>

              <Link
                to={`/ai?tab=chat&q=${encodeURIComponent(
                  `Hãy tóm tắt những nét nổi bật về lịch sử, địa lý và văn hóa của ${province.name}${
                    province.isMerged ? ` (sau sáp nhập từ ${province.mergedFrom.join(', ')})` : ''
                  }.`,
                )}`}
                className="text-left p-5 rounded-2xl bg-gradient-to-br from-heritage-jade to-teal-800 text-white shadow-card hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="font-serif text-lg font-bold">Hỏi Trợ lý AI</h3>
                <p className="text-sm text-teal-100 mt-1">
                  Đặt câu hỏi về lịch sử, sự kiện hoặc bài tập GDĐP về {province.name}.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                  Mở Trợ lý AI <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === '360' && (
          <Card className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-2xl font-bold text-heritage-ink">
                  Nhìn ngắm {active360?.label || province.name} 360 độ
                </h2>
                <p className="text-sm text-heritage-muted">
                  Kéo chuột hoặc chạm để xoay toàn cảnh và phóng to/thu nhỏ không gian.
                </p>
              </div>
              <Badge variant="jade">
                <Compass className="w-3.5 h-3.5" />
                Street View
              </Badge>
            </div>

            {views360.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {views360.map((v, idx) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setActive360Idx(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                      active360Idx === idx
                        ? 'bg-heritage-jade text-white border-heritage-jade'
                        : 'bg-heritage-paper text-heritage-ink border-heritage-border hover:bg-white'
                    }`}
                  >
                    Điểm nhìn: {v.label}
                  </button>
                ))}
              </div>
            )}

            {active360?.url ? (
              <div className="rounded-xl overflow-hidden border border-heritage-border bg-stone-900">
                <iframe
                  title={`Góc nhìn 360 độ ${active360.label}`}
                  src={active360.url}
                  className="w-full h-[420px] sm:h-[540px]"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <EmptyState
                icon={Globe}
                title="Chưa có dữ liệu 360° cho tỉnh này"
                description="Bạn có thể xem bộ ảnh thực tế tại tab Thư viện ảnh."
                actionLabel="Xem Thư viện ảnh"
                onAction={() => handleTabChange('gallery')}
              />
            )}
          </Card>
        )}

        {activeTab === 'flashcards' && (
          <FlashcardDeck
            province={province}
            initialType={cardTypeParam}
            masteredSet={masteredSet}
            onSetMastered={setCardMastered}
          />
        )}

        {activeTab === 'gallery' && (
          <ProvinceGallery images={province.galleryImages} provinceName={province.name} />
        )}

        {/* Prev / Next Province Navigation */}
        <div className="mt-12 pt-8 border-t border-heritage-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {neighbors.prev ? (
            <Button to={`/provinces/${neighbors.prev.slug}`} variant="outline" className="justify-start">
              <ChevronLeft className="w-4 h-4" />
              <span>Tỉnh trước: {neighbors.prev.name}</span>
            </Button>
          ) : (
            <div />
          )}

          <Button to="/provinces" variant="ghost">
            <Compass className="w-4 h-4" />
            Về bản đồ 34 tỉnh thành
          </Button>

          {neighbors.next && (
            <Button to={`/provinces/${neighbors.next.slug}`} variant="outline" className="justify-end">
              <span>Tiếp theo: {neighbors.next.name}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </section>
    </MainLayout>
  );
}

export default ProvinceDetailPage;
