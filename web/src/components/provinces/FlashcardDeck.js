import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  RefreshCw,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import FlipCard3D from './FlipCard3D';
import EmptyState from '../ui/EmptyState';

/**
 * Interactive 3D Flashcard Deck & Grid for a province's Danh lam thắng cảnh (DLTC) & Di tích lịch sử (DTLS).
 */
function FlashcardDeck({ province, initialType = 'all', masteredSet, onSetMastered }) {
  const [filterType, setFilterType] = useState(initialType);
  const [viewMode, setViewMode] = useState('deck'); // 'deck' | 'grid'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setFilterType(initialType || 'all');
  }, [initialType]);

  const cards = useMemo(() => {
    const dltc = (province.dltcCards || []).map((c, idx) => ({
      ...c,
      label: `Danh lam thắng cảnh #${idx + 1}`,
      shortKind:
        province.isMerged && c.subRegion ? `Danh lam · ${c.subRegion}` : 'Danh lam',
    }));
    const dtls = (province.dtlsCards || []).map((c, idx) => ({
      ...c,
      label: `Di tích lịch sử #${idx + 1}`,
      shortKind:
        province.isMerged && c.subRegion ? `Di tích · ${c.subRegion}` : 'Di tích',
    }));
    if (filterType === 'dltc') return dltc;
    if (filterType === 'dtls') return dtls;
    return [...dltc, ...dtls];
  }, [province.dltcCards, province.dtlsCards, province.isMerged, filterType]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [filterType, province.slug]);

  const goPrev = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const goNext = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  }, [cards.length]);

  // Keyboard shortcuts for Deck mode
  useEffect(() => {
    if (viewMode !== 'deck' || cards.length === 0) return undefined;
    const handleKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewMode, cards.length, goPrev, goNext]);

  const totalDltc = province.dltcCards?.length || 0;
  const totalDtls = province.dtlsCards?.length || 0;
  const totalAll = totalDltc + totalDtls;
  const masteredCount = cards.filter((c) => masteredSet?.has(c.id)).length;

  const activeCard = cards[currentIndex];
  const isActiveMastered = activeCard ? Boolean(masteredSet?.has(activeCard.id)) : false;

  if (totalAll === 0) {
    return (
      <EmptyState
        icon={Layers}
        title={`Thẻ Flashcard cho ${province.name} đang được cập nhật`}
        description="Tỉnh thành này hiện chưa có ảnh thẻ Flashcard trong kho dữ liệu. Bạn có thể xem phần Tổng quan, Góc nhìn 360° hoặc Thư viện ảnh."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter & View Mode Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-heritage-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'Tất cả thẻ', count: totalAll },
            { key: 'dltc', label: 'Danh lam thắng cảnh', count: totalDltc },
            { key: 'dtls', label: 'Di tích lịch sử', count: totalDtls },
          ].map((btn) => {
            const active = filterType === btn.key;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => setFilterType(btn.key)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
                  active
                    ? 'bg-heritage-vermilion text-white border-heritage-vermilion'
                    : 'bg-heritage-cream text-heritage-ink border-heritage-border hover:bg-heritage-paper'
                }`}
              >
                {btn.label} ({btn.count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 bg-heritage-paper p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('deck')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'deck' ? 'bg-white text-heritage-ink shadow-sm' : 'text-heritage-muted hover:text-heritage-ink'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Học từng thẻ
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-white text-heritage-ink shadow-sm' : 'text-heritage-muted hover:text-heritage-ink'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Xem tất cả
          </button>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="Không có thẻ ở nhóm này"
          description="Hãy chuyển sang mục Tất cả thẻ để học toàn bộ bộ thẻ hiện có của tỉnh."
          actionLabel="Xem tất cả thẻ"
          onAction={() => setFilterType('all')}
        />
      ) : viewMode === 'deck' && activeCard ? (
        <div className="bg-white rounded-2xl border border-heritage-border shadow-card p-5 sm:p-8">
          {/* Progress header */}
          <div className="max-w-md mx-auto mb-6">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
              <span className="text-heritage-ink">
                Thẻ {currentIndex + 1} / {cards.length}
              </span>
              <span className="text-heritage-jade">
                Đã thuộc {masteredCount} / {cards.length} thẻ
              </span>
            </div>
            <div className="h-2 rounded-full bg-heritage-paper overflow-hidden">
              <div
                className="h-full bg-heritage-jade transition-all duration-300 rounded-full"
                style={{ width: `${Math.round(((currentIndex + 1) / cards.length) * 100)}%` }}
              />
            </div>
          </div>

          {/* Centered 3D Card */}
          <div className="max-w-[330px] mx-auto">
            <FlipCard3D
              frontImage={activeCard.front}
              backImage={activeCard.back}
              title={`${province.name} — ${activeCard.label}`}
              categoryLabel={activeCard.shortKind}
              flipped={isFlipped}
              onFlip={setIsFlipped}
              mastered={isActiveMastered}
            />
          </div>

          {/* Controls */}
          <div className="mt-7 max-w-lg mx-auto space-y-4">
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Thẻ trước"
                className="p-3 rounded-xl border border-heritage-border bg-white hover:bg-heritage-paper text-heritage-ink transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => setIsFlipped((f) => !f)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-heritage-paper hover:bg-heritage-sand text-heritage-ink font-semibold text-sm transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4 text-heritage-vermilion" />
                {isFlipped ? 'Xem mặt trước' : 'Lật mặt sau'}
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="Thẻ tiếp theo"
                className="p-3 rounded-xl border border-heritage-border bg-white hover:bg-heritage-paper text-heritage-ink transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Active Recall Assessment */}
            {onSetMastered && (
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-heritage-border">
                <button
                  type="button"
                  onClick={() => {
                    onSetMastered(activeCard.id, false);
                    if (cards.length > 1) goNext();
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                    !isActiveMastered
                      ? 'bg-heritage-gold-soft border-amber-300 text-amber-900'
                      : 'bg-white border-heritage-border text-heritage-muted hover:bg-heritage-paper'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Cần ôn lại
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSetMastered(activeCard.id, true);
                    if (cards.length > 1) goNext();
                  }}
                  className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors cursor-pointer ${
                    isActiveMastered
                      ? 'bg-heritage-jade text-white border-heritage-jade'
                      : 'bg-heritage-jade-soft border-teal-300 text-heritage-jade hover:bg-teal-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Đã thuộc thẻ này
                </button>
              </div>
            )}

            <p className="text-center text-xs text-heritage-muted">
              Mẹo: Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-heritage-paper border border-heritage-border">Space</kbd> để lật thẻ và{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-heritage-paper border border-heritage-border">←</kbd>{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-heritage-paper border border-heritage-border">→</kbd> để chuyển thẻ.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const mastered = Boolean(masteredSet?.has(card.id));
            return (
              <div key={card.id} className="space-y-3">
                <FlipCard3D
                  frontImage={card.front}
                  backImage={card.back}
                  title={`${province.name} — ${card.label}`}
                  categoryLabel={card.shortKind}
                  mastered={mastered}
                />
                {onSetMastered && (
                  <button
                    type="button"
                    onClick={() => onSetMastered(card.id, !mastered)}
                    className={`w-full py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 ${
                      mastered
                        ? 'bg-heritage-jade text-white border-heritage-jade'
                        : 'bg-white text-heritage-ink border-heritage-border hover:bg-heritage-paper'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {mastered ? 'Đã thuộc thẻ' : 'Đánh dấu đã thuộc'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FlashcardDeck;
