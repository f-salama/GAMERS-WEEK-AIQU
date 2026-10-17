#!/usr/bin/env python3
"""
Break the AI Guard - local booth server
AI Association (AIQU) - Gamers Week, Qatar University

Run:   python server.py        (Windows)
       python3 server.py       (Mac / Linux)
Then open http://localhost:8000 in Chrome.

No installs needed: this uses only Python's standard library.
- Serves the game from the "public" folder
- Talks to the AI for you (your API key stays on this laptop, never in the browser)
- Saves the scoreboard to scores.json, so it survives restarts
- Other laptops/tablets on the same Wi-Fi can play too (it prints the address)
"""
import json
import os
import socket
import sys
import threading
import time
import urllib.error
import urllib.request
import uuid
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(ROOT, "public")
CONFIG_FILE = os.path.join(ROOT, "config.json")
SCORES_FILE = os.path.join(ROOT, "scores.json")

DEFAULTS = {
    "provider": "anthropic",           # "anthropic" or "gemini"
    "anthropic_api_key": "",
    "anthropic_model": "claude-haiku-5-5",
    "gemini_api_key": "",
    "gemini_model": "",                # copy the exact Flash model name from Google AI Studio
    "port": 8000,
    "open_browser": True,
    "join_address": "",                # leave empty to auto-detect, or paste e.g. "192.168.1.20"
    "instagram_url": "https://www.instagram.com/aiqu.qa/",
    "attendance_url": "",              # paste the Google/Microsoft Forms link here (or in the staff panel)
}
INFO_KEYS = ("join_address", "attendance_url", "instagram_url")


def load_config():
    cfg = dict(DEFAULTS)
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, encoding="utf-8") as f:
                cfg.update(json.load(f))
        except Exception as e:  # noqa: BLE001
            print(f"!! config.json has a mistake in it ({e}). Using offline guards.")
    # environment variables win, so you never have to write the key in a file
    cfg["anthropic_api_key"] = os.environ.get("ANTHROPIC_API_KEY", cfg["anthropic_api_key"]).strip()
    cfg["gemini_api_key"] = os.environ.get("GEMINI_API_KEY", cfg["gemini_api_key"]).strip()
    return cfg


CFG = load_config()


def ai_ready():
    p = CFG["provider"]
    if p == "anthropic":
        return bool(CFG["anthropic_api_key"])
    if p == "gemini":
        return bool(CFG["gemini_api_key"] and CFG["gemini_model"])
    return False


# ---------------------------------------------------------------- AI calls
class AIError(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def clean_messages(messages):
    """Keep only user/assistant text turns, merge repeats, start and end on the player."""
    out = []
    for m in messages[-14:]:
        role = m.get("role")
        text = str(m.get("content", ""))[:1500]
        if role not in ("user", "assistant") or not text.strip():
            continue
        if out and out[-1]["role"] == role:
            out[-1]["content"] += "\n" + text
        else:
            out.append({"role": role, "content": text})
    while out and out[0]["role"] != "user":
        out.pop(0)
    if not out or out[-1]["role"] != "user":
        raise AIError("bad_request", "The last message must come from the player.")
    return out


def post_json(url, headers, body, timeout=25):
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "ignore")[:300]
        if e.code in (401, 403):
            raise AIError("bad_key", "The API key was rejected. Check config.json.") from e
        if e.code == 429:
            raise AIError("rate_limited", "Too many requests or out of credit.") from e
        raise AIError("upstream_error", f"AI service error {e.code}: {detail}") from e
    except (urllib.error.URLError, socket.timeout, TimeoutError) as e:
        raise AIError("network", "Can't reach the AI service (no internet?).") from e


def ask_anthropic(system, messages):
    data = post_json(
        "https://api.anthropic.com/v1/messages",
        {
            "content-type": "application/json",
            "x-api-key": CFG["anthropic_api_key"],
            "anthropic-version": "2023-06-01",
        },
        {
            "model": CFG["anthropic_model"],
            "max_tokens": 400,
            "system": system,
            "messages": messages,
        },
    )
    text = "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
    if not text.strip():
        raise AIError("empty", "The AI sent an empty reply.")
    return text


def ask_gemini(system, messages):
    model = CFG["gemini_model"]
    data = post_json(
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        {"content-type": "application/json", "x-goog-api-key": CFG["gemini_api_key"]},
        {
            "systemInstruction": {"parts": [{"text": system}]},
            "contents": [
                {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
                for m in messages
            ],
            "generationConfig": {"maxOutputTokens": 4096},
        },
    )
    try:
        parts = data["candidates"][0]["content"]["parts"]
        text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    except (KeyError, IndexError, TypeError):
        text = ""
    if not text.strip():
        raise AIError("empty", "The AI sent an empty reply.")
    return text


def ask_ai(system, messages):
    if not ai_ready():
        raise AIError("no_key", "No API key set in config.json.")
    messages = clean_messages(messages)
    system = str(system)[:8000]
    if CFG["provider"] == "gemini":
        return ask_gemini(system, messages)
    return ask_anthropic(system, messages)


# ---------------------------------------------------------------- scoreboard
LOCK = threading.Lock()


def read_scores():
    if not os.path.exists(SCORES_FILE):
        return []
    try:
        with open(SCORES_FILE, encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:  # noqa: BLE001
        return []


def write_scores(rows):
    tmp = SCORES_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=1)
    os.replace(tmp, SCORES_FILE)


def clean_row(row):
    return {
        "id": uuid.uuid4().hex[:12],
        "name": str(row.get("name", "PLAYER"))[:16],
        "score": max(0, min(int(row.get("score", 0) or 0), 99999)),
        "cleared": max(0, min(int(row.get("cleared", 0) or 0), 5)),
        "won": bool(row.get("won", False)),
        "day": str(row.get("day", time.strftime("%Y-%m-%d")))[:10],
        "at": int(row.get("at", time.time() * 1000) or 0),
    }


# ---------------------------------------------------------------- booth info (join address + QR links)
def join_url(port):
    """The address other devices type in. Uses the pasted join_address, else the detected Wi-Fi IP."""
    addr = str(CFG.get("join_address", "") or "").strip().rstrip("/")
    if not addr:
        ip = lan_ip()
        return f"http://{ip}:{port}" if ip else ""
    if "://" not in addr:
        addr = "http://" + addr
    host = addr.split("://", 1)[1]
    if ":" not in host.split("/", 1)[0]:
        scheme, rest = addr.split("://", 1)
        head, _, tail = rest.partition("/")
        addr = f"{scheme}://{head}:{port}" + (f"/{tail}" if tail else "")
    return addr


def booth_info(port):
    return {
        "join_url": join_url(port),
        "join_address": CFG.get("join_address", ""),
        "instagram_url": CFG.get("instagram_url", ""),
        "attendance_url": CFG.get("attendance_url", ""),
    }


def save_info(body):
    """Write the pasted links into config.json, keeping everything else (API keys) untouched."""
    raw = {}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, encoding="utf-8") as f:
                raw = json.load(f)
        except Exception:  # noqa: BLE001
            raise ValueError("config.json has a mistake in it, fix it by hand first")
    for k in INFO_KEYS:
        if k in body:
            v = str(body[k] or "").strip()[:500]
            if v and k != "join_address" and not v.lower().startswith(("http://", "https://")):
                v = "https://" + v
            raw[k] = CFG[k] = v
    tmp = CONFIG_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(raw, f, ensure_ascii=False, indent=2)
    os.replace(tmp, CONFIG_FILE)


# ---------------------------------------------------------------- web server
class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC, **kwargs)

    def log_message(self, fmt, *args):  # keep the console quiet except for API calls
        if "/api/" in (self.path or "") and not self.path.startswith("/api/scores"):
            sys.stderr.write("  " + (fmt % args) + "\n")

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self):
        n = int(self.headers.get("Content-Length", 0) or 0)
        if n > 200_000:
            raise ValueError("too big")
        return json.loads(self.rfile.read(n).decode("utf-8") or "{}")

    def do_GET(self):
        if self.path.startswith("/api/status"):
            return self.send_json(200, {"ai": ai_ready(), "provider": CFG["provider"] if ai_ready() else "offline"})
        if self.path.startswith("/api/scores"):
            with LOCK:
                return self.send_json(200, read_scores())
        if self.path.startswith("/api/info"):
            return self.send_json(200, booth_info(self.server.server_address[1]))
        return super().do_GET()

    def is_host(self):
        return self.client_address[0] in ("127.0.0.1", "::1", "::ffff:127.0.0.1")

    def do_POST(self):
        try:
            body = self.read_json()
        except Exception:  # noqa: BLE001
            return self.send_json(400, {"code": "bad_request", "error": "Bad JSON"})
        if self.path == "/api/guard":
            try:
                text = ask_ai(body.get("system", ""), body.get("messages", []))
                return self.send_json(200, {"text": text})
            except AIError as e:
                print(f"  AI problem: {e}")
                return self.send_json(502, {"code": e.code, "error": str(e)})
        if self.path == "/api/scores":
            row = clean_row(body)
            with LOCK:
                rows = read_scores()
                rows.append(row)
                write_scores(rows)
            return self.send_json(200, {"id": row["id"]})
        if self.path == "/api/info":
            if not self.is_host():
                return self.send_json(403, {"error": "Links can only be changed on the booth laptop (localhost)."})
            try:
                with LOCK:
                    save_info(body)
            except ValueError as e:
                return self.send_json(400, {"error": str(e)})
            return self.send_json(200, booth_info(self.server.server_address[1]))
        return self.send_json(404, {"error": "Not found"})

    def do_DELETE(self):
        if self.path.startswith("/api/scores/"):
            rid = self.path.rsplit("/", 1)[-1]
            with LOCK:
                rows = [r for r in read_scores() if r.get("id") != rid]
                write_scores(rows)
            return self.send_json(200, {"ok": True})
        return self.send_json(404, {"error": "Not found"})


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except Exception:  # noqa: BLE001
        return None
    finally:
        s.close()


def main():
    port = int(os.environ.get("PORT", CFG["port"]))
    try:
        server = ThreadingHTTPServer(("0.0.0.0", port), Handler)
    except OSError:
        print(f"!! Port {port} is busy. Close the other window running the game, or change \"port\" in config.json.")
        sys.exit(1)
    url = f"http://localhost:{port}"
    join = join_url(port)
    print("")
    print("  ==========================================")
    print("    BREAK THE AI GUARD  -  booth server")
    print("  ==========================================")
    print(f"  Play on this laptop:   {url}")
    if join:
        print(f"  Other devices (same Wi-Fi): {join}   (also shown as a QR code in the game)")
    if ai_ready():
        model = CFG["anthropic_model"] if CFG["provider"] == "anthropic" else CFG["gemini_model"]
        print(f"  AI guards:  LIVE  ({CFG['provider']} / {model})")
    else:
        print("  AI guards:  OFFLINE MODE (no API key in config.json) - the game still works")
    print("  Stop the server: press Ctrl+C in this window")
    print("")
    if CFG.get("open_browser", True):
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped. Scores are saved in scores.json")


if __name__ == "__main__":
    main()
