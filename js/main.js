import config from "../content/config.js";
import { initLock } from "./lock.js";
import { initMusic } from "./music.js";
import { initPetals, bloom, revealOnScroll, growStem } from "./effects.js";
import { initGallery, initClip } from "./gallery.js";
import { initLetter } from "./letter.js";
import { initFinale } from "./finale.js";

const $ = (selector, root = document) => root.querySelector(selector);
const html = document.documentElement;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const isLocal = ["localhost", "127.0.0.1"].includes(location.hostname);
const together = `${config.names.me} & ${config.names.her}`;

// Seven-segment digits for the film-camera date stamp: [x, y, width, height] per segment.
const SEGMENTS = {
  a: [2.4, 0, 5.2, 2], b: [8, 2.4, 2, 5.2], c: [8, 10.4, 2, 5.2], d: [2.4, 16, 5.2, 2],
  e: [0, 10.4, 2, 5.2], f: [0, 2.4, 2, 5.2], g: [2.4, 8, 5.2, 2],
};
const DIGITS = ["abcdef", "bc", "abdeg", "abcdg", "bcfg", "acdfg", "acdefg", "abc", "abcdefg", "abcdfg"];

history.scrollRestoration = "manual";

bindTexts();
renderHero(); // starts downloading hero.jpg while the lock screen is up
const petals = initPetals($(".petals"), { calm });
petals.ambient(true);
const music = initMusic(config.music, $(".music"));
renderStory();
present(config.gallery).then((items) => initGallery($(".gallery"), items, { photo }));
initClip($(".clip"), config.clip, { calm });
initLetter($(".letter"), { src: config.message, fallback: config.sections.letter.fallback }, { calm });
initFinale($(".finale"), { ...config.final, alt: together, cover: config.sections.final.cover }, { photo, burst: petals.burst });

if (isLocal && new URLSearchParams(location.search).has("dev")) {
  open(false);
} else {
  showLock();
  initLock($(".lock-card"), config.lock, () => open(true));
}

function bindTexts() {
  for (const el of document.querySelectorAll("[data-text]")) {
    const text = el.dataset.text.split(".").reduce((value, key) => value?.[key], config);
    if (text) el.textContent = text;
    else el.hidden = true;
  }
}

// Fills a .photo frame. Without a src, or if the file fails, the frame's gradient stays as the placeholder.
function photo(frame, { src, focus, alt }, { eager = false } = {}) {
  if (!src) return frame.classList.add("is-placeholder");
  const img = new Image();
  img.alt = alt;
  img.decoding = "async";
  if (eager) img.fetchPriority = "high";
  else img.loading = "lazy";
  img.style.objectPosition = focus || "center";
  img.addEventListener("error", () => {
    img.remove();
    frame.classList.add("is-placeholder");
  }, { once: true });
  img.src = src;
  frame.append(img);
}

function renderHero() {
  const { src, focus, date } = config.hero;
  photo($(".hero-photo"), { src, focus, alt: together }, { eager: true });

  const stamp = $(".hero-stamp");
  if (!date) return stamp.remove();
  let x = 0;
  let end = 0;
  for (const char of date) {
    for (const key of DIGITS[char] ?? "") {
      const [sx, sy, w, h] = SEGMENTS[key];
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      for (const [name, value] of Object.entries({ x: x + sx, y: sy, width: w, height: h, rx: 0.8 })) {
        rect.setAttribute(name, value);
      }
      stamp.append(rect);
      end = x + 10;
    }
    x += char === " " ? 7 : 13;
  }
  stamp.setAttribute("viewBox", `-1 -1 ${end + 2} 20`);
  stamp.setAttribute("aria-label", date);
}

// Keeps the entries whose photo exists, checked up front (while she is still on the lock screen) so
// nothing jumps later. One request at a time is plenty fast and spares small servers a burst.
// Only a real "not found" drops a photo; a network hiccup keeps it and lets the image itself try.
// If none exist yet, all entries stay as placeholders so the section is still there to test.
async function present(list) {
  const kept = [];
  for (const item of list) {
    const found = await fetch(item.src, { method: "HEAD" }).then((r) => r.ok, () => true);
    if (found) kept.push(item);
  }
  return kept.length ? kept : list.map(({ src, ...rest }) => rest);
}

async function renderStory() {
  const items = await present(config.story);
  if (!items.length) {
    $(".story").hidden = true;
    return;
  }
  const list = $(".milestones");
  const template = $("#tpl-milestone");
  items.forEach(({ src, caption, focus }, index) => {
    const item = template.content.firstElementChild.cloneNode(true);
    item.style.setProperty("--tilt", `${index % 2 ? 1.2 : -1.4}deg`);
    photo($(".photo", item), { src, focus, alt: caption || together });
    $(".milestone-caption", item).textContent = caption ?? "";
    list.append(item);
  });
  revealOnScroll(list.children);

  const flower = $(".stem-flower");
  if (calm) {
    $(".stem-grow").style.transform = "none";
    flower.classList.add("is-in");
  } else {
    growStem($(".timeline"), $(".stem-grow"), () => flower.classList.add("is-in"));
  }
}

// Fade the card in once the handwriting font is there, so the question never flashes in a fallback font.
async function showLock() {
  const font = document.fonts.load('300 30px "Playwrite VN"').catch(() => {});
  await Promise.race([font, new Promise((resolve) => setTimeout(resolve, 1200))]);
  $(".lock").classList.add("is-ready");
}

async function open(withReveal) {
  music.play(); // first, while still inside the unlock gesture
  const main = $("#main");
  main.hidden = false;

  if (withReveal) {
    petals.scatter($(".lock-card").getBoundingClientRect());
    $(".lock").classList.add("is-leaving");
    await bloom($(".reveal"), { calm });
  }

  $(".lock").remove();
  $(".backdrop").classList.add("is-gone");
  $(".reveal").classList.add("is-done");
  html.classList.replace("is-locked", "is-open");
  main.inert = false;
  scrollTo(0, 0);
  music.show();

  // Petals fall while the hero is on screen; the back-to-top button takes over once it's scrolled away.
  const toTop = $(".to-top");
  toTop.addEventListener("click", () => scrollTo({ top: 0 }));
  new IntersectionObserver(([entry]) => {
    const heroInView = entry.intersectionRatio >= 0.3;
    petals.ambient(heroInView);
    toTop.classList.toggle("is-shown", !heroInView);
  }, { threshold: [0, 0.3] }).observe($(".hero"));
  setTimeout(() => {
    $(".backdrop").remove();
    $(".reveal").remove();
  }, 1000);
}
