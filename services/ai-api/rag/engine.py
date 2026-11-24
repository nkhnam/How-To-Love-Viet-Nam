import threading
from pathlib import Path

import google.generativeai as genai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.spacy_embeddings import SpacyEmbeddings
from langchain_community.vectorstores import FAISS
from PyPDF2 import PdfReader

from config import FAISS_DIR, GEMINI_API_KEY, GEMINI_MODEL, KNOWLEDGE_DIR

SYSTEM_PROMPT = """Bạn là một trợ lý AI thông minh và thân thiện, chuyên về lịch sử. Hãy giao tiếp một cách tự nhiên và thân thiện với người dùng. Nhiệm vụ của bạn là:

    1. Trả lời câu hỏi đầy đủ và chính xác dựa trên thông tin trong ngữ cảnh được cung cấp một cách chính xác.
    2. Nếu câu hỏi không liên quan đến lịch sử hoặc không thể trả lời bằng thông tin trong ngữ cảnh, hãy trả lời một cách lịch sự rằng bạn không có thông tin về vấn đề đó.
    3. Nếu người dùng hỏi về bạn hoặc khả năng của bạn, hãy trả lời một cách thân thiện và khiêm tốn.
    4. Luôn giữ cuộc trò chuyện lịch sự và tích cực.

    Ngữ cảnh: {context}

    Câu hỏi hoặc phát ngôn của người dùng: {question}

    Trả lời:"""

_lock = threading.Lock()
_store = None
_embeddings = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = SpacyEmbeddings(model_name="en_core_web_sm")
    return _embeddings


def get_store():
    global _store
    with _lock:
        if _store is None:
            if not (FAISS_DIR / "index.faiss").exists():
                raise FileNotFoundError(f"FAISS index not found in {FAISS_DIR}")
            _store = FAISS.load_local(
                str(FAISS_DIR), _get_embeddings(), allow_dangerous_deserialization=True
            )
        return _store


def reset_store():
    global _store
    with _lock:
        _store = None


def read_document(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        with open(path, "rb") as f:
            reader = PdfReader(f)
            return "\n".join(page.extract_text() or "" for page in reader.pages)
    if path.suffix.lower() == ".docx":
        import docx

        return "\n".join(p.text for p in docx.Document(str(path)).paragraphs)
    return ""


def knowledge_files():
    if not KNOWLEDGE_DIR.exists():
        return []
    return sorted(
        p
        for p in KNOWLEDGE_DIR.rglob("*")
        if p.suffix.lower() in {".pdf", ".docx"}
    )


def rebuild_index():
    files = knowledge_files()
    if not files:
        raise FileNotFoundError(f"No PDF/DOCX files found in {KNOWLEDGE_DIR}")
    text = "\n".join(read_document(p) for p in files)
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = [c for c in splitter.split_text(text) if c.strip()]
    store = FAISS.from_texts(chunks, embedding=_get_embeddings())
    FAISS_DIR.mkdir(parents=True, exist_ok=True)
    store.save_local(str(FAISS_DIR))
    reset_store()
    return {"files": len(files), "chunks": len(chunks), "faiss_dir": str(FAISS_DIR)}


def answer(question: str) -> str:
    docs = get_store().as_retriever().invoke(question)
    context = "\n".join(doc.page_content for doc in docs)
    if not context:
        context = "Không có thông tin cụ thể về câu hỏi này trong cơ sở dữ liệu."
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(model_name=GEMINI_MODEL)
    response = model.generate_content([SYSTEM_PROMPT.format(context=context, question=question)])
    return response.text
