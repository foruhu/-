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
  const hint = getVal('hint');

  let text = `【ドール名】${name}\n`;
  text += `【PL名】${pl}\n`;
  text += `【ポジション】${pos} / 【メイン】${mc} / 【サブ】${sc}\n`;
  text += `【年齢】${age} / 【初期配置】${ps} / 【暗示】${hint}\n`;
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
  document.querySelectorAll('#skill-tbody tr.skill-row').forEach(tr => {
    const category = tr.querySelector('.skill-category')?.value || '';
    const skillName = tr.querySelector('.skill-name-select')?.value || '';
    const timing = tr.querySelector('.skill-timing')?.value || '';
    const cost = tr.querySelector('.skill-cost')?.value || '';
    const range = tr.querySelector('.skill-range')?.value || '';
    const memoTr = tr.nextElementSibling;
    const memo = (memoTr && memoTr.classList.contains('skill-memo-row')) ? (memoTr.querySelector('.skill-memo')?.value || '') : '';
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
// Supabase連携（短いトークン付きURLで共有するための保存先）
// ==========================================================
const SUPABASE_URL = 'https://mdasgxjuwrweoxndgdbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kYXNneGp1d3J3ZW94bmRnZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTczNzksImV4cCI6MjEwMjI5MzM3OX0.gqOrziRFncLXP8YwUEGmOxmtCChJ1sPYQhGSvRdXkl8';

// 圧縮済みの共有文字列をSupabaseに保存し、発行されたランダムトークン（推測されにくい文字列）を返す
async function saveCharacterToSupabase(encodedPayload, viewOnly) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/create_character`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_payload: encodedPayload, p_view_only: !!viewOnly })
  });
  if (!res.ok) throw new Error('Supabaseへの保存に失敗しました（HTTP ' + res.status + '）');
  const token = await res.json();
  if (!token || typeof token !== 'string') throw new Error('Supabaseからの応答が不正です');
  return token;
}

// トークンから、保存されていた共有文字列と閲覧専用フラグを取得する
// （直接テーブルを読み取るのではなく、トークンが一致した場合のみ1件返す専用関数を経由する）
async function loadCharacterFromSupabase(token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_character_by_token`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ p_token: token })
  });
  if (!res.ok) throw new Error('Supabaseからの読み込みに失敗しました（HTTP ' + res.status + '）');
  const rows = await res.json();
  if (!rows || rows.length === 0) throw new Error('該当するデータが見つかりませんでした（削除されたか、URLが間違っている可能性があります）');
  return rows[0];
}

// キャラクターデータをURLに埋め込んだ「共有URL」を作成する（対応端末ならOSの共有シートも使う）
// まずSupabaseに保存して短いトークン付きURLを作り、失敗した場合は従来のURL埋め込み方式にフォールバックする
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
    const token = await saveCharacterToSupabase(encoded, false);
    url = location.origin + location.pathname + '#tok=' + token;
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
// 開いた相手の画面では自動的に表示モードになり、保存確認も出ない（見るだけの共有用）
async function exportViewURL() {
  const data = getFullData();

  // 選択中キャラクターにサムネイル画像が設定されていれば、閲覧用データに含めて相手にも見せる
  const selectedId = document.getElementById('save-slot')?.value;
  if (selectedId) {
    const sheets = getSavedSheets();
    if (sheets[selectedId] && sheets[selectedId].image) {
      data.shareImage = sheets[selectedId].image;
    }
  }

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
    const token = await saveCharacterToSupabase(encoded, true);
    url = location.origin + location.pathname + '#tok=' + token;
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

// ページを開いた時にURLに共有データ（#tok=... または 従来形式の #share=.../#view=...）が含まれていれば自動で読み込む
async function checkForSharedURLOnLoad() {
  const hash = location.hash || '';

  // 新形式：Supabase上のトークンを参照する短いURL（#tok=ランダム文字列）
  const tokMatch = hash.match(/^#tok=([A-Za-z0-9]+)$/);
  if (tokMatch) {
    history.replaceState(null, '', location.pathname + location.search);
    try {
      const row = await loadCharacterFromSupabase(tokMatch[1]);
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

    // 送信側で設定されていたサムネイル画像があれば、閲覧画面の上部に表示する
    const imageContainer = document.getElementById('view-mode-image-container');
    if (imageContainer) {
      if (data.shareImage) {
        imageContainer.innerHTML = `<img src="${data.shareImage}" alt="">`;
        imageContainer.style.display = '';
      } else {
        imageContainer.innerHTML = '';
        imageContainer.style.display = 'none';
      }
    }
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

// ==========================================================
// キャラクター保管所テキストの読み込み
// 保管所の「テキスト出力」を貼り付けて、キャラシに反映する
// ==========================================================
const HK_LOC_TO_SEC = { '頭': 'head', '腕': 'arm', '胴': 'body', '脚': 'leg', '足': 'leg' };
const HK_SEC_TO_LOC = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
const HK_SKILL_SLOTS = { 'ポジション': 'pos', 'メインクラス': 'mc', 'サブクラス': 'sc' };
const HK_SLOT_LABEL = { pos: 'ポジション', mc: 'メインクラス', sc: 'サブクラス' };

// 全角数字を半角にする（「０」→「0」）
function hkToHalf(str) {
  return String(str == null ? '' : str).replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
}

// 先頭から最大n個の区切り（「:」または「：」。前後の空白は無視）で分割し、残りを最後の要素にする。
// 項目が空（「 : : 」）でも位置がずれないよう、空文字として残す
function hkSplitFields(str, n) {
  const out = [];
  let rest = String(str || '');
  for (let i = 0; i < n; i++) {
    const m = rest.match(/\s*[:：]\s*/);
    if (!m) break;
    out.push(rest.slice(0, m.index));
    rest = rest.slice(m.index + m[0].length);
  }
  out.push(rest);
  return out.map(s => s.trim());
}

// 「最大行動値＋２」のような全角表記を、アプリの行動値計算が読める「最大行動値+2」にそろえる
function hkNormalizeMemo(memo) {
  return String(memo || '').replace(/最大行動値\s*[＋+]\s*([０-９0-9]+)/g, (m, n) => '最大行動値+' + hkToHalf(n));
}

// テキストを解析する（画面には触らない）
function parseHokanshoText(raw) {
  const r = {
    fields: {}, memories: [], list: [], skills: [], parts: [],
    enhanceLines: [], madnessNotes: [], unrecognized: [], recognized: 0
  };
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n');
  let section = '';

  lines.forEach(rawLine => {
    const line = rawLine.replace(/　/g, ' ').trim();
    if (!line) return;

    // ■強化値■ のような区切り行
    const head = line.match(/^■\s*([^■]+?)\s*■\s*(.*)$/) || line.match(/^■\s*([^■\s]+)\s*$/);
    if (head) {
      section = head[1];
      if (head[2] && section === '強化値') r.enhanceLines.push(head[2]); // 区切りと同じ行に値が続く場合
      return;
    }

    // [ラベル] で始まる行
    const lab = line.match(/^[\[［【]\s*([^\]］】]+?)\s*[\]］】]\s*(.*)$/);
    if (lab) {
      const label = lab[1].trim();
      const body = lab[2].trim();

      if (label === '記憶のカケラ') {
        const sp = body.match(/^(\S+)\s*(.*)$/);
        if (!sp) { r.unrecognized.push(line); return; }
        r.memories.push(sp[2] ? `${sp[1]}：${sp[2]}` : sp[1]);
        r.recognized++;
        return;
      }

      if (label === '未練') {
        const m = body.match(/^(.*?)\s*への\s*(\S+)\s*([■□]*)\s*(.*)$/);
        if (!m || !m[1]) { r.unrecognized.push(line); return; }
        const madness = (m[3].match(/■/g) || []).length;
        r.list.push({ target: m[1].trim(), emotion: m[2].trim(), madness: madness });
        if (m[4]) r.madnessNotes.push(`${m[1].trim()}：${m[4]}`);
        r.recognized++;
        return;
      }

      if (HK_SKILL_SLOTS[label]) {
        const f = hkSplitFields(body, 4);
        if (!f[0]) { r.unrecognized.push(line); return; }
        r.skills.push({
          slot: HK_SKILL_SLOTS[label], name: f[0], timing: f[1] || '',
          cost: hkToHalf(f[2] || ''), range: hkToHalf(f[3] || ''), memo: hkNormalizeMemo(f[4] || '')
        });
        r.recognized++;
        return;
      }

      if (HK_LOC_TO_SEC[label]) {
        const f = hkSplitFields(body, 4);
        if (!f[0]) { r.unrecognized.push(line); return; }
        r.parts.push({
          sec: HK_LOC_TO_SEC[label], name: f[0], timing: f[1] || '',
          cost: hkToHalf(f[2] || ''), range: hkToHalf(f[3] || ''), memo: hkNormalizeMemo(f[4] || '')
        });
        r.recognized++;
        return;
      }

      r.unrecognized.push(line);
      return;
    }

    // 「キー：値」の行
    const kv = line.match(/^(タイトル|キャラクター名|名前|享年|ポジション|クラス|初期配置|行動値|暗示)\s*[:：]\s*(.*)$/);
    if (kv) {
      const key = kv[1], val = kv[2].trim();
      if (key === 'キャラクター名' || key === '名前') r.fields.name = val;
      else if (key === '享年') r.fields.age = val;
      else if (key === 'ポジション') r.fields.pos = val;
      else if (key === 'クラス') {
        const cls = val.split(/\s*[\/／・]\s*/);
        r.fields.mc = (cls[0] || '').trim();
        r.fields.sc = (cls[1] || '').trim();
      }
      else if (key === '初期配置') r.fields.ps = val;
      else if (key === '行動値') r.fields.act = parseInt(hkToHalf(val), 10);
      else if (key === '暗示') r.fields.hint = val;
      if (key !== 'タイトル') r.recognized++;
      return;
    }

    // ■強化値■ の中の行は、後で計算結果との比較に使う
    if (section === '強化値' && /武装|変異|改造/.test(line)) { r.enhanceLines.push(line); return; }

    r.unrecognized.push(line);
  });

  return r;
}

// 解析結果をキャラシに反映し、読み込み結果（件数・注意点）を返す
function applyHokanshoParsed(p) {
  const rep = {
    skills: 0, partsExtra: 0, partsBase: 0, memories: 0, list: 0,
    unmatchedParts: [], customSkills: [], notes: [], mismatches: [],
    unrecognized: p.unrecognized.slice(), madnessNotes: p.madnessNotes.slice()
  };

  const data = getFullData(); // 保管所テキストに無い項目（PL名・寵愛・たからもの等）は今の内容を引き継ぐ
  const selectHas = (id, v) => Array.from(document.getElementById(id).options).some(o => o.value === v);
  const f = p.fields;

  if (f.name) data.name = f.name;
  if (f.age !== undefined) data.age = f.age;
  if (f.hint !== undefined) data.hint = f.hint;
  [['pos', 'ポジション'], ['mc', 'メインクラス'], ['sc', 'サブクラス'], ['ps', '初期配置']].forEach(([key, label]) => {
    if (!f[key]) return;
    if (selectHas(key, f[key])) data[key] = f[key];
    else rep.notes.push(`${label}「${f[key]}」はこのシートの選択肢に無いため、今の設定のままにしました。`);
  });

  // スキル（区分＝ポジション/メインクラス/サブクラスの今の設定）
  data.skills = p.skills.map(s => {
    const category = data[s.slot];
    const known = typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category] && SKILL_DATABASE[category].some(x => x.name === s.name);
    if (!known) rep.customSkills.push(`${HK_SLOT_LABEL[s.slot]}「${s.name}」`);
    rep.skills++;
    return { category: category, name: s.name, timing: s.timing, cost: s.cost, range: s.range, memo: s.memo, tag: detectCategoryFromMemo(s.memo), isUsed: false };
  });

  // パーツ：基本パーツは常に自動配置されるので数えるだけ。それ以外はdata.jsと名前で照合して種別・Lvを補う
  const baseNames = new Set(Object.values(DEFAULT_PARTS).flat().map(b => b.name));
  const findCatalog = (name, sec) => {
    return (EXTRA_PARTS_DB[sec] || []).find(x => x.name === name)
      || COMMON_EXTRA_PARTS.find(x => x.name === name)
      || Object.values(EXTRA_PARTS_DB).flat().find(x => x.name === name)
      || null;
  };
  data.parts = [];
  p.parts.forEach(pt => {
    if (baseNames.has(pt.name)) { rep.partsBase++; return; }
    const hit = findCatalog(pt.name, pt.sec);
    let type, level, editable;
    if (hit) {
      type = hit.type; level = hit.level; editable = false;
    } else {
      // 見つからないもの：「狂気点を回復」とあれば たからもの、それ以外は種別・Lvが分からないので仮置きにして知らせる
      editable = true;
      if (/狂気点.{0,6}回復/.test(pt.memo)) { type = 'たからもの'; level = ''; }
      else { type = '武装'; level = ''; }
      rep.unmatchedParts.push({
        loc: HK_SEC_TO_LOC[pt.sec], name: pt.name,
        assumed: type === 'たからもの' ? '種別を「たからもの」として配置' : '種別を仮に「武装」・Lvを空欄で配置（種別とLvを確認してください）'
      });
    }
    data.parts.push({
      isBroken: false, isUsed: false, location: HK_SEC_TO_LOC[pt.sec], name: pt.name, type: type, level: String(level),
      timing: pt.timing, cost: pt.cost, range: pt.range, memo: pt.memo, isEditable: editable, tag: detectCategoryFromMemo(pt.memo)
    });
    rep.partsExtra++;
  });

  data.memories = p.memories.slice();
  rep.memories = p.memories.length;
  data.list = p.list.map(x => ({ target: x.target, emotion: x.emotion, madness: String(x.madness) }));
  rep.list = p.list.length;

  applyData(data);

  // 強化値・最大行動値は自動計算なので、テキストの値と違えば知らせる
  const num = id => parseInt(document.getElementById(id)?.textContent, 10);
  const appTotals = { '武装': num('total-wep'), '変異': num('total-mut'), '改造': num('total-cyb') };
  const textTotals = {};
  p.enhanceLines.join(' ').replace(/(武装|変異|改造)[^\d\-]*(\d+)/g, (m, k, v) => { textTotals[k] = parseInt(v, 10); return m; });
  Object.keys(textTotals).forEach(k => {
    if (textTotals[k] !== appTotals[k]) rep.mismatches.push(`強化値（${k}）：テキスト ${textTotals[k]} ／ このシートの計算 ${appTotals[k]}`);
  });
  if (Number.isFinite(f.act)) {
    const appAct = parseInt(document.getElementById('act')?.value, 10);
    if (appAct !== f.act) rep.mismatches.push(`最大行動値：テキスト ${f.act} ／ このシートの計算 ${appAct}（基本行動値を変えるとそろえられます）`);
  }
  if (document.querySelector('#limit-tbody .limit-ng')) {
    rep.notes.push('パーツ配置上限を超えている種別があります（ボーナスや寵愛による修正の設定で変わります）。');
  }
  return rep;
}

function hkRenderReport(rep) {
  const e = escapeHtml;
  const li = arr => '<ul style="margin:2px 0 0; padding-left:1.2em;">' + arr.map(x => `<li>${x}</li>`).join('') + '</ul>';
  const h = t => `<h4 style="color:#8ff; margin:12px 0 4px;">${t}</h4>`;

  let html = `<div style="color:#7fe3a8; font-weight:bold; margin-bottom:4px;">読み込みました。保存は「💾 保存」で行ってください。</div>`;
  html += h('■ 読み込めた件数');
  html += li([
    `スキル：${rep.skills}件`,
    `マニューバ（パーツ）：${rep.partsExtra}件（基本パーツ ${rep.partsBase}件は自動配置済み）`,
    `記憶のカケラ：${rep.memories}件`,
    `未練：${rep.list}件`
  ]);

  if (rep.mismatches.length) { html += h('■ 計算結果が違う項目'); html += li(rep.mismatches.map(e)); }
  if (rep.unmatchedParts.length) {
    html += h('■ data.js に無かったパーツ');
    html += li(rep.unmatchedParts.map(u => `${e(u.loc)}「${e(u.name)}」：${e(u.assumed)}`));
  }
  if (rep.customSkills.length) {
    html += h('■ スキル一覧に無かったスキル');
    html += li(rep.customSkills.map(e)); 
    html += `<div style="color:#888; font-size:0.72rem;">名前はそのまま入れています。</div>`;
  }
  if (rep.madnessNotes.length) {
    html += h('■ 発狂の情報（このシートに欄が無いため未反映）');
    html += li(rep.madnessNotes.map(e));
  }
  if (rep.notes.length) { html += h('■ 注意'); html += li(rep.notes.map(e)); }
  if (rep.unrecognized.length) {
    html += h('■ 読み込めなかった行');
    html += li(rep.unrecognized.map(l => e(l.length > 60 ? l.slice(0, 60) + '…' : l)));
  }
  return html;
}

function openHokanshoImport() {
  const ov = document.getElementById('hokansho-overlay');
  if (!ov) return;
  document.getElementById('hokansho-input-panel').style.display = '';
  document.getElementById('hokansho-result-panel').style.display = 'none';
  document.getElementById('hokansho-result-panel').innerHTML = '';
  ov.style.display = 'block';
  ov.scrollTop = 0;
}

function closeHokanshoImport() {
  const ov = document.getElementById('hokansho-overlay');
  if (ov) ov.style.display = 'none';
}

function runHokanshoImport() {
  const raw = document.getElementById('hokansho-text').value;
  const panel = document.getElementById('hokansho-result-panel');
  const showResult = html => {
    document.getElementById('hokansho-input-panel').style.display = 'none';
    panel.style.display = 'block';
    panel.innerHTML = html + `<div style="margin-top:14px;"><button type="button" onclick="closeHokanshoImport()" style="width:100%;">閉じる</button></div>`;
  };

  if (!raw.trim()) { alert('テキストを貼り付けてください'); return; }

  const parsed = parseHokanshoText(raw);
  if (parsed.recognized === 0) {
    showResult(`<div style="color:#ff8888; font-weight:bold;">読み込める内容が見つかりませんでした。</div>` +
      `<div style="margin-top:6px;">保管所の「テキスト出力」のテキストを、そのまま貼り付けているか確認してください。シートの内容は変更していません。</div>`);
    return;
  }

  if (!confirm('今のシートの内容（キャラ名・クラス・スキル・マニューバ・記憶のカケラ・未練など）を、貼り付けたテキストの内容で上書きします。\n「↩️ 元に戻す」で戻せます。\n\nよろしいですか？')) return;

  pushUndoSnapshot();
  let rep;
  try {
    rep = applyHokanshoParsed(parsed);
  } catch (err) {
    showResult(`<div style="color:#ff8888; font-weight:bold;">読み込み中にエラーが起きました。</div><div style="margin-top:6px;">${escapeHtml(err.message)}</div><div style="margin-top:6px;">「↩️ 元に戻す」で読み込み前に戻せます。</div>`);
    return;
  }
  markDirty();
  showResult(hkRenderReport(rep));
}
