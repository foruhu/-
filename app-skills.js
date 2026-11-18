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

// 固定バーの「スキル」行：初期に取れる数(ポジション1・メインクラス2・サブクラス1)に対する、取得数と、取得しているスキルの名前
const SKILL_INITIAL_LIMITS = { pos: 1, mc: 2, sc: 1 };
// 固定バーの「武装・変異・改造」の行に、寵愛点で取得したパーツの数を添える(取得数の計算には、そのまま含まれる)
function updateBarChouaiParts() {
  const keys = { '武装': 'wep', '変異': 'mut', '改造': 'cyb' };
  const n = { wep: 0, mut: 0, cyb: 0 };
  try {
    document.querySelectorAll('#parts-container tr.part-row.chouai-acq').forEach(tr => {
      const k = keys[tr.querySelector('.p-type')?.value];
      if (k) n[k]++;
    });
  } catch (e) {}
  Object.keys(n).forEach(k => {
    const el = document.getElementById('bar-chouai-' + k);
    if (el) el.textContent = n[k] ? ` | 寵愛 ${n[k]}` : '';
  });
}

function updateBarSkills() {
  try { updateBarChouaiParts(); } catch (e) {}
  try { renderChouaiMarked(); } catch (e) {}
  const list = document.getElementById('bar-skill-list');
  const cnt = document.getElementById('bar-skill-counts');
  if (!list) return;
  try {
    const names = [];
    const rowsInfo = [];
    const catCount = {};
    const chouaiCat = {};
    document.querySelectorAll('#skill-tbody tr.skill-row').forEach(tr => {
      const v = tr.querySelector('select.skill-name-select')?.value;
      if (!v) return; // スキルを選んでいない行は数えない
      const cat0 = tr.querySelector('.skill-category')?.value || '';
      rowsInfo.push({ v, cat: cat0, ch: tr.classList.contains('chouai-acq') });
      if (tr.classList.contains('chouai-acq')) { const c0 = tr.querySelector('.skill-category')?.value || ''; chouaiCat[c0] = (chouaiCat[c0] || 0) + 1; names.push(v + '（寵）'); return; } // 寵愛点で取ったものは、初期の取得数には数えない
      names.push(v);
      const cat = tr.querySelector('.skill-category')?.value || '';
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
    const val = id => (document.getElementById(id)?.value || '');
    const pos = val('pos'), mc = val('mc'), sc = val('sc');
    const got = { pos: catCount[pos] || 0, mc: catCount[mc] || 0, sc: catCount[sc] || 0 };
    // メインクラスとサブクラスが同じクラスのときは、先にメインの2つ、残りをサブとして数える
    if (mc && mc === sc) { const n = catCount[mc] || 0; got.mc = Math.min(n, SKILL_INITIAL_LIMITS.mc); got.sc = Math.max(0, n - SKILL_INITIAL_LIMITS.mc); }
    // 寵愛で取ったスキルは、ポジション・メイン・サブごとに数える(同じクラスを重ねて選んだときは、ポジション→メイン→サブの順)
    const cc = { pos: 0, mc: 0, sc: 0 }; let chouaiSkills = 0, chouaiOther = 0;
    Object.keys(chouaiCat).forEach(c => {
      const n = chouaiCat[c]; chouaiSkills += n;
      if (c && c === pos) cc.pos += n; else if (c && c === mc) cc.mc += n; else if (c && c === sc) cc.sc += n; else chouaiOther += n;
    });
    // 名前の後ろに、ポジション・メイン・サブのどれのスキルかを付ける(同じクラスを重ねて選んだときは、メインの2つ→残りをサブ)
    const seen = {};
    const labeled = rowsInfo.map(r => {
      let lab = '';
      if (r.cat && r.cat === pos) lab = 'ポジション';
      else if (r.cat && r.cat === mc && r.cat === sc) { if (r.ch) lab = 'メイン'; else { seen[r.cat] = (seen[r.cat] || 0) + 1; lab = seen[r.cat] <= SKILL_INITIAL_LIMITS.mc ? 'メイン' : 'サブ'; } }
      else if (r.cat && r.cat === mc) lab = 'メイン';
      else if (r.cat && r.cat === sc) lab = 'サブ';
      return { lab, v: r.v, ch: r.ch };
    });
    const skillRow = (label, key) => {
      const lim = SKILL_INITIAL_LIMITS[key], n = got[key];
      const st = n > lim ? `<span class="limit-ng" style="color:#ff6666; font-weight:bold;">超過 (${n}/${lim})</span>` : (n > 0 ? `<span class="limit-selected" style="color:#88ff88;">OK (${n}/${lim})</span>` : `<span style="color:#f0c060; font-weight:bold;">未取得 (0/${lim})</span>`);
      return `<tr><td><b>${label}</b></td><td>スキル</td><td>${lim} 個</td><td><b>${n}</b> 個${cc[key] ? `<span style="color:#ffd24a;">+寵${cc[key]}</span>` : ''}</td><td>${st}</td></tr>`;
    };
    const chouaiParts = document.querySelectorAll('#parts-container tr.part-row.chouai-acq').length;
    const cParts = [chouaiOther ? `その他スキル<b>${chouaiOther}</b>` : '', chouaiParts ? `パーツ<b>${chouaiParts}</b>` : ''].filter(Boolean); // 印の付いたものだけ出す
    const extra = cParts.length ? `<br><span style="color:#ffd24a;white-space:nowrap;">寵愛で取得：${cParts.join('・')}</span>` : '';
    // 初期の取得数(寵愛で取ったものは除く)を超えたときは、理由を一言添える
    const warns = [['pos', 'ポジション'], ['mc', 'メイン'], ['sc', 'サブ']].filter(([k]) => got[k] > SKILL_INITIAL_LIMITS[k]).map(([k, l]) => `${l}${got[k]}/${SKILL_INITIAL_LIMITS[k]}`);
    const warn = warns.length ? `<br><span style="color:#ff8888;font-size:.85em;">⚠ ${warns.join('・')}：上限超過(寵愛で取ったものは、「寵」の印で除きます)</span>` : '';
    // 固定バー：武装・変異・改造と同じ形で「ポジション: 取得/上限 | メイン … | サブ …」(寵愛で取った数は+寵)
    const barLine = document.getElementById('bar-skill-line');
    if (barLine) barLine.innerHTML = [['pos', 'ポジション'], ['mc', 'メイン'], ['sc', 'サブ']].map(([k, l]) => `${l}: ${got[k]}/<span style="color:${got[k] > SKILL_INITIAL_LIMITS[k] ? '#ff8888' : '#8ff'};font-weight:bold;">${SKILL_INITIAL_LIMITS[k]}</span>${cc[k] ? `<span style="color:#ffd24a;">+寵${cc[k]}</span>` : ''}`).join(' | ');
    const tb = document.getElementById('skill-limit-tbody');
    if (tb) tb.innerHTML = skillRow('ポジション', 'pos') + skillRow('メイン', 'mc') + skillRow('サブ', 'sc');
    if (cnt) cnt.innerHTML = (extra + warn).replace(/^<br>/, '');
    const esc = x => String(x).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    // 「ポジション 氷の心 無茶(寵)　メイン …」の形で、区分ごとにまとめて出す。寵愛で取ったスキルは名前の後ろに(寵)を付け、金色にする
    const groups = ['ポジション', 'メイン', 'サブ', ''].map(g => ({ g, items: labeled.filter(o => o.lab === g) })).filter(x => x.items.length);
    list.innerHTML = groups.length ? groups.map(x => {
      const nm = x.items.map(o => o.ch ? `<span style="color:#ffd24a;font-weight:bold;">${esc(o.v)}(寵)</span>` : esc(o.v)).join(' ');
      return `<span style="display:inline-block;">${x.g ? `<b style="color:#c9a7ff;">${x.g}</b> ` : ''}${nm}</span>`;
    }).join('　') : 'なし';
    list.style.opacity = names.length ? '1' : '.6';
  } catch (e) { list.innerHTML = ''; if (cnt) cnt.textContent = ''; }
}

// 「寵愛点の使い道」の下に、いま寵の印が付いているものを一覧する(使い道に書いていないもの・書いてあるのに印がないものは注意を付ける)
function renderChouaiMarked() {
  const box = document.getElementById('chouai-marked-box');
  if (!box) return;
  try {
    const memos = chouaiMemoList();
    const sk = [], pt = [], unmarked = [];
    const eligible = tr => tr.querySelector('.chouai-btn') && !tr.classList.contains('no-chouai');
    document.querySelectorAll('#skill-tbody tr.skill-row').forEach(tr => {
      const v = tr.querySelector('.skill-name-select')?.value; if (!v || !eligible(tr)) return;
      const cat = tr.querySelector('.skill-category')?.value || '';
      const hit = chouaiNameHit(v, memos);
      if (tr.classList.contains('chouai-acq')) sk.push({ t: v + (cat ? `（${cat}）` : ''), hit });
      else if (hit) unmarked.push(v);
    });
    document.querySelectorAll('#parts-container tr.part-row').forEach(tr => {
      const v = tr.querySelector('.p-name')?.value; if (!v || !eligible(tr)) return;
      const loc = tr.querySelector('.p-location')?.value || '';
      const hit = chouaiNameHit(v, memos);
      if (tr.classList.contains('chouai-acq')) pt.push({ t: v + (loc ? `（${loc}）` : ''), hit });
      else if (hit) unmarked.push(v);
    });
    const li = a => a.map(o => `<span style="color:#ffd24a;font-weight:bold;">${escapeHtml(o.t)}</span>${o.hit ? '' : '<span style="color:#ff9f43;" title="使い道に、この名前が書かれていません">⚠未記入</span>'}`).join('・') || '<span style="color:#888;">なし</span>';
    let h = `<div><b style="color:#ffd24a;">寵が付いているもの</b></div><div>スキル：${li(sk)}</div><div>パーツ：${li(pt)}</div>`;
    if (sk.some(o => !o.hit) || pt.some(o => !o.hit)) h += '<div style="color:#ff9f43;font-size:.76rem;">⚠未記入：寵の印はありますが、上の「使い道・強化履歴」にその名前が書かれていません(書き忘れの確認用です。手で付けた印ならそのままで構いません)。</div>';
    if (unmarked.length) h += `<div style="color:#ff9f43;">使い道に書いてあるのに印がないもの：${unmarked.map(escapeHtml).join('・')}<span style="font-size:.76rem;">(「使い道から寵の印を付ける」で付けられます)</span></div>`;
    box.innerHTML = h;
  } catch (e) { box.innerHTML = '<span style="color:#888;">一覧を作れませんでした</span>'; }
}

// 「寵」ボタン：寵愛点で取得したスキル・パーツに、印を付ける/外す
function toggleChouaiAcq(btn) {
  const tr = btn && btn.closest('tr');
  if (!tr) return;
  tr.classList.toggle('chouai-acq');
  btn.setAttribute('aria-pressed', tr.classList.contains('chouai-acq') ? 'true' : 'false');
  try { calcTotals(); } catch (e) {}
  btn.dispatchEvent(new Event('change', { bubbles: true })); // 元に戻す・未保存の印などに、変更を伝える
}

// 「寵愛点の使い道・強化履歴」と連動して、スキル・パーツの行の「寵」の印を付け外しする
//  ・使い道に名前が書かれた(新しく一致した)行 → 印を付ける
//  ・書かれていた名前が消えた・書き換わった・行を削除した → その行の印を外す
//  ・使い道と関係なく手で付けた印は、そのまま残す
let chouaiSyncing = false;
let chouaiMemoSnap = null; // 前回の使い道の文章(差分で「新しく書かれた/消えた」を判定する)
function chouaiNorm(s) { return String(s || '').normalize('NFKC').replace(/\s+/g, ''); }
function chouaiMemoList() {
  return Array.from(document.querySelectorAll('#chouai-use-tbody .use-memo')).map(i => chouaiNorm(i.value)).filter(Boolean);
}
// 名前が、区切り(、・「」スペースなど)や「を習得」「取得」などで区切られた単語として書かれているときだけ一致(別の語の一部は対象外)
function chouaiNameHit(rawName, memos) {
  const name = chouaiNorm(rawName);
  if (name.length < 2 || !memos.length) return false;
  const basic = new Set();
  try { Object.values(DEFAULT_PARTS).forEach(a => a.forEach(p => basic.add(chouaiNorm(p.name)))); } catch (e) {}
  if (basic.has(name)) return false;
  const short = name.replace(/[(（][^)）]*[)）]/g, ''); // 「(歪曲)」などの括弧書きを除いた名前でも照合する
  const esc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const B = '(?:[\\s、,，・「『（(\\[【/／:：+＋]|を|で|に|は|が|と|の|も|へ|や)', A = '(?:$|[\\s、,，・」』）)\\]】/／:：+＋]|を|に|で|は|が|と|も|の|取得|習得|獲得|購入|追加|入手|修復|強化|習)';
  const cands = [name]; if (short.length >= 2 && short !== name) cands.push(short);
  return cands.some(w => { const re = new RegExp('(?:^|' + B + ')' + esc(w) + A); return memos.some(m => re.test(m)); });
}
// force=true(ボタン)のときは、いま一致している行すべてに印を付ける。通常は前回との差分だけを反映する
function autoMarkChouaiFromUses(silent, force) {
  if (chouaiSyncing) return 0;
  chouaiSyncing = true;
  try {
    const cur = chouaiMemoList();
    const prev = (chouaiMemoSnap === null || force) ? cur : chouaiMemoSnap;
    let added = 0, removed = 0;
    const apply = (tr, rawName) => {
      if (!tr || !tr.querySelector('.chouai-btn') || tr.classList.contains('no-chouai')) return; // 基本パーツ・たからもの行は対象外
      const now = chouaiNameHit(rawName, cur), before = chouaiNameHit(rawName, prev);
      const marked = tr.classList.contains('chouai-acq');
      if (now && (force || !before) && !marked) { tr.classList.add('chouai-acq'); added++; }
      else if (!now && before && marked) { tr.classList.remove('chouai-acq'); removed++; }
    };
    document.querySelectorAll('#skill-tbody tr').forEach(tr => apply(tr, tr.querySelector('.skill-name-select')?.value));
    document.querySelectorAll('#parts-container tr.part-row').forEach(tr => apply(tr, tr.querySelector('.p-name')?.value));
    chouaiMemoSnap = cur;
    if (added || removed) {
      try { calcTotals(); } catch (e) {}
      if (typeof markDirty === 'function') markDirty();
    }
    if (!silent) showToast((added || removed) ? `使い道の記載に合わせて、印を ${added}件付け・${removed}件外しました` : '印を付け外しする行はありませんでした(すでに印済み、または名前が記載にありません)');
    return added + removed;
  } catch (e) {
    if (!silent) showToast('判定に失敗しました：' + (e && e.message ? e.message : e));
    return 0; // 判定に失敗しても、ほかの計算は止めない
  } finally {
    chouaiSyncing = false;
  }
}

function calcTotals() {
  try { updateBarSkills(); } catch (e) {}
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

  document.querySelectorAll('#parts-container tr.part-row').forEach(tr => {
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

      let statusHtml;
      if (maxAllowed <= 0) {
        statusHtml = `<span style="color:#666;">対象外</span>`;
      } else if (current > maxAllowed) {
        statusHtml = `<span class="limit-ng" style="color:#ff6666; font-weight:bold;">超過 (${current}/${maxAllowed})</span>`;
      } else if (current > 0) {
        statusHtml = `<span class="limit-selected" style="color:#88ff88;">OK (${current}/${maxAllowed})</span>`;
      } else {
        statusHtml = `<span style="color:#f0c060; font-weight:bold;">未取得 (0/${maxAllowed})</span>`;
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
  if (typeof calcActionValue === 'function') calcActionValue();
}

// 狂気点は 0〜4。4/4 になったら赤くして、発狂が近い（到達した）ことが分かるようにする
function updateMadnessFull(input) {
  const v = parseInt(input.value, 10) || 0;
  const wrap = input.closest('.mad-pt');
  if (wrap) wrap.classList.toggle('full', v >= 4);
}
function stepMadness(btn, d) {
  const input = btn.closest('.mad-pt').querySelector('.mad-input');
  const v = Math.max(0, Math.min(4, (parseInt(input.value, 10) || 0) + d));
  if (String(v) === input.value) return;
  if (typeof pushUndoSnapshot === 'function') pushUndoSnapshot();
  input.value = v;
  updateMadnessFull(input);
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// 未練の1件は2行で表す：1行目＝対象・未練・狂気点、2行目＝発狂（発狂時の名前と効果）
function addRow(target = '', emotion = '', madness = 0, madName = '', madEffect = '') {
  const tbody = document.getElementById('list');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.className = 'miren-row';
  tr.innerHTML = `
    <td><input type="text" value="${escapeHtml(target)}"></td>
    <td><input type="text" value="${escapeHtml(emotion)}"></td>
    <td>
      <div class="mad-pt">
        <button type="button" class="mad-step edit-only" onclick="stepMadness(this, -1)" aria-label="狂気点を1減らす">−</button>
        <input type="number" class="mad-input" value="${Math.max(0, Math.min(4, parseInt(madness, 10) || 0))}" min="0" max="4" inputmode="numeric" oninput="updateMadnessFull(this)">
        <span class="mad-max">/4</span>
        <button type="button" class="mad-step edit-only" onclick="stepMadness(this, 1)" aria-label="狂気点を1増やす">＋</button>
      </div>
    </td>
    <td class="col-op"><button type="button" class="del" onclick="removeRowWithUndo(this)">X</button></td>
  `;
  const mad = document.createElement('tr');
  mad.className = 'miren-mad-row';
  mad.innerHTML = `
    <td colspan="4">
      <div class="miren-mad-box">
        <span class="miren-mad-label">発狂</span>
        <input type="text" class="miren-madname" value="${escapeHtml(madName)}" placeholder="発狂名（例: 幼児退行）">
        <textarea class="miren-madeffect" rows="1" placeholder="発狂時の効果" oninput="autoResizeTextarea(this)" onfocus="setTimeout(() => autoResizeTextarea(this), 80)">${escapeHtml(madEffect)}</textarea>
      </div>
    </td>
  `;
  tbody.appendChild(tr);
  tbody.appendChild(mad);
  updateMadnessFull(tr.querySelector('.mad-input'));
  const sync = () => mad.classList.toggle('empty', !mad.querySelector('.miren-madname').value.trim() && !mad.querySelector('.miren-madeffect').value.trim());
  mad.addEventListener('input', sync);
  sync();
  if (typeof autoResizeTextarea === 'function') autoResizeTextarea(mad.querySelector('.miren-madeffect'));
  markDirty();
}

function updateSkillOptions() {
  const selectedSkills = new Set(Array.from(document.querySelectorAll('#skill-tbody .skill-name-select')).map(s => s.value).filter(Boolean));

  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const select = tr.querySelector('.skill-name-select');
    if (!select) return;
    const category = tr.querySelector('.skill-category')?.value || '';
    const currentValue = select.value;

    let optionsHtml = '<option value="">-- スキルを選択 --</option>';
    if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
      SKILL_DATABASE[category].forEach(s => {
        const isSelectedByOther = selectedSkills.has(s.name) && s.name !== currentValue;
        const disabledAttr = isSelectedByOther ? 'disabled' : '';
        const baseName = s.tokka ? `${s.name}（特化）` : s.name;
        const labelText = isSelectedByOther ? `${baseName} (選択済み)` : baseName;
        optionsHtml += `<option value="${escapeHtml(s.name)}" ${s.name === currentValue ? 'selected' : ''} ${disabledAttr}>${labelText}</option>`;
      });
    }
    // スキル一覧に無い名前（保管所テキストの読み込みなど）が入っている場合も、選択肢として残して値が消えないようにする
    const inDb = !!(typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category] && SKILL_DATABASE[category].some(s => s.name === currentValue));
    if (currentValue && !inDb) {
      optionsHtml += `<option value="${escapeHtml(currentValue)}" selected>${escapeHtml(currentValue)}</option>`;
    }
    select.innerHTML = optionsHtml;
  });
  if (typeof refreshUnregisteredHints === 'function') refreshUnregisteredHints();
}

// スキルDBのメモ文字列「【名前】 タイミング/コスト/射程\n効果...」をタイミング・コスト・射程・効果本文に分解する
// スキルDBのメモ文字列「タイミング/コスト/射程\n効果...」をタイミング・コスト・射程・効果本文に分解する
// （表記ゆれ対策として、先頭に「【名前】」や単独の「【」が残っている場合は取り除いてから解析する）
function parseSkillMemo(memoText) {
  let text = memoText || '';
  text = text.replace(/^【[^】]*】\s*/, ''); // 「【名前】」がまだ付いている旧形式
  text = text.replace(/^【\s*/, '');          // 「【」だけが残ってしまっている表記ゆれ

  const match = text.match(/^([^\/\n]+)\/([^\/\n]+)\/([^\/\n]+)\n?([\s\S]*)$/);
  if (match) {
    return { timing: match[1].trim(), cost: match[2].trim(), range: match[3].trim(), effect: match[4] };
  }
  return { timing: '', cost: '', range: '', effect: text };
}

// スキルの「使用」チェックは、都度発生するタイミング（ジャッジ/ダメージ/ラピッド）の時だけ表示する
// （オートなど常時効果のスキルは、損傷と違って使う/使わないの管理が不要なため）
const SKILL_USED_CHECK_TIMINGS = ['ジャッジ', 'ダメージ', 'ラピッド'];

// タイミングは基本的にこの中から選ぶ（保存データ等に無い値が来た場合は、選択肢へその場で追加して失われないようにする）
const SKILL_TIMING_OPTIONS = ['', 'オート', 'アクション', 'ジャッジ', 'ダメージ', 'ラピッド', '参照'];

function buildTimingOptionsHtml(selected) {
  const options = SKILL_TIMING_OPTIONS.includes(selected) || !selected
    ? SKILL_TIMING_OPTIONS
    : [...SKILL_TIMING_OPTIONS, selected]; // 未知の値は選択肢の最後に追加して保持する
  return options.map(t => `<option value="${escapeHtml(t)}" ${t === selected ? 'selected' : ''}>${escapeHtml(t) || '（未選択）'}</option>`).join('');
}

// 既存のselectに無い値をセットしたい時、その場で選択肢へ追加してから値を反映する
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
  usedCb.style.visibility = shouldShow ? 'visible' : 'hidden';
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

function addSkillRow(category, skillName = '', timing = '', cost = '', range = '', memo = '', tag = '', isUsed = false, isChouai = false) {
  const tbody = document.getElementById('skill-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.className = 'skill-row';
  tr.innerHTML = `
    <td class="skill-used-cell"><input type="checkbox" class="skill-used" onchange="toggleSkillUsed(this)"></td>
    <td><input type="text" class="skill-category" value="${escapeHtml(category)}" readonly style="background:#1e1e24;color:#ccc;border:none;"></td>
    <td class="color-col"><select class="skill-tag" onchange="onManeuverCategoryChange(this)">${buildCategoryOptions(tag)}</select></td>
    <td><select class="skill-name-select" onchange="onSkillSelect(this)"><option value="">-- スキルを選択 --</option></select></td>
    <td><select class="skill-timing" onchange="updateSkillUsedCheckboxVisibility(this.closest('tr'))">${buildTimingOptionsHtml(timing)}</select></td>
    <td><input type="text" class="skill-cost" value="${escapeHtml(cost)}"></td>
    <td>${buildRangeCellHtml('skill-range', range)}</td>
    <td class="col-op"><span class="op-stack"><button type="button" class="chouai-btn" title="寵愛点で取得したものに印を付けます" onclick="toggleChouaiAcq(this)">寵</button><button type="button" class="del" onclick="removeRowWithUndo(this, () => { calcTotals(); updateSkillOptions(); })">X</button></span></td>
  `;
  if (isChouai) tr.classList.add('chouai-acq');
  tbody.appendChild(tr);

  const memoTr = document.createElement('tr');
  memoTr.className = 'skill-memo-row';
  memoTr.innerHTML = `<td colspan="8"><textarea class="skill-memo" oninput="onManeuverMemoInput(this, '.skill-tag')" onfocus="setTimeout(() => autoResizeTextarea(this), 80)" placeholder="効果メモ">${escapeHtml(memo)}</textarea></td>`;
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

  // 選択肢一覧を先に生成してから値をセットする（順序を逆にすると保存データの選択状態が復元されない）
  updateSkillOptions();
  if (skillName) {
    const nameSelect = tr.querySelector('.skill-name-select');
    if (!Array.from(nameSelect.options).some(o => o.value === skillName)) {
      const opt = document.createElement('option');
      opt.value = skillName;
      opt.textContent = skillName;
      nameSelect.appendChild(opt);
    }
    nameSelect.value = skillName;
  }
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
    if (rangeInput) { rangeInput.value = ''; syncRangeSelect(rangeInput); }
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
      // データ未登録のスキルは、前に自分で書いた効果があれば入れる
      if (!found.memo && typeof getEffectDict === 'function') {
        const mine = getEffectDict()[effectKeySkill(category, skillName)];
        if (mine && mine.memo) { parsed.timing = mine.timing || ''; parsed.cost = mine.cost || ''; parsed.range = mine.range || ''; parsed.effect = mine.memo; }
      }
      if (timingInput) setTimingSelectValue(timingInput, parsed.timing);
      if (costInput) costInput.value = parsed.cost;
      if (rangeInput) { rangeInput.value = parsed.range; syncRangeSelect(rangeInput); }
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

// --- 1. セッション履歴（獲得）の行追加 ---
function addSessionHistoryRow(scenario = '', battle = 0, personal = 0, memo = '') {
  const tbody = document.getElementById('session-history-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-scenario" value="${escapeHtml(scenario)}" placeholder="例: 狂い咲く薔薇" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="battle-pts" value="${escapeHtml(Number(battle) || 0)}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="personal-pts" value="${escapeHtml(Number(personal) || 0)}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-memo" value="${escapeHtml(memo)}" placeholder="例: 2026/05/10 通過" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td class="col-op" style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" class="edit-only" onclick="removeRowWithUndo(this, calcChouaiTotals)" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  markDirty();
  calcChouaiTotals();
}

// --- 2. 寵愛点の使い道（消費）の行追加 ---
function addChouaiUseRow(used = 0, memo = '') {
  const tbody = document.getElementById('chouai-use-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="used-pts" value="${escapeHtml(Number(used) || 0)}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #ff88c2; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="use-memo" oninput="calcChouaiTotals()" value="${escapeHtml(memo)}" placeholder="例: 武装基本値+1、基本パーツ修復" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td class="col-op" style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" class="edit-only" onclick="removeRowWithUndo(this, calcChouaiTotals)" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  chouaiMemoSnap = chouaiMemoList(); // 読み込み・行追加では、印を付け外ししない
  markDirty();
  calcChouaiTotals();
}

// --- 3. 寵愛点計算処理 ---
function calcChouaiTotals() {
  try { autoMarkChouaiFromUses(true); } catch (e) {}
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
  try { // 固定バーにも、残りの寵愛点を出す(獲得も使用も0のときは出さない)
    const row = document.getElementById('bar-chouai-pt-row'), el = document.getElementById('bar-chouai-pt');
    if (row && el) {
      row.style.display = (totalEarned || totalUsed) ? 'flex' : 'none';
      el.innerHTML = `残り <b style="color:${current < 0 ? '#ff4444' : '#8ff'};">${current}</b> pt <span style="color:#aaa;font-size:.85em;">(獲得${totalEarned} − 使用${totalUsed})</span>`;
    }
  } catch (e) {}
  try { renderChouaiMarked(); } catch (e) {}
}

// --- 保存・読込 ---


// スキル一覧にあるのに効果データが入っていないスキルは、効果メモ欄に「データ未登録」と出す（ルール上の空欄ではないと分かるように）
function refreshUnregisteredHints() {
  document.querySelectorAll('#skill-tbody tr:not(.skill-memo-row)').forEach(tr => {
    const memoTr = tr.nextElementSibling && tr.nextElementSibling.classList.contains('skill-memo-row') ? tr.nextElementSibling : null;
    const ta = memoTr ? memoTr.querySelector('.skill-memo') : null;
    if (!ta) return;
    const name = tr.querySelector('.skill-name-select')?.value || '';
    const category = tr.querySelector('.skill-category')?.value || '';
    let unregistered = false;
    if (name && typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
      const found = SKILL_DATABASE[category].find(s => s.name === name);
      unregistered = !!found && !found.memo;
    }
    ta.placeholder = unregistered ? 'データ未登録（ルルブを見て、手入力できます）' : '効果メモ';
  });
}
