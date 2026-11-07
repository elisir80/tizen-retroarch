#!/usr/bin/env python3
"""Small LAN server for legally owned NES, SNES, and Commodore 64 files."""

from __future__ import annotations

import argparse
import json
import mimetypes
import socket
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath
from urllib.parse import unquote, urlsplit

SYSTEM_BY_EXTENSION = {
    ".nes": "Nintendo NES",
    ".unf": "Nintendo NES",
    ".unif": "Nintendo NES",
    ".smc": "Super Nintendo",
    ".sfc": "Super Nintendo",
    ".fig": "Super Nintendo",
    ".swc": "Super Nintendo",
    ".d64": "Commodore 64",
    ".d71": "Commodore 64",
    ".d81": "Commodore 64",
    ".g64": "Commodore 64",
    ".t64": "Commodore 64",
    ".tap": "Commodore 64",
    ".prg": "Commodore 64",
    ".p00": "Commodore 64",
    ".crt": "Commodore 64",
    ".x64": "Commodore 64",
}
ROM_EXTENSIONS = set(SYSTEM_BY_EXTENSION)


def human_url(host: str, port: int) -> str:
    if host not in {"0.0.0.0", "::"}:
        return f"http://{host}:{port}"
    probe = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        probe.connect(("192.0.2.1", 80))
        address = probe.getsockname()[0]
    except OSError:
        address = socket.gethostbyname(socket.gethostname())
    finally:
        probe.close()
    return f"http://{address}:{port}"


def make_handler(root: Path):
    class RomRequestHandler(BaseHTTPRequestHandler):
        server_version = "RetroArchRomServer/1.0"

        def end_headers(self) -> None:
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.send_header("Access-Control-Allow-Private-Network", "true")
            self.send_header("Cache-Control", "no-store")
            super().end_headers()

        def send_json(self, payload: object, status: HTTPStatus = HTTPStatus.OK) -> None:
            data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)

        def do_OPTIONS(self) -> None:
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Content-Length", "0")
            self.end_headers()

        def do_GET(self) -> None:
            request_path = urlsplit(self.path).path
            if request_path in {"/", "/api/health"}:
                self.send_json({"ok": True, "service": "RetroArch ROM Server"})
                return
            if request_path == "/api/roms":
                roms = []
                for item in root.rglob("*"):
                    if item.is_file() and item.suffix.lower() in ROM_EXTENSIONS:
                        relative = item.relative_to(root).as_posix()
                        roms.append({
                            "name": item.name,
                            "path": relative,
                            "size": item.stat().st_size,
                            "system": SYSTEM_BY_EXTENSION[item.suffix.lower()],
                        })
                roms.sort(key=lambda item: (item["name"].casefold(), item["path"].casefold()))
                self.send_json({"roms": roms})
                return
            if request_path.startswith("/roms/"):
                relative = PurePosixPath(unquote(request_path[len("/roms/"):]))
                if relative.is_absolute() or ".." in relative.parts:
                    self.send_error(HTTPStatus.BAD_REQUEST, "Invalid ROM path")
                    return
                candidate = (root / Path(*relative.parts)).resolve()
                try:
                    candidate.relative_to(root)
                except ValueError:
                    self.send_error(HTTPStatus.FORBIDDEN, "ROM path is outside the shared folder")
                    return
                if not candidate.is_file() or candidate.suffix.lower() not in ROM_EXTENSIONS:
                    self.send_error(HTTPStatus.NOT_FOUND, "ROM not found")
                    return
                size = candidate.stat().st_size
                self.send_response(HTTPStatus.OK)
                self.send_header("Content-Type", mimetypes.guess_type(candidate.name)[0] or "application/octet-stream")
                self.send_header("Content-Length", str(size))
                self.end_headers()
                with candidate.open("rb") as rom_file:
                    while chunk := rom_file.read(1024 * 256):
                        self.wfile.write(chunk)
                return
            self.send_error(HTTPStatus.NOT_FOUND, "Not found")

        def log_message(self, fmt: str, *args: object) -> None:
            print(f"{self.client_address[0]} - {fmt % args}")

    return RomRequestHandler


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Share a NES, SNES, and C64 game folder with RetroArch Tizen")
    parser.add_argument("--folder", required=True, type=Path, help="Folder containing legally owned ROM files")
    parser.add_argument("--host", default="0.0.0.0", help="Address to bind (default: all LAN interfaces)")
    parser.add_argument("--port", default=8766, type=int, help="TCP port (default: 8766)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = args.folder.expanduser().resolve()
    if not root.is_dir():
        raise SystemExit(f"Cartella ROM non trovata: {root}")
    server = ThreadingHTTPServer((args.host, args.port), make_handler(root))
    print(f"Cartella condivisa: {root}")
    print(f"Indirizzo da inserire sulla TV: {human_url(args.host, args.port)}")
    print("Premi Ctrl+C per arrestare il server.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer arrestato.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
