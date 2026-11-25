import DOMPurify from 'dompurify';
import { PROVINCES } from '../data/provinces';

export const BLOG_CATEGORIES = [
  'Tất cả',
  'Lịch Sử',
  'GDĐP',
  'Văn hóa & Di sản',
  'Kinh nghiệm học',
];

export const BLOG_WRITABLE_CATEGORIES = BLOG_CATEGORIES.filter((c) => c !== 'Tất cả');

export const DEFAULT_BLOG_COVER = '/Img/background5.jpg';

const CURATED_FALLBACK_COVERS = [
  '/Img/hanoi.jpeg',
  '/Img/hue.jpeg',
  '/Img/danang.jpeg',
  '/Img/dalat.jpeg',
  '/Img/haiphong.jpeg',
  '/Img/tphcm.jpeg',
  '/Img/background3.jpg',
  '/Img/background5.jpg',
  '/Img/background7.jpg',
  '/Img/background9.jpg',
];

const PLACE_ALIAS_COVERS = [
  { keywords: ['vũng tàu', 'côn đảo'], cover: '/Img/VungTau.jpg' },
  { keywords: ['sài gòn', 'tp.hcm', 'tphcm', 'hồ chí minh', 'gia định'], cover: '/Img/tphcm.jpeg' },
  { keywords: ['tây bắc', 'sapa', 'sa pa', 'lào cai', 'fansipan'], cover: '/Img/LaoCai.jpg' },
  { keywords: ['đà lạt', 'lâm đồng', 'tây nguyên'], cover: '/Img/dalat.jpeg' },
  { keywords: ['hội an', 'mỹ sơn', 'quảng nam'], cover: '/Img/QuangNam.jpg' },
  { keywords: ['hạ long', 'quảng ninh', 'yên tử'], cover: '/Img/QuangNinh.jpg' },
  { keywords: ['cố đô', 'huế'], cover: '/Img/hue.jpeg' },
  { keywords: ['hà nội', 'thăng long'], cover: '/Img/hanoi.jpeg' },
  { keywords: ['đà nẵng', 'bà nà'], cover: '/Img/danang.jpeg' },
  { keywords: ['hải phòng', 'cát bà'], cover: '/Img/haiphong.jpeg' },
];

export function stripHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(String(html), { ALLOWED_TAGS: [] })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Selects a relevant, verified local heritage cover image when a blog cover fails
 * (e.g. legacy Firebase Storage HTTP 402 links) or is missing.
 */
export function getSmartBlogFallbackCover(blog) {
  const haystack = `${blog?.Title || ''} ${stripHtml(blog?.Sapo || '')}`.toLowerCase();

  for (const alias of PLACE_ALIAS_COVERS) {
    if (alias.keywords.some((kw) => haystack.includes(kw))) {
      return alias.cover;
    }
  }

  for (const prov of PROVINCES) {
    const provName = (prov.name || '').toLowerCase();
    if (provName && haystack.includes(provName) && prov.coverImage) {
      return prov.coverImage;
    }
    for (const sub of prov.constituents || []) {
      const subName = (sub.name || '').toLowerCase();
      if (subName && haystack.includes(subName) && sub.coverImage) {
        return sub.coverImage;
      }
    }
  }

  const seed = String(blog?.id || blog?.Title || 'htlvn');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return CURATED_FALLBACK_COVERS[hash % CURATED_FALLBACK_COVERS.length];
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
