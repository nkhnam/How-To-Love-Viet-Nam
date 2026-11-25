import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Mail, MapPin, Send, Loader2, Compass, BookOpen, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';
import { db } from '../firebase';
import MainLayout from '../layout/MainLayout';
import Breadcrumb from '../ui/Breadcrumb';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';

const TOPICS = ['Góp ý nội dung & Tư liệu', 'Báo lỗi kỹ thuật', 'Hợp tác giáo dục / Trường học', 'Khác'];

function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warning('Vui lòng điền đầy đủ họ tên, email và nội dung liên hệ.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'contacts'), {
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
        createdAt: Timestamp.fromDate(new Date()),
      });
      toast.success('Cảm ơn bạn đã gửi góp ý! Đội ngũ HTLVN sẽ phản hồi sớm nhất.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Error submitting contact form:', err);
      toast.error('Không thể gửi tin nhắn lúc này. Vui lòng thử gửi email trực tiếp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <section className="bg-heritage-paper border-b border-heritage-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <Breadcrumb className="mb-4" items={[{ label: 'Trang chủ', to: '/' }, { label: 'Liên hệ & Góp ý' }]} />
          <Badge variant="gold" className="mb-3">
            Đồng hành cùng dự án STEM HTLVN
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">
            Liên hệ &amp; Góp ý phát triển
          </h1>
          <p className="mt-2 text-heritage-muted text-sm sm:text-base max-w-2xl">
            Mọi đóng góp về tư liệu 34 tỉnh thành, đề Quiz hay tính năng Trợ lý AI đều giúp HTLVN ngày càng hoàn thiện
            hơn cho học sinh Việt Nam.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Heritage Info Card */}
          <Card padding="p-0" className="lg:col-span-5 overflow-hidden bg-stone-950 text-white border-0">
            <div className="relative p-6 sm:p-8 space-y-6">
              <img
                src="/Img/background5.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
              <div className="relative z-10 space-y-6">
                <div>
                  <h2 className="font-serif text-2xl font-bold">Thông tin kết nối</h2>
                  <p className="text-sm text-stone-300 mt-1.5 leading-relaxed">
                    Dự án giáo dục phi lợi nhuận hỗ trợ học sinh THPT học tốt Lịch Sử và Giáo dục Địa phương theo
                    chương trình GDPT 2018.
                  </p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-white/10 shrink-0">
                      <Mail className="w-4 h-4 text-amber-300" />
                    </span>
                    <div>
                      <p className="text-xs text-stone-400">Email liên hệ chính thức</p>
                      <p className="font-semibold text-white">htlvn.stem@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-xl bg-white/10 shrink-0">
                      <MapPin className="w-4 h-4 text-amber-300" />
                    </span>
                    <div>
                      <p className="text-xs text-stone-400">Đơn vị phát triển</p>
                      <p className="font-semibold text-white">TP. Hồ Chí Minh, Việt Nam</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 space-y-2.5 text-xs">
                  <p className="font-bold uppercase tracking-wider text-amber-300">Truy cập nhanh</p>
                  <div className="flex flex-wrap gap-2">
                    <Button to="/provinces" variant="glass" size="sm">
                      <Compass className="w-3.5 h-3.5" />
                      Atlas 34 tỉnh
                    </Button>
                    <Button to="/learn" variant="glass" size="sm">
                      <BookOpen className="w-3.5 h-3.5" />
                      Học tập
                    </Button>
                    <Button to="/ai" variant="glass" size="sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      Trợ lý AI
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Right Form Card */}
          <Card className="lg:col-span-7 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-heritage-ink">Gửi lời nhắn cho chúng mình</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="contact-name">
                    Họ và tên *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="contact-email">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hocsinh@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="contact-topic">
                  Chủ đề
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25"
                >
                  {TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-heritage-ink mb-1.5" htmlFor="contact-msg">
                  Nội dung góp ý *
                </label>
                <textarea
                  id="contact-msg"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Nhập nội dung góp ý, câu hỏi hoặc phản hồi lỗi kỹ thuật..."
                  className="w-full px-4 py-2.5 rounded-xl border border-heritage-border bg-white text-sm text-heritage-ink focus:outline-none focus:ring-2 focus:ring-heritage-vermilion/25 focus:border-heritage-vermilion"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" variant="primary" size="md" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Gửi liên hệ
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}

export default Contact;
