const BRUSH = 22; // scratch radius in CSS px
const DONE = 0.5; // share of the cover scratched off before it clears itself
const HEARTS = { little: [16], lots: [36, 36, 36] }; // hearts per wave for each answer

export function initFinale(section, { src, focus, alt, cover }, { photo, burst, onFinish }) {
  const card = section.querySelector(".scratch");
  const canvas = section.querySelector(".scratch-cover");
  const ask = section.querySelector(".ask");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let ready = false;
  let done = false;
  let last = null;
  let checkedAt = 0;

  const frame = section.querySelector(".scratch-photo");
  photo(frame, { src, focus, alt });
  const img = frame.querySelector("img");
  const loaded = new Promise((resolve) => {
    if (!img || img.complete) return resolve();
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });

  // "iu" gets one burst of hearts, "iuuuuu" three bigger waves fanning out from the button.
  for (const answer of ask.querySelectorAll("[data-answer]")) {
    answer.addEventListener("click", () => {
      const box = answer.getBoundingClientRect();
      HEARTS[answer.dataset.answer].forEach((count, wave) => {
        const x = box.left + box.width / 2 + (wave ? (wave % 2 ? -1 : 1) * box.width * 0.6 : 0);
        setTimeout(() => burst(x, box.top, { count, hearts: true }), wave * 160);
      });
    });
  }

  // The card needs its final size before the cover is painted, so start loading the photo
  // a little before it scrolls into view and paint once it's there.
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (img) img.loading = "eager";
    paint();
  }, { rootMargin: "600px 0px" });
  observer.observe(card);

  async function paint() {
    await loaded;
    // The card takes the photo's own shape, so nothing gets cropped (e.g. a tall photo strip).
    if (img?.naturalWidth) card.style.setProperty("--ratio", img.naturalWidth / img.naturalHeight);
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
    ask.hidden = false;
    onFinish?.();
    setTimeout(() => canvas.remove(), 900);
  }
}
