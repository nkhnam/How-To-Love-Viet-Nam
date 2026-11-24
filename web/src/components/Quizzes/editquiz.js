import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Save, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Button from '../ui/Button';
import Card from '../ui/Card';
import AiQuizModal from './aiQuizModal';
import QuizQuestionBuilder from './QuizQuestionBuilder';
import { QUIZ_CATEGORIES } from '../../data/quizMeta';

/**
 * Edit Quiz page sharing QuizQuestionBuilder and AiQuizModal with CreateQuiz.
 */
function EditQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [authorDetails, setAuthorDetails] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        const [userSnap, quizSnap] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'quizzes', id)),
        ]);

        if (userSnap.exists()) {
          setAuthorDetails(userSnap.data());
        } else {
          setAuthorDetails({
            firstName: user.displayName || 'Thành viên',
            photo: user.photoURL || '',
          });
        }

        if (quizSnap.exists()) {
          const data = quizSnap.data();
          setTitle(data.title || '');
          setDescription(data.description || '');
          setSelectedType(data.type || '');
          setQuestions(Array.isArray(data.questions) ? data.questions : []);
        } else {
          toast.error('Không tìm thấy bộ Quiz cần chỉnh sửa.');
          navigate('/myquiz');
        }
      } catch (err) {
        console.error('Error loading quiz for edit:', err);
        toast.error('Không thể tải dữ liệu bộ Quiz.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedType || questions.length === 0) {
      toast.warning('Vui lòng nhập đầy đủ tiêu đề, môn học và có ít nhất 1 câu hỏi.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await updateDoc(doc(db, 'quizzes', id), {
        title: title.trim(),
        description: description.trim(),
        type: selectedType,
        questions: questions.map((q) =>
          q.type === 'fillInTheBlank'
            ? {
                question: q.question,
                blankAnswer: q.blankAnswer,
                explain: q.explain || '',
                type: 'fillInTheBlank',
                aiGenerated: Boolean(q.aiGenerated),
              }
            : {
                question: q.question,
                explain: q.explain || '',
                options: q.options,
                correctOptionIndex: q.correctOptionIndex,
                type: 'multipleChoice',
                aiGenerated: Boolean(q.aiGenerated),
              },
        ),
        author: {
          uid: currentUser.uid,
          name: authorDetails?.firstName || currentUser.displayName || 'Thành viên',
          photo: authorDetails?.photo || currentUser.photoURL || '',
        },
      });

      toast.success('Đã cập nhật bộ Quiz!');
      navigate('/myquiz');
    } catch (err) {
      console.error('Error updating quiz:', err);
      toast.error('Không thể cập nhật bộ Quiz lúc này.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: '/' },
            { label: 'Quiz của tôi', to: '/myquiz' },
            { label: 'Chỉnh sửa Quiz' },
          ]}
        />

        <div>
          <h1 className="font-serif text-3xl font-bold text-heritage-ink">Chỉnh sửa bộ Quiz</h1>
          <p className="text-sm text-heritage-muted mt-1">Cập nhật câu hỏi, đáp án hoặc bổ sung câu hỏi mới bằng AI.</p>
        </div>

        {loading ? (
          <Card className="p-8 text-center text-sm text-heritage-muted">Đang tải bộ Quiz...</Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="space-y-4">
              <h2 className="font-serif text-xl font-bold text-heritage-ink">Thông tin chung</h2>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-quiz-title">
                  Tiêu đề bộ Quiz *
                </label>
                <input
                  id="edit-quiz-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-base font-medium text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-quiz-type">
                  Môn học / Khối lớp *
                </label>
                <select
                  id="edit-quiz-type"
                  required
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                >
                  <option value="">-- Chọn môn học --</option>
                  {QUIZ_CATEGORIES.filter((c) => c.key !== 'all').map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="edit-quiz-desc">
                  Mô tả ngắn *
                </label>
                <textarea
                  id="edit-quiz-desc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                />
              </div>
            </Card>

            <QuizQuestionBuilder
              questions={questions}
              setQuestions={setQuestions}
              onOpenAiModal={() => setModalOpen(true)}
            />

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/myquiz')}>
                Hủy
              </Button>
              <Button type="submit" variant="primary" size="lg" disabled={submitting || questions.length === 0}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Lưu thay đổi ({questions.length} câu)
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {modalOpen && (
          <AiQuizModal
            isOpen={modalOpen}
            closeModal={() => setModalOpen(false)}
            onAddQuestions={(items) => setQuestions((prev) => [...prev, ...items])}
          />
        )}
      </section>
    </MainLayout>
  );
}

export default EditQuiz;
