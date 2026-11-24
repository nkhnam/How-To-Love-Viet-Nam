import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, query, where } from 'firebase/firestore';
import { PlusCircle, Play, Pencil, Trash2, FolderKanban } from 'lucide-react';
import { toast } from 'react-toastify';
import { db, auth } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import { getQuizMeta, getQuizCover } from '../../data/quizMeta';

/**
 * Author dashboard for managing user-created Quizzes.
 */
function MyQuiz() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const q = query(collection(db, 'quizzes'), where('author.uid', '==', user.uid));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setQuizzes(list);
      } catch (err) {
        console.error('Error loading user quizzes:', err);
        toast.error('Không thể tải danh sách Quiz của bạn.');
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'quizzes', deleteTarget.id));
      setQuizzes((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      toast.success(`Đã xóa bộ Quiz "${deleteTarget.title}"`);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast.error('Không thể xóa bộ Quiz lúc này.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <MainLayout>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Kho Quiz', to: '/listquiz' },
            { label: 'Quiz của tôi' },
          ]}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-heritage-ink">Quiz của tôi</h1>
            <p className="text-sm text-heritage-muted mt-1">Quản lý, chỉnh sửa hoặc tạo thêm bộ câu hỏi mới.</p>
          </div>
          <Button to="/createquiz" variant="primary" size="md">
            <PlusCircle className="w-4 h-4" />
            Tạo bộ Quiz mới
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Card key={idx} padding="p-0" className="overflow-hidden">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : quizzes.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="Bạn chưa tạo bộ Quiz nào"
            description="Bắt đầu tạo bộ câu hỏi Lịch Sử hoặc GDĐP đầu tiên — có thể nhờ AI gợi ý nhanh từ văn bản hoặc hình ảnh."
            actionLabel="Tạo Quiz đầu tiên"
            actionTo="/createquiz"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const meta = getQuizMeta(quiz.type);
              const count = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
              return (
                <Card key={quiz.id} padding="p-0" className="overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/9] bg-stone-900 overflow-hidden">
                      <img src={getQuizCover(quiz.type)} alt={meta.shortLabel} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge variant={meta.badgeVariant}>{meta.shortLabel}</Badge>
                      </div>
                      <span className="absolute bottom-3 left-3 text-xs font-semibold text-white">{count} câu hỏi</span>
                    </div>

                    <div className="p-5 space-y-2">
                      <h2 className="font-serif text-lg font-bold text-heritage-ink line-clamp-2">{quiz.title}</h2>
                      {quiz.description && (
                        <p className="text-sm text-heritage-muted line-clamp-2">{quiz.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex flex-wrap gap-2 border-t border-heritage-border/60">
                    <Button to={`/listquiz/${quiz.id}`} variant="secondary" size="sm" className="flex-1">
                      <Play className="w-3.5 h-3.5" />
                      Làm thử
                    </Button>
                    <Button to={`/editquiz/${quiz.id}`} variant="outline" size="sm">
                      <Pencil className="w-3.5 h-3.5" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(quiz)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => !deleting && setDeleteTarget(null)}
          title="Xác nhận xóa bộ Quiz"
          maxWidth="max-w-md"
        >
          <div className="p-6 space-y-4">
            <p className="text-sm text-heritage-muted leading-relaxed">
              Bạn có chắc muốn xóa vĩnh viễn bộ Quiz{' '}
              <strong className="text-heritage-ink">&ldquo;{deleteTarget?.title}&rdquo;</strong>? Hành động này không
              thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" size="sm" disabled={deleting} onClick={() => setDeleteTarget(null)}>
                Hủy
              </Button>
              <Button variant="primary" size="sm" disabled={deleting} onClick={confirmDelete}>
                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
              </Button>
            </div>
          </div>
        </Modal>
      </section>
    </MainLayout>
  );
}

export default MyQuiz;
