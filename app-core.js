// ==========================================================
// 元に戻す（Undo）・未保存の変更検知・自動保存
// ==========================================================
let undoStack = [];
const UNDO_LIMIT = 15;
let isDirty = false;
let autosaveTimer = null;
const AUTOSAVE_INTERVAL_MS = 20000; // 20秒ごとに未保存の変更があれば自動保存

function pushUndoSnapshot() {
  try {
    undoStack.push(JSON.stringify(getFullData()));
    if (undoStack.length > UNDO_LIMIT) undoStack.shift();
    updateUndoButtonState();
  } catch (e) {
    // 取得に失敗しても致命的ではないので握りつぶす
  }
}

function updateUndoButtonState() {
  const btn = document.getElementById('undo-btn');
  if (btn) btn.disabled = undoStack.length === 0;
}

function undoLastAction() {
  if (undoStack.length === 0) {
    alert('これ以上元に戻せません');
    return;
  }
  const prevJson = undoStack.pop();
  updateUndoButtonState();
  try {
    const data = JSON.parse(prevJson);
    applyData(data);
    markDirty();
  } catch (e) {
    alert('元に戻す処理に失敗しました');
  }
}

// パーツ／スキル／未練／履歴などの行削除ボタン共通処理（削除前にUndo用スナップショットを保存する）
function removeRowWithUndo(button, afterFn) {
  pushUndoSnapshot();
  const el = button.closest('tr, .treasure-entry, .memory-entry');
  if (el) el.remove();
  markDirty();
  if (typeof afterFn === 'function') afterFn();
}

function markDirty() {
  isDirty = true;
}

function setupDirtyTracking() {
  const ignoreIds = new Set(['save-slot', 'json-file-input', 'thumb-file-input']);
  document.addEventListener('input', (e) => {
    if (e.target && ignoreIds.has(e.target.id)) return;
    isDirty = true;
  });
  document.addEventListener('change', (e) => {
    if (e.target && ignoreIds.has(e.target.id)) return;
    isDirty = true;
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

function startAutosaveTimer() {
  if (autosaveTimer) clearInterval(autosaveTimer);
  autosaveTimer = setInterval(() => {
    if (!isDirty) return;
    performAutosave();
  }, AUTOSAVE_INTERVAL_MS);
}

// 未保存の変更を静かに自動保存する（選択中のキャラがあればそこへ上書き、無ければ専用の下書き枠へ）
function performAutosave() {
  try {
    const data = getFullData();
    const select = document.getElementById('save-slot');
    const sheets = getSavedSheets();
    let id = select ? select.value : '';

    if (id && sheets[id]) {
      sheets[id] = { ...sheets[id], pl: data.pl || '', savedAt: new Date().toISOString(), data };
    } else {
      id = 'autosave_draft';
      const existingImage = sheets[id] ? sheets[id].image : null;
      sheets[id] = {
        name: '（自動保存）' + (data.name || '下書き'),
        pl: data.pl || '',
        savedAt: new Date().toISOString(),
        image: existingImage,
        data: data
      };
    }

    setSavedSheets(sheets);
    isDirty = false;
    updateAutosaveStatusText('自動保存 ' + formatTimeHM(new Date()));
    renderSaveCards(select ? select.value : '');
  } catch (e) {
    // 自動保存の失敗はアラートを出さず静かに諦める（次のタイミングで再試行される）
  }
}

// ==========================================================
// 保存済みキャラクターのカード表示
// ==========================================================
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

// 選択中キャラクターの画像を、表示モード時にページ最上部へ表示する
function updateViewModeImage(selectedId) {
  const container = document.getElementById('view-mode-image-container');
  if (!container) return;

  const sheets = getSavedSheets();
  const entry = selectedId ? sheets[selectedId] : null;

  if (entry && entry.image) {
    container.innerHTML = `<img src="${entry.image}" alt="">`;
    container.style.display = '';
  } else {
    container.innerHTML = '';
    container.style.display = 'none';
  }
}

function renderSaveCards(selectedId = '') {
  const container = document.getElementById('save-cards');
  if (!container) return;

  updateSelectedActionsVisibility(selectedId);
  updateViewModeImage(selectedId);

  const sheets = getSavedSheets();
  const ids = Object.keys(sheets).sort((a, b) => (sheets[b].savedAt || '').localeCompare(sheets[a].savedAt || ''));

  if (ids.length === 0) {
    container.innerHTML = '<div style="color:#888;font-size:0.78rem;padding:8px;">保存済みキャラクターはまだありません</div>';
    return;
  }

  container.innerHTML = ids.map(id => {
    const s = sheets[id];
    const isSelected = id === selectedId;
    const thumbHtml = s.image
      ? `<img src="${s.image}" class="save-card-thumb" alt="">`
      : `<div class="save-card-thumb save-card-thumb-placeholder">🧍</div>`;
    const sub = [s.data && s.data.pos, s.data && s.data.mc, s.data && s.data.sc].filter(Boolean).join(' / ');
    return `
      <div class="save-card ${isSelected ? 'selected' : ''}" onclick="selectSaveCard('${id}')" data-id="${id}">
        ${thumbHtml}
        <div class="save-card-name">${escapeHtml(s.name || '(無名)')}</div>
        <div class="save-card-sub">${escapeHtml(sub)}</div>
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
      ? `<img src="${s.image}" class="save-card-thumb" alt="">`
      : `<div class="save-card-thumb save-card-thumb-placeholder">🧍</div>`;
    const sub = [s.data && s.data.pos, s.data && s.data.mc, s.data && s.data.sc].filter(Boolean).join(' / ');
    return `
      <div class="save-card ${isCurrent ? 'selected' : ''}" onclick="quickSwitchToCharacter('${id}')">
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

  closeCharSwitcher();
  renderSaveCards(id);
  alert(`「${entry.name}」に切り替えました`);
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
    data: JSON.parse(JSON.stringify(entry.data))
  };

  setSavedSheets(sheets);
  refreshSaveSlotOptions(newId);
  alert(`「${newName || defaultName}」として複製しました`);
}

// ==========================================================
// サムネイル画像の設定
// ==========================================================
function resizeImageToDataURL(file, maxDim = 160, quality = 0.75) {
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
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

function onThumbFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = '';
  if (!file) return;

  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) {
    alert('先に「保存済みキャラクター」のカードを選択してください（未保存の場合は先にブラウザに保存してください）');
    return;
  }

  resizeImageToDataURL(file).then(dataUrl => {
    const sheets = getSavedSheets();
    if (!sheets[id]) return;
    sheets[id].image = dataUrl;
    setSavedSheets(sheets);
    renderSaveCards(id);
    alert('サムネイル画像を設定しました');
  }).catch(err => {
    alert('画像の設定に失敗しました: ' + (err && err.message ? err.message : err));
  });
}

// 選択中のキャラクターのサムネイル画像を削除し、ノーイメージ（プレースホルダー）に戻す
function clearSelectedThumbnail() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) {
    alert('先に「保存済みキャラクター」のカードを選択してください');
    return;
  }

  const sheets = getSavedSheets();
  if (!sheets[id]) return;

  if (!sheets[id].image) {
    alert('このキャラクターには画像が設定されていません');
    return;
  }

  if (!confirm('サムネイル画像を削除して、ノーイメージに戻します。よろしいですか？')) return;

  sheets[id].image = null;
  setSavedSheets(sheets);
  renderSaveCards(id);
  alert('画像を削除しました');
}

