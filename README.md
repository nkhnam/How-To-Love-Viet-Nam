# HTLVN — How To Love Vietnam

Monorepo cho website, app mobile, dịch vụ AI và tư liệu học tập của HTLVN.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `web` | Web React (Create React App) |
| `mobile` | App React Native 0.73 (Android + iOS) |
| `services/ai-api` | Flask API: RAG chatbot, mindmap từ PDF, phân tích ảnh, tạo nội dung bằng Gemini |
| `tools/mindmap-viewer` | Trang Mind Elixir hiển thị sơ đồ tư duy |
| `data/knowledge` | PDF/DOCX nguồn cho RAG (được index vào `data/faiss_db`) |
| `assets/flashcards` | Bộ ảnh thẻ flashcard (en/vi) — không commit vào git |
| `docs` | Kiến trúc và hướng dẫn chạy |

## Chạy nhanh

```bash
# 1) AI API (Python 3.11)
cd services/ai-api
cp .env.example .env        # điền GEMINI_API_KEY
.venv/Scripts/python.exe app.py          # Windows
# hoặc: .venv/bin/python app.py          # Linux/macOS

# 2) Web
cd web
cp .env.example .env
npm install
npm start                    # http://localhost:3000

# 3) Mobile
cd mobile
npm install
npx react-native start
npx react-native run-android
```

Xem thêm `docs/run.md` và `docs/architecture.md`.
