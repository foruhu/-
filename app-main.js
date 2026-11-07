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
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  onClassChange();
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
