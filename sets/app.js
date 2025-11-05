document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    const setForm = $('setForm');
    const setName = $('setName');
    const setItems = $('setItems');
    const clearFormBtn = $('clearFormBtn');

    const setsList = $('setsList');
    const loadBtn = $('loadBtn');
    const renameBtn = $('renameBtn');
    const deleteBtn = $('deleteBtn');
    const exportBtn = $('exportBtn');
    const exportAllBtn = $('exportAllBtn');
    const importBtn = $('importBtn');
    const importFile = $('importFile');

    const previewTable = $('previewTable').querySelector('tbody');

    function refreshList(selectedName) {
        const names = PairSets.listSets();
        setsList.innerHTML = '';
        names.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = `${name} (${PairSets.getSet(name).length})`;
            if (selectedName && selectedName === name) opt.selected = true;
            setsList.appendChild(opt);
        });
        buildPreview();
    }

    function parseTextarea(text) {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const items = [];
        lines.forEach(line => {
            const parts = line.split(';');
            if (parts.length >= 2) {
                const term = parts[0].trim();
                const meaning = parts.slice(1).join(';').trim();
                if (term && meaning) items.push({ term, meaning });
            }
        });
        return items;
    }

    function buildPreview() {
        const name = setsList.value;
        previewTable.innerHTML = '';
        if (!name) return;
        const items = PairSets.getSet(name);
        items.forEach((it, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${idx + 1}</td><td>${escapeHtml(it.term)}</td><td>${escapeHtml(it.meaning)}</td>`;
            previewTable.appendChild(tr);
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Init
    refreshList();

    // Zapis / nadpis
    setForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = setName.value.trim();
        if (!name) { alert('Podaj nazwê zestawu.'); return; }
        const items = parseTextarea(setItems.value);
        if (items.length === 0) { alert('Dodaj co najmniej jedn¹ parê.'); return; }
        PairSets.saveSet(name, items);
        refreshList(name);
        alert(`Zapisano zestaw „${name}” (${items.length} pozycji).`);
    });

    // Czyszczenie formularza
    clearFormBtn.addEventListener('click', () => {
        setName.value = '';
        setItems.value = '';
        setName.focus();
    });

    // Za³aduj wybrany do formularza
    loadBtn.addEventListener('click', () => {
        const name = setsList.value;
        if (!name) return;
        const items = PairSets.getSet(name);
        setName.value = name;
        setItems.value = PairSets.pairsToTextarea(items);
        alert(`Za³adowano „${name}” do formularza (pozycje: ${items.length}). Zapisz, aby nadpisaæ.`);
    });

    // Zmieñ nazwê
    renameBtn.addEventListener('click', () => {
        const oldName = setsList.value;
        if (!oldName) return;
        const newName = prompt('Nowa nazwa zestawu:', oldName);
        if (!newName || newName.trim() === oldName) return;
        const ok = PairSets.renameSet(oldName, newName.trim());
        if (!ok) { alert('Nie uda³o siê zmieniæ nazwy (istnieje ju¿ zestaw o tej nazwie?).'); return; }
        refreshList(newName.trim());
    });

    // Usuñ
    deleteBtn.addEventListener('click', () => {
        const name = setsList.value;
        if (!name) return;
        if (!confirm(`Usun¹æ zestaw „${name}”?`)) return;
        PairSets.deleteSet(name);
        refreshList();
    });

    // Eksport jednego
    exportBtn.addEventListener('click', () => {
        const name = setsList.value;
        if (!name) return;
        const payload = PairSets.exportSet(name);
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `set-${name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(a.href);
    });

    // Eksport wszystkich
    exportAllBtn.addEventListener('click', () => {
        const payload = PairSets.exportAll();
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `all-sets.json`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(a.href);
    });

    // Import
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const obj = JSON.parse(await file.text());
            const res = PairSets.importJsonObject(obj, /*merge=*/true);
            alert(`Import zakoñczony. Zmodyfikowano zestawy: ${res.setsAffected.join(', ')}`);
            refreshList();
        } catch (err) {
            console.error(err);
            alert('Nieudany import. Upewnij siê, ¿e to poprawny JSON wygenerowany przez Mened¿er.');
        } finally {
            importFile.value = '';
        }
    });

    setsList.addEventListener('change', buildPreview);
});
