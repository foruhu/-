// ==========================================================
// 表示モード（編集画面／表示画面の切り替え）
// ==========================================================
function applyViewModeUI(isView) {
  document.body.classList.toggle('view-mode', isView);
  const btn = document.getElementById('view-mode-toggle');
  if (btn) {
    btn.textContent = isView ? '✏️ 編集' : '🔒 表示';
  }
}

// 戦闘用表示：表示モードのとき、パーツ・スキル・未練・行動値だけに絞る（初期はON）
function applyBattleView(on) {
  document.body.classList.toggle('battle-view', on);
  const b = document.getElementById('battle-toggle');
  if (b) b.textContent = on ? '⚔️ 戦闘用：ON' : '⚔️ 戦闘用：OFF';
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
    try { window.print(); } finally { restoreAfterPrint(); }
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
}
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
  try { fold = localStorage.getItem('necro_bar_fold') === '1'; fs = localStorage.getItem('necro_font_size') || 'medium'; } catch (e) {}
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
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  onClassChange();
  if (typeof captureBlankSheet === 'function') captureBlankSheet();
  if (typeof migrateOldSingleSave === 'function') migrateOldSingleSave();
  if (typeof refreshSaveSlotOptions === 'function') refreshSaveSlotOptions();
  if (typeof setupDirtyTracking === 'function') setupDirtyTracking();
  if (typeof startAutosaveTimer === 'function') startAutosaveTimer();
  if (typeof updateUndoButtonState === 'function') updateUndoButtonState();

  // URLに共有データ（#share=...）が含まれていれば自動で読み込む（完了を待ってから続ける）
  if (typeof checkForSharedURLOnLoad === 'function') await checkForSharedURLOnLoad();

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
};
