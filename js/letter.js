const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initLetter(section, { src, fallback, bouquet }, { calm }) {
  const envelope = section.querySelector(".envelope");
  const paper = section.querySelector(".letter-paper");
  const greeting = paper.querySelector(".letter-greeting");
  const body = paper.querySelector(".letter-body");
  const signature = paper.querySelector(".letter-signature");
  const skip = paper.querySelector(".letter-skip");
  const text = fetch(src).then((r) => (r.ok ? r.text() : ""), () => "");
  const flowers = initBouquet(section, paper, bouquet);
  let skipped = calm;
  let turnable = false;
  let turning = false;

  skip.addEventListener("click", () => {
    skipped = true;
    skip.hidden = true;
    for (const el of paper.querySelectorAll(".is-pending")) el.classList.remove("is-pending");
  });
  paper.addEventListener("click", turn);

  envelope.addEventListener("click", async () => {
    envelope.disabled = true;
    envelope.classList.add("is-opening");
    const letter = parse(await text, fallback);
    if (!calm && flowers?.ready()) {
      // The flap opens, then the bouquet covers the screen while the envelope turns into the letter under it.
      await wait(450);
      await flowers.burst(envelope);
      envelope.hidden = true;
      open(letter, flowers.land);
      return;
    }
    await wait(calm ? 0 : 1100);
    envelope.classList.add("is-gone");
    await wait(calm ? 0 : 350);
    envelope.hidden = true;
    open(letter);
  }, { once: true });

  async function open(letter, settle) {
    const paragraphs = letter.paragraphs.map((line) => Object.assign(document.createElement("p"), { textContent: line }));
    body.replaceChildren(...paragraphs);
    signature.textContent = letter.signature;
    const [first, ...rest] = paragraphs;
    const later = [...rest, signature].filter((el) => el.textContent);
    for (const el of later) el.classList.add("is-pending");
    if (first) first.textContent = "";

    skip.hidden = skipped;
    paper.hidden = false;
    paper.tabIndex = -1;
    paper.focus({ preventScroll: true });
    paper.getBoundingClientRect();
    paper.classList.add("is-in");
    await settle?.();

    // Only the opening is typed out; the rest appears paragraph by paragraph as she reads.
    const typed = letter.greeting.length + (letter.paragraphs[0]?.length ?? 0);
    const delay = Math.min(40, Math.max(14, 5000 / typed));
    await wait(skipped ? 0 : 500);
    await type(greeting, letter.greeting, delay);
    if (first) await type(first, letter.paragraphs[0], delay);
    revealInTurn(later);
  }

  async function type(el, value, delay) {
    if (!skipped) {
      el.classList.add("is-typing");
      let shown = "";
      for (const char of Array.from(value)) {
        if (skipped) break;
        shown += char;
        el.textContent = shown;
        await wait(delay);
      }
      el.classList.remove("is-typing");
    }
    el.textContent = value;
  }

  function revealInTurn(blocks) {
    const queue = blocks.filter((el) => el.classList.contains("is-pending"));
    if (!queue.length) {
      finish();
      return;
    }
    const visible = new Set();
    let resting = false;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) visible.add(entry.target);
      pump();
    }, { rootMargin: "0px 0px -8% 0px" });

    const pump = () => {
      if (resting || !queue.length) return;
      if (!skipped && !visible.has(queue[0])) return;
      queue.shift().classList.remove("is-pending");
      if (!queue.length) {
        finish();
        observer.disconnect();
        return;
      }
      resting = true;
      setTimeout(() => {
        resting = false;
        pump();
      }, skipped ? 0 : 450);
    };

    for (const el of queue) observer.observe(el);
  }

  // The whole letter is out: from now on she can turn it over, if there is a bouquet on the back.
  function finish() {
    skip.hidden = true;
    if (!paper.querySelector(".letter-back")) return;
    turnable = true;
    paper.classList.add("is-turnable");
  }

  // Turns the paper like a card: edge-on halfway, where the front swaps for the back unseen.
  async function turn() {
    if (!turnable || turning) return;
    turning = true;
    const side = paper.classList.contains("is-turned") ? -1 : 1;
    if (calm) {
      paper.classList.toggle("is-turned");
    } else {
      // around the middle of what she sees, so the perspective looks right however long the letter is
      paper.style.transformOrigin = `50% ${innerHeight / 2 - paper.getBoundingClientRect().top}px`;
      const away = swing(0, 90 * side, "cubic-bezier(.55,0,1,.45)", 320);
      await away.finished;
      paper.classList.toggle("is-turned");
      const back = swing(-90 * side, 0, "cubic-bezier(.22,1,.36,1)", 480);
      await back.finished;
      away.cancel();
      back.cancel();
    }
    turning = false;
  }

  function swing(from, to, easing, duration) {
    return paper.animate([
      { transform: `perspective(1600px) rotateY(${from}deg)` },
      { transform: `perspective(1600px) rotateY(${to}deg)` },
    ], { duration, easing, fill: "forwards" });
  }
}

// The real bouquet: invisible until the letter opens, then it bursts out of the envelope toward her and
// settles back onto the paper, melting into a blurred copy of itself that stays as the letter's background.
// A sharp copy waits on the back of the letter. Without a src, or if the file fails, the letter is just a letter.
function initBouquet(section, paper, { src, fallback } = {}) {
  const picture = section.querySelector(".bouquet");
  const backdrop = paper.querySelector(".letter-backdrop");
  const back = paper.querySelector(".letter-back");
  const img = picture.querySelector("img");
  const remove = () => {
    picture.remove();
    backdrop.remove();
    back.remove();
  };
  if (!src) {
    remove();
    return null;
  }
  picture.querySelector("source").srcset = src;
  img.addEventListener("error", remove, { once: true });
  img.src = fallback || src;
  picture.hidden = false;
  const copy = picture.cloneNode(true);
  copy.className = "letter-backdrop-photo";
  backdrop.append(copy);
  const print = picture.cloneNode(true);
  print.className = "letter-back-photo";
  back.append(print);

  // While flying, the bouquet is fixed at the top-left corner of the screen; this puts its center at x, y.
  const at = (x, y, scale, turn = 0) =>
    `translate(${x - picture.offsetWidth / 2}px, ${y - picture.offsetHeight / 2}px) rotate(${turn}deg) scale(${scale})`;
  let flight;
  let peak;

  return {
    ready: () => picture.isConnected && img.complete && img.naturalWidth > 0,

    // From the envelope's mouth to past the edges of the screen. Resolves once it covers the screen.
    burst(envelope) {
      const mouth = envelope.getBoundingClientRect();
      const { clientWidth: width, clientHeight: height } = document.documentElement;
      peak = at(width / 2, height / 2, (height / picture.offsetHeight) * 1.7);
      picture.classList.add("is-flying");
      flight = picture.animate([
        { transform: at(mouth.left + mouth.width / 2, mouth.top + mouth.height * 0.3, 0.2, -12) },
        { transform: peak },
      ], { duration: 1500, easing: "cubic-bezier(.33,1,.68,1)", fill: "forwards" });
      picture.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: "forwards" });
      return wait(750);
    },

    // Back down onto the paper's blurred copy (cover-fitted and scaled in CSS), fading into it on the way.
    async land() {
      await flight.finished;
      const photo = copy.querySelector("img");
      const box = photo.getBoundingClientRect();
      const cover = Math.max(photo.offsetWidth / picture.offsetWidth, photo.offsetHeight / picture.offsetHeight);
      const target = at(box.left + box.width / 2, box.top + box.height / 2, cover * (box.width / photo.offsetWidth));
      const settle = picture.animate([{ transform: peak }, { transform: target }], {
        duration: 1200,
        easing: "cubic-bezier(.65,0,.35,1)",
        fill: "forwards",
      });
      picture.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: 1200, fill: "forwards" });
      await settle.finished;
      picture.remove();
    },
  };
}

// First line = greeting, last line = signature, blank lines split paragraphs.
function parse(raw, fallback) {
  const clean = raw.normalize("NFC").replace(/\r\n?/g, "\n").trim();
  if (!clean) return { greeting: fallback, paragraphs: [], signature: "" };
  const lines = clean.split("\n");
  const greeting = lines.shift().trim();
  const signature = lines.length ? lines.pop().trim() : "";
  const paragraphs = lines.join("\n").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return { greeting, paragraphs, signature };
}
