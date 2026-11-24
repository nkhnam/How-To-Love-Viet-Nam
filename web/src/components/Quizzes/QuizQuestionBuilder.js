import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import {
  CheckCircle2,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const EMPTY_QUESTION = {
  question: '',
  type: 'multipleChoice',
  explain: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  blankAnswer: '',
  aiGenerated: false,
};

/**
 * Shared question editor + preview list used by both CreateQuiz and EditQuiz.
 */
function QuizQuestionBuilder({ questions, setQuestions, onOpenAiModal }) {
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [editingIdx, setEditingIdx] = useState(null);

  const isDraftValid = () => {
    if (!draft.question.trim()) return false;
    if (draft.type === 'multipleChoice') {
      return (
        draft.options.every((opt) => opt.trim().length > 0) &&
        draft.correctOptionIndex !== null &&
        draft.correctOptionIndex >= 0 &&
        draft.correctOptionIndex < 4
      );
    }
    return draft.blankAnswer.trim().length > 0;
  };

  const handleSaveDraft = () => {
    if (!isDraftValid()) return;
    const normalized =
      draft.type === 'multipleChoice'
        ? {
            question: draft.question.trim(),
            explain: draft.explain.trim(),
            type: 'multipleChoice',
            options: draft.options.map((o) => o.trim()),
            correctOptionIndex: draft.correctOptionIndex,
            aiGenerated: Boolean(draft.aiGenerated),
          }
        : {
            question: draft.question.trim(),
            blankAnswer: draft.blankAnswer.trim(),
            explain: draft.explain.trim(),
            type: 'fillInTheBlank',
            aiGenerated: Boolean(draft.aiGenerated),
          };

    if (editingIdx !== null) {
      setQuestions((prev) => prev.map((item, idx) => (idx === editingIdx ? normalized : item)));
      setEditingIdx(null);
    } else {
      setQuestions((prev) => [...prev, normalized]);
    }
    setDraft(EMPTY_QUESTION);
  };

  const handleEditItem = (index) => {
    const q = questions[index];
    setDraft({
      question: q.question || '',
      type: q.type || 'multipleChoice',
      explain: q.explain || '',
      options: q.options?.length === 4 ? [...q.options] : ['', '', '', ''],
      correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
      blankAnswer: q.blankAnswer || '',
      aiGenerated: Boolean(q.aiGenerated),
    });
    setEditingIdx(index);
  };

  const handleDeleteItem = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
    if (editingIdx === index) {
      setEditingIdx(null);
      setDraft(EMPTY_QUESTION);
    }
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setDraft(EMPTY_QUESTION);
  };

  return (
    <div className="space-y-8">
      {/* DRAFT QUESTION FORM */}
      <Card className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-heritage-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-heritage-vermilion-soft text-heritage-vermilion flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-heritage-ink">
                {editingIdx !== null ? `Đang sửa câu hỏi #${editingIdx + 1}` : 'Thêm câu hỏi mới'}
              </h2>
              <p className="text-xs text-heritage-muted">Hỗ trợ Trắc nghiệm 4 lựa chọn hoặc Điền vào chỗ trống</p>
            </div>
          </div>

          {onOpenAiModal && (
            <Button type="button" variant="secondary" size="sm" onClick={onOpenAiModal}>
              <Sparkles className="w-4 h-4" />
              Tạo câu hỏi bằng AI
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="question-type-select">
              Loại câu hỏi
            </label>
            <select
              id="question-type-select"
              value={draft.type}
              onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
            >
              <option value="multipleChoice">Trắc nghiệm (4 đáp án)</option>
              <option value="fillInTheBlank">Điền vào chỗ trống</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="question-text-input">
              Nội dung câu hỏi *
            </label>
            <input
              id="question-text-input"
              type="text"
              value={draft.question}
              onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              placeholder={
                draft.type === 'fillInTheBlank'
                  ? 'Ví dụ: Chiến dịch ___ năm 1954 kết thúc cuộc kháng chiến chống Pháp.'
                  : 'Nhập nội dung câu hỏi lịch sử hoặc địa phương...'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
            />
          </div>
        </div>

        {draft.type === 'multipleChoice' ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-heritage-ink">
              Các phương án lựa chọn (tích chọn đáp án đúng) *
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {draft.options.map((opt, idx) => {
                const isRight = draft.correctOptionIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border transition-colors ${
                      isRight
                        ? 'border-heritage-jade bg-heritage-jade-soft/35'
                        : 'border-heritage-border bg-heritage-cream/40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setDraft({ ...draft, correctOptionIndex: idx })}
                      aria-label={`Chọn đáp án ${String.fromCharCode(65 + idx)} là đúng`}
                      className={`w-8 h-8 rounded-lg text-xs font-bold shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                        isRight
                          ? 'bg-heritage-jade text-white'
                          : 'bg-white text-heritage-muted border border-heritage-border hover:border-heritage-ink'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </button>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...draft.options];
                        next[idx] = e.target.value;
                        setDraft({ ...draft, options: next });
                      }}
                      placeholder={`Phương án ${String.fromCharCode(65 + idx)}`}
                      className="flex-1 bg-transparent text-sm text-heritage-ink focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="blank-answer-input">
              Đáp án chính xác *
            </label>
            <input
              id="blank-answer-input"
              type="text"
              value={draft.blankAnswer}
              onChange={(e) => setDraft({ ...draft, blankAnswer: e.target.value })}
              placeholder="Ví dụ: Điện Biên Phủ"
              className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="explain-textarea">
            Giải thích đáp án (tùy chọn)
          </label>
          <textarea
            id="explain-textarea"
            rows={2}
            value={draft.explain}
            onChange={(e) => setDraft({ ...draft, explain: e.target.value })}
            placeholder="Giải thích ngắn gọn giúp học sinh hiểu sâu bản chất sự kiện..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="primary" size="sm" disabled={!isDraftValid()} onClick={handleSaveDraft}>
            <Plus className="w-4 h-4" />
            {editingIdx !== null ? 'Lưu cập nhật câu hỏi' : 'Thêm câu hỏi vào bộ Quiz'}
          </Button>
          {editingIdx !== null && (
            <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
              Hủy chỉnh sửa
            </Button>
          )}
        </div>
      </Card>

      {/* QUESTIONS LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-heritage-ink flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-heritage-vermilion" />
            Danh sách câu hỏi ({questions.length})
          </h3>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-heritage-border bg-white/70 p-8 text-center text-sm text-heritage-muted">
            Chưa có câu hỏi nào. Hãy nhập câu hỏi ở trên hoặc nhấn &ldquo;Tạo câu hỏi bằng AI&rdquo; để tạo nhanh từ
            tài liệu.
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <Card key={index} padding="p-5" className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">Câu {index + 1}</Badge>
                      <Badge variant={q.type === 'fillInTheBlank' ? 'gold' : 'jade'}>
                        {q.type === 'fillInTheBlank' ? 'Điền chỗ trống' : 'Trắc nghiệm'}
                      </Badge>
                      {q.aiGenerated && (
                        <Badge variant="vermilion">
                          <Sparkles className="w-3 h-3" />
                          AI tạo
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-base text-heritage-ink">{q.question}</h4>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleEditItem(index)}>
                      <Pencil className="w-3.5 h-3.5" />
                      Sửa
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(index)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </Button>
                  </div>
                </div>

                {q.type === 'multipleChoice' && Array.isArray(q.options) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, optIdx) => {
                      const isCorrect = q.correctOptionIndex === optIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm border ${
                            isCorrect
                              ? 'bg-heritage-jade-soft/50 border-teal-300 text-heritage-ink font-semibold'
                              : 'bg-heritage-cream/50 border-heritage-border text-heritage-muted'
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-heritage-jade shrink-0" />
                          ) : (
                            <span className="w-4 h-4 text-center text-xs font-bold shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                          )}
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.type === 'fillInTheBlank' && (
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-heritage-jade-soft/50 border border-teal-300 text-heritage-ink font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-heritage-jade shrink-0" />
                    <span>Đáp án: {q.blankAnswer}</span>
                  </div>
                )}

                {q.explain && (
                  <div className="text-xs sm:text-sm text-heritage-muted bg-heritage-paper rounded-xl px-3.5 py-2.5">
                    <strong className="text-heritage-ink">Giải thích: </strong>
                    <span dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.explain) }} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizQuestionBuilder;
