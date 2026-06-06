'use strict';

// ── SVG tematici (iniettati nelle decorazioni dinamiche) ──────────────────────
const SVG_CAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 65" fill="none" aria-hidden="true">
  <rect x="5" y="25" width="90" height="26" rx="8" fill="#E53935"/>
  <path d="M22 25 L34 10 L68 10 L80 25Z" fill="#C62828"/>
  <rect x="37" y="12" width="13" height="11" rx="3" fill="#B3E5FC"/>
  <rect x="53" y="12" width="13" height="11" rx="3" fill="#B3E5FC"/>
  <rect x="83" y="30" width="11" height="9"  rx="3" fill="#FDD835"/>
  <circle cx="24" cy="51" r="12" fill="#263238"/>
  <circle cx="24" cy="51" r="5"  fill="#607D8B"/>
  <circle cx="73" cy="51" r="12" fill="#263238"/>
  <circle cx="73" cy="51" r="5"  fill="#607D8B"/>
</svg>`;

const SVG_TRAIN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115 70" fill="none" aria-hidden="true">
  <rect x="2"  y="22" width="60" height="30" rx="7" fill="#FB8C00"/>
  <rect x="52" y="12" width="28" height="26" rx="6" fill="#E65100"/>
  <rect x="57" y="16" width="14" height="10" rx="3" fill="#B3E5FC"/>
  <rect x="14" y="8"  width="10" height="16" rx="3" fill="#E65100"/>
  <circle cx="19" cy="5"  r="5"  fill="#ECEFF1" opacity=".75"/>
  <rect x="0"  y="37" width="5"  height="8"  rx="1" fill="#9E9E9E"/>
  <circle cx="17" cy="52" r="12" fill="#263238"/>
  <circle cx="17" cy="52" r="5"  fill="#607D8B"/>
  <circle cx="47" cy="52" r="12" fill="#263238"/>
  <circle cx="47" cy="52" r="5"  fill="#607D8B"/>
  <rect x="68" y="26" width="40" height="24" rx="6" fill="#F4511E"/>
  <circle cx="82"  cy="52" r="11" fill="#263238"/>
  <circle cx="82"  cy="52" r="4"  fill="#607D8B"/>
  <circle cx="100" cy="52" r="11" fill="#263238"/>
  <circle cx="100" cy="52" r="4"  fill="#607D8B"/>
</svg>`;

const SVG_UNICORN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 90" fill="none" aria-hidden="true">
  <ellipse cx="40" cy="60" rx="27" ry="24" fill="#FCE4EC"/>
  <polygon points="40,8 33,38 47,38" fill="#FFD600"/>
  <line x1="36" y1="18" x2="44" y2="27" stroke="#FF6F00" stroke-width="2"/>
  <line x1="34" y1="29" x2="42" y2="36" stroke="#FF6F00" stroke-width="2"/>
  <polygon points="54,45 59,30 64,45" fill="#FCE4EC" stroke="#F48FB1" stroke-width="1.5"/>
  <path d="M56,42 Q72,50 68,64 Q76,55 73,68" stroke="#EC407A" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M58,40 Q78,46 76,62"             stroke="#CE93D8" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M60,38 Q80,42 79,57"             stroke="#FFD600" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="32" cy="58" r="5" fill="#212121"/>
  <circle cx="33.5" cy="56.5" r="2" fill="#fff"/>
  <ellipse cx="27" cy="68" rx="5" ry="3" fill="#F48FB1" opacity=".55"/>
  <ellipse cx="30" cy="74" rx="3" ry="2" fill="#F48FB1"/>
</svg>`;

const SVG_STAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none" aria-hidden="true">
  <polygon points="30,3 36,22 56,22 41,34 47,53 30,41 13,53 19,34 4,22 24,22"
           fill="#FFD600" stroke="#FF8F00" stroke-width="1.5"/>
  <circle cx="44" cy="11" r="3"   fill="#fff" opacity=".8"/>
  <circle cx="16" cy="16" r="2"   fill="#fff" opacity=".6"/>
  <circle cx="38" cy="40" r="1.5" fill="#fff" opacity=".5"/>
</svg>`;

// ── SessionStorage ────────────────────────────────────────────────────────────
const STORAGE_KEY = 'sillabiamo_settings';

function loadSettings() {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || null; }
  catch { return null; }
}

function saveSettings(tema, difficolta) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tema, difficolta }));
}

function clearSettings() {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ── Filtro parole per difficoltà ──────────────────────────────────────────────
const DIFF_SILLABE = { facile: 2, medio: 3, difficile: 4 };

function filterParole(difficolta) {
  const n = DIFF_SILLABE[difficolta];
  return parole.filter(e => e.sillabe.length === n);
}

// ── Stato applicazione ────────────────────────────────────────────────────────
let gamePool       = [];
let currentEntry   = null;
let highlightedIdx = -1;
let setupTema      = null;
let setupDiff      = null;

// ── DOM refs ──────────────────────────────────────────────────────────────────
const setupScreen   = document.getElementById('setupScreen');
const gameScreen    = document.getElementById('gameScreen');
const temaBtns      = document.querySelectorAll('.tema-btn');
const diffBtns      = document.querySelectorAll('.diff-btn');
const startBtn      = document.getElementById('startBtn');
const backBtn       = document.getElementById('backBtn');
const searchInput   = document.getElementById('searchInput');
const clearBtn      = document.getElementById('clearBtn');
const randomBtn     = document.getElementById('randomBtn');
const dropdown      = document.getElementById('dropdown');
const syllableArea  = document.getElementById('syllableArea');
const selectedWord  = document.getElementById('selectedWord');
const syllableBoxes = document.getElementById('syllableBoxes');
const readWordBtn   = document.getElementById('readWordBtn');
const emptyState    = document.getElementById('emptyState');
const floatLeft     = document.getElementById('floatLeft');
const floatRight    = document.getElementById('floatRight');
const headerDecoL   = document.getElementById('headerDecoLeft');
const headerDecoR   = document.getElementById('headerDecoRight');

// ── Gestione schermate ────────────────────────────────────────────────────────
function showSetup() {
  setupScreen.hidden = false;
  gameScreen.hidden  = true;
  document.documentElement.removeAttribute('data-tema');
  setupTema = null;
  setupDiff = null;
  temaBtns.forEach(b => b.classList.remove('selected'));
  diffBtns.forEach(b => b.classList.remove('selected'));
  startBtn.disabled = true;
}

function showGame(tema, difficolta) {
  setupScreen.hidden = true;
  gameScreen.hidden  = false;
  document.documentElement.dataset.tema = tema;
  gamePool     = filterParole(difficolta);
  currentEntry = null;

  // Decorazioni tematiche
  const [svg1, svg2] = tema === 'maschio'
    ? [SVG_CAR, SVG_TRAIN]
    : [SVG_UNICORN, SVG_STAR];

  headerDecoL.innerHTML = svg1;
  headerDecoR.innerHTML = svg2;
  floatLeft.innerHTML   = svg1;
  floatRight.innerHTML  = svg2;

  // Reset UI gioco
  searchInput.value     = '';
  clearBtn.hidden       = true;
  syllableArea.hidden   = true;
  emptyState.hidden     = false;
  closeDropdown();
}

// ── Setup: selezione tema ─────────────────────────────────────────────────────
temaBtns.forEach(btn => btn.addEventListener('click', () => {
  temaBtns.forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  setupTema = btn.dataset.tema;
  document.documentElement.dataset.tema = setupTema;
  startBtn.disabled = !(setupTema && setupDiff);
}));

// ── Setup: selezione difficoltà ───────────────────────────────────────────────
diffBtns.forEach(btn => btn.addEventListener('click', () => {
  diffBtns.forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  setupDiff = btn.dataset.diff;
  startBtn.disabled = !(setupTema && setupDiff);
}));

// ── Setup: avvio gioco ────────────────────────────────────────────────────────
startBtn.addEventListener('click', () => {
  if (!setupTema || !setupDiff) return;
  saveSettings(setupTema, setupDiff);
  showGame(setupTema, setupDiff);
});

// ── Gioco: torna al setup ─────────────────────────────────────────────────────
backBtn.addEventListener('click', () => {
  clearSettings();
  showSetup();
});

// ── Autocomplete ──────────────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  clearBtn.hidden = query.length === 0;
  if (!query) { closeDropdown(); return; }

  const matches = gamePool
    .filter(e => e.parola.toLowerCase().includes(query))
    .slice(0, 20);

  if (!matches.length) { closeDropdown(); return; }

  highlightedIdx = -1;
  dropdown.innerHTML = '';
  matches.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = entry.parola;
    li.addEventListener('pointerdown', e => { e.preventDefault(); selectEntry(entry); });
    dropdown.appendChild(li);
  });
  dropdown.hidden = false;
});

// Navigazione tastiera nel dropdown
searchInput.addEventListener('keydown', e => {
  const items = dropdown.querySelectorAll('li');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    highlightedIdx = Math.min(highlightedIdx + 1, items.length - 1);
    updateHighlight(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    highlightedIdx = Math.max(highlightedIdx - 1, 0);
    updateHighlight(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (highlightedIdx >= 0)     items[highlightedIdx].dispatchEvent(new Event('pointerdown'));
    else if (items.length === 1) items[0].dispatchEvent(new Event('pointerdown'));
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
});

document.addEventListener('pointerdown', e => {
  if (!e.target.closest('.search-container')) closeDropdown();
});

function updateHighlight(items) {
  items.forEach((li, i) => li.classList.toggle('highlighted', i === highlightedIdx));
  if (highlightedIdx >= 0) items[highlightedIdx].scrollIntoView({ block: 'nearest' });
}

function closeDropdown() {
  dropdown.hidden    = true;
  dropdown.innerHTML = '';
  highlightedIdx     = -1;
}

// ── Clear button ──────────────────────────────────────────────────────────────
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.hidden   = true;
  closeDropdown();
  searchInput.focus();
});

// ── Pulsante dado: parola random ──────────────────────────────────────────────
randomBtn.addEventListener('click', () => {
  if (!gamePool.length) return;
  selectEntry(gamePool[Math.floor(Math.random() * gamePool.length)]);
});

// ── Selezione parola ──────────────────────────────────────────────────────────
function selectEntry(entry) {
  currentEntry      = entry;
  searchInput.value = entry.parola;
  clearBtn.hidden   = false;
  closeDropdown();
  renderSillabe(entry);
  searchInput.blur();
}

// ── Render sillabe ────────────────────────────────────────────────────────────
function renderSillabe(entry) {
  selectedWord.textContent = entry.parola;
  syllableBoxes.innerHTML  = '';

  entry.sillabe.forEach(sil => {
    const btn = document.createElement('button');
    btn.className = 'syl-box';
    btn.textContent = sil;
    btn.setAttribute('aria-label', `Sillaba: ${sil}`);
    btn.addEventListener('click', () => speakText(sil, btn));
    syllableBoxes.appendChild(btn);
  });

  syllableArea.hidden = false;
  emptyState.hidden   = true;
  syllableArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── Leggi la parola ───────────────────────────────────────────────────────────
readWordBtn.addEventListener('click', () => {
  if (currentEntry) speakText(currentEntry.parola, readWordBtn);
});

// ── Web Speech API ────────────────────────────────────────────────────────────
// iOS Safari richiede un gesto utente; i click/touch sui pulsanti lo soddisfano già.
// Questo handler sblocca il contesto audio su dispositivi che richiedono un touch iniziale.
window.addEventListener('touchstart', () => {}, { once: true, passive: true });

function speakText(text, triggerEl) {
  if (!window.speechSynthesis) {
    alert('Il tuo browser non supporta la sintesi vocale 😢');
    return;
  }
  window.speechSynthesis.cancel();

  const utter   = new SpeechSynthesisUtterance(text);
  utter.lang    = 'it-IT';
  utter.rate    = 0.85;
  utter.pitch   = 1.1;

  if (triggerEl) {
    triggerEl.classList.add('speaking');
    utter.onend   = () => triggerEl.classList.remove('speaking');
    utter.onerror = () => triggerEl.classList.remove('speaking');
  }

  const doSpeak = () => {
    const voices  = window.speechSynthesis.getVoices();
    const itVoice = voices.find(v => v.lang.startsWith('it'));
    if (itVoice) utter.voice = itVoice;
    window.speechSynthesis.speak(utter);
  };

  // Le voci su Chrome/Android vengono caricate in modo asincrono
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.onvoiceschanged = null;
      doSpeak();
    };
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
(function init() {
  const saved = loadSettings();
  if (saved?.tema && saved?.difficolta) {
    showGame(saved.tema, saved.difficolta);
  } else {
    showSetup();
  }
})();
