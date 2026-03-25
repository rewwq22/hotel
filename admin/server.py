#!/usr/bin/env python3
"""
Мини-сервер для админки загрузки фото.
Запуск: python3 admin/server.py
Откроется: http://localhost:9000
"""
import http.server
import json
import os
import base64
import mimetypes
import webbrowser

PORT = 9000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGE_DIR = os.path.normpath(os.path.join(BASE_DIR, '..', 'site-backup', 'hotel-service-krd.ru', 'image'))
SLOTS_FILE = os.path.join(BASE_DIR, 'image-slots.json')


class AdminHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        path = self.path.split('?')[0]  # strip query string (cache-busting)

        if path == '/':
            self.path = '/index.html'
            super().do_GET()
        elif path == '/api/slots':
            self.send_json(self.get_slots())
        elif path == '/api/images':
            self.send_json(self.get_existing_images())
        elif path.startswith('/image/'):
            self.serve_image(path[7:])  # strip "/image/"
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/upload':
            self.handle_upload()
        elif self.path == '/api/update-alt':
            self.handle_update_alt()
        else:
            self.send_error(404)

    def serve_image(self, filename):
        """Serve image files from IMAGE_DIR."""
        filepath = os.path.join(IMAGE_DIR, filename)
        if not os.path.isfile(filepath):
            self.send_error(404, f'Image not found: {filename}')
            return
        # Security: ensure we don't serve outside IMAGE_DIR
        if not os.path.normpath(filepath).startswith(IMAGE_DIR):
            self.send_error(403)
            return
        mime = mimetypes.guess_type(filepath)[0] or 'application/octet-stream'
        size = os.path.getsize(filepath)
        self.send_response(200)
        self.send_header('Content-Type', mime)
        self.send_header('Content-Length', str(size))
        self.send_header('Cache-Control', 'no-cache')
        self.end_headers()
        with open(filepath, 'rb') as f:
            self.wfile.write(f.read())

    def handle_upload(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
            slot_id = data['slot_id']
            filename = data['filename']
            image_data = data['image_data']

            # Decode base64 image
            if ',' in image_data:
                image_data = image_data.split(',')[1]
            image_bytes = base64.b64decode(image_data)

            # Save image
            os.makedirs(IMAGE_DIR, exist_ok=True)
            filepath = os.path.join(IMAGE_DIR, filename)
            with open(filepath, 'wb') as f:
                f.write(image_bytes)

            # Update slots JSON status
            slots_data = self.read_slots()
            for slot in slots_data['slots']:
                if slot['id'] == slot_id:
                    slot['status'] = 'uploaded'
                    break
            self.write_slots(slots_data)

            size_kb = len(image_bytes) / 1024
            self.send_json({
                'ok': True,
                'filename': filename,
                'size_kb': round(size_kb, 1)
            })
        except Exception as e:
            self.send_json({'ok': False, 'error': str(e)}, 500)

    def handle_update_alt(self):
        content_length = int(self.headers['Content-Length'])
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body)
            slot_id = data['slot_id']
            alt_text = data['alt_text']

            slots_data = self.read_slots()
            found = False
            for slot in slots_data['slots']:
                if slot['id'] == slot_id:
                    slot['alt_text'] = alt_text
                    found = True
                    break

            if found:
                self.write_slots(slots_data)
                self.send_json({'ok': True})
            else:
                self.send_json({'ok': False, 'error': 'Slot not found'}, 404)
        except Exception as e:
            self.send_json({'ok': False, 'error': str(e)}, 500)

    def read_slots(self):
        with open(SLOTS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)

    def write_slots(self, data):
        with open(SLOTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def get_slots(self):
        data = self.read_slots()
        for slot in data['slots']:
            filepath = os.path.join(IMAGE_DIR, slot['filename'])
            if os.path.isfile(filepath):
                slot['status'] = 'uploaded'
                slot['file_size_kb'] = round(os.path.getsize(filepath) / 1024, 1)
            else:
                if slot.get('status') == 'uploaded':
                    slot['status'] = 'missing'
                else:
                    slot['status'] = 'empty'
        return data

    def get_existing_images(self):
        files = []
        if os.path.isdir(IMAGE_DIR):
            for f in sorted(os.listdir(IMAGE_DIR)):
                if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    path = os.path.join(IMAGE_DIR, f)
                    files.append({
                        'filename': f,
                        'size_kb': round(os.path.getsize(path) / 1024, 1)
                    })
        return files

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        msg = str(args[0]) if args else ''
        if '/api/' in msg or 'error' in msg.lower():
            super().log_message(fmt, *args)


if __name__ == '__main__':
    os.makedirs(IMAGE_DIR, exist_ok=True)
    print(f'\n  Админка фото: http://localhost:{PORT}')
    print(f'  Папка image:  {IMAGE_DIR}')
    print(f'  Слоты:        {SLOTS_FILE}\n')
    webbrowser.open(f'http://localhost:{PORT}')
    server = http.server.HTTPServer(('', PORT), AdminHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nСервер остановлен.')
