import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Map as MapIcon,
  LayoutGrid,
  CheckCircle2,
  Compass,
  Layers,
  ArrowRight,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import VietnamSvgMap from '../components/provinces/VietnamSvgMap';
import { PROVINCES, REGIONS } from '../data/provinces';
import { usePassport } from '../hooks/usePassport';

function normalizeVietnamese(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Interactive 63-Province Vietnam Atlas with bidirectional SVG map + searchable card grid
 * and the Heritage Passport progress tracker.
 */
function ProvincesAtlasPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRegion = ['bac', 'trung', 'nam'].includes(searchParams.get('region'))
    ? searchParams.get('region')
    : 'all';
  const initialPassportFilter = ['discovered', 'undiscovered'].includes(searchParams.get('filter'))
    ? searchParams.get('filter')
    : 'all';

  const [region, setRegion] = useState(initialRegion);
  const [passportFilter, setPassportFilter] = useState(initialPassportFilter);
  const [queryText, setQueryText] = useState('');
  const [hoveredSlug, setHoveredSlug] = useState(null);
  const [mobileView, setMobileView] = useState('list'); // 'list' | 'map'

  const { discoveredSet, toggleDiscovered, stats } = usePassport();

  const handleRegionChange = (nextRegion) => {
    setRegion(nextRegion);
    const next = new URLSearchParams(searchParams);
    if (nextRegion === 'all') next.delete('region');
    else next.set('region', nextRegion);
    setSearchParams(next, { replace: true });
  };

  const handlePassportFilterChange = (nextFilter) => {
    setPassportFilter(nextFilter);
    const next = new URLSearchParams(searchParams);
    if (nextFilter === 'all') next.delete('filter');
    else next.set('filter', nextFilter);
    setSearchParams(next, { replace: true });
  };

  const filteredProvinces = useMemo(() => {
    const q = normalizeVietnamese(queryText);
    return PROVINCES.filter((p) => {
      if (region !== 'all' && p.region !== region) return false;
      const discovered = discoveredSet.has(p.slug);
      if (passportFilter === 'discovered' && !discovered) return false;
      if (passportFilter === 'undiscovered' && discovered) return false;
      if (!q) return true;
      return (
        normalizeVietnamese(p.name).includes(q) ||
        normalizeVietnamese(p.regionLabel).includes(q) ||
        normalizeVietnamese(p.slug).includes(q)
      );
    });
  }, [region, passportFilter, queryText, discoveredSet]);

  const visibleSlugsSet = useMemo(
    () => new Set(filteredProvinces.map((p) => p.slug)),
    [filteredProvinces],
  );

  const handleStampClick = (e, province) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleDiscovered(province.slug);
    if (added) {
      toast.success(`Đã đóng dấu Hộ chiếu: ${province.name}!`);
    } else {
      toast.info(`Đã bỏ dấu Hộ chiếu: ${province.name}`);
    }
  };

  const resetAllFilters = () => {
    setQueryText('');
    handleRegionChange('all');
    handlePassportFilterChange('all');
  };

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Top Hero + Heritage Passport Progress Card */}
        <div className="bg-white rounded-2xl border border-heritage-border shadow-card p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <Badge variant="vermilion">Atlas Giáo dục Địa phương</Badge>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">
              Khám phá 63 Tỉnh thành Việt Nam
            </h1>
            <p className="text-heritage-muted text-sm sm:text-base leading-relaxed">
              Chọn một tỉnh thành trên bản đồ hoặc tìm kiếm nhanh để xem thông tin văn hóa – lịch sử, góc nhìn 360°,
              thẻ Flashcard 3D và đóng dấu vào <strong className="text-heritage-ink">Hộ chiếu Việt Nam</strong>.
            </p>
          </div>

          {/* Heritage Passport Widget */}
          <div className="lg:w-[380px] shrink-0 rounded-2xl bg-heritage-paper border border-heritage-border p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-heritage-ink">
                <Compass className="w-4 h-4 text-heritage-vermilion" />
                Hộ chiếu Việt Nam
              </span>
              <span className="text-sm font-extrabold text-heritage-vermilion">
                {stats.count} / {stats.total} tỉnh ({stats.percent}%)
              </span>
            </div>

            <div className="h-2.5 rounded-full bg-white border border-heritage-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-heritage-vermilion to-heritage-gold transition-all duration-300 rounded-full"
                style={{ width: `${stats.percent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white rounded-lg py-1.5 px-2 border border-heritage-border/70">
                <span className="text-heritage-muted block">Miền Bắc</span>
                <strong className="text-heritage-ink">{stats.byRegion.bac}/25</strong>
              </div>
              <div className="bg-white rounded-lg py-1.5 px-2 border border-heritage-border/70">
                <span className="text-heritage-muted block">Miền Trung</span>
                <strong className="text-heritage-ink">{stats.byRegion.trung}/19</strong>
              </div>
              <div className="bg-white rounded-lg py-1.5 px-2 border border-heritage-border/70">
                <span className="text-heritage-muted block">Miền Nam</span>
                <strong className="text-heritage-ink">{stats.byRegion.nam}/19</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Filters Bar */}
        <div className="bg-white rounded-2xl border border-heritage-border shadow-sm p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Tìm tỉnh thành (vd: Hà Nội, Huế, An Giang...)"
                aria-label="Tìm kiếm tỉnh thành"
                className="w-full h-11 pl-10 pr-9 rounded-xl bg-heritage-cream border border-heritage-border text-sm text-heritage-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/30 focus:border-heritage-vermilion"
              />
              {queryText && (
                <button
                  type="button"
                  onClick={() => setQueryText('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-heritage-muted hover:text-heritage-ink cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Passport Quick Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'discovered', label: `Đã khám phá (${stats.count})` },
                { key: 'undiscovered', label: `Chưa khám phá (${stats.total - stats.count})` },
              ].map((item) => {
                const active = passportFilter === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handlePassportFilterChange(item.key)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                      active
                        ? 'bg-heritage-gold text-white border-heritage-gold'
                        : 'bg-heritage-cream text-heritage-muted border-heritage-border hover:text-heritage-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region Filter Pills + Mobile Map/List Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-heritage-border/70">
            <div className="flex flex-wrap items-center gap-2">
              {REGIONS.map((r) => {
                const active = region === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRegionChange(r.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                      active
                        ? 'bg-heritage-vermilion text-white border-heritage-vermilion shadow-sm'
                        : 'bg-white text-heritage-ink border-heritage-border hover:bg-heritage-paper'
                    }`}
                  >
                    {r.label} ({r.count})
                  </button>
                );
              })}
            </div>

            {/* Mobile Toggle */}
            <div className="flex lg:hidden items-center gap-1 bg-heritage-paper p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMobileView('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mobileView === 'list' ? 'bg-white text-heritage-ink shadow-sm' : 'text-heritage-muted'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Danh sách ({filteredProvinces.length})
              </button>
              <button
                type="button"
                onClick={() => setMobileView('map')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  mobileView === 'map' ? 'bg-white text-heritage-ink shadow-sm' : 'text-heritage-muted'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                Bản đồ
              </button>
            </div>
          </div>
        </div>

        {/* Split-View: Interactive SVG Map (Left) + Province Grid (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-[88px] ${
              mobileView === 'map' ? 'block' : 'hidden lg:block'
            }`}
          >
            <VietnamSvgMap
              activeRegion={region}
              visibleSlugsSet={visibleSlugsSet}
              discoveredSet={discoveredSet}
              hoveredSlug={hoveredSlug}
              onHoverSlug={setHoveredSlug}
              onResetView={() => handleRegionChange('all')}
            />
          </div>

          {/* Grid Column */}
          <div className={`lg:col-span-7 ${mobileView === 'list' ? 'block' : 'hidden lg:block'}`}>
            {filteredProvinces.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Không tìm thấy tỉnh thành phù hợp"
                description="Thử xóa bộ lọc vùng miền hoặc đổi từ khóa tìm kiếm khác."
                actionLabel="Đặt lại bộ lọc"
                onAction={resetAllFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredProvinces.map((province) => {
                  const isDiscovered = discoveredSet.has(province.slug);
                  const isHovered = hoveredSlug === province.slug;
                  const cardCount = province.dltcCards.length + province.dtlsCards.length;

                  return (
                    <Link
                      key={province.slug}
                      to={`/provinces/${province.slug}`}
                      onMouseEnter={() => setHoveredSlug(province.slug)}
                      onMouseLeave={() => setHoveredSlug(null)}
                      className={`group flex flex-col rounded-2xl overflow-hidden bg-white border transition-all duration-200 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover ${
                        isHovered
                          ? 'border-heritage-vermilion ring-2 ring-heritage-vermilion/20'
                          : isDiscovered
                          ? 'border-amber-300'
                          : 'border-heritage-border'
                      }`}
                    >
                      <div className="relative aspect-[16/10] bg-heritage-paper overflow-hidden">
                        <img
                          src={province.coverImage}
                          alt={province.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/65 via-transparent to-transparent" />

                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-950/65 backdrop-blur-sm text-white text-[11px] font-semibold">
                          {province.regionLabel}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleStampClick(e, province)}
                          title={isDiscovered ? 'Đã đóng dấu Hộ chiếu (Nhấn để bỏ)' : 'Đóng dấu đã khám phá'}
                          aria-label={isDiscovered ? `Bỏ dấu ${province.name}` : `Đánh dấu đã khám phá ${province.name}`}
                          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-sm transition-colors cursor-pointer ${
                            isDiscovered
                              ? 'bg-heritage-jade text-white shadow-sm'
                              : 'bg-white/85 text-heritage-muted hover:text-heritage-vermilion'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <h2 className="absolute bottom-2.5 left-3 right-3 font-serif text-lg font-bold text-white leading-tight drop-shadow-sm">
                          {province.name}
                        </h2>
                      </div>

                      <div className="px-3.5 py-2.5 flex items-center justify-between text-xs text-heritage-muted">
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Layers className="w-3.5 h-3.5 text-heritage-gold" />
                          {cardCount > 0 ? `${cardCount} thẻ Flashcard` : 'Thông tin & 360°'}
                        </span>
                        <span className="inline-flex items-center gap-1 font-semibold text-heritage-vermilion group-hover:translate-x-0.5 transition-transform">
                          Khám phá
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default ProvincesAtlasPage;
