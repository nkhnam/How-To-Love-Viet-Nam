# Hướng dẫn chạy

## 1. AI API (`services/ai-api`)

Yêu cầu: Python 3.11.

```bash
cd services/ai-api
cp .env.example .env
# sửa .env: GEMINI_API_KEY=..., (tuỳ chọn) FIREBASE_DB_URL / FIREBASE_API_KEY / API_TOKEN

.venv/Scripts/python.exe app.py
# kiểm tra
curl http://localhost:5000/health
```

Lần đầu tiên (nếu chưa có venv):

```bash
py -3.11 -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt
.venv/Scripts/python.exe -m spacy download en_core_web_sm
```

Dựng lại FAISS index khi thêm tài liệu vào `data/knowledge`:

```bash
.venv/Scripts/python.exe build_index.py
# hoặc gọi GET http://localhost:5000/process
```

Biến môi trường:

| Biến | Bắt buộc | Ghi chú |
|---|---|---|
| `GEMINI_API_KEY` | Có (cho tính năng AI) | Key mới sau khi rotate |
| `GEMINI_MODEL` | Không | Mặc định `gemini-2.5-flash` |
| `FIREBASE_DB_URL`, `FIREBASE_API_KEY` | Không | Bật lưu lịch sử chat |
| `API_TOKEN` | Không | Nếu đặt, client phải gửi header `X-Api-Token` |
| `PORT` | Không | Mặc định 5000 |

## 2. Web (`web`)

```bash
cd web
cp .env.example .env       # REACT_APP_API_URL nếu API chạy host khác
npm install
npm start                  # http://localhost:3000
```

## 3. Mobile (`mobile`)

Yêu cầu: JDK 17, Android SDK (cho Android). Sửa `src/config.js` cho đúng địa chỉ API
(máy thật: IP LAN của máy chạy ai-api; emulator Android: `http://10.0.2.2:5000`).

```bash
cd mobile
npm install
npx react-native start
npx react-native run-android
```

Build APK:

```bash
cd android && ./gradlew assembleRelease
```

Lưu ý: bản release hiện ký bằng `debug.keystore` — cần tạo keystore riêng trước khi phát hành.

## 4. Mindmap viewer (`tools/mindmap-viewer`)

Mở trực tiếp `index.html` bằng trình duyệt (cần mạng cho CDN mind-elixir) trong khi
ai-api đang chạy ở `localhost:5000`. Đổi `API_BASE` trong file nếu API ở host khác.
