// === sets-helper.js ===
// Wspólny menedżer zestawów do gier językowych (Fiszki, Quiz, Memory, itd.)
// Struktura localStorage: "sets_v1" → { sets: { nazwa: [ {term, meaning} ] }, meta: {...} }

window.PairSets = (() => {

    const STORAGE_KEY = "sets_v1";

    /* ---------- Pomocnicze operacje ---------- */
    function _loadRaw() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return { sets: {}, meta: { createdAt: Date.now() } };
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object" || !parsed.sets) {
                return { sets: {}, meta: { createdAt: Date.now() } };
            }
            return parsed;
        } catch (err) {
            console.warn("Błąd odczytu sets_v1:", err);
            return { sets: {}, meta: { createdAt: Date.now() } };
        }
    }

    function _saveRaw(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (err) {
            console.error("Nie udało się zapisać do localStorage:", err);
        }
    }

    function _normalize(text) {
        return String(text || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function _mergeUnique(existing, incoming) {
        const seen = new Set(existing.map(e => _normalize(e.term) + "|" + _normalize(e.meaning)));
        incoming.forEach(item => {
            const key = _normalize(item.term) + "|" + _normalize(item.meaning);
            if (!seen.has(key)) existing.push(item);
        });
        return existing;
    }

    /* ---------- Operacje publiczne ---------- */

    function listSets() {
        const data = _loadRaw();
        return Object.keys(data.sets).sort();
    }

    function getSet(name) {
        const data = _loadRaw();
        const arr = data.sets[name];
        return Array.isArray(arr) ? arr : [];
    }

    function saveSet(name, pairs) {
        if (!name) return;
        const data = _loadRaw();
        if (!Array.isArray(pairs)) pairs = [];
        data.sets[name] = pairs;
        data.meta.updatedAt = Date.now();
        _saveRaw(data);
        console.log(`💾 Zapisano zestaw "${name}" (${pairs.length} elementów)`);
    }

    function appendToSet(name, pairs) {
        if (!name || !Array.isArray(pairs)) return;
        const data = _loadRaw();
        const current = Array.isArray(data.sets[name]) ? data.sets[name] : [];
        data.sets[name] = _mergeUnique(current, pairs);
        data.meta.updatedAt = Date.now();
        _saveRaw(data);
        console.log(`🔁 Scalono dane do zestawu "${name}" (łącznie ${data.sets[name].length})`);
    }

    function deleteSet(name) {
        const data = _loadRaw();
        delete data.sets[name];
        _saveRaw(data);
    }

    function renameSet(oldName, newName) {
        const data = _loadRaw();
        if (data.sets[oldName]) {
            data.sets[newName] = data.sets[oldName];
            delete data.sets[oldName];
            _saveRaw(data);
        }
    }

    function clearAll() {
        _saveRaw({ sets: {}, meta: { clearedAt: Date.now() } });
    }

    function pairsToTextarea(pairs) {
        return (pairs || []).map(p => `${p.term}; ${p.meaning}`).join("\n");
    }

    function textareaToPairs(text) {
        return String(text)
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean)
            .map(line => {
                const [term, ...rest] = line.split(";");
                return { term: term?.trim() || "", meaning: rest.join(";").trim() || "" };
            })
            .filter(p => p.term && p.meaning);
    }

    /* ---------- Eksport / import ---------- */

    const EXPORT_SCHEMA = "pair-sets@1";

    function exportAll() {
        const payload = {
            schema: EXPORT_SCHEMA,
            exportedAt: new Date().toISOString(),
            ..._loadRaw(),
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pair-sets-export.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    async function importFromFile(file, merge = true) {
        if (!file) return;
        try {
            const text = await file.text();
            const json = JSON.parse(text);
            if (json?.schema !== EXPORT_SCHEMA) {
                alert("Nieprawidłowy plik lub wersja schematu.");
                return;
            }
            const current = _loadRaw();
            Object.entries(json.sets || {}).forEach(([name, arr]) => {
                if (!Array.isArray(arr)) return;
                if (merge && current.sets[name]) {
                    current.sets[name] = _mergeUnique(current.sets[name], arr);
                } else {
                    current.sets[name] = arr;
                }
            });
            current.meta.importedAt = Date.now();
            _saveRaw(current);
            alert("✅ Import zakończony pomyślnie!");
        } catch (err) {
            console.error("Import error:", err);
            alert("❌ Błąd importu pliku JSON.");
        }
    }

    /* ---------- Diagnoza przy starcie ---------- */
    const init = _loadRaw();
    if (!init.sets) _saveRaw({ sets: {}, meta: { createdAt: Date.now() } });
    console.log("📦 PairSets ready. Zestawy dostępne:", Object.keys(init.sets));

    /* ---------- Public API ---------- */
    return {
        listSets,
        getSet,
        saveSet,
        appendToSet,
        deleteSet,
        renameSet,
        clearAll,
        pairsToTextarea,
        textareaToPairs,
        exportAll,
        importFromFile,
    };
})();
