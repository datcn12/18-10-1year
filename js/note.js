const FLY_MS = 800;

// The closing section: what she writes lands as a row (time, message) in your Google Sheet,
// through the Apps Script web app in scripts/note-sheet.gs. show() reveals it once the scratch card is done.
export function initNote(section, { endpoint, placeholder, sending, failed } = {}, { burst, calm }) {
  if (!endpoint) return { show() {} };
  const form = section.querySelector(".note");
  const text = form.querySelector(".note-text");
  const trap = form.querySelector(".note-trap");
  const send = form.querySelector(".note-send");
  const status = form.querySelector(".note-status");
  const done = section.querySelector(".note-done");
  text.placeholder = placeholder ?? "";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const message = text.value.trim();
    if (!message) {
      text.focus();
      return;
    }
    send.disabled = true;
    form.classList.add("is-sending");
    status.textContent = sending ?? "";
    try {
      // A plain form post: no CORS preflight, which Apps Script can't answer.
      const response = await fetch(endpoint, { method: "POST", body: new URLSearchParams({ message, website: trap.value }) });
      if (!(await response.json()).ok) throw new Error("not saved");
      status.textContent = "";
      form.classList.add("is-flying");
      await new Promise((resolve) => setTimeout(resolve, calm ? 0 : FLY_MS));
      form.hidden = true;
      done.hidden = false;
      const heart = done.querySelector(".note-heart").getBoundingClientRect();
      burst(heart.left + heart.width / 2, heart.top + heart.height / 2, { count: 14, hearts: true });
    } catch {
      status.textContent = failed ?? "";
      form.classList.remove("is-shaking");
      void form.offsetWidth;
      form.classList.add("is-shaking");
    } finally {
      send.disabled = false;
      form.classList.remove("is-sending");
    }
  });

  done.querySelector(".note-again").addEventListener("click", () => {
    text.value = "";
    form.classList.remove("is-flying", "is-shaking");
    form.classList.add("is-again");
    done.hidden = true;
    form.hidden = false;
    text.focus();
  });

  return {
    show() {
      section.hidden = false;
    },
  };
}
