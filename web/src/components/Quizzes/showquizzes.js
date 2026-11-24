import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import DOMPurify from 'dompurify';
import {
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  Lightbulb,
  Trophy,
  RotateCcw,
  Keyboard,
  Play,
  LogIn,
} from 'lucide-react';
import { db, auth } from '../firebase';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { getQuizMeta } from '../../data/quizMeta';
import correctSoundFile from './right.m4a';
import wrongSoundFile from './wrong.m4a';

const WELCOME_IMAGES = ['/Img/eddy.png', '/Img/junior.png', '/Img/bear.png', '/Img/lily.png'];
const MUTE_KEY = 'htlvn_quiz_muted';

function isAnswerRight(question, userAnswer) {
  if (!question) return false;
  if (question.type === 'multipleChoice') {
    return userAnswer === question.correctOptionIndex;
  }
  return (
    typeof userAnswer === 'string' &&
    typeof question.blankAnswer === 'string' &&
    userAnswer.trim().toLowerCase() === question.blankAnswer.trim().toLowerCase()
  );
}

/**
 * Distraction-free Focus Quiz Runner with keyboard shortcuts, audio mute toggle,
 * inline explanation card, guest-play support, and Result Summary + Answer Review screen.
 */
function ShowQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState('intro'); // 'intro' | 'playing' | 'summary'
  const [questionPool, setQuestionPool] = useState([]);
  const [isRetryWrongMode, setIsRetryWrongMode] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [blankAnswer, setBlankAnswer] = useState('');
  const [checkedCurrent, setCheckedCurrent] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  const [resultDocId, setResultDocId] = useState(null);
  const [savedToCloud, setSavedToCloud] = useState(false);
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === 'true');
  const hasInteractedRef = useRef(false);

  const mascotImage = useMemo(
    () => WELCOME_IMAGES[Math.floor(Math.random() * WELCOME_IMAGES.length)],
    [],
  );

  useEffect(() => {
    const markInteracted = () => {
      hasInteractedRef.current = true;
    };
    window.addEventListener('pointerdown', markInteracted, { once: true });
    window.addEventListener('keydown', markInteracted, { once: true });
    return () => {
      window.removeEventListener('pointerdown', markInteracted);
      window.removeEventListener('keydown', markInteracted);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadQuizAndResult = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'quizzes', id));
        if (!active) return;
        if (!docSnap.exists()) {
          setQuiz(null);
          setLoading(false);
          return;
        }
        const data = docSnap.data();
        const questions = Array.isArray(data.questions) ? data.questions : [];
        setQuiz(data);
        setQuestionPool(questions);

        const savedRaw = localStorage.getItem(`quizState_${id}`);
        if (savedRaw) {
          try {
            const saved = JSON.parse(savedRaw);
            if (Array.isArray(saved.userAnswers) && saved.currentQuestionIndex < questions.length) {
              setUserAnswers(saved.userAnswers);
              setCurrentIndex(saved.currentQuestionIndex || 0);
              if (saved.isIntro === false) {
                setPhase('playing');
              }
            }
          } catch {
            // Ignore malformed local draft
          }
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadQuizAndResult();
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setResultDocId(null);
        return;
      }
      try {
        const q = query(collection(db, 'results'), where('userId', '==', user.uid), where('quizId', '==', id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setResultDocId(snap.docs[0].id);
        }
      } catch (err) {
        console.error('Failed to load prior result doc:', err);
      }
    });
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!quiz || isRetryWrongMode || phase !== 'playing') return;
    localStorage.setItem(
      `quizState_${id}`,
      JSON.stringify({
        currentQuestionIndex: currentIndex,
        userAnswers,
        isIntro: false,
      }),
    );
  }, [id, quiz, phase, currentIndex, userAnswers, isRetryWrongMode]);

  const currentQuestion = questionPool[currentIndex] || null;

  useEffect(() => {
    if (!currentQuestion) return;
    const saved = userAnswers[currentIndex];
    if (saved !== undefined) {
      if (currentQuestion.type === 'multipleChoice') {
        setSelectedOption(saved);
      } else {
        setBlankAnswer(String(saved));
      }
      setCheckedCurrent(true);
      setIsCurrentCorrect(isAnswerRight(currentQuestion, saved));
    } else {
      setSelectedOption(null);
      setBlankAnswer('');
      setCheckedCurrent(false);
      setIsCurrentCorrect(false);
    }
  }, [currentIndex, currentQuestion, userAnswers]);

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(MUTE_KEY, String(next));
      return next;
    });
  };

  const playFeedbackSound = useCallback(
    (right) => {
      if (muted || !hasInteractedRef.current) return;
      try {
        const audio = new Audio(right ? correctSoundFile : wrongSoundFile);
        audio.play().catch(() => {});
      } catch {
        // Ignore audio errors
      }
    },
    [muted],
  );

  const persistCompletion = useCallback(
    async (finalAnswers) => {
      if (isRetryWrongMode) return;
      localStorage.removeItem(`quizState_${id}`);
      const user = auth.currentUser;
      if (!user || !quiz) return;

      const totalQuestions = questionPool.length;
      const finalCorrectCount = questionPool.reduce(
        (sum, q, idx) => sum + (isAnswerRight(q, finalAnswers[idx]) ? 1 : 0),
        0,
      );

      try {
        await updateDoc(doc(db, 'quizzes', id), {
          completedBy: arrayUnion(user.uid),
        });
        const payload = {
          userId: user.uid,
          quizId: id,
          userAnswers: finalAnswers,
          correctCount: finalCorrectCount,
          totalQuestions,
          timestamp: new Date(),
        };
        if (resultDocId) {
          await updateDoc(doc(db, 'results', resultDocId), payload);
        } else {
          const created = await addDoc(collection(db, 'results'), payload);
          setResultDocId(created.id);
        }
        setSavedToCloud(true);
      } catch (err) {
        console.error('Failed to save quiz score:', err);
      }
    },
    [id, isRetryWrongMode, questionPool, quiz, resultDocId],
  );

  const handleCheckOrNext = useCallback(async () => {
    if (!currentQuestion) return;

    if (!checkedCurrent) {
      if (currentQuestion.type === 'multipleChoice' && selectedOption === null) return;
      if (currentQuestion.type === 'fillInTheBlank' && blankAnswer.trim() === '') return;

      const answerVal = currentQuestion.type === 'multipleChoice' ? selectedOption : blankAnswer.trim();
      const right = isAnswerRight(currentQuestion, answerVal);
      const nextAnswers = [...userAnswers];
      nextAnswers[currentIndex] = answerVal;

      setUserAnswers(nextAnswers);
      setIsCurrentCorrect(right);
      setCheckedCurrent(true);
      playFeedbackSound(right);
      return;
    }

    if (currentIndex < questionPool.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      await persistCompletion(userAnswers);
      setPhase('summary');
    }
  }, [
    blankAnswer,
    checkedCurrent,
    currentIndex,
    currentQuestion,
    persistCompletion,
    playFeedbackSound,
    questionPool.length,
    selectedOption,
    userAnswers,
  ]);

  // Keyboard shortcuts: 1-4 or A-D select option; Enter checks or goes next
  useEffect(() => {
    if (phase !== 'playing' || !currentQuestion) return undefined;
    const handleKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const isTextInput = tag === 'input' || tag === 'textarea';

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCheckOrNext();
        return;
      }

      if (isTextInput || checkedCurrent || currentQuestion.type !== 'multipleChoice') return;
      const keyMap = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 };
      const idx = keyMap[e.key.toLowerCase()];
      if (idx !== undefined && idx < (currentQuestion.options?.length || 0)) {
        hasInteractedRef.current = true;
        setSelectedOption(idx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentQuestion, checkedCurrent, handleCheckOrNext]);

  const handleRestartAll = () => {
    const all = Array.isArray(quiz?.questions) ? quiz.questions : [];
    setQuestionPool(all);
    setIsRetryWrongMode(false);
    setUserAnswers([]);
    setCurrentIndex(0);
    setSavedToCloud(false);
    localStorage.removeItem(`quizState_${id}`);
    setPhase('playing');
  };

  const handleRetryWrong = () => {
    const wrongOnes = questionPool.filter((q, idx) => !isAnswerRight(q, userAnswers[idx]));
    if (wrongOnes.length === 0) return;
    setQuestionPool(wrongOnes);
    setIsRetryWrongMode(true);
    setUserAnswers([]);
    setCurrentIndex(0);
    setPhase('playing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-heritage-cream text-heritage-muted text-sm font-medium">
        Đang tải bài Quiz...
      </div>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return (
      <div className="min-h-screen bg-heritage-cream flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center space-y-4">
          <h1 className="font-serif text-2xl font-bold text-heritage-ink">Không tìm thấy bộ Quiz</h1>
          <p className="text-sm text-heritage-muted">Bộ Quiz này không tồn tại hoặc chưa có câu hỏi nào.</p>
          <Button to="/listquiz" variant="primary">
            Quay lại kho Quiz
          </Button>
        </Card>
      </div>
    );
  }

  const meta = getQuizMeta(quiz.type);

  // 1. INTRO SCREEN
  if (phase === 'intro') {
    const hasDraft = userAnswers.length > 0 && userAnswers.some((a) => a !== undefined);
    return (
      <div className="min-h-screen bg-heritage-cream flex flex-col">
        <header className="h-16 px-4 sm:px-6 border-b border-heritage-border bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/listquiz')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-heritage-muted hover:text-heritage-ink cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kho Quiz</span>
          </button>
          <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <Card className="max-w-2xl w-full p-6 sm:p-10 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img
                src={mascotImage}
                alt="Linh vật HTLVN"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain shrink-0"
              />
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  <Badge variant="gold">{quiz.questions.length} câu hỏi</Badge>
                  <Badge variant="neutral">Tác giả: {quiz.author?.name || 'HTLVN'}</Badge>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink leading-tight">
                  {quiz.title}
                </h1>
                {quiz.description && <p className="text-sm sm:text-base text-heritage-muted">{quiz.description}</p>}
              </div>
            </div>

            <div className="rounded-xl bg-heritage-paper border border-heritage-border px-4 py-3 flex items-center gap-3 text-xs sm:text-sm text-heritage-muted">
              <Keyboard className="w-4 h-4 text-heritage-vermilion shrink-0" />
              <span>
                Mẹo làm nhanh: Dùng phím <strong className="text-heritage-ink">1–4</strong> (hoặc{' '}
                <strong className="text-heritage-ink">A–D</strong>) để chọn đáp án và{' '}
                <strong className="text-heritage-ink">Enter</strong> để kiểm tra / chuyển câu.
              </span>
            </div>

            {!auth.currentUser && (
              <p className="text-xs text-heritage-muted text-center sm:text-left">
                * Bạn đang làm với tư cách khách; vẫn xem được toàn bộ đáp án &amp; giải thích, hoặc{' '}
                <Link to="/login" className="font-semibold text-heritage-vermilion hover:underline">
                  đăng nhập
                </Link>{' '}
                để lưu kết quả.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {hasDraft && (
                <Button variant="outline" onClick={handleRestartAll}>
                  <RotateCcw className="w-4 h-4" />
                  Làm lại từ đầu
                </Button>
              )}
              <Button variant="primary" size="lg" onClick={() => setPhase('playing')}>
                <Play className="w-4 h-4" />
                {hasDraft ? 'Tiếp tục làm bài' : 'Bắt đầu làm bài'}
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  // 2. RESULT SUMMARY & ANSWER REVIEW SCREEN
  if (phase === 'summary') {
    const total = questionPool.length;
    const correctTotal = questionPool.reduce((sum, q, idx) => sum + (isAnswerRight(q, userAnswers[idx]) ? 1 : 0), 0);
    const wrongTotal = total - correctTotal;
    const percent = total > 0 ? Math.round((correctTotal / total) * 100) : 0;

    let heading = 'Cố gắng thêm nhé!';
    let subtext = 'Hãy xem lại phần giải thích từng câu bên dưới và thử ôn lại câu sai.';
    if (percent >= 80) {
      heading = 'Xuất sắc! Hoàn thành ấn tượng';
      subtext = 'Bạn đã nắm rất chắc kiến thức trọng tâm của chuyên đề này.';
    } else if (percent >= 50) {
      heading = 'Làm tốt lắm!';
      subtext = 'Bạn đã đi qua phần lớn câu hỏi, hãy ôn lại các câu còn nhầm để đạt điểm tối đa.';
    }

    return (
      <div className="min-h-screen bg-heritage-cream">
        <header className="h-16 px-4 sm:px-6 border-b border-heritage-border bg-white flex items-center justify-between">
          <Link
            to="/listquiz"
            className="inline-flex items-center gap-2 text-sm font-semibold text-heritage-muted hover:text-heritage-ink"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về kho Quiz</span>
          </Link>
          <span className="text-sm font-bold text-heritage-ink truncate max-w-[60%]">{quiz.title}</span>
          <div />
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          <Card className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
            {/* Score ring */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#F5EFE6" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke={percent >= 70 ? '#0F766E' : '#B91C1C'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 - (326.7 * percent) / 100}
                />
              </svg>
              <div className="absolute text-center">
                <p className="font-serif text-3xl font-bold text-heritage-ink">{percent}%</p>
                <p className="text-xs font-semibold text-heritage-muted">
                  {correctTotal}/{total} đúng
                </p>
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <Badge variant="gold">
                  <Trophy className="w-3.5 h-3.5" />
                  {isRetryWrongMode ? 'Chế độ ôn câu sai' : 'Kết quả bài làm'}
                </Badge>
                {savedToCloud && (
                  <Badge variant="jade">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã lưu vào Hồ sơ
                  </Badge>
                )}
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink">{heading}</h1>
              <p className="text-sm sm:text-base text-heritage-muted">{subtext}</p>

              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2.5">
                {wrongTotal > 0 && (
                  <Button variant="primary" size="sm" onClick={handleRetryWrong}>
                    <RotateCcw className="w-4 h-4" />
                    Làm lại {wrongTotal} câu sai
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleRestartAll}>
                  <RotateCcw className="w-4 h-4" />
                  Làm lại toàn bộ
                </Button>
                <Button to="/listquiz" variant="ghost" size="sm">
                  Về kho Quiz
                </Button>
                {!auth.currentUser && (
                  <Button to="/login" variant="secondary" size="sm">
                    <LogIn className="w-4 h-4" />
                    Đăng nhập để lưu điểm
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Answer Review List */}
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-heritage-ink">Xem lại chi tiết từng câu ({total})</h2>
            {questionPool.map((q, idx) => {
              const userAns = userAnswers[idx];
              const right = isAnswerRight(q, userAns);
              const userDisplay =
                q.type === 'multipleChoice'
                  ? userAns !== undefined && userAns !== null
                    ? `${String.fromCharCode(65 + userAns)}. ${q.options[userAns] || ''}`
                    : 'Chưa chọn'
                  : userAns || 'Chưa điền';
              const rightDisplay =
                q.type === 'multipleChoice'
                  ? `${String.fromCharCode(65 + q.correctOptionIndex)}. ${q.options[q.correctOptionIndex] || ''}`
                  : q.blankAnswer;

              return (
                <Card
                  key={idx}
                  padding="p-5"
                  className={`space-y-3 border-l-4 ${right ? 'border-l-heritage-jade' : 'border-l-heritage-vermilion'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-heritage-muted uppercase">Câu {idx + 1}</span>
                      <h3 className="font-semibold text-base text-heritage-ink">{q.question}</h3>
                    </div>
                    {right ? (
                      <Badge variant="jade" className="shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Chính xác
                      </Badge>
                    ) : (
                      <Badge variant="vermilion" className="shrink-0">
                        <XCircle className="w-3.5 h-3.5" />
                        Chưa đúng
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    <div
                      className={`px-3.5 py-2 rounded-xl border ${
                        right ? 'bg-teal-50/70 border-teal-200 text-teal-900' : 'bg-red-50/70 border-red-200 text-red-900'
                      }`}
                    >
                      <span className="text-xs font-semibold block opacity-75">Bạn chọn:</span>
                      <span className="font-semibold">{userDisplay}</span>
                    </div>
                    {!right && (
                      <div className="px-3.5 py-2 rounded-xl border bg-teal-50/70 border-teal-200 text-teal-900">
                        <span className="text-xs font-semibold block opacity-75">Đáp án đúng:</span>
                        <span className="font-semibold">{rightDisplay}</span>
                      </div>
                    )}
                  </div>

                  {q.explain && (
                    <div className="rounded-xl bg-heritage-paper px-3.5 py-2.5 text-xs sm:text-sm text-heritage-muted flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-heritage-gold shrink-0 mt-0.5" />
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.explain) }} />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // 3. ACTIVE QUESTION SCREEN
  const progressPercent = ((currentIndex + 1) / questionPool.length) * 100;
  const canCheck =
    currentQuestion.type === 'multipleChoice' ? selectedOption !== null : blankAnswer.trim().length > 0;

  return (
    <div className="min-h-screen bg-heritage-cream flex flex-col">
      {/* Top Focus Progress Bar */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 bg-white/95 backdrop-blur-md border-b border-heritage-border flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/listquiz')}
          aria-label="Thoát bài Quiz"
          className="p-2 rounded-xl text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 h-2.5 rounded-full bg-heritage-paper overflow-hidden">
            <div
              className="h-full bg-heritage-vermilion rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-heritage-ink whitespace-nowrap">
            Câu {currentIndex + 1} / {questionPool.length}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-2 rounded-xl text-heritage-muted hover:text-heritage-ink hover:bg-heritage-paper transition-colors cursor-pointer"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-heritage-jade" />}
        </button>
      </header>

      {/* Main Question Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-32 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={meta.badgeVariant}>{meta.shortLabel}</Badge>
          {isRetryWrongMode && <Badge variant="gold">Ôn lại câu sai</Badge>}
          <span className="text-xs font-medium text-heritage-muted truncate">{quiz.title}</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-heritage-ink leading-snug">
          {currentQuestion.question}
        </h1>

        {currentQuestion.type === 'multipleChoice' ? (
          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isRightOpt = checkedCurrent && idx === currentQuestion.correctOptionIndex;
              const isWrongSelected =
                checkedCurrent && isSelected && idx !== currentQuestion.correctOptionIndex;

              let styleClass =
                'bg-white border-heritage-border hover:border-heritage-gold hover:bg-heritage-paper/50';
              if (isRightOpt) {
                styleClass = 'bg-teal-50 border-heritage-jade text-teal-950 ring-2 ring-heritage-jade/20';
              } else if (isWrongSelected) {
                styleClass = 'bg-red-50 border-red-500 text-red-950 ring-2 ring-red-500/20';
              } else if (isSelected) {
                styleClass =
                  'bg-heritage-vermilion-soft/70 border-heritage-vermilion text-heritage-ink ring-2 ring-heritage-vermilion/20';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={checkedCurrent}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                    checkedCurrent ? 'cursor-default' : 'cursor-pointer'
                  } ${styleClass}`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl text-sm font-bold flex items-center justify-center shrink-0 transition-colors ${
                      isRightOpt
                        ? 'bg-heritage-jade text-white'
                        : isWrongSelected
                        ? 'bg-red-600 text-white'
                        : isSelected
                        ? 'bg-heritage-vermilion text-white'
                        : 'bg-heritage-paper text-heritage-ink'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 text-base font-medium leading-relaxed">{option}</span>
                  {isRightOpt && <CheckCircle2 className="w-5 h-5 text-heritage-jade shrink-0" />}
                  {isWrongSelected && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-heritage-muted">
              Nhập đáp án của bạn vào ô bên dưới:
            </label>
            <input
              type="text"
              value={blankAnswer}
              onChange={(e) => setBlankAnswer(e.target.value)}
              disabled={checkedCurrent}
              placeholder="Gõ đáp án..."
              className={`w-full px-5 py-4 rounded-2xl border-2 text-lg font-medium bg-white focus:outline-none ${
                checkedCurrent
                  ? isCurrentCorrect
                    ? 'border-heritage-jade bg-teal-50 text-teal-950'
                    : 'border-red-500 bg-red-50 text-red-950'
                  : 'border-heritage-border focus:border-heritage-vermilion'
              }`}
            />
            {checkedCurrent && !isCurrentCorrect && (
              <p className="text-sm font-semibold text-heritage-jade">
                Đáp án đúng: {currentQuestion.blankAnswer}
              </p>
            )}
          </div>
        )}

        {/* Inline Explanation Card once checked */}
        {checkedCurrent && (
          <Card
            padding="p-5"
            className={`space-y-2 border-l-4 ${
              isCurrentCorrect ? 'border-l-heritage-jade bg-teal-50/40' : 'border-l-heritage-vermilion bg-red-50/40'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-heritage-gold" />
              <span className="text-heritage-ink">Giải thích đáp án</span>
            </div>
            {currentQuestion.explain ? (
              <div
                className="text-sm text-heritage-ink leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentQuestion.explain) }}
              />
            ) : (
              <p className="text-sm text-heritage-muted italic">Không có ghi chú giải thích thêm cho câu này.</p>
            )}
          </Card>
        )}
      </main>

      {/* Bottom Sticky Action Footer */}
      <footer
        className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 sm:px-6 py-4 transition-colors ${
          checkedCurrent
            ? isCurrentCorrect
              ? 'bg-teal-50 border-teal-200'
              : 'bg-red-50 border-red-200'
            : 'bg-white border-heritage-border'
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => prev - 1)}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Câu trước</span>
              </Button>
            )}

            {checkedCurrent && (
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-heritage-jade shrink-0" />
                    <span className="text-heritage-jade">Chính xác!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span className="text-red-700">Chưa chính xác</span>
                  </>
                )}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant={checkedCurrent && isCurrentCorrect ? 'secondary' : 'primary'}
            size="md"
            disabled={!checkedCurrent && !canCheck}
            onClick={handleCheckOrNext}
          >
            <span>
              {checkedCurrent
                ? currentIndex < questionPool.length - 1
                  ? 'Câu tiếp theo'
                  : 'Xem kết quả'
                : 'Kiểm tra'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

export default ShowQuiz;
