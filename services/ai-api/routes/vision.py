import base64
import binascii

from flask import Blueprint, jsonify, request

from gemini.client import GeminiError, generate

bp = Blueprint("vision", __name__)

DEFAULT_PROMPT = """Hãy phân tích bức ảnh này và cho biết:
1. Đây là địa điểm nổi tiếng nào?
2. Các đặc điểm nổi bật của địa điểm này?
3. Lịch sử và ý nghĩa văn hóa của nơi này?

Vui lòng trả lời bằng tiếng Việt, ngắn gọn nhưng đầy đủ thông tin."""


def _decode_data_url(value: str):
    if value.startswith("data:"):
        header, _, payload = value.partition(",")
        mime = header[5:].split(";")[0] or "image/jpeg"
        return payload, mime
    return value, "image/jpeg"


def _read_request_image():
    upload = request.files.get("image")
    if upload is not None:
        return upload.stream.read(), upload.mimetype or "image/jpeg"
    data = request.get_json(silent=True) or {}
    raw = data.get("image") or ""
    if not raw:
        return None, None
    payload, mime = _decode_data_url(raw)
    try:
        return base64.b64decode(payload), mime
    except (binascii.Error, ValueError):
        return None, None


@bp.post("/analyze")
def analyze():
    image_bytes, mime = _read_request_image()
    if not image_bytes:
        return jsonify({"error": "Không tìm thấy ảnh"}), 400
    data = request.get_json(silent=True) or {}
    prompt = (data.get("prompt") or "").strip() or DEFAULT_PROMPT
    try:
        text = generate([prompt, {"mime_type": mime, "data": image_bytes}])
    except GeminiError as exc:
        return jsonify({"error": str(exc), "status": "error"}), 502
    except Exception as exc:
        return jsonify({"error": str(exc), "status": "error"}), 500
    return jsonify({"result": text, "location": text, "status": "success"}), 200


@bp.post("/analyze-image")
def analyze_legacy():
    return analyze()


@bp.post("/generate")
def generate_content():
    data = request.get_json(silent=True) or {}
    parts = data.get("parts")
    if not parts:
        contents = data.get("contents") or []
        if isinstance(contents, list) and contents and isinstance(contents[0], dict):
            parts = contents[0].get("parts")
    if not isinstance(parts, list) or not parts:
        return jsonify({"error": "parts is required"}), 400
    try:
        text = generate(parts)
    except GeminiError as exc:
        return jsonify({"error": str(exc)}), 502
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify({"text": text}), 200
