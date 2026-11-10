# Nhận danh sách đoạn "Nghe cả bài" từ trình duyệt rồi ghi ra output/read-texts/<trang>.html.json.
# Trang chạy trong trình duyệt (trang do JavaScript dựng nội dung nên chỉ đọc đúng khi đã hiển thị).
# Chạy trước make-read-audio-vieneu.py:
#   python scripts/collect-read-texts.py            (để chạy nền, lắng nghe ở 127.0.0.1:4499)
# Chỉ nhận yêu cầu POST từ máy này, không lưu gì ngoài thư mục output/read-texts.
import json
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'output' / 'read-texts'
PORT = 4499


class Handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = json.loads(self.rfile.read(length).decode('utf-8'))
        name = Path(body['page']).name
        texts = [str(t) for t in body['texts']]
        OUT_DIR.mkdir(parents=True, exist_ok=True)
        (OUT_DIR / (name + '.json')).write_text(json.dumps(texts, ensure_ascii=False), encoding='utf-8')
        reply = json.dumps({'ok': True, 'page': name, 'count': len(texts)}).encode('utf-8')
        self.send_response(200)
        self._cors()
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(reply)))
        self.end_headers()
        self.wfile.write(reply)
        print('đã nhận', name, len(texts), 'đoạn', flush=True)

    def log_message(self, format, *args):
        return


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    print('lắng nghe tại 127.0.0.1:%d' % PORT, flush=True)
    HTTPServer(('127.0.0.1', PORT), Handler).serve_forever()


if __name__ == '__main__':
    main()
