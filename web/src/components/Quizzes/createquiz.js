import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
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
 * Create Quiz page with manual + AI-assisted question builder.
 */
function CreateQuiz() {
  const navigate = useNavigate();
  const [authorDetails, setAuthorDetails] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [questions, setQuestions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.info('Vui lòng đăng nhập để tạo bộ Quiz mới.');
        navigate('/login');
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setAuthorDetails(docSnap.data());
        } else {
          setAuthorDetails({
            firstName: user.displayName || user.email?.split('@')[0] || 'Thành viên',
            photo: user.photoURL || '',
          });
        }
      } catch (err) {
        console.error('Error loading author details:', err);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !selectedType || questions.length === 0) {
      toast.warning('Vui lòng nhập tiêu đề, chọn môn học và thêm ít nhất 1 câu hỏi.');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'quizzes'), {
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

      toast.success('Đã đăng bộ Quiz thành công!');
      navigate('/listquiz');
    } catch (err) {
      console.error('Error creating quiz:', err);
      toast.error('Không thể lưu bộ Quiz lúc này. Vui lòng thử lại.');
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
            { label: 'Kho Quiz', to: '/listquiz' },
            { label: 'Tạo bộ Quiz' },
          ]}
        />

        <div>
          <h1 className="font-serif text-3xl font-bold text-heritage-ink">Tạo bộ Quiz mới</h1>
          <p className="text-sm sm:text-base text-heritage-muted mt-1">
            Biên soạn câu hỏi ôn tập thủ công hoặc nhờ AI sinh câu hỏi trực tiếp từ bài học và hình ảnh.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-heritage-ink">Thông tin chung</h2>

            <div>
              <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="quiz-title">
                Tiêu đề bộ Quiz *
              </label>
              <input
                id="quiz-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Ôn tập Chương 1 Lịch Sử 12 — Trật tự thế giới sau 1945"
                className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-base font-medium text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="quiz-type">
                Môn học / Khối lớp *
              </label>
              <select
                id="quiz-type"
                required
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
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
              <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="quiz-desc">
                Mô tả ngắn *
              </label>
              <textarea
                id="quiz-desc"
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Giới thiệu nội dung ôn tập và đối tượng phù hợp..."
                className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
              />
            </div>
          </Card>

          <QuizQuestionBuilder
            questions={questions}
            setQuestions={setQuestions}
            onOpenAiModal={() => setModalOpen(true)}
          />

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={submitting || questions.length === 0}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Đăng bộ Quiz ({questions.length} câu)
                </>
              )}
            </Button>
          </div>
        </form>

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

export default CreateQuiz;
