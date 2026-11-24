import json
import sys

from rag.engine import rebuild_index

if __name__ == "__main__":
    try:
        stats = rebuild_index()
    except Exception as exc:
        print(f"Failed: {exc}", file=sys.stderr)
        sys.exit(1)
    print(json.dumps(stats, ensure_ascii=False, indent=2))
