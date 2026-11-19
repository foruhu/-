// ==========================================================
// 元に戻す（Undo）・未保存の変更検知・自動保存
// ==========================================================
let undoStack = [];
const UNDO_LIMIT = 40;
let isDirty = false;
let autosaveTimer = null;
// いま画面で編集しているキャラクターの id（保存済みのキャラを読み込んだ・保存した、のときだけ入る。未保存の新規は ''）。
// 一覧で「選択」しただけのカードとは別に持つ（選択しただけで、編集中の内容がそのカードの下書きにならないようにするため）
let workingId = '';
function setWorkingId(id) {
  workingId = id || '';
  try { localStorage.setItem('necro_last_slot', workingId); } catch (e) {}
  try { updateEditingName(); } catch (e) {}
}
// 固定バーの先頭に、いま編集している(見ている)キャラの名前を出す。保存名と違うときは保存名も、未保存なら「未保存」と添える
function updateEditingName() {
  const box = document.getElementById('editing-name');
  if (!box) return;
  let saved = null;
  try { const e = workingId ? getSavedSheets()[workingId] : null; saved = e && e.name ? e.name : null; } catch (er) {}
  const nameEl = document.getElementById('name');
  const doll = ((nameEl && nameEl.value) || '').trim();
  const shown = doll || saved || '（名前未入力）';
  let tail = '';
  if (!workingId || saved === null) tail = '（未保存）';
  else if (saved !== shown) tail = `（保存名：${saved}）`;
  const label = document.body.classList.contains('view-mode') ? '👁 表示中' : '✏️ 編集中';
  box.textContent = `${label}：${shown}${tail}`;
  box.title = box.textContent;
}
// 保存済みの項目(entry)を画面に読み込んだあと、編集中のキャラの id を決める。下書きカードを読み込んだときは、下書きの元のキャラが編集中のキャラになる
function adoptLoadedEntry(id, entry) {
  const sheets = getSavedSheets();
  if (id === 'autosave_draft') {
    const of = entry && entry.draftOf;
    if (of && sheets[of]) { setWorkingId(of); pendingImages = []; }
    else { setWorkingId(''); pendingImages = entryImages(entry); }
  } else {
    setWorkingId(id);
    pendingImages = [];
  }
  refreshSaveSlotOptions(workingId);
}
// 外から読み込んだ内容（JSON・共有コード・共有URL・保管所テキスト全体）は、編集中だったキャラとは別物にする。
// 切り離さないと、前のキャラの下書きとして自動保存され、前のキャラを上書きしうる
function detachWorkingSheet() {
  setWorkingId('');
  pendingImages = [];
  const select = document.getElementById('save-slot');
  if (select) select.value = '';
  try {
    const sh = getSavedSheets();
    if (typeof renderSaveCards === 'function') renderSaveCards('');
    if (typeof updateSelectedActionsVisibility === 'function') updateSelectedActionsVisibility('');
    if (typeof updateViewModeImage === 'function') updateViewModeImage('');
  } catch (e) {}
}
// 画面の下に、短いメッセージを少しの間だけ出す（コピーしたときの合図など）
let toastTimer = null;
function showToast(msg) {
  try {
    let el = document.getElementById('app-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'app-toast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);max-width:88vw;z-index:100000;background:rgba(20,20,26,.96);color:#fff;border:1px solid #f0a0a0;border-radius:20px;padding:10px 18px;font-size:.9rem;font-weight:bold;box-shadow:0 4px 14px rgba(0,0,0,.6);pointer-events:none;text-align:center;transition:opacity .2s;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.style.opacity = '0'; }, 2200);
  } catch (e) {}
}
const AUTOSAVE_INTERVAL_MS = 20000; // 20秒ごとに未保存の変更があれば自動保存

// 「元に戻す」「やり直す」：編集（欄を書き換えて確定するたび）や、行の追加・削除、読み込みの前の状態を、順番に覚えておく
let redoStack = [];
let lastStateJson = null; // 直近の編集のあとの状態（次の編集の「前の状態」として使う）
function captureBaselineState() {
  try { lastStateJson = JSON.stringify(getFullData()); } catch (e) { lastStateJson = null; }
}
function pushUndoSnapshot() {
  try {
    const cur = JSON.stringify(getFullData());
    if (undoStack[undoStack.length - 1] !== cur) undoStack.push(cur);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack = [];
    updateUndoButtonState();
    // この操作が終わったあとの状態を、次の編集の基準にする
    setTimeout(captureBaselineState, 60);
  } catch (e) {
    // 取得に失敗しても致命的ではないので握りつぶす
  }
}
// 欄の書き換えが確定したとき、書き換える前の状態を覚える
function recordEditForUndo() {
  try {
    if (lastStateJson === null) { captureBaselineState(); return; }
    const cur = JSON.stringify(getFullData());
    if (cur === lastStateJson) return;
    if (undoStack[undoStack.length - 1] !== lastStateJson) undoStack.push(lastStateJson);
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    redoStack = [];
    lastStateJson = cur;
    updateUndoButtonState();
  } catch (e) {}
}

function updateUndoButtonState() {
  const btn = document.getElementById('undo-btn');
  if (btn) btn.disabled = undoStack.length === 0;
  const rb = document.getElementById('redo-btn');
  if (rb) rb.disabled = redoStack.length === 0;
}

function undoLastAction() {
  if (undoStack.length === 0) {
    alert('これ以上元に戻せません');
    return;
  }
  // 確定前の入力があれば、先にそれを1つの編集として覚える
  recordEditForUndo();
  const prevJson = undoStack[undoStack.length - 1];
  try {
    const data = JSON.parse(prevJson);
    const curJson = JSON.stringify(getFullData());
    applyData(data);
    undoStack.pop();
    redoStack.push(curJson);
    lastStateJson = prevJson;
    updateUndoButtonState();
    markDirty();
  } catch (e) {
    // 失敗したときは、履歴を減らさず、今の画面のままにする
    updateUndoButtonState();
    alert('元に戻す処理に失敗しました。画面の内容は変わっていません');
  }
}

function redoLastAction() {
  if (redoStack.length === 0) {
    alert('やり直せる操作がありません');
    return;
  }
  const nextJson = redoStack[redoStack.length - 1];
  try {
    const data = JSON.parse(nextJson);
    const curJson = JSON.stringify(getFullData());
    applyData(data);
    redoStack.pop();
    undoStack.push(curJson);
    lastStateJson = nextJson;
    updateUndoButtonState();
    markDirty();
  } catch (e) {
    updateUndoButtonState();
    alert('やり直す処理に失敗しました。画面の内容は変わっていません');
  }
}

// パーツ／スキル／未練／履歴などの行削除ボタン共通処理（削除前にUndo用スナップショットを保存する）
function removeRowWithUndo(button, afterFn) {
  pushUndoSnapshot();
  const el = button.closest('tr, .treasure-entry, .memory-entry');
  if (el) {
    // パーツ／スキルの本体行を消す場合は、直後の効果メモ行も一緒に消す
    const nextEl = el.nextElementSibling;
    if (nextEl && (nextEl.classList.contains('part-memo-row') || nextEl.classList.contains('skill-memo-row') || nextEl.classList.contains('miren-mad-row') || nextEl.classList.contains('history-memo-row'))) {
      nextEl.remove();
    }
    el.remove();
  }
  markDirty();
  if (typeof afterFn === 'function') afterFn();
}

function markDirty() {
  isDirty = true;
}

function setupDirtyTracking() {
  const ignoreIds = new Set(['save-slot', 'json-file-input', 'thumb-file-input', 'img-add-input', 'img-replace-input', 'backup-verify-input', 'backup-file-input', 'card-filter', 'card-sort']);
  const ignoreBox = '#card-tools, #cp-modal, #ccf-modal, #char-switch-overlay, #help-overlay, #hokansho-overlay, .backup-box'; // 一覧の絞り込みや、読み込み・書き出しの画面の入力は、キャラの変更ではない
  document.addEventListener('input', (e) => {
    if (e.target && ignoreIds.has(e.target.id)) return;
    if (e.target && e.target.closest && e.target.closest(ignoreBox)) return;
    isDirty = true;
  });
  document.addEventListener('change', (e) => {
    if (e.target && ignoreIds.has(e.target.id)) return;
    if (e.target && e.target.closest && e.target.closest(ignoreBox)) return;
    isDirty = true;
    if (!e.target || !e.target.closest || !e.target.closest('#card-tools, #cp-modal, #ccf-modal')) recordEditForUndo();
  });
}

window.addEventListener('beforeunload', function (e) {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

function formatTimeHM(d) {
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

function updateAutosaveStatusText(text) {
  const el = document.getElementById('autosave-status');
  if (el) el.textContent = text;
}

// 自動保存はしない。未保存の変更があるあいだ、保存ボタンをチカチカ光らせて、押し忘れを防ぐ
// (変更から30秒たつと光り始める。裏では、20秒ごとに下書きだけを控える=保険。保存済みのキャラは書き換えない)
const SAVE_BLINK_DELAY_MS = 30000;
let savePendingShown = null, dirtySince = 0, lastDraftAt = 0, draftFailed = false;
function refreshSavePending() {
  try {
    const dirty = !!isDirty && !document.body.classList.contains('view-locked');
    const now = Date.now();
    if (!dirty) { dirtySince = 0; } else if (!dirtySince) { dirtySince = now; lastDraftAt = now; } // 変更し始めてから20秒後に、最初の下書きを控える
    if (dirty && now - lastDraftAt >= AUTOSAVE_INTERVAL_MS) { lastDraftAt = now; performAutosave(true); } // 下書きの控え(静かに)
    if (!dirty) draftFailed = false;
    const blink = dirty && (draftFailed || now - dirtySince >= SAVE_BLINK_DELAY_MS); // 下書きを控えられないときは、すぐ光らせる
    const key = (dirty ? 'd' : '') + (blink ? 'b' : '') + (draftFailed ? 'f' : '');
    if (key === savePendingShown) return;
    savePendingShown = key;
    document.querySelectorAll('.fixed-save, .action-btn.c-green').forEach(b => b.classList.toggle('save-pending', blink));
    if (dirty) updateAutosaveStatusText(draftFailed ? '⚠ 未保存(下書き不可・早めに保存)' : '⚠ 未保存');
    else { const el = document.getElementById('autosave-status'); if (el && el.textContent.startsWith('⚠ 未保存')) el.textContent = ''; } // 「下書きを復元しました」などの別の表示は消さない
  } catch (e) { /* 光らせられなくても、保存そのものは使える */ }
}
function startAutosaveTimer() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(refreshSavePending, 400);
}

// 未保存の変更を下書き枠にだけ自動保存する。
// 選択中のキャラクターへは上書きしない。「💾 保存」を押すまで、選択中のキャラの保存内容は変わらない。
// 下書きには元になったキャラの id と名前を残す（draftOf / draftOfName）。
// 下書き保存だけでは「保存」したことにならないが、閉じる前の警告が毎回出て煩わしくならないよう、
// 下書きへ保存できたら isDirty は false にする。その代わり、状態表示で「下書き」であることを明示する。
function performAutosave(silent) {
  try {
    const data = getFullData();
    const select = document.getElementById('save-slot');
    const sheets = getSavedSheets();
    // 下書きの元は、一覧で選択しているカードではなく、いま編集しているキャラ(workingId)にする
    const selectedId = (workingId && sheets[workingId]) ? workingId : '';
    const selectedEntry = selectedId ? sheets[selectedId] : null;
    const id = 'autosave_draft';
    // 保存済みキャラの下書きは、サムネイル用のメイン1枚だけ持つ（残りは本体にある）。未保存のときだけ全部持つ
    const imgList = selectedId ? entryImages(selectedEntry).slice(0, 1) : pendingImages.slice();
    sheets[id] = {
      name: '（自動保存）' + (data.name || '下書き'),
      pl: data.pl || '',
      savedAt: new Date().toISOString(),
      image: imgList[0] || null,
      images: selectedId ? [] : imgList,
      draftOf: selectedId || '',
      draftOfName: selectedEntry ? (selectedEntry.name || '') : '',
      data: data
    };

    if (!setSavedSheets(sheets, true)) {
      // 保存領域がいっぱい。画面は静かに、でも上のバーで分かるようにする（isDirty は残し、次の機会に再試行する）
      if (silent) { draftFailed = true; savePendingShown = null; } // 静かな控えが失敗したら、保存ボタンをすぐ光らせ、上の表示で知らせる
      else updateAutosaveStatusText('⚠ 自動保存できません（保存領域がいっぱいです）');
      return;
    }
    if (silent) { draftFailed = false; }
    if (!silent) { isDirty = false; updateAutosaveStatusText('自動保存（下書き） ' + formatTimeHM(new Date())); } // 静かな控えのときは、「未保存」のまま(保存ボタンを押すまで)
    renderSaveCards(select ? select.value : '');
  } catch (e) {
    // 自動保存の失敗はアラートを出さず静かに諦める（次のタイミングで再試行される）
  }
}

// ==========================================================
// 保存済みキャラクターのカード表示
// ==========================================================
// 画像として表示してよい文字列か確かめる（data:image/…;base64,… の形だけ通す。他人のデータに混ぜられた攻撃用の文字列を表示しないため）
function safeImageSrc(src) {
  const t = typeof src === 'string' ? src : '';
  return /^data:image\/(png|jpe?g|webp|gif|bmp|avif);base64,[A-Za-z0-9+\/=\s]+$/.test(t) ? t : '';
}

function escapeHtml(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function updateSelectedActionsVisibility(selectedId) {
  const el = document.getElementById('selected-actions');
  if (el) el.style.display = selectedId ? '' : 'none';
}

// 「出力・共有オプション」の折りたたみ表示を切り替える
function toggleExportShareSection() {
  const section = document.getElementById('export-share-section');
  const toggleBtn = document.getElementById('export-share-toggle');
  if (!section || !toggleBtn) return;
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? '' : 'none';
  toggleBtn.textContent = isHidden ? '▲ 出力・共有オプションを隠す' : '▼ 出力・共有オプションを表示';
}

// 選択中キャラクターの画像を、表示モード時にページ最上部へ表示する（複数枚あるときは、下の小さな一覧で切り替える）
function updateViewModeImage(selectedId) {
  const container = document.getElementById('view-mode-image-container');
  if (!container) return;

  const list = selectedId ? entryImages(getSavedSheets()[selectedId]) : pendingImages.slice();

  if (list.length) {
    const thumbs = list.length > 1
      ? `<div class="vm-thumbs">${list.map((s, i) => `<img src="${safeImageSrc(s)}" alt="" class="${i === 0 ? 'on' : ''}" onclick="setViewMainImage(${i})">`).join('')}</div>`
      : '';
    container.innerHTML = `<img src="${safeImageSrc(list[0])}" alt="" id="vm-main-img">${thumbs}`;
    container.style.display = '';
  } else {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

// 表示モードで、下の小さな画像を押したとき、上の大きな画像を切り替える
function setViewMainImage(i) {
  const thumbs = document.querySelectorAll('#view-mode-image-container .vm-thumbs img');
  const main = document.getElementById('vm-main-img');
  if (!main || !thumbs[i]) return;
  main.src = thumbs[i].src;
  thumbs.forEach((t, k) => t.classList.toggle('on', k === i));
}

function renderSaveCards(selectedId = '') {
  const container = document.getElementById('save-cards');
  if (!container) return;
  try { renderStorageInfo(); } catch (e) {}
  try { updateEditingName(); } catch (e) {}

  updateSelectedActionsVisibility(selectedId);
  updateViewModeImage((workingId && getSavedSheets()[workingId]) ? workingId : '');
  renderImagePanel();

  const sheets = getSavedSheets();
  const allIds = Object.keys(sheets);

  // 並べ替え・絞り込み（自動保存の下書きは、いつも先頭に出す）
  const tools = document.getElementById('card-tools');
  const sortEl = document.getElementById('card-sort');
  const filterEl = document.getElementById('card-filter');
  if (tools) tools.style.display = allIds.filter(i => i !== 'autosave_draft').length >= 2 ? 'flex' : 'none';
  const mode = (sortEl && sortEl.value) || 'saved-desc';
  const q = ((filterEl && filterEl.value) || '').trim().toLowerCase();
  const textOf = id => {
    const s = sheets[id] || {}; const d = s.data || {};
    return [s.name, s.pl, d.name, d.pl, d.pos, d.mc, d.sc].filter(Boolean).join(' ').toLowerCase();
  };
  const cmpStr = (a, b) => String(a || '').localeCompare(String(b || ''), 'ja');
  let ids = allIds.filter(id => id === 'autosave_draft' || !q || textOf(id).includes(q));
  ids.sort((a, b) => {
    if (a === 'autosave_draft') return -1;
    if (b === 'autosave_draft') return 1;
    const sa = sheets[a], sb = sheets[b];
    if (!!sa.pinned !== !!sb.pinned) return sa.pinned ? -1 : 1; // ピン留めしたキャラは、並べ替えに関係なく先頭に出す
    if (mode === 'saved-asc') return (sa.savedAt || '').localeCompare(sb.savedAt || '');
    if (mode === 'name-asc') return cmpStr(sa.name, sb.name);
    if (mode === 'pl-asc') {
      // PL名が空のキャラは、いちばん後ろに回す
      if (!sa.pl !== !sb.pl) return sa.pl ? -1 : 1;
      return cmpStr(sa.pl, sb.pl) || cmpStr(sa.name, sb.name);
    }
    return (sb.savedAt || '').localeCompare(sa.savedAt || '');
  });

  if (allIds.length === 0) {
    container.innerHTML = '<div style="color:#888;font-size:0.78rem;padding:8px;">保存済みキャラクターはまだありません</div>';
    return;
  }
  if (ids.length === 0) {
    container.innerHTML = '<div style="color:#888;font-size:0.78rem;padding:8px;">「' + escapeHtml(q) + '」に合うキャラクターはありません（絞り込みを消すと全員が出ます）</div>';
    return;
  }

  container.innerHTML = ids.map(id => {
    const s = sheets[id];
    const isSelected = id === selectedId;
    const thumbHtml = s.image
      ? `<img src="${safeImageSrc(s.image)}" class="save-card-thumb" alt="">`
      : `<div class="save-card-thumb save-card-thumb-placeholder">🧍</div>`;
    const dateStr = formatCardDate(s.savedAt);
    const sub = (id === 'autosave_draft' && s.draftOfName)
      ? '元: ' + s.draftOfName
      : [s.data && s.data.pos, s.data && s.data.mc, s.data && s.data.sc].filter(Boolean).join(' / ');
    return `
      <div class="save-card ${isSelected ? 'selected' : ''}" onclick="selectSaveCard(this.dataset.id)" data-id="${escapeHtml(id)}">
        ${thumbHtml}
        <div class="save-card-name">${s.pinned ? '📌' : ''}${escapeHtml(s.name || '(無名)')}</div>
        <div class="save-card-sub">${escapeHtml(sub)}</div>
        <div class="save-card-date">${escapeHtml(dateStr)}</div>
      </div>
    `;
  }).join('');
}

function selectSaveCard(id) {
  const select = document.getElementById('save-slot');
  if (select) select.value = id;
  renderSaveCards(id);
}

// ==========================================================
// キャラクター切替オーバーレイ（画面上部のボタンからいつでも呼び出せる）
// ==========================================================
function openCharSwitcher() {
  renderCharSwitcherCards();
  const overlay = document.getElementById('char-switch-overlay');
  if (overlay) overlay.style.display = 'block';
}

function closeCharSwitcher() {
  const overlay = document.getElementById('char-switch-overlay');
  if (overlay) overlay.style.display = 'none';
}

// README（使い方）画面の開閉
function openHelp() {
  const overlay = document.getElementById('help-overlay');
  if (overlay) {
    overlay.style.display = 'block';
    overlay.scrollTop = 0;
  }
}

function closeHelp() {
  const overlay = document.getElementById('help-overlay');
  if (overlay) overlay.style.display = 'none';
}

function renderCharSwitcherCards() {
  const container = document.getElementById('char-switch-cards');
  if (!container) return;

  const sheets = getSavedSheets();
  const select = document.getElementById('save-slot');
  const currentId = select ? select.value : '';
  const ids = Object.keys(sheets).sort((a, b) => (sheets[b].savedAt || '').localeCompare(sheets[a].savedAt || ''));

  if (ids.length === 0) {
    container.innerHTML = '<div style="color:#888;font-size:0.85rem;padding:8px;">保存済みキャラクターはまだありません</div>';
    return;
  }

  container.innerHTML = ids.map(id => {
    const s = sheets[id];
    const isCurrent = id === currentId;
    const thumbHtml = s.image
      ? `<img src="${safeImageSrc(s.image)}" class="save-card-thumb" alt="">`
      : `<div class="save-card-thumb save-card-thumb-placeholder">🧍</div>`;
    const sub = (id === 'autosave_draft' && s.draftOfName)
      ? '元: ' + s.draftOfName
      : [s.data && s.data.pos, s.data && s.data.mc, s.data && s.data.sc].filter(Boolean).join(' / ');
    return `
      <div class="save-card ${isCurrent ? 'selected' : ''}" data-id="${escapeHtml(id)}" onclick="quickSwitchToCharacter(this.dataset.id)">
        ${thumbHtml}
        <div class="save-card-name">${escapeHtml(s.name || '(無名)')}</div>
        <div class="save-card-sub">${escapeHtml(sub)}</div>
      </div>
    `;
  }).join('');
}

// カードをタップした瞬間に、選択だけでなく読み込みまで一気に行う（下までスクロールせずに切替できるようにする）
function quickSwitchToCharacter(id) {
  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return;

  const select = document.getElementById('save-slot');
  if (select) select.value = id;

  pushUndoSnapshot(); // 切り替え前の編集内容を退避
  applyData(entry.data);
  isDirty = false;
  adoptLoadedEntry(id, entry);

  closeCharSwitcher();
  alert(`「${entry.name}」に切り替えました`);
}

// ==========================================================
// 保存名の変更（一覧に出る名前だけを変える。シートの中のドール名は変わらない）
// ==========================================================
function renameSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('名前を変えるキャラクターをカードから選択してください');
  if (id === 'autosave_draft') return alert('自動保存の下書きは、名前を変えられません。「ブラウザに保存」でキャラクターとして保存してから変えてください');
  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return alert('データが見つかりませんでした。一覧を開き直してください');
  const cur = entry.name || '(無名)';
  const hint = (entry.data && entry.data.name && entry.data.name !== cur) ? `\n（シートのドール名は「${entry.data.name}」です）` : '';
  const input = prompt('新しい保存名を入力してください（一覧に出る名前です）' + hint, cur);
  if (input === null) return;
  const nn = input.trim().slice(0, 60);
  if (!nn) return alert('名前が空です。変更しませんでした');
  if (nn === cur) return;
  entry.name = nn;
  if (!setSavedSheets(sheets)) return; // 失敗したときは、setSavedSheets が理由を知らせる
  // 下書きがこのキャラの下書きなら、「元: ○○」の表示も合わせる
  try {
    const sh2 = getSavedSheets();
    if (sh2['autosave_draft'] && sh2['autosave_draft'].draftOf === id) { sh2['autosave_draft'].draftOfName = nn; setSavedSheets(sh2, true); }
  } catch (e) {}
  refreshSaveSlotOptions(id);
  showToast('✔ 保存名を変更しました');
}

// ==========================================================
// キャラクターの複製
// ==========================================================
function duplicateSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('複製するキャラクターをカードから選択してください');

  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return alert('データが見つかりませんでした');

  const defaultName = (entry.name || '(無名)') + 'のコピー';
  const newName = prompt('複製後の名前を入力してください', defaultName);
  if (newName === null) return;

  const newId = 'char_' + Date.now();
  sheets[newId] = {
    name: newName || defaultName,
    pl: entry.pl || '',
    savedAt: new Date().toISOString(),
    image: entry.image || null,
    images: entryImages(entry),
    data: JSON.parse(JSON.stringify(entry.data))
  };

  if (!setSavedSheets(sheets)) return;
  refreshSaveSlotOptions(newId);
  alert(`「${newName || defaultName}」として複製しました`);
}

// ==========================================================
// キャラクター画像（複数枚）。先頭の1枚が「メイン画像」で、保存済みカードのサムネイルや表示モードの最初の画像になる。
// 保存済みのキャラには entry.images（配列）で持つ。entry.image は先頭の1枚のコピー（古い形式との互換）。
// まだ保存していないキャラの画像は、保存するまで pendingImages に持つ。
// ==========================================================
const IMG_MAX_COUNT = 6;
let pendingImages = [];
let imageReplaceIndex = -1;

function entryImages(e) {
  if (!e) return [];
  if (Array.isArray(e.images) && e.images.length) return e.images.filter(Boolean);
  return e.image ? [e.image] : [];
}

// 画像の設定は、一覧で選択しているカードではなく、いま編集しているキャラ(workingId)に対して行う
function currentImageList() {
  const id = (workingId && getSavedSheets()[workingId]) ? workingId : '';
  if (id) return entryImages(getSavedSheets()[id]);
  return pendingImages.slice();
}

// 画像の並びを保存する（保存済みキャラなら本体へ、未保存なら保留分へ）。うまくいったら true
function writeImageList(list) {
  const sel = document.getElementById('save-slot');
  const id = (workingId && getSavedSheets()[workingId]) ? workingId : '';
  if (id) {
    const sheets = getSavedSheets();
    if (!sheets[id]) return false;
    sheets[id].images = list.slice();
    sheets[id].image = list[0] || null;
    if (!setSavedSheets(sheets)) return false;
  } else {
    pendingImages = list.slice();
    try { performAutosave(); } catch (e) {}
  }
  renderSaveCards(sel ? sel.value : '');
  return true;
}

function resizeImageToDataURL(file, maxDim = 360, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) { height = Math.round(height * maxDim / width); width = maxDim; }
        } else {
          if (height > maxDim) { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        // 透明な部分がある画像は、透明を保てる形式(WebP、無ければPNG)で保存する（JPEGだと黒くなるため）
        let hasAlpha = false;
        try {
          const px = ctx.getImageData(0, 0, width, height).data;
          for (let k = 3; k < px.length; k += 4) { if (px[k] < 250) { hasAlpha = true; break; } }
        } catch (e) {}
        if (hasAlpha) {
          const w = canvas.toDataURL('image/webp', quality);
          resolve(w.startsWith('data:image/webp') ? w : canvas.toDataURL('image/png'));
        } else {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

// 基本情報の上の「キャラクター画像」欄を描く
function renderImagePanel() {
  const box = document.getElementById('img-panel-list');
  if (!box) return;
  const list = currentImageList();
  const cnt = document.getElementById('img-panel-count');
  if (cnt) cnt.textContent = `（${list.length}/${IMG_MAX_COUNT}枚）`;
  const saved = !!(workingId && getSavedSheets()[workingId]);
  const thumbs = list.map((src, i) => `<button type="button" class="img-thumb${i === 0 ? ' main' : ''}" onclick="openImageActions(${i})"><img src="${safeImageSrc(src)}" alt=""><span class="img-badge">${i === 0 ? 'メイン' : (i + 1)}</span></button>`).join('');
  const addBtn = list.length < IMG_MAX_COUNT
    ? `<button type="button" class="img-thumb img-add" onclick="document.getElementById('img-add-input').click()"><span class="img-add-plus">＋</span><span class="img-add-text">画像を追加</span></button>`
    : '';
  box.innerHTML = thumbs + addBtn;
  const note = document.getElementById('img-panel-note');
  if (note) note.textContent = list.length
    ? '画像をタップすると、メインにする・差し替え・削除ができます。先頭の「メイン」が、キャラの一覧と表示モードの最初の画像になります。' + (saved ? '' : '（まだ保存していません。保存すると、画像もいっしょに保存されます）')
    : '画像はまだありません。「＋画像を追加」から、写真やイラストを選んでください(まとめて複数枚も選べます)。' + (saved ? '' : '（まだ保存していません。保存すると、画像もいっしょに保存されます）');
}

// 画像を追加（複数枚をまとめて選べる）
function onImagesAdded(event) {
  const files = Array.from((event.target.files) || []);
  event.target.value = '';
  if (!files.length) return;
  const list = currentImageList();
  const room = IMG_MAX_COUNT - list.length;
  if (room <= 0) { alert(`画像は${IMG_MAX_COUNT}枚までです。不要な画像を削除してから追加してください`); return; }
  const use = files.slice(0, room);
  Promise.all(use.map(f => resizeImageToDataURL(f))).then(urls => {
    if (!writeImageList(list.concat(urls))) return;
    if (files.length > room) alert(`画像は${IMG_MAX_COUNT}枚までなので、${use.length}枚だけ追加しました`);
  }).catch(err => {
    alert('画像の追加に失敗しました: ' + (err && err.message ? err.message : err));
  });
}

// 画像の差し替え（openImageActions から呼ぶ）
function onImageReplaced(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  const i = imageReplaceIndex;
  imageReplaceIndex = -1;
  if (!file || i < 0) return;
  const list = currentImageList();
  if (i >= list.length) return;
  resizeImageToDataURL(file).then(url => {
    list[i] = url;
    writeImageList(list);
  }).catch(err => {
    alert('画像の差し替えに失敗しました: ' + (err && err.message ? err.message : err));
  });
}

// 画像をタップしたときの操作（メインにする・差し替え・削除）
function openImageActions(i) {
  const list = currentImageList();
  if (i < 0 || i >= list.length) return;
  const ov = document.createElement('div');
  ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;color:#222;max-width:360px;width:100%;border-radius:10px;padding:14px;font-size:.88rem;';
  const btn = 'display:block;width:100%;margin:0 0 8px;padding:10px;border:1px solid #888;border-radius:8px;background:#f4f4f4;color:#222;font-size:.9rem;';
  box.innerHTML = `<img src="${safeImageSrc(list[i])}" alt="" style="display:block;max-width:100%;max-height:220px;margin:0 auto 10px;border-radius:6px;">
    ${i > 0 ? `<button type="button" data-k="main" style="${btn}">メイン画像にする</button>` : '<div style="text-align:center;margin-bottom:8px;color:#666;">いまのメイン画像です</div>'}
    <button type="button" data-k="replace" style="${btn}">別の画像に差し替える</button>
    <button type="button" data-k="delete" style="${btn}color:#b00;">この画像を削除する</button>
    <button type="button" data-k="" style="${btn}background:#fff;color:#444;margin-bottom:0;">閉じる</button>`;
  ov.appendChild(box);
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  box.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    const k = b.dataset.k;
    close();
    const cur = currentImageList();
    if (k === 'main') {
      const [it] = cur.splice(i, 1);
      cur.unshift(it);
      writeImageList(cur);
    } else if (k === 'replace') {
      imageReplaceIndex = i;
      document.getElementById('img-replace-input').click();
    } else if (k === 'delete') {
      if (!confirm('この画像を削除します。よろしいですか？')) return;
      cur.splice(i, 1);
      writeImageList(cur);
    }
  });
}

// 「保存した状態に戻す」：いま編集している内容を捨てて、最後に「💾 保存」した内容に戻す(「↩️ 元に戻す」で、捨てる前に戻せる)
function revertToSaved() {
  try {
    const sheets = getSavedSheets();
    const entry = workingId ? sheets[workingId] : null;
    if (!entry || !entry.data) return alert('このキャラクターは、まだ一度も保存していないので、戻す先がありません。');
    if (!isDirty) return alert('変更はありません。最後に保存した状態のままです。');
    if (!confirm(`「${entry.name || '(無名)'}」を、最後に保存した状態に戻します。\n今の未保存の変更は捨てられます(「↩️ 元に戻す」で取り消せます)。よろしいですか？`)) return;
    pushUndoSnapshot();
    applyData(entry.data);
    isDirty = false;
    adoptLoadedEntry(workingId, entry);
    try { const sh = getSavedSheets(); if (sh['autosave_draft']) { delete sh['autosave_draft']; setSavedSheets(sh, true); renderSaveCards(workingId); } } catch (e) {}
    alert('最後に保存した状態に戻しました');
  } catch (e) {
    alert('戻せませんでした。もう一度お試しください。');
  }
}

// 「選択中のキャラ」を覚えておく対象か（下書きは対象外）
function selectedIdForMemo(id) { return typeof id === 'string' && id !== 'autosave_draft'; }

// ページを開き直したとき（更新ボタン・再読み込み）、直前まで編集していた内容に戻す。
//  ・下書き（自動保存）が、元のキャラの保存内容より新しければ、下書きを復元する
//  ・そうでなければ、最後に選んでいたキャラを読み込む
function restoreWorkOnLoad() {
  try {
    const sheets = getSavedSheets();
    const draft = sheets['autosave_draft'];
    let lastId = '';
    try { lastId = localStorage.getItem('necro_last_slot') || ''; } catch (e) {}
    const hasDraftId = draft && draft.draftOf && sheets[draft.draftOf];
    if (draft && draft.data && (!draft.draftOf || !hasDraftId || (sheets[draft.draftOf].savedAt || '') <= (draft.savedAt || ''))) {
      applyData(draft.data);
      if (!hasDraftId) pendingImages = entryImages(draft);
      workingId = hasDraftId ? draft.draftOf : '';
      refreshSaveSlotOptions(workingId);
      updateAutosaveStatusText('下書きを復元しました');
      return;
    }
    if (lastId && sheets[lastId] && sheets[lastId].data) {
      applyData(sheets[lastId].data);
      workingId = lastId;
      refreshSaveSlotOptions(lastId);
    }
  } catch (e) {}
}

// 画像の背景色（透過画像の透明な部分に見える色）
function applyImageBg(skipHex) {
  if (!skipHex) syncColorHex('img-bg-color', 'img-bg-hex');
  const c = document.getElementById('img-bg-color');
  if (c && c.dataset.set === '1') document.body.style.setProperty('--img-bg', c.value);
  else document.body.style.removeProperty('--img-bg');
}
function resetImageBg() {
  const c = document.getElementById('img-bg-color');
  if (!c) return;
  c.value = '#222228';
  c.dispatchEvent(new Event('input', { bubbles: true }));
  c.dataset.set = '';
  applyImageBg();
}

// 色の入力欄(色見本)と、16進数の文字入力欄をそろえる。色を指定していないときは文字欄を空にする
function syncColorHex(colorId, hexId) {
  const c = document.getElementById(colorId), h = document.getElementById(hexId);
  if (!c || !h) return;
  h.value = c.dataset.set === '1' ? c.value : '';
}
// 文字入力欄に「#ff3366」「ff3366」「#f36」などを入れたとき、色見本に反映する
function onColorHexInput(colorId, text) {
  const c = document.getElementById(colorId);
  if (!c) return;
  let t = String(text || '').trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(t)) t = t.split('').map(x => x + x).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(t)) return;
  c.value = '#' + t.toLowerCase();
  c.dataset.set = '1';
  if (colorId === 'piece-color') updatePieceColorNote(true);
  else applyImageBg(true);
}

// 並べ替え・絞り込みの操作（並べ替えは覚えておく。覚えられなくても、そのまま使える）
function onCardToolsChange() {
  const sortEl = document.getElementById('card-sort');
  try { if (sortEl) localStorage.setItem('necro_card_sort', sortEl.value); } catch (e) {}
  const select = document.getElementById('save-slot');
  renderSaveCards(select ? select.value : '');
}
function initCardTools() {
  try {
    const v = localStorage.getItem('necro_card_sort');
    const sortEl = document.getElementById('card-sort');
    if (v && sortEl && Array.from(sortEl.options).some(o => o.value === v)) sortEl.value = v;
  } catch (e) {}
}

// カードに添える保存日時（同じ名前のキャラを見分けるため）。今年なら「月/日 時:分」、去年以前なら年も付ける
function formatCardDate(iso) {
  try {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const hm = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    const md = (d.getMonth() + 1) + '/' + d.getDate();
    return (d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() + '/' : '') + md + ' ' + hm;
  } catch (e) { return ''; }
}

// ピン留め：選んでいるキャラを、一覧の先頭に固定する／外す
function togglePinSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('ピン留めするキャラクターをカードから選択してください');
  if (id === 'autosave_draft') return alert('自動保存の下書きは、ピン留めできません');
  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return alert('データが見つかりませんでした。一覧を開き直してください');
  if (entry.pinned) delete entry.pinned; else entry.pinned = true;
  if (!setSavedSheets(sheets)) return;
  renderSaveCards(id);
  showToast(entry.pinned ? '📌 ピン留めしました' : 'ピン留めを外しました');
}

function clearBattleMemo() {
  const el = document.getElementById('battle-memo');
  if (!el || el.readOnly || !el.value) return;
  if (!confirm('戦闘メモを消します。よろしいですか？（「↩️ 元に戻す」で戻せます）')) return;
  pushUndoSnapshot();
  el.value = '';
  autoResizeTextarea(el);
  markDirty();
}
