import React, { useState, useEffect, useCallback } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import {
  ImagePlus,
  Upload,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Maximize2,
  Trash2,
  ClipboardPaste,
  MessageSquareText,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { generateWithAi } from '../../utils/aiApi';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

const md = new MarkdownIt({ breaks: true, linkify: true });

const SOLVE_MODES = [
  {
    key: 'homework',
    label: 'Giải bài tập từ ảnh',
    prompt:
      'Sử dụng tiếng Việt để trả lời, chia rõ 2 phần: (1) Đáp án đúng và (2) Giải thích chi tiết, dễ hiểu. Chỉ giải thích câu trả lời đúng; nếu ảnh không chứa câu hỏi thì phản hồi rõ ràng rằng chưa thấy câu hỏi trong ảnh. Chỉ giải các câu hỏi về Lịch Sử và Giáo dục địa phương Việt Nam.',
  },
  {
    key: 'landmark',
    label: 'Nhận diện di tích / địa danh',
    prompt:
      'Hãy phân tích bức ảnh này bằng tiếng Việt và cho biết: 1) Tên di tích lịch sử hoặc địa danh trong ảnh, 2) Thuộc tỉnh/thành nào ở Việt Nam, 3) Ý nghĩa lịch sử – văn hóa nổi bật.',
  },
];

/**
 * Tab 2: Side-by-side Image Homework Solver & Landmark Analyzer
 * Supports drag-drop upload, click browse, AND Ctrl+V clipboard paste with immediate split preview.
 */
function AiHomeworkSolver({ onAskFollowUp }) {
  const [modeKey, setModeKey] = useState('homework');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [extraNote, setExtraNote] = useState('');
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const loadSelectedFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP).');
      return;
    }
    setFile(selected);
    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(selected);
  }, []);

  // Ctrl+V paste support
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const pastedFile = item.getAsFile();
          if (pastedFile) {
            loadSelectedFile(pastedFile);
            toast.info('Đã dán ảnh từ khay nhớ tạm!');
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [loadSelectedFile]);

  const handleAnalyze = async () => {
    if (!file || !previewUrl) {
      toast.warning('Hãy tải lên hoặc dán ảnh câu hỏi trước.');
      return;
    }

    const modeObj = SOLVE_MODES.find((m) => m.key === modeKey) || SOLVE_MODES[0];
    const prompt = extraNote.trim()
      ? `${modeObj.prompt}\nYêu cầu bổ sung của học sinh: ${extraNote.trim()}`
      : modeObj.prompt;

    const base64 = previewUrl.split(',')[1];
    setLoading(true);
    setErrorMsg('');
    setResultText('');

    try {
      const text = await generateWithAi({
        parts: [
          { inline_data: { mime_type: file.type || 'image/jpeg', data: base64 } },
          { text: prompt },
        ],
      });
      setResultText(text);
    } catch (err) {
      setErrorMsg(err.message || 'Không thể kết nối dịch vụ AI để phân tích ảnh.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!resultText) return;
    try {
      await navigator.clipboard.writeText(resultText);
      setCopied(true);
      toast.success('Đã sao chép lời giải');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const renderedHtml = resultText ? DOMPurify.sanitize(md.render(resultText)) : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Image Dropzone / Preview & Controls */}
      <Card className="lg:col-span-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {SOLVE_MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setModeKey(m.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                modeKey === m.key
                  ? 'bg-heritage-vermilion text-white'
                  : 'bg-heritage-paper text-heritage-muted hover:text-heritage-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!previewUrl ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              loadSelectedFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col items-center justify-center min-h-[260px] p-6 rounded-2xl border-2 border-dashed transition-colors cursor-pointer text-center ${
              isDragging
                ? 'border-heritage-vermilion bg-heritage-vermilion-soft/40'
                : 'border-heritage-border bg-heritage-cream/50 hover:border-heritage-jade'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-heritage-jade-soft text-heritage-jade flex items-center justify-center mb-3">
              <ImagePlus className="w-6 h-6" />
            </div>
            <p className="font-semibold text-sm text-heritage-ink">
              Kéo thả ảnh, chọn tệp hoặc nhấn <kbd className="px-1.5 py-0.5 rounded bg-white border text-xs">Ctrl+V</kbd>
            </p>
            <p className="text-xs text-heritage-muted mt-1">Ảnh chụp đề trắc nghiệm, câu tự luận hoặc ảnh di tích</p>
            <span className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-heritage-border text-xs font-semibold text-heritage-ink shadow-sm">
              <Upload className="w-3.5 h-3.5" />
              Chọn hình ảnh từ máy
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => loadSelectedFile(e.target.files?.[0])}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-2xl border border-heritage-border bg-stone-950/5 overflow-hidden group">
              <img
                src={previewUrl}
                alt="Ảnh đề bài"
                onClick={() => setZoomOpen(true)}
                className="w-full max-h-[320px] object-contain cursor-zoom-in mx-auto"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="Phóng to ảnh"
                  className="p-2 rounded-lg bg-stone-900/75 text-white hover:bg-stone-900 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl('');
                    setResultText('');
                    setErrorMsg('');
                  }}
                  aria-label="Xóa ảnh"
                  className="p-2 rounded-lg bg-red-600/90 text-white hover:bg-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-heritage-muted">
              <span className="truncate">{file?.name || 'Ảnh đã dán'}</span>
              <label className="font-semibold text-heritage-vermilion hover:underline cursor-pointer shrink-0">
                Đổi ảnh khác
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => loadSelectedFile(e.target.files?.[0])}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-heritage-muted mb-1">
            Ghi chú thêm cho AI (tùy chọn)
          </label>
          <input
            type="text"
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="Ví dụ: Chỉ rõ đáp án câu 3 và giải thích ngắn gọn"
            className="w-full px-3.5 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
          />
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          disabled={!file || loading}
          onClick={handleAnalyze}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI đang phân tích hình ảnh...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Phân tích &amp; Hiển thị lời giải
            </>
          )}
        </Button>

        <p className="text-xs text-heritage-muted flex items-center gap-1.5">
          <ClipboardPaste className="w-3.5 h-3.5 text-heritage-jade shrink-0" />
          <span>Mẹo: Chụp màn hình đề thi rồi nhấn Ctrl+V ngay tại đây.</span>
        </p>
      </Card>

      {/* RIGHT COLUMN: Immediate Rendered Solution */}
      <Card className="lg:col-span-7 min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-heritage-border pb-3">
            <div className="flex items-center gap-2">
              <Badge variant="jade">Kết quả AI</Badge>
              <h3 className="font-serif text-lg font-bold text-heritage-ink">Lời giải &amp; Giải thích</h3>
            </div>
            {resultText && (
              <Button type="button" variant="outline" size="sm" onClick={handleCopyResult}>
                {copied ? <Check className="w-3.5 h-3.5 text-heritage-jade" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Đã sao chép' : 'Sao chép'}
              </Button>
            )}
          </div>

          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-heritage-vermilion mx-auto" />
              <p className="text-sm font-medium text-heritage-ink">Đang đọc chữ và phân tích câu hỏi từ ảnh...</p>
              <p className="text-xs text-heritage-muted">Quá trình thường mất khoảng 3–8 giây</p>
            </div>
          ) : errorMsg ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{errorMsg}</div>
          ) : renderedHtml ? (
            <div
              className="text-sm sm:text-base text-heritage-ink leading-relaxed space-y-2.5 [&_h1]:font-serif [&_h1]:text-xl [&_h1]:font-bold [&_h2]:font-serif [&_h2]:text-lg [&_h2]:font-bold [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-heritage-ink"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          ) : (
            <div className="py-16 text-center max-w-md mx-auto space-y-2">
              <Sparkles className="w-8 h-8 text-heritage-gold mx-auto" />
              <p className="font-semibold text-base text-heritage-ink">Chưa có kết quả phân tích</p>
              <p className="text-sm text-heritage-muted">
                Tải ảnh bài tập ở khung bên trái rồi nhấn &ldquo;Phân tích &amp; Hiển thị lời giải&rdquo; để xem đáp
                án trực tiếp ngay tại đây.
              </p>
            </div>
          )}
        </div>

        {resultText && onAskFollowUp && (
          <div className="pt-3 border-t border-heritage-border flex items-center justify-between gap-3">
            <span className="text-xs text-heritage-muted">Muốn đào sâu thêm kiến thức liên quan?</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                onAskFollowUp(`Giải thích mở rộng kiến thức lịch sử liên quan đến lời giải sau:\n${resultText.slice(0, 450)}`)
              }
            >
              <MessageSquareText className="w-4 h-4" />
              Hỏi tiếp trong Chat AI
            </Button>
          </div>
        )}
      </Card>

      <Modal isOpen={zoomOpen} onClose={() => setZoomOpen(false)} title="Xem ảnh phóng to" maxWidth="max-w-4xl">
        <div className="p-4 bg-stone-950 flex items-center justify-center">
          <img src={previewUrl} alt="Ảnh đề bài phóng to" className="max-h-[75vh] object-contain" />
        </div>
      </Modal>
    </div>
  );
}

export default AiHomeworkSolver;
