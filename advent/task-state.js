/* task-state.js — stan wykonania dnia, odporny na dynamiczne tworzenie przycisków */
(function () {
  const STORAGE_KEY = "emiMemoAdvent2025";
  const params = new URLSearchParams(location.search);
  const day = Math.max(1, Math.min(24, parseInt(params.get("day") || "1", 10)));
  const level = (params.get("level") === "adv") ? "adv" : "base";

  let undoBtn = null; // „Cofnij wykonanie”
  let markBtn = null; // „Zaznacz jako wykonane”
  let observer = null;

  function loadDone(lvl) {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}:done:${lvl}`) || "[]";
      let arr = JSON.parse(raw);
      if (!Array.isArray(arr)) arr = [];
      for (let i = 0; i < 24; i++) if (typeof arr[i] === "undefined") arr[i] = false;
      return arr;
    } catch {
      return new Array(24).fill(false);
    }
  }
  function saveDone(lvl, arr) {
    localStorage.setItem(`${STORAGE_KEY}:done:${lvl}`, JSON.stringify(arr));
    // ping dla kalendarza i innych kart
    localStorage.setItem(`${STORAGE_KEY}:ts`, String(Date.now()));
  }
  function isDone() {
    const done = loadDone(level);
    return !!done[day - 1];
  }
  function setDone(v) {
    const arr = loadDone(level);
    arr[day - 1] = !!v;
    saveDone(level, arr);
  }
  function applyUndoVisibility() {
    if (!undoBtn) return;
    undoBtn.style.display = isDone() ? "" : "none";
  }

  function bindButtonsIfPresent(root = document) {
    // jeśli już zbindowane – nic nie rób
    if (undoBtn && markBtn) return true;

    const u = root.getElementById ? root.getElementById("undoBtn") : document.getElementById("undoBtn");
    const m = root.getElementById ? root.getElementById("markBtn") : document.getElementById("markBtn");

    if (u && !undoBtn) {
      undoBtn = u;
      undoBtn.addEventListener("click", () => {
        if (!isDone()) { applyUndoVisibility(); return; }
        setDone(false);
        applyUndoVisibility();
      });
    }
    if (m && !markBtn) {
      markBtn = m;
      markBtn.addEventListener("click", () => {
        if (isDone()) { applyUndoVisibility(); return; }
        setDone(true);
        applyUndoVisibility();
      });
    }
    if (undoBtn || markBtn) applyUndoVisibility();
    return !!(undoBtn && markBtn);
  }

  function startObserving() {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (bindButtonsIfPresent(document)) {
        // Gdy już znaleziono, można przerwać obserwację
        observer.disconnect();
        observer = null;
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Zmiany z innych zakładek / „Wyczyść” w kalendarzu
  window.addEventListener("storage", (e) => {
    if (!e.key) return;
    if (e.key === `${STORAGE_KEY}:done:${level}` || e.key === `${STORAGE_KEY}:ts`) {
      applyUndoVisibility();
    }
  });

  // DOM gotowy → spróbuj podpiąć przyciski, w razie czego obserwuj DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!bindButtonsIfPresent(document)) startObserving();
      applyUndoVisibility();
    });
  } else {
    if (!bindButtonsIfPresent(document)) startObserving();
    applyUndoVisibility();
  }
})();
