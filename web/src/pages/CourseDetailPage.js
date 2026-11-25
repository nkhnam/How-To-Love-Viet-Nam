import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Play,
  ExternalLink,
  CheckCircle2,
  Circle,
  BookOpen,
  Sparkles,
  ListChecks,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'react-toastify';
import MainLayout from '../components/layout/MainLayout';
import NotFound from '../components/layout/NotFound';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { COURSE_BY_ID } from '../data/courses';
import { useLearningProgress } from '../hooks/useLearningProgress';

/**
 * Detailed course syllabus view showing chapters, video/external lessons,
 * inline GDPT-2018 key takeaways, AI study prompt shortcuts, and completion tracking.
 */
function CourseDetailPage() {
  const { courseId } = useParams();
  const course = COURSE_BY_ID[courseId];
  const { isCompleted, toggleLesson, getCourseProgress } = useLearningProgress();
  const [expandedSummary, setExpandedSummary] = useState({});

  if (!course) {
    return <NotFound />;
  }

  const progress = getCourseProgress(course);

  const handleToggleComplete = (lesson) => {
    const done = toggleLesson(lesson.id);
    if (done) {
      toast.success(`Đã đánh dấu hoàn thành: ${lesson.title}`);
    } else {
      toast.info('Đã bỏ đánh dấu hoàn thành bài học');
    }
  };

  const toggleSummary = (lessonId) => {
    setExpandedSummary((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  return (
    <MainLayout>
      {/* COURSE HEADER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Breadcrumb
            className="mb-5"
            items={[
              { label: 'Trang chủ', to: '/' },
              { label: 'Học tập', to: '/learn' },
              { label: course.shortTitle },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4">
              <div className="rounded-2xl overflow-hidden border border-heritage-border shadow-card bg-stone-900">
                <img src={course.cover} alt={course.title} className="w-full aspect-[16/10] object-cover" />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={course.subject === 'lich-su' ? 'vermilion' : 'jade'}>{course.subjectLabel}</Badge>
                <Badge variant="gold">Khối {course.grade}</Badge>
                <Badge variant="neutral">
                  <UserCheck className="w-3.5 h-3.5" />
                  GV: {course.teacher}
                </Badge>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">{course.title}</h1>
              <p className="text-heritage-muted text-sm sm:text-base leading-relaxed">{course.description}</p>

              {progress.total > 0 && (
                <div className="bg-white rounded-xl border border-heritage-border p-4 max-w-xl">
                  <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                    <span className="font-semibold text-heritage-ink">Tiến độ của bạn</span>
                    <span className="font-bold text-heritage-jade">
                      {progress.done} / {progress.total} bài ({progress.percent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-heritage-paper overflow-hidden">
                    <div
                      className="h-full bg-heritage-jade rounded-full transition-all duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <Button to={`/listquiz?type=${course.quizType}`} variant="primary" size="sm">
                  <ListChecks className="w-4 h-4" />
                  Kho Quiz {course.shortTitle}
                </Button>
                {course.practiceUrl && (
                  <Button
                    href={course.practiceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outline"
                    size="sm"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    Luyện tập chuyên đề
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                )}
                <Button
                  to={`/ai?tab=chat&q=${encodeURIComponent(`Hãy hệ thống hóa kiến thức trọng tâm môn ${course.title}`)}`}
                  variant="secondary"
                  size="sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Hỏi Trợ lý AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTERS & LESSONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
        {course.chapters.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nội dung bài giảng đang được cập nhật"
            description="Đội ngũ biên soạn đang hoàn thiện giáo trình GDĐP 12. Trong lúc chờ đợi, bạn có thể khám phá Atlas 34 tỉnh thành hoặc hỏi Trợ lý AI."
            actionLabel="Khám phá 34 tỉnh thành"
            actionTo="/provinces"
          />
        ) : (
          course.chapters.map((chapter) => (
            <div key={chapter.id} className="space-y-4">
              <div className="flex items-center justify-between border-b border-heritage-border pb-3">
                <h2 className="font-serif text-2xl font-bold text-heritage-ink">{chapter.title}</h2>
                <span className="text-xs font-semibold text-heritage-muted">
                  {chapter.lessons.length} bài học
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {chapter.lessons.map((lesson) => {
                  const done = isCompleted(lesson.id);
                  const showNotes = Boolean(expandedSummary[lesson.id]);

                  return (
                    <Card
                      key={lesson.id}
                      padding="p-0"
                      className={`overflow-hidden flex flex-col justify-between transition-all ${
                        done ? 'border-teal-300 bg-teal-50/20' : ''
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                          <img src={lesson.thumb} alt={lesson.title} className="w-full h-full object-cover" />
                          <div className="absolute top-3 left-3">
                            {lesson.videoUrl ? (
                              <Badge variant="jade">
                                <Play className="w-3 h-3" />
                                Video sẵn sàng
                              </Badge>
                            ) : (
                              <Badge variant="gold">
                                <Clock className="w-3 h-3" />
                                Video sắp ra mắt
                              </Badge>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleComplete(lesson)}
                            aria-label={done ? 'Bỏ đánh dấu đã học' : 'Đánh dấu đã học'}
                            className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm transition-colors cursor-pointer ${
                              done
                                ? 'bg-heritage-jade text-white'
                                : 'bg-stone-950/60 text-white hover:bg-stone-950/80'
                            }`}
                          >
                            {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                            <span>{done ? 'Đã học' : 'Đánh dấu'}</span>
                          </button>
                        </div>

                        <div className="p-5 space-y-2.5">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-heritage-ink leading-snug">
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-heritage-muted">Giáo viên: {lesson.teacher}</p>

                          {(showNotes || !lesson.videoUrl) && lesson.keyPoints?.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-heritage-border/70">
                              <button
                                type="button"
                                onClick={() => toggleSummary(lesson.id)}
                                className="w-full flex items-center justify-between text-xs font-bold text-heritage-vermilion cursor-pointer py-1"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <BookOpen className="w-3.5 h-3.5" />
                                  Tóm tắt trọng tâm
                                </span>
                                {showNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              {showNotes && (
                                <ul className="mt-2 space-y-1.5 text-xs text-heritage-muted list-disc pl-4 leading-relaxed">
                                  {lesson.keyPoints.map((pt, idx) => (
                                    <li key={idx}>{pt}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-1 flex flex-wrap gap-2">
                        {lesson.videoUrl ? (
                          <Button
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="primary"
                            size="sm"
                            className="flex-1"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Mở bài giảng
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => toggleSummary(lesson.id)}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            {showNotes ? 'Thu gọn tóm tắt' : 'Xem tóm tắt'}
                          </Button>
                        )}
                        <Button
                          to={`/ai?tab=chat&q=${encodeURIComponent(lesson.aiPrompt)}`}
                          variant="secondary"
                          size="sm"
                          title="Hỏi Trợ lý AI về bài học này"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Hỏi AI
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </section>
    </MainLayout>
  );
}

export default CourseDetailPage;
