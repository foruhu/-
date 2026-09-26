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

  const currentCounts = { 'æ­¦è£': {1:0, 2:0, 3:0}, 'å¤ç°': {1:0, 2:0, 3:0}, 'æ¹é ': {1:0, 2:0, 3:0} };

  document.querySelectorAll('#parts-container tr.part-row').forEach(tr => {
    const type = tr.querySelector('.p-type')?.value;
    const lv = parseInt(tr.querySelector('.p-level')?.value, 10);
    if (currentCounts[type] && currentCounts[type][lv] !== undefined) {
      currentCounts[type][lv]++;
    }
  });

  // ã¹ã­ã«é¸æç¶æãåå¾ï¼ãæè¨ä»æããã¨ãæ¥­èº¯ãï¼
  const hasClockwork = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === 'æè¨ä»æã');
  const hasGouku = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === 'æ¥­èº¯');

  const categories = [
    { name: 'æ­¦è£', total: totals.wep, key: 'wep' },
    { name: 'å¤ç°', total: totals.mut, key: 'mut' },
    { name: 'æ¹é ', total: totals.cyb, key: 'cyb' }
  ];

  const limitTbody = document.getElementById('limit-tbody');
  if (limitTbody) { limitTbody.innerHTML = ''; }

  categories.forEach(cat => {
    const limit = (typeof getLimitByVal === 'function') ? getLimitByVal(cat.total) : { lv1:0, lv2:0, lv3:0 };
    [1, 2, 3].forEach(lv => {
      const baseLimit = limit[`lv${lv}`] || 0;

      // ãã¼ãã¹é©ç¨å¤å®ï¼æ¹é Lv3(æè¨ä»æã) ã¾ãã¯ å¤ç°Lv3(æ¥­èº¯)
      let autoBonus = 0;
      if (cat.name === 'æ¹é ' && lv === 3 && hasClockwork) {
        autoBonus = 1;
      } else if (cat.name === 'å¤ç°' && lv === 3 && hasGouku) {
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

      let statusHtml;
      if (maxAllowed <= 0) {
        statusHtml = `<span style="color:#666;">å¯¾è±¡å¤</span>`;
      } else if (current > maxAllowed) {
        statusHtml = `<span class="limit-ng" style="color:#ff6666; font-weight:bold;">è¶é (${current}/${maxAllowed})</span>`;
      } else if (current > 0) {
        statusHtml = `<span class="limit-selected" style="color:#88ff88;">OK (${current}/${maxAllowed})</span>`;
      } else {
        statusHtml = `<span style="color:#f0c060; font-weight:bold;">æªåå¾ (0/${maxAllowed})</span>`;
      }

      if (limitTbody) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><b>${cat.name}</b> (ç·${cat.total})</td>
          <td>Lv ${lv}</td>
          <td>${maxAllowed} å</td>
          <td><b>${current}</b> å</td>
          <td>${statusHtml}</td>
        `;
        limitTbody.appendChild(tr);
      }
    });
  });

  if (typeof updateExtraPartOptions === 'function') updateExtraPartOptions();
  if (typeof calcActionValue === 'function') calcActionValue();
}

function addRow(target = '', emotion = '', madness = 0) {
  const tbody = document.getElementById('list');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}"></td>
    <td><input type="text" value="${emotion}"></td>
    <td><input type="number" value="${madness}" min="0"></td>
    <td class="col-op"><button type="button" class="del" onclick="removeRowWithUndo(this)">X</button></td>
  `;
  tbody.appendChild(tr);
  markDirty();
}

function updateSkillOptions() {
  const selectedSkills = new Set(Array.from(document.querySelectorAll('#skill-tbody .skill-name-select')).map(s => s.value).filter(Boolean));

  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const select = tr.querySelector('.skill-name-select');
    if (!select) return;
    const category = tr.querySelector('.skill-category')?.value || '';
    const currentValue = select.value;

    let optionsHtml = '<option value="">-- ã¹ã­ã«ãé¸æ --</option>';
    if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
      SKILL_DATABASE[category].forEach(s => {
        const isSelectedByOther = selectedSkills.has(s.name) && s.name !== currentValue;
        const disabledAttr = isSelectedByOther ? 'disabled' : '';
        const labelText = isSelectedByOther ? `${s.name} (é¸ææ¸ã¿)` : s.name;
        optionsHtml += `<option value="${s.name}" ${s.name === currentValue ? 'selected' : ''} ${disabledAttr}>${labelText}</option>`;
      });
    }
    select.innerHTML = optionsHtml;
  });
}

// ã¹ã­ã«DBã®ã¡ã¢æå­åããååã ã¿ã¤ãã³ã°/ã³ã¹ã/å°ç¨\nå¹æ...ããã¿ã¤ãã³ã°ã»ã³ã¹ãã»å°ç¨ã»å¹ææ¬æã«åè§£ãã
// ã¹ã­ã«DBã®ã¡ã¢æå­åãã¿ã¤ãã³ã°/ã³ã¹ã/å°ç¨\nå¹æ...ããã¿ã¤ãã³ã°ã»ã³ã¹ãã»å°ç¨ã»å¹ææ¬æã«åè§£ãã
// ï¼è¡¨è¨ããå¯¾ç­ã¨ãã¦ãåé ­ã«ããååãããåç¬ã®ããããæ®ã£ã¦ããå ´åã¯åãé¤ãã¦ããè§£æããï¼
function parseSkillMemo(memoText) {
  let text = memoText || '';
  text = text.replace(/^ã[^ã]*ã\s*/, ''); // ããååãããã¾ã ä»ãã¦ããæ§å½¢å¼
  text = text.replace(/^ã\s*/, '');          // ãããã ããæ®ã£ã¦ãã¾ã£ã¦ããè¡¨è¨ãã

  const match = text.match(/^([^\/\n]+)\/([^\/\n]+)\/([^\/\n]+)\n?([\s\S]*)$/);
  if (match) {
    return { timing: match[1].trim(), cost: match[2].trim(), range: match[3].trim(), effect: match[4] };
  }
  return { timing: '', cost: '', range: '', effect: text };
}

// ã¹ã­ã«ã®ãä½¿ç¨ããã§ãã¯ã¯ãé½åº¦çºçããã¿ã¤ãã³ã°ï¼ã¸ã£ãã¸/ãã¡ã¼ã¸/ã©ãããï¼ã®æã ãè¡¨ç¤ºãã
// ï¼ãªã¼ããªã©å¸¸æå¹æã®ã¹ã­ã«ã¯ãæå·ã¨éã£ã¦ä½¿ã/ä½¿ããªãã®ç®¡çãä¸è¦ãªããï¼
const SKILL_USED_CHECK_TIMINGS = ['ã¸ã£ãã¸', 'ãã¡ã¼ã¸', 'ã©ããã'];

// ã¿ã¤ãã³ã°ã¯åºæ¬çã«ãã®ä¸­ããé¸ã¶ï¼ä¿å­ãã¼ã¿ç­ã«ç¡ãå¤ãæ¥ãå ´åã¯ãé¸æè¢ã¸ãã®å ´ã§è¿½å ãã¦å¤±ãããªãããã«ããï¼
const SKILL_TIMING_OPTIONS = ['', 'ãªã¼ã', 'ã¢ã¯ã·ã§ã³', 'ã¸ã£ãã¸', 'ãã¡ã¼ã¸', 'ã©ããã', 'åç§'];

function buildTimingOptionsHtml(selected) {
  const options = SKILL_TIMING_OPTIONS.includes(selected) || !selected
    ? SKILL_TIMING_OPTIONS
    : [...SKILL_TIMING_OPTIONS, selected]; // æªç¥ã®å¤ã¯é¸æè¢ã®æå¾ã«è¿½å ãã¦ä¿æãã
  return options.map(t => `<option value="${t}" ${t === selected ? 'selected' : ''}>${t || 'ï¼æªé¸æï¼'}</option>`).join('');
}

// æ¢å­ã®selectã«ç¡ãå¤ãã»ãããããæããã®å ´ã§é¸æè¢ã¸è¿½å ãã¦ããå¤ãåæ ãã
function setTimingSelectValue(selectEl, value) {
  if (!selectEl) return;
  const hasOption = Array.from(selectEl.options).some(o => o.value === value);
  if (!hasOption && value) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = value;
    selectEl.appendChild(opt);
  }
  selectEl.value = value;
}

function updateSkillUsedCheckboxVisibility(tr) {
  if (!tr) return;
  const timingInput = tr.querySelector('.skill-timing');
  const usedCell = tr.querySelector('.skill-used-cell');
  const usedCb = tr.querySelector('.skill-used');
  if (!timingInput || !usedCell || !usedCb) return;

  const shouldShow = SKILL_USED_CHECK_TIMINGS.includes((timingInput.value || '').trim());
  usedCell.style.visibility = shouldShow ? 'visible' : 'hidden';
  if (!shouldShow && usedCb.checked) {
    usedCb.checked = false;
    toggleSkillUsed(usedCb);
  }
}

function toggleSkillUsed(checkbox) {
  const tr = checkbox.closest('tr');
  tr.classList.toggle('used', checkbox.checked);
  if (tr.nextElementSibling && tr.nextElementSibling.classList.contains('skill-memo-row')) {
    tr.nextElementSibling.classList.toggle('used', checkbox.checked);
  }
  markDirty();
}

function addSkillRow(category, skillName = '', timing = '', cost = '', range = '', memo = '', tag = '', isUsed = false) {
  const tbody = document.getElementById('skill-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.className = 'skill-row';
  tr.innerHTML = `
    <td class="skill-used-cell"><input type="checkbox" class="skill-used" onchange="toggleSkillUsed(this)"></td>
    <td><input type="text" class="skill-category" value="${category}" readonly style="background:#1e1e24;color:#ccc;border:none;"></td>
    <td class="color-col"><select class="skill-tag" onchange="onManeuverCategoryChange(this)">${buildCategoryOptions(tag)}</select></td>
    <td><select class="skill-name-select" onchange="onSkillSelect(this)"><option value="">-- ã¹ã­ã«ãé¸æ --</option></select></td>
    <td><select class="skill-timing" onchange="updateSkillUsedCheckboxVisibility(this.closest('tr'))">${buildTimingOptionsHtml(timing)}</select></td>
    <td><input type="text" class="skill-cost" value="${cost}"></td>
    <td><input type="text" class="skill-range" value="${range}"></td>
    <td class="col-op"><button type="button" class="del" onclick="removeRowWithUndo(this, () => { calcTotals(); updateSkillOptions(); })">X</button></td>
  `;
  tbody.appendChild(tr);

  const memoTr = document.createElement('tr');
  memoTr.className = 'skill-memo-row';
  memoTr.innerHTML = `<td colspan="8"><textarea class="skill-memo" oninput="onManeuverMemoInput(this, '.skill-tag')" onfocus="setTimeout(() => autoResizeTextarea(this), 80)" placeholder="å¹æã¡ã¢">${memo}</textarea></td>`;
  tbody.appendChild(memoTr);

  applyCategoryColorToRow(tr, tag);
  applyCategoryColorToRow(memoTr, tag);
  autoResizeTextarea(memoTr.querySelector('.skill-memo'));
  updateSkillUsedCheckboxVisibility(tr);
  if (isUsed) {
    const cb = tr.querySelector('.skill-used');
    cb.checked = true;
    toggleSkillUsed(cb);
  }

  // é¸æè¢ä¸è¦§ãåã«çæãã¦ããå¤ãã»ããããï¼é åºãéã«ããã¨ä¿å­ãã¼ã¿ã®é¸æç¶æãå¾©åãããªãï¼
  updateSkillOptions();
  if (skillName) tr.querySelector('.skill-name-select').value = skillName;
  markDirty();
  calcTotals();
}

function addPosSkillRow() { addSkillRow(document.getElementById('pos').value); }
function addMcSkillRow() { addSkillRow(document.getElementById('mc').value); }
function addScSkillRow() { addSkillRow(document.getElementById('sc').value); }

function onSkillSelect(selectElem) {
  const skillName = selectElem.value;
  const tr = selectElem.closest('tr');
  const memoTr = tr.nextElementSibling && tr.nextElementSibling.classList.contains('skill-memo-row') ? tr.nextElementSibling : null;
  const category = tr.querySelector('.skill-category').value;
  const timingInput = tr.querySelector('.skill-timing');
  const costInput = tr.querySelector('.skill-cost');
  const rangeInput = tr.querySelector('.skill-range');
  const textarea = memoTr ? memoTr.querySelector('.skill-memo') : null;
  const tagSelect = tr.querySelector('.skill-tag');

  if (!skillName) {
    if (timingInput) setTimingSelectValue(timingInput, '');
    if (costInput) costInput.value = '';
    if (rangeInput) rangeInput.value = '';
    if (textarea) { textarea.value = ''; autoResizeTextarea(textarea); }
    if (tagSelect) {
      tagSelect.value = '';
      applyCategoryColorToRow(tr, '');
      if (memoTr) applyCategoryColorToRow(memoTr, '');
    }
  } else if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
    const found = SKILL_DATABASE[category].find(s => s.name === skillName);
    if (found) {
      const parsed = parseSkillMemo(found.memo);
      if (timingInput) setTimingSelectValue(timingInput, parsed.timing);
      if (costInput) costInput.value = parsed.cost;
      if (rangeInput) rangeInput.value = parsed.range;
      if (textarea) { textarea.value = parsed.effect; autoResizeTextarea(textarea); }
      const detected = detectCategoryFromMemo(parsed.effect);
      if (tagSelect) {
        tagSelect.value = detected;
        applyCategoryColorToRow(tr, detected);
        if (memoTr) applyCategoryColorToRow(memoTr, detected);
      }
    }
  }

  updateSkillUsedCheckboxVisibility(tr);
  updateSkillOptions();
  calcTotals();
}

// --- 1. ã»ãã·ã§ã³å±¥æ­´ï¼ç²å¾ï¼ã®è¡è¿½å  ---
function addSessionHistoryRow(scenario = '', battle = 0, personal = 0, memo = '') {
  const tbody = document.getElementById('session-history-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-scenario" value="${scenario}" placeholder="ä¾: çãå²ãèè" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="battle-pts" value="${battle}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="personal-pts" value="${personal}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-memo" value="${memo}" placeholder="ä¾: 2026/05/10 éé" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td class="col-op" style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" class="edit-only" onclick="removeRowWithUndo(this, calcChouaiTotals)" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  markDirty();
  calcChouaiTotals();
}

// --- 2. å¯µæç¹ã®ä½¿ãéï¼æ¶è²»ï¼ã®è¡è¿½å  ---
function addChouaiUseRow(used = 0, memo = '') {
  const tbody = document.getElementById('chouai-use-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="used-pts" value="${used}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #ff88c2; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="use-memo" value="${memo}" placeholder="ä¾: æ­¦è£åºæ¬å¤+1ãåºæ¬ãã¼ãä¿®å¾©" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td class="col-op" style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" class="edit-only" onclick="removeRowWithUndo(this, calcChouaiTotals)" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  markDirty();
  calcChouaiTotals();
}

// --- 3. å¯µæç¹è¨ç®å¦ç ---
function calcChouaiTotals() {
  let totalBattle = 0;
  let totalPersonal = 0;
  let totalUsed = 0;

  // ç²å¾å¯µæã®è¨ç®
  document.querySelectorAll('#session-history-tbody .battle-pts').forEach(input => {
    totalBattle += parseInt(input.value, 10) || 0;
  });
  document.querySelectorAll('#session-history-tbody .personal-pts').forEach(input => {
    totalPersonal += parseInt(input.value, 10) || 0;
  });

  // ä½¿ç¨å¯µæã®è¨ç®
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

// --- ä¿å­ã»èª­è¾¼ ---
