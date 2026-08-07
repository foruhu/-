// モックデータベース（外部スクリプト等で定義されていない場合のフォールバック）
const CLASS_PARTS = typeof CLASS_PARTS !== 'undefined' ? CLASS_PARTS : {
  'ロマネスク': [0, 0, 2],
  'ステーシー': [1, 1, 0],
  'タナトス': [2, 0, 0],
  'レクイエム': [2, 0, 0],
  'バロック': [0, 2, 0],
  'サイケデリック': [0, 1, 1]
};

const SKILL_DATABASE = typeof SKILL_DATABASE !== 'undefined' ? SKILL_DATABASE : {
  'アリス': [{ name: 'おさなご', memo: 'ターン開始時に発動...' }],
  'ロマネスク': [{ name: '時計仕掛け', memo: '最大行動値+2' }]
};

// --- クラス変更時のパーツ制限表示更新 ---
function onClassChange() {
  const mc = document.getElementById('mc')?.value || '';
  const sc = document.getElementById('sc')?.value || '';

  const mcParts = CLASS_PARTS[mc] || [0, 0, 2];
  const scParts = CLASS_PARTS[sc] || [0, 0, 2];

  ['wep', 'mut', 'cyb'].forEach((key, idx) => {
    const mcEl = document.getElementById(`mc-${key}`);
    const scEl = document.getElementById(`sc-${key}`);
    if (mcEl) mcEl.textContent = mcParts[idx];
    if (scEl) scEl.textContent = scParts[idx];
  });
  
  calcTotals();
}

// --- パーツ・能力値計算処理 ---
function calcTotals() {
  const getVal = id => parseInt(document.getElementById(id)?.value || document.getElementById(id)?.textContent, 10) || 0;
  const bonusSelected = document.querySelector('input[name="bonus"]:checked')?.value;

  const totals = {
    wep: getVal('mc-wep') + getVal('sc-wep') + (bonusSelected === 'wep' ? 1 : 0) + getVal('chouai-wep'),
    mut: getVal('mc-mut') + getVal('sc-mut') + (bonusSelected === 'mut' ? 1 : 0) + getVal('chouai-mut'),
    cyb: getVal('mc-cyb') + getVal('sc-cyb') + (bonusSelected === 'cyb' ? 1 : 0) + getVal('chouai-cyb')
  };

  if (document.getElementById('total-wep')) document.getElementById('total-wep').textContent = totals.wep;
  if (document.getElementById('total-mut')) document.getElementById('total-mut').textContent = totals.mut;
  if (document.getElementById('total-cyb')) document.getElementById('total-cyb').textContent = totals.cyb;

  // パーツの集計処理
  const currentCounts = { '武装': {1:0, 2:0, 3:0}, '変異': {1:0, 2:0, 3:0}, '改造': {1:0, 2:0, 3:0} };
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const type = tr.querySelector('.p-type')?.value;
    const lv = parseInt(tr.querySelector('.p-level')?.value, 10);
    if (currentCounts[type] && currentCounts[type][lv] !== undefined) {
      currentCounts[type][lv]++;
    }
  });
}

// --- パーツ状態管理 ---
function togglePartBreak(checkbox) {
  checkbox.closest('tr').classList.toggle('broken', checkbox.checked);
}

function resetUsed() {
  document.querySelectorAll('#parts-container tr input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('tr').classList.remove('broken');
  });
}

// --- スキル行操作 ---
function addSkillRow(category = '', skillName = '', memo = '') {
  const tbody = document.getElementById('skill-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  
  let optionsHtml = '<option value="">-- スキルを選択 --</option>';
  if (SKILL_DATABASE[category]) {
    SKILL_DATABASE[category].forEach(s => {
      optionsHtml += `<option value="${s.name}">${s.name}</option>`;
    });
  }

  tr.innerHTML = `
    <td><input type="text" value="${category}" readonly style="width:100px;"></td>
    <td><select onchange="onSkillSelect(this)">${optionsHtml}</select></td>
    <td><textarea style="width:90%; height:30px;">${memo}</textarea></td>
    <td><button type="button" class="remove-btn" onclick="this.closest('tr').remove(); calcTotals();">X</button></td>
  `;

  tbody.appendChild(tr);
  if (skillName) {
    const select = tr.querySelector('select');
    if (select) select.value = skillName;
  }
  updateSkillOptions();
  calcTotals();
}

function addPosSkillRow() { addSkillRow(document.getElementById('pos').value); }
function addMcSkillRow() { addSkillRow(document.getElementById('mc').value); }
function addScSkillRow() { addSkillRow(document.getElementById('sc').value); }

function onSkillSelect(selectElem) {
  const skillName = selectElem.value;
  const tr = selectElem.closest('tr');
  const category = tr.querySelector('input').value;
  const textarea = tr.querySelector('textarea');

  if (!skillName) {
    textarea.value = '';
  } else if (SKILL_DATABASE[category]) {
    const found = SKILL_DATABASE[category].find(s => s.name === skillName);
    if (found) textarea.value = found.memo || '';
  }
  updateSkillOptions();
  calcTotals();
}

function updateSkillOptions() {
  // スキルの選択状態の同期処理（必要に応じて実装）
}

// --- 未練行操作 ---
function addRow(target = '', emotion = '', madness = '') {
  const tbody = document.getElementById('list');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}"></td>
    <td><input type="text" value="${emotion}"></td>
    <td><input type="text" value="${madness}"></td>
    <td><button type="button" class="remove-btn" onclick="this.closest('tr').remove();">X</button></td>
  `;
  tbody.appendChild(tr);
}

// --- 1. セッション履歴（獲得）の行追加 ---
function addSessionHistoryRow(scenario = '', battle = 0, personal = 0, memo = '') {
  const tbody = document.getElementById('session-history-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="h-scenario" value="${scenario}"></td>
    <td><input type="number" class="battle-pts" value="${battle}" onchange="calcChouaiTotals()"> pt</td>
    <td><input type="number" class="personal-pts" value="${personal}" onchange="calcChouaiTotals()"> pt</td>
    <td><input type="text" class="h-memo" value="${memo}"></td>
    <td><button type="button" class="remove-btn" onclick="this.closest('tr').remove(); calcChouaiTotals();">X</button></td>
  `;
  tbody.appendChild(tr);
  calcChouaiTotals();
}

// --- 2. 寵愛点の使い道（消費）の行追加 ---
function addChouaiUseRow(used = 0, memo = '') {
  const tbody = document.getElementById('chouai-use-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="number" class="used-pts" value="${used}" onchange="calcChouaiTotals()"> pt</td>
    <td><input type="text" class="use-memo" value="${memo}"></td>
    <td><button type="button" class="remove-btn" onclick="this.closest('tr').remove(); calcChouaiTotals();">X</button></td>
  `;
  tbody.appendChild(tr);
  calcChouaiTotals();
}

// --- 3. 寵愛点計算処理 ---
function calcChouaiTotals() {
  let totalBattle = 0;
  let totalPersonal = 0;
  let totalUsed = 0;

  // 獲得寵愛の計算
  document.querySelectorAll('#session-history-tbody .battle-pts').forEach(input => {
    totalBattle += parseInt(input.value, 10) || 0;
  });
  document.querySelectorAll('#session-history-tbody .personal-pts').forEach(input => {
    totalPersonal += parseInt(input.value, 10) || 0;
  });

  // 使用寵愛の計算
  document.querySelectorAll('#chouai-use-tbody .used-pts').forEach(input => {
    totalUsed += parseInt(input.value, 10) || 0;
  });

  const totalEarned = totalBattle + totalPersonal;
  const current = totalEarned - totalUsed;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setTxt('total-battle-chouai', totalBattle);
  setTxt('total-personal-chouai', totalPersonal);
  setTxt('total-earned-chouai', totalEarned);
  setTxt('total-used-chouai', totalUsed);

  const currentSpan = document.getElementById('current-chouai');
  if (currentSpan) {
    currentSpan.textContent = current;
    currentSpan.style.color = current < 0 ? '#ff4444' : '#88ffff';
  }
}

// --- 保存・読込 ---
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
    mem: getVal('mem'),
    act: getVal('act'),
    fav: getVal('fav'),
    tr: getVal('tr'),
    chouaiWep: getVal('chouai-wep'),
    chouaiMut: getVal('chouai-mut'),
    chouaiCyb: getVal('chouai-cyb'),
    bonus: document.querySelector('input[name="bonus"]:checked')?.value || 'wep',
    skills: [],
    parts: [],
    list: [],
    history: [],
    chouaiUses: []
  };

  // スキル
  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    data.skills.push({
      category: tr.querySelector('input')?.value || '',
      name: tr.querySelector('select')?.value || '',
      memo: tr.querySelector('textarea')?.value || ''
    });
  });

  // 未練
  document.querySelectorAll('#list tr').forEach(tr => {
    const inputs = tr.querySelectorAll('input');
    if (inputs.length >= 3) {
      data.list.push({ target: inputs[0].value, emotion: inputs[1].value, madness: inputs[2].value });
    }
  });

  // 履歴
  document.querySelectorAll('#session-history-tbody tr').forEach(tr => {
    data.history.push({
      scenario: tr.querySelector('.h-scenario')?.value || '',
      battle: tr.querySelector('.battle-pts')?.value || 0,
      personal: tr.querySelector('.personal-pts')?.value || 0,
      memo: tr.querySelector('.h-memo')?.value || ''
    });
  });

  // 使い道
  document.querySelectorAll('#chouai-use-tbody tr').forEach(tr => {
    data.chouaiUses.push({
      used: tr.querySelector('.used-pts')?.value || 0,
      memo: tr.querySelector('.use-memo')?.value || ''
    });
  });

  return data;
}

function saveData() {
  const data = getFullData();
  localStorage.setItem('necro_sheet', JSON.stringify(data));
  alert('ブラウザに保存しました');
}

function loadData() {
  const json = localStorage.getItem('necro_sheet');
  if (!json) return alert('保存されたデータがありません');
  const data = JSON.parse(json);
  applyData(data);
  alert('データを読み込みました');
}

function applyData(data) {
  const setVal = (id, val) => {
    if (document.getElementById(id)) document.getElementById(id).value = val || '';
  };

  setVal('pl', data.pl);
  setVal('name', data.name);
  setVal('pos', data.pos || 'アリス');
  setVal('mc', data.mc || 'ロマネスク');
  setVal('sc', data.sc || 'ロマネスク');
  setVal('age', data.age);
  setVal('ps', data.ps);
  setVal('mem', data.mem);
  setVal('act', data.act || '9');
  setVal('fav', data.fav || '0');
  setVal('tr', data.tr);
  setVal('chouai-wep', data.chouaiWep || '0');
  setVal('chouai-mut', data.chouaiMut || '0');
  setVal('chouai-cyb', data.chouaiCyb || '0');

  if (data.bonus) {
    const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
    if (radio) radio.checked = true;
  }

  onClassChange();

  // スキル復元
  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills) data.skills.forEach(s => addSkillRow(s.category, s.name, s.memo));
  }

  // 未練復元
  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list) data.list.forEach(l => addRow(l.target, l.emotion, l.madness));
  }

  // 履歴復元
  const historyTbody = document.getElementById('session-history-tbody');
  if (historyTbody) {
    historyTbody.innerHTML = '';
    if (data.history) data.history.forEach(h => addSessionHistoryRow(h.scenario, h.battle, h.personal, h.memo));
  }

  // 使い道復元
  const useTbody = document.getElementById('chouai-use-tbody');
  if (useTbody) {
    useTbody.innerHTML = '';
    if (data.chouaiUses) data.chouaiUses.forEach(u => addChouaiUseRow(u.used, u.memo));
  }

  calcTotals();
}

function exportJSON() {
  const data = getFullData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (data.name || 'necro_character') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

// --- テキスト出力（クリップボードコピー） ---
function exportForHokanshoText() {
  const getVal = id => document.getElementById(id)?.value || '';
  const name = getVal('name') || '無名';
  const pl = getVal('pl') || '未設定';
  const pos = getVal('pos');
  const mc = getVal('mc');
  const sc = getVal('sc');
  const age = getVal('age');
  const ps = getVal('ps');

  let text = `【ドール名】${name}\n`;
  text += `【PL名】${pl}\n`;
  text += `【ポジション】${pos} / 【メイン】${mc} / 【サブ】${sc}\n`;
  text += `【年齢】${age} / 【暗示】${ps}\n`;
  text += `----------------------------------------\n`;
  text += `■ スキル\n`;

  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const category = tr.querySelector('input')?.value || '';
    const skillName = tr.querySelector('select')?.value || '';
    const memo = tr.querySelector('textarea')?.value || '';
    if (skillName) {
      text += `・[${category}] ${skillName} : ${memo}\n`;
    }
  });

  text += `----------------------------------------\n`;

  navigator.clipboard.writeText(text).then(() => {
    alert('保管所・メモ貼り付け用のテキストをクリップボードにコピーしました！');
  }).catch(err => {
    alert('コピーに失敗しました: ' + err);
  });
}

function exportCcfolia() {
  alert('ココフォリア出力機能は現在準備中のため、まだご利用いただけません。');
}

// --- 初期化 ---
window.onload = function() {
  onClassChange();
};