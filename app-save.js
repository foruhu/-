function getFullData() {
  const getVal = id => document.getElementById(id)?.value || '';

  const data = {
    pl: getVal('pl'),
    name: getVal('name'),
    pos: getVal('pos'),
    mc: getVal('mc'),
    sc: getVal('sc'),
    age: getVal('age'),
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

  // スキル
  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    data.skills.push({
      category: tr.querySelector('input')?.value || '',
      name: tr.querySelector('.skill-name-select')?.value || '',
      timing: tr.querySelector('.skill-timing')?.value || '',
      cost: tr.querySelector('.skill-cost')?.value || '',
      range: tr.querySelector('.skill-range')?.value || '',
      memo: tr.querySelector('.skill-memo')?.value || '',
      tag: tr.querySelector('.skill-tag')?.value || ''
    });
  });

  // パーツ
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const name = tr.querySelector('.p-name')?.value;
    if (name) {
      data.parts.push({
        isBroken: tr.querySelector('.p-broken')?.checked || false,
        isUsed: tr.querySelector('.p-used')?.checked || false,
        location: tr.querySelector('.p-location')?.value || '',
        name: name,
        type: tr.querySelector('.p-type')?.value || '基本',
        level: tr.querySelector('.p-level')?.value || '1',
        timing: tr.querySelector('.p-timing')?.value || '',
        cost: tr.querySelector('.p-cost')?.value || '',
        range: tr.querySelector('.p-range')?.value || '',
        memo: tr.querySelector('.p-memo')?.value || '',
        isEditable: !tr.querySelector('.p-name')?.hasAttribute('readonly'),
        tag: tr.querySelector('.p-tag')?.value || ''
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
  document.querySelectorAll('#memory-list .memory-value').forEach(input => {
    data.memories.push(input.value || '');
  });

  // 未練
  document.querySelectorAll('#list tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    if (inputs.length >= 3) {
      data.list.push({
        target: inputs[0].value,
        emotion: inputs[1].value,
        madness: inputs[2].value
      });
    }
  });

  // セッション履歴（獲得）
  document.querySelectorAll('#session-history-tbody tr').forEach(tr => {
    data.history.push({
      scenario: tr.querySelector('.h-scenario')?.value || '',
      battle: tr.querySelector('.battle-pts')?.value || 0,
      personal: tr.querySelector('.personal-pts')?.value || 0,
      memo: tr.querySelector('.h-memo')?.value || ''
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
  try {
    return JSON.parse(localStorage.getItem(SHEETS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function setSavedSheets(sheets) {
  localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
}

function refreshSaveSlotOptions(selectedId = '') {
  const select = document.getElementById('save-slot');
  if (!select) return;
  const sheets = getSavedSheets();
  const ids = Object.keys(sheets).sort((a, b) => (sheets[b].savedAt || '').localeCompare(sheets[a].savedAt || ''));

  let html = '<option value="">-- 新規保存 --</option>';
  ids.forEach(id => {
    const s = sheets[id];
    const label = `${s.name || '(無名)'}${s.pl ? '［' + s.pl + '］' : ''}`;
    html += `<option value="${id}" ${id === selectedId ? 'selected' : ''}>${label}</option>`;
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
    setSavedSheets(sheets);
  } catch (e) {
    // 変換に失敗した場合は何もしない
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
      image: null,
      data: data
    };
  } else {
    // 上書き保存
    const existing = sheets[id];
    const existingName = existing ? existing.name : '(無名)';
    if (!confirm(`「${existingName}」に上書き保存します。よろしいですか？`)) return;
    sheets[id] = {
      name: existingName,
      pl: data.pl || '',
      savedAt: new Date().toISOString(),
      image: existing ? existing.image || null : null,
      data: data
    };
  }

  // 新規保存が完了したら、自動保存の下書き枠は不要になるので片付ける
  if (wasNew && sheets['autosave_draft']) {
    delete sheets['autosave_draft'];
  }

  setSavedSheets(sheets);
  isDirty = false;
  refreshSaveSlotOptions(id);
  alert('ブラウザに保存しました');
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
  alert(`「${entry.name}」を読み込みました`);
}

function deleteSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('削除するキャラクターをカードから選択してください');

  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return;

  if (!confirm(`「${entry.name}」を削除します。この操作は取り消せません。よろしいですか？`)) return;

  delete sheets[id];
  setSavedSheets(sheets);
  refreshSaveSlotOptions('');
  alert('削除しました');
}

function applyData(data) {
  const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };

  setVal('pl', data.pl); setVal('name', data.name);
  setVal('pos', data.pos || 'アリス'); setVal('mc', data.mc || 'ロマネスク'); setVal('sc', data.sc || 'ロマネスク');
  setVal('age', data.age); setVal('ps', data.ps || '煉獄');
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
    const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
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

        addSkillRow(s.category, s.name, timing || '', cost || '', range || '', memo || '', s.tag || '');
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
      data.memories.forEach(m => addMemoryEntry(m));
    } else if (data.mem) {
      addMemoryEntry(data.mem);
    }
  }

  // 未練の復元
  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list) {
      data.list.forEach(l => addRow(l.target, l.emotion, l.madness));
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
        if (saved) applyRowFlags(tbody, saved.isBroken, saved.isUsed);
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
    applyRowFlags(tbody, p.isBroken, p.isUsed);
  });

  if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
}

// 追加したばかりの行（tbodyの最後の行）に損傷・使用チェックの状態を反映する
function applyRowFlags(tbody, isBroken, isUsed) {
  const rows = tbody.querySelectorAll('tr');
  const lastRow = rows[rows.length - 1];
  if (!lastRow) return;
  if (isBroken) {
    const cb = lastRow.querySelector('.p-broken');
    if (cb) { cb.checked = true; togglePartBreak(cb); }
  }
  if (isUsed) {
    const cb = lastRow.querySelector('.p-used');
    if (cb) { cb.checked = true; togglePartUsed(cb); }
  }
}

