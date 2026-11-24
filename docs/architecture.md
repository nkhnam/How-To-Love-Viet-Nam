# Kiến trúc

```
web (React)  ─┐
mobile (RN)  ─┼─► HTTP ─► services/ai-api (Flask :5000)
tools/mindmap-viewer ─┘          ├─ /ask              RAG chatbot (FAISS + Gemini)
                                 ├─ /history/<uid>    lịch sử chat (Realtime DB REST)
                                 ├─ /process          rebuild index từ data/knowledge
                                 ├─ /mindmap/upload   PDF → tóm tắt → sơ đồ tư duy
                                 ├─ /mindmap/summary  tóm tắt gần nhất
                                 ├─ /analyze          phân tích ảnh (mobile camera)
                                 └─ /generate         sinh nội dung từ parts (web)
```

## Quyết định chính

- **Một backend duy nhất**: gộp `rag.py`, `mindmap.py`, `image.py` (trước đây nằm rải rác
  trong web, mobile và project mindmap) thành một Flask app. Tránh xung đột cổng và cấu hình trùng.
- **Cấu hình qua biến môi trường**: `GEMINI_API_KEY`, `GEMINI_MODEL`, `FIREBASE_*`,
  `API_TOKEN`. Không hard-code key trong source hay frontend.
- **Lịch sử chat** ghi qua Realtime Database REST API (`FIREBASE_DB_URL` + `FIREBASE_API_KEY`).
  Nếu không cấu hình, `/ask` vẫn chạy và `/history` trả danh sách rỗng.
- **Posture bảo mật**: web không còn gọi Gemini trực tiếp. Mọi call đi qua `ai-api`,
  output HTML được lọc bằng DOMPurify trước khi render.
- **Dữ liệu nặng** (`data/faiss_db`, `assets/flashcards`) không đưa vào git; FAISS index
  dựng lại bằng `services/ai-api/build_index.py`.

## Lịch sử cũ

Các repo trước đây (`app-HTLVN`, `HowToLoveVN`, `erewrwerwe`) được đóng gói trong
`D:\code\_archive\HTLVN-20261124\*.bundle`.
