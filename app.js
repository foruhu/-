// 定数・ヘルパー関数の補填（未定義防止）
const STORAGE_KEY = 'necro_dolls_data';

function getAllDolls() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    console.error('LocalStorage parsing error:', e);
    return {};
  }
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
  
  select.innerHTML = `<option value="">✨ 新規保存（「${currentName}」として追加）</option>`;
option.textContent = `🔄 上書き: ${doll.name || '無名ドール'} (${doll.pos || '無職'})`;
alert(`「${data.name || '無名ドール'}」を保存しました！`);
a.download = `${safeName}.json`;
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
// 3. データ構造・復元処理
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
    bonus: document.querySelector('input[name="bonus"]:checked')?.value || 'wep',
    skills: Array.from(document.querySelectorAll('#skill-tbody tr')).map(tr => ({
      category: tr.querySelector('input')?.value || tr.children[0]?.textContent?.trim() || '',
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
  const setVal = (id, val) => {
    if (document.getElementById(id)) document.getElementById(id).value = val || '';
  };
  
  setVal('pl', data.pl);
  setVal('name', data.name);
  setVal('pos', data.pos || 'アリス');
  setVal('mc', data.mc || 'ロマネスク');
  setVal('sc', data.sc || 'ロマネスク');
  setVal('age', data.age);
  setVal('ps', data.ps || '煉獄');
  setVal('hint', data.hint);
  setVal('mem', data.mem);
  setVal('act', data.act || '9');
  setVal('fav', data.fav || '0');
  setVal('tr', data.tr);
  setVal('chouai-wep', data.chouaiWep || '0');
  setVal('chouai-mut', data.chouaiMut || '0');
  setVal('chouai-cyb', data.chouaiCyb || '0');
  
  if (data.bonus && window.CSS && CSS.escape) {
    const radio = document.querySelector(`input[name="bonus"][value="${CSS.escape(data.bonus)}"]`);
    if (radio) radio.checked = true;
  }
  
  if (typeof onClassChange === 'function') onClassChange();
  
  // スキルの復元
  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills && typeof addSkillRow === 'function') {
      data.skills.forEach(s => addSkillRow(s.category, s.name, s.memo));
    }
  }

  // パーツ（マニューバ）の復元例
  if (data.parts && typeof renderPartsContainer === 'function') {
    renderPartsContainer(); // 初期化
    
    data.parts.forEach((p, idx) => {
      let rows = document.querySelectorAll('#parts-container tr');
      
      // 行が足りない場合、追加関数があれば呼び出して行を増やす
      if (!rows[idx] && typeof addPartRow === 'function') {
        addPartRow();
        rows = document.querySelectorAll('#parts-container tr');
      }
      
      const tr = rows[idx];
      if (tr) {
        // 破損チェックの復元
        const cb = tr.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = !!p.isBroken;
          tr.classList.toggle('broken', !!p.isBroken);
        }
        
        const setFieldVal = (cls, val) => {
          const input = tr.querySelector(cls);
          if (input) input.value = val || '';
        };
        
        setFieldVal('.p-location', p.location);
        setFieldVal('.p-name', p.name);
        setFieldVal('.p-type', p.type);
        setFieldVal('.p-level', p.level);
        setFieldVal('.p-timing', p.timing);
        setFieldVal('.p-cost', p.cost);
        setFieldVal('.p-range', p.range);
        setFieldVal('.p-memo', p.memo);

        // readonly（編集可否）の復元
        const nameInput = tr.querySelector('.p-name');
        if (nameInput) {
          if (p.isEditable) {
            nameInput.removeAttribute('readonly');
          } else {
            nameInput.setAttribute('readonly', 'readonly');
          }
        }
      }
    });
  }
  
  // 未練リストの復元
  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list && typeof addRow === 'function') {
      data.list.forEach(l => addRow(l.target, l.emotion, l.madness));
    }
  }
  
  // セッション履歴の復元
  const historyTbody = document.getElementById('session-history-tbody');
  if (historyTbody) {
    historyTbody.innerHTML = '';
    if (data.history && typeof addSessionHistoryRow === 'function') {
      data.history.forEach(h => addSessionHistoryRow(h.scenario, h.battle, h.personal, h.memo));
    }
  }
  
  // 寵愛使用履歴の復元
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
  const safeName = (data.name || 'necro_character').replace(/[\\/:*?"<>|]/g, '_');
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// モーダルの外側クリックで閉じるイベント
window.addEventListener('click', function(e) {
  const saveModal = document.getElementById('save-modal');
  const loadModal = document.getElementById('load-modal');
  if (e.target === saveModal || e.target === loadModal) {
    closeModals();
  }
});

// ボタン操作用ラッパー関数
function saveCurrentDoll() {
  if (typeof openSaveModal === 'function') openSaveModal();
}

function loadCurrentDoll() {
  if (typeof openLoadModal === 'function') openLoadModal();
}

function exportForHokanshoText() {
  if (typeof exportJSON === 'function') exportJSON();
}

function openSaveModal() {const m = document.getElementById(‘save-modal’);if (!m) return console.warn(‘save-modal not found’);m.style.display = ‘flex’;}function openLoadModal() {const m = document.getElementById(‘load-modal’);if (!m) return console.warn(‘load-modal not found’);m.style.display = ‘flex’;}function closeModals() {const s = document.getElementById(‘save-modal’);const l = document.getElementById(‘load-modal’);if (s) s.style.display = ‘none’;if (l) l.style.display = ‘none’;}

window.onload = function() {
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  if (typeof onClassChange === 'function') onClassChange();
};