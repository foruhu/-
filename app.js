// ============================================================
// 永い後日談のネクロニカ キャラクターシート
// app.js 修正版
// ============================================================

const STORAGE_KEY = 'necro_dolls_data';

// ============================================================
// 基本ヘルパー
// ============================================================

function $(id) {
  return document.getElementById(id);
}

function getValue(id, defaultValue = '') {
  const el = $(id);
  return el ? el.value : defaultValue;
}

function setValue(id, value, defaultValue = '') {
  const el = $(id);
  if (el) el.value = value ?? defaultValue;
}

function getAllDolls() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    console.error('LocalStorage parsing error:', e);
    return {};
  }
}

function closeModals() {
  const saveModal = $('save-modal');
  const loadModal = $('load-modal');

  if (saveModal) saveModal.style.display = 'none';
  if (loadModal) loadModal.style.display = 'none';
}


// ============================================================
// クラス強化値
// ============================================================

function getClassParts(className) {
  if (
    typeof CLASS_PARTS !== 'undefined' &&
    CLASS_PARTS[className]
  ) {
    return CLASS_PARTS[className];
  }

  return [0, 0, 0];
}


// ============================================================
// 強化値計算
// ============================================================

function calcTotals() {
  const mc = getValue('mc');
  const sc = getValue('sc');

  const main = getClassParts(mc);
  const sub = getClassParts(sc);

  let wep = main[0] + sub[0];
  let mut = main[1] + sub[1];
  let cyb = main[2] + sub[2];

  // ボーナス
  const bonus =
    document.querySelector('input[name="bonus"]:checked')?.value;

  if (bonus === 'wep') wep++;
  if (bonus === 'mut') mut++;
  if (bonus === 'cyb') cyb++;

  // 寵愛による追加
  wep += Number(getValue('chouai-wep', 0)) || 0;
  mut += Number(getValue('chouai-mut', 0)) || 0;
  cyb += Number(getValue('chouai-cyb', 0)) || 0;

  // クラスごとの表示
  if ($('mc-wep')) $('mc-wep').textContent = main[0];
  if ($('mc-mut')) $('mc-mut').textContent = main[1];
  if ($('mc-cyb')) $('mc-cyb').textContent = main[2];

  if ($('sc-wep')) $('sc-wep').textContent = sub[0];
  if ($('sc-mut')) $('sc-mut').textContent = sub[1];
  if ($('sc-cyb')) $('sc-cyb').textContent = sub[2];

  if ($('total-wep')) $('total-wep').textContent = wep;
  if ($('total-mut')) $('total-mut').textContent = mut;
  if ($('total-cyb')) $('total-cyb').textContent = cyb;

  updatePartLimits();
  updateChouaiSummary();
}


// ============================================================
// クラス変更
// ============================================================

function onClassChange() {
  calcTotals();

  // スキル欄を現在のクラスに合わせて作り直す
  renderSkills();

  // 既存のパーツは消さずに、強化値表示だけ更新
  updatePartLimits();
}


// ============================================================
// スキル関連
// ============================================================

function getSkillDatabase(className) {
  if (
    typeof SKILL_DATABASE !== 'undefined' &&
    SKILL_DATABASE[className]
  ) {
    return SKILL_DATABASE[className];
  }

  return [];
}

function createSkillSelect(className, selectedName = '') {
  const select = document.createElement('select');

  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = 'スキルを選択';
  select.appendChild(empty);

  getSkillDatabase(className).forEach(skill => {
    const option = document.createElement('option');

    option.value = skill.name;
    option.textContent = skill.name;

    if (skill.name === selectedName) {
      option.selected = true;
    }

    select.appendChild(option);
  });

  return select;
}

function addSkillRow(category, selectedName = '', memo = '') {
  const tbody = $('skill-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');

  const tdCategory = document.createElement('td');
  tdCategory.textContent = category;

  const tdName = document.createElement('td');

  let className = '';

  if (category === 'ポジション') {
    className = getValue('pos');
  } else if (category === 'メインクラス') {
    className = getValue('mc');
  } else if (category === 'サブクラス') {
    className = getValue('sc');
  }

  const select = createSkillSelect(className, selectedName);

  select.addEventListener('change', function () {
    const db = getSkillDatabase(className);
    const skill = db.find(x => x.name === this.value);

    textarea.value = skill?.memo || '';
    updatePartLimits();
  });

  tdName.appendChild(select);

  const tdMemo = document.createElement('td');

  const textarea = document.createElement('textarea');
  textarea.className = 'skill-memo';
  textarea.rows = 2;
  textarea.value = memo || '';

  tdMemo.appendChild(textarea);

  const tdAction = document.createElement('td');

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'sec';
  remove.textContent = '削除';

  remove.onclick = function () {
    tr.remove();
    updatePartLimits();
  };

  tdAction.appendChild(remove);

  tr.appendChild(tdCategory);
  tr.appendChild(tdName);
  tr.appendChild(tdMemo);
  tr.appendChild(tdAction);

  tbody.appendChild(tr);
}

function addPosSkillRow() {
  addSkillRow('ポジション');
}

function addMcSkillRow() {
  addSkillRow('メインクラス');
}

function addScSkillRow() {
  addSkillRow('サブクラス');
}

function renderSkills() {
  const tbody = $('skill-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  // ポジションのスキルを初期表示
  const pos = getValue('pos');
  const posSkills = getSkillDatabase(pos);

  if (posSkills.length > 0) {
    addSkillRow('ポジション');
  }

  // メイン
  const mc = getValue('mc');
  const mcSkills = getSkillDatabase(mc);

  if (mcSkills.length > 0) {
    addSkillRow('メインクラス');
  }

  // サブ
  const sc = getValue('sc');
  const scSkills = getSkillDatabase(sc);

  if (scSkills.length > 0) {
    addSkillRow('サブクラス');
  }
}


// ============================================================
// スキル取得状態
// ============================================================

function hasSkill(skillName) {
  const rows = document.querySelectorAll('#skill-tbody tr');

  for (const row of rows) {
    const select = row.querySelector('select');

    if (select && select.value === skillName) {
      return true;
    }
  }

  return false;
}


// ============================================================
// パーツ関連
// ============================================================

function getBasicParts() {
  if (typeof DEFAULT_PARTS !== 'undefined') {
    return DEFAULT_PARTS;
  }

  return {
    head: [],
    arm: [],
    body: [],
    leg: []
  };
}

function getExtraParts(location) {
  if (
    typeof EXTRA_PARTS_DB !== 'undefined' &&
    EXTRA_PARTS_DB[location]
  ) {
    return EXTRA_PARTS_DB[location];
  }

  return [];
}

function getCommonExtraParts() {
  if (typeof COMMON_EXTRA_PARTS !== 'undefined') {
    return COMMON_EXTRA_PARTS;
  }

  return [];
}

function getLocationName(location) {
  const names = {
    head: '頭',
    arm: '腕',
    body: '胴',
    leg: '脚'
  };

  return names[location] || location;
}


// ============================================================
// パーツ行作成
// ============================================================

function createPartRow(part, location, editable = false) {
  const tr = document.createElement('tr');

  // 破損
  const tdBroken = document.createElement('td');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  checkbox.addEventListener('change', function () {
    tr.classList.toggle('broken', this.checked);
    updatePartLimits();
    updateChouaiSummary();
  });

  tdBroken.appendChild(checkbox);

  // 部位
  const tdLocation = document.createElement('td');

  const locationInput = document.createElement('input');
  locationInput.className = 'p-location';
  locationInput.value = getLocationName(location);
  locationInput.readOnly = true;

  tdLocation.appendChild(locationInput);

  // 名前
  const tdName = document.createElement('td');

  const nameInput = document.createElement('input');
  nameInput.className = 'p-name';
  nameInput.value = part?.name || '';

  if (!editable) {
    nameInput.readOnly = true;
  }

  tdName.appendChild(nameInput);

  // タイプ
  const tdType = document.createElement('td');

  const typeInput = document.createElement('input');
  typeInput.className = 'p-type';
  typeInput.value = part?.type || '基本';

  tdType.appendChild(typeInput);

  // Lv
  const tdLevel = document.createElement('td');

  const levelInput = document.createElement('input');
  levelInput.className = 'p-level';
  levelInput.type = 'number';
  levelInput.min = '1';
  levelInput.max = '3';
  levelInput.value = part?.level || '1';

  tdLevel.appendChild(levelInput);

  // タイミング
  const tdTiming = document.createElement('td');

  const timingInput = document.createElement('input');
  timingInput.className = 'p-timing';
  timingInput.value = part?.timing || '';

  tdTiming.appendChild(timingInput);

  // コスト
  const tdCost = document.createElement('td');

  const costInput = document.createElement('input');
  costInput.className = 'p-cost';
  costInput.value = part?.cost || '';

  tdCost.appendChild(costInput);

  // 射程
  const tdRange = document.createElement('td');

  const rangeInput = document.createElement('input');
  rangeInput.className = 'p-range';
  rangeInput.value = part?.range || '';

  tdRange.appendChild(rangeInput);

  // メモ
  const tdMemo = document.createElement('td');

  const memoInput = document.createElement('textarea');
  memoInput.className = 'p-memo';
  memoInput.rows = 2;
  memoInput.value = part?.memo || '';

  tdMemo.appendChild(memoInput);

  // 操作
  const tdAction = document.createElement('td');

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'sec';
  deleteButton.textContent = '削除';

  deleteButton.onclick = function () {
    tr.remove();
    updatePartLimits();
  };

  tdAction.appendChild(deleteButton);

  tr.appendChild(tdBroken);
  tr.appendChild(tdLocation);
  tr.appendChild(tdName);
  tr.appendChild(tdType);
  tr.appendChild(tdLevel);
  tr.appendChild(tdTiming);
  tr.appendChild(tdCost);
  tr.appendChild(tdRange);
  tr.appendChild(tdMemo);
  tr.appendChild(tdAction);

  return tr;
}


// ============================================================
// パーツコンテナ描画
// ============================================================

function renderPartsContainer() {
  const container = $('parts-container');
  if (!container) return;

  container.innerHTML = '';

  const basic = getBasicParts();

  const locations = ['head', 'arm', 'body', 'leg'];

  locations.forEach(location => {
    const section = document.createElement('div');
    section.className = 'parts-section';

    const title = document.createElement('h3');
    title.textContent = getLocationName(location);

    section.appendChild(title);

    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';

    const table = document.createElement('table');

    const thead = document.createElement('thead');

    thead.innerHTML = `
      <tr>
        <th>破損</th>
        <th>部位</th>
        <th>パーツ名</th>
        <th>種類</th>
        <th>Lv</th>
        <th>タイミング</th>
        <th>コスト</th>
        <th>射程</th>
        <th>効果</th>
        <th>操作</th>
      </tr>
    `;

    const tbody = document.createElement('tbody');
    tbody.dataset.location = location;

    const parts = basic[location] || [];

    parts.forEach(part => {
      tbody.appendChild(
        createPartRow(part, location, false)
      );
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(table);

    section.appendChild(wrapper);

    // 追加ボタン
    const addButton = document.createElement('button');

    addButton.type = 'button';
    addButton.className = 'sec';
    addButton.textContent = `+ ${getLocationName(location)}にパーツを追加`;

    addButton.style.marginTop = '4px';

    addButton.onclick = function () {
      openPartSelect(location);
    };

    section.appendChild(addButton);

    container.appendChild(section);
  });
}


// ============================================================
// パーツ追加
// ============================================================

function openPartSelect(location) {
  const db = [
    ...getExtraParts(location),
    ...getCommonExtraParts()
  ];

  if (db.length === 0) {
    addPartRow(location);
    return;
  }

  const select = document.createElement('select');

  const empty = document.createElement('option');
  empty.value = '';
  empty.textContent = '追加するパーツを選択';
  select.appendChild(empty);

  db.forEach((part, index) => {
    const option = document.createElement('option');

    option.value = String(index);
    option.textContent =
      `${part.name}（${part.type} Lv${part.level}）`;

    select.appendChild(option);
  });

  const wrapper = document.createElement('div');

  wrapper.style.marginTop = '5px';
  wrapper.style.display = 'flex';
  wrapper.style.gap = '5px';

  const addButton = document.createElement('button');

  addButton.type = 'button';
  addButton.className = 'sec';
  addButton.textContent = '追加';

  addButton.onclick = function () {
    const index = Number(select.value);

    if (!select.value) {
      alert('追加するパーツを選択してください。');
      return;
    }

    const part = db[index];

    addPartRow(location, part);

    wrapper.remove();
  };

  const cancelButton = document.createElement('button');

  cancelButton.type = 'button';
  cancelButton.className = 'sec';
  cancelButton.textContent = 'キャンセル';

  cancelButton.onclick = function () {
    wrapper.remove();
  };

  wrapper.appendChild(select);
  wrapper.appendChild(addButton);
  wrapper.appendChild(cancelButton);

  const section =
    document.querySelector(
      `.parts-section:nth-of-type(${{
        head: 1,
        arm: 2,
        body: 3,
        leg: 4
      }[location]})`
    );

  if (section) {
    section.appendChild(wrapper);
  }
}

function addPartRow(location = 'body', part = null) {
  const container = $('parts-container');
  if (!container) return;

  const sections =
    container.querySelectorAll('.parts-section');

  const indexMap = {
    head: 0,
    arm: 1,
    body: 2,
    leg: 3
  };

  const section = sections[indexMap[location]];

  if (!section) return;

  const tbody = section.querySelector('tbody');

  if (!tbody) return;

  tbody.appendChild(
    createPartRow(
      part || {
        name: '',
        type: '武装',
        level: 1,
        timing: '',
        cost: '',
        range: '',
        memo: ''
      },
      location,
      true
    )
  );

  updatePartLimits();
}


// ============================================================
// パーツ取得数計算
// ============================================================

function getPartCounts() {
  const result = {
    武装: { 1: 0, 2: 0, 3: 0 },
    変異: { 1: 0, 2: 0, 3: 0 },
    改造: { 1: 0, 2: 0, 3: 0 }
  };

  const rows =
    document.querySelectorAll('#parts-container tr');

  rows.forEach(row => {
    const type =
      row.querySelector('.p-type')?.value || '';

    const level =
      Number(row.querySelector('.p-level')?.value || 0);

    if (
      result[type] &&
      [1, 2, 3].includes(level)
    ) {
      result[type][level]++;
    }
  });

  return result;
}


// ============================================================
// レベル制限表示
// ============================================================

function getMaxValue(type, level) {
  const totalIds = {
    武装: 'total-wep',
    変異: 'total-mut',
    改造: 'total-cyb'
  };

  const total =
    Number($(totalIds[type])?.textContent || 0);

  /*
   * Lv1～Lv3の取得上限。
   *
   * 基本的には強化値を「コスト」として扱い、
   * Lv1=1、Lv2=2、Lv3=3として計算する。
   *
   * ただし画面では「現在取得数」として表示するため、
   * 各レベルの上限は総強化値をレベルで割った値を
   * 基準にする。
   */

  if (level === 1) return total;
  if (level === 2) return Math.floor(total / 2);
  if (level === 3) return Math.floor(total / 3);

  return 0;
}

function updatePartLimits() {
  const counts = getPartCounts();

  const types = [
    {
      key: '武装',
      prefix: 'wep',
      color: '#ff6b6b'
    },
    {
      key: '変異',
      prefix: 'mut',
      color: '#4dabf7'
    },
    {
      key: '改造',
      prefix: 'cyb',
      color: '#ffd43b'
    }
  ];

  types.forEach(type => {
    for (let level = 1; level <= 3; level++) {
      const used = counts[type.key][level];

      const max =
        getMaxValue(type.key, level);

      const usedEl =
        $(`used-${type.prefix}-lv${level}`);

      const maxEl =
        $(`max-${type.prefix}-lv${level}`);

      if (usedEl) {
        usedEl.textContent = used;
      }

      if (maxEl) {
        maxEl.textContent = max;
      }

      if (usedEl) {
        usedEl.style.color =
          used > max ? '#ff5555' : '';
      }
    }
  });

  renderLimitTable(counts);
}


// ============================================================
// 制限チェッカー
// ============================================================

function renderLimitTable(counts) {
  const tbody = $('limit-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  const types = ['武装', '変異', '改造'];

  types.forEach(type => {
    for (let level = 1; level <= 3; level++) {
      const tr = document.createElement('tr');

      const max = getMaxValue(type, level);
      const used = counts[type][level];

      const ok = used <= max;

      tr.innerHTML = `
        <td>${type}</td>
        <td>Lv${level}</td>
        <td>${max}</td>
        <td>${used}</td>
        <td style="color:${ok ? '#8f8' : '#f66'};font-weight:bold;">
          ${ok ? 'OK' : '超過'}
        </td>
      `;

      tbody.appendChild(tr);
    }
  });
}


// ============================================================
// 未練
// ============================================================

function addRow(target = '', emotion = '', madness = 0) {
  const tbody = $('list');
  if (!tbody) return;

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <input type="text" value="${escapeHtml(target)}">
    </td>
    <td>
      <input type="text" value="${escapeHtml(emotion)}">
    </td>
    <td>
      <input type="number" min="0" value="${Number(madness) || 0}">
    </td>
    <td>
      <button type="button" class="sec">削除</button>
    </td>
  `;

  tr.querySelector('button').onclick = function () {
    tr.remove();
    updateChouaiSummary();
  };

  tbody.appendChild(tr);
}


// ============================================================
// セッション履歴
// ============================================================

function addSessionHistoryRow(
  scenario = '',
  battle = 0,
  personal = 0,
  memo = ''
) {
  const tbody = $('session-history-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <input class="h-scenario" type="text"
        value="${escapeHtml(scenario)}">
    </td>
    <td>
      <input class="battle-pts" type="number"
        min="0" value="${Number(battle) || 0}">
    </td>
    <td>
      <input class="personal-pts" type="number"
        min="0" value="${Number(personal) || 0}">
    </td>
    <td>
      <input class="h-memo" type="text"
        value="${escapeHtml(memo)}">
    </td>
    <td>
      <button type="button" class="sec">削除</button>
    </td>
  `;

  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener(
      'input',
      updateChouaiSummary
    );
  });

  tr.querySelector('button').onclick = function () {
    tr.remove();
    updateChouaiSummary();
  };

  tbody.appendChild(tr);

  updateChouaiSummary();
}


// ============================================================
// 寵愛使用履歴
// ============================================================

function addChouaiUseRow(
  used = 0,
  memo = ''
) {
  const tbody = $('chouai-use-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');

  tr.innerHTML = `
    <td>
      <input class="used-pts" type="number"
        min="0" value="${Number(used) || 0}">
    </td>
    <td>
      <input class="use-memo" type="text"
        value="${escapeHtml(memo)}">
    </td>
    <td>
      <button type="button" class="sec">削除</button>
    </td>
  `;

  tr.querySelectorAll('input').forEach(input => {
    input.addEventListener(
      'input',
      updateChouaiSummary
    );
  });

  tr.querySelector('button').onclick = function () {
    tr.remove();
    updateChouaiSummary();
  };

  tbody.appendChild(tr);

  updateChouaiSummary();
}


// ============================================================
// 寵愛サマリー
// ============================================================

function updateChouaiSummary() {
  let battle = 0;
  let personal = 0;
  let used = 0;

  document
    .querySelectorAll('#session-history-tbody tr')
    .forEach(tr => {
      battle +=
        Number(
          tr.querySelector('.battle-pts')?.value || 0
        );

      personal +=
        Number(
          tr.querySelector('.personal-pts')?.value || 0
        );
    });

  document
    .querySelectorAll('#chouai-use-tbody tr')
    .forEach(tr => {
      used +=
        Number(
          tr.querySelector('.used-pts')?.value || 0
        );
    });

  const earned = battle + personal;
  const current = earned - used;

  if ($('total-battle-chouai')) {
    $('total-battle-chouai').textContent = battle;
  }

  if ($('total-personal-chouai')) {
    $('total-personal-chouai').textContent = personal;
  }

  if ($('total-earned-chouai')) {
    $('total-earned-chouai').textContent = earned;
  }

  if ($('total-used-chouai')) {
    $('total-used-chouai').textContent = used;
  }

  if ($('current-chouai')) {
    $('current-chouai').textContent = current;
  }
}


// ============================================================
// 破損チェック一括解除
// ============================================================

function resetUsed() {
  document
    .querySelectorAll(
      '#parts-container input[type="checkbox"]'
    )
    .forEach(cb => {
      cb.checked = false;
      cb.closest('tr')?.classList.remove('broken');
    });

  updatePartLimits();
}


// ============================================================
// HTMLエスケープ
// ============================================================

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


// ============================================================
// 全データ取得
// ============================================================

function getFullData() {
  return {
    version: 2,

    pl: getValue('pl'),
    name: getValue('name'),
    pos: getValue('pos'),
    mc: getValue('mc'),
    sc: getValue('sc'),

    age: getValue('age'),
    ps: getValue('ps'),
    hint: getValue('hint'),
    mem: getValue('mem'),

    act: getValue('act'),
    fav: getValue('fav'),
    tr: getValue('tr'),

    chouaiWep: getValue('chouai-wep'),
    chouaiMut: getValue('chouai-mut'),
    chouaiCyb: getValue('chouai-cyb'),

    bonus:
      document.querySelector(
        'input[name="bonus"]:checked'
      )?.value || 'wep',

    skills:
      Array.from(
        document.querySelectorAll('#skill-tbody tr')
      ).map(tr => ({
        category:
          tr.children[0]?.textContent?.trim() || '',

        name:
          tr.querySelector('select')?.value || '',

        memo:
          tr.querySelector('textarea')?.value || ''
      })),

    parts:
      Array.from(
        document.querySelectorAll('#parts-container tr')
      )
      .map(tr => ({
        isBroken:
          tr.querySelector(
            'input[type="checkbox"]'
          )?.checked || false,

        location:
          tr.querySelector('.p-location')?.value || '',

        name:
          tr.querySelector('.p-name')?.value || '',

        type:
          tr.querySelector('.p-type')?.value || '基本',

        level:
          tr.querySelector('.p-level')?.value || '1',

        timing:
          tr.querySelector('.p-timing')?.value || '',

        cost:
          tr.querySelector('.p-cost')?.value || '',

        range:
          tr.querySelector('.p-range')?.value || '',

        memo:
          tr.querySelector('.p-memo')?.value || '',

        isEditable:
          !tr.querySelector('.p-name')
            ?.hasAttribute('readonly')
      }))
      .filter(p => p.name),

    list:
      Array.from(
        document.querySelectorAll('#list tr')
      )
      .map(tr => {
        const inputs =
          tr.querySelectorAll('input');

        if (inputs.length < 3) {
          return null;
        }

        return {
          target: inputs[0].value,
          emotion: inputs[1].value,
          madness: inputs[2].value
        };
      })
      .filter(Boolean),

    history:
      Array.from(
        document.querySelectorAll(
          '#session-history-tbody tr'
        )
      ).map(tr => ({
        scenario:
          tr.querySelector('.h-scenario')?.value || '',

        battle:
          Number(
            tr.querySelector('.battle-pts')?.value || 0
          ),

        personal:
          Number(
            tr.querySelector('.personal-pts')?.value || 0
          ),

        memo:
          tr.querySelector('.h-memo')?.value || ''
      })),

    chouaiUses:
      Array.from(
        document.querySelectorAll(
          '#chouai-use-tbody tr'
        )
      ).map(tr => ({
        used:
          Number(
            tr.querySelector('.used-pts')?.value || 0
          ),

        memo:
          tr.querySelector('.use-memo')?.value || ''
      }))
  };
}


// ============================================================
// 保存モーダル
// ============================================================

function openSaveModal() {
  const select = $('save-doll-select');

  if (!select) return;

  const dolls = getAllDolls();

  const currentName =
    getValue('name') || '無名ドール';

  select.innerHTML = '';

  const newOption =
    document.createElement('option');

  newOption.value = '';

  newOption.textContent =
    `✨ 新規保存（「${currentName}」として追加）`;

  select.appendChild(newOption);

  Object.keys(dolls).forEach(id => {
    const doll = dolls[id];

    const option =
      document.createElement('option');

    option.value = id;

    option.textContent =
      `🔄 上書き: ${
        doll.name || '無名ドール'
      } (${
        doll.pos || '未設定'
      })`;

    select.appendChild(option);
  });

  const modal = $('save-modal');

  if (modal) {
    modal.style.display = 'flex';
  }
}

function confirmSave() {
  const data = getFullData();

  const select = $('save-doll-select');

  const selectedId =
    select?.value || '';

  const dollId =
    selectedId ||
    `doll_${Date.now()}`;

  data.id = dollId;

  const dolls = getAllDolls();

  dolls[dollId] = data;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(dolls)
  );

  closeModals();

  alert(
    `「${data.name || '無名ドール'}」を保存しました！`
  );
}


// ============================================================
// 読み込み
// ============================================================

function openLoadModal() {
  const select = $('load-doll-select');

  if (!select) return;

  const dolls = getAllDolls();

  const keys = Object.keys(dolls);

  if (keys.length === 0) {
    alert(
      'ブラウザに保存されたドールデータがありません。'
    );
    return;
  }

  select.innerHTML =
    '<option value="">-- ドールを選択してください --</option>';

  keys.forEach(id => {
    const doll = dolls[id];

    const option =
      document.createElement('option');

    option.value = id;

    option.textContent =
      `${doll.name || '無名ドール'} ` +
      `(ポジション: ${
        doll.pos || 'なし'
      } / PL: ${
        doll.pl || '未設定'
      })`;

    select.appendChild(option);
  });

  const modal = $('load-modal');

  if (modal) {
    modal.style.display = 'flex';
  }
}

function confirmLoad() {
  const select = $('load-doll-select');

  const dollId =
    select?.value || '';

  if (!dollId) {
    alert('読み込むドールを選択してください。');
    return;
  }

  const dolls = getAllDolls();

  const data = dolls[dollId];

  if (!data) {
    alert('データが見つかりません。');
    return;
  }

  applyData(data);

  closeModals();

  alert(
    `「${data.name || '無名ドール'}」を読み込みました！`
  );
}


// ============================================================
// 削除
// ============================================================

function confirmDeleteDoll() {
  const select = $('load-doll-select');

  const dollId =
    select?.value || '';

  if (!dollId) {
    alert('削除するドールを選択してください。');
    return;
  }

  const dolls = getAllDolls();

  const targetName =
    dolls[dollId]?.name ||
    '無名ドール';

  if (
    !confirm(
      `本当に「${targetName}」を削除しますか？`
    )
  ) {
    return;
  }

  delete dolls[dollId];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(dolls)
  );

  closeModals();

  alert(
    `「${targetName}」を削除しました。`
  );
}


// 旧関数名にも対応
function confirmDelete() {
  confirmDeleteDoll();
}


// ============================================================
// データ適用
// ============================================================

function applyData(data) {
  setValue('pl', data.pl);
  setValue('name', data.name);

  setValue(
    'pos',
    data.pos || 'アリス'
  );

  setValue(
    'mc',
    data.mc || 'ロマネスク'
  );

  setValue(
    'sc',
    data.sc || 'ステーシー'
  );

  setValue('age', data.age);

  setValue(
    'ps',
    data.ps || '煉獄'
  );

  setValue('hint', data.hint);
  setValue('mem', data.mem);

  setValue(
    'act',
    data.act || '9'
  );

  setValue(
    'fav',
    data.fav || '0'
  );

  setValue('tr', data.tr);

  setValue(
    'chouai-wep',
    data.chouaiWep || '0'
  );

  setValue(
    'chouai-mut',
    data.chouaiMut || '0'
  );

  setValue(
    'chouai-cyb',
    data.chouaiCyb || '0'
  );


  // ボーナス
  const bonus =
    document.querySelector(
      `input[name="bonus"][value="${data.bonus || 'wep'}"]`
    );

  if (bonus) {
    bonus.checked = true;
  }


  // パーツを再構築
  restoreParts(data.parts || []);


  // スキル
  restoreSkills(data.skills || []);


  // 未練
  const list = $('list');

  if (list) {
    list.innerHTML = '';

    (data.list || []).forEach(item => {
      addRow(
        item.target,
        item.emotion,
        item.madness
      );
    });
  }


  // セッション履歴
  const history =
    $('session-history-tbody');

  if (history) {
    history.innerHTML = '';

    (data.history || []).forEach(item => {
      addSessionHistoryRow(
        item.scenario,
        item.battle,
        item.personal,
        item.memo
      );
    });
  }


  // 寵愛使用履歴
  const uses =
    $('chouai-use-tbody');

  if (uses) {
    uses.innerHTML = '';

    (data.chouaiUses || []).forEach(item => {
      addChouaiUseRow(
        item.used,
        item.memo
      );
    });
  }


  calcTotals();
  updateChouaiSummary();
}


// ============================================================
// スキル復元
// ============================================================

function restoreSkills(skills) {
  const tbody = $('skill-tbody');

  if (!tbody) return;

  tbody.innerHTML = '';

  skills.forEach(skill => {
    addSkillRow(
      skill.category,
      skill.name,
      skill.memo
    );
  });

  if (skills.length === 0) {
    renderSkills();
  }
}


// ============================================================
// パーツ復元
// ============================================================

function restoreParts(parts) {
  renderPartsContainer();

  if (!Array.isArray(parts)) {
    return;
  }

  parts.forEach(saved => {
    let location = 'body';

    const loc =
      saved.location || '';

    if (
      loc.includes('頭') ||
      loc === 'head'
    ) {
      location = 'head';
    } else if (
      loc.includes('腕') ||
      loc === 'arm'
    ) {
      location = 'arm';
    } else if (
      loc.includes('脚') ||
      loc === 'leg'
    ) {
      location = 'leg';
    } else if (
      loc.includes('胴') ||
      loc === 'body'
    ) {
      location = 'body';
    }

    const sections =
      $('parts-container')
        ?.querySelectorAll('.parts-section');

    if (!sections) return;

    const indexMap = {
      head: 0,
      arm: 1,
      body: 2,
      leg: 3
    };

    const section =
      sections[indexMap[location]];

    if (!section) return;

    const tbody =
      section.querySelector('tbody');

    if (!tbody) return;

    // 基本パーツは既にあるので、
    // 同じ名前の基本パーツがあれば再利用
    let row = Array.from(
      tbody.querySelectorAll('tr')
    ).find(tr =>
      tr.querySelector('.p-name')?.value ===
      saved.name
    );

    if (!row) {
      row = createPartRow(
        saved,
        location,
        !!saved.isEditable
      );

      tbody.appendChild(row);
    }

    const cb =
      row.querySelector(
        'input[type="checkbox"]'
      );

    if (cb) {
      cb.checked = !!saved.isBroken;

      row.classList.toggle(
        'broken',
        !!saved.isBroken
      );
    }

    const setField =
      (selector, value) => {
        const el =
          row.querySelector(selector);

        if (el) {
          el.value = value ?? '';
        }
      };

    setField(
      '.p-location',
      saved.location ||
      getLocationName(location)
    );

    setField(
      '.p-name',
      saved.name
    );

    setField(
      '.p-type',
      saved.type || '基本'
    );

    setField(
      '.p-level',
      saved.level || '1'
    );

    setField(
      '.p-timing',
      saved.timing
    );

    setField(
      '.p-cost',
      saved.cost
    );

    setField(
      '.p-range',
      saved.range
    );

    setField(
      '.p-memo',
      saved.memo
    );

    const nameInput =
      row.querySelector('.p-name');

    if (nameInput) {
      if (saved.isEditable) {
        nameInput.removeAttribute('readonly');
      } else {
        nameInput.setAttribute(
          'readonly',
          'readonly'
        );
      }
    }
  });

  updatePartLimits();
}


// ============================================================
// JSON出力
// ============================================================

function exportJSON() {
  const data = getFullData();

  const safeName =
    (data.name || 'necro_character')
      .replace(
        /[\\/:*?"<>|]/g,
        '_'
      );

  const blob =
    new Blob(
      [
        JSON.stringify(
          data,
          null,
          2
        )
      ],
      {
        type: 'application/json'
      }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    `${safeName}.json`;

  document.body.appendChild(a);

  a.click();

  a.remove();

  URL.revokeObjectURL(url);
}


// ============================================================
// テキスト出力
// ============================================================

function exportForHokanshoText() {
  const data = getFullData();

  let text = '';

  text += '【永い後日談のネクロニカ】\n';
  text += 'キャラクターシート\n';
  text += '====================\n\n';

  text += `PL名：${data.pl}\n`;
  text += `ドール名：${data.name}\n`;
  text += `ポジション：${data.pos}\n`;
  text += `メインクラス：${data.mc}\n`;
  text += `サブクラス：${data.sc}\n`;
  text += `享年/外見：${data.age}\n`;
  text += `初期配置：${data.ps}\n`;
  text += `暗示：${data.hint}\n`;
  text += `記憶のカケラ：${data.mem}\n`;
  text += `最大行動値：${data.act}\n`;
  text += '\n';

  text += '【習得スキル】\n';

  data.skills.forEach(skill => {
    text +=
      `・${skill.category}：${skill.name}\n`;

    if (skill.memo) {
      text +=
        `  ${skill.memo}\n`;
    }
  });

  text += '\n【マニューバ】\n';

  data.parts.forEach(part => {
    text +=
      `・${part.name} [${part.type} Lv${part.level}]`;

    if (part.isBroken) {
      text += ' 【損傷】';
    }

    text += '\n';

    if (part.timing) {
      text +=
        `  ${part.timing} / ${part.cost} / ${part.range}\n`;
    }

    if (part.memo) {
      text +=
        `  ${part.memo}\n`;
    }
  });

  text += '\n【たからもの】\n';
  text += `${data.tr}\n\n`;

  text += '【未練】\n';

  data.list.forEach(item => {
    text +=
      `・${item.target} / ${item.emotion} / 狂気点${item.madness}\n`;
  });

  text += '\n【セッション履歴】\n';

  data.history.forEach(item => {
    text +=
      `・${item.scenario}：戦闘${item.battle} / 個人${item.personal}`;

    if (item.memo) {
      text += ` / ${item.memo}`;
    }

    text += '\n';
  });

  text += '\n【寵愛使用履歴】\n';

  data.chouaiUses.forEach(item => {
    text +=
      `・${item.used}点：${item.memo}\n`;
  });

  const blob =
    new Blob(
      [text],
      {
        type: 'text/plain;charset=utf-8'
      }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement('a');

  const safeName =
    (data.name || 'necro_character')
      .replace(
        /[\\/:*?"<>|]/g,
        '_'
      );

  a.href = url;
  a.download = `${safeName}.txt`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}


// ============================================================
// ボタン用
// ============================================================

function saveCurrentDoll() {
  openSaveModal();
}

function loadCurrentDoll() {
  openLoadModal();
}


// ============================================================
// モーダル外クリック
// ============================================================

window.addEventListener(
  'click',
  function (e) {
    const saveModal =
      $('save-modal');

    const loadModal =
      $('load-modal');

    if (
      e.target === saveModal ||
      e.target === loadModal
    ) {
      closeModals();
    }
  }
);


// ============================================================
// 入力監視
// ============================================================

document.addEventListener(
  'input',
  function (e) {
    if (
      e.target.matches(
        '.p-type, .p-level'
      )
    ) {
      updatePartLimits();
    }

    if (
      e.target.matches(
        '.battle-pts, .personal-pts, .used-pts'
      )
    ) {
      updateChouaiSummary();
    }
  }
);


// ============================================================
// 起動
// ============================================================

window.addEventListener(
  'DOMContentLoaded',
  function () {

    // 基本パーツを最初から表示
    renderPartsContainer();

    // 初期スキル
    renderSkills();

    // 強化値
    calcTotals();

    // 寵愛
    updateChouaiSummary();

    console.log(
      'ネクロニカ キャラクターシート 起動完了'
    );
  }
);