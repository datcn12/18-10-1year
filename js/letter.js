const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function initLetter(section, { src, fallback }, { calm }) {
  const envelope = section.querySelector(".envelope");
  const paper = section.querySelector(".letter-paper");
  const greeting = paper.querySelector(".letter-greeting");
  const body = paper.querySelector(".letter-body");
  const signature = paper.querySelector(".letter-signature");
  const skip = paper.querySelector(".letter-skip");
  const text = fetch(src).then((r) => (r.ok ? r.text() : ""), () => "");
  let skipped = calm;

  skip.addEventListener("click", () => {
    skipped = true;
    skip.hidden = true;
    for (const el of paper.querySelectorAll(".is-pending")) el.classList.remove("is-pending");
  });

  envelope.addEventListener("click", async () => {
    envelope.disabled = true;
    envelope.classList.add("is-opening");
    const letter = parse(await text, fallback);
    await wait(calm ? 0 : 1100);
    envelope.classList.add("is-gone");
    await wait(calm ? 0 : 350);
    envelope.hidden = true;
    open(letter);
  }, { once: true });

  async function open(letter) {
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
      skip.hidden = true;
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
        skip.hidden = true;
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
