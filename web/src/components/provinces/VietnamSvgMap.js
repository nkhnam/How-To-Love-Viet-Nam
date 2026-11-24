import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, RotateCcw, Layers } from 'lucide-react';
import { VIETNAM_MAP_PATHS, REGION_VIEWBOXES } from '../../data/vietnamMapPaths';
import { PROVINCE_BY_SLUG } from '../../data/provinces';

const REGION_FILL = {
  bac: '#E8C9B5',
  trung: '#DFC79E',
  nam: '#C4D9D2',
};

/**
 * Interactive 63-province SVG Map with zoom by region, hover tooltip,
 * Heritage Passport gold fills, and mobile tap preview support.
 */
function VietnamSvgMap({
  activeRegion = 'all',
  visibleSlugsSet,
  discoveredSet,
  hoveredSlug,
  onHoverSlug,
  onResetView,
}) {
  const navigate = useNavigate();
  const [selectedTouchSlug, setSelectedTouchSlug] = useState(null);

  const previewSlug = hoveredSlug || selectedTouchSlug;
  const previewProvince = previewSlug ? PROVINCE_BY_SLUG[previewSlug] : null;
  const previewCardCount = previewProvince
    ? previewProvince.dltcCards.length + previewProvince.dtlsCards.length
    : 0;

  const viewBox = REGION_VIEWBOXES[activeRegion] || REGION_VIEWBOXES.all;

  const handleProvinceClick = (slug) => {
    navigate(`/provinces/${slug}`);
  };

  return (
    <div className="relative bg-gradient-to-b from-[#EFF6F4] via-[#F7F3EA] to-[#EFE8DA] rounded-2xl border border-heritage-border shadow-card overflow-hidden">
      {/* Top toolbar & Reset View */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-heritage-border/70 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs text-heritage-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#E8C9B5] border border-stone-400/50" />
            Bắc
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#DFC79E] border border-stone-400/50" />
            Trung
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#C4D9D2] border border-stone-400/50" />
            Nam
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-amber-800">
            <span className="w-3 h-3 rounded-sm bg-[#D99B26] border border-amber-700/40" />
            Đã khám phá
          </span>
        </div>

        {activeRegion !== 'all' && onResetView && (
          <button
            type="button"
            onClick={onResetView}
            className="inline-flex items-center gap-1 text-xs font-semibold text-heritage-vermilion hover:text-heritage-vermilion-dark cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Toàn quốc
          </button>
        )}
      </div>

      {/* Floating Hover Preview Card (Pinned top-left so never clipped) */}
      {previewProvince && (
        <div className="hidden sm:flex items-center gap-3 absolute top-14 left-3 z-20 max-w-[260px] p-2.5 rounded-xl bg-white/95 backdrop-blur-md border border-heritage-border shadow-lg pointer-events-none">
          <img
            src={previewProvince.coverImage}
            alt=""
            className="w-12 h-12 rounded-lg object-cover shrink-0 bg-heritage-paper"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold font-serif text-heritage-ink truncate">{previewProvince.name}</p>
            <p className="text-[11px] text-heritage-muted">
              {previewProvince.regionLabel} · {previewCardCount} thẻ
            </p>
            {discoveredSet?.has(previewProvince.slug) && (
              <p className="text-[11px] font-semibold text-amber-700 inline-flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-heritage-jade" />
                Đã đóng dấu Hộ chiếu
              </p>
            )}
          </div>
        </div>
      )}

      {/* SVG Map Canvas */}
      <div className="p-3 sm:p-4">
        <svg
          viewBox={viewBox}
          className="w-full h-[460px] sm:h-[560px] select-none transition-all duration-300"
          role="img"
          aria-label="Bản đồ tương tác 63 tỉnh thành Việt Nam"
        >
          {VIETNAM_MAP_PATHS.map((item) => {
            const isHovered = hoveredSlug === item.slug;
            const isDiscovered = discoveredSet?.has(item.slug);
            const isVisible = !visibleSlugsSet || visibleSlugsSet.has(item.slug);

            let fill = REGION_FILL[item.region] || '#E5DDD0';
            if (isDiscovered) fill = '#D99B26';
            if (isHovered) fill = '#B91C1C';

            return (
              <g
                key={item.slug}
                role="link"
                tabIndex={0}
                aria-label={`${item.name}${isDiscovered ? ' (Đã khám phá)' : ''}`}
                onClick={() => {
                  setSelectedTouchSlug(item.slug);
                  handleProvinceClick(item.slug);
                }}
                onMouseEnter={() => onHoverSlug && onHoverSlug(item.slug)}
                onMouseLeave={() => onHoverSlug && onHoverSlug(null)}
                onFocus={() => onHoverSlug && onHoverSlug(item.slug)}
                onBlur={() => onHoverSlug && onHoverSlug(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleProvinceClick(item.slug);
                  }
                }}
                className="cursor-pointer transition-opacity duration-200 focus:outline-none"
                style={{ opacity: isVisible ? 1 : 0.25 }}
              >
                {item.dList.map((d, idx) => (
                  <path
                    key={idx}
                    d={d}
                    fill={fill}
                    stroke={isHovered ? '#7F1D1D' : '#FAF7F2'}
                    strokeWidth={isHovered ? 1.4 : 0.7}
                    className="transition-colors duration-150"
                  />
                ))}
              </g>
            );
          })}

          {/* Subtle East Sea Archipelago Annotations */}
          {activeRegion === 'all' && (
            <g className="pointer-events-none select-none opacity-75">
              <circle cx="365" cy="360" r="2.2" fill="#9A8F7D" />
              <text x="342" y="372" fontSize="6.5" fill="#6E6557" fontWeight="600">
                QĐ. Hoàng Sa
              </text>
              <circle cx="378" cy="598" r="2.2" fill="#9A8F7D" />
              <text x="340" y="610" fontSize="6.5" fill="#6E6557" fontWeight="600">
                QĐ. Trường Sa
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Bottom Hint / Preview Bar */}
      <div className="px-4 py-2.5 bg-white/85 border-t border-heritage-border/70 flex items-center justify-between gap-2 text-xs text-heritage-muted">
        {previewProvince ? (
          <div className="flex items-center justify-between w-full gap-2">
            <span className="truncate font-semibold text-heritage-ink">
              {previewProvince.name} ·{' '}
              <span className="font-normal text-heritage-muted">
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                {previewCardCount} thẻ
              </span>
            </span>
            <button
              type="button"
              onClick={() => handleProvinceClick(previewProvince.slug)}
              className="inline-flex items-center gap-1 font-semibold text-heritage-vermilion shrink-0 cursor-pointer"
            >
              Xem chi tiết
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <span>Di chuột hoặc chạm vào một tỉnh thành trên bản đồ để khám phá chi tiết.</span>
        )}
      </div>
    </div>
  );
}

export default VietnamSvgMap;
