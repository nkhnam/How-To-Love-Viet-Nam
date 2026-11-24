from flask import Flask, jsonify, request
from flask_cors import CORS

import config
from rag import engine
from routes import chat, mindmap, vision


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": config.CORS_ORIGINS}})

    @app.before_request
    def require_token():
        if not config.API_TOKEN or request.method in {"GET", "OPTIONS"}:
            return None
        if request.headers.get("X-Api-Token") != config.API_TOKEN:
            return jsonify({"error": "Unauthorized"}), 401
        return None

    app.register_blueprint(chat.bp)
    app.register_blueprint(mindmap.bp)
    app.register_blueprint(vision.bp)

    @app.get("/")
    def index():
        return jsonify({"message": "HTLVN AI API"}), 200

    @app.get("/favicon.ico")
    def favicon():
        return "", 204

    @app.get("/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "model": config.GEMINI_MODEL,
                "gemini_configured": bool(config.GEMINI_API_KEY),
                "faiss_index": (config.FAISS_DIR / "index.faiss").exists(),
                "knowledge_files": len(engine.knowledge_files()),
                "firebase_configured": bool(config.FIREBASE_DB_URL and config.FIREBASE_API_KEY),
                "token_required": bool(config.API_TOKEN),
            }
        ), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host=config.HOST, port=config.PORT, debug=True)
