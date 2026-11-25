import { API_URL } from '../config';

function buildHeaders(extra = {}) {
  const headers = { ...extra };
  if (process.env.REACT_APP_API_TOKEN) {
    headers['X-Api-Token'] = process.env.REACT_APP_API_TOKEN;
  }
  return headers;
}

export async function checkAiHealth() {
  const res = await fetch(`${API_URL}/health`, {
    method: 'GET',
    headers: buildHeaders({ Accept: 'application/json' }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function askRagChat(question, userId) {
  const body = { question };
  if (userId) body.user_id = userId;

  const res = await fetch(`${API_URL}/ask`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Dịch vụ RAG AI hiện không phản hồi.');
  }
  return data.reply || '';
}

export async function fetchChatHistory(userId) {
  if (!userId) return [];
  const res = await fetch(`${API_URL}/history/${encodeURIComponent(userId)}`, {
    method: 'GET',
    headers: buildHeaders({ Accept: 'application/json' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Không thể tải lịch sử hội thoại.');
  }
  return Array.isArray(data.history) ? data.history : [];
}

export async function generateWithAi(payload) {
  const res = await fetch(`${API_URL}/generate`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Không thể xử lý yêu cầu bằng AI.');
  }
  return data.text || '';
}

export async function uploadMindmapPdf(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/mindmap/upload`, {
    method: 'POST',
    headers: buildHeaders({ Accept: 'application/json' }),
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Không thể tạo sơ đồ tư duy từ PDF.');
  }
  return data.summary || '';
}

export async function fetchLastMindmap() {
  const res = await fetch(`${API_URL}/mindmap/summary`, {
    method: 'GET',
    headers: buildHeaders({ Accept: 'application/json' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return '';
  return data.summary || '';
}
