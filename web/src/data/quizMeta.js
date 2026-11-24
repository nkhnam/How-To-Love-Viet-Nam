/**
 * Shared metadata, cover mapping, and date helpers for HTLVN Quizzes.
 */
export const QUIZ_CATEGORIES = [
  {
    key: 'all',
    label: 'Tất cả môn',
    shortLabel: 'Tất cả',
    cover: '/Img/ls10.png',
    badgeVariant: 'neutral',
  },
  {
    key: 'ls10',
    label: 'Lịch Sử 10',
    shortLabel: 'Lịch Sử 10',
    cover: '/Img/ls10.png',
    badgeVariant: 'vermilion',
  },
  {
    key: 'ls11',
    label: 'Lịch Sử 11',
    shortLabel: 'Lịch Sử 11',
    cover: '/Img/ls11.png',
    badgeVariant: 'vermilion',
  },
  {
    key: 'ls12',
    label: 'Lịch Sử 12',
    shortLabel: 'Lịch Sử 12',
    cover: '/Img/ls12.png',
    badgeVariant: 'vermilion',
  },
  {
    key: 'dp10',
    label: 'Giáo dục địa phương 10',
    shortLabel: 'GDĐP 10',
    cover: '/Img/dp10.png',
    badgeVariant: 'jade',
  },
  {
    key: 'dp11',
    label: 'Giáo dục địa phương 11',
    shortLabel: 'GDĐP 11',
    cover: '/Img/dp11.png',
    badgeVariant: 'jade',
  },
  {
    key: 'dp12',
    label: 'Giáo dục địa phương 12',
    shortLabel: 'GDĐP 12',
    cover: '/Img/elearning/thumb-6.png',
    badgeVariant: 'jade',
  },
];

export const QUIZ_META_BY_TYPE = QUIZ_CATEGORIES.reduce((acc, item) => {
  acc[item.key] = item;
  return acc;
}, {});

export function getQuizMeta(type) {
  return QUIZ_META_BY_TYPE[type] || {
    key: type || 'all',
    label: 'Kiến thức tổng hợp',
    shortLabel: 'Tổng hợp',
    cover: '/Img/ls10.png',
    badgeVariant: 'gold',
  };
}

export function getQuizCover(type) {
  return getQuizMeta(type).cover;
}

export function formatRelativeTimeVi(timestamp) {
  if (!timestamp) return '';
  let dateObj = null;
  if (typeof timestamp.toDate === 'function') {
    dateObj = timestamp.toDate();
  } else if (typeof timestamp.seconds === 'number') {
    dateObj = new Date(timestamp.seconds * 1000);
  } else {
    dateObj = new Date(timestamp);
  }
  if (!dateObj || Number.isNaN(dateObj.getTime())) return '';

  const seconds = Math.max(0, Math.floor((Date.now() - dateObj.getTime()) / 1000));
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} tháng trước`;
  const years = Math.floor(months / 12);
  return `${years} năm trước`;
}
