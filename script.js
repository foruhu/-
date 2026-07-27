const SKILL_DATABASE = {
  'アリス': [
    { name: '少女', memo: '' },
    { name: 'お嬢様', memo: '' },
    { name: '癒し', memo: '' },
    { name: '楽園の天使', memo: '' },
    { name: '負けない心', memo: '' },
    { name: '祈り', memo: '' },
    { name: '輝く表情', memo: '' }
  ],
  'ホリック': [
    { name: '加速する狂気', memo: '' },
    { name: '業怒', memo: '' },
    { name: '衝動', memo: '' },
    { name: '奈落の引力', memo: '' },
    { name: '修羅', memo: '' },
    { name: '堕地獄', memo: '' },
    { name: '狂気の果て', memo: '' }
  ],
  'オートマトン': [
    { name: '援護', memo: '' },
    { name: '私は人形', memo: '' },
    { name: '無茶', memo: '' },
    { name: '煉獄の檻', memo: '' },
    { name: '氷の心', memo: '' },
    { name: '血の涙', memo: '' },
    { name: '敵は敵', memo: '' }
  ],
  'ジャンク': [
    { name: '随行', memo: '' },
    { name: '足掻く', memo: '' },
    { name: '半壊', memo: '' },
    { name: '奈落への抗い', memo: '' },
    { name: '地獄の住人', memo: '' },
    { name: '楽園の守護者', memo: '' },
    { name: '手負いの獣', memo: '' }
  ],
  'コート': [
    { name: '助言', memo: '' },
    { name: '作戦', memo: '' },
    { name: '冷静', memo: '' },
    { name: '先読み', memo: '' },
    { name: '看破', memo: '' },
    { name: '抑制', memo: '' },
    { name: '憎まれ役', memo: '' }
  ],
  'ソロリティ': [
    { name: '号令', memo: '' },
    { name: '内緒話', memo: '' },
    { name: '克己心', memo: '' },
    { name: '優雅', memo: '' },
    { name: '花園の集い', memo: '' },
    { name: '姉妹のくちづけ', memo: '' },
    { name: '心を鬼にして', memo: '' }
  ],
  'ステーシー': [
    { name: '蠢く肉片', memo: '' },
    { name: '平気', memo: '' },
    { name: '死に続け', memo: '' },
    { name: '庇う', memo: '' },
    { name: '肉の盾', memo: '' },
    { name: '失敗作', memo: '' },
    { name: '臓物豚', memo: '' },
    { name: '死人の流儀', memo: '' }
  ],
  'タナトス': [
    { name: '無限解体', memo: '' },
    { name: '死神', memo: '' },
    { name: '災禍', memo: '' },
    { name: '殺劇', memo: '' },
    { name: '刹那', memo: '' },
    { name: '必中', memo: '' },
    { name: '断罪', memo: '' },
    { name: '冥王', memo: '' }
  ],
  'ゴシック': [
    { name: '暴食', memo: '' },
    { name: '肉の宴', memo: '' },
    { name: '捕食者', memo: '' },
    { name: '舌なめずり', memo: '' },
    { name: '悪食', memo: '' },
    { name: '背徳の悦び', memo: '' },
    { name: '引き裂き', memo: '' },
    { name: '完全捕食', memo: '' }
  ],
  'レクイエム': [
    { name: '魔弾', memo: '' },
    { name: '銃神', memo: '' },
    { name: '死の手', memo: '' },
    { name: '子守唄', memo: '' },
    { name: '銃型', memo: '' },
    { name: '集中', memo: '' },
    { name: '後衛の誇り', memo: '' },
    { name: '最高の戦友', memo: '' }
  ],
  'バロック': [
    { name: '異形存在', memo: '' },
    { name: '狂鬼', memo: '' },
    { name: '怪力', memo: '' },
    { name: '歪極', memo: '' },
    { name: '業躯', memo: '' },
    { name: '再生', memo: '' },
    { name: '凶化器官', memo: '' },
    { name: '結晶化', memo: '' }
  ],
  'ロマネスク': [
    { name: '戦乙女', memo: '' },
    { name: '円舞曲', memo: '' },
    { name: '死の舞踏', memo: '' },
    { name: '調律', memo: '' },
    { name: '愛撫', memo: '' },
    { name: '時計仕掛け', memo: '' },
    { name: '多数の手管', memo: '' },
    { name: '狂った歯車', memo: '' }
  ]
};

const CLASS_PARTS = {
  'ステーシー': [1,0,1],
  'タナトス':   [2,0,0],
  'ゴシック':   [0,0,2],
  'レクイエム': [1,1,0],
  'バロック':   [0,2,0],
  'ホリック':   [0,1,1],
  'ロマネスク': [0,0,2]
};

const DEFAULT_PARTS = {
  head: [
    { name: 'あたま', type: '基本', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'めだま', type: '基本', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'あご', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' }
  ],
  arm: [
    { name: 'こぶし', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'うで', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '' },
    { name: 'かた', type: '基本', level: 1, timing: 'アクション', cost: '4', range: '自身', memo: '' }
  ],
  body: [
    { name: 'せぼね', type: '基本', level: 1, timing: 'アクション', cost: '1', range: '自身', memo: '' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無', range: '無', memo: '' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無', range: '無', memo: '' }
  ],
  leg: [
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '' },
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '' },
    { name: 'あし', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '' }
  ]
};

const EXTRA_PARTS_DB = {
  head: [
    { name: 'カンフー', type: '武装', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: '発勁', type: '武装', level: 2, timing: 'ラピッド', cost: '2', range: '0', memo: '' },
    { name: 'けもみみ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'よぶんなあたま', type: '変異', level: 3, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'アドレナリン', type: '改造', level: 1, timing: 'ラピッド', cost: '無', range: '自身', memo: '' },
    { name: 'セイバートゥース', type: '改造', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'ボルトヘッド', type: '改造', level: 1, timing: 'ジャッジ', cost: '1', range: '自身', memo: '' },
    { name: 'ボイスエフェクト', type: '改造', level: 1, timing: 'ラピッド', cost: '0〜2', range: '自身', memo: '' },
    { name: 'スコープ', type: '改造', level: 2, timing: 'ジャッジ', cost: '0', range: '自身', memo: '' },
    { name: 'エンバーミング', type: '改造', level: 3, timing: 'ジャッジ', cost: '2', range: '0', memo: '' },
    { name: 'すすりじた', type: '変異', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'アンテナ', type: '改造', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'おとこのこ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '' }
  ],
  arm: [
    { name: '釘バット', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'バール', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: '斧', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: '日本刀', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'チェーンソー', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: '大型拳銃', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: '狙撃ライフル', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '2〜3', memo: '' },
    { name: '火炎ビン', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: 'ショットガン', type: '武装', level: 2, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: 'マシンガン', type: '武装', level: 2, timing: 'アクション', cost: '3', range: '0〜1', memo: '' },
    { name: '火炎放射器', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: '有刺鉄線', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '' },
    { name: 'よぶんなうで', type: '変異', level: 2, timing: 'ラピッド', cost: '0', range: '自身', memo: '' },
    { name: 'しょくしゅ', type: '変異', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '' }
  ],
  body: [
    { name: 'ガトリング砲', type: '武装', level: 3, timing: 'アクション', cost: '4', range: '1〜3', memo: '' },
    { name: '手榴弾', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: '肉殻', type: '変異', level: 1, timing: 'ダメージ', cost: '1', range: '自身', memo: '' },
    { name: '骨組', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: '合金装甲', type: '改造', level: 1, timing: 'ダメージ', cost: '1', range: '自身', memo: '' },
    { name: 'リフレクター', type: '改造', level: 2, timing: 'ダメージ', cost: '2', range: '自身', memo: '' },
    { name: 'うじむし', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' }
  ],
  leg: [
    { name: 'ローラーシューズ', type: '武装', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: '多節足', type: '変異', level: 1, timing: 'アクション', cost: '1', range: '自身', memo: '' },
    { name: '尻尾', type: '変異', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '' },
    { name: 'キャタピラ', type: '改造', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'ブースター', type: '改造', level: 1, timing: 'ラピッド', cost: '2', range: '自身', memo: '' }
  ],
  official_any: [
    { name: '火炎ビン', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: '有刺鉄線', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '' },
    { name: '手榴弾', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: '単分子繊維', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: 'ダイナマイト', type: '武装', level: 3, timing: 'アクション', cost: '3', range: '0〜1', memo: '' },
    { name: '火炎放射器', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '' },
    { name: 'うじむし', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'おおあな', type: '変異', level: 1, timing: 'ジャッジ', cost: '0', range: '0〜3', memo: '' },
    { name: 'おとこのこ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '' },
    { name: 'ほねやり', type: '変異', level: 2, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'どくばり', type: '変異', level: 2, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: 'よぷんななめ', type: '変異', level: 2, timing: 'ジャッジ', cost: '1', range: '0〜1', memo: '' },
    { name: 'しょくしゅ', type: '変異', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '' },
    { name: 'ほとけかずら', type: '変異', level: 2, timing: 'ジャッジ', cost: '0', range: '0', memo: '' },
    { name: 'にくむち', type: '変異', level: 3, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: 'くされじる', type: '変異', level: 3, timing: 'アクション', cost: '3', range: '0〜1', memo: '' },
    { name: 'ジェットノズル', type: '改造', level: 1, timing: 'ダメージ', cost: '0', range: '自身', memo: '' },
    { name: 'リモートアタック', type: '改造', level: 1, timing: 'アクション', cost: '3', range: '0〜1', memo: '' },
    { name: 'ゾンビボム', type: '改造', level: 2, timing: 'ダメージ', cost: '0', range: '0', memo: '' },
    { name: 'エレクトリガー', type: '改造', level: 2, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'ドリル', type: '改造', level: 2, timing: 'アクション', cost: '3', range: '0', memo: '' },
    { name: 'アサシンブレード', type: '改造', level: 2, timing: 'ラピッド', cost: '2', range: '0', memo: '' },
    { name: 'レーザービーム', type: '改造', level: 2, timing: 'アクション', cost: '3', range: '0〜3', memo: '' },
    { name: 'スパイク', type: '改造', level: 2, timing: 'ダメージ', cost: '1', range: '自身', memo: '' },
    { name: 'テントクル', type: '改造', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '' },
    { name: 'ワイヤーリール', type: '改造', level: 2, timing: 'ラピッド', cost: '3', range: '0〜2', memo: '' },
    { name: 'パイルバンカー', type: '改造', level: 3, timing: 'アクション', cost: '2', range: '0', memo: '' },
    { name: 'ライトセイバー', type: '改造', level: 3, timing: 'アクション', cost: '2', range: '0', memo: '' }
  ]
};
 

// パーツコンテナおよびセレクトボックスを生成する関数
function renderPartsContainer() {
  const container = document.getElementById('parts-container');
  if (!container) return;
  container.innerHTML = '';

  const baseSections = [
    { id: 'head', title: '頭部', val: '（最大数値：2）' },
    { id: 'arm', title: '腕部', val: '（最大数値：2）' },
    { id: 'body', title: '胴部', val: '（最大数値：2）' },
    { id: 'leg', title: '脚部', val: '（最大数値：2）' }
  ];

  const allSections = [...baseSections, ...customSections];

  let allPartsOptionsHtml = `<option value="">+ 【任意の部位】にパーツを選択して追加...</option>`;
  allPartsOptionsHtml += `<option value="custom">-- 自由入力枠を追加 --</option>`;

  const categoryNameMap = { 
    head: '頭部', 
    arm: '腕部', 
    body: '胴部', 
    leg: '脚部', 
    official_any: '公式任意・汎用' 
  };

  Object.keys(EXTRA_PARTS_DB).forEach(categoryKey => {
    const catLabel = categoryNameMap[categoryKey] || categoryKey;
    
    EXTRA_PARTS_DB[categoryKey].forEach((p, idx) => {
      allPartsOptionsHtml += `<option value="${categoryKey}_${idx}">[${catLabel} / ${p.type} Lv${p.level}] ${p.name}</option>`;
    });
  });

  allSections.forEach(sec => {
    const secDiv = document.createElement('div');
    secDiv.id = `section-box-${sec.id}`;
    
    let deleteBtnHtml = '';
    if (sec.isCustom) {
      deleteBtnHtml = `<button type="button" class="del" onclick="removeCustomSection('${sec.id}')" style="margin-left:8px;font-size:.7rem;padding:2px 6px;">部位削除</button>`;
    }

    secDiv.innerHTML = `
      <div class="part-header">
        <div style="display:flex; align-items:center;">
          ${sec.isCustom ? `<input type="text" value="${sec.title}" oninput="updateCustomTitle('${sec.id}', this.value)" style="background:#18181c; border:1px solid #555; color:#fff; padding:2px 6px; font-size:.9rem; font-weight:bold; width:140px; text-align:left;">` : `<span>${sec.title}</span>`}
          ${deleteBtnHtml}
        </div>
        <span class="val">${sec.val || ''}</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th style="width:8%">破損</th>
              <th style="width:20%">パーツ名</th>
              <th style="width:10%">種別</th>
              <th style="width:8%">Lv</th>
              <th style="width:12%">タイミング</th>
              <th style="width:8%">コスト</th>
              <th style="width:10%">射程</th>
              <th style="width:18%">効果メモ</th>
              <th style="width:6%">操作</th>
            </tr>
          </thead>
          <tbody id="parts-tbody-${sec.id}"></tbody>
        </table>
      </div>
      <div style="margin-top:6px;">
        <select class="add-part-select" onchange="onExtraPartSelect('${sec.id}', this)">
          ${allPartsOptionsHtml}
        </select>
      </div>
    `;
    container.appendChild(secDiv);

    const tbody = secDiv.querySelector(`#parts-tbody-${sec.id}`);
    if (sec.id === 'head' || sec.id === 'arm' || sec.id === 'body' || sec.id === 'leg') {
      if (DEFAULT_PARTS && DEFAULT_PARTS[sec.id]) {
        DEFAULT_PARTS[sec.id].forEach(p => {
          addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, false);
        });
      }
    }
    if (sec.isCustom && sec.partsData) {
      sec.partsData.forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, true);
      });
    }
  });
}

// 選択時の処理（制限チェック対応）
function onExtraPartSelect(secId, selectElem) {
  const val = selectElem.value;
  if (!val) return;

  const tbody = document.getElementById(`parts-tbody-${secId}`);
  if (!tbody) return;

  if (val === 'custom') {
    addPartRow(tbody, '新規パーツ', '武装', 1, 'アクション', '1', '0', '', true);
  } else {
    const [sId, idxStr] = val.split('_');
    const idx = parseInt(idxStr, 10);
    const p = EXTRA_PARTS_DB[sId] ? EXTRA_PARTS_DB[sId][idx] : null;
    
    if (p) {
      let categoryKey = '';
      if (p.type === '武装') categoryKey = 'wep';
      else if (p.type === '変異') categoryKey = 'mut';
      else if (p.type === '改造') categoryKey = 'cyb';

      // 必要に応じて上限チェックやアラートを行うことができます
      addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, true);
    }
  }
  selectElem.value = '';
}

// パーツの行を追加する共通関数（重複や構文エラーを整理）
function addPartRow(tbody, name='', type='基本', level=1, timing='オート', cost='0', range='0', memo='', isRemovable=true) {
  const tr = document.createElement('tr');
  if (type === '基本') {
    tr.classList.add('default-part');
  }
  tr.innerHTML = `
    <td><input type="checkbox" onchange="toggleBroken(this)" style="width:16px;height:16px;cursor:pointer;"></td>
    <td><input type="text" class="p-name" value="${name}"></td>
    <td><input type="text" class="p-type" value="${type}" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="number" class="p-level" value="${level}" min="1" max="3" style="width:40px;" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="text" class="p-timing" value="${timing}"></td>
    <td><input type="text" class="p-cost" value="${cost}"></td>
    <td><input type="text" class="p-range" value="${range}"></td>
    <td><textarea class="p-memo" rows="1">${memo}</textarea></td>
    <td>${isRemovable ? '<button type="button" class="del" onclick="this.closest(\'tr\').remove()">削</button>' : '-'}</td>
  `;
  tbody.appendChild(tr);
}

function toggleBroken(chk) {
  const tr = chk.closest('tr');
  if (chk.checked) {
    tr.classList.add('broken');
  } else {
    tr.classList.remove('broken');
  }
}

function resetUsed() {
  const checkboxes = document.querySelectorAll('#parts-container input[type="checkbox"]');
  checkboxes.forEach(chk => {
    chk.checked = false;
    toggleBroken(chk);
  });
}

function onClassChange() {
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;
  const mcVal = CLASS_PARTS[mc] || [0,0,0];
  const scVal = CLASS_PARTS[sc] || [0,0,0];

  document.getElementById('mc-wep').textContent = mcVal[0];
  document.getElementById('mc-mut').textContent = mcVal[1];
  document.getElementById('mc-cyb').textContent = mcVal[2];

  document.getElementById('sc-wep').textContent = scVal[0];
  document.getElementById('sc-mut').textContent = scVal[1];
  document.getElementById('sc-cyb').textContent = scVal[2];

  calcTotals();
  updateSkillRowsFromClass();
}

function updateSkillRowsFromClass() {
  const pos = document.getElementById('pos').value;
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;

  const rows = document.querySelectorAll('#skill-tbody tr');

  if (rows[0]) {
    const typeInput = rows[0].querySelector('.sk-type');
    if (typeInput) typeInput.value = pos;
    updateSkillSelectOptions(rows[0].querySelector('.sk-select'), [pos]);
  }

  for (let i = 1; i < rows.length; i++) {
    const typeInput = rows[i].querySelector('.sk-type');
    const selectElem = rows[i].querySelector('.sk-select');
    if (typeInput) {
      const role = typeInput.getAttribute('data-role');
      const targetClass = (role === 'sc') ? sc : mc;
      typeInput.value = targetClass;
      updateSkillSelectOptions(selectElem, [targetClass]);
    }
  }
}

function updateSkillSelectOptions(selectElem, categories) {
  if (!selectElem) return;
  const currentVal = selectElem.value;
  selectElem.innerHTML = '<option value="">-- スキルを選択 --</option>';

  categories.forEach(cat => {
    const skills = SKILL_DATABASE[cat];
    if (skills) {
      const group = document.createElement('optgroup');
      group.label = `【${cat}】`;

      skills.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        if (s.name === currentVal) opt.selected = true;
        group.appendChild(opt);
      });
      selectElem.appendChild(group);
    }
  });
}

function calcTotals() {
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;
  const mcVal = CLASS_PARTS[mc] || [0,0,0];
  const scVal = CLASS_PARTS[sc] || [0,0,0];

  const bonusRadio = document.querySelector('input[name="bonus"]:checked');
  const bonusType = bonusRadio ? bonusRadio.value : 'wep';

  const chouaiWep = parseInt(document.getElementById('chouai-wep').value, 10) || 0;
  const chouaiMut = parseInt(document.getElementById('chouai-mut').value, 10) || 0;
  const chouaiCyb = parseInt(document.getElementById('chouai-cyb').value, 10) || 0;

  let totalWep = mcVal[0] + scVal[0] + (bonusType === 'wep' ? 1 : 0) + chouaiWep;
  let totalMut = mcVal[1] + scVal[1] + (bonusType === 'mut' ? 1 : 0) + chouaiMut;
  let totalCyb = mcVal[2] + scVal[2] + (bonusType === 'cyb' ? 1 : 0) + chouaiCyb;

  document.getElementById('total-wep').textContent = totalWep;
  document.getElementById('total-mut').textContent = totalMut;
  document.getElementById('total-cyb').textContent = totalCyb;
}

function addSkillRow(typeText, roleRole, defaultSkillName = '') {
  const tbody = document.getElementById('skill-tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="sk-type" value="${typeText}" data-role="${roleRole}" readonly style="background:#151518;color:#aaa;"></td>
    <td>
      <select class="sk-select" onchange="onSkillSelectChange(this)">
        <option value="">-- スキルを選択 --</option>
      </select>
    </td>
    <td><textarea class="sk-memo" rows="1"></textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">削</button></td>
  `;
  tbody.appendChild(tr);

  const selectElem = tr.querySelector('.sk-select');
  updateSkillSelectOptions(selectElem, [typeText]);

  if (defaultSkillName) {
    selectElem.value = defaultSkillName;
    onSkillSelectChange(selectElem);
  }
}

function addPosSkillRow(skillName = '') {
  const pos = document.getElementById('pos').value;
  addSkillRow(pos, 'pos', skillName);
}

function addMcSkillRow(skillName = '') {
  const mc = document.getElementById('mc').value;
  addSkillRow(mc, 'mc', skillName);
}

function addScSkillRow(skillName = '') {
  const sc = document.getElementById('sc').value;
  addSkillRow(sc, 'sc', skillName);
}

function onSkillSelectChange(selectElem) {
  const tr = selectElem.closest('tr');
  const memoTextarea = tr.querySelector('.sk-memo');
  const selectedSkillName = selectElem.value;
  const typeInput = tr.querySelector('.sk-type');
  const category = typeInput ? typeInput.value : '';

  if (!selectedSkillName) {
    memoTextarea.value = '';
    return;
  }

  const skills = SKILL_DATABASE[category];
  if (skills) {
    const found = skills.find(s => s.name === selectedSkillName);
    if (found) {
      memoTextarea.value = found.memo;
    }
  }
}

function addRow(target = '', emotion = '', madness = '0') {
  const list = document.getElementById('list');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}" style="width:100%;"></td>
    <td><input type="text" value="${emotion}" style="width:100%;"></td>
    <td><input type="number" value="${madness}" style="width:60px;"></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">削</button></td>
  `;
  list.appendChild(tr);
}

function saveData() {
  const data = {
    pl: document.getElementById('pl').value,
    name: document.getElementById('name').value,
    pos: document.getElementById('pos').value,
    mc: document.getElementById('mc').value,
    sc: document.getElementById('sc').value,
    bonus: document.querySelector('input[name="bonus"]:checked')?.value || 'wep',
    chouaiWep: document.getElementById('chouai-wep').value,
    chouaiMut: document.getElementById('chouai-mut').value,
    chouaiCyb: document.getElementById('chouai-cyb').value,
    age: document.getElementById('age').value,
    ps: document.getElementById('ps').value,
    hint: document.getElementById('hint').value,
    mem: document.getElementById('mem').value,
    act: document.getElementById('act').value,
    fav: document.getElementById('fav').value,
    tr: document.getElementById('tr').value,
    customSections: customSections
  };

  const skills = [];
  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    skills.push({
      type: tr.querySelector('.sk-type')?.value || '',
      name: tr.querySelector('.sk-select')?.value || '',
      memo: tr.querySelector('.sk-memo')?.value || '',
      role: tr.querySelector('.sk-type')?.getAttribute('data-role') || ''
    });
  });
  data.skills = skills;

  const list = [];
  document.querySelectorAll('#list tr').forEach(tr => {
    list.push({
      target: tr.querySelector('.target')?.value || '',
      emotion: tr.querySelector('.emotion')?.value || '',
      madness: tr.querySelector('.madness')?.value || ''
    });
  });
  data.list = list;

  const parts = {};
  const baseIds = ['head', 'arm', 'body', 'leg'];
  baseIds.forEach(id => {
    parts[id] = [];
    const tbody = document.getElementById(`parts-tbody-${id}`);
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        parts[id].push({
          broken: tr.querySelector('input[type="checkbox"]')?.checked || false,
          name: tr.querySelector('.p-name')?.value || '',
          type: tr.querySelector('.p-type')?.value || '',
          level: tr.querySelector('.p-level')?.value || 1,
          timing: tr.querySelector('.p-timing')?.value || '',
          cost: tr.querySelector('.p-cost')?.value || '',
          range: tr.querySelector('.p-range')?.value || '',
          memo: tr.querySelector('.p-memo')?.value || ''
        });
      });
    }
  });
  data.parts = parts;

  localStorage.setItem('nechronica_sheet', JSON.stringify(data));
  alert('ブラウザにデータを保存しました。');
}

function loadData() {
  const jsonStr = localStorage.getItem('nechronica_sheet');
  if (!jsonStr) {
    alert('保存されたデータが見つかりません。');
    return;
  }
  try {
    const data = JSON.parse(jsonStr);
    document.getElementById('pl').value = data.pl || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('pos').value = data.pos || 'アリス';
    document.getElementById('mc').value = data.mc || 'ロマネスク';
    document.getElementById('sc').value = data.sc || 'ロマネスク';

    if (data.bonus) {
      const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
      if (radio) radio.checked = true;
    }

    document.getElementById('chouai-wep').value = data.chouaiWep || 0;
    document.getElementById('chouai-mut').value = data.chouaiMut || 0;
    document.getElementById('chouai-cyb').value = data.chouaiCyb || 0;
    document.getElementById('age').value = data.age || '';
    document.getElementById('ps').value = data.ps || '煉獄';
    document.getElementById('hint').value = data.hint || '';
    document.getElementById('mem').value = data.mem || '';
    document.getElementById('act').value = data.act || 9;
    document.getElementById('fav').value = data.fav || 0;
    document.getElementById('tr').value = data.tr || '';

    // カスタム部位がある場合は、各部位のパーツデータも含めて復元する
    if (data.customSections && Array.isArray(data.customSections)) {
      customSections = data.customSections.map(sec => {
        if (data.parts && data.parts[sec.id]) {
          return { ...sec, partsData: data.parts[sec.id] };
        }
        return sec;
      });
    } else {
      customSections = [];
    }

    renderPartsContainer();
    onClassChange();

    if (data.parts) {
      Object.keys(data.parts).forEach(id => {
        const tbody = document.getElementById(`parts-tbody-${id}`);
        if (tbody) {
          tbody.innerHTML = '';
          data.parts[id].forEach(p => {
            const isBase = ['head', 'arm', 'body', 'leg'].includes(id);
            addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, !isBase);
            const lastTr = tbody.lastElementChild;
            if (lastTr && p.broken) {
              const chk = lastTr.querySelector('input[type="checkbox"]');
              if (chk) {
                chk.checked = true;
                toggleBroken(chk);
              }
            }
          });
        }
      });
    }

    const skillTbody = document.getElementById('skill-tbody');
    skillTbody.innerHTML = '';
    if (data.skills && data.skills.length > 0) {
      data.skills.forEach(s => {
        addSkillRow(s.type, s.role || 'mc', s.name);
        const lastTr = skillTbody.lastElementChild;
        if (lastTr && s.memo) {
          lastTr.querySelector('.sk-memo').value = s.memo;
        }
      });
    }

    const listTbody = document.getElementById('list');
    listTbody.innerHTML = '';
    if (data.list && data.list.length > 0) {
      data.list.forEach(l => {
        addRow(l.target, l.emotion, l.madness);
      });
    }

    alert('データを読み込みました。');
  } catch (e) {
    console.error(e);
    alert('データの読み込みに失敗しました。');
  }
}

function exportJSON() {
  const jsonStr = localStorage.getItem('nechronica_sheet') || '{}';
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (document.getElementById('name').value || 'nechronica_chara') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCcfolia() {
  alert('ココフォリア出力機能が呼び出されました。');
}

// 初期化処理
window.onload = function() {
  renderPartsContainer();
  onClassChange();
  if (document.querySelectorAll('#skill-tbody tr').length === 0) {
    addPosSkillRow();
    addMcSkillRow();
    addMcSkillRow();
    addScSkillRow();
  }
  if (document.querySelectorAll('#list tr').length === 0) {
    addRow();
  }
};
