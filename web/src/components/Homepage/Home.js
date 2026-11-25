import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Map,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Compass,
  BookOpen,
  Smartphone,
  Award,
  CheckCircle2,
} from 'lucide-react';
import MainLayout from '../layout/MainLayout';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import FlipCard3D from '../provinces/FlipCard3D';

const STATS = [
  { value: '34', label: 'Tỉnh, Thành phố Việt Nam', sub: 'Cập nhật theo NQ 202/2025/QH15' },
  { value: '100+', label: 'Thẻ Flashcard 3D', sub: 'Danh lam & Di tích lịch sử' },
  { value: '6', label: 'Khóa học THPT', sub: 'Lịch Sử & GDĐP lớp 10–12' },
  { value: '24/7', label: 'Trợ lý AI Học tập', sub: 'RAG SGK & Giải bài từ ảnh' },
];

const FEATURED_PROVINCES = [
  {
    name: 'Hà Nội',
    subtitle: 'Thủ đô ngàn năm văn hiến',
    region: 'Miền Bắc',
    image: '/Img/hanoi.jpeg',
    to: '/provinces/ha-noi',
    gridClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'TP. Hồ Chí Minh',
    subtitle: 'Siêu đô thị năng động phương Nam',
    region: 'Miền Nam',
    image: '/Img/tphcm.jpeg',
    to: '/provinces/tp-hcm',
    gridClass: 'md:col-span-1 lg:col-span-1 lg:row-span-2',
  },
  {
    name: 'TP. Huế',
    subtitle: 'Cố đô di sản triều Nguyễn',
    region: 'Miền Trung',
    image: '/Img/hue.jpeg',
    to: '/provinces/hue',
    gridClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'Lâm Đồng',
    subtitle: 'Tây Nguyên & Duyên hải kết nối',
    region: 'Miền Trung',
    image: '/Img/dalat.jpeg',
    to: '/provinces/lam-dong',
    gridClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'TP. Hải Phòng',
    subtitle: 'Thành phố cảng hoa phượng đỏ',
    region: 'Miền Bắc',
    image: '/Img/haiphong.jpeg',
    to: '/provinces/hai-phong',
    gridClass: 'md:col-span-1 lg:col-span-1',
  },
  {
    name: 'TP. Đà Nẵng',
    subtitle: 'Nhịp cầu di sản miền Trung',
    region: 'Miền Trung',
    image: '/Img/danang.jpeg',
    to: '/provinces/da-nang',
    gridClass: 'md:col-span-1 lg:col-span-2',
  },
];

const ECOSYSTEM_PILLARS = [
  {
    icon: Map,
    color: 'bg-heritage-vermilion-soft text-heritage-vermilion',
    title: 'Atlas 34 Tỉnh thành & Góc nhìn 360°',
    desc: 'Khám phá trực quan 34 tỉnh, thành phố mới qua bản đồ SVG tương tác, thông tin văn hóa – lịch sử và không gian 360 độ.',
    to: '/provinces',
    cta: 'Mở bản đồ',
  },
  {
    icon: Layers,
    color: 'bg-heritage-gold-soft text-amber-800',
    title: 'Flashcard 3D & Hộ chiếu Di sản',
    desc: 'Lật thẻ hai mặt Danh lam thắng cảnh và Di tích lịch sử, đánh dấu ghi nhớ và sưu tầm huy hiệu 34 tỉnh thành.',
    to: '/provinces/ha-noi?tab=flashcards',
    cta: 'Thử lật thẻ',
  },
  {
    icon: GraduationCap,
    color: 'bg-heritage-jade-soft text-heritage-jade',
    title: 'E-learning & Quiz GDPT 2018',
    desc: 'Hệ thống bài giảng, luyện tập chuyên đề và kho đề trắc nghiệm lớp 10, 11, 12 giúp củng cố kiến thức nhanh chóng.',
    to: '/learn',
    cta: 'Vào học ngay',
  },
  {
    icon: Sparkles,
    color: 'bg-stone-100 text-heritage-ink',
    title: 'Trợ lý AI Lịch Sử & GDĐP',
    desc: 'Hỏi đáp theo nguồn SGK với RAG Chatbot và chụp ảnh bài tập để nhận lời giải kèm giải thích súc tích.',
    to: '/ai',
    cta: 'Hỏi Trợ lý AI',
  },
];

const PREVIEW_CARDS = [
  {
    id: 'hanoi-dltc-1',
    province: 'Hà Nội',
    category: 'Danh lam thắng cảnh',
    front: '/Img/HaNoi/DLTC-1-front.png',
    back: '/Img/HaNoi/DLTC-1-back.png',
    to: '/provinces/ha-noi?tab=flashcards',
  },
  {
    id: 'hue-dltc-1',
    province: 'TP. Huế',
    category: 'Danh lam thắng cảnh',
    front: '/Img/ThuaThienHue/DLTC-1-front.png',
    back: '/Img/ThuaThienHue/DLTC-1-back.png',
    to: '/provinces/hue?tab=flashcards',
  },
  {
    id: 'tphcm-dltc-1',
    province: 'TP. Hồ Chí Minh',
    category: 'Danh lam thắng cảnh',
    front: '/Img/TPHCM/DLTC-1-front.png',
    back: '/Img/TPHCM/DLTC-1-back.png',
    to: '/provinces/tp-hcm?tab=flashcards',
  },
];

const FAQ_DATA = [
  {
    question: 'Đây có phải là bộ sản phẩm tính phí và mục đích thực hiện là gì?',
    answer:
      'HTLVN (How To Love Vietnam) là bộ sản phẩm giáo dục hoàn toàn miễn phí, được thiết kế để nâng cao hứng thú và chất lượng học tập hai bộ môn Lịch Sử và Giáo dục Địa phương (GDĐP) theo chương trình GDPT 2018. Dự án giúp học sinh nắm vững kiến thức trọng tâm, hiểu sâu giá trị truyền thống và bản sắc văn hóa dân tộc.',
  },
  {
    question: 'Bộ sản phẩm này bao gồm những tính năng và tiện ích gì?',
    answer:
      'HTLVN kết hợp đa nền tảng gồm Website, Ứng dụng di động và hơn 100 thẻ Flashcards vật lý/3D tích hợp AI. Trên website, người học có thể khám phá Atlas 34 tỉnh thành mới sau sáp nhập, xem góc nhìn 360°, học bài giảng E-learning, làm Quiz trắc nghiệm và sử dụng AI Chatbot / giải bài tập từ hình ảnh.',
  },
  {
    question: 'Ngoài mục đích giáo dục, bộ sản phẩm còn hướng tới giá trị gì?',
    answer:
      'Bên cạnh hỗ trợ học tập và giảng dạy Lịch Sử – GDĐP, đội ngũ thực hiện mong muốn quảng bá vẻ đẹp thiên nhiên, di tích lịch sử và các lễ hội truyền thống đặc sắc của từng vùng miền Việt Nam đến cộng đồng và bạn bè quốc tế.',
  },
  {
    question: 'Đối tượng nào có thể sử dụng HTLVN?',
    answer:
      'Sản phẩm hướng đến học sinh, sinh viên đang ôn tập Lịch Sử và GDĐP trên lớp cũng như mọi cá nhân yêu thích khám phá văn hóa, kiến trúc và chiều sâu lịch sử trải dài 34 tỉnh, thành phố Việt Nam.',
  },
];

function Home() {
  const [activeFaq, setActiveFaq] = useState(0);

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  return (
    <MainLayout transparentNavbar>
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-stone-950 text-white pt-[72px] pb-24">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/Img/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover motion-reduce:hidden"
        >
          <source src="/Img/hero-vietnam.mp4" type="video/mp4" />
        </video>
        <img
          src="/Img/hero-poster.jpg"
          alt=""
          className="hidden motion-reduce:block absolute inset-0 w-full h-full object-cover"
        />

        {/* Warm dark scrim for strong text contrast */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-stone-950/75 via-stone-950/45 to-stone-950/85"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-12">
          <Badge variant="glass" className="mb-6 px-3.5 py-1.5 text-xs sm:text-sm">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            Dự án STEM Giáo dục · Chương trình GDPT 2018
          </Badge>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] text-white drop-shadow-sm">
            Học <span className="text-amber-300">Lịch Sử</span> &amp;{' '}
            <span className="text-amber-300">GDĐP</span> qua hành trình{' '}
            <span className="underline decoration-heritage-vermilion decoration-4 underline-offset-8">
              34 Tỉnh thành
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-stone-200 max-w-3xl mx-auto leading-relaxed font-normal">
            Khám phá di sản Việt Nam ngay tại nhà với hơn{' '}
            <strong className="text-white font-semibold">100 thẻ Flashcard 3D</strong>, bản đồ tương tác{' '}
            <strong className="text-white font-semibold">34 tỉnh, thành phố</strong>, kho bài giảng E-learning và{' '}
            <strong className="text-white font-semibold">Trợ lý AI chuyên sâu</strong>.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Button to="/provinces" variant="primary" size="lg">
              <Compass className="w-5 h-5" />
              Khám phá 34 Tỉnh thành
            </Button>
            <Button to="/ai" variant="glass" size="lg">
              <Sparkles className="w-5 h-5 text-amber-300" />
              Học cùng Trợ lý AI
            </Button>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 -mt-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white rounded-2xl border border-heritage-border shadow-card p-5 sm:p-6">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left px-2 py-1">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-heritage-vermilion">{stat.value}</p>
              <p className="text-sm font-bold text-heritage-ink mt-0.5">{stat.label}</p>
              <p className="text-xs text-heritage-muted mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2. BENTO GRID: FEATURED PROVINCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <Badge variant="vermilion" className="mb-3">
              Bản sắc Việt Nam
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
              Nhìn ngắm nét đặc trưng văn hóa &amp; kiến trúc đất nước
            </h2>
            <p className="mt-3 text-heritage-muted text-base sm:text-lg leading-relaxed">
              Trải dài 34 tỉnh, thành phố từ Bắc vào Nam, mỗi vùng đất đều lưu giữ những di tích lịch sử hào hùng và
              danh lam thắng cảnh đặc sắc.
            </p>
          </div>
          <Button to="/provinces" variant="outline" className="shrink-0 self-start md:self-auto">
            Xem tất cả 34 tỉnh thành
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-4 lg:h-[540px]">
          {FEATURED_PROVINCES.map((item) => (
            <Link
              key={item.name}
              to={item.to}
              className={`group relative rounded-2xl overflow-hidden bg-stone-900 min-h-[240px] lg:min-h-0 flex items-end shadow-card ${item.gridClass}`}
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent"
                aria-hidden="true"
              />
              <div className="relative z-10 w-full p-5 flex items-end justify-between gap-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-amber-200 text-[11px] font-semibold mb-2">
                    {item.region}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-stone-200/90 mt-0.5">{item.subtitle}</p>
                </div>
                <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm text-white flex items-center justify-center shrink-0 group-hover:bg-heritage-vermilion transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. LEARNING ECOSYSTEM */}
      <section className="bg-heritage-paper border-y border-heritage-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="gold" className="mb-3">
              Tại sao chọn HTLVN?
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">
              Hệ sinh thái học tập Lịch Sử &amp; GDĐP toàn diện
            </h2>
            <p className="mt-3 text-heritage-muted text-base sm:text-lg">
              Kết hợp tư liệu chuẩn chương trình GDPT 2018 với trải nghiệm tương tác trực quan, giúp ghi nhớ sâu và
              hứng thú hơn mỗi ngày.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ECOSYSTEM_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} hover className="flex flex-col justify-between">
                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${pillar.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-heritage-ink mb-2">{pillar.title}</h3>
                    <p className="text-sm text-heritage-muted leading-relaxed">{pillar.desc}</p>
                  </div>
                  <Link
                    to={pillar.to}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-heritage-vermilion hover:text-heritage-vermilion-dark transition-colors"
                  >
                    <span>{pillar.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE 3D FLASHCARD PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-5">
            <Badge variant="gold">Trải nghiệm ngay</Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
              Học qua <span className="text-heritage-vermilion">Flashcard 3D</span> hai mặt sinh động
            </h2>
            <p className="text-heritage-muted text-base leading-relaxed">
              Mỗi tỉnh thành đi kèm bộ thẻ Danh lam thắng cảnh và Di tích lịch sử thiết kế trực quan. Chạm vào từng
              thẻ bên cạnh để tự kiểm tra trí nhớ (Active Recall) trước khi lật xem nội dung chi tiết.
            </p>
            <ul className="space-y-2.5 text-sm text-heritage-ink">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-heritage-jade shrink-0" />
                <span>Hơn 100 thẻ phủ khắp 34 tỉnh thành Bắc – Trung – Nam</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-heritage-jade shrink-0" />
                <span>Chế độ ôn tập có đánh dấu &ldquo;Đã thuộc / Cần ôn lại&rdquo;</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-heritage-jade shrink-0" />
                <span>Đồng bộ với Hộ chiếu Khám phá Việt Nam</span>
              </li>
            </ul>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button to="/provinces/ha-noi?tab=flashcards" variant="primary">
                Học bộ thẻ Hà Nội
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button to="/provinces" variant="outline">
                Chọn tỉnh khác
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PREVIEW_CARDS.map((card) => (
              <div key={card.id} className="space-y-2.5">
                <FlipCard3D
                  frontImage={card.front}
                  backImage={card.back}
                  title={`${card.province} - ${card.category}`}
                  categoryLabel={card.province}
                />
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-medium text-heritage-muted">{card.category}</span>
                  <Link
                    to={card.to}
                    className="text-xs font-semibold text-heritage-vermilion hover:underline inline-flex items-center gap-1"
                  >
                    Xem tỉnh
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WEB & APP SHOWCASE */}
      <section className="bg-white border-y border-heritage-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl overflow-hidden bg-heritage-paper border border-heritage-border p-4 shadow-card">
              <img
                src="/Img/demowebapp.png"
                alt="Giao diện Website và Ứng dụng di động HTLVN"
                loading="lazy"
                className="w-full h-auto rounded-xl object-contain"
              />
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2 space-y-5">
            <Badge variant="jade">
              <Smartphone className="w-3.5 h-3.5" />
              Đa nền tảng Web &amp; App
            </Badge>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink leading-tight">
              Tự học, kiểm tra và ôn luyện mọi lúc mọi nơi
            </h2>
            <p className="text-heritage-muted text-base leading-relaxed">
              Website và ứng dụng di động HTLVN đồng bộ cùng hệ thống AI API giúp học sinh dễ dàng tra cứu tư liệu,
              làm đề trắc nghiệm tương tác và chia sẻ bài viết cùng cộng đồng học tập.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button to="/learn" variant="secondary">
                <BookOpen className="w-4 h-4" />
                Khám phá bài giảng
              </Button>
              <Button to="/listquiz" variant="outline">
                Làm Quiz trắc nghiệm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-10">
          <Badge variant="neutral" className="mb-3">
            Giải đáp nhanh
          </Badge>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-heritage-ink">Câu hỏi thường gặp</h2>
        </div>

        <div className="space-y-3">
          {FAQ_DATA.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-colors bg-white ${
                  isOpen ? 'border-heritage-gold shadow-sm' : 'border-heritage-border'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  <span className="font-semibold text-base sm:text-lg text-heritage-ink">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-heritage-muted shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-heritage-vermilion' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm sm:text-base text-heritage-muted leading-relaxed border-t border-heritage-border/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </MainLayout>
  );
}

export default Home;
