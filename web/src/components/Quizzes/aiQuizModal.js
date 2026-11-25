import React, { useState, useMemo } from 'react';
import { Sparkles, FileText, Image as ImageIcon, BookOpen, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { API_URL } from '../../config';
import { COURSES } from '../../data/courses';

const RICH_PRESET_TEXTS = {
  'ls10-1':
    'Lịch sử là những gì đã diễn ra trong quá khứ, tồn tại một cách khách quan và có thể nhận thức được. Nhận thức lịch sử là hiểu biết của con người về hiện thực lịch sử, được phục dựng thông qua tư liệu và phương pháp nghiên cứu phù hợp. Sử học có chức năng khoa học (khôi phục, giải thích hiện tượng lịch sử khách quan), xã hội và giáo dục. Sử học tuân theo các nguyên tắc khách quan, trung thực, tiến bộ, toàn diện và cụ thể. Các nguồn sử liệu gồm sử liệu trực tiếp (gốc) và gián tiếp (hồi ký, kể chuyện), được phân loại thành sử liệu thành văn, truyền miệng, hiện vật và đa phương tiện.',
  'ls10-2':
    'Tri thức lịch sử giúp con người nhận thức về cội nguồn, bản sắc của bản thân, gia đình, cộng đồng và dân tộc. Học tập lịch sử là nền tảng của truyền thống yêu nước, niềm tự hào dân tộc, đồng thời giúp khám phá các nền văn hóa nhân loại. Sử học còn cung cấp cơ sở khoa học cho công tác bảo tồn di sản văn hóa, phát triển du lịch bền vững và công nghiệp văn hóa như Chùa Cầu Hội An, Thánh địa Mỹ Sơn, Cố đô Huế.',
};

function parseQuizText(rawText) {
  if (!rawText || typeof rawText !== 'string') return [];

  // Attempt JSON extraction first if the model returns JSON array
  try {
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].question) {
        return parsed
          .map((item) => ({
            question: String(item.question || '').trim(),
            options: Array.isArray(item.options) ? item.options.slice(0, 4).map((o) => String(o).trim()) : [],
            correctOptionIndex:
              typeof item.correctOptionIndex === 'number'
                ? Math.min(3, Math.max(0, item.correctOptionIndex))
                : 0,
            explain: String(item.explain || '').trim(),
          }))
          .filter((q) => q.question && q.options.length === 4);
      }
    }
  } catch {
    // Fallback cleanly to line-based parser
  }

  const blocks = rawText.split(/Câu hỏi:/i).slice(1);
  return blocks
    .map((block) => {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      const question = (lines[0] || '').replace(/^\*+|\*+$/g, '').trim();
      const optionLines = lines.filter((l) => /^Lựa chọn\s*\d+\s*:/i.test(l)).slice(0, 4);
      const options = optionLines.map((l) =>
        l
          .replace(/^Lựa chọn\s*\d+\s*:/i, '')
          .replace(/\*\*/g, '')
          .trim(),
      );
      const correctLine = lines.find((l) => /Lựa chọn đúng:/i.test(l)) || '';
      const numMatch = correctLine.match(/\d+/);
      const correctOptionIndex = numMatch ? Math.min(3, Math.max(0, parseInt(numMatch[0], 10) - 1)) : 0;
      const explainLine = lines.find((l) => /^Giải thích:/i.test(l)) || '';
      let explain = explainLine.replace(/^Giải thích:/i, '').replace(/^\*+|\*+$/g, '').trim();
      if (!explain) {
        const paren = block.match(/\(([^()]{8,})\)/);
        explain = paren ? paren[1].trim() : '';
      }

      return {
        question,
        options,
        correctOptionIndex,
        explain,
      };
    })
    .filter((item) => item.question && item.options.length === 4);
}

/**
 * AI Quiz Question Generator Modal:
 * Keeps modal open during generation, previews questions with selection checkboxes,
 * and inserts approved items into CreateQuiz or EditQuiz.
 */
function AiQuizModal({ isOpen = true, closeModal, onAddQuestions }) {
  const [sourceMode, setSourceMode] = useState('preset'); // 'preset' | 'text' | 'image'
  const [selectedCourseId, setSelectedCourseId] = useState('ls10');
  const [selectedLessonId, setSelectedLessonId] = useState('ls10-1');
  const [textContent, setTextContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [selectedIndices, setSelectedIndices] = useState(new Set());

  const coursesWithLessons = useMemo(() => COURSES.filter((c) => c.chapters.length > 0), []);
  const activeCourse = useMemo(
    () => coursesWithLessons.find((c) => c.id === selectedCourseId) || coursesWithLessons[0],
    [coursesWithLessons, selectedCourseId],
  );
  const availableLessons = useMemo(
    () => (activeCourse ? activeCourse.chapters.flatMap((ch) => ch.lessons) : []),
    [activeCourse],
  );
  const activeLesson = useMemo(
    () => availableLessons.find((l) => l.id === selectedLessonId) || availableLessons[0],
    [availableLessons, selectedLessonId],
  );

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const course = coursesWithLessons.find((c) => c.id === courseId);
    const firstLesson = course?.chapters?.[0]?.lessons?.[0];
    setSelectedLessonId(firstLesson ? firstLesson.id : '');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const buildPrompt = (materialText) => {
    const count = Math.min(10, Math.max(1, Number(numQuestions) || 5));
    const baseRules = `Tạo ra đúng ${count} câu hỏi trắc nghiệm bằng tiếng Việt theo chương trình GDPT 2018.
QUAN TRỌNG: KHÔNG dùng cụm từ "tài liệu" hay "theo tài liệu".
Hãy trình bày mỗi câu theo đúng định dạng sau:
Câu hỏi: [Nội dung câu hỏi]
Lựa chọn 1: [Đáp án A]
Lựa chọn 2: [Đáp án B]
Lựa chọn 3: [Đáp án C]
Lựa chọn 4: [Đáp án D]
Lựa chọn đúng: Lựa chọn [1-4]
Giải thích: [Giải thích súc tích, chính xác lịch sử]`;
    return materialText ? `${baseRules}\n\nNội dung nguồn:\n${materialText}` : baseRules;
  };

  const handleGenerate = async () => {
    setErrorMsg('');

    let parts = [];
    if (sourceMode === 'preset') {
      if (!activeLesson) {
        setErrorMsg('Vui lòng chọn môn học và bài học.');
        return;
      }
      const presetBody =
        RICH_PRESET_TEXTS[activeLesson.id] ||
        `${activeCourse.title} - ${activeLesson.title}\n${activeLesson.keyPoints.join('\n')}`;
      parts = [{ text: buildPrompt(presetBody) }];
    } else if (sourceMode === 'text') {
      if (!textContent.trim()) {
        setErrorMsg('Vui lòng nhập hoặc dán nội dung bài học.');
        return;
      }
      parts = [{ text: buildPrompt(textContent.trim()) }];
    } else if (sourceMode === 'image') {
      if (!imageFile || !imagePreview) {
        setErrorMsg('Vui lòng chọn một hình ảnh tài liệu hoặc đề bài.');
        return;
      }
      const base64 = imagePreview.split(',')[1];
      parts = [
        { inline_data: { mime_type: imageFile.type || 'image/jpeg', data: base64 } },
        { text: buildPrompt('') },
      ];
    }

    setIsLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.REACT_APP_API_TOKEN) {
        headers['X-Api-Token'] = process.env.REACT_APP_API_TOKEN;
      }
      const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Dịch vụ AI hiện không phản hồi.');
      }

      const parsed = parseQuizText(data.text);
      if (parsed.length === 0) {
        throw new Error('AI trả về định dạng chưa hợp lệ. Vui lòng thử tạo lại.');
      }

      setGeneratedQuestions(parsed);
      setSelectedIndices(new Set(parsed.map((_, i) => i)));
      toast.success(`AI đã tạo xong ${parsed.length} câu hỏi!`);
    } catch (err) {
      setErrorMsg(
        err.message || 'Không thể kết nối máy chủ AI. Hãy đảm bảo Flask AI API đang chạy.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIndex = (idx) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleInsertSelected = () => {
    const picked = generatedQuestions
      .filter((_, idx) => selectedIndices.has(idx))
      .map((item) => ({
        question: item.question,
        explain: item.explain,
        type: 'multipleChoice',
        options: item.options,
        correctOptionIndex: item.correctOptionIndex,
        aiGenerated: true,
      }));
    if (picked.length === 0) {
      toast.warning('Vui lòng chọn ít nhất 1 câu hỏi để thêm.');
      return;
    }
    onAddQuestions(picked);
    toast.success(`Đã thêm ${picked.length} câu hỏi AI vào bộ Quiz!`);
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Trình tạo câu hỏi Quiz bằng AI" maxWidth="max-w-3xl">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Source mode selector */}
        <div className="grid grid-cols-3 gap-2 bg-heritage-paper p-1.5 rounded-xl border border-heritage-border">
          {[
            { key: 'preset', label: 'Bài học SGK', icon: BookOpen },
            { key: 'text', label: 'Dán văn bản', icon: FileText },
            { key: 'image', label: 'Từ hình ảnh', icon: ImageIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = sourceMode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setSourceMode(tab.key);
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  active ? 'bg-white text-heritage-vermilion shadow-sm' : 'text-heritage-muted hover:text-heritage-ink'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Inputs by source mode */}
        {sourceMode === 'preset' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heritage-muted mb-1.5">
                Môn học
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
              >
                {coursesWithLessons.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.shortTitle}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-heritage-muted mb-1.5">
                Bài học trọng tâm
              </label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
              >
                {availableLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {sourceMode === 'text' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-heritage-muted mb-1.5">
              Dán đoạn văn bản / ghi chú ôn tập
            </label>
            <textarea
              rows={5}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Dán nội dung bài học Lịch Sử hoặc Giáo dục địa phương tại đây..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/40 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
            />
          </div>
        )}

        {sourceMode === 'image' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-heritage-border bg-heritage-cream/40 hover:border-heritage-jade transition-colors cursor-pointer text-center">
              <ImageIcon className="w-7 h-7 text-heritage-jade mb-2" />
              <span className="text-sm font-semibold text-heritage-ink">
                {imageFile ? imageFile.name : 'Chọn ảnh trang sách hoặc tài liệu'}
              </span>
              <span className="text-xs text-heritage-muted mt-0.5">Hỗ trợ PNG, JPG, WEBP</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Xem trước"
                className="max-h-48 mx-auto rounded-xl border border-heritage-border object-contain"
              />
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div className="w-full sm:w-44">
            <label className="block text-xs font-bold uppercase tracking-wider text-heritage-muted mb-1.5">
              Số câu hỏi (1 – 10)
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink"
            />
          </div>

          <Button type="button" variant="secondary" disabled={isLoading} onClick={handleGenerate}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                AI đang biên soạn...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {generatedQuestions.length > 0 ? 'Tạo lại bộ câu hỏi' : 'Bắt đầu tạo câu hỏi'}
              </>
            )}
          </Button>
        </div>

        {errorMsg && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {errorMsg}
          </div>
        )}

        {/* PREVIEW & PICK STEP */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-heritage-border">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-heritage-ink">
                Xem trước câu hỏi ({selectedIndices.size}/{generatedQuestions.length} được chọn)
              </p>
              <button
                type="button"
                onClick={() =>
                  setSelectedIndices(
                    selectedIndices.size === generatedQuestions.length
                      ? new Set()
                      : new Set(generatedQuestions.map((_, i) => i)),
                  )
                }
                className="text-xs font-semibold text-heritage-vermilion hover:underline cursor-pointer"
              >
                {selectedIndices.size === generatedQuestions.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {generatedQuestions.map((q, idx) => {
                const checked = selectedIndices.has(idx);
                return (
                  <div
                    key={idx}
                    onClick={() => toggleIndex(idx)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-heritage-jade bg-heritage-jade-soft/25'
                        : 'border-heritage-border bg-white opacity-70'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="mt-1 h-4 w-4 accent-heritage-jade cursor-pointer"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="neutral">Câu {idx + 1}</Badge>
                          <p className="text-sm font-semibold text-heritage-ink">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                          {q.options.map((opt, optIdx) => (
                            <span
                              key={optIdx}
                              className={`flex items-center gap-1 ${
                                optIdx === q.correctOptionIndex
                                  ? 'text-heritage-jade font-bold'
                                  : 'text-heritage-muted'
                              }`}
                            >
                              {optIdx === q.correctOptionIndex && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                              <span>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </span>
                            </span>
                          ))}
                        </div>
                        {q.explain && <p className="text-xs text-heritage-muted italic">Giải thích: {q.explain}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={closeModal}>
                Đóng
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleInsertSelected}>
                <Plus className="w-4 h-4" />
                Thêm {selectedIndices.size} câu hỏi vào Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AiQuizModal;
