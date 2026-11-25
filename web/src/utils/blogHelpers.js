import DOMPurify from 'dompurify';

export const BLOG_CATEGORIES = [
  'Tất cả',
  'Lịch Sử',
  'GDĐP',
  'Văn hóa & Di sản',
  'Kinh nghiệm học',
];

export const BLOG_WRITABLE_CATEGORIES = BLOG_CATEGORIES.filter((c) => c !== 'Tất cả');

export const DEFAULT_BLOG_COVER = '/Img/background5.jpg';

export function stripHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim();
}

export function estimateReadingTime(bodyHtml, sapoHtml = '') {
  const plain = `${stripHtml(sapoHtml)} ${stripHtml(bodyHtml)}`.trim();
  if (!plain) return 1;
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function toDateObj(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatViDate(ts) {
  const d = toDateObj(ts);
  if (!d) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getBlogDisplayCategory(blog) {
  if (blog?.category && BLOG_WRITABLE_CATEGORIES.includes(blog.category)) {
    return blog.category;
  }
  const text = `${blog?.Title || ''} ${stripHtml(blog?.Sapo || '')}`.toLowerCase();
  if (/(cách mạng|kháng chiến|triều đại|chiến dịch|sử học|lịch sử|1945|1954|1975|văn minh)/.test(text)) {
    return 'Lịch Sử';
  }
  if (/(địa phương|gdđp|tỉnh|thành phố|sài gòn|gia định|hà nội|huế|đà nẵng)/.test(text)) {
    return 'GDĐP';
  }
  if (/(di sản|văn hóa|lễ hội|ẩm thực|kiến trúc|chùa|đình|làng nghề|danh lam)/.test(text)) {
    return 'Văn hóa & Di sản';
  }
  if (/(mẹo|ôn thi|kinh nghiệm|phương pháp|flashcard|sơ đồ)/.test(text)) {
    return 'Kinh nghiệm học';
  }
  return 'Cộng đồng';
}
