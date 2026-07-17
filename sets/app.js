// sets/app.js — read-only set library for students.
(function () {
  const $ = (id) => document.getElementById(id);

  const els = {
    setPicker: $('setPicker'),
    pairsArea: $('pairsArea'),
    previewTitle: $('previewTitle'),
    pairCount: $('pairCount'),
    currentInfo: $('currentInfo'),
    openFlashBtn: $('openFlashBtn'),
    openQuizBtn: $('openQuizBtn'),
    openMemoryBtn: $('openMemoryBtn'),
    copyLinkBtn: $('copyLinkBtn')
  };

  function selectedName() {
    return els.setPicker?.value || PairSets.getCurrent();
  }

  function selectSet(name) {
    if (!name || !PairSets.hasSet(name)) return;

    PairSets.setCurrent(name);
    if (els.setPicker) els.setPicker.value = name;

    const items = PairSets.getSet(name);
    els.previewTitle.textContent = name;
    els.pairCount.textContent = `${items.length} haseł`;
    els.pairsArea.value = PairSets.pairsToTextarea(items);
    els.currentInfo.textContent = `Bieżący zestaw: ${name}`;
  }

  function refreshPicker() {
    if (!window.PairSets || !els.setPicker) return;

    const names = PairSets.listSets();
    els.setPicker.innerHTML = '';

    if (!names.length) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Brak wbudowanych zestawów';
      opt.disabled = true;
      opt.selected = true;
      els.setPicker.appendChild(opt);
      els.previewTitle.textContent = 'Brak zestawów';
      els.pairCount.textContent = '';
      els.pairsArea.value = '';
      els.currentInfo.textContent = '';
      return;
    }

    names.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${name} (${PairSets.getSet(name).length})`;
      els.setPicker.appendChild(opt);
    });

    selectSet(PairSets.getCurrent() || names[0]);
  }

  function openGame(relUrl, setName) {
    if (!setName) return;

    const url = new URL(relUrl, location.href);
    url.searchParams.set('set', setName);

    if (/Fiszki-Quiz|Fiszki/.test(relUrl)) {
      url.searchParams.set('autostart', 'srs');
    }

    window.location.assign(url.toString());
  }

  async function copyFlashcardsLink(setName) {
    if (!setName) return;

    const url = new URL('../Fiszki/index.html', location.href);
    url.searchParams.set('set', setName);
    url.searchParams.set('autostart', 'srs');

    try {
      await navigator.clipboard.writeText(url.toString());
      alert('Skopiowano link do fiszek.');
    } catch {
      alert(url.toString());
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.PairSets) {
      console.warn('[sets/app] PairSets helper not found.');
      return;
    }

    refreshPicker();

    els.setPicker?.addEventListener('change', () => selectSet(selectedName()));
    els.openFlashBtn?.addEventListener('click', () => openGame('../Fiszki/index.html', selectedName()));
    els.openQuizBtn?.addEventListener('click', () => openGame('../Fiszki-Quiz/index.html', selectedName()));
    els.openMemoryBtn?.addEventListener('click', () => openGame('../memo/index.html', selectedName()));
    els.copyLinkBtn?.addEventListener('click', () => copyFlashcardsLink(selectedName()));

    window.addEventListener('pairsets:current', refreshPicker);
    window.addEventListener('focus', refreshPicker);
  });
})();
