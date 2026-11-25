import React, { useState, useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  History,
  MessageSquarePlus,
  RotateCcw,
  BookOpen,
  User,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth } from '../firebase';
import { askRagChat, fetchChatHistory } from '../../utils/aiApi';
import Button from '../ui/Button';
import Card from '../ui/Card';

const md = new MarkdownIt({ breaks: true, linkify: true });

const SUGGESTED_GROUPS = [
  {
    group: 'Lịch Sử 10 & 11',
    prompts: [
      'Phân biệt hiện thực lịch sử và nhận thức lịch sử.',
      'Vì sao Xiêm giữ được độc lập trước thực dân phương Tây?',
    ],
  },
  {
    group: 'Lịch Sử 12 · Ôn thi THPT',
    prompts: [
      'Nguyên nhân thắng lợi và ý nghĩa của Cách mạng tháng Tám 1945.',
      'So sánh Chiến dịch Điện Biên Phủ 1954 và Chiến dịch Hồ Chí Minh 1975.',
    ],
  },
  {
    group: 'Giáo dục Địa phương',
    prompts: [
      'Giới thiệu vai trò của danh nhân Võ Trường Toản với vùng đất Gia Định.',
      'Nêu những nét đặc trưng của Đờn ca tài tử Nam Bộ.',
    ],
  },
];

/**
 * Tab 1: Two-column RAG Chatbot wired to Flask /ask and /history/<uid>.
 */
function AiRagChat({ initialQuestion = '', onClearInitialQuestion }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput] = useState(initialQuestion);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const listRef = useRef(null);

  useEffect(() => {
    if (initialQuestion) {
      setInput(initialQuestion);
    }
  }, [initialQuestion]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setHistoryList([]);
        return;
      }
      setLoadingHistory(true);
      try {
        const items = await fetchChatHistory(currentUser.uid);
        setHistoryList(items);
      } catch {
        // Ignore gracefully when AI server is offline
      } finally {
        setLoadingHistory(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, sending]);

  const sendQuestion = async (rawText) => {
    const question = (rawText ?? input).trim();
    if (!question || sending) return;

    const userMsgId = `u_${Date.now()}`;
    setMessages((prev) => [...prev, { id: userMsgId, sender: 'user', text: question }]);
    if (!rawText) setInput('');
    if (onClearInitialQuestion) onClearInitialQuestion();

    setSending(true);
    try {
      const reply = await askRagChat(question, user?.uid);
      const botMsgId = `b_${Date.now()}`;
      setMessages((prev) => [...prev, { id: botMsgId, sender: 'bot', text: reply, questionRef: question }]);

      if (user?.uid) {
        setHistoryList((prev) => [{ question, reply, timestamp: Date.now() }, ...prev]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e_${Date.now()}`,
          sender: 'error',
          text: err.message || 'Không thể kết nối máy chủ AI. Hãy kiểm tra lại Flask AI API.',
          questionRef: question,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Đã sao chép câu trả lời');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Không thể sao chép vào khay nhớ tạm');
    }
  };

  const loadHistoryPair = (item) => {
    setMessages([
      { id: `hu_${item.timestamp || Math.random()}`, sender: 'user', text: item.question },
      { id: `hb_${item.timestamp || Math.random()}`, sender: 'bot', text: item.reply, questionRef: item.question },
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT SIDEBAR: New chat, History & Suggested Prompts */}
      <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
        <Card padding="p-4" className="space-y-4">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center"
            onClick={() => setMessages([])}
          >
            <MessageSquarePlus className="w-4 h-4" />
            Cuộc trò chuyện mới
          </Button>

          {/* Suggested Prompts */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-heritage-muted flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-heritage-vermilion" />
              Gợi ý câu hỏi nhanh
            </p>
            <div className="space-y-3">
              {SUGGESTED_GROUPS.map((grp) => (
                <div key={grp.group} className="space-y-1.5">
                  <p className="text-[11px] font-bold text-heritage-jade">{grp.group}</p>
                  {grp.prompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => sendQuestion(p)}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-heritage-ink bg-heritage-paper/70 hover:bg-heritage-vermilion-soft hover:text-heritage-vermilion border border-transparent hover:border-red-200 transition-colors cursor-pointer leading-relaxed"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* History section */}
          <div className="pt-3 border-t border-heritage-border space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-heritage-muted flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-heritage-gold" />
              Lịch sử hỏi đáp
            </p>
            {!user ? (
              <p className="text-xs text-heritage-muted leading-relaxed">
                Đăng nhập để tự động lưu và xem lại lịch sử trò chuyện với Trợ lý AI.
              </p>
            ) : loadingHistory ? (
              <p className="text-xs text-heritage-muted">Đang tải lịch sử...</p>
            ) : historyList.length === 0 ? (
              <p className="text-xs text-heritage-muted">Chưa có câu hỏi nào được lưu.</p>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                {historyList.slice(0, 15).map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadHistoryPair(item)}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-heritage-ink hover:bg-heritage-paper transition-colors truncate cursor-pointer border border-heritage-border/50"
                    title={item.question}
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>
      </aside>

      {/* RIGHT MAIN CHAT PANE */}
      <Card padding="p-0" className="lg:col-span-8 xl:col-span-9 flex flex-col h-[640px] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-heritage-border bg-heritage-paper/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-heritage-jade text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-heritage-ink">Trợ lý AI RAG Lịch Sử &amp; GDĐP</h2>
              <p className="text-xs text-heritage-muted">Trả lời dựa trên kho tri thức SGK kết hợp Gemini</p>
            </div>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-heritage-cream/40">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3 py-8">
              <div className="w-14 h-14 rounded-2xl bg-heritage-jade-soft text-heritage-jade flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-heritage-ink">
                Bạn muốn ôn tập sự kiện hoặc địa danh nào?
              </h3>
              <p className="text-sm text-heritage-muted leading-relaxed">
                Đặt câu hỏi về diễn biến chiến dịch, ý nghĩa lịch sử, so sánh sự kiện hoặc chọn một gợi ý ở cột bên
                trái để bắt đầu.
              </p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} className="flex justify-end items-start gap-2.5">
                  <div className="max-w-[82%] rounded-2xl rounded-tr-sm bg-heritage-vermilion text-white px-4 py-3 text-sm leading-relaxed shadow-sm whitespace-pre-wrap">
                    {msg.text}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-heritage-paper border border-heritage-border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-heritage-ink" />
                  </div>
                </div>
              );
            }

            if (msg.sender === 'error') {
              return (
                <div key={msg.id} className="flex justify-start items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-tl-sm bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 space-y-2">
                    <p>{msg.text}</p>
                    {msg.questionRef && (
                      <button
                        type="button"
                        onClick={() => sendQuestion(msg.questionRef)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Thử gửi lại
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            const renderedHtml = DOMPurify.sanitize(md.render(msg.text || ''));
            return (
              <div key={msg.id} className="flex justify-start items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-heritage-jade text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] space-y-1.5">
                  <div
                    className="rounded-2xl rounded-tl-sm bg-white border border-heritage-border px-4 py-3 text-sm text-heritage-ink leading-relaxed shadow-sm space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-bold [&_p]:mb-1.5 last:[&_p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                  <div className="flex items-center gap-3 px-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-heritage-muted hover:text-heritage-ink cursor-pointer"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-heritage-jade" />
                          Đã sao chép
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Sao chép
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-heritage-jade text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="rounded-2xl bg-white border border-heritage-border px-4 py-3 text-sm text-heritage-muted">
                Trợ lý AI đang tra cứu tri thức SGK...
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuestion();
          }}
          className="p-3 sm:p-4 border-t border-heritage-border bg-white flex items-end gap-2.5"
        >
          <textarea
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi Lịch Sử hoặc GDĐP... (Enter để gửi, Shift+Enter xuống dòng)"
            className="flex-1 resize-none px-4 py-2.5 rounded-xl border border-heritage-border bg-heritage-cream/50 text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-jade/25 focus:border-heritage-jade"
          />
          <Button type="submit" variant="secondary" size="md" disabled={sending || !input.trim()} className="shrink-0">
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AiRagChat;
