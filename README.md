# A little gift

One page for one person: password gate, tulip reveal, our story, photos, a letter and a last surprise.
Plain HTML/CSS/JS, no build step, served as-is by GitHub Pages.

## Personalize

All text lives in `content/config.js`. Every placeholder starts with `TODO:`:

    grep -rn "TODO:" content assets/message index.html

**Photos** go into fixed slots (any format, then run the prep script below):

| Slot    | File                               | Count            |
|---------|------------------------------------|------------------|
| Hero    | `assets/photos/hero.jpg`           | 1, portrait      |
| Story   | `assets/photos/story/01.jpg` ...   | 4-6, in order    |
| Gallery | `assets/photos/gallery/01.jpg` ... | 8 or more        |
| Final   | `assets/photos/final.jpg`          | 1, portrait      |

- Missing photos are skipped; a section only shows pink placeholders while it has no photos at all.
  Remove config entries you don't use so the browser doesn't ask for files that aren't there.
- `focus` is a CSS object-position (`"50% 30%"`, `"center top"`) that keeps faces in the crop.

**Prep photos**: `bash scripts/prep-photos.sh` turns HEIC/PNG/WEBP/JPG into lowercase `.jpg`, max 1600px, under 400 KB.
Originals are moved to `assets/photos/.originals/` (git-ignored). It also strips GPS location from the
photos (via `scripts/strip-gps.swift`, needs the Xcode command line tools). GitHub Pages is case-sensitive:
`01.JPG` works on the Mac but 404s online.

**Music**: `assets/music/bg.mp3`. Without it the player pill simply stays hidden.

**Clip**: `assets/video/chut.mp4` loops silently, like a GIF, at the end of the gallery (`clip` in the config,
`src: ""` hides it). From a phone video, without sound or location, plus its still frame:

    ffmpeg -i in.mov -vf "scale='min(1024,iw)':-2" -c:v libx264 -crf 24 -pix_fmt yuv420p -an -map_metadata -1 -movflags +faststart assets/video/chut.mp4
    ffmpeg -i assets/video/chut.mp4 -frames:v 1 -q:v 3 assets/video/chut.jpg

**Her note**: the sticky note at the very end sends what she writes to your Google Sheet (time, message).
In the sheet: Extensions -> Apps Script, paste `scripts/note-sheet.gs`, then Deploy -> New deployment ->
Web app (Execute as: Me, Who has access: Anyone) and put the `/exec` URL into `note.endpoint` in the config.
After editing the script later: Deploy -> Manage deployments -> edit -> Version: New version, so the URL stays the same.

**Letter**: `assets/message/message.txt`, UTF-8. First line = greeting, last line = signature,
blank line = new paragraph, single line breaks are kept.

**Password**: `lock.answer` in the config is base64, ASCII only. Make a new one with `btoa("...")`
in the browser console.

**Date stamp**: `hero.date` (`"18 10"`), digits and spaces only. An empty string hides it.

## Run locally

`fetch()` does not work on `file://`, so use a server:

    python3 -m http.server 8000

Open http://localhost:8000. Add `?dev` to skip the lock screen while working (localhost only).
Phone on the same Wi-Fi: `python3 -m http.server 8000 --bind 0.0.0.0`, then `http://<mac-ip>:8000`.

The macOS Python server sometimes drops files when many are requested at once (a blank page, or a pink
placeholder although the photo exists). Reloading fixes it; this variant (same Python, bigger queue,
keep-alive, also reachable from the phone) avoids it:

    python3 -c "import http.server as s; s.ThreadingHTTPServer.request_queue_size = 64; s.test(s.SimpleHTTPRequestHandler, s.ThreadingHTTPServer, 'HTTP/1.1', 8000, '0.0.0.0')"

## Deploy

1. GitHub: Settings -> Pages -> Source: Deploy from a branch -> `main` / `(root)`. Keep `.nojekyll`.
2. Put the absolute `og:image` URL into `index.html` (marked `TODO:`) so Messenger/Zalo show the tulip preview.
3. Pages rebuilds about a minute after each push; hard-refresh to skip the cache.

Everything in the repo is public, photos and letter included, and the repo name shows up in the URL.
The password is a cute gate, not security. Run the prep script after adding photos so no GPS location
gets published.
