import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Search,
  PlayCircle,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Clock,
  UserCheck,
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import EmptyState from '../components/ui/EmptyState';
import { COURSES } from '../data/courses';
import { useLearningProgress } from '../hooks/useLearningProgress';

const GRADE_FILTERS = [
  { key: 'all', label: 'Tất cả khối' },
  { key: '10', label: 'Lớp 10' },
  { key: '11', label: 'Lớp 11' },
  { key: '12', label: 'Lớp 12' },
];

const SUBJECT_FILTERS = [
  { key: 'all', label: 'Tất cả môn' },
  { key: 'lich-su', label: 'Lịch Sử' },
  { key: 'gddp', label: 'GDĐP' },
];

/**
 * Unified Learning Hub replacing legacy /elearning and /pratice pages cleanly.
 */
function LearningHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const modeParam = searchParams.get('mode') === 'practice' ? 'practice' : 'courses';
  const [grade, setGrade] = useState('all');
  const [subject, setSubject] = useState('all');
  const [search, setSearch] = useState('');

  const { getCourseProgress } = useLearningProgress();

  const totalLessons = useMemo(
    () => COURSES.reduce((sum, c) => sum + c.chapters.reduce((s, ch) => s + ch.lessons.length, 0), 0),
    [],
  );
  const totalCompleted = useMemo(
    () => COURSES.reduce((sum, c) => sum + getCourseProgress(c).done, 0),
    [getCourseProgress],
  );

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return COURSES.filter((c) => {
      if (grade !== 'all' && String(c.grade) !== grade) return false;
      if (subject !== 'all' && c.subject !== subject) return false;
      if (!q) return true;
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.teacher.toLowerCase().includes(q) ||
        c.chapters.some((ch) => ch.lessons.some((l) => l.title.toLowerCase().includes(q)))
      );
    });
  }, [grade, subject, search]);

  const handleModeChange = (nextMode) => {
    const next = new URLSearchParams(searchParams);
    if (nextMode === 'practice') next.set('mode', 'practice');
    else next.delete('mode');
    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setGrade('all');
    setSubject('all');
    setSearch('');
  };

  return (
    <MainLayout>
      {/* HERO HEADER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Breadcrumb
            className="mb-4"
            items={[{ label: 'Trang chủ', to: '/' }, { label: 'Học tập & Luyện tập' }]}
          />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="jade" className="mb-3">
                <GraduationCap className="w-3.5 h-3.5" />
                Chương trình GDPT 2018 · Lớp 10 – 12
              </Badge>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
                Trung tâm Học tập Lịch Sử &amp; Giáo dục Địa phương
              </h1>
              <p className="mt-2.5 text-heritage-muted text-sm sm:text-base leading-relaxed">
                Hệ thống bài giảng theo từng chương, tóm tắt trọng tâm, bài luyện tập chuyên đề và kết nối trực
                tiếp với kho Quiz cùng Trợ lý AI.
              </p>
            </div>

            {/* Learning Progress Summary Pill */}
            <Card padding="p-5" className="lg:min-w-[300px] bg-white">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-heritage-muted">
                  Tiến độ bài giảng
                </span>
                <span className="text-sm font-bold text-heritage-vermilion">
                  {totalCompleted} / {totalLessons} bài
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-heritage-paper overflow-hidden">
                <div
                  className="h-full bg-heritage-vermilion rounded-full transition-all duration-300"
                  style={{ width: `${totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-heritage-muted">
                <span>6 môn Lịch Sử &amp; GDĐP</span>
                <Link to="/listquiz" className="font-semibold text-heritage-jade hover:underline">
                  Kho Quiz trắc nghiệm →
                </Link>
              </div>
            </Card>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs
              activeKey={modeParam}
              onChange={handleModeChange}
              items={[
                { key: 'courses', label: 'Bài giảng theo môn', icon: BookOpen, count: COURSES.length },
                { key: 'practice', label: 'Luyện tập chuyên đề', icon: ClipboardCheck, count: 4 },
              ]}
            />
          </div>
        </div>
      </section>

      {/* FILTER BAR & COURSE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-heritage-border p-4 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {GRADE_FILTERS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => setGrade(g.key)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  grade === g.key
                    ? 'bg-heritage-vermilion text-white'
                    : 'bg-heritage-paper text-heritage-muted hover:text-heritage-ink'
                }`}
              >
                {g.label}
              </button>
            ))}

            <span className="hidden sm:inline-block w-px h-6 bg-heritage-border mx-1" aria-hidden="true" />

            {SUBJECT_FILTERS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSubject(s.key)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  subject === s.key
                    ? 'bg-heritage-jade text-white'
                    : 'bg-heritage-paper text-heritage-muted hover:text-heritage-ink'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên môn, bài học..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/60 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
            />
          </div>
        </div>

        {filteredCourses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Không tìm thấy khóa học phù hợp"
            description="Thử xóa bộ lọc hoặc nhập từ khóa khác như Lịch Sử 12, Võ Trường Toản, ASEAN..."
            actionLabel="Xem tất cả môn học"
            onAction={resetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = getCourseProgress(course);
              const allLessons = course.chapters.flatMap((c) => c.lessons);
              const readyVideos = allLessons.filter((l) => Boolean(l.videoUrl)).length;

              return (
                <Card key={course.id} hover padding="p-0" className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                      <img
                        src={course.cover}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent" />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <Badge variant={course.subject === 'lich-su' ? 'vermilion' : 'jade'}>
                          {course.subjectLabel}
                        </Badge>
                        <Badge variant="glass">Khối {course.grade}</Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                        <span>{progress.total > 0 ? `${progress.total} bài học` : 'Đang biên soạn'}</span>
                        {readyVideos > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                            <PlayCircle className="w-3.5 h-3.5" />
                            {readyVideos} video
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h2 className="font-serif text-xl font-bold text-heritage-ink">{course.title}</h2>
                      <p className="text-xs text-heritage-muted flex items-center gap-1.5 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-heritage-jade" />
                        Giáo viên: {course.teacher}
                      </p>
                      <p className="text-sm text-heritage-muted line-clamp-2 leading-relaxed">{course.description}</p>

                      {modeParam === 'courses' && progress.total > 0 && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-heritage-muted font-medium">Đã hoàn thành</span>
                            <span className="font-bold text-heritage-jade">
                              {progress.done}/{progress.total} ({progress.percent}%)
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-heritage-paper overflow-hidden">
                            <div
                              className="h-full bg-heritage-jade rounded-full transition-all"
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-1 flex flex-wrap items-center gap-2.5">
                    {modeParam === 'courses' ? (
                      <>
                        <Button to={`/learn/${course.id}`} variant="primary" size="sm" className="flex-1">
                          {progress.total > 0 ? 'Vào học ngay' : 'Xem thông tin'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button to={`/listquiz?type=${course.quizType}`} variant="outline" size="sm">
                          Làm Quiz
                        </Button>
                      </>
                    ) : course.practiceUrl ? (
                      <>
                        <Button
                          href={course.practiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="primary"
                          size="sm"
                          className="flex-1"
                        >
                          Mở bài luyện tập
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                        <Button to={`/listquiz?type=${course.quizType}`} variant="outline" size="sm">
                          Quiz nội bộ
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-full flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-heritage-gold-soft px-3 py-1.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Chuyên đề Netlify đang cập nhật — dùng Quiz hoặc AI bên dưới</span>
                        </div>
                        <Button to={`/listquiz?type=${course.quizType}`} variant="secondary" size="sm" className="flex-1">
                          Làm Quiz ngay
                        </Button>
                        <Button
                          to={`/ai?tab=chat&q=${encodeURIComponent(`Cho tôi bộ câu hỏi ôn tập trọng tâm môn ${course.title}`)}`}
                          variant="outline"
                          size="sm"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Hỏi AI
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Quick tip banner */}
        <Card className="bg-gradient-to-r from-heritage-jade to-teal-800 text-white border-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white/15 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold">Mẹo ôn thi hiệu quả với hệ sinh thái HTLVN</h3>
              <p className="text-sm text-teal-100 mt-0.5">
                Đánh dấu các bài học đã xem, sau đó sang kho Quiz để tự kiểm tra hoặc dùng AI tóm tắt tài liệu PDF
                thành Sơ đồ tư duy.
              </p>
            </div>
          </div>
          <Button to="/ai" variant="gold" size="sm" className="shrink-0">
            <Sparkles className="w-4 h-4" />
            Mở Trợ lý AI
          </Button>
        </Card>
      </section>
    </MainLayout>
  );
}

export default LearningHubPage;
