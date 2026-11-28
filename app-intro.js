// 紹介画像：背景と立ち絵を選び、名前・スキル・マニューバ・未練を重ねた、見せるための1枚の画像(PNG)を作る
// （外部ライブラリなし・canvasで直接描画。保存のしくみは「画像で保存」と同じ savePngCanvas を使う）
const INTRO_LAYOUTS = {
  v: { w: 1080, h: 1350, label: '縦長（1080×1350）' },
  h: { w: 1600, h: 900, label: '横長（1600×900）' }
};
// 背景の見本。stops は上から下への色、grid は格子の線を重ねる
const INTRO_BGS = [
  { id: 'grid', name: '格子', stops: ['#1b2a78', '#0d1440'], grid: true },
  { id: 'night', name: '暗夜', stops: ['#0b0b18', '#2a1a44'] },
  { id: 'blood', name: '血', stops: ['#1a0505', '#6b1414'] },
  { id: 'dusk', name: '薄暮', stops: ['#2b1b4d', '#c9603a'] },
  { id: 'ash', name: '灰', stops: ['#1c1c1f', '#5a5a62'] },
  { id: 'paper', name: '白', stops: ['#f4f1ea', '#cfc7b8'] }
];
const INTRO_SHOW_ITEMS = [['stats', '行動値・強化値'], ['skills', 'スキル'], ['parts', 'マニューバ'], ['miren', '未練']];
// 見本の立ち絵（samples フォルダの画像。パソコンの中のファイルとして直接開いているときは、画像を取り込めないので出さない）
const INTRO_SAMPLES = [
  { file: 'doll_blonde', name: '金髪' },
  { file: 'doll_blonde_smile', name: '金髪（笑顔）' },
  { file: 'doll_blonde_angry', name: '金髪（怒り）' },
  { file: 'doll_blonde_surprise', name: '金髪（驚き）' },
  { file: 'doll_lavender', name: '紫髪（日傘）' }
];
const introSamplesUsable = () => /^https?:$/.test(location.protocol);
const INTRO_PREF_KEY = 'necro_intro_prefs';
const INTRO_FILE_MAX = 30 * 1024 * 1024;
const INTRO_FONT = 'sans-serif';
let introState = null;
let introRenderQueued = false;

// ---------- 設定の記憶（開いたとき前回の選び方になる。立ち絵の位置は残さない） ----------
function introLoadPrefs() {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(INTRO_PREF_KEY) || 'null') || {}; } catch (e) { o = {}; }
  if (typeof o !== 'object') o = {};
  const show = {};
  INTRO_SHOW_ITEMS.forEach(([k]) => { show[k] = !(o.show && o.show[k] === false); });
  return {
    layout: INTRO_LAYOUTS[o.layout] ? o.layout : 'v',
    bg: INTRO_BGS.some(b => b.id === o.bg) ? o.bg : 'grid',
    dim: (typeof o.dim === 'number' && o.dim >= 0 && o.dim <= 0.7) ? o.dim : 0.3,
    show
  };
}
function introSavePrefs() {
  if (!introState) return;
  try { localStorage.setItem(INTRO_PREF_KEY, JSON.stringify({ layout: introState.layout, bg: introState.bg, dim: introState.dim, show: introState.show })); } catch (e) { /* 残せなくても、使うには困らない */ }
}

// ---------- 画像の読み込み ----------
function introLoadImage(src) {
  return new Promise((resolve, reject) => {
    const im = new Image();
    im.onload = () => (im.naturalWidth > 0 && im.naturalHeight > 0 ? resolve(im) : reject(new Error('empty')));
    im.onerror = () => reject(new Error('load'));
    im.src = src;
  });
}
function introReadFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error('none')); return; }
    if (file.type && !/^image\//.test(file.type)) { reject(new Error('type')); return; }
    if (file.size > INTRO_FILE_MAX) { reject(new Error('big')); return; }
    let url = '';
    try { url = URL.createObjectURL(file); } catch (e) { reject(new Error('load')); return; }
    introLoadImage(url).then(im => { URL.revokeObjectURL(url); resolve(im); }).catch(e => { URL.revokeObjectURL(url); reject(e); });
  });
}
function introImageErrorText(e) {
  const m = e && e.message;
  if (m === 'big') return '画像が大きすぎます（30MBまで）。小さい画像を選んでください';
  if (m === 'type') return '画像ファイルを選んでください';
  if (m === 'none') return '';
  return '画像を読み込めませんでした。別の画像を選んでください';
}

// ---------- シートの内容を集める ----------
function introGatherData() {
  const d = getFullData();
  const selText = id => { const e = document.getElementById(id); return e && e.selectedIndex >= 0 && e.value ? e.options[e.selectedIndex].text : ''; };
  const txt = id => (document.getElementById(id)?.textContent || '').trim();
  const parts = [];
  ['頭', '腕', '胴', '脚'].forEach(lab => {
    const names = (d.parts || []).filter(p => p.name && (p.location || '').includes(lab)).map(p => (p.isBroken ? '×' : '') + p.name);
    if (names.length) parts.push({ label: lab, names });
  });
  return {
    name: (d.name || '').trim() || '(名前未入力)',
    classes: [selText('pos'), selText('mc'), selText('sc')].filter(Boolean),
    act: d.act,
    enh: [txt('total-wep') || '0', txt('total-mut') || '0', txt('total-cyb') || '0'],
    skills: (d.skills || []).filter(s => s.name).map(s => s.name),
    parts,
    miren: (d.list || []).filter(m => m.target || m.emotion)
  };
}

// ---------- 描画の部品 ----------
function introWrap(ctx, s, w, font) {
  ctx.font = font;
  const out = [];
  String(s).split('\n').forEach(par => {
    let line = '';
    for (const ch of par) {
      if (ctx.measureText(line + ch).width > w && line) { out.push(line); line = ch; } else line += ch;
    }
    out.push(line);
  });
  return out;
}
function introRoundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function introDrawBackground(ctx, W, H, st) {
  if (st.bgImg) {
    const iw = st.bgImg.naturalWidth, ih = st.bgImg.naturalHeight;
    const s = Math.max(W / iw, H / ih);
    ctx.drawImage(st.bgImg, (W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s);
    if (st.dim > 0) { ctx.fillStyle = `rgba(0,0,0,${st.dim})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  const bg = INTRO_BGS.find(b => b.id === st.bg) || INTRO_BGS[0];
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, bg.stops[0]); g.addColorStop(1, bg.stops[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (bg.grid) {
    ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, H); }
    for (let y = 0; y <= H; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(W, y + .5); }
    ctx.stroke();
  }
}
function introDrawPortrait(ctx, W, H, st) {
  const im = st.pImg;
  if (!im) return;
  const iw = im.naturalWidth, ih = im.naturalHeight;
  const vertical = st.layout === 'v';
  const base = vertical ? Math.min(H * 0.95 / ih, W / iw) : Math.min(H / ih, W * 0.5 / iw);
  const s = base * st.ps;
  const cx = (vertical ? W / 2 : W * 0.27) + st.px * W;
  const bottom = H + st.py * H;
  ctx.save();
  ctx.translate(cx, bottom);
  if (st.flip) ctx.scale(-1, 1);
  ctx.drawImage(im, -iw * s / 2, -ih * s, iw * s, ih * s);
  ctx.restore();
}

// 文字の大きさの倍率 fs で、パネルの中身を並べる(座標はパネルの中身の左上が原点)
function introBuildContent(ctx, data, st, iw, fs, headerInPanel) {
  const F = INTRO_FONT;
  const ops = [];
  let y = 0;
  const u = (headerInPanel ? 30 : 36) * fs;
  const gap = u * 0.55;
  const ACC = '#9fd8ff', SUB = '#c9c9d6';
  const text = (s, x, size, color, opt = {}) => {
    const font = `${opt.bold ? 'bold ' : ''}${size}px ${F}`;
    introWrap(ctx, s, iw - x, font).forEach(l => {
      ops.push({ t: 'text', s: l, x, y: y + size, font, color });
      y += Math.round(size * 1.42);
    });
  };
  const title = s => {
    y += gap;
    const size = u * 0.78, font = `bold ${size}px ${F}`;
    ctx.font = font;
    const w = ctx.measureText(s).width;
    ops.push({ t: 'text', s, x: 0, y: y + size, font, color: ACC });
    ops.push({ t: 'rule', x1: w + 14, x2: iw, y: y + size * 0.62 });
    y += Math.round(size * 1.55);
  };
  if (headerInPanel) {
    text(data.name, 0, u * 2.1, '#fff', { bold: true });
    if (data.classes.length) text(data.classes.join(' / '), 0, u * 0.95, SUB);
    y += gap * 0.4;
  }
  if (st.show.stats) {
    y += gap;
    const rowH = Math.round(u * 1.95);
    const chips = [['最大行動値', String(data.act || '-')], ['強化値', `武装 ${data.enh[0]}  変異 ${data.enh[1]}  改造 ${data.enh[2]}`]];
    let x = 0;
    chips.forEach(([k, v]) => {
      ctx.font = `bold ${u * 0.78}px ${F}`; const kw = ctx.measureText(k).width;
      ctx.font = `bold ${u}px ${F}`; const vw = ctx.measureText(v).width;
      const w = kw + vw + u * 1.7;
      if (x > 0 && x + w > iw) { x = 0; y += rowH + Math.round(u * 0.3); }
      ops.push({ t: 'chip', x, y, w, h: rowH, k, v, u });
      x += w + u * 0.45;
    });
    y += rowH;
  }
  if (st.show.skills && data.skills.length) {
    title('スキル');
    text(data.skills.join('　／　'), 0, u, '#fff');
  }
  if (st.show.parts && data.parts.length) {
    title('マニューバ');
    data.parts.forEach(g => {
      const y0 = y;
      text(g.names.join('・'), u * 1.8, u, '#fff');
      ops.push({ t: 'text', s: g.label, x: 0, y: y0 + u, font: `bold ${u}px ${F}`, color: ACC });
      y += Math.round(u * 0.12);
    });
  }
  if (st.show.miren && data.miren.length) {
    title('未練');
    data.miren.slice(0, 2).forEach(m => {
      const mad = m.madness ? `（狂気点 ${parseInt(m.madness, 10) || 0}/4）` : '';
      text(`◆ ${m.target || '？'}　${m.emotion || ''}${mad}`, 0, u, '#fff');
    });
    if (data.miren.length > 2) text(`ほか${data.miren.length - 2}件`, 0, u * 0.9, SUB);
  }
  return { ops, h: y };
}
function introDrawOps(ctx, ops, ox, oy) {
  ctx.textBaseline = 'alphabetic';
  ops.forEach(o => {
    if (o.t === 'text') { ctx.font = o.font; ctx.fillStyle = o.color; ctx.fillText(o.s, ox + o.x, oy + o.y); return; }
    if (o.t === 'rule') { ctx.strokeStyle = 'rgba(159,216,255,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(ox + o.x1, oy + o.y); ctx.lineTo(ox + o.x2, oy + o.y); ctx.stroke(); return; }
    if (o.t === 'chip') {
      introRoundRect(ctx, ox + o.x, oy + o.y, o.w, o.h, o.h / 2);
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.5; ctx.stroke();
      const mid = oy + o.y + o.h / 2;
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${o.u * 0.78}px ${INTRO_FONT}`; ctx.fillStyle = '#9fd8ff';
      ctx.fillText(o.k, ox + o.x + o.u * 0.75, mid);
      const kw = ctx.measureText(o.k).width;
      ctx.font = `bold ${o.u}px ${INTRO_FONT}`; ctx.fillStyle = '#fff';
      ctx.fillText(o.v, ox + o.x + o.u * 0.75 + kw + o.u * 0.3, mid);
      ctx.textBaseline = 'alphabetic';
    }
  });
}

// 紹介画像を cv に描く。入りきらない項目があれば、overflow: true を返す
function introDraw(cv, st, data) {
  const L = INTRO_LAYOUTS[st.layout] || INTRO_LAYOUTS.v;
  const W = L.w, H = L.h;
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  ctx.textBaseline = 'alphabetic';
  introDrawBackground(ctx, W, H, st);
  introDrawPortrait(ctx, W, H, st);
  const vertical = st.layout === 'v';
  const PAD = vertical ? 34 : 36;
  let pw, px, maxH;
  if (vertical) { pw = W - 80; px = 40; maxH = 740; } else { pw = 740; px = W - 40 - pw; maxH = H - 80; }
  const iw = pw - PAD * 2;
  // 名前と、ポジション・クラス(縦長は、画像の上に直接書く)
  if (vertical) {
    let size = 92;
    ctx.font = `bold ${size}px ${INTRO_FONT}`;
    while (size > 44 && ctx.measureText(data.name).width > W - 112) { size -= 4; ctx.font = `bold ${size}px ${INTRO_FONT}`; }
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 14;
    ctx.fillStyle = '#fff';
    ctx.fillText(data.name, 56, 56 + size);
    if (data.classes.length) {
      ctx.font = `bold 34px ${INTRO_FONT}`; ctx.fillStyle = '#e8ecff';
      ctx.fillText(data.classes.join(' / '), 58, 56 + size + 54);
    }
    ctx.restore();
  }
  // 中身の大きさを、入りきるまで縮めて決める
  let fs = 1, built = null;
  for (; fs >= 0.549; fs -= 0.05) {
    built = introBuildContent(ctx, data, st, iw, fs, !vertical);
    if (built.h + PAD * 2 <= maxH) break;
  }
  const overflow = built.h + PAD * 2 > maxH;
  const ph = Math.min(maxH, Math.round(built.h + PAD * 2));
  const py = vertical ? H - 40 - ph : Math.round((H - ph) / 2);
  ctx.save();
  introRoundRect(ctx, px, py, pw, ph, 28);
  ctx.fillStyle = 'rgba(10,10,20,.76)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.stroke();
  introRoundRect(ctx, px, py, pw, ph, 28); ctx.clip();
  introDrawOps(ctx, built.ops, px + PAD, py + PAD);
  ctx.restore();
  ctx.save();
  ctx.font = `16px ${INTRO_FONT}`; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.textAlign = 'right';
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 4;
  ctx.fillText('ドール設計図館', W - 20, H - 14);
  ctx.restore();
  return { overflow };
}

// ---------- 設定の画面 ----------
function introSetStatus(msg, bad) {
  const el = document.getElementById('intro-status');
  if (!el) return;
  el.textContent = msg || '';
  el.style.color = bad ? '#ff9a9a' : '#9fd8ff';
  el.style.display = msg ? '' : 'none';
}
function introRender() {
  const cv = document.getElementById('intro-canvas');
  if (!cv || !introState) return;
  try {
    const r = introDraw(cv, introState, introGatherData());
    if (introState.fileError) introSetStatus(introState.fileError, true);
    else if (r.overflow) introSetStatus('項目が多いため、一部が入りきりません。「載せる項目」を減らしてください', true);
    else introSetStatus('', false);
  } catch (e) {
    introSetStatus('プレビューを作れませんでした。（' + (e && e.message ? e.message : e) + '）', true);
  }
}
function introRenderSoon() {
  if (introRenderQueued) return;
  introRenderQueued = true;
  requestAnimationFrame(() => { introRenderQueued = false; introRender(); });
}
function introCloseDialog() {
  const ov = document.getElementById('intro-overlay');
  if (ov) ov.remove();
  introState = null;
}

function openIntroImage() {
  if (document.getElementById('intro-overlay')) return;
  const prefs = introLoadPrefs();
  introState = { layout: prefs.layout, bg: prefs.bg, dim: prefs.dim, show: prefs.show, bgImg: null, pImg: null, ps: 1, px: 0, py: 0, flip: false, fileError: '' };
  const saved = (typeof currentImageList === 'function') ? currentImageList() : [];
  const ov = document.createElement('div');
  ov.id = 'intro-overlay';
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:10001;overflow-y:auto;';
  const lab = 'display:block;margin:3px 0;';
  const h = 'font-size:.8rem;color:#aaa;margin:12px 0 4px;';
  const sw = INTRO_BGS.map(b => `<button type="button" class="intro-sw" data-bg="${b.id}" title="${b.name}" style="width:46px;height:46px;border-radius:8px;border:2px solid #555;background:linear-gradient(${b.stops[0]},${b.stops[1]});color:#fff;font-size:.62rem;padding:0;cursor:pointer;text-shadow:0 0 3px #000;">${b.name}</button>`).join('');
  const thBtn = (key, title, url) => `<button type="button" class="intro-th" data-key="${key}" title="${title}" style="width:54px;height:54px;border-radius:8px;border:2px solid #555;padding:0;background:#000 center top/cover no-repeat url('${url}');cursor:pointer;"></button>`;
  const th = saved.map((src, i) => thBtn('u' + i, '保存してある画像' + (i + 1), src)).join('');
  const smp = introSamplesUsable() ? INTRO_SAMPLES.map((m, i) => thBtn('s' + i, '見本：' + m.name, 'samples/' + m.file + '_s.webp')).join('') : '';
  ov.innerHTML = `<div style="max-width:560px;margin:0 auto;background:#18181c;border:1.5px solid #8b0000;border-radius:10px;color:#eee;min-height:100%;box-sizing:border-box;">
    <div style="position:sticky;top:0;z-index:2;background:#18181c;padding:10px 12px 6px;border-radius:10px 10px 0 0;">
      <div style="color:#f0a0a0;font-weight:bold;margin-bottom:6px;">🌟 紹介画像</div>
      <canvas id="intro-canvas" width="1080" height="1350" style="max-width:100%;max-height:40vh;display:block;margin:0 auto;border:1px solid #444;border-radius:6px;background:#000;"></canvas>
      <div id="intro-status" style="display:none;font-size:.78rem;margin-top:6px;line-height:1.5;"></div>
    </div>
    <div style="padding:0 12px 14px;">
      <div style="${h}">型</div>
      ${Object.keys(INTRO_LAYOUTS).map(k => `<label style="${lab}"><input type="radio" name="intro-layout" value="${k}" ${k === introState.layout ? 'checked' : ''}> ${INTRO_LAYOUTS[k].label}</label>`).join('')}
      <div style="${h}">背景</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">${sw}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px;">
        <button type="button" class="sec" id="intro-bg-file">自分の画像を選ぶ</button>
        <button type="button" class="sec" id="intro-bg-clear" style="display:none;">見本に戻す</button>
        <input type="file" id="intro-bg-input" accept="image/*" style="display:none;">
      </div>
      <div id="intro-dim-row" style="display:none;margin-top:6px;font-size:.82rem;">背景の暗さ <input type="range" id="intro-dim" min="0" max="70" step="5" value="${Math.round(introState.dim * 100)}" style="vertical-align:middle;width:55%;"> <span id="intro-dim-v"></span></div>
      <div style="${h}">立ち絵</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">${th}
        <button type="button" class="sec" id="intro-p-file">ファイルを選ぶ</button>
        <button type="button" class="sec" id="intro-p-none">なし</button>
        <input type="file" id="intro-p-input" accept="image/*" style="display:none;">
      </div>
      ${smp ? `<div style="font-size:.78rem;color:#aaa;margin:8px 0 4px;">見本の立ち絵</div><div style="display:flex;gap:6px;flex-wrap:wrap;">${smp}</div>` : ''}
      <div style="font-size:.72rem;color:#888;margin-top:4px;line-height:1.5;">保存してある画像は小さめなので、くっきり出したいときは「ファイルを選ぶ」から元の画像を選んでください(選んだ画像はこの画面だけで使い、保存はされません)。</div>
      <div id="intro-pos" style="margin-top:8px;font-size:.82rem;">
        <div>大きさ <input type="range" id="intro-ps" min="50" max="200" step="5" value="100" style="vertical-align:middle;width:60%;"> <span id="intro-ps-v">100%</span></div>
        <div>左右 <input type="range" id="intro-px" min="-50" max="50" step="1" value="0" style="vertical-align:middle;width:60%;"></div>
        <div>上下 <input type="range" id="intro-py" min="-50" max="50" step="1" value="0" style="vertical-align:middle;width:60%;"></div>
        <label style="${lab}"><input type="checkbox" id="intro-flip"> 左右を反転する</label>
        <button type="button" class="sec" id="intro-pos-reset">位置をもどす</button>
      </div>
      <div style="${h}">載せる項目（名前とクラスは、いつも載ります）</div>
      ${INTRO_SHOW_ITEMS.map(([k, n]) => `<label style="${lab}"><input type="checkbox" class="intro-show" data-k="${k}" ${introState.show[k] ? 'checked' : ''}> ${n}</label>`).join('')}
      <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
        <button type="button" class="sec" id="intro-cancel">やめる</button>
        <button type="button" id="intro-save">画像を保存する</button>
      </div>
    </div></div>`;
  document.body.appendChild(ov);
  introWire(ov, saved);
  introSyncControls();
  if (saved.length) introUsePortraitSrc(saved[0], 'u0');
  else if (introSamplesUsable()) introUsePortraitSrc('samples/' + INTRO_SAMPLES[0].file + '.webp', 's0');
  else introRender();
}

function introSyncControls() {
  const ov = document.getElementById('intro-overlay');
  if (!ov || !introState) return;
  ov.querySelectorAll('.intro-sw').forEach(b => { b.style.borderColor = (!introState.bgImg && b.dataset.bg === introState.bg) ? '#fff' : '#555'; });
  ov.querySelector('#intro-bg-clear').style.display = introState.bgImg ? '' : 'none';
  ov.querySelector('#intro-dim-row').style.display = introState.bgImg ? '' : 'none';
  ov.querySelector('#intro-dim-v').textContent = Math.round(introState.dim * 100) + '%';
  ov.querySelector('#intro-ps-v').textContent = Math.round(introState.ps * 100) + '%';
  ov.querySelectorAll('.intro-th').forEach(b => { b.style.borderColor = (introState.pKey === b.dataset.key) ? '#fff' : '#555'; });
  ov.querySelector('#intro-pos').style.opacity = introState.pImg ? '1' : '.45';
}

function introUsePortraitSrc(src, key) {
  introLoadImage(src).then(im => {
    if (!introState) return;
    introState.pImg = im; introState.pKey = key; introState.fileError = '';
    introSyncControls(); introRender();
  }).catch(e => {
    if (!introState) return;
    introState.fileError = introImageErrorText(e);
    introRender();
  });
}

function introWire(ov, saved) {
  const q = s => ov.querySelector(s);
  ov.addEventListener('click', e => { if (e.target === ov) introCloseDialog(); });
  q('#intro-cancel').onclick = introCloseDialog;
  ov.querySelectorAll('input[name="intro-layout"]').forEach(r => r.addEventListener('change', () => { introState.layout = r.value; introSavePrefs(); introRenderSoon(); }));
  ov.querySelectorAll('.intro-sw').forEach(b => b.addEventListener('click', () => { introState.bg = b.dataset.bg; introState.bgImg = null; introState.fileError = ''; introSavePrefs(); introSyncControls(); introRenderSoon(); }));
  q('#intro-bg-file').onclick = () => q('#intro-bg-input').click();
  q('#intro-bg-input').addEventListener('change', ev => {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    introReadFile(f).then(im => { if (!introState) return; introState.bgImg = im; introState.fileError = ''; introSyncControls(); introRender(); })
      .catch(e => { if (!introState) return; introState.fileError = introImageErrorText(e); introRender(); });
  });
  q('#intro-bg-clear').onclick = () => { introState.bgImg = null; introState.fileError = ''; introSyncControls(); introRenderSoon(); };
  q('#intro-dim').addEventListener('input', e => { introState.dim = Number(e.target.value) / 100; introSavePrefs(); introSyncControls(); introRenderSoon(); });
  ov.querySelectorAll('.intro-th').forEach(b => b.addEventListener('click', () => {
    const key = b.dataset.key, i = Number(key.slice(1));
    const src = key[0] === 's' ? 'samples/' + INTRO_SAMPLES[i].file + '.webp' : saved[i];
    introUsePortraitSrc(src, key);
  }));
  q('#intro-p-file').onclick = () => q('#intro-p-input').click();
  q('#intro-p-input').addEventListener('change', ev => {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    introReadFile(f).then(im => { if (!introState) return; introState.pImg = im; introState.pKey = 'f'; introState.fileError = ''; introSyncControls(); introRender(); })
      .catch(e => { if (!introState) return; introState.fileError = introImageErrorText(e); introRender(); });
  });
  q('#intro-p-none').onclick = () => { introState.pImg = null; introState.pKey = 'n'; introState.fileError = ''; introSyncControls(); introRenderSoon(); };
  q('#intro-ps').addEventListener('input', e => { introState.ps = Number(e.target.value) / 100; introSyncControls(); introRenderSoon(); });
  q('#intro-px').addEventListener('input', e => { introState.px = Number(e.target.value) / 100; introRenderSoon(); });
  q('#intro-py').addEventListener('input', e => { introState.py = Number(e.target.value) / 100; introRenderSoon(); });
  q('#intro-flip').addEventListener('change', e => { introState.flip = !!e.target.checked; introRenderSoon(); });
  q('#intro-pos-reset').onclick = () => {
    introState.ps = 1; introState.px = 0; introState.py = 0; introState.flip = false;
    q('#intro-ps').value = 100; q('#intro-px').value = 0; q('#intro-py').value = 0; q('#intro-flip').checked = false;
    introSyncControls(); introRenderSoon();
  };
  ov.querySelectorAll('.intro-show').forEach(c => c.addEventListener('change', () => { introState.show[c.dataset.k] = !!c.checked; introSavePrefs(); introRenderSoon(); }));
  q('#intro-save').onclick = () => {
    const cv = q('#intro-canvas');
    try { introDraw(cv, introState, introGatherData()); } catch (e) { introSetStatus('画像を作れませんでした。（' + (e && e.message ? e.message : e) + '）', true); return; }
    const nm = (introGatherData().name || 'character').replace(/[\\/:*?"<>|]/g, '_');
    exportIntroImage(cv, nm + '_紹介.png');
  };
}

// 作った紹介画像を保存する（利用回数の集計は、この名前で数える）
function exportIntroImage(cv, fname) {
  return savePngCanvas(cv, fname).then(ok => {
    if (ok) { if (typeof showToast === 'function') showToast('✔ 画像を保存しました'); } else introSetStatus('保存できませんでした。もう一度お試しください', true);
    return ok;
  });
}

document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.getElementById('intro-overlay')) introCloseDialog(); });
