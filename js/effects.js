const TAU = Math.PI * 2;
const SPRITE = 64;
const MAX_PARTICLES = 360; // keeps repeated bursts cheap on phones
const rand = (min, max) => min + Math.random() * (max - min);
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const PETAL = "M0 -10C5.2 -6 6.6 2 4.6 6.4C3 9.6 -3 9.6 -4.6 6.4C-6.6 2 -5.2 -6 0 -10Z";

// One canvas for every particle: ambient falling petals, the card dissolving, the bursts.
// With reduced motion nothing flies: ambient petals and the dissolve are off, bursts just fade in place.
export function initPetals(canvas, { calm }) {
  const ctx = canvas.getContext("2d");
  const shape = (id) => document.getElementById(id).getAttribute("d");
  const sprites = {
    petals: [
      sprite(PETAL, [-6, -10, 12, 20], "#FBC6D4", "#F38FAB"),
      sprite(PETAL, [-6, -10, 12, 20], "#F7A1B8", "#E2668C"),
      sprite(PETAL, [-6, -10, 12, 20], "#FFE3EA", "#F7A1B8"),
      sprite(PETAL, [-6, -10, 12, 20], "#FAD0DB", "#EF86A4"),
    ],
    hearts: [
      sprite(shape("heart"), [4, 5.3, 24, 22.2], "#F06C93", "#D6336C"),
      sprite(shape("heart"), [4, 5.3, 24, 22.2], "#FBB4C7", "#F07A9C"),
    ],
    tulips: [
      sprite(shape("tulip-head"), [9.2, 3.5, 13.6, 15.5], "#F9A8BE", "#E0517F"),
      sprite(shape("tulip-head"), [9.2, 3.5, 13.6, 15.5], "#F48BAA", "#C92A5E"),
    ],
  };
  const particles = [];
  const target = innerWidth < 600 ? 28 : 40;
  let ambientOn = false;
  let firstAmbient = true;
  let raf = 0;
  let last = 0;
  let w = 0;
  let h = 0;
  let dpr = 1;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };

  const falling = (spread) => ({
    kind: "fall",
    sprite: pick(sprites.petals),
    x: 0,
    x0: rand(-10, w + 10),
    y: spread ? rand(-20, h) : rand(-h * 0.6, -20),
    size: rand(13, 24),
    vy: rand(26, 52),
    sway: rand(12, 34),
    swayRate: rand(0.5, 1.1),
    phase: rand(0, TAU),
    rot: rand(0, TAU),
    vrot: rand(-1, 1),
    flip: rand(0, TAU),
    vflip: rand(0.8, 2),
    alpha: rand(0.55, 0.95),
    t: 0,
  });

  const flying = (sprite, x, y, vx, vy, { gravity, drag, ttl, size }) => ({
    kind: "fly",
    sprite, x, y, vx, vy, gravity, drag, ttl, size,
    life: 0,
    rot: rand(0, TAU),
    vrot: rand(-4, 4),
    flip: rand(0, TAU),
    vflip: rand(1.5, 4),
    alpha0: rand(0.8, 1),
    alpha: 1,
  });

  const step = (p, dt) => {
    p.rot += p.vrot * dt;
    p.flip += p.vflip * dt;
    if (p.kind === "fall") {
      p.t += dt;
      p.y += p.vy * dt;
      p.x = p.x0 + Math.sin(p.t * p.swayRate + p.phase) * p.sway;
      if (p.y < h + 30) return true;
      if (!ambientOn) return false;
      Object.assign(p, falling(false), { y: rand(-60, -20) });
      return true;
    }
    p.life += dt;
    if (p.life >= p.ttl) return false;
    const damp = Math.exp(-p.drag * dt);
    p.vx *= damp;
    p.vy = p.vy * damp + p.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    const age = p.life / p.ttl;
    p.alpha = p.alpha0 * (1 - age * age);
    return p.y < h + 80;
  };

  const draw = (p) => {
    const k = (p.size / SPRITE) * dpr;
    const fx = Math.cos(p.flip);
    const cos = Math.cos(p.rot);
    const sin = Math.sin(p.rot);
    ctx.setTransform(cos * k * fx, sin * k * fx, -sin * k, cos * k, p.x * dpr, p.y * dpr);
    ctx.globalAlpha = p.alpha;
    ctx.drawImage(p.sprite, -SPRITE / 2, -SPRITE / 2);
  };

  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      if (step(particles[i], dt)) draw(particles[i]);
      else particles.splice(i, 1);
    }
    ctx.globalAlpha = 1;
    raf = particles.length ? requestAnimationFrame(frame) : 0;
  };

  const run = () => {
    if (raf || document.hidden || !particles.length) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  resize();
  addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) return run();
    cancelAnimationFrame(raf);
    raf = 0;
  });

  return {
    ambient(on) {
      if (calm || on === ambientOn) return;
      ambientOn = on;
      if (!on) return;
      const missing = target - particles.filter((p) => p.kind === "fall").length;
      for (let i = 0; i < missing; i++) particles.push(falling(firstAmbient));
      firstAmbient = false;
      run();
    },

    scatter(rect, count = 34) {
      if (calm) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < count; i++) {
        const x = rand(rect.left, rect.right);
        const y = rand(rect.top, rect.bottom);
        const angle = Math.atan2(y - cy, x - cx) + rand(-0.4, 0.4);
        const speed = rand(60, 220);
        particles.push(flying(pick(sprites.petals), x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 60, {
          gravity: 50, drag: 1.1, ttl: rand(1.3, 2.3), size: rand(14, 26),
        }));
      }
      run();
    },

    // A fountain from (x, y): tulips, hearts and petals, or hearts only.
    burst(x, y, { count = 48, hearts = false } = {}) {
      const room = Math.min(count, MAX_PARTICLES - particles.length);
      for (let i = 0; i < room; i++) {
        const kind = Math.random();
        const sprite = pick(hearts || kind < 0.45 ? sprites.hearts : kind < 0.75 ? sprites.tulips : sprites.petals);
        if (calm) {
          particles.push(Object.assign(
            flying(sprite, x + rand(-110, 110), y + rand(-140, 10), 0, 0, { gravity: 0, drag: 0, ttl: rand(1.2, 1.9), size: rand(16, 28) }),
            { rot: rand(-0.35, 0.35), vrot: 0, flip: 0, vflip: 0 },
          ));
          continue;
        }
        const angle = -Math.PI / 2 + rand(-1.3, 1.3);
        const speed = rand(380, 860);
        particles.push(flying(sprite, x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, {
          gravity: 950, drag: 1.4, ttl: rand(1.6, 2.6), size: rand(16, 30),
        }));
      }
      run();
    },
  };
}

function sprite(d, [x, y, w, h], from, to) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SPRITE;
  const ctx = canvas.getContext("2d");
  const scale = (SPRITE - 4) / Math.max(w, h);
  ctx.translate(SPRITE / 2, SPRITE / 2);
  ctx.scale(scale, scale);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  const gradient = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);
  ctx.fillStyle = gradient;
  ctx.fill(new Path2D(d));
  return canvas;
}

// Plays the CSS bloom on the reveal overlay. Resolves when it ends or when she taps to skip.
export function bloom(el, { calm }) {
  return new Promise((resolve) => {
    let timer = 0;
    const finish = () => {
      clearTimeout(timer);
      el.removeEventListener("click", finish);
      document.removeEventListener("keydown", finish);
      resolve();
    };
    el.hidden = false;
    el.classList.add("is-playing");
    timer = setTimeout(finish, calm ? 1500 : 3400);
    el.addEventListener("click", finish);
    document.addEventListener("keydown", finish);
  });
}

export function revealOnScroll(elements) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });
  for (const el of elements) observer.observe(el);
}

// Grows the timeline stem with scroll progress. It only ever grows, like a real stem.
export function growStem(track, stem, onDone) {
  let shown = 0;
  let queued = false;
  const update = () => {
    queued = false;
    const box = track.getBoundingClientRect();
    if (!box.height) return;
    const progress = Math.min(1, Math.max(0, (innerHeight * 0.72 - box.top) / box.height));
    if (progress <= shown) return;
    shown = progress;
    stem.style.transform = `scaleY(${shown})`;
    if (shown < 0.99) return;
    removeEventListener("scroll", queue);
    removeEventListener("resize", queue);
    onDone();
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  queue();
}
