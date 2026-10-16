export function initMusic({ src, title, artist }, pill) {
  const audio = new Audio();
  audio.loop = true;
  audio.preload = "none";
  audio.src = src;
  let missing = false;
  let resumeOnReturn = false;

  pill.querySelector(".music-label").textContent = `${title} - ${artist}`;

  const sync = () => {
    const playing = !audio.paused;
    pill.classList.toggle("is-playing", playing);
    pill.setAttribute("aria-pressed", String(playing));
  };

  // If the browser still refuses (no gesture, e.g. ?dev), her next tap anywhere starts it.
  const play = () =>
    audio.play().catch((error) => {
      if (error.name === "NotAllowedError") document.addEventListener("click", play, { once: true });
    });

  audio.addEventListener("play", sync);
  audio.addEventListener("pause", sync);
  audio.addEventListener("error", () => {
    missing = true;
    pill.hidden = true;
  });
  pill.addEventListener("click", () => (audio.paused ? play() : audio.pause()));

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      resumeOnReturn = !audio.paused;
      audio.pause();
    } else if (resumeOnReturn) {
      play();
    }
  });

  return {
    play,
    show() {
      if (!missing) pill.hidden = false;
    },
  };
}
