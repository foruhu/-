// ==========================================================
// マニューバ／スキルの「カテゴリ」による行の色分け
// ==========================================================
const MANEUVER_CATEGORIES = ['', '必殺技', '補助', '妨害', '行動値増加', '攻撃', '移動', '防御', '支援'];
const MANEUVER_CATEGORY_COLORS = {
  '必殺技': '#5a1414',
  '補助': '#242a5a',
  '妨害': '#5a2440',
  '行動値増加': '#5a4014',
  '攻撃': '#155230',
  '移動': '#4a4a14',
  '防御': '#3a2450',
  '支援': '#155a5a'
};

// 効果メモの文言から、カテゴリを自動判定するためのキーワード対応表（上から順に判定）
const CATEGORY_AUTO_KEYWORDS = [
  { keywords: ['最大行動値'], category: '行動値増加' },
  { keywords: ['妨害'], category: '妨害' },
  { keywords: ['支援'], category: '支援' },
  { keywords: ['移動'], category: '移動' },
  { keywords: ['防御'], category: '防御' },
  { keywords: ['必殺'], category: '必殺技' },
  { keywords: ['肉弾', '白兵', '射撃', '砲撃'], category: '攻撃' }
];

function detectCategoryFromMemo(memoText) {
  const text = memoText || '';
  for (const rule of CATEGORY_AUTO_KEYWORDS) {
    if (rule.keywords.some(k => text.includes(k))) return rule.category;
  }
  return '';
}

function buildCategoryOptions(selected) {
  return MANEUVER_CATEGORIES.map(c =>
    `<option value="${c}" ${c === selected ? 'selected' : ''}>${c || '（未選択）'}</option>`
  ).join('');
}

// 行(tr)にカテゴリ色を反映する。selectElemを渡した場合はその場で選択値から、
// tag文字列を渡した場合は復元時などにその値で色付けする
function applyCategoryColorToRow(tr, tag) {
  if (!tr) return;
  tr.style.backgroundColor = MANEUVER_CATEGORY_COLORS[tag] || '';
}

function onManeuverCategoryChange(selectElem) {
  const tr = selectElem.closest('tr');
  applyCategoryColorToRow(tr, selectElem.value);
  markDirty();
}

// メモ欄を入力/編集した時、カテゴリが未選択（空欄）なら文言から自動再判定して色を付ける
// （すでに手動でカテゴリを選んでいる行は上書きしない）
function onManeuverMemoInput(textarea, tagSelectorClass) {
  calcActionValue();
  const tr = textarea.closest('tr');
  if (!tr) return;
  const tagSelect = tr.querySelector(tagSelectorClass);
  if (tagSelect && !tagSelect.value) {
    const detected = detectCategoryFromMemo(textarea.value);
    if (detected) {
      tagSelect.value = detected;
      applyCategoryColorToRow(tr, detected);
    }
  }
}

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
        <table class="maneuver-table">
          <thead>
            <tr>
              <th style="width:4%;">損</th><th style="width:4%;">使</th><th style="width:5%;">色</th><th style="width:9%;">配置部位</th>
              <th style="width:14%;">パーツ名</th><th style="width:7%;">分類</th>
              <th style="width:5%;">Lv</th><th style="width:8%;">タイミング</th>
              <th style="width:6%;">コスト</th><th style="width:6%;">射程</th>
              <th>効果メモ</th><th style="width:6%;" class="col-op">操作</th>
            </tr>
          </thead>
          <tbody id="parts-tbody-${sec.id}"></tbody>
        </table>
      </div>
      <div style="margin-top:6px;">
        <select class="add-part-select edit-only" onchange="onExtraPartSelect('${sec.id}', this)">
          <option value="">+ 【${sec.title}】にパーツを選択して追加...</option>
        </select>
      </div>
    `;
    container.appendChild(secDiv);

    const tbody = secDiv.querySelector(`#parts-tbody-${sec.id}`);
    const currentLocName = locMap[sec.id] || '頭部';

    if (typeof DEFAULT_PARTS !== 'undefined' && DEFAULT_PARTS[sec.id]) {
      DEFAULT_PARTS[sec.id].forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo || '', false, currentLocName, detectCategoryFromMemo(p.memo));
      });
    }
  });

  updateExtraPartOptions();
}

function isPartAlreadyExists(partName) {
  if (!partName || partName === '新規パーツ') return false;
  return Array.from(document.querySelectorAll('#parts-container .p-name')).some(input => input.value.trim() === partName.trim());
}

// 「記憶のカケラ」の1枠（テキスト入力＋削除）を作成する
function addMemoryEntry(value = '') {
  const container = document.getElementById('memory-list');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'memory-entry';
  row.style.cssText = 'display:flex; gap:6px; margin-bottom:6px; align-items:center;';
  row.innerHTML = `
    <input type="text" class="memory-value" value="${value}" style="flex:1;">
    <button type="button" class="del edit-only" onclick="removeRowWithUndo(this)" style="padding:6px 10px;">X</button>
  `;
  container.appendChild(row);
  markDirty();
}

// 「たからもの」の1エントリ（名前・内容・配置部位・操作）を作成する
function addTreasureEntry(name = '', content = '', location = '頭部') {
  const container = document.getElementById('treasure-list');
  if (!container) return;

  const locations = ['頭部', '腕部', '胴部', '脚部'];
  const locOptions = locations.map(loc => `<option value="${loc}" ${loc === location ? 'selected' : ''}>${loc}</option>`).join('');

  const div = document.createElement('div');
  div.className = 'treasure-entry';
  div.innerHTML = `
    <div class="g2">
      <div><label>たからもの名</label><input type="text" class="treasure-name" value="${name}"></div>
      <div><label>配置部位</label><select class="treasure-location">${locOptions}</select></div>
    </div>
    <label>内容（どんなものか）</label>
    <textarea class="treasure-content" rows="2">${content}</textarea>
    <div class="edit-only" style="display:flex; gap:6px; margin-top:6px;">
      <button type="button" class="sec" onclick="placeTreasureEntry(this)" style="flex:1;padding:6px;">パーツとして配置</button>
      <button type="button" class="del" onclick="removeRowWithUndo(this)" style="padding:6px 10px;">削除</button>
    </div>
  `;
  container.appendChild(div);
  markDirty();
}

// 指定した「たからもの」エントリを、選んだ部位にマニューバとして配置する（複数個配置可）
function placeTreasureEntry(button) {
  const entry = button.closest('.treasure-entry');
  if (!entry) return;

  const name = (entry.querySelector('.treasure-name')?.value || '').trim();
  const content = (entry.querySelector('.treasure-content')?.value || '').trim();
  const location = entry.querySelector('.treasure-location')?.value || '頭部';

  if (!name) {
    alert('先に「たからもの名」を入力してください');
    return;
  }

  if (isPartAlreadyExists(name)) {
    alert(`「${name}」は既に同じ名前のパーツとして配置されています。`);
    return;
  }

  const locToSection = { '頭部': 'head', '腕部': 'arm', '胴部': 'body', '脚部': 'leg' };
  const secId = locToSection[location] || 'body';
  const tbody = document.getElementById(`parts-tbody-${secId}`);
  if (!tbody) return;

  const baseMemo = 'バトルパート終了時、狂気点を1点回復。損傷時に所持パーツから取り除く';
  const memo = content ? `${content}\n${baseMemo}` : baseMemo;

  addPartRow(tbody, name, 'たからもの', '', 'オート', '無し', '自身', memo, false, location, detectCategoryFromMemo(memo));

  alert(`「${name}」を${location}のパーツとして配置しました`);
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
    addPartRow(tbody, partData.name, partData.type, partData.level, partData.timing, partData.cost, partData.range, partData.memo, partData.isEditable, currentLocName, detectCategoryFromMemo(partData.memo));
  }
  selectElem.value = '';
}

function addPartRow(tbody, name, type, level, timing, cost, range, memo, isEditable, defaultLoc = '頭部', tag = '') {
  const tr = document.createElement('tr');
  const readOnlyAttr = isEditable ? '' : 'readonly';
  const disabledAttr = isEditable ? '' : 'disabled';

  const locations = ['頭部', '腕部', '胴部', '脚部'];
  const locOptions = locations.map(loc => `<option value="${loc}" ${loc === defaultLoc ? 'selected' : ''}>${loc}</option>`).join('');

  tr.innerHTML = `
    <td><input type="checkbox" class="p-broken" onchange="togglePartBreak(this)"></td>
    <td><input type="checkbox" class="p-used" onchange="togglePartUsed(this)"></td>
    <td><select class="p-tag" onchange="onManeuverCategoryChange(this)">${buildCategoryOptions(tag)}</select></td>
    <td><select class="p-location" style="padding:2px;font-size:0.75rem;">${locOptions}</select></td>
    <td><input type="text" value="${name}" class="p-name" ${readOnlyAttr}></td>
    <td>
      <select class="p-type" ${disabledAttr} onchange="calcTotals()">
        ${['基本','武装','変異','改造','たからもの'].map(t => `<option ${type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" value="${level}" min="1" max="3" class="p-level" ${disabledAttr} onchange="calcTotals()"></td>
    <td><input type="text" value="${timing}" class="p-timing" ${readOnlyAttr}></td>
    <td><input type="text" value="${cost}" class="p-cost" ${readOnlyAttr}></td>
    <td><input type="text" value="${range}" class="p-range" ${readOnlyAttr}></td>
    <td><textarea class="p-memo" ${readOnlyAttr} oninput="onManeuverMemoInput(this, '.p-tag')">${memo}</textarea></td>
    <td class="col-op"><button type="button" class="del" onclick="removeRowWithUndo(this, calcTotals)">X</button></td>
  `;
  tbody.appendChild(tr);
  applyCategoryColorToRow(tr, tag);
  markDirty();
  calcTotals();
}

function togglePartBreak(checkbox) {
  const tr = checkbox.closest('tr');
  const typeSelect = tr.querySelector('.p-type');
  const isTreasure = typeSelect && typeSelect.value === 'たからもの';

  if (checkbox.checked && isTreasure) {
    // Undoで壊れる前の状態に戻せるよう、一時的にチェックを外した状態でスナップショットを取ってから取り除く
    checkbox.checked = false;
    pushUndoSnapshot();
    checkbox.checked = true;

    const name = tr.querySelector('.p-name')?.value || 'たからもの';
    tr.remove();
    markDirty();
    calcTotals();
    calcActionValue();
    alert(`「${name}」は損傷したため、所持パーツから取り除かれました。`);
    return;
  }

  tr.classList.toggle('broken', checkbox.checked);
  calcActionValue();
}

// メモ欄のテキストから「最大行動値+N」の合計を抽出する
function extractActionBonus(memoText) {
  let sum = 0;
  const matches = (memoText || '').match(/最大行動値\+(\d+)/g);
  if (matches) {
    matches.forEach(m => {
      const n = parseInt(m.replace('最大行動値+', ''), 10);
      if (!isNaN(n)) sum += n;
    });
  }
  return sum;
}

// 基本行動値 ＋ 損傷していないパーツの「最大行動値+N」の合計を自動計算して反映する
function calcActionValue() {
  const baseInput = document.getElementById('act-base');
  const base = parseInt(baseInput && baseInput.value, 10) || 0;

  let bonus = 0;
  const contributions = [];
  document.querySelectorAll('#parts-container tr').forEach(tr => {
    const isBroken = tr.querySelector('.p-broken')?.checked;
    if (isBroken) return; // 損傷しているパーツの効果は反映しない
    const memo = tr.querySelector('.p-memo')?.value || '';
    const partBonus = extractActionBonus(memo);
    if (partBonus !== 0) {
      const name = tr.querySelector('.p-name')?.value || '';
      contributions.push({ name, amount: partBonus });
      bonus += partBonus;
    }
  });

  const total = base + bonus;
  const actInput = document.getElementById('act');
  if (actInput) actInput.value = total;

  const breakdownEl = document.getElementById('act-breakdown');
  if (breakdownEl) {
    const partsText = contributions
      .map(c => `+${c.name}${c.amount}`)
      .join('');
    breakdownEl.textContent = `（基本${base}${partsText}）`;
  }

  return total;
}

function togglePartUsed(checkbox) {
  checkbox.closest('tr').classList.toggle('used', checkbox.checked);
}

function resetUsed() {
  pushUndoSnapshot();
  document.querySelectorAll('#parts-container tr input.p-broken').forEach(cb => {
    cb.checked = false;
    cb.closest('tr').classList.remove('broken');
  });
  markDirty();
}

function resetPartUsedFlags() {
  pushUndoSnapshot();
  document.querySelectorAll('#parts-container tr input.p-used').forEach(cb => {
    cb.checked = false;
    cb.closest('tr').classList.remove('used');
  });
  markDirty();
}

