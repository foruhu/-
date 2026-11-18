// 画像で保存：キャラクターシートを1枚のPNG画像として書き出す（外部ライブラリなし・canvasで直接描画）
function exportSheetImage(opts) {
  opts = opts || {};
  const light = opts.theme === 'light', battle = !!opts.battle;
  const d = getFullData();
  const W = 900, PAD = 28, SC = opts.scale || 2, IW = W - PAD * 2;
  const F = 'sans-serif';
  const C = light
    ? { bg: '#ffffff', card: '#ffffff', line: '#b04040', title: '#a02020', text: '#111', sub: '#555', broken: '#999', accent: '#0a6a8a' }
    : { bg: '#161212', card: '#231a1a', line: '#7a2a2a', title: '#f0a0a0', text: '#eee', sub: '#aaa', broken: '#777', accent: '#8ff' };
  const selText = id => { const e = document.getElementById(id); return e && e.selectedIndex >= 0 && e.value ? e.options[e.selectedIndex].text : ''; };
  const txt = id => (document.getElementById(id)?.textContent || '').trim();
  const mc = selText('mc'), sc = selText('sc'), pos = selText('pos');

  const mctx = document.createElement('canvas').getContext('2d');
  const ops = [];
  let y = PAD;
  function wrap(s, w, font) {
    mctx.font = font;
    const out = [];
    String(s).split('\n').forEach(par => {
      let line = '';
      for (const ch of par) {
        if (mctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch;
      }
      out.push(line);
    });
    return out;
  }
  function text(s, x, size, color, opt = {}) {
    if (s === '' || s == null) return;
    const font = `${opt.bold ? 'bold ' : ''}${size}px ${F}`;
    const lines = wrap(s, opt.w || IW - (x - PAD), font);
    lines.forEach(l => {
      ops.push({ t: 'text', s: l, x, y: y + size, font, color, strike: opt.strike });
      y += Math.round(size * 1.45);
    });
  }
  function heading(s) {
    y += 10;
    ops.push({ t: 'line', x1: PAD, x2: W - PAD, y: y + 22, color: C.line });
    text(s, PAD, 17, C.title, { bold: true });
    y += 6;
  }
  const nonEmpty = a => a.filter(v => String(v || '').trim() !== '');

  // ヘッダ
  text(d.name || '(名前未入力)', PAD, 30, C.text, { bold: true });
  text([d.pl ? 'PL: ' + d.pl : '', pos ? '配置: ' + pos : '', mc || sc ? 'クラス: ' + [mc, sc].filter(Boolean).join(' / ') : ''].filter(Boolean).join('    '), PAD, 15, C.sub);
  const body = [d.age && '年齢 ' + d.age, d.height && '身長 ' + d.height, d.weight && '体重 ' + d.weight, d.hair && '髪 ' + d.hair, d.eye && '瞳 ' + d.eye, d.skin && '肌 ' + d.skin].filter(Boolean).join('   ');
  if (body && !battle) text(body, PAD, 14, C.sub);
  y += 6;
  text(`最大行動値 ${d.act}    損傷  基本 ${txt('bar-broken-base')}/${txt('bar-parts-base')}  強化 ${txt('bar-broken-ext')}/${txt('bar-parts-ext')}  宝 ${txt('bar-broken-tre')}/${txt('bar-parts-tre')}`, PAD, 16, C.title, { bold: true });
  text(`強化値(武装/変異/改造)  ${txt('total-wep')} / ${txt('total-mut')} / ${txt('total-cyb')}`, PAD, 14, C.text);
  if (d.ps && !battle) text('寵愛/PS: ' + selText('ps'), PAD, 13, C.sub);
  if (d.hint) text('暗示: ' + d.hint, PAD, 14, C.text);

  // 未練
  const miren = d.list.filter(m => m.target || m.emotion || m.madness || m.madName || m.madEffect);
  const tres = d.treasures.filter(t => t.name || t.content);
  if (tres.length || miren.length) {
    heading('たからもの・未練');
    tres.forEach(t => text(`【${t.location}】${t.name}${t.content ? '：' + t.content : ''}`, PAD + 6, 14, C.text));
    miren.forEach(m => {
      text(`${m.target}  ${m.emotion}${m.madness ? '  (狂気点 ' + m.madness + ')' : ''}`, PAD + 6, 14, C.text);
      if (m.madName || m.madEffect) text(`発狂時 ${m.madName}${m.madEffect ? '：' + m.madEffect : ''}`, PAD + 22, 13, C.sub);
    });
  }
  const mem = battle ? [] : nonEmpty(d.memories.map(memoryToText));
  if (mem.length) { heading('記憶のカケラ'); mem.forEach(m => text('・' + m, PAD + 6, 14, C.text)); }

  // スキル
  const sk = d.skills.filter(s => s.name);
  if (sk.length) {
    heading('スキル');
    sk.forEach(s => {
      text(`${s.name}${s.tag ? ' [' + s.tag + ']' : ''}   ${[s.timing, s.cost && 'コスト' + s.cost, s.range && '射程' + s.range].filter(Boolean).join(' / ')}`, PAD + 6, 14, s.isUsed ? C.broken : C.text, { bold: true });
      if (s.memo) text(s.memo, PAD + 22, 12, C.sub);
    });
  }

  // パーツ（部位ごと）
  const locs = ['頭', '腕', '胴', '脚'];
  const parts = d.parts;
  if (parts.length) {
    heading('マニューバ(パーツ)');
    const groups = {};
    parts.forEach(p => { const k = p.location || 'その他'; (groups[k] = groups[k] || []).push(p); });
    Object.keys(groups).sort((a, b) => { const ia = locs.findIndex(l => a.includes(l)), ib = locs.findIndex(l => b.includes(l)); return (ia < 0 ? 9 : ia) - (ib < 0 ? 9 : ib); }).forEach(k => {
      text('◆ ' + k, PAD + 4, 14, C.accent, { bold: true });
      groups[k].forEach(p => {
        const col = p.isBroken ? C.broken : C.text;
        text(`${p.isBroken ? '【損】' : ''}${p.name}${p.type && p.type !== '基本' ? ' (' + p.type + ')' : ''}${p.level && p.level !== '1' ? ' Lv' + p.level : ''}   ${[p.timing, p.cost && 'コスト' + p.cost, p.range && '射程' + p.range].filter(Boolean).join(' / ')}`, PAD + 14, 14, col, { strike: p.isBroken });
        if (p.memo) text(p.memo, PAD + 30, 12, p.isBroken ? C.broken : C.sub);
      });
    });
  }
  if (!battle && d.freeMemo && d.freeMemo.trim()) { heading('メモ'); text(d.freeMemo, PAD + 6, 13, C.sub); }
  y += 14;
  text('ドール設計図館', PAD, 11, C.broken);
  const H = y + PAD - 10;

  const cv = document.createElement('canvas');
  // 縦に長いシートでも、ブラウザのキャンバスの上限（面積約1600万px・1辺16384px）を超えないよう、倍率を下げる
  const SCe = Math.max(0.5, Math.min(SC, 16000 / H, Math.sqrt(16000000 / (W * H))));
  cv.width = Math.floor(W * SCe); cv.height = Math.floor(H * SCe);
  const ctx = cv.getContext('2d');
  ctx.scale(SCe, SCe);
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.card; ctx.fillRect(10, 10, W - 20, H - 20);
  ctx.textBaseline = 'alphabetic';
  ops.forEach(o => {
    if (o.t === 'line') { ctx.strokeStyle = o.color; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o.x1, o.y); ctx.lineTo(o.x2, o.y); ctx.stroke(); return; }
    ctx.font = o.font; ctx.fillStyle = o.color; ctx.fillText(o.s, o.x, o.y);
    if (o.strike) { const w = ctx.measureText(o.s).width; ctx.strokeStyle = o.color; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(o.x, o.y - 5); ctx.lineTo(o.x + w, o.y - 5); ctx.stroke(); }
  });

  if (opts.returnCanvas) return { cv, bg: C.bg };
  const fname = ((d.name || 'character') + (battle ? '_戦闘用' : '')).replace(/[\\/:*?"<>|]/g, '_') + '.png';
  savePngCanvas(cv, fname);
}

// 作った画像（canvas）をPNGとして保存する（iPhoneは画像を開いて長押しで保存）
// 画像を保存する。保存の操作を始められたら true、失敗したら false になる Promise を返す(呼び出し側は、待たなくてもよい)
function savePngCanvas(cv, fname) {
  return new Promise(resolve => {
    try {
      cv.toBlob(blob => {
        try {
          if (!blob) { alert('画像を作れませんでした'); resolve(false); return; }
          const url = URL.createObjectURL(blob);
          const ua = navigator.userAgent || '';
          const isIOS = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
          if (isIOS) {
            // iOSは直接ダウンロードできないので、画像を開いて長押しで保存してもらう
            const w = window.open(url, '_blank');
            if (!w) { alert('画像を開けませんでした。ポップアップを許可してください'); resolve(false); return; }
            setTimeout(() => alert('画像が開いたら、長押しして「写真に追加」で保存できます'), 300);
          } else {
            const a = document.createElement('a');
            a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
          }
          resolve(true);
        } catch (err) { alert('画像を保存できませんでした。\n（' + (err && err.message ? err.message : err) + '）'); resolve(false); }
      }, 'image/png');
    } catch (err) { alert('画像を作れませんでした。\n（' + (err && err.message ? err.message : err) + '）'); resolve(false); }
  });
}

// 画像の書き出し方（配色・内容）を選ぶ小さなダイアログ
function openImageOptions() {
  if (document.getElementById('img-opt-overlay')) return;
  const ov = document.createElement('div');
  ov.id = 'img-opt-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10001;padding:16px;overflow-y:auto;';
  const battleOn = document.body.classList.contains('battle-view');
  ov.innerHTML = `<div style="max-width:380px;margin:60px auto;background:#18181c;border:1.5px solid #8b0000;border-radius:10px;padding:14px;color:#eee;">
    <div style="color:#f0a0a0;font-weight:bold;margin-bottom:10px;">🖼 画像で保存</div>
    <div style="font-size:.8rem;color:#aaa;margin-bottom:4px;">配色</div>
    <label style="display:block;margin:2px 0;"><input type="radio" name="img-theme" value="dark" checked> 暗い背景（画面と同じ）</label>
    <label style="display:block;margin:2px 0;"><input type="radio" name="img-theme" value="light"> 白い背景（印刷・資料向け）</label>
    <div style="font-size:.8rem;color:#aaa;margin:10px 0 4px;">内容</div>
    <label style="display:block;margin:2px 0;"><input type="radio" name="img-content" value="all" ${battleOn ? '' : 'checked'}> すべて</label>
    <label style="display:block;margin:2px 0;"><input type="radio" name="img-content" value="battle" ${battleOn ? 'checked' : ''}> 戦闘用（記憶のカケラ・メモなどを除く）</label>
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
      <button type="button" class="sec" id="img-opt-cancel">やめる</button>
      <button type="button" id="img-opt-ok">保存する</button>
    </div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  document.getElementById('img-opt-cancel').onclick = close;
  document.getElementById('img-opt-ok').onclick = () => {
    const theme = ov.querySelector('input[name="img-theme"]:checked').value;
    const battle = ov.querySelector('input[name="img-content"]:checked').value === 'battle';
    close();
    exportSheetImage({ theme, battle });
  };
}

// ==========================================================
// 卓まとめ画像：保存済みの複数のキャラクターを、1枚の画像に並べて書き出す
// ==========================================================
const GROUP_IMG_MAX = 8;
function openGroupImageOptions() {
  if (document.getElementById('grp-opt-overlay')) return;
  const sheets = getSavedSheets();
  const ids = Object.keys(sheets).filter(i => i !== 'autosave_draft' && sheets[i] && sheets[i].data)
    .sort((a, b) => String(sheets[a].name || '').localeCompare(String(sheets[b].name || ''), 'ja'));
  if (ids.length < 2) return alert('卓まとめ画像には、保存済みのキャラクターが2人以上必要です。先に「ブラウザに保存」でキャラクターを保存してください');
  const ov = document.createElement('div');
  ov.id = 'grp-opt-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10001;padding:16px;overflow-y:auto;';
  const list = ids.map(id => `<label style="display:block;margin:3px 0;"><input type="checkbox" class="grp-chk" value="${escapeHtml(id)}"> ${escapeHtml(sheets[id].name || '(無名)')}${sheets[id].pl ? `<span style="color:#999;font-size:.75rem;">（PL：${escapeHtml(sheets[id].pl)}）</span>` : ''}</label>`).join('');
  ov.innerHTML = `<div style="max-width:380px;margin:40px auto;background:#18181c;border:1.5px solid #8b0000;border-radius:10px;padding:14px;color:#eee;">
    <div style="color:#f0a0a0;font-weight:bold;margin-bottom:8px;">📚 卓まとめ画像</div>
    <div style="font-size:.78rem;color:#aaa;margin-bottom:6px;">1枚に並べるキャラクターを選んでください（2〜${GROUP_IMG_MAX}人）。<span id="grp-count"></span></div>
    <div style="max-height:36vh;overflow-y:auto;border:1px solid #333;border-radius:6px;padding:6px;">${list}</div>
    <div style="font-size:.8rem;color:#aaa;margin:10px 0 4px;">配色</div>
    <label style="display:block;margin:2px 0;"><input type="radio" name="grp-theme" value="dark" checked> 暗い背景</label>
    <label style="display:block;margin:2px 0;"><input type="radio" name="grp-theme" value="light"> 白い背景（印刷・資料向け）</label>
    <div style="font-size:.8rem;color:#aaa;margin:10px 0 4px;">内容</div>
    <label style="display:block;margin:2px 0;"><input type="radio" name="grp-content" value="battle" checked> 戦闘用（記憶のカケラ・メモなどを除く）</label>
    <label style="display:block;margin:2px 0;"><input type="radio" name="grp-content" value="all"> すべて</label>
    <div id="grp-msg" style="color:#ffcf70;font-size:.78rem;min-height:1.2em;margin-top:8px;"></div>
    <div style="display:flex;gap:8px;margin-top:8px;justify-content:flex-end;">
      <button type="button" class="sec" id="grp-cancel">やめる</button>
      <button type="button" id="grp-ok">画像にする</button>
    </div></div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  const upd = () => { const n = ov.querySelectorAll('.grp-chk:checked').length; ov.querySelector('#grp-count').textContent = `（${n}人 選択中）`; };
  ov.addEventListener('change', e => {
    if (e.target.classList && e.target.classList.contains('grp-chk') && ov.querySelectorAll('.grp-chk:checked').length > GROUP_IMG_MAX) {
      e.target.checked = false;
      ov.querySelector('#grp-msg').textContent = `一度に選べるのは${GROUP_IMG_MAX}人までです`;
    }
    upd();
  });
  upd();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  ov.querySelector('#grp-cancel').onclick = close;
  ov.querySelector('#grp-ok').onclick = () => {
    const sel = Array.from(ov.querySelectorAll('.grp-chk:checked')).map(c => c.value);
    if (sel.length < 2) { ov.querySelector('#grp-msg').textContent = '2人以上選んでください'; return; }
    const theme = ov.querySelector('input[name="grp-theme"]:checked').value;
    const battle = ov.querySelector('input[name="grp-content"]:checked').value === 'battle';
    ov.querySelector('#grp-msg').textContent = '画像を作っています…';
    // 「画像を作っています」を先に描画してから、重い処理を始める
    setTimeout(async () => {
      let okDone = false;
      try { okDone = await exportGroupImage(sel, { theme, battle }); } catch (e) { okDone = false; }
      // 保存の操作まで済んだときだけ閉じる(失敗したときは、画面を残して理由を出す)
      if (okDone) close(); else { const m = ov.querySelector('#grp-msg'); if (m) m.textContent = '画像を作れませんでした。人数を減らして、もう一度お試しください'; }
    }, 30);
  };
}

// 選んだキャラクターを1人ずつシートに読み込んで描き、最後に元の編集内容へ戻す。成功したら true
function exportGroupImage(ids, opts) {
  const sheets = getSavedSheets();
  const backup = getFullData();
  const wasDirty = isDirty;
  const parts = [];
  try {
    for (const id of ids) {
      const e = sheets[id];
      if (!e || !e.data) throw new Error('「' + id + '」のデータが見つかりません');
      applyData(JSON.parse(JSON.stringify(e.data)));
      const r = exportSheetImage({ theme: opts.theme, battle: opts.battle, scale: 1, returnCanvas: true });
      if (!r || !r.cv) throw new Error('シートを描けませんでした');
      parts.push(r);
    }
  } catch (err) {
    alert('卓まとめ画像を作れませんでした。\n（' + (err && err.message ? err.message : err) + '）');
    return false;
  } finally {
    // 途中で失敗しても、今編集していた内容を必ず元に戻す
    try { applyData(backup); } catch (e2) { alert('元の編集内容の復元に失敗しました。「↩️ 元に戻す」を押してください'); }
    isDirty = wasDirty;
  }
  try {
    const n = parts.length;
    const cols = n <= 1 ? 1 : (n <= 4 ? 2 : 3);
    const gap = 16;
    const rows = Math.ceil(n / cols);
    const cw = parts[0].cv.width;
    const rowH = [];
    for (let r = 0; r < rows; r++) rowH.push(Math.max(...parts.slice(r * cols, r * cols + cols).map(p => p.cv.height)));
    const TW = cols * cw + (cols + 1) * gap;
    const TH = rowH.reduce((a, b) => a + b, 0) + (rows + 1) * gap;
    // ブラウザのキャンバスの上限を超えないよう、大きすぎるときは縮める
    const k = Math.min(1, 16000 / TH, 16000 / TW, Math.sqrt(16000000 / (TW * TH)));
    if (k < 0.3) throw new Error('画像が大きすぎます。人数を減らしてください');
    const cv = document.createElement('canvas');
    cv.width = Math.floor(TW * k); cv.height = Math.floor(TH * k);
    const ctx = cv.getContext('2d');
    if (!ctx) throw new Error('画像を描く領域を用意できませんでした');
    ctx.fillStyle = parts[0].bg; ctx.fillRect(0, 0, cv.width, cv.height);
    let y = gap;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p = parts[r * cols + c];
        if (!p) continue;
        ctx.drawImage(p.cv, Math.floor((gap + c * (cw + gap)) * k), Math.floor(y * k), Math.floor(p.cv.width * k), Math.floor(p.cv.height * k));
      }
      y += rowH[r] + gap;
    }
    return savePngCanvas(cv, '卓まとめ_' + n + '人' + (opts.battle ? '_戦闘用' : '') + '.png'); // 保存の操作が済んでから、呼び出し側が画面を閉じる
  } catch (err) {
    alert('卓まとめ画像を作れませんでした。\n（' + (err && err.message ? err.message : err) + '）');
    return false;
  }
}
