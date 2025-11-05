/* calendar.js — Emi-memo Advent (bez podtytułu; URL-sync dla file://; zielone „wykonane”) */
const STORAGE_KEY = "emiMemoAdvent2025";

const state = {
  level: localStorage.getItem(STORAGE_KEY + ":level") || "base",
  done:  JSON.parse(localStorage.getItem(STORAGE_KEY + ":done") || "[]"),
  start: localStorage.getItem(STORAGE_KEY + ":start") || ""
};

const els = {
  calendar:     document.getElementById("calendar"),
  levelSelect:  document.getElementById("levelSelect"),
  startDate:    document.getElementById("startDate"),
  progressInfo: document.getElementById("progressInfo"),
  openTodayBtn: document.getElementById("openTodayBtn"),
  resetBtn:     document.getElementById("resetBtn")
};

const DATA = window.ADVENT_TASKS || { base: [], adv: [] };
const getTasks = () => (state.level === "adv" ? (DATA.adv || []) : (DATA.base || []));

/* ===== helpers ===== */
function ensureDoneArray(){
  if (!Array.isArray(state.done)) state.done = [];
  for (let i=0;i<24;i++){
    if (typeof state.done[i] === "undefined") state.done[i] = false;
  }
}

function startDateObj(){ return new Date(state.start + "T00:00:00"); }
function todayIndex(){
  const start = startDateObj();
  const now   = new Date();
  const ms    = now.setHours(0,0,0,0) - start.setHours(0,0,0,0);
  const days  = Math.floor(ms / 86400000) + 1; // 1..24
  return Math.max(0, Math.min(24, days));
}
function save(){
  localStorage.setItem(STORAGE_KEY + ":level", state.level);
  localStorage.setItem(STORAGE_KEY + ":done", JSON.stringify(state.done));
  localStorage.setItem(STORAGE_KEY + ":start", state.start);
}
function syncFromStorage(){
  try{
    state.done  = JSON.parse(localStorage.getItem(STORAGE_KEY + ":done") || "[]");
    state.level = localStorage.getItem(STORAGE_KEY + ":level") || state.level;
    state.start = localStorage.getItem(STORAGE_KEY + ":start") || state.start;
  }catch{}
  ensureDoneArray();
}

/* Pobierz i zastosuj synchronizację „file://” z URL, np. ?sync=5:1  */
function applyUrlSync(){
  const params = new URLSearchParams(location.search);
  const sync = params.get("sync"); // "DAY:VAL" → "5:1" (true) / "5:0" (false)
  if (!sync) return;

  const [dStr, vStr] = sync.split(":");
  const d = parseInt(dStr, 10);
  const v = vStr === "1";

  if (Number.isInteger(d) && d>=1 && d<=24) {
    ensureDoneArray();
    state.done[d-1] = v;
    save();
  }
  // wyczyść parametr, żeby nie stosować drugi raz przy F5
  history.replaceState({}, document.title, location.pathname);
}

/* ===== render ===== */
function render(){
  syncFromStorage();

  els.levelSelect.value = state.level;
  els.startDate.value   = state.start;

  const doneCount = (state.done || []).filter(Boolean).length;
  els.progressInfo.textContent = `Postęp: ${doneCount}/24`;

  const unlockTo = todayIndex();
  els.openTodayBtn.disabled = (unlockTo === 0);
  els.openTodayBtn.classList.toggle("secondary", unlockTo === 0);

  // 24 kafelki
  els.calendar.innerHTML = "";
  for (let i = 0; i < 24; i++) {
    const day = i + 1;
    const unlocked = day <= unlockTo;
    const isDone = !!state.done[i];
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

    // baza
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

    // kolorystyka
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

/* ===== events ===== */
els.levelSelect.addEventListener("change", ()=>{ state.level = els.levelSelect.value; save(); render(); });
els.startDate.addEventListener("change", ()=>{ state.start = els.startDate.value || ""; save(); render(); });

els.resetBtn.addEventListener("click", ()=>{
  if (confirm("Usunąć wszystkie oznaczenia ✔︎?")) {
    state.done = []; save(); render();
  }
});

els.openTodayBtn.addEventListener("click", ()=>{
  const unlockTo = todayIndex();
  if (unlockTo === 0) return;
  const idx = Math.max(0, Math.min(23, unlockTo - 1));
  window.location.assign(`./task.html?day=${idx+1}&level=${state.level}`);
});

// Klik w kafelek → przejście, jeśli odblokowany
els.calendar.addEventListener("click", (e)=>{
  const a = e.target.closest("a.game-button");
  if (!a) return;
  const unlocked = a.dataset.unlocked === "1";
  const targetHref = a.dataset.href;
  e.preventDefault();
  if (!unlocked) return;
  if (targetHref) window.location.assign(targetHref);
});

/* ===== init ===== */
(function init(){
  if (!state.start) {
    state.start = new Date().toISOString().slice(0,10);
    save();
  }
  applyUrlSync();   // ← odbierz sync z taska (ważne dla file://)
  render();
})();
