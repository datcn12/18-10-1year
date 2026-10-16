const DEPTH = 3; // cards visible in the pile

export function initGallery(section, items, { photo }) {
  if (!items.length) return section.remove();

  const stack = section.querySelector(".stack");
  const template = document.querySelector("#tpl-polaroid");
  const cards = items.map((item) => {
    const el = template.content.firstElementChild.cloneNode(true);
    el.querySelector(".polaroid-caption").textContent = item.caption ?? "";
    stack.append(el);
    return { el, item, tilt: (Math.random() * 2 - 1) * 6, filled: false };
  });
  const lightbox = initLightbox(photo);
  const order = cards.map((_, index) => index);
  let busy = false;
  let drag = null;
  let lastDrag = -Infinity;

  const top = () => cards[order[0]];
  // Photos load only once their card is about to be seen, not all at once.
  const fill = (card) => {
    if (card.filled) return;
    card.filled = true;
    photo(card.el.querySelector(".photo"), { ...card.item, alt: card.item.caption ?? "" });
  };
  const rest = (card, depth) => {
    const d = Math.min(depth, DEPTH - 1);
    return `translate3d(0, ${d * 10}px, 0) scale(${1 - d * 0.04}) rotate(${card.tilt}deg)`;
  };

  const layout = () => {
    const hadFocus = stack.contains(document.activeElement);
    order.forEach((index, depth) => {
      const { el } = cards[index];
      el.style.zIndex = String(order.length - depth);
      el.style.transform = rest(cards[index], depth);
      el.style.opacity = depth < DEPTH ? "1" : "0";
      el.setAttribute("aria-hidden", String(depth > 0));
      el.querySelector(".polaroid-open").tabIndex = depth === 0 ? 0 : -1;
      if (depth <= DEPTH) fill(cards[index]);
    });
    fill(cards[order[order.length - 1]]); // the card prev() would bring back
    if (hadFocus) top().el.querySelector(".polaroid-open").focus({ preventScroll: true });
  };

  // Sends the top card flying, then tucks it under the pile.
  const next = (direction = 1) => {
    if (busy || order.length < 2) return;
    busy = true;
    const card = top();
    card.el.classList.remove("is-dragging");
    card.el.style.transform = `translate3d(${direction * 130}%, -6%, 0) rotate(${card.tilt + direction * 22}deg)`;
    setTimeout(() => {
      order.push(order.shift());
      layout();
      busy = false;
    }, 320);
  };

  // Brings the bottom card back in from the left, on top.
  const prev = () => {
    if (busy || order.length < 2) return;
    busy = true;
    order.unshift(order.pop());
    const { el, tilt } = top();
    el.style.transition = "none";
    el.style.zIndex = String(order.length + 1);
    el.style.opacity = "1";
    el.style.transform = `translate3d(-130%, -6%, 0) rotate(${tilt - 22}deg)`;
    el.getBoundingClientRect();
    el.style.transition = "";
    layout();
    setTimeout(() => (busy = false), 320);
  };

  stack.addEventListener("pointerdown", (event) => {
    const card = top();
    if (busy || event.button > 0 || !card.el.contains(event.target)) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, t: event.timeStamp, vx: 0, moved: false };
    card.el.setPointerCapture(event.pointerId);
    card.el.classList.add("is-dragging");
  });

  stack.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.vx = (dx - drag.dx) / Math.max(1, event.timeStamp - drag.t);
    drag.dx = dx;
    drag.t = event.timeStamp;
    if (Math.abs(dx) > 6) drag.moved = true;
    const card = top();
    card.el.style.transform = `translate3d(${dx}px, ${dy * 0.25}px, 0) rotate(${card.tilt + dx * 0.06}deg)`;
  });

  const release = (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const { dx, vx, moved } = drag;
    drag = null;
    const card = top();
    card.el.classList.remove("is-dragging");
    if (moved) lastDrag = event.timeStamp;
    const flung = Math.abs(dx) > card.el.offsetWidth * 0.28 || Math.abs(vx) > 0.6;
    if (event.type === "pointerup" && moved && flung) next(Math.sign(dx));
    else card.el.style.transform = rest(card, 0);
  };
  stack.addEventListener("pointerup", release);
  stack.addEventListener("pointercancel", release);

  stack.addEventListener("click", (event) => {
    if (event.timeStamp - lastDrag < 400) return; // the click that ends a drag
    if (top().el.contains(event.target)) lightbox(top().item);
  });

  stack.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") next(1);
    if (event.key === "ArrowLeft") prev();
  });

  section.querySelector(".stack-next").addEventListener("click", () => next(1));
  section.querySelector(".stack-prev").addEventListener("click", prev);
  section.querySelector(".stack-nav").hidden = cards.length < 2;
  layout();
}

function initLightbox(photo) {
  const dialog = document.querySelector(".lightbox");
  const frame = dialog.querySelector(".lightbox-photo");
  const caption = dialog.querySelector(".lightbox-caption");

  dialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => document.documentElement.classList.remove("no-scroll"));

  return ({ src, caption: text = "", focus }) => {
    frame.replaceChildren();
    frame.classList.remove("is-placeholder");
    photo(frame, { src, focus, alt: text }, { eager: true });
    caption.textContent = text;
    dialog.showModal();
    document.documentElement.classList.add("no-scroll");
  };
}
