from pathlib import Path

from flask import Blueprint, jsonify, request
from PyPDF2 import PdfReader

import config
from gemini.client import GeminiError, generate

bp = Blueprint("mindmap", __name__)

SUMMARY_PROMPT = """Bạn là một trợ lý AI thông minh và thân thiện, chuyên về văn học và lịch sử.
Hãy tóm tắt nội dung sau bằng tiếng Việt, ngắn gọn, theo cấu trúc phân cấp gạch đầu dòng:

{text}"""


def _extract_pdf_text(stream) -> str:
    reader = PdfReader(stream)
    return "".join(page.extract_text() or "" for page in reader.pages)


def _upload():
    upload = request.files.get("file")
    if upload is None or not upload.filename:
        return jsonify({"success": False, "error": "No file part"}), 400
    if not upload.filename.lower().endswith(".pdf"):
        return jsonify({"success": False, "error": "Only PDF files are supported"}), 400
    try:
        text = _extract_pdf_text(upload.stream)
        summary = generate([SUMMARY_PROMPT.format(text=text)])
    except GeminiError as exc:
        return jsonify({"success": False, "error": str(exc)}), 502
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500

    output = Path(config.OUTPUT_DIR) / "last_mindmap_summary.txt"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(summary, encoding="utf-8")
    return jsonify({"success": True, "message": "Summary saved", "summary": summary}), 200


@bp.get("/mindmap/summary")
def summary():
    output = Path(config.OUTPUT_DIR) / "last_mindmap_summary.txt"
    if not output.exists():
        return jsonify({"summary": ""}), 200
    return jsonify({"summary": output.read_text(encoding="utf-8")}), 200


@bp.post("/mindmap/upload")
def upload():
    return _upload()


@bp.post("/upload")
def upload_legacy():
    return _upload()
