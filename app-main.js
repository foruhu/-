// ==========================================================
// いま開いているバージョンの番号(ファイル名の「?v=」の数字)を返す
function getAppVersion() {
  try {
    const s = document.querySelector('script[src*="app-main.js"]');
    const m = s && /[?&]v=(\d+)/.exec(s.getAttribute('src') || '');
    return m ? m[1] : '';
  } catch (e) { return ''; }
}
function showAppVersion() {
  const el = document.getElementById('app-version');
  if (el) el.textContent = getAppVersion() ? 'v' + getAppVersion() : '(不明)';
}
// 公開されている最新のバージョンと見比べる(通信できないときは、その旨を知らせる)
async function checkLatestVersion() {
  const out = document.getElementById('app-version-result');
  const say = (t, ok) => { if (out) { out.textContent = t; out.style.color = ok === true ? '#7fe3a8' : (ok === false ? '#ffb3bd' : '#bbb'); } };
  try {
    say('確認中…');
    const res = await fetch('index.html?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error('http ' + res.status);
    const html = await res.text();
    const m = /app-main\.js\?v=(\d+)/.exec(html);
    if (!m) throw new Error('no version');
    const latest = m[1], cur = getAppVersion();
    if (!cur) say('最新は v' + latest + ' です(いま開いている番号は分かりませんでした)。');
    else if (latest === cur) say('最新です(v' + cur + ')。', true);
    else say('新しい版があります(最新 v' + latest + '、いま v' + cur + ')。ページを再読み込みしてください(直らないときは、ブラウザの「更新」を長押しして、キャッシュを消す再読み込みをしてください)。', false);
  } catch (e) {
    say('確認できませんでした(通信できないか、ファイルから開いている可能性があります)。', false);
  }
}
document.addEventListener('DOMContentLoaded', showAppVersion);

// 表示モード（編集画面／表示画面の切り替え）
// ==========================================================
function applyViewModeUI(isView) {
  document.body.classList.toggle('view-mode', isView);
  const btn = document.getElementById('view-mode-toggle');
  if (btn) {
    btn.textContent = isView ? '✏️ 編集' : '🔒 表示';
  }
}

// 閲覧用URLで開いたときの「編集ロック」：切替ボタンを隠し、入力欄を読み取り専用にする
// （チェックボックス＝損傷・使用の確認は、セッション中に使えるよう残す）
function lockViewOnly() {
  document.body.classList.add('view-locked');
  document.querySelectorAll('input:not([type="checkbox"]), textarea').forEach(e => {
    if (e.type === 'file') { e.disabled = true; return; }
    e.readOnly = true;
  });
  document.querySelectorAll('select, input[type="radio"]').forEach(e => { e.disabled = true; });
}

// 戦闘用表示：表示モードのとき、パーツ・スキル・未練・行動値だけに絞る（初期はON）
function applyBattleView(on) {
  document.body.classList.toggle('battle-view', on);
  const b = document.getElementById('battle-toggle');
  if (b) {
    b.textContent = on ? '⚔️ 戦闘用：ON ✔' : '⚔️ 戦闘用：OFF';
    b.classList.toggle('on', on);
    b.classList.toggle('off', !on);
  }
}
function toggleBattleView() {
  const on = !document.body.classList.contains('battle-view');
  applyBattleView(on);
  try { localStorage.setItem('necro_battle_view', on ? '1' : '0'); } catch (e) {}
}
function initBattleView() {
  let on = true;
  try { if (localStorage.getItem('necro_battle_view') === '0') on = false; } catch (e) {}
  applyBattleView(on);
}

// 印刷：表示モードと同じ見た目（編集用のボタンなし）で、全項目を開いた状態にして印刷する
let printRestore = null;
function printSheet() {
  const body = document.body;
  printRestore = {
    view: body.classList.contains('view-mode'),
    battle: body.classList.contains('battle-view'),
    limitOpen: document.getElementById('limit-card') ? document.getElementById('limit-card').open : true
  };
  body.classList.add('view-mode', 'print-mode');
  body.classList.remove('battle-view');
  const lc = document.getElementById('limit-card');
  if (lc) lc.open = true;
  if (typeof autoResizeAllMemoTextareas === 'function') autoResizeAllMemoTextareas();
  addPrintClones();
  const credit = document.createElement('div');
  credit.className = 'print-credit';
  credit.textContent = 'Printed by ドール設計図館, ' + location.origin + location.pathname;
  document.body.appendChild(credit);
  setTimeout(() => {
    // iPhoneのSafariは print() がすぐ戻ってくるので、ここですぐ元に戻すと印刷プレビューが普通の画面になってしまう。
    // 印刷が終わった合図(afterprint)か、印刷のあとの最初の操作で元に戻す
    window.print();
    const t0 = Date.now();
    const later = () => { if (Date.now() - t0 < 1500) return; ['pointerdown', 'keydown', 'visibilitychange'].forEach(ev => document.removeEventListener(ev, later, true)); restoreAfterPrint(); };
    ['pointerdown', 'keydown', 'visibilitychange'].forEach(ev => document.addEventListener(ev, later, true));
  }, 100);
}
// 1行の入力欄は、長い文章が欄の幅で切れて印刷されてしまう。はみ出す欄だけ、折り返して全文が出る表示に差し替える
function addPrintClones() {
  document.querySelectorAll('input[type="text"]').forEach(i => {
    if (!i.value || i.offsetParent === null || i.scrollWidth <= i.clientWidth) return;
    const sp = document.createElement('span');
    sp.className = 'print-clone';
    sp.textContent = i.value;
    i.classList.add('print-hidden');
    i.after(sp);
  });
}
function removePrintClones() {
  document.querySelectorAll('.print-clone').forEach(e => e.remove());
  document.querySelectorAll('input.print-hidden').forEach(i => i.classList.remove('print-hidden'));
}
function restoreAfterPrint() {
  if (!printRestore) return;
  removePrintClones();
  document.querySelectorAll('.print-credit').forEach(e => e.remove());
  const body = document.body;
  body.classList.remove('print-mode');
  body.classList.toggle('view-mode', printRestore.view);
  body.classList.toggle('battle-view', printRestore.battle);
  const lc = document.getElementById('limit-card');
  if (lc) lc.open = printRestore.limitOpen;
  printRestore = null;
  if (typeof autoResizeAllMemoTextareas === 'function') setTimeout(autoResizeAllMemoTextareas, 50);
}
window.addEventListener('afterprint', restoreAfterPrint);

// 数値欄の下限・上限（min / max）を、タイプ入力でも守る。
// min="0" の欄は、キーボードで「-3」と打ててしまい、寵愛や狂気点が負になるため。
// 他の入力処理（合計の計算など）より先に直すよう、キャプチャ段階で受ける
document.addEventListener('input', (e) => {
  const el = e.target;
  if (!el || el.tagName !== 'INPUT' || el.type !== 'number' || el.value === '') return;
  const v = Number(el.value);
  if (Number.isNaN(v)) return;
  if (el.min !== '' && v < Number(el.min)) el.value = el.min;
  else if (el.max !== '' && v > Number(el.max)) el.value = el.max;
}, true);

// 固定バーの折りたたみ（武装・変異・改造の表と目次を畳む）
function applyBarFold(collapsed) {
  const bar = document.querySelector('.sticky-top-bar');
  if (bar) bar.classList.toggle('bar-collapsed', collapsed);
  const b = document.getElementById('bar-fold-btn');
  if (b) b.textContent = collapsed ? '▼ 開く' : '▲ 閉じる';
  updateBarSummary();
}

// 畳んだ固定バーに出す、武装・変異・改造・スキルの使用数/上限（1行）
function updateBarSummary() {
  try {
    const box = document.getElementById('bar-summary');
    if (!box) return;
    const num = id => { const e = document.getElementById(id); return e ? (parseInt(e.textContent, 10) || 0) : 0; };
    const items = [['武装', 'wep', '#ff6b6b'], ['変異', 'mut', '#4dabf7'], ['改造', 'cyb', '#ffd43b']].map(([label, k, color]) => {
      let used = 0, max = 0;
      for (let i = 1; i <= 3; i++) { used += num(`used-${k}-lv${i}`); max += num(`max-${k}-lv${i}`); }
      return { label, color, used, max };
    });
    const line = document.getElementById('bar-skill-line');
    let su = 0, sm = 0;
    if (line) for (const mt of (line.textContent || '').matchAll(/(\d+)\s*\/\s*(\d+)/g)) { su += +mt[1]; sm += +mt[2]; }
    items.push({ label: 'スキル', color: '#c9a8f0', used: su, max: sm });
    box.innerHTML = items.map(it => `<span><span style="color:${it.color};font-weight:bold;">${it.label}</span> <b class="${it.used > it.max ? 'over' : ''}">${it.used}</b>/${it.max}</span>`).join('');
  } catch (e) { /* 表示できなくても、畳んだバーが少し寂しくなるだけ */ }
}
(function watchBarSummary() {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const bar = document.querySelector('.sticky-top-bar .bar-detail');
      if (!bar || typeof MutationObserver === 'undefined') return;
      let t = null;
      new MutationObserver(() => { clearTimeout(t); t = setTimeout(updateBarSummary, 60); }).observe(bar, { subtree: true, childList: true, characterData: true });
      updateBarSummary();
    } catch (e) {}
  });
})();
function toggleBarFold() {
  const collapsed = !document.querySelector('.sticky-top-bar').classList.contains('bar-collapsed');
  applyBarFold(collapsed);
  try { localStorage.setItem('necro_bar_fold', collapsed ? '1' : '0'); } catch (e) {}
}

// 文字サイズ（小→中→大）
const FONT_SIZES = ['small', 'medium', 'large'];
const FONT_SIZE_LABEL = { small: '小', medium: '中', large: '大' };
function applyFontSize(size) {
  if (!FONT_SIZES.includes(size)) size = 'medium';
  const root = document.documentElement;
  root.classList.remove('fs-small', 'fs-large');
  if (size === 'small') root.classList.add('fs-small');
  if (size === 'large') root.classList.add('fs-large');
  const b = document.getElementById('fs-btn');
  if (b) b.textContent = '文字：' + FONT_SIZE_LABEL[size];
  if (typeof autoResizeAllMemoTextareas === 'function') setTimeout(autoResizeAllMemoTextareas, 50);
}
function cycleFontSize() {
  let cur = 'medium';
  try { cur = localStorage.getItem('necro_font_size') || 'medium'; } catch (e) {}
  const next = FONT_SIZES[(FONT_SIZES.indexOf(cur) + 1) % FONT_SIZES.length];
  applyFontSize(next);
  try { localStorage.setItem('necro_font_size', next); } catch (e) {}
}
function initBarAndFont() {
  let fold = false, fs = 'medium';
  try {
    const saved = localStorage.getItem('necro_bar_fold');
    // 一度も開閉していない小さな画面(スマホ)では、固定バーが画面を占めすぎるので、初めは畳んでおく（「▼ 開く」で開ける。開閉したら、その選択を覚える）
    fold = saved === null ? !!(window.matchMedia && window.matchMedia('(max-width: 560px)').matches) : saved === '1';
    fs = localStorage.getItem('necro_font_size') || 'medium';
  } catch (e) {}
  applyBarFold(fold);
  applyFontSize(fs);
}

// ページ内の移動（固定バーに隠れないよう、バーの高さ分だけ手前で止める）
function jumpToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const bar = document.querySelector('.sticky-top-bar');
  const offset = (bar ? bar.offsetHeight : 0) + 8;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
}

function toggleViewMode() {
  if (document.body.classList.contains('view-locked')) return; // 閲覧用URLで開いたときは、編集に切り替えられない
  const isView = !document.body.classList.contains('view-mode');
  applyViewModeUI(isView);
  try {
    localStorage.setItem('necro_view_mode', isView ? '1' : '0');
  } catch (e) {
    // 保存に失敗しても致命的ではない
  }
  if (typeof autoResizeAllMemoTextareas === 'function') {
    setTimeout(autoResizeAllMemoTextareas, 50);
  }
}

window.onload = async function() {
  initBattleView();
  initBarAndFont();
  if (typeof initLook === 'function') initLook();
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  onClassChange();
  if (typeof captureBlankSheet === 'function') captureBlankSheet();
  if (typeof migrateOldSingleSave === 'function') migrateOldSingleSave();
  if (typeof refreshSaveSlotOptions === 'function') refreshSaveSlotOptions();
  if (typeof setupDirtyTracking === 'function') setupDirtyTracking();
  if (typeof startAutosaveTimer === 'function') startAutosaveTimer();
  if (typeof updateUndoButtonState === 'function') updateUndoButtonState();

  // URLに共有データ（#share=...）が含まれていれば自動で読み込む（完了を待ってから続ける）
  const hadHash = !!(location.hash && /^#(tok|share|view)/.test(location.hash));
  if (typeof checkForSharedURLOnLoad === 'function') await checkForSharedURLOnLoad();
  // 共有URLでなければ、更新前に編集していた内容に戻す
  if (typeof migrateKnownTypos === 'function') migrateKnownTypos();
  if (typeof initCardTools === 'function') initCardTools();
  setTimeout(() => { if (typeof captureBaselineState === 'function') captureBaselineState(); }, 400);
  setTimeout(() => { if (typeof maybeShowBackupNudge === 'function') maybeShowBackupNudge(); }, 1500);
  setTimeout(() => { if (typeof maybeShowWelcome === 'function') maybeShowWelcome(); }, 500);
  if (!hadHash && typeof restoreWorkOnLoad === 'function') restoreWorkOnLoad();

  // 新規キャラクター作成時（何も読み込んでいない初期状態）は、記憶のカケラ枠を2個用意しておく
  const memoryListEl = document.getElementById('memory-list');
  if (memoryListEl && memoryListEl.children.length === 0) {
    addMemoryEntry();
    addMemoryEntry();
  }

  isDirty = false; // ページを開いた直後はまだ何も編集していない状態にする

  // レイアウト確定後にもう一度、効果メモ欄の高さを合わせ直す（初回描画時のズレ防止）
  if (typeof autoResizeAllMemoTextareas === 'function') {
    setTimeout(autoResizeAllMemoTextareas, 50);
  }

  let savedViewMode = '0';
  try { savedViewMode = localStorage.getItem('necro_view_mode') || '0'; } catch (e) {}
  applyViewModeUI(savedViewMode === '1');
  restoreUiState();
};


// ==========================================================
// 更新（再読み込み）しても、スクロール位置と折りたたみの開閉を元に戻す
// ==========================================================
const UI_STATE_KEY = 'necro_ui_state';
let uiSaveTimer = null;

function saveUiState() {
  try {
    if (document.body.classList.contains('view-locked')) return;
    const st = {
      y: Math.round(window.scrollY || 0),
      limit: !!document.getElementById('limit-card')?.open,
      share: document.getElementById('export-share-section')?.style.display !== 'none',
      emerg: !!document.querySelector('.emergency-fold')?.open,
      mem: Array.from(document.querySelectorAll('#memory-list .memory-entry')).map(r => r.classList.contains('collapsed') ? 1 : 0)
    };
    localStorage.setItem(UI_STATE_KEY, JSON.stringify(st));
  } catch (e) {}
}
function scheduleSaveUiState() {
  if (uiSaveTimer) clearTimeout(uiSaveTimer);
  uiSaveTimer = setTimeout(saveUiState, 250);
}

function restoreUiState() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem(UI_STATE_KEY) || 'null'); } catch (e) {}
  if (st) {
    try {
      const lim = document.getElementById('limit-card'); if (lim && typeof st.limit === 'boolean') lim.open = st.limit;
      const em = document.querySelector('.emergency-fold'); if (em && typeof st.emerg === 'boolean') em.open = st.emerg;
      if (typeof st.share === 'boolean') {
        const sec = document.getElementById('export-share-section');
        if (sec && (sec.style.display !== 'none') !== st.share) toggleExportShareSection();
      }
      const rows = Array.from(document.querySelectorAll('#memory-list .memory-entry'));
      (st.mem || []).forEach((c, i) => { if (rows[i]) toggleMemoryDetail(rows[i].querySelector('.memory-toggle'), !!c); });
    } catch (e) {}
    const y = st.y || 0;
    // 文章欄の高さが整ってから位置を合わせる
    [120, 400].forEach(ms => setTimeout(() => window.scrollTo(0, y), ms));
  }
  window.addEventListener('scroll', scheduleSaveUiState, { passive: true });
  document.addEventListener('click', scheduleSaveUiState, true);
  document.addEventListener('toggle', scheduleSaveUiState, true);
  window.addEventListener('pagehide', saveUiState);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveUiState(); });
}

// ==========================================================
// 表の中の文字（スキル名・パーツ名・タイミング・コスト・射程など）が枠からはみ出すときは、文字を小さくして枠に収める
// ==========================================================
let fitTimer = null;
function fitCellTexts() {
  const cv = fitCellTexts._cv || (fitCellTexts._cv = document.createElement('canvas'));
  const ctx = cv.getContext('2d');
  const els = document.querySelectorAll('.maneuver-table select, .maneuver-table input:not([type="checkbox"]):not([type="radio"]):not([type="number"]), #sec-miren table input:not([type="checkbox"]):not([type="radio"]):not([type="number"])');
  // まず全部の指定を外して元の大きさにし、そのあと測る（読み取りと書き込みを分けて、再描画を減らす）
  els.forEach(el => { if (el.style.fontSize) el.style.fontSize = ''; });
  const jobs = [];
  els.forEach(el => {
    const w = el.clientWidth;
    if (!w) return;
    let text = el.tagName === 'SELECT' ? (el.selectedIndex >= 0 ? el.options[el.selectedIndex].text : '') : el.value;
    if (!text) return;
    const cs = getComputedStyle(el);
    const avail = w - parseFloat(cs.paddingLeft || 0) - parseFloat(cs.paddingRight || 0) - (el.tagName === 'SELECT' ? 6 : 3);
    const base = parseFloat(cs.fontSize);
    jobs.push({ el, text, avail: avail * 0.96, base, font: `${cs.fontWeight} {S}px ${cs.fontFamily}` });
  });
  jobs.forEach(j => {
    let size = j.base;
    const measure = s => { ctx.font = j.font.replace('{S}', s); return ctx.measureText(j.text).width; };
    if (measure(size) <= j.avail) return;
    while (size > j.base * 0.55 && measure(size) > j.avail) size -= 0.5;
    j.el.style.fontSize = size + 'px';
  });
}
function scheduleFitCellTexts() {
  // 値の読み込み（入力欄の中身の書き換え）は変化として検知できないため、少し間を置いてもう一度測る
  if (!fitTimer) fitTimer = setTimeout(() => { fitTimer = null; fitCellTexts(); }, 80);
  if (!fitTimer2) fitTimer2 = setTimeout(() => { fitTimer2 = null; fitCellTexts(); }, 600);
}
let fitTimer2 = null;
(function () {
  window.addEventListener('load', () => {
    setTimeout(fitCellTexts, 300);
    ['skill-tbody', 'parts-container', 'list'].forEach(id => {
      const t = document.getElementById(id);
      // 行の追加・削除のときだけ測り直す（カウント表示などの書き換えでは動かさない）
      if (t) new MutationObserver(recs => {
        if (recs.some(r => Array.from(r.addedNodes).concat(Array.from(r.removedNodes)).some(n => n.nodeType === 1 && (n.tagName === 'TR' || (n.querySelector && n.querySelector('tr')))))) scheduleFitCellTexts();
      }).observe(t, { childList: true, subtree: true });
    });
    new MutationObserver(scheduleFitCellTexts).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    new MutationObserver(scheduleFitCellTexts).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  });
  document.addEventListener('input', e => { if (e.target && e.target.closest && e.target.closest('.maneuver-table, #sec-miren')) scheduleFitCellTexts(); });
  document.addEventListener('change', e => { if (e.target && e.target.closest && e.target.closest('.maneuver-table, #sec-miren')) scheduleFitCellTexts(); });
  window.addEventListener('resize', scheduleFitCellTexts);
})();

// 数値入力欄の min / max は、矢印ボタンにしか効かず、キーボードで直接打つと範囲外の値（例：-5）が通ってしまう。
// 入力された時点（oninput より先）と、入力を確定した時点で、範囲内に収める。
(function () {
  function clampNumberInput(el, final) {
    if (!el || el.tagName !== 'INPUT' || el.type !== 'number' || el.readOnly) return false;
    if (el.value === '' || el.validity.badInput) return false;
    const v = Number(el.value);
    if (!isFinite(v)) return false;
    const hasMin = el.min !== '' && isFinite(Number(el.min));
    const hasMax = el.max !== '' && isFinite(Number(el.max));
    let nv = v;
    // 入力の途中（例：最小1の欄に「1」を打つ前の「0」）を邪魔しないよう、入力中は「0以上のはずの欄の負の値」だけ直し、確定時にすべて直す
    if (hasMin && v < Number(el.min) && (final || Number(el.min) <= 0)) nv = Number(el.min);
    if (hasMax && v > Number(el.max) && final) nv = Number(el.max);
    if (nv !== v) { el.value = String(nv); return true; }
    return false;
  }
  document.addEventListener('input', function (e) { clampNumberInput(e.target, false); }, true);
  document.addEventListener('change', function (e) {
    if (clampNumberInput(e.target, true)) e.target.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);
})();

// 初めて開いた人への、短い案内（一度だけ。すでに保存済みのキャラがいる人や、共有・閲覧用URLで開いた人には出さない）
let welcomeShown = false;
function maybeShowWelcome() {
  try {
    if (welcomeShown) return;
    if (document.body.classList.contains('view-locked') || document.body.classList.contains('view-mode')) return;
    if (location.hash && /^#(tok|share|view)/.test(location.hash)) return;
    let seen = '';
    try { seen = localStorage.getItem('necro_welcome_seen') || ''; } catch (e) {}
    if (seen) return;
    const hasSaved = Object.keys(getSavedSheets()).some(i => i !== 'autosave_draft');
    if (hasSaved) { try { localStorage.setItem('necro_welcome_seen', '1'); } catch (e) {} return; }
    welcomeShown = true;
    const ov = document.createElement('div');
    ov.id = 'welcome-overlay';
    ov.setAttribute('role', 'dialog');
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:10002;padding:16px;overflow-y:auto;';
    ov.innerHTML = `<div style="max-width:380px;margin:50px auto;background:#18181c;border:1.5px solid #8b0000;border-radius:10px;padding:16px;color:#eee;line-height:1.6;">
      <div style="color:#f0a0a0;font-weight:bold;font-size:1.05rem;margin-bottom:8px;">ようこそ、ドール設計図館へ</div>
      <div style="font-size:.85rem;">『永い後日談のネクロニカ』用の、非公式キャラクターシート作成・保管ツールです。</div>
      <ul style="font-size:.82rem;margin:10px 0 0;padding-left:1.2em;">
        <li>入力すると、自動で下書きが保存されます。キャラクターとして残すには「💾 ブラウザに保存」を押してください。</li>
        <li>保存先は、このブラウザの中だけです。ブラウザのデータを消すとキャラクターも消えるので、時々「📦 全キャラをバックアップ」で書き出しておくと安心です。</li>
        <li>左下の「🔒 表示」で、見やすい表示用の画面に切り替えられます。</li>
        <li>くわしい使い方は、右下の「📜 README」ボタンからいつでも読めます。</li>
      </ul>
      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
        <button type="button" class="sec" id="welcome-help">README を読む</button>
        <button type="button" id="welcome-ok">はじめる</button>
      </div></div>`;
    document.body.appendChild(ov);
    const done = () => { try { localStorage.setItem('necro_welcome_seen', '1'); } catch (e) {} ov.remove(); };
    ov.querySelector('#welcome-ok').onclick = done;
    ov.querySelector('#welcome-help').onclick = () => { done(); if (typeof openHelp === 'function') openHelp(); };
  } catch (e) { /* 出せなくても、ほかの動きには影響しない */ }
}

// どの機能が使われているかを、回数だけ、個人を特定しない形で数える（GoatCounter のイベント。キャラクターの内容や名前は送らない）。
// 数える仕組みが無い（テスト版・広告ブロックなど）ときは、何もしない
function trackFeature(name) {
  try {
    if (window.goatcounter && typeof window.goatcounter.count === 'function') {
      window.goatcounter.count({ path: 'feature/' + name, title: name, event: true });
    }
  } catch (e) { /* 数えられなくても、機能には影響しない */ }
}
(function wrapTrackedFeatures() {
  const names = {
    saveData: 'save', exportSheetImage: 'image', exportGroupImage: 'group-image', printSheetLayout: 'print',
    exportCcfolia: 'ccfolia-piece', exportChatPalette: 'chat-palette', exportAllCharactersBackup: 'backup',
    exportShareURL: 'share-url', exportViewURL: 'view-url', openHokanshoImport: 'hokansho-import', undoLastAction: 'undo',
    redoLastAction: 'redo', renameSelectedSave: 'rename', togglePinSelectedSave: 'pin', openTrashList: 'trash',
    onBackupVerifySelected: 'backup-verify', newBlankSheet: 'new-blank', duplicateSelectedSave: 'duplicate'
  };
  Object.keys(names).forEach(fn => {
    const orig = window[fn];
    if (typeof orig !== 'function') return;
    window[fn] = function () {
      const a0 = arguments[0];
      if (!(a0 && typeof a0 === 'object' && a0.returnCanvas)) trackFeature(names[fn]); // 卓まとめ画像の内部の描画は、数えない
      return orig.apply(this, arguments);
    };
  });
})();


// 固定バーのキャラ名を、名前の入力・保存・読み込み・表示モード切り替えのたびに更新する
(function setupEditingName() {
  const upd = () => { try { updateEditingName(); } catch (e) {} };
  document.addEventListener('input', e => { if (e.target && e.target.id === 'name') upd(); });
  document.addEventListener('change', upd);
  new MutationObserver(upd).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('load', () => setTimeout(upd, 600));
  setTimeout(upd, 100);
})();

// スマホ：スクロール中・入力中は、固定ボタン(保存/切替/表示/README)を薄くして、表の内容に重ならないようにする
function initFabDim() {
  try {
    const mq = window.matchMedia ? window.matchMedia('(max-width: 899px)') : null;
    let timer = null;
    const isField = el => !!(el && el.matches && el.matches('input:not([type=checkbox]):not([type=radio]), textarea, select'));
    const dim = () => { if (!mq || mq.matches) document.body.classList.add('fab-dim'); };
    const undimLater = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { if (!isField(document.activeElement)) document.body.classList.remove('fab-dim'); }, 1200);
    };
    window.addEventListener('scroll', () => { dim(); undimLater(); }, { passive: true });
    document.addEventListener('focusin', e => { if (isField(e.target)) { dim(); clearTimeout(timer); } });
    document.addEventListener('focusout', () => undimLater());
  } catch (e) { /* 薄くする機能が使えなくても、通常どおり表示するだけ */ }
}
document.addEventListener('DOMContentLoaded', initFabDim);

// スマホ：文字・表・配色のボタンを、「⚙ 表示設定」で開閉する
function toggleLookTools() {
  try {
    const bar = document.querySelector('.bar-tools');
    const btn = document.getElementById('look-toggle');
    if (!bar) return;
    const open = bar.classList.toggle('look-open');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  } catch (e) { /* 開閉できなくても、他の操作には影響しない */ }
}
