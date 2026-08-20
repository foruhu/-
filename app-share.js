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

  text += `■ たからもの\n`;
  document.querySelectorAll('#treasure-list .treasure-entry').forEach(entry => {
    const tName = entry.querySelector('.treasure-name')?.value || '';
    const tContent = entry.querySelector('.treasure-content')?.value || '';
    if (tName) {
      text += `・${tName}${tContent ? '（' + tContent + '）' : ''}\n`;
    }
  });

  text += `----------------------------------------\n`;

  text += `■ スキル\n`;
  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const category = tr.querySelector('input')?.value || '';
    const skillName = tr.querySelector('.skill-name-select')?.value || '';
    const timing = tr.querySelector('.skill-timing')?.value || '';
    const cost = tr.querySelector('.skill-cost')?.value || '';
    const range = tr.querySelector('.skill-range')?.value || '';
    const memo = tr.querySelector('.skill-memo')?.value || '';
    const spec = [timing, cost, range].filter(Boolean).join('/');
    if (skillName) {
      text += `・[${category}] ${skillName}${spec ? ' (' + spec + ')' : ''} : ${memo}\n`;
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
    const isBroken = tr.querySelector('.p-broken')?.checked;
    const isUsed = tr.querySelector('.p-used')?.checked;

    if (pName) {
      const status = (isBroken ? '[破損] ' : '') + (isUsed ? '[使用済] ' : '');
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
  const data = getFullData();

  const actValue = parseInt(data.act, 10) || 0;
  const currentChouaiEl = document.getElementById('current-chouai');
  const currentChouai = currentChouaiEl ? (parseInt(currentChouaiEl.textContent, 10) || 0) : 0;

  const status = [
    { label: '行動値', value: actValue, max: actValue },
    { label: '寵愛点', value: currentChouai, max: currentChouai }
  ];

  const params = [
    { label: 'PL名', value: data.pl || '' },
    { label: 'ポジション', value: data.pos || '' },
    { label: 'メインクラス', value: data.mc || '' },
    { label: 'サブクラス', value: data.sc || '' },
    { label: '享年/外見', value: data.age || '' },
    { label: '初期配置', value: data.ps || '' },
    { label: '暗示', value: data.hint || '' },
    { label: '記憶のカケラ', value: (data.memories || []).filter(Boolean).join('、') }
  ].filter(p => p.value);

  const commandLines = [];
  commandLines.push('■スキル');
  (data.skills || []).forEach(s => {
    if (!s.name) return;
    const spec = [s.timing, s.cost && `コスト${s.cost}`, s.range && `射程${s.range}`].filter(Boolean).join('/');
    const memo = (s.memo || '').replace(/\n/g, ' ');
    commandLines.push(`【${s.name}】${spec ? spec + ' ' : ''}${memo}`);
  });

  commandLines.push('');
  commandLines.push('■マニューバ');
  (data.parts || []).forEach(p => {
    if (!p.name) return;
    const spec = [p.timing, p.cost && `コスト${p.cost}`, p.range && `射程${p.range}`].filter(Boolean).join('/');
    const memo = (p.memo || '').replace(/\n/g, ' ');
    commandLines.push(`【${p.name}】(${p.type}Lv${p.level}) ${spec}${memo ? ' ' + memo : ''}`);
  });

  const memoLines = [];
  (data.treasures || []).forEach(t => {
    if (t.name) memoLines.push(`たからもの: ${t.name}${t.content ? '（' + t.content + '）' : ''}`);
  });
  (data.list || []).forEach(l => {
    if (l.target || l.emotion) {
      memoLines.push(`未練[${l.target || '?'}] ${l.emotion || ''}（狂気点${l.madness || 0}）`);
    }
  });

  const ccfoliaData = {
    kind: 'character',
    data: {
      name: data.name || '(無名)',
      initiative: actValue,
      externalUrl: '',
      iconUrl: '',
      memo: memoLines.join('\n'),
      status: status,
      params: params,
      commands: commandLines.join('\n')
    }
  };

  const jsonText = JSON.stringify(ccfoliaData);

  const finishCopy = () => {
    alert('ココフォリア用のデータをクリップボードにコピーしました。\nココフォリアのルーム画面（盤面）に直接貼り付け（Ctrl+V / Cmd+V）すると、キャラクターの駒が作成されます。\n\n※ファイルのドラッグ＆ドロップではなく「貼り付け」で読み込む形式です。');
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(jsonText).then(finishCopy).catch(() => {
      prompt('自動コピーに失敗しました。以下のデータを手動でコピーし、ココフォリアの盤面に貼り付けてください：', jsonText);
    });
  } else {
    prompt('以下のデータをコピーし、ココフォリアの盤面に貼り付けてください：', jsonText);
  }
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
      pushUndoSnapshot(); // 読み込み前の状態を退避
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

// ==========================================================
// 共有データの圧縮・展開（gzip対応ブラウザなら大幅に短縮する）
// ==========================================================

// 文字列をgzip圧縮してURLセーフなbase64文字列にする
async function compressToBase64(str) {
  const stream = new Blob([str]).stream().pipeThrough(new CompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// compressToBase64で作った文字列を元の文字列に戻す
async function decompressFromBase64(b64) {
  let normalized = b64.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  const buffer = await new Response(stream).arrayBuffer();
  return new TextDecoder().decode(buffer);
}

// JSON文字列を共有用の符号化文字列にする。gzip圧縮に対応していればgz:、
// 非対応環境ではraw:を先頭に付けて（圧縮なしの）従来方式にフォールバックする
async function encodeShareString(json) {
  if (typeof CompressionStream !== 'undefined') {
    try {
      return 'gz:' + await compressToBase64(json);
    } catch (e) {
      // 圧縮に失敗した場合は無圧縮方式にフォールバック
    }
  }
  return 'raw:' + btoa(unescape(encodeURIComponent(json)));
}

// encodeShareStringで作った文字列をJSON文字列に戻す。
// 先頭に印が無い場合は、以前のバージョン（無圧縮のbase64のみ）とみなす
async function decodeShareString(encoded) {
  if (encoded.startsWith('gz:')) {
    return await decompressFromBase64(encoded.slice(3));
  }
  if (encoded.startsWith('raw:')) {
    return decodeURIComponent(escape(atob(encoded.slice(4))));
  }
  // 旧バージョン（印の無い無圧縮base64）との互換
  return decodeURIComponent(escape(atob(encoded)));
}

async function exportShareCode() {
  const data = getFullData();
  const json = JSON.stringify(data);
  let encoded;
  try {
    encoded = await encodeShareString(json);
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

// ==========================================================
// Supabase連携（短いID付きURLで共有するための保存先）
// ==========================================================
const SUPABASE_URL = 'https://mdasgxjuwrweoxndgdbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXNneGp1d3J3ZW94bmRnZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTczNzksImV4cCI6MjEwMjI5MzM3OX0.gqOrziRFncLXP8YwUEGmOxmtCChJ1sPYQhGSvRdXkl8';

// 圧縮済みの共有文字列をSupabaseに保存し、発行された連番ID（数値）を返す
async function saveCharacterToSupabase(encodedPayload, viewOnly) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/characters`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ payload: encodedPayload, view_only: !!viewOnly })
  });
  if (!res.ok) throw new Error('Supabaseへの保存に失敗しました（HTTP ' + res.status + '）');
  const rows = await res.json();
  if (!rows || !rows[0] || rows[0].id === undefined) throw new Error('Supabaseからの応答が不正です');
  return rows[0].id;
}

// 連番IDから、保存されていた共有文字列と閲覧専用フラグを取得する
async function loadCharacterFromSupabase(id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/characters?id=eq.${encodeURIComponent(id)}&select=payload,view_only`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
    }
  });
  if (!res.ok) throw new Error('Supabaseからの読み込みに失敗しました（HTTP ' + res.status + '）');
  const rows = await res.json();
  if (!rows || rows.length === 0) throw new Error('該当するデータが見つかりませんでした（削除されたか、IDが間違っている可能性があります）');
  return rows[0];
}

// キャラクターデータをURLに埋め込んだ「共有URL」を作成する（対応端末ならOSの共有シートも使う）
// まずSupabaseに保存して短いID付きURLを作り、失敗した場合は従来のURL埋め込み方式にフォールバックする
async function exportShareURL() {
  const data = getFullData();
  const json = JSON.stringify(data);
  let encoded;
  try {
    encoded = await encodeShareString(json);
  } catch (err) {
    alert('共有URLの作成に失敗しました: ' + err.message);
    return;
  }

  let url;
  try {
    const id = await saveCharacterToSupabase(encoded, false);
    url = location.origin + location.pathname + '#cid=' + id;
  } catch (err) {
    url = location.origin + location.pathname + '#share=' + encoded;
  }

  const shareTitle = (data.name || 'ネクロニカ') + ' のキャラクターシート';

  const copyFallback = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`共有URLをクリップボードにコピーしました。（${url.length}文字）\n\nLINEなどに貼り付けて送ると、相手がそのURLを開くだけで自動的にこのキャラクターが読み込まれます。`);
      }).catch(() => {
        prompt('自動コピーに失敗しました。以下のURLを手動でコピーしてください：', url);
      });
    } else {
      prompt('以下のURLをコピーしてください：', url);
    }
  };

  if (navigator.share) {
    navigator.share({ title: shareTitle, url: url }).catch(() => {
      // 共有シートをキャンセルした場合などはクリップボードコピーにフォールバック
      copyFallback();
    });
  } else {
    copyFallback();
  }
}

// キャラクターデータを「閲覧専用」で開けるURLを作成する。
// 開いた相手の画面では今開いているシートに一切触れず、ポップアップだけで内容を見せる
async function exportViewURL() {
  const data = getFullData();
  const json = JSON.stringify(data);
  let encoded;
  try {
    encoded = await encodeShareString(json);
  } catch (err) {
    alert('閲覧用URLの作成に失敗しました: ' + err.message);
    return;
  }

  let url;
  try {
    const id = await saveCharacterToSupabase(encoded, true);
    url = location.origin + location.pathname + '#cid=' + id;
  } catch (err) {
    url = location.origin + location.pathname + '#view=' + encoded;
  }

  const shareTitle = (data.name || 'ネクロニカ') + ' のキャラクターシート（閲覧用）';

  const copyFallback = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`閲覧用URLをクリップボードにコピーしました。（${url.length}文字）\n\nこのURLを開くと、自動的に表示モード（編集不可）でこのキャラクターが表示されます。相手のブラウザには保存されません。`);
      }).catch(() => {
        prompt('自動コピーに失敗しました。以下のURLを手動でコピーしてください：', url);
      });
    } else {
      prompt('以下のURLをコピーしてください：', url);
    }
  };

  if (navigator.share) {
    navigator.share({ title: shareTitle, url: url }).catch(() => {
      copyFallback();
    });
  } else {
    copyFallback();
  }
}

// ページを開いた時にURLに共有データ（#cid=... または 従来形式の #share=.../#view=...）が含まれていれば自動で読み込む
// 「閲覧専用URL」用：今開いている編集中のシートには一切触れず、
// 別ポップアップだけでキャラクター内容を表示する
function escapeHtmlSafe(str) {
  return String(str == null ? '' : str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function buildViewOnlyHtml(data) {
  const e = escapeHtmlSafe;
  const line = (label, value) => value ? `<div style="margin-bottom:4px;"><span style="color:#f0a0a0;font-weight:bold;">${e(label)}：</span>${e(value)}</div>` : '';

  let html = '';
  html += `<h2 style="color:#f0a0a0;margin:0 0 10px 0;font-size:1.2rem;border-bottom:1px solid #8b0000;padding-bottom:6px;">${e(data.name || '(無名)')}</h2>`;
  html += `<div style="font-size:0.85rem;margin-bottom:12px;">`;
  html += line('PL名', data.pl);
  html += line('ポジション / メイン / サブ', [data.pos, data.mc, data.sc].filter(Boolean).join(' / '));
  html += line('享年/外見', data.age);
  html += line('初期配置', data.ps);
  html += line('暗示', data.hint);
  html += line('最大行動値', data.act);
  const memories = (data.memories || []).filter(Boolean);
  if (memories.length) html += line('記憶のカケラ', memories.join('、'));
  html += `</div>`;

  const skills = (data.skills || []).filter(s => s.name);
  if (skills.length) {
    html += `<h3 style="color:#8ff;font-size:0.95rem;margin:10px 0 6px 0;">■ スキル</h3>`;
    skills.forEach(s => {
      const spec = [s.timing, s.cost, s.range].filter(Boolean).join('/');
      html += `<div style="font-size:0.8rem;margin-bottom:6px;padding:6px;background:#15151a;border-radius:4px;">
        <b>${e(s.name)}</b> <span style="color:#888;">[${e(s.category || '')}]${spec ? ' ' + e(spec) : ''}</span><br>
        <span style="color:#ccc;">${e(s.memo || '')}</span>
      </div>`;
    });
  }

  const parts = (data.parts || []).filter(p => p.name);
  if (parts.length) {
    html += `<h3 style="color:#8ff;font-size:0.95rem;margin:10px 0 6px 0;">■ マニューバ</h3>`;
    parts.forEach(p => {
      const spec = [p.timing, p.cost, p.range].filter(Boolean).join('/');
      const brokenTag = p.isBroken ? ' <span style="color:#ff8888;">[破損]</span>' : '';
      html += `<div style="font-size:0.8rem;margin-bottom:6px;padding:6px;background:#15151a;border-radius:4px;">
        <b>${e(p.name)}</b> <span style="color:#888;">[${e(p.location || '')} / ${e(p.type || '')}Lv${e(p.level || '')}]${spec ? ' ' + e(spec) : ''}</span>${brokenTag}<br>
        <span style="color:#ccc;">${e(p.memo || '')}</span>
      </div>`;
    });
  }

  const treasures = (data.treasures || []).filter(t => t.name);
  if (treasures.length) {
    html += `<h3 style="color:#8ff;font-size:0.95rem;margin:10px 0 6px 0;">■ たからもの</h3>`;
    treasures.forEach(t => {
      html += `<div style="font-size:0.8rem;margin-bottom:6px;">・<b>${e(t.name)}</b>${t.content ? '（' + e(t.content) + '）' : ''}</div>`;
    });
  }

  const list = (data.list || []).filter(l => l.target || l.emotion);
  if (list.length) {
    html += `<h3 style="color:#8ff;font-size:0.95rem;margin:10px 0 6px 0;">■ 未練</h3>`;
    list.forEach(l => {
      html += `<div style="font-size:0.8rem;margin-bottom:4px;">・[${e(l.target || '?')}] ${e(l.emotion || '')}（狂気点${e(l.madness || 0)}）</div>`;
    });
  }

  return html;
}

function openViewOnlyOverlay(data) {
  let overlay = document.getElementById('view-only-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'view-only-overlay';
    overlay.style.cssText = 'display:none; position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:10001; padding:16px; overflow-y:auto;';
    overlay.onclick = (ev) => { if (ev.target === overlay) closeViewOnlyOverlay(); };
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div style="max-width:520px; margin:20px auto; background:#18181c; border:1.5px solid #8b0000; border-radius:10px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.7);">
      <div style="display:flex; justify-content:flex-end; margin-bottom:4px;">
        <button type="button" onclick="closeViewOnlyOverlay()" style="background:none;border:none;color:#aaa;font-size:1.4rem;cursor:pointer;line-height:1;">✕</button>
      </div>
      ${buildViewOnlyHtml(data)}
      <div style="font-size:0.7rem;color:#888;margin-top:12px;border-top:1px solid #333;padding-top:8px;">
        ※これは閲覧専用のプレビューです。今あなたが開いているシートの内容には影響していません。
      </div>
    </div>
  `;
  overlay.style.display = 'block';
}

function closeViewOnlyOverlay() {
  const overlay = document.getElementById('view-only-overlay');
  if (overlay) overlay.style.display = 'none';
}

async function checkForSharedURLOnLoad() {
  const hash = location.hash || '';

  // 新形式：Supabase上の連番IDを参照する短いURL（#cid=数字）
  const cidMatch = hash.match(/^#cid=(\d+)$/);
  if (cidMatch) {
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const row = await loadCharacterFromSupabase(cidMatch[1]);
      const json = await decodeShareString(row.payload);
      const data = JSON.parse(json);
      applyLoadedShareData(data, row.view_only);
    } catch (err) {
      alert('共有データの読み込みに失敗しました。\n' + err.message);
    }
    return;
  }

  // 旧形式：URLにデータそのものを埋め込む方式（#share=... / #view=...）との互換
  const match = hash.match(/^#(share|view)=(.+)$/);
  if (!match) return;

  const isViewOnly = match[1] === 'view';

  // 再読み込み時に誤ってもう一度取り込まれないよう、先にURLから消しておく
  history.replaceState(null, '', location.pathname + location.search);

  try {
    const encoded = decodeURIComponent(match[2]);
    const json = await decodeShareString(encoded);
    const data = JSON.parse(json);
    applyLoadedShareData(data, isViewOnly);
  } catch (err) {
    alert('共有URLの読み込みに失敗しました。URLが正しいか確認してください。\n' + err.message);
  }
}

// 共有データを実際にシートへ反映する。閲覧用の場合はページ全体を使って表示し、
// 自動的に表示モード（編集不可）にする。保存するか聞くこともしない
function applyLoadedShareData(data, isViewOnly) {
  pushUndoSnapshot();
  applyData(data);

  if (isViewOnly) {
    applyViewModeUI(true);
    try { localStorage.setItem('necro_view_mode', '1'); } catch (e) {}
    isDirty = false;
  } else {
    afterExternalLoad(data);
  }
}

async function importShareCode() {
  const encoded = prompt('共有コードを貼り付けてください');
  if (!encoded) return;

  try {
    const json = await decodeShareString(encoded.trim());
    const data = JSON.parse(json);
    pushUndoSnapshot(); // 読み込み前の状態を退避
    applyData(data);
    afterExternalLoad(data);
  } catch (err) {
    alert('共有コードの読み込みに失敗しました。コードが正しくコピーされているか確認してください。\n' + err.message);
  }
}

