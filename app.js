const LIMIT_TABLE_DATA = [
  { lv1: 1, lv2: 0, lv3: 0 }, { lv1: 1, lv2: 1, lv3: 0 }, { lv1: 1, lv2: 1, lv3: 1 },
  { lv1: 2, lv2: 1, lv3: 1 }, { lv1: 2, lv2: 2, lv3: 1 }, { lv1: 2, lv2: 2, lv3: 2 },
  { lv1: 3, lv2: 2, lv3: 2 }, { lv1: 3, lv2: 3, lv3: 2 }, { lv1: 3, lv2: 3, lv3: 3 }
];

const STORAGE_KEY = 'necro_dolls_list';

function applyData(data) {
  const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };



function getLimitByVal(val) {
  if (val < 1) return { lv1: 0, lv2: 0, lv3: 0 };
  return LIMIT_TABLE_DATA[Math.min(val, 9) - 1];
}

// オプションのHTML生成用ヘルパー関数（重複防止・共通化）
function generateOptionGroup(list, maxAllowedMap, prefix, label) {
  let groupHtml = '';
  list.forEach((p, idx) => {
    const allowed = maxAllowedMap[p.type]?.[p.level] || 0;
    if (allowed > 0) {
      const isExists = isPartAlreadyExists(p.name);
      const disabledAttr = isExists ? 'disabled' : '';
      const nameText = isExists ? \${p.name} (選択済み)` : p.name;`
      groupHtml += \<option value="${prefix}_${idx}" ${disabledAttr}>[${p.type} Lv${p.level}] ${nameText}`;`
    }
  });
  return groupHtml ? `<optgroup label="${label}">${groupHtml}</optgroup>` : '';
}

function updateExtraPartOptions() {
  const totalWep = parseInt(document.getElementById('total-wep').textContent, 10) || 0;
  const totalMut = parseInt(document.getElementById('total-mut').textContent, 10) || 0;
  const totalCyb = parseInt(document.getElementById('total-cyb').textContent, 10) || 0;

  let hasClockwork = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '時計仕掛け');

  const limitWep = getLimitByVal(totalWep);
  const limitMut = getLimitByVal(totalMut);
  const limitCyb = getLimitByVal(totalCyb);

  const maxAllowedMap = {
    '武装': { 1: limitWep.lv1, 2: limitWep.lv2, 3: limitWep.lv3 },
    '変異': { 1: limitMut.lv1, 2: limitMut.lv2, 3: limitMut.lv3 },
    '改造': { 1: limitCyb.lv1, 2: limitCyb.lv2, 3: limitCyb.lv3 }
  };

  if (hasClockwork) maxAllowedMap['改造'][3] += 1;

  const sections = [
    { id: 'head', title: '頭部' }, { id: 'arm', title: '腕部' },
    { id: 'body', title: '胴部' }, { id: 'leg', title: '脚部' }
  ];

  sections.forEach(sec => {
    const secDiv = document.getElementById(`parts-tbody-${sec.id}`)?.closest('div.table-scroll')?.nextElementSibling;
    const selectElem = secDiv ? secDiv.querySelector('.add-part-select') : null;
    if (!selectElem) return;

    let optionsHtml = `<option value="">+ 【${sec.title}】にパーツを選択して追加...</option>`;

    if (EXTRA_PARTS_DB[sec.id]) {
      optionsHtml += generateOptionGroup(EXTRA_PARTS_DB[sec.id], maxAllowedMap, sec.id, `【${sec.title}専用パーツ】`);
    }
    if (COMMON_EXTRA_PARTS.length > 0) {
      optionsHtml += generateOptionGroup(COMMON_EXTRA_PARTS, maxAllowedMap, 'common', '【共通・汎用パーツ】');
    }

    optionsHtml += `<option value="custom">-- 自由入力枠を追加 --</option>`;
    selectElem.innerHTML = optionsHtml;
  });
}

// --- パーツエリアの動的生成 ---
function renderPartsContainer() {
  const container = document.getElementById('parts-container');
  if (!container) return;
  container.innerHTML = '';

  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
  const sections = [
    { id: 'head', title: '頭部' }, { id: 'arm', title: '腕部' },
    { id: 'body', title: '胴部' }, { id: 'leg', title: '脚部' }
  ];

  sections.forEach(sec => {
    const secDiv = document.createElement('div');
    secDiv.innerHTML = `
      <div class="part-header">
        <span>【${sec.title}】</span>
        <span class="val">基本パーツ / 追加パーツ</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th style="width:5%;">損</th><th style="width:12%;">配置部位</th>
              <th style="width:18%;">パーツ名</th><th style="width:10%;">分類</th>
              <th style="width:8%;">Lv</th><th style="width:10%;">タイミング</th>
              <th style="width:8%;">コスト</th><th style="width:8%;">射程</th>
              <th>効果メモ</th><th style="width:6%;">操作</th>
            </tr>
          </thead>
          <tbody id="parts-tbody-${sec.id}"></tbody>
        </table>
      </div>
      <div style="margin-top:6px;">
        <select class="add-part-select" onchange="onExtraPartSelect('${sec.id}', this)">
          <option value="">+ 【${sec.title}】にパーツを選択して追加...</option>
        </select>
      </div>
    `;
    container.appendChild(secDiv);

    const tbody = secDiv.querySelector(`#parts-tbody-${sec.id}`);
    const currentLocName = locMap[sec.id] || '頭部';

    if (typeof DEFAULT_PARTS !== 'undefined' && DEFAULT_PARTS[sec.id]) {
      DEFAULT_PARTS[sec.id].forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo || '', false, currentLocName);
      });
    }
  });

  updateExtraPartOptions();
}

function isPartAlreadyExists(partName) {
  if (!partName || partName === '新規パーツ') return false;
  return Array.from(document.querySelectorAll('#parts-container .p-name')).some(input => input.value.trim() === partName.trim());
}

function onExtraPartSelect(secId, selectElem) {
  const val = selectElem.value;
  if (!val) return;

  const tbody = document.getElementById(`parts-tbody-${secId}`);
  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
  const currentLocName = locMap[secId] || '頭部';

  let partData = null;

  if (val === 'custom') {
    partData = { name: '新規パーツ', type: '武装', level: 1, timing: 'アクション', cost: '1', range: '0', memo: '', isEditable: true };
  } else if (val.startsWith('common_')) {
    const p = COMMON_EXTRA_PARTS[parseInt(val.split('_')[1], 10)];
    if (p) partData = { ...p, memo: p.memo || '', isEditable: false };
  } else if (val.startsWith(secId + '_')) {
    const p = EXTRA_PARTS_DB[secId][parseInt(val.split('_')[1], 10)];
    if (p) partData = { ...p, memo: p.memo || '', isEditable: false };
  }

  if (partData) {
    if (partData.name !== '新規パーツ' && isPartAlreadyExists(partData.name)) {
      alert(`「${partData.name}」はすでに配置されています。重複して取得することはできません。`);
      selectElem.value = '';
      return;
    }
    addPartRow(tbody, partData.name, partData.type, partData.level, partData.timing, partData.cost, partData.range, partData.memo, partData.isEditable, currentLocName);
  }
  selectElem.value = '';
}

function addPartRow(tbody, name, type, level, timing, cost, range, memo, isEditable, defaultLoc = '頭部') {
  const tr = document.createElement('tr');
  const readOnlyAttr = isEditable ? '' : 'readonly';
  const disabledAttr = isEditable ? '' : 'disabled';

  const locations = ['頭部', '腕部', '胴部', '脚部', '任意・その他'];
  const locOptions = locations.map(loc => `<option value="${loc}" ${loc === defaultLoc ? 'selected' : ''}>${loc}</option>`).join('');

  tr.innerHTML = `
    <td><input type="checkbox" onchange="togglePartBreak(this)"></td>
    <td><select class="p-location" style="padding:2px;font-size:0.75rem;">${locOptions}</select></td>
    <td><input type="text" value="${name}" class="p-name" ${readOnlyAttr}></td>
    <td>
      <select class="p-type" ${disabledAttr} onchange="calcTotals()">
        $['基本','武装','変異','改造'].map(t => `<option ${type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" value="${level}" min="1" max="3" class="p-level" ${disabledAttr} onchange="calcTotals()"></td>
    <td><input type="text" value="${timing}" class="p-timing" ${readOnlyAttr}></td>
    <td><input type="text" value="${cost}" class="p-cost" ${readOnlyAttr}></td>
    <td><input type="text" value="${range}" class="p-range" ${readOnlyAttr}></td>
    <td><textarea class="p-memo" ${readOnlyAttr}>${memo}</textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove(); calcTotals();">X</button></td>
  `;
  tbody.appendChild(tr);
  calcTotals();
}

function togglePartBreak(checkbox) {
  checkbox.closest('tr').classList.toggle('broken', checkbox.checked);
}

function resetUsed() {
  document.querySelectorAll('#parts-container tr input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('tr').classList.remove('broken');
  });
}

function onClassChange() {
  const mc = document.getElementById('mc')?.value || '';
  const sc = document.getElementById('sc')?.value || '';
  const mcParts = (typeof CLASS_PARTS !== 'undefined' && CLASS_PARTS[mc]) || [0,0,2];
  const scParts = (typeof CLASS_PARTS !== 'undefined' && CLASS_PARTS[sc]) || [0,0,2];

  ['wep', 'mut', 'cyb'].forEach((key, idx) => {
    if (document.getElementById(`mc-${key}`)) document.getElementById(`mc-${key}`).textContent = mcParts[idx];
    if (document.getElementById(`sc-${key}`)) document.getElementById(`sc-${key}`).textContent = scParts[idx];
  });

  calcTotals();
}

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

  const currentCounts = { '武装': {1:0, 2:0, 3:0}, '変異': {1:0, 2:0, 3:0}, '改造': {1:0, 2:0, 3:0} };

  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const type = tr.querySelector('.p-type')?.value;
    const lv = parseInt(tr.querySelector('.p-level')?.value, 10);
    if (currentCounts[type] && currentCounts[type][lv] !== undefined) {
      currentCounts[type][lv]++;
    }
  });

// スキル選択状態を取得（「時計仕掛け」と「業躯」）
const hasClockwork = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '時計仕掛け');
const hasGouku = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '業躯');

const categories = [
  { name: '武装', total: totals.wep, key: 'wep' },
  { name: '変異', total: totals.mut, key: 'mut' },
  { name: '改造', total: totals.cyb, key: 'cyb' }
];

const limitTbody = document.getElementById('limit-tbody');
if (limitTbody) { limitTbody.innerHTML = ''; }

categories.forEach(cat => {
  const limit = (typeof getLimitByVal === 'function') ? getLimitByVal(cat.total) : { lv1:0, lv2:0, lv3:0 };
  [1, 2, 3].forEach(lv => {
    const baseLimit = limit[`lv${lv}`] || 0;
    
    // ボーナス適用判定：改造Lv3(時計仕掛け) または 変異Lv3(業躯)
    let autoBonus = 0;
    if (cat.name === '改造' && lv === 3 && hasClockwork) {
      autoBonus = 1;
    } else if (cat.name === '変異' && lv === 3 && hasGouku) {
      autoBonus = 1;
    }

    const maxAllowed = baseLimit + autoBonus;
    const current = (currentCounts[cat.name] && currentCounts[cat.name][lv]) || 0;
    
      const usedSpan = document.getElementById(`used-${cat.key}-lv${lv}`);
      const maxSpan = document.getElementById(`max-${cat.key}-lv${lv}`);
      if (usedSpan) usedSpan.textContent = current;
      if (maxSpan) {
        maxSpan.textContent = maxAllowed;
        maxSpan.style.color = current > maxAllowed ? '#ff8888' : '#8ff';
        maxSpan.style.fontWeight = 'bold';
      }

      let statusHtml = `<span style="color:#aaa;">${current}/${maxAllowed}</span>`;
      if (current > maxAllowed) {
        statusHtml = `<span class="limit-ng" style="color:#ff6666; font-weight:bold;">超過 (${current}/${maxAllowed})</span>`;
      } else if (current > 0) {
        statusHtml = `<span class="limit-selected" style="color:#88ff88;">OK (${current}/${maxAllowed})</span>`;
      }

      if (limitTbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${cat.name}</b> (総${cat.total})</td>
          <td>Lv ${lv}</td>
          <td>${maxAllowed} 個</td>
          <td><b>${current}</b> 個</td>
          <td>${statusHtml}</td>
        `;
        limitTbody.appendChild(tr);
      }
    });
  });

  if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
}

function addRow(target = '', emotion = '', madness = 0) {
  const tbody = document.getElementById('list');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}"></td>
    <td><input type="text" value="${emotion}"></td>
    <td><input type="number" value="${madness}" min="0"></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">X</button></td>
  `;
  tbody.appendChild(tr);
}

function updateSkillOptions() {
  const selectedSkills = new Set(Array.from(document.querySelectorAll('#skill-tbody select')).map(s => s.value).filter(Boolean));

  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const select = tr.querySelector('select');
    if (!select) return;
    const category = tr.querySelector('input')?.value || '';
    const currentValue = select.value;

    let optionsHtml = '<option value="">-- スキルを選択 --</option>';
    if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
      SKILL_DATABASE[category].forEach(s => {
        const isSelectedByOther = selectedSkills.has(s.name) && s.name !== currentValue;
        const disabledAttr = isSelectedByOther ? 'disabled' : '';
        const labelText = isSelectedByOther ? `${s.name} (選択済み)` : s.name;
        optionsHtml += `<option value="${s.name}" ${s.name === currentValue ? 'selected' : ''} ${disabledAttr}>${labelText}</option>`;
      });
    }
    select.innerHTML = optionsHtml;
  });
}

function addSkillRow(category, skillName = '', memo = '') {
  const tbody = document.getElementById('skill-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${category}" readonly style="background:#1e1e24;color:#ccc;border:none;"></td>
    <td><select onchange="onSkillSelect(this)"><option value="">-- スキルを選択 --</option></select></td>
    <td><textarea style="height:38px;">${memo}</textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove(); calcTotals(); updateSkillOptions();">X</button></td>
  `;
  tbody.appendChild(tr);

  if (skillName) tr.querySelector('select').value = skillName;
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
  } else if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
    const found = SKILL_DATABASE[category].find(s => s.name === skillName);
    if (found) textarea.value = found.memo || '';
  }

  updateSkillOptions();
  calcTotals();
}

// --- 1. セッション履歴（獲得）の行追加 ---
function addSessionHistoryRow(scenario = '', battle = 0, personal = 0, memo = '') {
  const tbody = document.getElementById('session-history-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-scenario" value="${scenario}" placeholder="例: 狂い咲く薔薇" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="battle-pts" value="${battle}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="personal-pts" value="${personal}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-memo" value="${memo}" placeholder="例: 2026/05/10 通過" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" onclick="this.closest('tr').remove(); calcChouaiTotals();" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
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
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="used-pts" value="${used}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #ff88c2; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="use-memo" value="${memo}" placeholder="例: 武装基本値+1、基本パーツ修復" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" onclick="this.closest('tr').remove(); calcChouaiTotals();" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
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
    currentSpan.style.color = current < 0 ? '#ff4444' : '#8ff';
  }
}

// --- 保存・読込（モーダル管理） ---

// --- 定数・共通ヘルパー関数の補完 ---
const STORAGE_KEY = 'necro_dolls_list';

function getAllDolls() {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : {};
}

function closeModals() {
  const saveModal = document.getElementById('save-modal');
  const loadModal = document.getElementById('load-modal');
  if (saveModal) saveModal.style.display = 'none';
  if (loadModal) loadModal.style.display = 'none';
}

// ------------------------------------------
// 1. 保存処理
// ------------------------------------------

function openSaveModal() {
  const select = document.getElementById('save-doll-select');
  if (!select) return;
  const dolls = getAllDolls();
  const currentName = document.getElementById('name')?.value || '無名ドール';

  // オプションリセット
  select.innerHTML = `<option value="">✨ 新規保存（「${currentName}」として追加）</option>`;

  // 既存のドールを上書き選択肢としてリストに追加
  Object.keys(dolls).forEach(id => {
    const doll = dolls[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `🔄 上書き: ${doll.name || '無名ドール'} (${doll.pos || '無職'})`;
    select.appendChild(option);
  });

  const modal = document.getElementById('save-modal');
  if (modal) modal.style.display = 'flex';
}

function confirmSave() {
  const select = document.getElementById('save-doll-select');
  const selectedId = select ? select.value : '';
  
  const data = getFullData();
  const dollId = selectedId || ('doll_' + Date.now());
  data.id = dollId;

  const dolls = getAllDolls();
  dolls[dollId] = data;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dolls));
  closeModals();
  alert(`「${data.name || '無名ドール'}」を保存しました！`);
}

// ------------------------------------------
// 2. 読み込み・削除処理
// ------------------------------------------

function openLoadModal() {
  const select = document.getElementById('load-doll-select');
  if (!select) return;
  const dolls = getAllDolls();
  const keys = Object.keys(dolls);

  if (keys.length === 0) {
    return alert('ブラウザに保存されたドールデータがありません。');
  }

  // オプションリセット
  select.innerHTML = '<option value="">-- ドールを選択してください --</option>';

  keys.forEach(id => {
    const doll = dolls[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${doll.name || '無名ドール'} (ポジション: ${doll.pos || 'なし'} / PL: ${doll.pl || '未設定'})`;
    select.appendChild(option);
  });

  const modal = document.getElementById('load-modal');
  if (modal) modal.style.display = 'flex';
}

function confirmLoad() {
  const select = document.getElementById('load-doll-select');
  const dollId = select ? select.value : '';

  if (!dollId) {
    return alert('読み込むドールを選択してください。');
  }

  const dolls = getAllDolls();
  const data = dolls[dollId];

  if (data) {
    applyData(data);
    closeModals();
    alert(`「${data.name || '無名ドール'}」を読み込みました！`);
  }
}

function confirmDelete() {
  const select = document.getElementById('load-doll-select');
  const dollId = select ? select.value : '';

  if (!dollId) {
    return alert('削除するドールを選択してください。');
  }

  const dolls = getAllDolls();
  const targetName = dolls[dollId]?.name || '無名ドール';

  if (!confirm(`本当に「${targetName}」を削除しますか？`)) {
    return;
  }

  delete dolls[dollId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dolls));
  closeModals();
  alert(`「${targetName}」を削除しました。`);
}

// ------------------------------------------
// データ構造・復元処理
// ------------------------------------------

function getFullData() {
  const getVal = id => document.getElementById(id)?.value || '';

  return {
    pl: getVal('pl'),
    name: getVal('name'),
    pos: getVal('pos'),
    mc: getVal('mc'),
    sc: getVal('sc'),
    age: getVal('age'),
    ps: getVal('ps'),
    hint: getVal('hint'),
    mem: getVal('mem'),
    act: getVal('act'),
    fav: getVal('fav'),
    tr: getVal('tr'),
    chouaiWep: getVal('chouai-wep'),
    chouaiMut: getVal('chouai-mut'),
    chouaiCyb: getVal('chouai-cyb'),
    // 全角引用符を半角に修復
    bonus: document.querySelector('input[name="bonus"]:checked')?.value || 'wep',
    skills: Array.from(document.querySelectorAll('#skill-tbody tr')).map(tr => ({
      category: tr.querySelector('input')?.value || tr.children[0]?.textContent || '',
      name: tr.querySelector('select')?.value || tr.querySelector('input[type="text"]')?.value || '',
      memo: tr.querySelector('textarea')?.value || ''
    })),
    parts: Array.from(document.querySelectorAll('#parts-container tr')).filter(tr => tr.querySelector('.p-name')?.value).map(tr => ({
      isBroken: tr.querySelector('input[type="checkbox"]')?.checked || false,
      location: tr.querySelector('.p-location')?.value || '',
      name: tr.querySelector('.p-name')?.value || '',
      type: tr.querySelector('.p-type')?.value || '基本',
      level: tr.querySelector('.p-level')?.value || '1',
      timing: tr.querySelector('.p-timing')?.value || '',
      cost: tr.querySelector('.p-cost')?.value || '',
      range: tr.querySelector('.p-range')?.value || '',
      memo: tr.querySelector('.p-memo')?.value || '',
      isEditable: !tr.querySelector('.p-name')?.hasAttribute('readonly')
    })),
    list: Array.from(document.querySelectorAll('#list tr')).map(tr => {
      const inputs = tr.querySelectorAll('input');
      return inputs.length >= 3 ? { target: inputs[0].value, emotion: inputs[1].value, madness: inputs[2].value } : null;
    }).filter(Boolean),
    history: Array.from(document.querySelectorAll('#session-history-tbody tr')).map(tr => ({
      scenario: tr.querySelector('.h-scenario')?.value || '',
      battle: tr.querySelector('.battle-pts')?.value || 0,
      personal: tr.querySelector('.personal-pts')?.value || 0,
      memo: tr.querySelector('.h-memo')?.value || ''
    })),
    chouaiUses: Array.from(document.querySelectorAll('#chouai-use-tbody tr')).map(tr => ({
      used: tr.querySelector('.used-pts')?.value || 0,
      memo: tr.querySelector('.use-memo')?.value || ''
    }))
  };
}

function applyData(data) {
  const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };

  setVal('pl', data.pl); setVal('name', data.name);
  setVal('pos', data.pos || 'アリス'); setVal('mc', data.mc || 'ロマネスク'); setVal('sc', data.sc || 'ロマネスク');
  setVal('age', data.age); setVal('ps', data.ps || '煉獄');
  setVal('hint', data.hint); setVal('mem', data.mem);
  setVal('act', data.act || '9'); setVal('fav', data.fav || '0'); setVal('tr', data.tr);
  setVal('chouai-wep', data.chouaiWep || '0'); setVal('chouai-mut', data.chouaiMut || '0'); setVal('chouai-cyb', data.chouaiCyb || '0');

  if (data.bonus) {
    const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
    if (radio) radio.checked = true;
  }

  if (typeof onClassChange === 'function') onClassChange();

  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills && typeof addSkillRow === 'function') {
      data.skills.forEach(s => addSkillRow(s.category, s.name, s.memo));
    }
  }

  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list && typeof addRow === 'function') {
      data.list.forEach(l => addRow(l.target, l.emotion, l.madness));
    }
  }

  const historyTbody = document.getElementById('session-history-tbody');
  if (historyTbody) {
    historyTbody.innerHTML = '';
    if (data.history && typeof addSessionHistoryRow === 'function') {
      data.history.forEach(h => addSessionHistoryRow(h.scenario, h.battle, h.personal, h.memo));
    }
  }

  const useTbody = document.getElementById('chouai-use-tbody');
  if (useTbody) {
    useTbody.innerHTML = '';
    if (data.chouaiUses && typeof addChouaiUseRow === 'function') {
      data.chouaiUses.forEach(u => addChouaiUseRow(u.used, u.memo));
    }
  }

  if (typeof calcTotals === 'function') calcTotals();
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

window.onload = function() {
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  if (typeof onClassChange === 'function') onClassChange();
};