// 設計図風の印刷：A4縦2枚（1枚目＝基本情報・記憶のカケラ・スキル・未練／2枚目＝行動値・頭腕胴脚のマニューバ）
// 公式シートの絵や題字は使わず、白黒の罫線だけで項目の並びを近づけたレイアウト
function printSheetLayout() {
  const d = getFullData();
  const E = escapeHtml;
  const sel = id => { const e = document.getElementById(id); return e && e.selectedIndex >= 0 && e.value ? e.options[e.selectedIndex].text : ''; };
  const txt = id => (document.getElementById(id)?.textContent || '').trim();
  const box = on => on ? '■' : '□';
  const pad = (rows, n, blank) => { const a = rows.slice(); while (a.length < n) a.push(blank); return a; };

  // 記憶のカケラ
  const mems = (d.memories || []).map(normalizeMemory).filter(m => m.name || m.detail || m.num);
  const memRows = pad(mems, 12, { num: '', name: '', detail: '' }).map(m =>
    `<tr><td class="sp-c">${E(m.name)}</td><td class="sp-c">${E(m.num)}</td><td>${E(m.detail)}</td></tr>`).join('');

  // スキル
  const skills = d.skills.filter(s => s.name);
  const skillRows = pad(skills, 4, null).map(s => s ?
    `<tr><td class="sp-c">${box(s.isUsed)}</td><td>${E(s.name)}</td><td class="sp-c">${E(s.timing)}</td><td class="sp-c">${E(s.cost)}</td><td class="sp-c">${E(s.range)}</td><td>${E(s.memo)}</td></tr>`
    : `<tr><td class="sp-c">□</td><td></td><td></td><td></td><td></td><td></td></tr>`).join('');

  // 未練
  const mirens = d.list.filter(m => m.target || m.emotion || m.madness || m.madName || m.madEffect);
  const dots = v => { const n = Math.max(0, Math.min(4, parseInt(v, 10) || 0)); return '●'.repeat(n) + '○'.repeat(4 - n); };
  const mirenRows = pad(mirens, 8, null).map(m => m ?
    `<tr><td>${E(m.target)}</td><td>${E(m.emotion)}</td><td class="sp-c">${dots(m.madness)}</td><td>${E([m.madName, m.madEffect].filter(Boolean).join('：'))}</td></tr>`
    : `<tr><td></td><td></td><td class="sp-c">○○○○</td><td></td></tr>`).join('');

  // マニューバ（部位ごと）
  const secs = [['頭', 10], ['腕', 9], ['胴', 8], ['脚', 7]];
  const minRows = { '頭': 7, '腕': 6, '胴': 6, '脚': 5 }; // 空欄の行数（攻撃判定値とは別。スマホの印刷でも2枚に収まるよう控えめ）
  const partSec = secs.map(([ch, atk]) => {
    const ps = d.parts.filter(p => (p.location || '').startsWith(ch));
    const rows = pad(ps, minRows[ch], null).map(p => {
      if (!p) return `<tr><td class="sp-c">□</td><td class="sp-c">□</td><td></td><td></td><td></td><td></td><td></td></tr>`;
      const nm = p.name + (p.type && p.type !== '基本' ? `(${p.type})` : '') + (p.level && p.level !== '1' ? ` Lv${p.level}` : '');
      return `<tr class="${p.isBroken ? 'sp-broken' : ''}"><td class="sp-c">${box(p.isBroken)}</td><td class="sp-c">${box(p.isUsed)}</td><td>${E(nm)}</td><td class="sp-c">${E(p.timing)}</td><td class="sp-c">${E(p.cost)}</td><td class="sp-c">${E(p.range)}</td><td>${E(p.memo)}</td></tr>`;
    }).join('');
    return `<div class="sp-sec"><div class="sp-bar">${ch}<span>攻撃判定値 ${atk}</span></div>
      <table class="sp-t sp-parts"><thead><tr><th>損</th><th>使</th><th>名称</th><th>タイミング</th><th>コスト</th><th>射程</th><th>効果</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join('');

  const act = d.act || '0', base = d.actBase || '0';
  const mod = (parseInt(act, 10) || 0) - (parseInt(base, 10) || 0);
  const foot = `<div class="sp-foot">Printed by ドール設計図館, ${E(location.origin + location.pathname)}</div>`;
  const html = `
  <section class="sp-page">
    <div class="sp-top">
      <div class="sp-left">
        <div class="sp-title">ドール設計図</div>
        <div class="sp-line"><span>ドール名</span><b>${E(d.name)}</b></div>
        <div class="sp-line"><span>プレイヤー名</span><b>${E(d.pl)}</b></div>
        <div class="sp-line sp-half"><span>享年</span><b>${E(d.age)}</b><span>暗示</span><b>${E(d.hint)}</b></div>
        <table class="sp-t sp-class"><tbody>
          <tr><th>ポジション</th><td>${E(sel('pos'))}</td></tr>
          <tr><th>メインクラス</th><td>${E(sel('mc'))}</td></tr>
          <tr><th>サブクラス</th><td>${E(sel('sc'))}</td></tr>
        </tbody></table>
      </div>
      <div class="sp-right">
        <table class="sp-t sp-stat"><tbody>
          <tr><th>武装</th><td>${E(txt('total-wep'))}</td></tr>
          <tr><th>変異</th><td>${E(txt('total-mut'))}</td></tr>
          <tr><th>改造</th><td>${E(txt('total-cyb'))}</td></tr>
        </tbody></table>
        <div class="sp-chouai">寵愛点<br><b>${E(txt('total-earned-chouai'))}</b> − <b>${E(txt('total-used-chouai'))}</b></div>
        <div class="sp-body">${E([d.height && '身長 ' + d.height, d.weight && '体重 ' + d.weight, d.hair && '髪 ' + d.hair, d.eye && '瞳 ' + d.eye, d.skin && '肌 ' + d.skin].filter(Boolean).join(' / '))}</div>
      </div>
    </div>
    <div class="sp-bottom">
    <div class="sp-sec"><div class="sp-bar">記憶のカケラ</div>
      <table class="sp-t"><thead><tr><th style="width:24%">タイトル</th><th style="width:7%">番号</th><th>記憶の内容</th></tr></thead><tbody>${memRows}</tbody></table></div>
    <div class="sp-sec"><div class="sp-bar">未練</div>
      <table class="sp-t sp-miren"><thead><tr><th>未練の対象</th><th>未練の内容</th><th>狂気点</th><th>発狂時</th></tr></thead><tbody>${mirenRows}</tbody></table></div>
    </div>
    ${foot}
  </section>
  <section class="sp-page">
    <div class="sp-act">
      <div class="sp-actbox"><span>最大行動値</span><b>${E(base)}</b> + <b>${mod}</b> = <b class="sp-big">${E(act)}</b></div>
      <div class="sp-ps"><span>初期配置</span>${['煉獄', '花園', '楽園'].map(x => `<i>${box(sel('ps') === x)}${x}</i>`).join('')}</div>
    </div>
    <div class="sp-sec"><div class="sp-bar">スキル</div>
      <table class="sp-t sp-skills"><thead><tr><th>使</th><th>名称</th><th>タイミング</th><th>コスト</th><th>射程</th><th>効果</th></tr></thead><tbody>${skillRows}</tbody></table></div>
    ${partSec}
    ${foot}
  </section>`;

  // 前に作った印刷用の表があれば消してから作り直す
  document.querySelectorAll('#sheet-print').forEach(e => e.remove());
  const wrap = document.createElement('div');
  wrap.id = 'sheet-print';
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  // 2枚目（スキル＋マニューバ）が1枚に収まるよう、行数と効果文の長さから高さを見積もって縮小する
  try {
    const pg2 = wrap.querySelectorAll('.sp-page')[1];
    if (pg2) {
      let est = 14;
      pg2.querySelectorAll('.sp-t').forEach(t => {
        est += 12; // 見出しの帯
        t.querySelectorAll('tbody tr').forEach(tr => {
          const txt = (tr.lastElementChild ? tr.lastElementChild.textContent : '') || '';
          const lines = Math.max(1, Math.ceil(txt.length / 42));
          est += Math.max(4.6, lines * 3.1 + 1.2);
        });
      });
      const room = 282;
      if (est > room) pg2.style.zoom = String(Math.max(0.5, room / est).toFixed(3));
    }
  } catch (e) {}
  document.body.classList.add('sheet-print-mode');
  // 画面には出ない（印刷のときだけ表示される）ので、印刷が終わるまで消さずに置いておく。
  // iPhoneのSafariは print() がすぐ戻ってくるため、ここですぐ消すと印刷プレビューが普通の画面になってしまう
  const done = () => { document.body.classList.remove('sheet-print-mode'); wrap.remove(); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 150);
}
