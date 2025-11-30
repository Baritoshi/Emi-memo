/* calendar.js — Emi-memo Advent
   - Start na sztywno: 2025-12-01
   - Pole zmiany daty: ukryte (etykieta też), ale NIE ukrywamy całego wiersza z innymi przyciskami
   - „Wyczyść” usunięty z UI i logiki
   - Oddzielne stany wykonania dla base/adv
*/

const STORAGE_KEY = "emiMemoAdvent2025";
const START_ISO   = "2025-12-01"; // stała data startu

const state = {
  level: localStorage.getItem(STORAGE_KEY + ":level") || "base"
};

const els = {
  calendar:     document.getElementById("calendar"),
  levelSelect:  document.getElementById("levelSelect"),
  progressInfo: document.getElementById("progressInfo"),
  openTodayBtn: document.getElementById("openTodayBtn"),
  resetBtn:     document.getElementById("resetBtn")     // usuwamy z DOM
};

const DATA = window.ADVENT_TASKS || { base: [], adv: [] };
const getTasks = () => (state.level === "adv" ? (DATA.adv || []) : (DATA.base || []));

/* ===== helpers ===== */
function ensure24(arr){
  const out = Array.isArray(arr) ? arr.slice() : [];
  for (let i=0;i<24;i++) if (typeof out[i]==="undefined") out[i]=false;
  return out.slice(0,24);
}
function loadDone(level){
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:done:${level}`) || "[]";
    return ensure24(JSON.parse(raw));
  } catch { return ensure24([]); }
}
function saveDone(level, arr){
  localStorage.setItem(`${STORAGE_KEY}:done:${level}`, JSON.stringify(ensure24(arr)));
  localStorage.setItem(`${STORAGE_KEY}:ts`, String(Date.now()));
}
function saveLevel(){
  localStorage.setItem(STORAGE_KEY + ":level", state.level);
}

function startDateObj(){ return new Date(START_ISO + "T00:00:00"); }
function todayIndex(){
  // zwraca 0..24 (0 = nic nieodblokowane)
  const start = startDateObj();
  const now   = new Date();
  const ms    = now.setHours(0,0,0,0) - start.setHours(0,0,0,0);
  const days  = Math.floor(ms / 86400000) + 1; // 1..24
  return Math.max(0, Math.min(24, days));
}

/* „file://” sync z URL: ?sync=5:1&level=adv */
function applyUrlSync(){
  const params = new URLSearchParams(location.search);
  const sync = params.get("sync"); // "DAY:VAL" → "5:1" / "5:0"
  if (!sync) return;

  const [dStr, vStr] = sync.split(":");
  const d = parseInt(dStr, 10);
  const v = vStr === "1";

  const urlLevel = params.get("level")==="adv" ? "adv" : (params.get("level")==="base" ? "base" : state.level);

  if (Number.isInteger(d) && d>=1 && d<=24) {
    const arr = loadDone(urlLevel);
    arr[d-1] = v;
    saveDone(urlLevel, arr);
  }
  history.replaceState({}, document.title, location.pathname);
}

/* ===== render ===== */
function render(){
  state.level = localStorage.getItem(STORAGE_KEY + ":level") || state.level;


  // Usuń przycisk „Wyczyść”, jeśli istnieje w HTML
  if (els.resetBtn && els.resetBtn.parentElement) {
    els.resetBtn.parentElement.removeChild(els.resetBtn);
  }

  if (els.levelSelect) els.levelSelect.value = state.level;

  const doneArr   = loadDone(state.level);
  const doneCount = doneArr.filter(Boolean).length;
  if (els.progressInfo) els.progressInfo.textContent = `Postęp: ${doneCount}/24`;

  const unlockTo = todayIndex();
  if (els.openTodayBtn) {
    els.openTodayBtn.disabled = (unlockTo === 0);
    els.openTodayBtn.classList.toggle("secondary", unlockTo === 0);
    els.openTodayBtn.style.display = ""; // upewnij się, że widać
  }

  if (els.calendar) {
    els.calendar.innerHTML = "";
    for (let i = 0; i < 24; i++) {
      const day = i + 1;
      const unlocked = day <= unlockTo;
      const isDone = !!doneArr[i];
      const href = `./task.html?day=${day}&level=${state.level}`;

      const a = document.createElement("a");
      a.className = "game-button";
      a.dataset.day = String(day);
      a.dataset.unlocked = unlocked ? "1" : "0";
      a.dataset.href = href;
      a.dataset.done = isDone ? "1" : "0";
      a.href = unlocked ? href : "#";
      a.title = isDone ? `Dzień ${day} – wykonane` : `Dzień ${day}`;
      a.setAttribute("aria-label", `Dzień ${day}${isDone ? " – wykonane" : ""}`);

      a.style.position    = "relative";
      a.style.display     = "grid";
      a.style.placeItems  = "center";
      a.style.minHeight   = "86px";
      a.style.aspectRatio = "1 / 1";
      a.style.fontSize    = "22px";
      a.style.fontWeight  = "800";
      a.style.color       = "#fff";
      a.style.opacity     = unlocked ? "1" : "0.55";
      a.style.cursor      = unlocked ? "pointer" : "not-allowed";

      if (isDone) {
        a.classList.add("is-done");
        a.style.setProperty("background", "var(--ok)", "important");
        a.style.setProperty("border", "2px solid var(--gold)", "important");

        const badge = document.createElement("span");
        badge.textContent = "✓";
        badge.style.position = "absolute";
        badge.style.top = "6px";
        badge.style.right = "8px";
        badge.style.fontWeight = "800";
        badge.style.color = "#fff";
        badge.setAttribute("aria-hidden", "true");
        a.appendChild(badge);
      } else {
        a.style.background = "var(--card)";
        a.style.border = "1px solid rgba(255,255,255,.18)";
      }

      a.appendChild(document.createTextNode(String(day)));
      els.calendar.appendChild(a);
    }
  }
}

/* ===== events ===== */
if (els.levelSelect) {
  els.levelSelect.addEventListener("change", ()=>{
    state.level = els.levelSelect.value;
    saveLevel();
    render();
  });
}

// „Otwórz dzisiejsze”
if (els.openTodayBtn) {
  els.openTodayBtn.addEventListener("click", ()=>{
    const unlockTo = todayIndex();
    if (unlockTo === 0) return;
    const idx = Math.max(0, Math.min(23, unlockTo - 1));
    window.location.assign(`./task.html?day=${idx+1}&level=${state.level}`);
  });
}

// Klik w kafelek → przejście, jeśli odblokowany
if (els.calendar) {
  els.calendar.addEventListener("click", (e)=>{
    const a = e.target.closest("a.game-button");
    if (!a) return;
    const unlocked = a.dataset.unlocked === "1";
    const targetHref = a.dataset.href;
    e.preventDefault();
    if (!unlocked) return;
    if (targetHref) window.location.assign(targetHref);
  });
}

// Reaguj na zmiany z innych kart (np. task → „Zaznacz jako wykonane”)
window.addEventListener("storage", (e)=>{
  if (!e.key) return;
  if (e.key === `${STORAGE_KEY}:done:base` ||
      e.key === `${STORAGE_KEY}:done:adv`  ||
      e.key === `${STORAGE_KEY}:level`     ||
      e.key === `${STORAGE_KEY}:ts`) {
    render();
  }
});

/* ===== init ===== */
(function init(){
  applyUrlSync(); // odbierz sync z taska (opcjonalnie file://)
  render();
})();
