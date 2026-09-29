"""
Local server for the AI Validation Engineer Academy — same static file serving
as `python -m http.server`, plus one extra trick: every open page pings
/__heartbeat every few seconds (see assets/js/app.js). Once no ping has
arrived for a while (meaning every tab/browser window showing the site has
been closed), this process exits on its own — so the cmd window that
start-training.bat opened closes automatically instead of sitting there.
"""

import http.server
import os
import socketserver
import threading
import time

PORT = 8420
IDLE_SHUTDOWN_SECONDS = 10

last_heartbeat = time.time()
lock = threading.Lock()


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/__heartbeat":
            global last_heartbeat
            with lock:
                last_heartbeat = time.time()
            self.send_response(204)
            self.end_headers()
            return
        super().do_GET()

    def end_headers(self):
        # This is a local training site that gets edited and re-served during
        # development — without this, Chrome silently keeps serving old
        # cached copies of the JS/CSS after a file changes, even on reload.
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, format, *args):
        pass  # keep the console quiet — only print our own startup/shutdown lines


def watchdog():
    while True:
        time.sleep(2)
        with lock:
            idle = time.time() - last_heartbeat
        if idle > IDLE_SHUTDOWN_SECONDS:
            print("No open browser tabs detected - shutting down.", flush=True)
            os._exit(0)


if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    threading.Thread(target=watchdog, daemon=True).start()
    with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
        httpd.allow_reuse_address = True
        print(f"Serving AI Validation Engineer Academy at http://localhost:{PORT}", flush=True)
        print("This window will close on its own a few seconds after you close the last browser tab.", flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
