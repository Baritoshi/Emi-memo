/* ============================================================================
   task.js — Emi-memo Advent
   Obsługa interaktywnych zadań: MCQ / CLOZE / SHORT / MATCH
   Funkcje:
     • zapis TYLKO poprawnych odpowiedzi do localStorage (per dzień/poziom),
     • hydratacja poprawnych odpowiedzi po ponownym wejściu,
     • graficzny feedback (✓ / ✗ + tło) dla wszystkich typów,
     • autozaliczenie dnia (gdy wszystko poprawne) + alert + powrót do kalendarza.
   Uwaga:
     – plik korzysta z window.ADVENT_TASKS (advent.data.js)
     – klucz postępu:  STORAGE_KEY + ":done"
     – klucz odpowiedzi: STORAGE_KEY + ":ans:<level>:<day>"
   ============================================================================ */

const STORAGE_KEY = "emiMemoAdvent2025";

/* ------------------------------------------
   Parametry z URL (day 1..24, level base/adv)
------------------------------------------- */
const params = new URLSearchParams(location.search);
let day   = Math.max(1, Math.min(24, Number(params.get("day") || 1)));
let level = (params.get("level")==="adv") ? "adv" : "base";

/* --------------------------
   Elementy DOM (interfejs)
--------------------------- */
const els = {
  progressInfo: document.getElementById("progressInfo"),
  taskTitle:    document.getElementById("taskTitle"),
  taskMeta:     document.getElementById("taskMeta"),
  taskContent:  document.getElementById("taskContent"),
  taskTeaser:   document.getElementById("taskTeaser"),
  taskCard:     document.getElementById("taskCard"),
  markBtn:      document.getElementById("markBtn")
};

/* --------------------------
   Dane i status wykonania
--------------------------- */
const DATA  = window.ADVENT_TASKS || { base: [], adv: [] };
const tasks = (level === "adv") ? (DATA.adv || []) : (DATA.base || []);

let done = JSON.parse(localStorage.getItem(STORAGE_KEY + ":done") || "[]");
if (!Array.isArray(done)) done = [];
for (let i=0; i<24; i++){
  if (typeof done[i] === "undefined") done[i] = false;
}

const levelTxt = (level==="adv") ? "Poziom: rozszerzenie" : "Poziom: podstawa";

/* --------------------------------
   Zapis stanu 'done' do localStorage
---------------------------------- */
function saveDone(){
  localStorage.setItem(STORAGE_KEY + ":done", JSON.stringify(done));
  localStorage.setItem(STORAGE_KEY + ":ts", String(Date.now())); // ping: opcjonalne
}

/* ===========================================================
   PERSISTENCJA TYLKO POPRAWNYCH ODPOWIEDZI (per dzień/poziom)
   Klucz: "emiMemoAdvent2025:ans:<level>:<day>"
=========================================================== */
function answersKey(level, day){
  return `${STORAGE_KEY}:ans:${level}:${day}`;
}

function readSavedAnswers(){
  try {
    const raw = localStorage.getItem(answersKey(level, day));
    const obj = raw ? JSON.parse(raw) : null;
    if (obj && typeof obj === "object"){
      return {
        mcq:   obj.mcq   || {},
        cloze: obj.cloze || {},
        short: obj.short || {},
        match: obj.match || {}
      };
    }
  } catch {}
  return { mcq:{}, cloze:{}, short:{}, match:{} };
}

function writeSavedAnswers(state){
  try {
    localStorage.setItem(answersKey(level, day), JSON.stringify(state));
  } catch {}
}

/* ----------------------------------------------------------
   Po kliknięciu „Sprawdź”: zapisujemy WYŁĄCZNIE poprawne pola
   z aktualnego DOM do localStorage.
----------------------------------------------------------- */
function saveCorrectFromDOM(items){
  const saved = readSavedAnswers();

  // MCQ
  items.forEach((it, idx) => {
    if (it.type !== "mcq") return;
    const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
    if (!chosen){ delete saved.mcq[idx]; return; }
    const lab   = chosen.closest("label");
    const icon  = lab?.querySelector(":scope > .status-icon");
    if (icon && icon.textContent === "✓"){
      saved.mcq[idx] = Number(chosen.value);
    } else {
      delete saved.mcq[idx];
    }
  });

  // CLOZE
  items.forEach((it, idx) => {
    if (it.type !== "cloze") return;
    const inputs = document.querySelectorAll(`input[data-cloze="${idx}"]`);
    if (!inputs.length){ delete saved.cloze[idx]; return; }
    const bucket = {};
    inputs.forEach((inp, bIndex) => {
      const icon = (inp.parentElement || inp).querySelector(":scope > .status-icon");
      if (icon && icon.textContent === "✓"){
        const v = String(inp.value || "").trim();
        if (v) bucket[bIndex] = v;
      }
    });
    if (Object.keys(bucket).length) saved.cloze[idx] = bucket;
    else delete saved.cloze[idx];
  });

  // SHORT
  items.forEach((it, idx) => {
    if (it.type !== "short") return;
    const inp  = document.querySelector(`input[data-short="${idx}"]`);
    if (!inp){ delete saved.short[idx]; return; }
    const v    = String(inp.value || "").trim();
    const icon = (inp.parentElement || inp).querySelector(":scope > .status-icon");
    if (icon && icon.textContent === "✓" && v) saved.short[idx] = v;
    else delete saved.short[idx];
  });

  // MATCH
  items.forEach((it, idx) => {
    if (it.type !== "match") return;
    const left   = Array.isArray(it.left) ? it.left : [];
    const bucket = {};
    for (let li=0; li<left.length; li++){
      const sel  = document.querySelector(`select[data-match="${idx}"][data-left="${li}"]`);
      if (!sel) continue;
      const icon = (sel.parentElement || sel).querySelector(":scope > .status-icon");
      if (icon && icon.textContent === "✓" && sel.value !== ""){
        bucket[li] = Number(sel.value);
      }
    }
    if (Object.keys(bucket).length) saved.match[idx] = bucket;
    else delete saved.match[idx];
  });

  writeSavedAnswers(saved);
}

/* ----------------------------------------------------------
   Po renderze: wstawiamy zapisane POPRAWNE odpowiedzi z LS
----------------------------------------------------------- */
function hydrateSavedAnswers(items){
  const saved = readSavedAnswers();

  // MCQ
  Object.entries(saved.mcq || {}).forEach(([idx, val]) => {
    const input = document.querySelector(`input[name="q${idx}"][value="${val}"]`);
    if (input) input.checked = true;
  });

  // CLOZE
  Object.entries(saved.cloze || {}).forEach(([idx, bucket]) => {
    const inputs = document.querySelectorAll(`input[data-cloze="${idx}"]`);
    inputs.forEach((inp, bIndex) => {
      if (bucket && String(bIndex) in bucket){
        inp.value = bucket[bIndex];
      }
    });
  });

  // SHORT
  Object.entries(saved.short || {}).forEach(([idx, val]) => {
    const inp = document.querySelector(`input[data-short="${idx}"]`);
    if (inp) inp.value = String(val);
  });

  // MATCH
  Object.entries(saved.match || {}).forEach(([idx, bucket]) => {
    Object.entries(bucket || {}).forEach(([li, rIdx]) => {
      const sel = document.querySelector(`select[data-match="${idx}"][data-left="${li}"]`);
      if (sel) sel.value = String(rIdx);
    });
  });
}

/* =========================
   Help: normalizacja odpowiedzi
========================= */
function normalizeAnswerToken(tok){
  if (tok instanceof RegExp) return tok;
  if (Array.isArray(tok))   return tok.map(t => String(t).trim().toLowerCase());
  return String(tok || "").trim().toLowerCase();
}

function clozeCheck(userVal, expect){
  if (expect instanceof RegExp) return expect.test(userVal);
  if (Array.isArray(expect))    return expect.includes(userVal);
  return userVal === expect;
}

/* ------------------------------------------------
   Helper: tworzenie elementów z atrybutami / HTML
------------------------------------------------- */
function createEl(tag, attrs = {}, html = ""){
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === "style" && typeof v === "object"){
      Object.assign(el.style, v);
    } else if (k in el){
      el[k] = v;
    } else {
      el.setAttribute(k, v);
    }
  });
  if (html) el.innerHTML = html;
  return el;
}

/* ------------------------------------------------
   Helper: klasowanie i a11y na inputach
------------------------------------------------- */
function markInput(el, ok){
  if (!el) return;
  el.classList.remove("is-correct","is-wrong");
  el.classList.add(ok ? "is-correct" : "is-wrong");
  el.setAttribute("aria-invalid", ok ? "false" : "true");
}

/* ------------------------------------------------
   Helper: ikony statusu ✓ / ✗ przy polach
------------------------------------------------- */
function setStatusIcon(containerEl, ok){
  if (!containerEl) return;
  let s = containerEl.querySelector(":scope > .status-icon");
  if (!s){
    s = document.createElement("span");
    s.className = "status-icon";
    s.setAttribute("aria-hidden","true");
    s.style.marginLeft = "8px";
    s.style.fontWeight = "800";
    s.style.userSelect = "none";
    s.style.fontSize   = "1.05rem";
    containerEl.appendChild(s);
  }
  s.textContent = ok ? "✓" : "✗";
  s.style.color = ok ? "var(--ok, #2ecc71)" : "var(--bad, #ff6b6b)";
}

function clearStatusIcon(containerEl){
  const s = containerEl && containerEl.querySelector(":scope > .status-icon");
  if (s) s.remove();
}

function clearAllStatusIcons(scope){
  (scope || document).querySelectorAll(".status-icon").forEach(n => n.remove());
}

/* =========================================================
   RENDER INTERAKTYWNY
   obsługiwane typy:
     - "mcq":   { prompt, options:[...], answer:Number }
     - "cloze": { prompt:"text ___ text ___", answer:[...strings/regex/arrays] }
     - "short": { prompt, answer:string|RegExp|(string[]|RegExp[]) }
     - "match": { left:[...], right:[...], answer:[indexy right dla left] }
========================================================= */
function renderInteractive(items){
  if (!Array.isArray(items) || !items.length) return;

  const wrap   = createEl("div", { className:"interactive", style:{ marginTop:"10px" }});
  const result = createEl("div", { className:"notice",      style:{ marginTop:"8px"  }});

  // ---------- Rysowanie pozycji ----------
  items.forEach((it, idx) => {
    const row  = createEl("div", { className:"ix-item card-like", style:{ padding:"14px", margin:"10px 0" }});
    const head = createEl("div", {}, `Zadanie ${idx+1}.<br>${it.prompt || ""}`);
    row.appendChild(head);

    if (it.type === "mcq"){
      const optWrap = createEl("div", { style:{ display:"grid", gap:"8px", marginTop:"8px" }});
      (it.options || []).forEach((optText, i) => {
        const id    = `q${idx}_opt${i}`;
        const label = createEl("label", { htmlFor:id, style:{ display:"flex", gap:"8px", alignItems:"center", borderRadius:"8px", padding:"6px 8px" }});
        const input = createEl("input", { type:"radio", name:`q${idx}`, id, value:String(i) });
        input.style.transform = "scale(1.2)";
        const span  = createEl("span", {}, optText);
        label.appendChild(input);
        label.appendChild(span);
        optWrap.appendChild(label);
      });
      row.appendChild(optWrap);

    } else if (it.type === "cloze"){
      const p = createEl("p", { style:{ marginTop:"8px" }});
      let count = 0;
      const html = String(it.prompt || "").replace(/___/g, () => {
        const i = count++;
        return `<span class="cloze-slot">
                  <input type="text"
                         data-cloze="${idx}"
                         data-blank="${i}"
                         aria-label="Luka ${i+1}"
                         style="min-width:180px;padding:6px;border-radius:6px;border:none;" />
                </span>`;
      });
      p.innerHTML = html;
      row.appendChild(p);

    } else if (it.type === "short"){
      const input = createEl("input", {
        type: "text",
        "data-short": String(idx),
        "aria-label": `Odpowiedź do zadania ${idx+1}`
      });
      Object.assign(input.style, { minWidth:"220px", padding:"6px", borderRadius:"6px", border:"none", marginTop:"8px" });
      row.appendChild(input);

    } else if (it.type === "match"){
      const table = createEl("div", { style:{ display:"grid", gap:"10px", marginTop:"8px" }});
      const left  = Array.isArray(it.left)  ? it.left  : [];
      const right = Array.isArray(it.right) ? it.right : [];

      // tasowanie kolejności "right" (indeksy)
      const indices = right.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      left.forEach((txt, li) => {
        const rowLine = createEl("div", { style:{ display:"grid", gridTemplateColumns:"1fr 240px", gap:"10px", alignItems:"center" }});
        const l   = createEl("div", {}, txt);
        const sel = createEl("select", { "data-match": String(idx), "data-left": String(li), "aria-label": `Dopasuj do pozycji ${li+1}` });
        const opt0 = createEl("option", { value:"", disabled:true, selected:true }, "— wybierz —");
        sel.appendChild(opt0);
        indices.forEach(rPos => {
          const opt = createEl("option", { value:String(rPos) }, right[rPos]);
          sel.appendChild(opt);
        });
        rowLine.appendChild(l);
        rowLine.appendChild(sel);
        table.appendChild(rowLine);
      });

      row.appendChild(table);
      row.dataset.rightCount = String(right.length);
    }

    els.taskContent.appendChild(row);
  });

  // ---------- Panel przycisków ----------
  const actions  = createEl("div", { className:"actions", style:{ marginTop:"12px", display:"flex", gap:"10px", flexWrap:"wrap" }});
  const checkBtn = createEl("button", { className:"btn", id:"checkBtn" }, "Sprawdź");
  const clearBtn = createEl("button", { className:"btn secondary", id:"clearBtn" }, "Wyczyść");
  actions.appendChild(checkBtn);
  actions.appendChild(clearBtn);
  els.taskContent.appendChild(actions);

  els.taskContent.appendChild(result);

  // ---------- Pre-normalizacja kluczy ----------
  const normItems = items.map(it => {
    if (it.type === "cloze"){
      const ans = Array.isArray(it.answer) ? it.answer.map(a => normalizeAnswerToken(a)) : [];
      return { ...it, _normAnswer: ans };
    } else if (it.type === "short"){
      const a = it.answer;
      if (a instanceof RegExp)   return { ...it, _short: a };
      if (Array.isArray(a))      return { ...it, _short: a.map(x => normalizeAnswerToken(x)) };
      return { ...it, _short: normalizeAnswerToken(a) };
    } else {
      return it;
    }
  });

  // ---------- SPRAWDŹ ----------
  checkBtn.addEventListener("click", () => {
    let score = 0, total = 0;

    clearAllStatusIcons(els.taskContent);

    normItems.forEach((it, idx) => {

      if (it.type === "mcq"){
        total++;
        const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
        const selIdx = chosen ? Number(chosen.value) : -1;
        const ok     = selIdx === Number(it.answer);
        if (ok) score++;

        // Podświetlenia/ikonki na labelach
        const radios = document.querySelectorAll(`input[name="q${idx}"]`);
        radios.forEach(input => {
          const lab = input.closest("label");
          lab.style.background   = "";
          lab.style.borderRadius = "8px";
          lab.style.padding      = "6px 8px";
          if (Number(input.value) === Number(it.answer)){
            lab.style.background = "rgba(46, 204, 113, .25)";
            setStatusIcon(lab, true);
          } else if (input.checked){
            lab.style.background = "rgba(255, 107, 107, .25)";
            setStatusIcon(lab, false);
          } else {
            clearStatusIcon(lab);
          }
        });
      }

      else if (it.type === "cloze"){
        const answers = it._normAnswer || [];
        total += answers.length;
        const inputs = document.querySelectorAll(`input[data-cloze="${idx}"]`);
        inputs.forEach((inp, bIndex) => {
          const val = (inp.value || "").trim().toLowerCase();
          const exp = answers[bIndex];
          const ok  = clozeCheck(val, exp);
          if (ok) score++;
          inp.style.background = ok ? "rgba(46, 204, 113, .25)" : "#ffff";
          markInput(inp, ok);
          setStatusIcon(inp.parentElement || inp, ok);
        });
      }

      else if (it.type === "short"){
        total++;
        const inp = document.querySelector(`input[data-short="${idx}"]`);
        const val = (inp?.value || "").trim();
        let ok = false;

        if (it._short instanceof RegExp){
          ok = it._short.test(val);
        } else if (Array.isArray(it._short)){
          const low = val.toLowerCase();
          ok = it._short.some(exp => {
            if (exp instanceof RegExp) return exp.test(val);
            return low === exp;
          });
        } else {
          ok = val.toLowerCase() === it._short;
        }

        if (ok) score++;
        if (inp){
          inp.style.background = ok ? "rgba(46, 204, 113, .25)" : "#fff";
          markInput(inp, ok);
          setStatusIcon(inp.parentElement || inp, ok);
        }
      }

      else if (it.type === "match"){
        const left = Array.isArray(it.left) ? it.left : [];
        const ans  = Array.isArray(it.answer) ? it.answer : [];
        total += left.length;

        for (let li=0; li<left.length; li++){
          const sel = document.querySelector(`select[data-match="${idx}"][data-left="${li}"]`);
          const rPos = sel ? Number(sel.value) : NaN;
          const ok   = !Number.isNaN(rPos) && rPos === Number(ans[li]);

          if (ok) score++;
          if (sel){
            sel.style.background = ok ? "rgba(46, 204, 113, .25)" : "#fff";
            markInput(sel, ok);
            setStatusIcon(sel.parentElement || sel, ok);
          }
        }
      }
    });

    // wynik
    result.textContent = `Wynik: ${score}/${total}`;
    // zapisz WYŁĄCZNIE poprawne (po oznaczeniu pól)
    saveCorrectFromDOM(normItems);

    // autozaliczenie: wszystkie poprawne i jest co sprawdzać
    if (total > 0 && score === total){
      const i = day - 1;
      done[i] = true;
      saveDone();
      // mały delay, by użytkownik zobaczył wynik
      setTimeout(() => {
        alert(`Dzień ${day} zaliczony!`);
        // URL-sync do kalendarza
        window.location.replace(`./calendar.html?sync=${i+1}:1&level=${level}`);
      }, 50);
    }
  });

  // ---------- WYCZYŚĆ ----------
  clearBtn.addEventListener("click", () => {
    // Radios
    els.taskContent.querySelectorAll('input[type="radio"]').forEach(r => {
      r.checked = false;
      const lab = r.closest("label");
      if (lab){
        lab.style.background = "";
        clearStatusIcon(lab);
      }
    });

    // Cloze
    els.taskContent.querySelectorAll('input[data-cloze]').forEach(inp => {
      inp.value = "";
      inp.style.background = "";
      inp.classList.remove("is-correct","is-wrong");
      inp.removeAttribute("aria-invalid");
      clearStatusIcon(inp.parentElement || inp);
    });

    // Short
    els.taskContent.querySelectorAll('input[data-short]').forEach(inp => {
      inp.value = "";
      inp.style.background = "";
      inp.classList.remove("is-correct","is-wrong");
      inp.removeAttribute("aria-invalid");
      clearStatusIcon(inp.parentElement || inp);
    });

    // Match
    els.taskContent.querySelectorAll('select[data-match]').forEach(sel => {
      sel.value = "";
      sel.style.background = "";
      sel.classList.remove("is-correct","is-wrong");
      sel.removeAttribute("aria-invalid");
      clearStatusIcon(sel.parentElement || sel);
    });

    // wynik + ikony
    result.textContent = "";
    clearAllStatusIcons(els.taskContent);
    // Uwaga: celowo NIE czyścimy localStorage z poprawnych odpowiedzi
    // — użytkownik może chcieć wrócić i mieć dalej te poprawne pola uzupełnione.
  });

  // ---------- Hydratacja zapisanych POPRAWNYCH ----------
  hydrateSavedAnswers(items);
}

/* ===================================
   RENDER STRONY ZADANIA (nagłówki itd.)
=================================== */
function render(){
  const idx = day - 1;

  const [ title = "(brak tytułu)",
          teaser = "",
          html   = "",
          items  = null ] = tasks[idx] || [];

  els.taskTitle.textContent = `Dzień ${day} – ${title}`;
  els.taskMeta.textContent  = levelTxt;

  // treść bazowa z pliku danych (jeśli jest)
  els.taskContent.innerHTML = html || generateBody(level, day);

  // interaktywne elementy
  if (items) renderInteractive(items);

  // teaser
  els.taskTeaser.innerHTML = teaser;

  // status dnia i przycisk "Oznacz jako wykonane"
  const doneCount = (done || []).filter(Boolean).length;
  els.progressInfo.textContent = `Postęp: ${doneCount}/24`;

  const isDone = !!done[idx];
  els.taskCard.style.border   = isDone ? "2px solid var(--gold)" : "";
  els.taskCard.style.boxShadow= isDone ? "0 0 0 3px rgba(255,204,0,.25), var(--shadow)" : "";

  els.markBtn.textContent = isDone ? "Cofnij wykonanie" : "Oznacz jako wykonane ✔︎";
  els.markBtn.classList.toggle("success", isDone);
}

/* ------------------------------------
   Legacy (gdyby html był pusty)
------------------------------------- */
function generateBody(){
  return "";
}

/* =====================
   ZDARZENIA GŁÓWNE
===================== */
els.markBtn.addEventListener("click", () => {
  const i = day - 1;
  const newVal = !done[i];
  done[i] = newVal;
  saveDone();

  // URL-sync do kalendarza
  const v = newVal ? 1 : 0;
  window.location.replace(`./calendar.html?sync=${i+1}:${v}&level=${level}`);
});

/* =============
   INIT
============= */
(function init(){
  const okBase = (DATA.base || []).length === 24;
  const okAdv  = (DATA.adv  || []).length === 24;
  if (level === "adv"  && !okAdv)  level = "base";
  if (level === "base" && !okBase) level = "adv";
  render();
})();
