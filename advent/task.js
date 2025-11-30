/* task.js — Emi-memo Advent (MCQ + CLOZE + SHORT + MATCH; działa lokalnie z file://) */
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

const DATA  = window.ADVENT_TASKS || { base: [], adv: [] };
const tasks = (level==="adv") ? (DATA.adv||[]) : (DATA.base||[]);

let done = JSON.parse(localStorage.getItem(STORAGE_KEY + ":done") || "[]");
if (!Array.isArray(done)) done = [];
for (let i=0;i<24;i++){ if (typeof done[i] === "undefined") done[i] = false; }

const levelTxt = (level==="adv") ? "Poziom: rozszerzenie" : "Poziom: podstawa";

function saveDone(){
  localStorage.setItem(STORAGE_KEY + ":done", JSON.stringify(done));
  localStorage.setItem(STORAGE_KEY + ":ts", String(Date.now())); // ping (opcjonalny)
}

/* ===== Helpers (normalizacja i porównania) ===== */
function normalizeAnswerToken(tok){
  if (tok instanceof RegExp) return tok;
  if (Array.isArray(tok))    return tok.map(t => String(t).trim().toLowerCase());
  return String(tok || "").trim().toLowerCase();
}
function clozeCheck(userVal, expect){
  if (expect instanceof RegExp) return expect.test(userVal);
  if (Array.isArray(expect))    return expect.includes(userVal);
  return userVal === expect;
}
function createEl(tag, attrs = {}, html = ""){
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v]) => {
    if (k === "style" && typeof v === "object") {
      Object.assign(el.style, v);
    } else if (k in el) {
      el[k] = v;
    } else {
      el.setAttribute(k, v);
    }
  });
  if (html) el.innerHTML = html;
  return el;
}

/* ===== Interaktywny mini-silnik zadań =====
Obsługiwane typy:
- "mcq":    { prompt, options:[...], answer:Number }
- "cloze":  { prompt: "text ___ text ___", answer:[...strings/regex/arrays] }
- "short":  { prompt, answer: string | RegExp | (string[]|RegExp[]) }
- "match":  { left:[...], right:[...], answer:[indexy right dla left] }
*/
function renderInteractive(items) {
  if (!Array.isArray(items) || !items.length) return;

  const wrap   = createEl("div", { className: "interactive", style: { marginTop: "10px" }});
  const result = createEl("div", { className: "notice", style: { marginTop: "8px" }});

  items.forEach((it, idx) => {
    const row  = createEl("div", { className: "ix-item card-like", style: { padding:"14px", margin:"10px 0" }});
    const head = createEl("div", {}, `<strong>Zadanie ${idx+1}.</strong> ${it.prompt || ""}`);
    row.appendChild(head);

    if (it.type === "mcq") {
      const optWrap = createEl("div", { style: { display:"grid", gap:"8px" }});
      (it.options || []).forEach((optText, i) => {
        const id    = `q${idx}_opt${i}`;
        const label = createEl("label", { htmlFor:id, style:{ display:"flex", gap:"8px", alignItems:"center" }});
        const input = createEl("input", { type:"radio", name:`q${idx}`, id, value:String(i) });
        input.style.transform = "scale(1.2)";
        const span  = createEl("span", {}, optText);
        label.appendChild(input);
        label.appendChild(span);
        optWrap.appendChild(label);
      });
      row.appendChild(optWrap);

    } else if (it.type === "cloze") {
      const p = createEl("p", { style:{ marginTop:"8px" }});
      let count = 0;
      const html = (it.prompt || "").replace(/___/g, () => {
        const inp = `<input data-cloze="${idx}" data-blank="${count}" style="min-width:110px;padding:6px;border-radius:6px;border:none" />`;
        count++;
        return inp;
      });
      p.innerHTML = html;
      row.appendChild(p);

    } else if (it.type === "short") {
      // pojedyncze pole tekstowe (albo kilka – jeśli chcesz, możesz podać array items)
      const input = createEl("input", { type:"text", "data-short": String(idx) });
      Object.assign(input.style, { minWidth:"220px", padding:"6px", borderRadius:"6px", border:"none", marginTop:"8px" });
      row.appendChild(input);

    } else if (it.type === "match") {
      // Dopasuj lewe pojęcia do prawej listy przez <select>
      const table = createEl("div", { style:{ display:"grid", gap:"10px" }});
      const left  = Array.isArray(it.left) ? it.left : [];
      const right = Array.isArray(it.right) ? it.right : [];
      // wygeneruj kolejność opcji (można potasować)
      const indices = right.map((_, i) => i);
      // proste tasowanie
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      left.forEach((txt, li) => {
        const rowLine = createEl("div", { style:{ display:"grid", gridTemplateColumns:"1fr 220px", gap:"10px", alignItems:"center" }});
        const l = createEl("div", {}, txt);
        const sel = createEl("select", { "data-match": String(idx), "data-left": String(li) });
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
      // zapisz też mapę opcji do późniejszej walidacji
      row.dataset.rightCount = String(right.length);
    }

    wrap.appendChild(row);
  });

  // Panel przycisków
  const actions = createEl("div", { className:"actions", style:{ marginTop:"12px" }});
  const checkBtn = createEl("button", { className:"btn" }, "Sprawdź");
  const clearBtn = createEl("button", { className:"btn secondary" }, "Wyczyść");
  actions.appendChild(checkBtn);
  actions.appendChild(clearBtn);

  wrap.appendChild(actions);
  wrap.appendChild(result);
  els.taskContent.appendChild(wrap);

  // Pre-normalizacja kluczy
  const normItems = items.map(it => {
    if (it.type === "cloze") {
      const ans = Array.isArray(it.answer) ? it.answer.map(a => normalizeAnswerToken(a)) : [];
      return { ...it, _normAnswer: ans };
    } else if (it.type === "short") {
      const a = it.answer;
      if (a instanceof RegExp) return { ...it, _short: a };
      if (Array.isArray(a))   return { ...it, _short: a.map(x => normalizeAnswerToken(x)) };
      return { ...it, _short: normalizeAnswerToken(a) };
    } else {
      return it;
    }
  });

  // Sprawdzanie
  checkBtn.addEventListener("click", () => {
    let score = 0, total = 0;

    normItems.forEach((it, idx) => {
      if (it.type === "mcq") {
        total++;
        const chosen = document.querySelector(`input[name="q${idx}"]:checked`);
        const selIdx = chosen ? Number(chosen.value) : -1;
        const ok = selIdx === Number(it.answer);
        if (ok) score++;

        // podświetlenia
        const radios = document.querySelectorAll(`input[name="q${idx}"]`);
        radios.forEach(input => {
          const lab = input.closest("label");
          lab.style.borderRadius = "8px";
          lab.style.padding = "6px 8px";
          lab.style.background = "";
          if (Number(input.value) === Number(it.answer)) {
            lab.style.background = "rgba(46, 204, 113, .25)"; // ok
          } else if (input.checked) {
            lab.style.background = "rgba(255, 107, 107, .25)"; // bad
          }
        });

      } else if (it.type === "cloze") {
        const answers = it._normAnswer || [];
        total += answers.length;
        const inputs = document.querySelectorAll(`input[data-cloze="${idx}"]`);
        inputs.forEach((inp, bIndex) => {
          const val = (inp.value || "").trim().toLowerCase();
          const exp = answers[bIndex];
          const ok = clozeCheck(val, exp);
          if (ok) score++;
          inp.style.background = ok ? "rgba(46, 204, 113, .25)" : "rgba(255, 107, 107, .25)";
        });

      } else if (it.type === "short") {
        total++;
        const inp = document.querySelector(`input[data-short="${idx}"]`);
        const val = (inp?.value || "").trim();
        let ok = false;
        if (it._short instanceof RegExp) {
          ok = it._short.test(val);
        } else if (Array.isArray(it._short)) {
          const low = val.toLowerCase();
          ok = it._short.some(exp => {
            if (exp instanceof RegExp) return exp.test(val);
            return low === exp;
          });
        } else {
          ok = val.toLowerCase() === it._short;
        }
        if (ok) score++;
        if (inp) inp.style.background = ok ? "rgba(46, 204, 113, .25)" : "rgba(255, 107, 107, .25)";

      } else if (it.type === "match") {
        const left = Array.isArray(it.left) ? it.left : [];
        const ans  = Array.isArray(it.answer) ? it.answer : [];
        total += left.length;
        for (let li = 0; li < left.length; li++) {
          const sel = document.querySelector(`select[data-match="${idx}"][data-left="${li}"]`);
          const val = sel ? sel.value : "";
          const chosenRightIdx = val === "" ? null : Number(val);
          const ok = (chosenRightIdx !== null) && (chosenRightIdx === Number(ans[li]));
          if (ok) score++;
          if (sel) {
            sel.style.background = ok ? "rgba(46, 204, 113, .25)" : "rgba(255, 107, 107, .25)";
          }
        }
      }
    });

    result.textContent = `Wynik: ${score} / ${total}`;
  });

  clearBtn.addEventListener("click", () => {
    // radiobuttony
    wrap.querySelectorAll('input[type="radio"]').forEach(r => {
      r.checked = false;
      const lab = r.closest("label"); if (lab) lab.style.background="";
    });
    // cloze
    wrap.querySelectorAll('input[data-cloze]').forEach(i => {
      i.value = ""; i.style.background = "";
    });
    // short
    wrap.querySelectorAll('input[data-short]').forEach(i => {
      i.value = ""; i.style.background = "";
    });
    // match
    wrap.querySelectorAll('select[data-match]').forEach(sel => {
      sel.value = ""; sel.style.background = "";
    });

    result.textContent = "";
  });
}

/* ===== RENDER ===== */
function render() {
  const idx = day - 1;
  const [title = "(brak tytułu)", teaser = "", html = "", items = null] = tasks[idx] || [];

  els.taskTitle.textContent = `Dzień ${day} – ${title}`;
  els.taskMeta.textContent  = levelTxt;

  // Treść bazowa
  els.taskContent.innerHTML = html || generateBody(level, day);

  // Interaktywne elementy (jeśli są)
  if (items) renderInteractive(items);

  els.taskTeaser.innerHTML  = teaser;

  const doneCount = (done || []).filter(Boolean).length;
  els.progressInfo.textContent = `Postęp: ${doneCount}/24`;

  const isDone = !!done[idx];
  els.taskCard.style.border    = isDone ? "2px solid var(--gold)" : "";
  els.taskCard.style.boxShadow = isDone ? "0 0 0 3px rgba(255,204,0,.25), var(--shadow)" : "";
  els.markBtn.textContent      = isDone ? "Cofnij wykonanie" : "Oznacz jako wykonane ✔︎";
  els.markBtn.classList.toggle("success", isDone);
}

/* Legacy fallback dla starszych dni bez items */
function generateBody(level, day){
  return ""; // Treść bierze się z advent.data.js
}

/* Zdarzenia */
els.markBtn.addEventListener("click", ()=>{
  const i = day - 1;
  const newVal = !done[i];
  done[i] = newVal;
  saveDone();
  // URL-sync do kalendarza (działa z file://)
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
