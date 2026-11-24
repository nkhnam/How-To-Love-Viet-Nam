from urllib.parse import quote

import requests
from flask import Blueprint, jsonify, request

import config
from rag import engine

bp = Blueprint("chat", __name__)


def _db_url(path: str) -> str:
    return f"{config.FIREBASE_DB_URL}/{path}.json"


def _save_message(user_id: str, question: str, reply: str) -> None:
    if not (config.FIREBASE_DB_URL and config.FIREBASE_API_KEY):
        return
    url = _db_url(f"chats/{quote(user_id, safe='')}/messages")
    payload = {"question": question, "reply": reply, "timestamp": {".sv": "timestamp"}}
    try:
        requests.post(
            url,
            json=payload,
            params={"auth": config.FIREBASE_API_KEY},
            timeout=10,
        ).raise_for_status()
    except requests.RequestException as exc:
        print(f"[chat] cannot save history for {user_id}: {exc}")


def _load_history(user_id: str) -> list:
    if not (config.FIREBASE_DB_URL and config.FIREBASE_API_KEY):
        return []
    url = _db_url(f"chats/{quote(user_id, safe='')}/messages")
    params = {"auth": config.FIREBASE_API_KEY, "orderBy": '"timestamp"', "limitToLast": 50}
    try:
        response = requests.get(url, params=params, timeout=10)
        if response.status_code != 200:
            response = requests.get(url, params={"auth": config.FIREBASE_API_KEY}, timeout=10)
        response.raise_for_status()
        data = response.json() or {}
    except requests.RequestException as exc:
        print(f"[chat] cannot load history for {user_id}: {exc}")
        return []

    messages = [m for m in data.values() if isinstance(m, dict)]
    messages.sort(key=lambda m: m.get("timestamp") or 0)
    history = [
        {"question": m.get("question", ""), "reply": m.get("reply", ""), "timestamp": m.get("timestamp")}
        for m in messages
    ]
    history.reverse()
    return history


@bp.post("/ask")
def ask():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()
    user_id = (data.get("user_id") or "").strip()
    if not question:
        return jsonify({"error": "No question provided"}), 400
    try:
        reply = engine.answer(question)
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 503
    except Exception as exc:  # Gemini/network failures must not crash the request
        return jsonify({"error": str(exc)}), 502
    if user_id:
        _save_message(user_id, question, reply)
    return jsonify({"reply": reply}), 200


@bp.get("/history/<user_id>")
def history(user_id):
    return jsonify({"history": _load_history(user_id)}), 200


@bp.get("/process")
def process():
    try:
        stats = engine.rebuild_index()
    except FileNotFoundError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
    return jsonify({"message": "Documents processed successfully", **stats}), 200
