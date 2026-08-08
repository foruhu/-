function getLimitByVal(val) {
  if (val < 1) return { lv1: 0, lv2: 0, lv3: 0 };
  return LIMIT_TABLE_DATA[Math.min(val, 9) - 1];
}

// オプションのHTML生成用ヘルパー関数（重複防止・共通化）
function generateOptionGroup(list, remainingMap, prefix, label) {
  let groupHtml = '';
  list.forEach((p, idx) => {
    const remaining = remainingMap[p.type]?.[p.level] ?? 0;
    const isExists = isPartAlreadyExists(p.name);

    // 種別・レベルの上限に達している（かつ未配置の）パーツは一覧に出さない
    if (remaining <= 0 && !isExists) return;

    const disabledAttr = isExists ? 'disabled' : '';
    const nameText = isExists ? `${p.name} (選択済み)` : p.name;
    groupHtml += `<option value="${prefix}_${idx}" ${disabledAttr}>[${p.type} Lv${p.level}] ${nameText}</option>`;
  });
  return groupHtml ? `<optgroup label="${label}">${groupHtml}</optgroup>` : '';
}

function updateExtraPartOptions() {
  const totalWep = parseInt(document.getElementById('total-wep').textContent, 10) || 0;
  const totalMut = parseInt(document.getElementById('total-mut').textContent, 10) || 0;
  const totalCyb = parseInt(document.getElementById('total-cyb').textContent, 10) || 0;

  const hasClockwork = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '時計仕掛け');
  const hasGouku = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '業躯');

  const limitWep = getLimitByVal(totalWep);
  const limitMut = getLimitByVal(totalMut);
  const limitCyb = getLimitByVal(totalCyb);

  const maxAllowedMap = {
    '武装': { 1: limitWep.lv1, 2: limitWep.lv2, 3: limitWep.lv3 },
    '変異': { 1: limitMut.lv1, 2: limitMut.lv2, 3: limitMut.lv3 },
    '改造': { 1: limitCyb.lv1, 2: limitCyb.lv2, 3: limitCyb.lv3 }
  };

  if (hasClockwork) maxAllowedMap['改造'][3] += 1;
  if (hasGouku) maxAllowedMap['変異'][3] += 1;

  // 種別・レベルごとの現在の配置数を集計
  const currentCounts = { '武装': {1:0,2:0,3:0}, '変異': {1:0,2:0,3:0}, '改造': {1:0,2:0,3:0} };
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const type = tr.querySelector('.p-type')?.value;
    const lv = parseInt(tr.querySelector('.p-level')?.value, 10);
    if (currentCounts[type] && currentCounts[type][lv] !== undefined) {
      currentCounts[type][lv]++;
    }
  });

  // 残り枠数（＝実際に選択できる数）を算出
  const remainingMap = { '武装': {}, '変異': {}, '改造': {} };
  ['武装', '変異', '改造'].forEach(type => {
    [1, 2, 3].forEach(lv => {
      remainingMap[type][lv] = (maxAllowedMap[type][lv] || 0) - (currentCounts[type][lv] || 0);
    });
  });

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
      optionsHtml += generateOptionGroup(EXTRA_PARTS_DB[sec.id], remainingMap, sec.id, `【${sec.title}専用パーツ】`);
    }
    if (COMMON_EXTRA_PARTS.length > 0) {
      optionsHtml += generateOptionGroup(COMMON_EXTRA_PARTS, remainingMap, 'common', '【共通・汎用パーツ】');
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
        ${['基本','武装','変異','改造'].map(t => `<option ${type===t?'selected':''}>${t}</option>`).join('')}
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

  // 選択肢一覧を先に生成してから値をセットする（順序を逆にすると保存データの選択状態が復元されない）
  updateSkillOptions();
  if (skillName) tr.querySelector('select').value = skillName;
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
    hint: getVal('hint'),
    mem: getVal('mem'),
    act: getVal('act'),
    fav: getVal('fav'),
    tr: getVal('tr'),
    chouaiWep: getVal('chouai-wep'),
    chouaiMut: getVal('chouai-mut'),
    chouaiCyb: getVal('chouai-cyb'),
    bonus: document.querySelector('input[name="bonus"][value]:checked')?.value || 'wep',
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

  // パーツ
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const name = tr.querySelector('.p-name')?.value;
    if (name) {
      data.parts.push({
        isBroken: tr.querySelector('input[type="checkbox"]')?.checked || false,
        location: tr.querySelector('.p-location')?.value || '',
        name: name,
        type: tr.querySelector('.p-type')?.value || '基本',
        level: tr.querySelector('.p-level')?.value || '1',
        timing: tr.querySelector('.p-timing')?.value || '',
        cost: tr.querySelector('.p-cost')?.value || '',
        range: tr.querySelector('.p-range')?.value || '',
        memo: tr.querySelector('.p-memo')?.value || '',
        isEditable: !tr.querySelector('.p-name')?.hasAttribute('readonly')
      });
    }
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
      data: data
    };
  }

  setSavedSheets(sheets);
  refreshSaveSlotOptions(id);
  alert('ブラウザに保存しました');
}

function loadData() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('読み込むキャラクターを「保存済みキャラクター」から選択してください');

  const sheets = getSavedSheets();
  const entry = sheets[id];
  if (!entry) return alert('データが見つかりませんでした');

  applyData(entry.data);
  alert(`「${entry.name}」を読み込みました`);
}

function deleteSelectedSave() {
  const select = document.getElementById('save-slot');
  const id = select ? select.value : '';
  if (!id) return alert('削除するキャラクターを「保存済みキャラクター」から選択してください');

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
  setVal('hint', data.hint); setVal('mem', data.mem);
  setVal('act', data.act || '9'); setVal('fav', data.fav || '0'); setVal('tr', data.tr);
  setVal('chouai-wep', data.chouaiWep || '0'); setVal('chouai-mut', data.chouaiMut || '0'); setVal('chouai-cyb', data.chouaiCyb || '0');

  if (data.bonus) {
    const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
    if (radio) radio.checked = true;
  }

  onClassChange();

  // スキルの復元
  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills) {
      data.skills.forEach(s => addSkillRow(s.category, s.name, s.memo));
    }
  }

  // パーツ（武装・変異・改造など）の復元
  restorePartsFromData(data.parts);

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
// 保存されたパーツ配列から、4部位（頭部/腕部/胴部/脚部）のテーブルを再構築する
// 「基本」パーツは常に固定のため保存データには頼らず毎回自動配置し、
// 武装・変異・改造などの追加パーツのみ保存データから復元する
function restorePartsFromData(parts) {
  const sectionIds = ['head', 'arm', 'body', 'leg'];
  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };

  sectionIds.forEach(secId => {
    const tbody = document.getElementById(`parts-tbody-${secId}`);
    if (!tbody) return;
    tbody.innerHTML = '';

    // 1. 基本パーツを常に固定で再配置
    if (typeof DEFAULT_PARTS !== 'undefined' && DEFAULT_PARTS[secId]) {
      DEFAULT_PARTS[secId].forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo || '', false, locMap[secId]);
      });
    }
  });

  if (!parts || !Array.isArray(parts)) {
    if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
    return;
  }

  const locToSection = { '頭部': 'head', '腕部': 'arm', '胴部': 'body', '脚部': 'leg' };

  // 2. 武装・変異・改造など「基本」以外の追加パーツのみ保存データから復元
  parts.filter(p => p.type !== '基本').forEach(p => {
    const secId = locToSection[p.location] || 'body';
    const tbody = document.getElementById(`parts-tbody-${secId}`);
    if (!tbody) return;

    addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, p.isEditable, p.location || locMap[secId]);

    if (p.isBroken) {
      const rows = tbody.querySelectorAll('tr');
      const lastRow = rows[rows.length - 1];
      const cb = lastRow ? lastRow.querySelector('input[type="checkbox"]') : null;
      if (cb) {
        cb.checked = true;
        togglePartBreak(cb);
      }
    }
  });

  if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
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

// --- キャラクター保管所・メモ貼り付け用テキスト出力 ---
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

  text += `■ 配置パーツ\n`;
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const pLoc = tr.querySelector('.p-location')?.value || '';
    const pName = tr.querySelector('.p-name')?.value || '';
    const pType = tr.querySelector('.p-type')?.value || '';
    const pLv = tr.querySelector('.p-level')?.value || '';
    const pTiming = tr.querySelector('.p-timing')?.value || '';
    const pCost = tr.querySelector('.p-cost')?.value || '';
    const pRange = tr.querySelector('.p-range')?.value || '';
    const isBroken = tr.querySelector('input[type="checkbox"]')?.checked;

    if (pName) {
      const status = isBroken ? '[破損] ' : '';
      text += `・${status}[${pLoc}] ${pName} (${pType}Lv${pLv}) / ${pTiming} / コスト:${pCost} / 射程:${pRange}\n`;
    }
  });

  navigator.clipboard.writeText(text).then(() => {
    alert('保管所・メモ貼り付け用のテキストをクリップボードにコピーしました！');
  }).catch(err => {
    alert('コピーに失敗しました: ' + err);
  });
}

function exportCcfolia() {
  alert('ココフォリア出力機能は現在準備中のため、まだご利用いただけません。');
}

// --- 他のブラウザ・端末との共有（JSONファイル / 共有コード） ---

function afterExternalLoad(data) {
  alert(`「${data.name || '(無名)'}」を読み込みました`);
  if (confirm('このブラウザにもキャラクターとして保存しますか？\n（保存すると「保存済みキャラクター」からいつでも呼び出せます）')) {
    saveData();
  }
}

function onJsonFileSelected(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      applyData(data);
      afterExternalLoad(data);
    } catch (err) {
      alert('JSONファイルの読み込みに失敗しました。ファイルの中身が正しいか確認してください。\n' + err.message);
    }
  };
  reader.onerror = function () {
    alert('ファイルの読み込みに失敗しました');
  };
  reader.readAsText(file);
  event.target.value = ''; // 同じファイルを連続で選び直せるようにリセット
}

function exportShareCode() {
  const data = getFullData();
  const json = JSON.stringify(data);
  let encoded;
  try {
    encoded = btoa(unescape(encodeURIComponent(json)));
  } catch (err) {
    alert('共有コードの作成に失敗しました: ' + err.message);
    return;
  }

  const finish = () => {
    alert(`共有コードをクリップボードにコピーしました。（${encoded.length}文字）\n\nLINEやメモ帳などに貼り付けて他の端末に送り、そちらのページで「共有コードから読み込む」に貼り付けると復元できます。`);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(encoded).then(finish).catch(() => {
      prompt('自動コピーに失敗しました。以下のコードを手動でコピーしてください：', encoded);
    });
  } else {
    prompt('以下のコードをコピーしてください：', encoded);
  }
}

function importShareCode() {
  const encoded = prompt('共有コードを貼り付けてください');
  if (!encoded) return;

  try {
    const json = decodeURIComponent(escape(atob(encoded.trim())));
    const data = JSON.parse(json);
    applyData(data);
    afterExternalLoad(data);
  } catch (err) {
    alert('共有コードの読み込みに失敗しました。コードが正しくコピーされているか確認してください。\n' + err.message);
  }
}

window.onload = function() {
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  onClassChange();
  if (typeof migrateOldSingleSave === 'function') migrateOldSingleSave();
  if (typeof refreshSaveSlotOptions === 'function') refreshSaveSlotOptions();
};
