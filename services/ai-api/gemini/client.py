import google.generativeai as genai

from config import GEMINI_API_KEY, GEMINI_MODEL

_configured = False


class GeminiError(RuntimeError):
    pass


def _configure():
    global _configured
    if not GEMINI_API_KEY:
        raise GeminiError("GEMINI_API_KEY is not configured")
    if not _configured:
        genai.configure(api_key=GEMINI_API_KEY)
        _configured = True


def model():
    _configure()
    return genai.GenerativeModel(model_name=GEMINI_MODEL)


def generate(parts):
    response = model().generate_content(parts)
    text = getattr(response, "text", None)
    if not text:
        raise GeminiError("Gemini returned an empty response")
    return text
