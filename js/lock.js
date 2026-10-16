// Synchronous on purpose: onUnlock must run inside the same user gesture so audio.play() is allowed.
export function initLock(form, { answer }, onUnlock) {
  const input = form.querySelector(".lock-input");
  const row = form.querySelector(".lock-row");
  const hint = form.querySelector(".lock-hint");
  const expected = atob(answer).normalize("NFC");
  let unlocked = false;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (unlocked) return;
    const guess = input.value.trim().normalize("NFC");
    if (!guess) {
      input.focus();
      return;
    }
    if (guess === expected) {
      unlocked = true;
      input.blur();
      onUnlock();
      return;
    }
    if (hint.hidden) hint.hidden = false;
    else replay(hint, "is-nudged");
    replay(row, "is-wrong");
    input.focus();
    input.select();
    navigator.vibrate?.(60);
  });
}

function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}
