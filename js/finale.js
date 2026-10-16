const BRUSH = 22; // scratch radius in CSS px
const DONE = 0.5; // share of the cover scratched off before it clears itself

export function initFinale(section, { src, focus, alt, cover }, { photo, burst }) {
  const card = section.querySelector(".scratch");
  const canvas = section.querySelector(".scratch-cover");
  const replay = section.querySelector(".replay");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let ready = false;
  let done = false;
  let last = null;
  let checkedAt = 0;

  photo(section.querySelector(".scratch-photo"), { src, focus, alt });
  replay.addEventListener("click", () => location.reload());

  // The card needs layout to size the canvas, so paint the cover just before it scrolls into view.
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    paint();
  }, { rootMargin: "400px 0px" });
  observer.observe(card);

  async function paint() {
    await document.fonts.load('300 32px "Playwrite VN"').catch(() => {});
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = card.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.scale(dpr, dpr);
    drawCover(width, height);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH * 2;
    card.classList.add("is-ready");
    ready = true;
  }

  function drawCover(w, h) {
    const css = getComputedStyle(document.documentElement);
    const token = (name) => css.getPropertyValue(name).trim();

    const foil = ctx.createLinearGradient(0, 0, w, h);
    foil.addColorStop(0, token("--tulip"));
    foil.addColorStop(0.5, "#FBC9D6");
    foil.addColorStop(1, "#EE86A4");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, w, h);

    const sheen = ctx.createLinearGradient(0, h * 0.15, w, h * 0.85);
    sheen.addColorStop(0.35, "rgba(255, 255, 255, 0)");
    sheen.addColorStop(0.5, "rgba(255, 255, 255, 0.38)");
    sheen.addColorStop(0.65, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, w, h);

    const tulip = new Path2D(document.getElementById("tulip-head").getAttribute("d"));
    ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
    for (let y = 10, row = 0; y < h; y += 44, row++) {
      for (let x = row % 2 ? 4 : 26; x < w; x += 44) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(0.9, 0.9);
        ctx.fill(tulip);
        ctx.restore();
      }
    }

    ctx.font = `300 ${Math.round(w * 0.085)}px "Playwrite VN", cursive`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(160, 30, 70, 0.45)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = token("--cream");
    ctx.fillText(cover, w / 2, h / 2);
    ctx.shadowBlur = 0;
  }

  const at = (event) => {
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  const scratch = (from, to) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    check(false);
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (!ready || done) return;
    canvas.setPointerCapture(event.pointerId);
    last = at(event);
    scratch(last, last);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!last) return;
    const point = at(event);
    scratch(last, point);
    last = point;
  });

  const lift = () => {
    last = null;
    check(true);
  };
  canvas.addEventListener("pointerup", lift);
  canvas.addEventListener("pointercancel", lift);

  canvas.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (ready) finish();
  });

  function check(force) {
    const now = performance.now();
    if (done || (!force && now - checkedAt < 120)) return;
    checkedAt = now;
    if (cleared() >= DONE) finish();
  }

  // Samples every 16th pixel's alpha; plenty to estimate how much is scratched off.
  function cleared() {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    let total = 0;
    for (let i = 3; i < data.length; i += 64) {
      total++;
      if (data[i] < 128) clear++;
    }
    return clear / total;
  }

  function finish() {
    if (done) return;
    done = true;
    last = null;
    canvas.classList.add("is-cleared");
    const box = card.getBoundingClientRect();
    burst(box.left + box.width / 2, box.top + box.height * 0.4);
    replay.hidden = false;
    setTimeout(() => canvas.remove(), 900);
  }
}
