function getFullData() {
  const getVal = id => document.getElementById(id)?.value || '';

  const data = {
    pl: getVal('pl'),
    name: getVal('name'),
    pos: getVal('pos'),
    mc: getVal('mc'),
    sc: getVal('sc'),
    age: getVal('age'),
    chatPalette: getVal('chat-palette-custom'),
    ccfoliaMemo: getVal('ccf-memo-custom'),
    ccfoliaExtra: (() => { try { const o = JSON.parse(getVal('ccf-extra-custom') || 'null'); return (o && typeof o === 'object') ? o : undefined; } catch (e) { return undefined; } })(),
    ccfoliaStatus: (() => { try { const a = JSON.parse(getVal('ccf-status-custom') || 'null'); return Array.isArray(a) ? a : undefined; } catch (e) { return undefined; } })(),
    imageBg: (document.getElementById('img-bg-color')?.dataset.set === '1') ? getVal('img-bg-color') : '',
    pieceColor: (document.getElementById('piece-color')?.dataset.set === '1') ? getVal('piece-color') : '',
    height: getVal('height'),
    weight: getVal('weight'),
    hair: getVal('hair'),
    eye: getVal('eye'),
    skin: getVal('skin'),
    freeMemo: getVal('free-memo'),
    battleMemo: getVal('battle-memo'),
    ps: getVal('ps'),
    hint: getVal('hint'),
    act: getVal('act'),
    actBase: getVal('act-base'),
    fav: getVal('fav'),
    chouaiWep: getVal('chouai-wep'),
    chouaiMut: getVal('chouai-mut'),
    chouaiCyb: getVal('chouai-cyb'),
    bonus: document.querySelector('input[name="bonus"][value]:checked')?.value || 'wep',
    skills: [],
    parts: [],
    treasures: [],
    memories: [],
    list: [],
    history: [],
    chouaiUses: []
  };

  // スキル（1つにつき「本体行(skill-row)」＋「効果メモ行(skill-memo-row)」の2段構成）
  document.querySelectorAll('#skill-tbody tr.skill-row').forEach(tr => {
    const memoTr = tr.nextElementSibling;
    const memo = (memoTr && memoTr.classList.contains('skill-memo-row')) ? (memoTr.querySelector('.skill-memo')?.value || '') : '';
    data.skills.push({
      category: tr.querySelector('.skill-category')?.value || '',
      slot: tr.dataset.slot || '',
      name: tr.querySelector('.skill-name-select')?.value || '',
      timing: tr.querySelector('.skill-timing')?.value || '',
      cost: tr.querySelector('.skill-cost')?.value || '',
      range: tr.querySelector('.skill-range')?.value || '',
      memo: memo,
      tag: tr.querySelector('.skill-tag')?.value || '',
      isUsed: tr.querySelector('.skill-used')?.checked || false,
      isChouai: tr.classList.contains('chouai-acq')
    });
  });

  // パーツ（1つにつき「本体行(part-row)」＋「効果メモ行(part-memo-row)」の2段構成）
  document.querySelectorAll('#parts-container tr.part-row').forEach(tr => {
    const name = tr.querySelector('.p-name')?.value;
    if (name) {
      const memoTr = tr.nextElementSibling;
      const memo = (memoTr && memoTr.classList.contains('part-memo-row')) ? (memoTr.querySelector('.p-memo')?.value || '') : '';
      data.parts.push({
        isBroken: tr.querySelector('.p-broken')?.checked || false,
        isUsed: tr.querySelector('.p-used')?.checked || false,
        location: tr.querySelector('.p-location')?.value || '',
        name: name,
        type: tr.querySelector('.p-type') ? tr.querySelector('.p-type').value : '基本',
        level: (tr.querySelector('.p-type')?.value === 'たからもの') ? '' : (tr.querySelector('.p-level')?.value || '1'),
        timing: tr.querySelector('.p-timing')?.value || '',
        cost: tr.querySelector('.p-cost')?.value || '',
        range: tr.querySelector('.p-range')?.value || '',
        memo: memo,
        isEditable: !tr.querySelector('.p-name')?.hasAttribute('readonly'),
        tag: tr.querySelector('.p-tag')?.value || '',
        isChouai: tr.classList.contains('chouai-acq'),
        isOther: tr.classList.contains('other-acq')
      });
    }
  });

  // たからもの（複数）
  document.querySelectorAll('#treasure-list .treasure-entry').forEach(entry => {
    data.treasures.push({
      name: entry.querySelector('.treasure-name')?.value || '',
      content: entry.querySelector('.treasure-content')?.value || '',
      location: entry.querySelector('.treasure-location')?.value || '頭部'
    });
  });

  // 記憶のカケラ（複数）
  document.querySelectorAll('#memory-list .memory-entry').forEach(row => {
    data.memories.push({
      num: row.querySelector('.memory-num')?.value || '',
      name: row.querySelector('.memory-name')?.value || '',
      detail: row.querySelector('.memory-detail')?.value || ''
    });
  });

  // 未練
  document.querySelectorAll('#list tr.miren-row').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    if (inputs.length >= 3) {
      const mad = tr.nextElementSibling && tr.nextElementSibling.classList.contains('miren-mad-row') ? tr.nextElementSibling : null;
      data.list.push({
        target: inputs[0].value,
        emotion: inputs[1].value,
        madness: inputs[2].value,
        madName: mad ? (mad.querySelector('.miren-madname')?.value || '') : '',
        madEffect: mad ? (mad.querySelector('.miren-madeffect')?.value || '') : ''
      });
    }
  });

  // セッション履歴（獲得）
  document.querySelectorAll('#session-history-tbody tr.h-main').forEach(tr => {
    const mrow = tr.nextElementSibling && tr.nextElementSibling.classList.contains('history-memo-row') ? tr.nextElementSibling : null;
    data.history.push({
      scenario: tr.querySelector('.h-scenario')?.value || '',
      battle: tr.querySelector('.battle-pts')?.value || 0,
      personal: tr.querySelector('.personal-pts')?.value || 0,
      memo: (mrow ? mrow.querySelector('.h-memo')?.value : '') || ''
    });
  });

  // 寵愛点の使い道（消費）
  document.querySelectorAll('#chouai-use-tbody tr').forEach(tr => {
    data.chouaiUses.push({
      used: tr.querySelector('.used-pts')?.value || 0,
      memo: tr.querySelector('.use-memo')?.value || ''
    });
  });

  return data;
}

// --- 複数キャラクター保存管理 ---
const SHEETS_KEY = 'necro_sheets';

function getSavedSheets() {
  let raw = null;
  try {
    raw = localStorage.getItem(SHEETS_KEY);
    if (!raw) return {};
    const o = JSON.parse(raw);
    return (o && typeof o === 'object' && !Array.isArray(o)) ? o : {};
  } catch (e) {
    stashCorruptSheets(raw);
    return {};
  }
}

// 保存データが壊れて読めなかったとき、壊れた中身を別のキーに退避する（このあとの保存で、壊れたデータが上書きされて失われないように）
let corruptNoticeShown = false;
function stashCorruptSheets(raw) {
  if (!raw) return;
  // すでに退避した中身と同じなら、知らせ直さない（保存するまで壊れたデータが残るため、開くたびに出てしまう）。違う中身が壊れたときは2つ目の退避先に残す
  let known = false;
  try {
    const prev = localStorage.getItem('necro_sheets_corrupt');
    const prev2 = localStorage.getItem('necro_sheets_corrupt_2');
    if (!prev) localStorage.setItem('necro_sheets_corrupt', raw);
    else if (prev === raw || prev2 === raw) known = true;
    else localStorage.setItem('necro_sheets_corrupt_2', raw);
  } catch (e) {}
  if (!corruptNoticeShown && !known) {
    corruptNoticeShown = true;
    setTimeout(() => alert('保存済みキャラクターのデータが壊れていて、読み込めませんでした。\n壊れた中身は、このブラウザの別の場所に退避してあります（消さないでください）。\nお手数ですが、作者に連絡してください。'), 0);
  }
}

// 以前の誤字「よぷんなめ」を「よぶんなめ」に直す（保存済みのキャラ・ゴミ箱・効果の記憶）。起動時に1回だけ行う
const TYPO_FIXES = [['よぷんなめ', 'よぶんなめ']];
function fixKnownTyposInString(str) {
  let t = str;
  TYPO_FIXES.forEach(([from, to]) => { if (t.includes(from)) t = t.split(from).join(to); });
  return t;
}
function migrateKnownTypos() {
  ['necro_sheets', 'necro_trash', 'necro_effect_dict'].forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const fixed = fixKnownTyposInString(raw);
      if (fixed !== raw) { JSON.parse(fixed); localStorage.setItem(key, fixed); }
    } catch (e) {}
  });
}

// ブラウザの保存領域はおよそ5MBで、いっぱいになると書き込みに失敗する。
// 成功したら true、失敗したら false を返す（silent のときは、失敗しても画面に出さない）。
// 失敗したら、まず「削除したキャラのゴミ箱」を空にしてもう一度試す
const STORAGE_LIMIT_CHARS = 5000000; // 目安（ブラウザによって違う）
const STORAGE_FULL_MESSAGE = 'ブラウザの保存領域がいっぱいで、保存できませんでした。\n「全キャラをバックアップ」で書き出してから、使わないキャラクターを削除してください。（画像を設定したキャラは容量が大きくなります）';

function getStorageUsageRatio() {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      total += k.length + (localStorage.getItem(k) || '').length;
    }
    return total / STORAGE_LIMIT_CHARS;
  } catch (e) { return 0; }
}

function setSavedSheets(sheets, silent) {
  const json = JSON.stringify(sheets);
  try {
    localStorage.setItem(SHEETS_KEY, json);
    return true;
  } catch (e) {
    // 自動保存など、画面に出さない保存では、ゴミ箱(削除したキャラの復元用)には手を付けない
    if (silent) return false;
    try {
      localStorage.removeItem(TRASH_KEY);
      localStorage.setItem(SHEETS_KEY, json);
      if (!silent) alert('保存領域がいっぱいだったため、削除したキャラのゴミ箱を空にして保存しました。\n（削除したキャラの復元はできなくなりました）');
      return true;
    } catch (e2) {
      if (!silent) alert(STORAGE_FULL_MESSAGE);
      return false;
    }
  }
}

// ==========================================================
// 削除したキャラクターのゴミ箱（復元用、直近5件まで）
// バックアップファイルには含めない。localStorage の別キー 'necro_trash' を使う
// ==========================================================
const TRASH_KEY = 'necro_trash';
const TRASH_LIMIT = 5;

function getTrash() {
  try {
    const trash = JSON.parse(localStorage.getItem(TRASH_KEY) || '[]');
    return Array.isArray(trash) ? trash : [];
  } catch (e) {
    return [];
  }
}

function setTrash(trash) {
  try {
    localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
    return true;
  } catch (e) {
    return false;
  }
}

// 削除対象のエントリ全体をゴミ箱の先頭に入れる（直近5件まで残す）
function moveToTrash(id, entry) {
  const trash = getTrash();
  trash.unshift({
    name: entry.name || '(無名)',
    pl: entry.pl || '',
    savedAt: entry.savedAt || '',
    image: entry.image || null,
    images: entryImages(entry),
    data: entry.data,
    deletedAt: new Date().toISOString(),
    originalId: id,
    pinned: entry.pinned ? true : undefined // 復元したとき、ピン留めも戻す
  });
  return setTrash(trash.slice(0, TRASH_LIMIT));
}

// ゴミ箱の最新1件を、新しい id で保存済み一覧に復元する（同名があっても上書きしない）
function restoreDeletedSave() {
  const trash = getTrash();
  if (trash.length === 0) return alert('復元できる削除済みキャラクターはありません');

  const entry = trash[0];
  const sheets = getSavedSheets();
  const newId = 'char_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  sheets[newId] = {
    name: entry.name || '(無名)',
    pl: entry.pl || '',
    savedAt: entry.savedAt || new Date().toISOString(),
    image: entry.image || null,
    images: entryImages(entry),
    pinned: entry.pinned ? true : undefined,
    data: JSON.parse(JSON.stringify(entry.data || {}))
  };
  if (!setSavedSheets(sheets)) return;
  setTrash(trash.slice(1));
  refreshSaveSlotOptions(newId);
  alert(`「${entry.name || '(無名)'}」を復元しました`);
}

function refreshSaveSlotOptions(selectedId = '') {
  if (typeof updateBackupReminder === 'function') setTimeout(updateBackupReminder, 0);
  const select = document.getElementById('save-slot');
  if (!select) return;
  const sheets = getSavedSheets();
  const ids = Object.keys(sheets).sort((a, b) => (sheets[b].savedAt || '').localeCompare(sheets[a].savedAt || ''));

  let html = '<option value="">-- 新規保存 --</option>';
  ids.forEach(id => {
    const s = sheets[id];
    const label = `${s.name || '(無名)'}${s.pl ? '［' + s.pl + '］' : ''}`;
    html += `<option value="${escapeHtml(id)}" ${id === selectedId ? 'selected' : ''}>${escapeHtml(label)}</option>`;
  });
  select.innerHTML = html;
  renderSaveCards(selectedId);
}

// 旧バージョン（単一スロット保存）のデータが残っていれば、複数保存形式に自動移行する
function migrateOldSingleSave() {
  const oldJson = localStorage.getItem('necro_sheet');
  if (!oldJson) return;
  const sheets = getSavedSheets();
  if (Object.keys(sheets).length > 0) return; // 既に複数保存データがあるなら何もしない

  try {
    const oldData = JSON.parse(oldJson);
    const id = 'char_' + Date.now();
    sheets[id] = {
      name: oldData.name || '(旧データ)',
      pl: oldData.pl || '',
      savedAt: new Date().toISOString(),
      data: oldData
    };
    setSavedSheets(sheets, true);
  } catch (e) {
    // 変換に失敗した場合は何もしない
  }
}

// 上書き保存の前に出す、前回保存からの変更点の要約（比べられなかったときは、その旨だけ出す）
const DIFF_LABELS = {
  pl: 'PL名', name: 'ドール名', pos: 'ポジション', mc: 'メインクラス', sc: 'サブクラス', age: '享年', ps: '死因', hint: '未練のヒント',
  height: '身長', weight: '体重', hair: '髪', eye: '瞳', skin: '肌', freeMemo: 'メモ', battleMemo: '戦闘メモ', act: '最大行動値', actBase: '行動値の基本', fav: '寵愛',
  chouaiWep: '寵愛点(武装)', chouaiMut: '寵愛点(変異)', chouaiCyb: '寵愛点(改造)', bonus: 'ボーナス', chatPalette: 'チャパレ',
  ccfoliaMemo: '駒のメモ', ccfoliaExtra: '駒の追加設定', ccfoliaStatus: '駒のステータス', imageBg: '画像の背景色', pieceColor: '駒の色'
};
const DIFF_LIST_LABELS = { skills: 'スキル', parts: 'パーツ', treasures: '宝物', memories: '記憶のカケラ', list: '未練', history: '履歴', chouaiUses: '寵愛点の使用' };
function describeSaveDiff(oldData, newData) {
  try {
    if (!oldData || typeof oldData !== 'object') return '（前回の保存内容を読めなかったので、変更点は出せません）';
    const lines = [];
    const short = v => { const t = String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); return t ? (t.length > 14 ? t.slice(0, 14) + '…' : t) : '（空）'; };
    Object.keys(DIFF_LABELS).forEach(k => {
      const a = oldData[k], b = newData[k];
      if (JSON.stringify(a == null ? '' : a) !== JSON.stringify(b == null ? '' : b)) {
        const long = (typeof a === 'string' && a.length > 14) || (typeof b === 'string' && b.length > 14) || k === 'ccfoliaExtra' || k === 'ccfoliaStatus';
        lines.push(long ? `・${DIFF_LABELS[k]}が変わりました` : `・${DIFF_LABELS[k]}：${short(a)} → ${short(b)}`);
      }
    });
    Object.keys(DIFF_LIST_LABELS).forEach(k => {
      const A = Array.isArray(oldData[k]) ? oldData[k].map(x => JSON.stringify(x)) : [];
      const B = Array.isArray(newData[k]) ? newData[k].map(x => JSON.stringify(x)) : [];
      const count = {};
      A.forEach(x => { count[x] = (count[x] || 0) + 1; });
      let added = 0;
      B.forEach(x => { if (count[x] > 0) count[x]--; else added++; });
      const removed = Object.keys(count).reduce((s, x) => s + count[x], 0);
      if (added || removed) lines.push(`・${DIFF_LIST_LABELS[k]}：${B.length}件（前回は${A.length}件）／入れ替わり${Math.max(added, removed)}件`);
    });
    if (lines.length === 0) return '前回の保存から変わっているところはありません。';
    const shown = lines.slice(0, 14);
    return '前回の保存からの変更点：\n' + shown.join('\n') + (lines.length > shown.length ? `\n…ほか${lines.length - shown.length}項目` : '');
  } catch (e) {
    return '（変更点を比べられませんでした）';
  }
}

function saveData() {
  const data = getFullData();
  const select = document.getElementById('save-slot');
  const sheets = getSavedSheets();
  let id = select ? select.value : '';
  const wasNew = !id;

  if (!id) {
    // 新規保存
    const defaultName = data.name || 'ドール';
    const inputName = prompt('保存するキャラクター名を入力してください', defaultName);
    if (inputName === null) return; // キャンセル
    id = 'char_' + Date.now();
    sheets[id] = {
      name: inputName || defaultName,
      pl: data.pl || '',
      savedAt: new Date().toISOString(),
      image: pendingImages[0] || null,
      images: pendingImages.slice(),
      data: data
    };
  } else {
    // 上書き保存
    const existing = sheets[id];
    const existingName = existing ? existing.name : '(無名)';
    if (!confirm(`「${existingName}」に上書き保存します。\n\n${describeSaveDiff(existing && existing.data, data)}\n\nよろしいですか？`)) return;
    // 保存名がドール名そのものだったとき（自分で別の名前を付けていないとき）は、ドール名を変えたら保存名も新しいドール名にする
    const followDollName = !!(existing && existing.data && existing.data.name && existing.data.name === existing.name && data.name);
    sheets[id] = {
      name: followDollName ? data.name : existingName,
      pl: data.pl || '',
      savedAt: new Date().toISOString(),
      pinned: (existing && existing.pinned) ? true : undefined,
      image: existing ? existing.image || null : null,
      images: existing ? entryImages(existing) : [],
      data: data
    };
  }

  // 新規保存が完了したら、自動保存の下書き枠は不要になるので片付ける
  if (sheets['autosave_draft'] && (wasNew || !sheets['autosave_draft'].draftOf || sheets['autosave_draft'].draftOf === id)) {
    delete sheets['autosave_draft']; // 保存したキャラの下書きは、もう要らない
  }

  if (!setSavedSheets(sheets)) return; // 失敗したときは、保存したと表示しない（isDirty も、画像も、そのまま）
  if (wasNew) pendingImages = []; // 保存できてから、未保存の画像リストを空にする
  isDirty = false;
  setWorkingId(id);
  refreshSaveSlotOptions(id);
  const usage = getStorageUsageRatio();
  alert('ブラウザに保存しました' + (usage >= 0.8 ? `\n\n※保存領域の約${Math.round(usage * 100)}%を使っています。いっぱいになる前に、「全キャラをバックアップ」で書き出しておくのがおすすめです。` : ''));
}

function loadData() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('読み込むキャラクターをカードから選択してください');

  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return alert('データが見つかりませんでした');

  pushUndoSnapshot(); // 今の編集内容が失われないよう、読み込み前の状態を退避
  applyData(entry.data);
  isDirty = false;
  adoptLoadedEntry(id, entry);
  alert(`「${entry.name}」を読み込みました`);
}

function deleteSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('削除するキャラクターをカードから選択してください');

  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return;

  if (!confirm(`「${entry.name}」を削除します。よろしいですか？\n\n削除したキャラクターは「削除したキャラを復元」ボタンから復元できます（直近5件まで）。`)) return;

  if (id === 'autosave_draft') {
    // 自動保存の下書きはゴミ箱に入れず、そのまま削除する（下書きは「保存」ボタンで確定したものではないため）
    delete sheets[id];
    setSavedSheets(sheets);
    refreshSaveSlotOptions('');
    alert('下書きを削除しました');
    return;
  }

  if (!moveToTrash(id, entry) && !confirm('保存領域がいっぱいで、ゴミ箱に入れられません。このまま削除すると、元に戻せません。それでも削除しますか？')) return;
  delete sheets[id];
  if (!setSavedSheets(sheets)) return;
  if (workingId === id) { setWorkingId(''); pendingImages = entryImages(entry); } // 画面に残っている内容を新規保存したとき、画像も付くようにする
  refreshSaveSlotOptions('');
  alert(`「${entry.name}」を削除しました。\n「削除したキャラを復元」ボタンから復元できます。`);
}

// ==========================================================
// 全キャラクター一括バックアップ（保存済み全キャラを1ファイルに書き出し/読み込み）
// ==========================================================
function exportAllCharactersBackup() {
  const sheets = getSavedSheets();
  const ids = Object.keys(sheets);
  if (ids.length === 0) {
    alert('保存済みキャラクターがありません');
    return;
  }

  const backup = {
    type: 'necronica_backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    sheets: sheets,
    effectDict: (typeof getEffectDict === 'function') ? getEffectDict() : {}
  };

  try {
    // 書き出す前に、いったん読み戻して、人数と中身が元と同じことを確かめる
    const jsonText = JSON.stringify(backup, null, 2);
    const check = JSON.parse(jsonText);
    const cids = Object.keys(check.sheets || {});
    if (cids.length !== ids.length || cids.some(k => JSON.stringify(check.sheets[k]) !== JSON.stringify(sheets[k]))) throw new Error('書き出す内容が元と一致しませんでした');
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `necronica_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch (err) {
    // 書き出せなかったときは、「バックアップ済み」にしない
    alert('バックアップファイルを書き出せませんでした。\n（' + (err && err.message ? err.message : err) + '）\n\nキャラクターが多すぎるか、ブラウザが対応していない可能性があります。「JSON出力」でキャラクターを1人ずつ書き出すこともできます。');
    return;
  }
  try { localStorage.setItem('necro_last_backup', String(Date.now())); } catch (e) {}
  hideBackupNudge();
  updateBackupReminder();

  alert(`${ids.length}件のキャラクターをバックアップファイルとして書き出しました。\n\n※このファイルは、クラウドやメールなど、このブラウザとは別の場所にも置いておくと安心です。「バックアップファイルを確認」で、中身をいつでも確かめられます。`);
}

// 最後にバックアップを取ってからの日数を表示する（未バックアップ・14日以上は注意色）
function updateBackupReminder() {
  const el = document.getElementById('backup-reminder');
  if (!el) return;
  const n = Object.keys(getSavedSheets()).filter(i => i !== 'autosave_draft').length; // 下書き(自動保存)は数えない(お知らせの判定と同じ)
  if (n === 0) { el.style.display = 'none'; return; }
  let last = 0;
  try { last = parseInt(localStorage.getItem('necro_last_backup') || '0', 10) || 0; } catch (e) {}
  let msg, warn;
  if (!last) { msg = 'バックアップはまだ取っていません'; warn = true; }
  else {
    const days = Math.floor((Date.now() - last) / 86400000);
    msg = days <= 0 ? '最後のバックアップ：今日' : `最後のバックアップ：${days}日前`;
    warn = days >= 14;
  }
  el.style.display = '';
  el.style.color = warn ? '#ffcf70' : '#9a9';
  el.innerHTML = `${warn ? '⚠ ' : ''}${msg} <button type="button" class="char-switch-btn" style="margin-left:6px;width:auto;display:inline-block;" onclick="exportAllCharactersBackup()">バックアップを取る</button>`;
}

function onBackupFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const backup = JSON.parse(e.target.result);

      let entriesToImport = null;
      if (backup && backup.type === 'necronica_backup' && backup.sheets) {
        entriesToImport = backup.sheets;
      } else if (backup && typeof backup === 'object' && !Array.isArray(backup)) {
        // 念のため、バックアップ形式そのものでなく保存データのオブジェクトが直接渡された場合も許容する
        entriesToImport = backup;
      }

      if (!entriesToImport || typeof entriesToImport !== 'object') {
        alert('バックアップファイルの形式が正しくありません');
        return;
      }

      const importIds = Object.keys(entriesToImport).filter(id => entriesToImport[id] && entriesToImport[id].data);
      if (importIds.length === 0) {
        alert('バックアップファイルにキャラクターが含まれていませんでした');
        return;
      }

      if (!confirm(`${importIds.length}件のキャラクターを読み込みます。\n今ブラウザに保存されているキャラクターはそのまま残り、バックアップの内容が新しいキャラクターとして追加されます（上書きはされません）。\n\nよろしいですか？`)) return;

      const sheets = getSavedSheets();
      importIds.forEach(oldId => {
        const entry = entriesToImport[oldId];
        const newId = 'char_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        sheets[newId] = {
          name: entry.name || '(無名)',
          pl: entry.pl || '',
          savedAt: entry.savedAt || new Date().toISOString(),
          image: entry.image || null,
          images: entryImages(entry),
          data: entry.data
        };
      });

      if (!setSavedSheets(sheets)) return;
      if (backup && backup.effectDict && typeof mergeEffectDict === 'function') mergeEffectDict(backup.effectDict);
      refreshSaveSlotOptions();
      alert(`${importIds.length}件のキャラクターを読み込みました`);
    } catch (err) {
      alert('バックアップファイルの読み込みに失敗しました。ファイルの中身が正しいか確認してください。\n' + err.message);
    }
  };
  reader.onerror = function () {
    alert('ファイルの読み込みに失敗しました');
  };
  reader.readAsText(file);
  event.target.value = '';
}

// ==========================================================
// 新規作成（白紙に戻す）
// ==========================================================
let BLANK_SHEET_DATA = null;

// ページを開いた直後の、何も入力していない状態を覚えておく（記憶のカケラ枠は2個）
function captureBlankSheet() {
  try {
    BLANK_SHEET_DATA = JSON.parse(JSON.stringify(getFullData()));
    BLANK_SHEET_DATA.memories = [{ num: '', name: '', detail: '' }, { num: '', name: '', detail: '' }];
  } catch (e) {
    BLANK_SHEET_DATA = null;
  }
}

// 今の入力を白紙に戻す。保存済みのキャラは消さず、選択も外す（次に「保存」すると新しいキャラとして保存される）
function newBlankSheet() {
  if (!BLANK_SHEET_DATA) return alert('白紙の状態を用意できませんでした。ページを開き直してください');
  if (!confirm('今の入力をすべて消して、白紙に戻します。\n保存済みのキャラクターは消えません（「↩️ 元に戻す」で、今の入力は戻せます）。\n\nよろしいですか？')) return;
  pushUndoSnapshot();
  applyData(JSON.parse(JSON.stringify(BLANK_SHEET_DATA)));
  pendingImages = [];
  setWorkingId('');
  // 白紙に戻したあと、再読み込みで前の内容が戻らないよう、自動保存の下書きも片付ける
  try { const sh = getSavedSheets(); if (sh['autosave_draft']) { delete sh['autosave_draft']; if (!setSavedSheets(sh, true)) alert('白紙に戻しましたが、自動保存の下書きを片付けられませんでした（保存領域がいっぱいです）。\nこのまま再読み込みすると、前の内容が戻ることがあります。不要なキャラを削除してから、もう一度お試しください。'); } } catch (e) {}
  const select = document.getElementById('save-slot');
  if (select) select.value = '';
  if (typeof renderSaveCards === 'function') renderSaveCards('');
  if (typeof updateSelectedActionsVisibility === 'function') updateSelectedActionsVisibility('');
  if (typeof updateViewModeImage === 'function') updateViewModeImage('');
  isDirty = false;
  if (typeof autoResizeAllMemoTextareas === 'function') setTimeout(autoResizeAllMemoTextareas, 50);
}

// 読み込み中は寵の印を自動で付けず(前の使い道が残っていることがあるため)、終わってから、使い道と同じ名前の行に印を付ける(失敗しても必ず元に戻す)
function applyData(data) {
  chouaiLoading = true;
  try { return applyData_(data); } finally { try { chouaiSeedRows(); } catch (e) {} chouaiLoading = false; try { autoMarkChouaiFromUses(true, true); } catch (e) {} } // 読み込み後、使い道と同じ名前のスキル・パーツには、寵を付けなくても印を付けて数に入れる
}
function applyData_(data) {
  // 以前の誤字「よぷんなめ」が入っていたら、「よぶんなめ」に直して読み込む
  try { const js = JSON.stringify(data); const fx = fixKnownTyposInString(js); if (fx !== js) data = JSON.parse(fx); } catch (e) {}
  // 以前の「サイケデリック」のキャラは、「サイケデリック(歪曲)」に読み替える(クラス名・スキルのクラス・スキル名)
  try {
    const PSY_OLD = 'サイケデリック', PSY_NEW = 'サイケデリック(歪曲)';
    const old = ['mc', 'sc'].some(k => data && data[k] === PSY_OLD) || (data && Array.isArray(data.skills) && data.skills.some(s => s && s.category === PSY_OLD));
    if (old) {
      data = JSON.parse(JSON.stringify(data));
      ['mc', 'sc'].forEach(k => { if (data[k] === PSY_OLD) data[k] = PSY_NEW; });
      (data.skills || []).forEach(s => {
        if (s && s.category === PSY_OLD) {
          s.category = PSY_NEW;
          if (typeof s.name === 'string' && s.name && !s.name.endsWith('(歪曲)') && SKILL_DATABASE[PSY_NEW].some(x => x.name === s.name + '(歪曲)')) s.name += '(歪曲)';
        }
      });
    }
    // ポジションのスキルのうち、サプリのもの(祈り・血の涙など)にも「(歪曲)」を付けて読み替える
    if (data && Array.isArray(data.skills) && data.skills.some(s => s && typeof s.name === 'string' && normSkillName(s.category, s.name) !== s.name)) {
      data = JSON.parse(JSON.stringify(data));
      data.skills.forEach(s => { if (s && typeof s.name === 'string') s.name = normSkillName(s.category, s.name); });
    }
  } catch (e) {}
  const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };

  setVal('pl', data.pl); setVal('name', data.name);
  setVal('pos', data.pos || 'アリス'); setVal('mc', data.mc || 'ロマネスク'); setVal('sc', data.sc || 'ロマネスク');
  // 選択肢に無いクラス名(以前の「ホリック」など)が保存されていても、値が消えないよう選択肢に足す
  ['mc', 'sc'].forEach(id => { const el = document.getElementById(id); const v = data[id]; if (el && v && el.value !== v) { const o = document.createElement('option'); o.textContent = v; el.appendChild(o); el.value = v; } });
  { const pc = document.getElementById('piece-color'); if (pc) { pc.value = data.pieceColor || '#888888'; pc.dataset.set = data.pieceColor ? '1' : ''; if (typeof updatePieceColorNote === 'function') updatePieceColorNote(); } }
  { const ib = document.getElementById('img-bg-color'); if (ib) { ib.value = data.imageBg || '#222228'; ib.dataset.set = data.imageBg ? '1' : ''; applyImageBg(); } }
  setVal('chat-palette-custom', data.chatPalette);
  setVal('ccf-memo-custom', data.ccfoliaMemo);
  setVal('ccf-extra-custom', data.ccfoliaExtra ? JSON.stringify(data.ccfoliaExtra) : '');
  setVal('ccf-status-custom', Array.isArray(data.ccfoliaStatus) ? JSON.stringify(data.ccfoliaStatus) : '');
  setVal('age', data.age); setVal('ps', data.ps || '煉獄');
  setVal('height', data.height); setVal('weight', data.weight);
  setVal('hair', data.hair); setVal('eye', data.eye); setVal('skin', data.skin);
  setVal('free-memo', data.freeMemo);
  autoResizeTextarea(document.getElementById('free-memo'));
  setVal('battle-memo', data.battleMemo);
  autoResizeTextarea(document.getElementById('battle-memo'));
  setVal('hint', data.hint);
  setVal('act', data.act || '9'); setVal('fav', data.fav || '0');
  setVal('chouai-wep', data.chouaiWep || '0'); setVal('chouai-mut', data.chouaiMut || '0'); setVal('chouai-cyb', data.chouaiCyb || '0');

  // 基本行動値の復元。旧バージョンの保存データ（actBase無し）は、
  // 保存時点の最大行動値からパーツ由来の増加分を逆算して基本行動値を求める
  if (data.actBase !== undefined && data.actBase !== '') {
    setVal('act-base', data.actBase);
  } else {
    const oldAct = parseInt(data.act, 10) || 0;
    const bonusAtSaveTime = (data.parts || []).reduce((sum, p) => sum + (p.isBroken ? 0 : extractActionBonus(p.memo)), 0);
    setVal('act-base', String(oldAct - bonusAtSaveTime));
  }

  if (data.bonus) {
    const radio = ['wep', 'mut', 'cyb'].includes(data.bonus) ? document.querySelector(`input[name="bonus"][value="${data.bonus}"]`) : null;
    if (radio) radio.checked = true;
  }

  onClassChange();

  // スキルの復元。旧バージョン（タイミング/コスト/射程が別欄に分かれていない）のデータは、
  // メモ本文から「タイミング/コスト/射程」形式を検出できれば自動的に分解して引き継ぐ
  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills) {
      data.skills.forEach(s => {
        let timing = s.timing;
        let cost = s.cost;
        let range = s.range;
        let memo = s.memo || '';

        if (timing === undefined && cost === undefined && range === undefined) {
          const parsed = parseSkillMemo(memo);
          timing = parsed.timing;
          cost = parsed.cost;
          range = parsed.range;
          memo = parsed.timing || parsed.cost || parsed.range ? parsed.effect : memo;
        }

        addSkillRow(s.category, s.name, timing || '', cost || '', range || '', memo || '', s.tag || '', !!s.isUsed, !!s.isChouai);
        { const rr = document.querySelectorAll('#skill-tbody tr.skill-row'); const lr = rr[rr.length - 1]; if (lr) { if (s.slot) lr.dataset.slot = s.slot; } }
      });
    }
  }

  // パーツ（武装・変異・改造など）の復元
  restorePartsFromData(data.parts);

  // たからもの（複数）の復元。旧バージョン（単一のtr文字列のみ）のデータは自動的に1件目として引き継ぐ
  const treasureListEl = document.getElementById('treasure-list');
  if (treasureListEl) {
    treasureListEl.innerHTML = '';
    if (Array.isArray(data.treasures) && data.treasures.length > 0) {
      data.treasures.forEach(t => addTreasureEntry(t.name, t.content, t.location));
    } else if (data.tr) {
      addTreasureEntry(data.tr, '', '頭部');
    }
  }

  // 記憶のカケラ（複数）の復元。旧バージョン（単一のmem文字列のみ）のデータは自動的に1件目として引き継ぐ
  const memoryListEl = document.getElementById('memory-list');
  if (memoryListEl) {
    memoryListEl.innerHTML = '';
    if (Array.isArray(data.memories) && data.memories.length > 0) {
      data.memories.forEach(m => addMemoryEntry(m, true));
    } else if (data.mem) {
      addMemoryEntry(data.mem, true);
    }
  }

  // 未練の復元
  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list) {
      data.list.forEach(l => addRow(l.target, l.emotion, l.madness, l.madName || '', l.madEffect || ''));
    }
  }

  // 履歴の復元
  const historyTbody = document.getElementById('session-history-tbody');
  if (historyTbody) {
    historyTbody.innerHTML = '';
    if (data.history) {
      data.history.forEach(h => addSessionHistoryRow(h.scenario, h.battle, h.personal, h.memo));
    }
  }

  // 使い道の復元
  const useTbody = document.getElementById('chouai-use-tbody');
  if (useTbody) {
    useTbody.innerHTML = '';
    chouaiMemoSnap = null; // 読み込み直しでは、印を付け外ししない
    if (data.chouaiUses) {
      data.chouaiUses.forEach(u => addChouaiUseRow(u.used, u.memo));
    }
  }

  calcTotals();
  calcChouaiTotals();
}

// 保存されたパーツ配列から、4部位（頭部/腕部/胴部/脚部）のテーブルを再構築する
// 「基本」パーツは常に固定のため保存データには頼らず毎回自動配置し、
// 武装・変異・改造などの追加パーツのみ保存データから復元する
function restorePartsFromData(parts) {
  const sectionIds = ['head', 'arm', 'body', 'leg'];
  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
  const savedParts = Array.isArray(parts) ? parts : [];

  sectionIds.forEach(secId => {
    const tbody = document.getElementById(`parts-tbody-${secId}`);
    if (!tbody) return;
    tbody.innerHTML = '';

    // このセクションの「基本」パーツの損傷・使用状態（DEFAULT_PARTSと同じ並び順で対応させる）
    const savedBaseStates = savedParts.filter(p => p.type === '基本' && p.location === locMap[secId]);

    if (typeof DEFAULT_PARTS !== 'undefined' && DEFAULT_PARTS[secId]) {
      DEFAULT_PARTS[secId].forEach((p, idx) => {
        const saved = savedBaseStates[idx];
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo || '', false, locMap[secId], saved ? saved.tag || '' : '');
        if (saved) applyRowFlags(tbody, saved.isBroken, saved.isUsed, saved.isChouai, saved.isOther);
      });
    }
  });

  if (savedParts.length === 0) {
    if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
    return;
  }

  const locToSection = { '頭部': 'head', '腕部': 'arm', '胴部': 'body', '脚部': 'leg' };

  // 武装・変異・改造など「基本」以外の追加パーツを保存データから復元
  savedParts.filter(p => p.type !== '基本').forEach(p => {
    const secId = locToSection[p.location] || 'body';
    const tbody = document.getElementById(`parts-tbody-${secId}`);
    if (!tbody) return;

    addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, p.isEditable, p.location || locMap[secId], p.tag || '');
    applyRowFlags(tbody, p.isBroken, p.isUsed, p.isChouai, p.isOther);
  });

  if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
}

// 追加したばかりの行（tbodyの最後の行）に損傷・使用チェックの状態を反映する
function applyRowFlags(tbody, isBroken, isUsed, isChouai, isOther) {
  const rows = tbody.querySelectorAll('tr.part-row');
  const lastRow = rows[rows.length - 1];
  if (!lastRow) return;
  if (isChouai && lastRow.querySelector('.chouai-btn') && !lastRow.classList.contains('no-chouai')) lastRow.classList.add('chouai-acq');
  else if (isOther && lastRow.querySelector('.other-btn') && !lastRow.classList.contains('no-chouai')) lastRow.classList.add('other-acq');
  if (isBroken) {
    const cb = lastRow.querySelector('.p-broken');
    if (cb) { cb.checked = true; togglePartBreak(cb); }
  }
  if (isUsed) {
    const cb = lastRow.querySelector('.p-used');
    if (cb) { cb.checked = true; togglePartUsed(cb); }
  }
}


// 起動時のバックアップのお願い：保存済みキャラがいて、14日以上バックアップしていない（または一度も取っていない）とき、画面の下に一度だけ出す。
// 「あとで」を押したら7日は出さない。閉じても保存や操作の邪魔にならないよう、確認ダイアログは使わない
let backupNudgeShown = false;
function hideBackupNudge() {
  const el = document.getElementById('backup-nudge');
  if (el) el.remove();
}
function maybeShowBackupNudge() {
  try {
    if (backupNudgeShown) return;
    if (document.body.classList.contains('view-locked')) return; // 閲覧用URLで開いたときは出さない
    const sheets = getSavedSheets();
    const n = Object.keys(sheets).filter(i => i !== 'autosave_draft').length;
    if (n === 0) return;
    let last = 0, asked = 0;
    try {
      last = parseInt(localStorage.getItem('necro_last_backup') || '0', 10) || 0;
      asked = parseInt(localStorage.getItem('necro_backup_nudge_at') || '0', 10) || 0;
    } catch (e) {}
    const DAY = 86400000;
    // 時計が進んだあとに戻されたなどで、記録の時刻が「未来」になっているときは、無効なものとして扱う(お知らせが出なくなるのを防ぐ)
    const now = Date.now();
    if (last > now) last = 0;
    if (asked > now) asked = 0;
    if (last && now - last < 14 * DAY) return;
    if (asked && now - asked < 7 * DAY) return;
    backupNudgeShown = true;
    const days = last ? Math.floor((Date.now() - last) / DAY) : 0;
    const el = document.createElement('div');
    el.id = 'backup-nudge';
    el.setAttribute('role', 'alert');
    el.style.cssText = 'position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:10000;background:#241416;color:#fff;border:1px solid #f0a0a0;border-radius:10px;padding:10px 12px;font-size:.82rem;box-shadow:0 4px 14px rgba(0,0,0,.6);display:flex;flex-direction:column;gap:8px;max-width:560px;margin:0 auto;';
    const msg = document.createElement('div');
    msg.textContent = last
      ? `最後のバックアップから${days}日たっています。キャラクターはこのブラウザの中にだけ保存されているので、ここでバックアップしておくと安心です。`
      : 'まだバックアップを取っていません。キャラクターはこのブラウザの中にだけ保存されているので、ここでバックアップしておくと安心です。';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
    const later = document.createElement('button');
    later.type = 'button'; later.className = 'sec'; later.textContent = 'あとで';
    later.onclick = () => { try { localStorage.setItem('necro_backup_nudge_at', String(Date.now())); } catch (e) {} hideBackupNudge(); };
    const go = document.createElement('button');
    go.type = 'button'; go.textContent = '📦 バックアップを取る';
    go.onclick = () => {
      // 書き出しに成功して「最後のバックアップ」の時刻が更新されたときだけ、お知らせを閉じる(失敗・中止のときは残し、「7日出さない」も記録しない)
      let before = 0; try { before = parseInt(localStorage.getItem('necro_last_backup') || '0', 10) || 0; } catch (e) {}
      exportAllCharactersBackup();
      let after = 0; try { after = parseInt(localStorage.getItem('necro_last_backup') || '0', 10) || 0; } catch (e) {}
      if (after !== before) hideBackupNudge();
    };
    row.appendChild(later); row.appendChild(go);
    el.appendChild(msg); el.appendChild(row);
    document.body.appendChild(el);
  } catch (e) { /* 出せなくても、ほかの動きには影響しない */ }
}

// ==========================================================
// 削除したキャラの一覧（復元・完全に削除）
// ==========================================================
function restoreTrashEntry(index) {
  const trash = getTrash();
  const entry = trash[index];
  if (!entry) { alert('その項目は見つかりませんでした'); return false; }
  const sheets = getSavedSheets();
  const newId = 'char_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
  sheets[newId] = {
    name: entry.name || '(無名)',
    pl: entry.pl || '',
    savedAt: entry.savedAt || new Date().toISOString(),
    image: entry.image || null,
    images: entryImages(entry),
    pinned: entry.pinned ? true : undefined,
    data: JSON.parse(JSON.stringify(entry.data || {}))
  };
  if (!setSavedSheets(sheets)) return false; // 失敗したときは、ゴミ箱の中身は減らさない
  trash.splice(index, 1);
  if (!setTrash(trash)) alert('復元はできましたが、ゴミ箱の一覧を更新できませんでした。同じキャラがゴミ箱に残っている場合があります');
  refreshSaveSlotOptions(newId);
  return true;
}
function openTrashList() { showTrashList(); }
function showTrashList() {
  const existing = document.getElementById('trash-overlay');
  if (existing) existing.remove();
  const trash = getTrash();
  if (trash.length === 0) return alert('復元できる削除済みキャラクターはありません');
  const ov = document.createElement('div');
  ov.id = 'trash-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10001;padding:16px;overflow-y:auto;';
  const fmt = iso => { try { return iso ? new Date(iso).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; } catch (e) { return ''; } };
  const rows = trash.map((t, i) => `<div style="display:flex;align-items:center;gap:6px;border-bottom:1px solid #333;padding:6px 0;">
      <div style="flex:1 1 auto;min-width:0;"><div style="font-weight:bold;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(t.name || '(無名)')}${t.pl ? `<span style="color:#999;font-size:.75rem;font-weight:normal;">（PL：${escapeHtml(t.pl)}）</span>` : ''}</div>
      <div style="font-size:.7rem;color:#888;">${escapeHtml(fmt(t.deletedAt) ? fmt(t.deletedAt) + ' に削除' : '')}</div></div>
      <button type="button" data-act="restore" data-i="${i}" style="font-size:.78rem;padding:4px 8px;">復元</button>
      <button type="button" class="sec" data-act="purge" data-i="${i}" style="font-size:.78rem;padding:4px 8px;">完全に削除</button></div>`).join('');
  ov.innerHTML = `<div style="max-width:400px;margin:50px auto;background:#18181c;border:1.5px solid #8b0000;border-radius:10px;padding:14px;color:#eee;">
    <div style="color:#f0a0a0;font-weight:bold;margin-bottom:4px;">↩️ 削除したキャラクター</div>
    <div style="font-size:.74rem;color:#999;margin-bottom:6px;">新しいものから、最大${TRASH_LIMIT}件まで残ります。「復元」は、新しいキャラクターとして保存済み一覧に戻します。</div>
    ${rows}
    <div style="display:flex;justify-content:flex-end;margin-top:12px;"><button type="button" class="sec" id="trash-close">閉じる</button></div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => {
    if (e.target === ov) return close();
    const b = e.target.closest && e.target.closest('button[data-act]');
    if (!b) return;
    const i = parseInt(b.dataset.i, 10);
    const entry = getTrash()[i];
    if (!entry) return;
    if (b.dataset.act === 'restore') {
      if (restoreTrashEntry(i)) { showToast('✔ 「' + (entry.name || '(無名)') + '」を復元しました'); openTrashListOrClose(); }
    } else if (b.dataset.act === 'purge') {
      if (!confirm('「' + (entry.name || '(無名)') + '」を完全に削除します。もう元に戻せません。よろしいですか？')) return;
      const tr = getTrash(); tr.splice(i, 1);
      if (!setTrash(tr)) return alert('完全に削除できませんでした');
      openTrashListOrClose();
    }
  });
  ov.querySelector('#trash-close').onclick = close;
}
function openTrashListOrClose() {
  if (getTrash().length === 0) { const o = document.getElementById('trash-overlay'); if (o) o.remove(); }
  else showTrashList();
}

// バックアップファイルの確認：復元はせずに、読めるか・何人入っているか・今のブラウザと同じかを調べる
function onBackupVerifySelected(event) {
  const input = event.target;
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onerror = () => { alert('ファイルを読み込めませんでした'); input.value = ''; };
  reader.onload = function (e) {
    try {
      let b;
      try { b = JSON.parse(e.target.result); } catch (err) { return alert('このファイルは、バックアップとして読めませんでした。\n（JSONの形式が壊れています）'); }
      const sheets = b && b.type === 'necronica_backup' && b.sheets && typeof b.sheets === 'object' ? b.sheets : null;
      if (!sheets) return alert('このファイルは、「全キャラをバックアップ」で書き出したファイルではないようです');
      const ids = Object.keys(sheets).filter(i => i !== 'autosave_draft');
      const bad = ids.filter(i => !sheets[i] || typeof sheets[i] !== 'object' || !sheets[i].data || typeof sheets[i].data !== 'object');
      const cur = getSavedSheets();
      const curIds = Object.keys(cur).filter(i => i !== 'autosave_draft');
      let same = 0, differ = 0, missing = 0;
      ids.forEach(i => {
        if (!cur[i]) missing++;
        else if (JSON.stringify(cur[i].data) === JSON.stringify((sheets[i] || {}).data)) same++;
        else differ++;
      });
      const names = ids.slice(0, 8).map(i => '・' + ((sheets[i] && sheets[i].name) || '(無名)')).join('\n') + (ids.length > 8 ? `\n…ほか${ids.length - 8}人` : '');
      const when = b.exportedAt ? '書き出した日時：' + new Date(b.exportedAt).toLocaleString('ja-JP') + '\n' : '';
      alert(`バックアップファイルを確認しました。\n${when}キャラクター：${ids.length}人${bad.length ? `（うち${bad.length}人は中身が壊れています）` : '（すべて読めます）'}\n${names}\n\n今のブラウザとの比較：\n・同じ内容：${same}人\n・内容が違う：${differ}人\n・このブラウザに無い：${missing}人\n（今のブラウザにだけいるキャラ：${curIds.filter(i => !sheets[i]).length}人）\n\n※復元はしていません。復元するときは「バックアップから復元」を使ってください。`);
    } catch (err) {
      alert('確認中にエラーが出ました。\n' + (err && err.message ? err.message : err));
    } finally {
      input.value = '';
    }
  };
  reader.readAsText(file);
}

// ---- 保存領域の使用量の表示と、画像を軽くする機能 ----
function entrySizeChars(e) { try { return JSON.stringify(e).length; } catch (er) { return 0; } }
function fmtKB(n) { return n >= 1024 * 1024 ? (n / 1024 / 1024).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }

function renderStorageInfo() {
  const box = document.getElementById('storage-info');
  if (!box) return;
  try {
    const ratio = getStorageUsageRatio();
    const pct = Math.min(100, Math.round(ratio * 100));
    const color = ratio >= 0.8 ? '#e55' : ratio >= 0.5 ? '#eb4' : '#6c8';
    const sheets = getSavedSheets();
    const rows = Object.keys(sheets).map(id => {
      const e = sheets[id];
      const imgs = entryImages(e);
      return { name: e.name || '(名前なし)', size: entrySizeChars(e), img: imgs.length };
    }).filter(r => r.img > 0).sort((a, b) => b.size - a.size).slice(0, 3);
    const heavy = rows.length ? '<div style="opacity:.85;margin-top:2px;">画像で重いキャラ：' + rows.map(r => `${escapeHtmlSafe(r.name)}（${fmtKB(r.size)}・画像${r.img}枚）`).join('、') + '</div>' : '';
    const warn = ratio >= 0.8 ? '<div style="color:#e55;">※もうすぐいっぱいです。バックアップしてから、使わないキャラの削除や「画像を軽くする」をおすすめします。</div>' : '';
    box.innerHTML = `<div>💾 ブラウザの保存領域：約${pct}%使用中（目安 約${fmtKB(STORAGE_LIMIT_CHARS)}）</div>
      <div style="height:8px;background:#333;border-radius:4px;overflow:hidden;margin:3px 0;"><div style="width:${pct}%;height:100%;background:${color};"></div></div>${heavy}${warn}
      <button type="button" class="action-btn c-teal" style="margin-top:6px;" onclick="compressSavedImages()"><span class="icon">📦</span><span>画像を軽くする<br>（保存済みの全画像）</span></button>`;
  } catch (e) { box.innerHTML = ''; }
}
function escapeHtmlSafe(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function recompressDataUrl(url, maxDim, quality) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        let w = img.width, h = img.height;
        const k = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0, w, h);
        let alpha = false;
        const px = cx.getImageData(0, 0, w, h).data;
        for (let i = 3; i < px.length; i += 4) { if (px[i] < 250) { alpha = true; break; } }
        let out = alpha ? cv.toDataURL('image/webp', quality) : cv.toDataURL('image/jpeg', quality);
        if (alpha && !out.startsWith('data:image/webp')) out = url; // 透明を保てないときは、そのまま
        resolve(out.length < url.length ? out : url); // 軽くならなければ、元のまま
      } catch (e) { resolve(url); }
    };
    img.onerror = () => resolve(url);
    img.src = url;
  });
}

async function compressSavedImages() {
  const sheets = getSavedSheets();
  const ids = Object.keys(sheets).filter(id => entryImages(sheets[id]).length);
  if (!ids.length) return alert('保存済みのキャラクターに、画像はありません');
  if (!confirm('保存済みの全キャラの画像を、小さく・軽く作り直します（画質は少し落ちます。元には戻せません）。\n\n先に「全キャラをバックアップ」しておくと安心です。続けますか？')) return;
  const before = getStorageUsageRatio() * STORAGE_LIMIT_CHARS;
  try {
    for (const id of ids) {
      const list = await Promise.all(entryImages(sheets[id]).map(u => recompressDataUrl(u, 240, 0.5)));
      sheets[id].images = list; sheets[id].image = list[0];
    }
    if (!setSavedSheets(sheets)) return; // 失敗したときは、保存領域のメッセージが出て、元のまま
    const after = getStorageUsageRatio() * STORAGE_LIMIT_CHARS;
    renderStorageInfo();
    try { renderSaveCards(document.getElementById('save-slot')?.value || ''); } catch (e) {}
    alert(`画像を軽くしました（約${fmtKB(Math.max(0, before - after))}の節約）`);
  } catch (e) {
    alert('画像を軽くする途中でエラーが起きたため、中止しました。保存済みのデータはそのままです。');
  }
}
