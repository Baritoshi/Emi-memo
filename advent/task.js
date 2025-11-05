/* task.js — bez prev/next; zapis + URL-sync do kalendarza (działa z file://) */
const STORAGE_KEY = "emiMemoAdvent2025";
const params = new URLSearchParams(location.search);

// Parametry URL
let day   = Math.max(1, Math.min(24, Number(params.get("day") || 1)));
let level = (params.get("level")==="adv") ? "adv" : "base";

const els = {
  progressInfo: document.getElementById("progressInfo"),
  taskTitle: document.getElementById("taskTitle"),
  taskMeta: document.getElementById("taskMeta"),
  taskContent: document.getElementById("taskContent"),
  taskTeaser: document.getElementById("taskTeaser"),
  taskCard: document.getElementById("taskCard"),
  markBtn: document.getElementById("markBtn")
};

const DATA = window.ADVENT_TASKS || { base: [], adv: [] };
const tasks = (level==="adv") ? (DATA.adv||[]) : (DATA.base||[]);

let done = JSON.parse(localStorage.getItem(STORAGE_KEY + ":done") || "[]");
if (!Array.isArray(done)) done = [];
for (let i=0;i<24;i++){ if (typeof done[i] === "undefined") done[i] = false; }

const levelTxt = (level==="adv") ? "Poziom: rozszerzenie" : "Poziom: podstawa";

function saveDone(){
  localStorage.setItem(STORAGE_KEY + ":done", JSON.stringify(done));
  localStorage.setItem(STORAGE_KEY + ":ts", String(Date.now())); // ping (opcjonalny)
}

function render() {
  const idx = day - 1;
  const [title = "(brak tytułu)", teaser = "", html = ""] = tasks[idx] || [];

  // nagłówki
  els.taskTitle.textContent = `Dzień ${day} – ${title}`;
  els.taskMeta.textContent  = levelTxt;

  // treść: preferuj html z danych, fallback do generateBody
  els.taskContent.innerHTML = html || generateBody(level, day);
  els.taskTeaser.innerHTML  = teaser;

  // postęp
  const doneCount = (done || []).filter(Boolean).length;
  els.progressInfo.textContent = `Postęp: ${doneCount}/24`;

  // stan „wykonane”
  const isDone = !!done[idx];
  els.taskCard.style.border    = isDone ? "2px solid var(--gold)" : "";
  els.taskCard.style.boxShadow = isDone ? "0 0 0 3px rgba(255,204,0,.25), var(--shadow)" : "";
  els.markBtn.textContent      = isDone ? "Cofnij wykonanie" : "Oznacz jako wykonane ✔︎";
  els.markBtn.classList.toggle("success", isDone);
}


function generateBody(level, day){
  const B = {
    1:`<p>Przepisz używając słowa w nawiasie (2–5 wyrazów).</p>
<ol><li>I last saw my cousin in July. <em>(SEEN)</em></li>
<li>“Don’t touch that wire,” the man said. <em>(WARNED)</em></li>
<li>The exam is too difficult for most students. <em>(ENOUGH)</em></li>
<li>Someone has delivered the parcel. <em>(PASSIVE)</em></li>
<li>If we start now, we’ll catch the bus. <em>(UNLESS)</em></li></ol>`,
    2:`<p>Open cloze (8 luk). Wstaw po 1 słowie.</p>
<pre>Many teenagers want to (1) ___ part ... (8) ___ your holidays.</pre>`,
    3:`Słowotwórstwo: decide, useful, comfort, create, success, responsible.`,
    4:`Dopasuj frazale (6 par).`,
    5:`Korekta 1 błędu w zdaniu (6 zdań).`,
    6:`Czytanie T/F/NG (5 twierdzeń).`,
    7:`Funkcje językowe – dopasuj.`,
    8:`Zdania względne – połącz.`,
    9:`Kolokacje make/do/take/have – uzupełnij.`,
    10:`Parafrazy warunkowe I–III (5).`,
    11:`Artykuły/ilościowniki – krótki akapit.`,
    12:`Przyimki – 8 pozycji.`,
    13:`Szyk wyrazów – 3 zdania.`,
    14:`Writing – e-mail (80–100).`,
    15:`Writing – akapit (80–100).`,
    16:`Czytanie – dopasuj tytuły (A–C).`,
    17:`Reported speech – 5 zdań.`,
    18:`Strona bierna – 5 zdań.`,
    19:`Relative clauses – 3 pary.`,
    20:`Modal deduction (past) – 5 zdań.`,
    21:`Word formation – 6 luk.`,
    22:`Confused words – 6 zdań.`,
    23:`Phrasal GET – 6 zdań.`,
    24:`Mini-revision (10 pytań).`
  };
  const A = {
    1:`KWT (2–5 wyrazów).`,
    2:`Open cloze (8) – zaawansowane linkery.`,
    3:`Word formation (8).`,
    4:`Multiple-choice cloze (6).`,
    5:`Inwersja (5 przykładów).`,
    6:`Cleft sentences (4).`,
    7:`Tłumaczenia PL→EN (5).`,
    8:`Idiomy/kolokacje (6).`,
    9:`Korekta błędów (6).`,
    10:`Prepositions (8) – zaaw.`,
    11:`Verb patterns (6).`,
    12:`Participle / Reduced relatives (5).`,
    13:`Reported (+ passive) (5).`,
    14:`Mixed conditionals + inversion (5).`,
    15:`Passive / causatives (5).`,
    16:`Linkers (6 luk).`,
    17:`Wish / If only / High time / I’d rather (5).`,
    18:`Phrasal verbs (6).`,
    19:`Formal register (6).`,
    20:`Reading – match headings (3).`,
    21:`Writing – proposal (120–150).`,
    22:`Writing – review (120–150).`,
    23:`Fixed phrases (2–5 wyrazów).`,
    24:`Mini-revision (10).`
  };
  const src = (level==="adv") ? A : B;
  return src[day] || "Brak treści.";
}

/* Zdarzenia */
els.markBtn.addEventListener("click", ()=>{
  const i = day - 1;
  const newVal = !done[i];
  done[i] = newVal;
  saveDone();

  // URL-sync do kalendarza (działa z file://). Przekazujemy dzień i wartość 1/0.
  const v = newVal ? 1 : 0;
  window.location.replace(`./calendar.html?sync=${i+1}:${v}&level=${level}`);
});

/* Init */
(function init(){
  const okBase = (DATA.base||[]).length===24;
  const okAdv  = (DATA.adv ||[]).length===24;
  if (level==="adv" && !okAdv) level="base";
  if (level==="base" && !okBase) level="adv";
  render();
})();
