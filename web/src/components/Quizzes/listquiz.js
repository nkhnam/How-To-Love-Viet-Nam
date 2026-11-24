import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import {
  ListChecks,
  Search,
  PlusCircle,
  FolderKanban,
  CheckCircle2,
  Clock,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { db, auth } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { QUIZ_CATEGORIES, getQuizMeta, getQuizCover, formatRelativeTimeVi } from '../../data/quizMeta';

/**
 * Heritage Quiz Hub allowing guests to browse and play freely,
 * synced with ?type= filter and user score badges from Firestore results.
 */
function QuizzesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'all';
  const [selectedType, setSelectedType] = useState(
    QUIZ_CATEGORIES.some((c) => c.key === initialType) ? initialType : 'all',
  );
  const [search, setSearch] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [userResults, setUserResults] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlType = searchParams.get('type') || 'all';
    if (QUIZ_CATEGORIES.some((c) => c.key === urlType)) {
      setSelectedType(urlType);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'quizzes'));
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setQuizzes(list);
      } catch (err) {
        console.error('Error loading quizzes:', err);
        toast.error('Không thể tải danh sách Quiz lúc này.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserResults({});
        return;
      }
      try {
        const resultsQuery = query(collection(db, 'results'), where('userId', '==', user.uid));
        const snapshot = await getDocs(resultsQuery);
        const map = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          map[data.quizId] = data;
        });
        setUserResults(map);
      } catch (err) {
        console.error('Failed to fetch user quiz results:', err);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey);
    const next = new URLSearchParams(searchParams);
    if (typeKey === 'all') next.delete('type');
    else next.set('type', typeKey);
    setSearchParams(next, { replace: true });
  };

  const filteredQuizzes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quizzes.filter((quiz) => {
      if (selectedType !== 'all' && quiz.type !== selectedType) return false;
      if (!q) return true;
      return (
        (quiz.title || '').toLowerCase().includes(q) ||
        (quiz.description || '').toLowerCase().includes(q) ||
        (quiz.author?.name || '').toLowerCase().includes(q)
      );
    });
  }, [quizzes, selectedType, search]);

  return (
    <MainLayout>
      {/* HERO HEADER */}
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Breadcrumb className="mb-4" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Kho Quiz trắc nghiệm' }]} />

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Badge variant="vermilion" className="mb-3">
                <ListChecks className="w-3.5 h-3.5" />
                Luyện thi &amp; Kiểm tra nhanh
              </Badge>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
                Kho Quiz Lịch Sử &amp; Giáo dục Địa phương
              </h1>
              <p className="mt-2.5 text-heritage-muted text-sm sm:text-base leading-relaxed">
                Luyện tập ngay không cần đăng nhập với giải thích chi tiết sau từng câu. Đăng nhập để lưu điểm số và
                tự tạo bộ đề bằng Trợ lý AI.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button to="/createquiz" variant="primary" size="md">
                <PlusCircle className="w-4 h-4" />
                Tạo bộ Quiz mới
              </Button>
              {currentUser && (
                <Button to="/myquiz" variant="outline" size="md">
                  <FolderKanban className="w-4 h-4" />
                  Quiz của tôi
                </Button>
              )}
            </div>
          </div>

          {!currentUser && (
            <div className="mt-5 rounded-xl bg-white/90 border border-heritage-border px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <span className="text-heritage-muted">
                Bạn đang xem với tư cách <strong className="text-heritage-ink">Khách</strong> — có thể làm thử mọi
                đề ngay, hoặc đăng nhập để lưu thành tích vào Hồ sơ.
              </span>
              <Link to="/login" className="font-semibold text-heritage-vermilion hover:underline shrink-0">
                Đăng nhập ngay →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FILTER & LIST SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="bg-white rounded-2xl border border-heritage-border p-4 shadow-card space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {QUIZ_CATEGORIES.map((cat) => {
                const active = selectedType === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => handleSelectType(cat.key)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                      active
                        ? 'bg-heritage-vermilion text-white shadow-sm'
                        : 'bg-heritage-paper text-heritage-muted hover:text-heritage-ink'
                    }`}
                  >
                    {cat.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-heritage-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm bộ Quiz theo tên, tác giả..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/60 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} padding="p-0" className="overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="Chưa có bộ Quiz nào khớp bộ lọc"
            description="Thử chọn 'Tất cả' hoặc tạo ngay một bộ Quiz mới hỗ trợ AI trong vài giây."
            actionLabel="Xem tất cả Quiz"
            onAction={() => {
              handleSelectType('all');
              setSearch('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => {
              const meta = getQuizMeta(quiz.type);
              const result = userResults[quiz.id];
              const isCompleted =
                Boolean(result) ||
                Boolean(currentUser && Array.isArray(quiz.completedBy) && quiz.completedBy.includes(currentUser.uid));
              const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
              const aiCount = Array.isArray(quiz.questions)
                ? quiz.questions.filter((q) => q.aiGenerated).length
                : 0;

              return (
                <Link key={quiz.id} to={`/listquiz/${quiz.id}`} className="group block">
                  <Card hover padding="p-0" className="h-full overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                        <img
                          src={getQuizCover(quiz.type)}
                          alt={meta.shortLabel}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/15 to-transparent" />

                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <Badge variant={meta.badgeVariant}>{meta.shortLabel}</Badge>
                          {aiCount > 0 && (
                            <Badge variant="glass">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              Có câu AI
                            </Badge>
                          )}
                        </div>

                        {isCompleted && (
                          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-heritage-jade text-white text-xs font-bold shadow">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {result ? `${result.correctCount}/${result.totalQuestions}` : 'Đã làm'}
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-semibold">
                          <span>{questionCount} câu hỏi</span>
                          {result?.timestamp && (
                            <span className="inline-flex items-center gap-1 text-stone-200">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTimeVi(result.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-2">
                        <h2 className="font-serif text-lg sm:text-xl font-bold text-heritage-ink group-hover:text-heritage-vermilion transition-colors line-clamp-2">
                          {quiz.title}
                        </h2>
                        {quiz.description && (
                          <p className="text-sm text-heritage-muted line-clamp-2 leading-relaxed">{quiz.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-heritage-border/60 mt-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={quiz.author?.photo || '/logo192.png'}
                          alt={quiz.author?.name || 'Tác giả'}
                          className="w-7 h-7 rounded-full object-cover border border-heritage-border shrink-0"
                        />
                        <span className="text-xs font-semibold text-heritage-ink truncate">
                          {quiz.author?.name || 'Thành viên HTLVN'}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-heritage-vermilion shrink-0">
                        Làm bài <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </MainLayout>
  );
}

export default QuizzesList;
