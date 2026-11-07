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
// （キャラクター保管所からコピーした全文を貼り付け、
//  既存の getFullData / applyData 形式に変換して反映する。
//  このブロックは app-share.js の末尾への追加のみで構成され、
//  既存の関数は変更しない）
// ==========================================================

// 全角数字・全角＋－を半角に正規化する
// （コスト「０」「３」や効果メモの「最大行動値＋２」対策。
//  変換しないと calcActionValue の extractActionBonus が拾えない）
function hokanHalfwidth(str) {
  return String(str || '')
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/＋/g, '+')
    .replace(/－/g, '-');
}

// パーツ名から data.js の種別・レベルを引く（見つからない場合は null）
let hokanPartLookupCache = null;
function hokanLookupPart(name) {
  if (!hokanPartLookupCache) {
    const map = new Map();
    const addList = list => {
      (list || []).forEach(p => {
        if (p && p.name && !map.has(p.name)) {
          map.set(p.name, { type: p.type, level: String(p.level) });
        }
      });
    };
    if (typeof DEFAULT_PARTS !== 'undefined') {
      Object.values(DEFAULT_PARTS).forEach(addList);
    }
    if (typeof EXTRA_PARTS_DB !== 'undefined') {
      Object.values(EXTRA_PARTS_DB).forEach(addList);
    }
    if (typeof COMMON_EXTRA_PARTS !== 'undefined') {
      addList(COMMON_EXTRA_PARTS);
    }
    hokanPartLookupCache = map;
  }
  return hokanPartLookupCache.get(name) || null;
}

// 効果メモからタグを推測する（app-parts.js の detectCategoryFromMemo を再利用）
function hokanDetectTag(memo) {
  if (typeof detectCategoryFromMemo === 'function') {
    return detectCategoryFromMemo(memo) || '';
  }
  return '';
}

// ---------------- パーサー ----------------
// parseHokanshoText(text) は次の形を返す。
// {
//   name, pos, mc, sc, age, ps, hint,   // 基本情報（空文字の場合は反映しない）
//   memories: ['名前：説明', ...],       // addMemoryEntry 形式の文字列
//   list: [{target, emotion, madness}], // madness は ■ の数（文字列）
//   skills: [{category, name, timing, cost, range, memo, tag, isUsed}],
//   parts:  [{isBroken, isUsed, location, name, type, level, timing, cost, range, memo, isEditable, tag}],
//   textAct: '10',                       // テキスト側の行動値（照合用、直接は反映しない）
//   textEnhance: {wep, mut, cyb},        // テキスト側の強化値合計（照合用）
//   textChouai: '15',                     // テキスト側の寵愛点（照合用、直接は反映しない）
//   history: [{scenario, battle, personal, memo}], // セッション履歴（獲得）
//   unmatched: [...], notes: [...],      // 補えなかったもの・備考（表示用）
//   unparsed: [...]                       // 読み込めなかった行（表示用）
// }
function parseHokanshoText(text) {
  const result = {
    name: '', pos: '', mc: '', sc: '', age: '', ps: '', hint: '',
    memories: [], list: [], skills: [], parts: [],
    textAct: '', textEnhance: null, textChouai: '', history: [],
    unmatched: [], notes: [], unparsed: []
  };
  if (!text || !String(text).trim()) return result;

  const POS_OPTIONS = ['アリス', 'ホリック', 'オートマトン', 'ジャンク', 'コート', 'ソロリティ'];
  const MC_OPTIONS = ['ロマネスク', 'ステーシー', 'タナトス', 'レクイエム', 'バロック', 'ホリック', 'ゴシック'];
  const SC_OPTIONS = ['ステーシー', 'タナトス', 'ゴシック', 'レクイエム', 'バロック', 'ロマネスク'];
  const PS_OPTIONS = ['煉獄', '花園', '楽園'];
  const LOC_MAP = { '頭': '頭部', '腕': '腕部', '胴': '胴部', '脚': '脚部', '足': '脚部' };

  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  let section = 'header';

  // 選択肢にない値は書き込まず、報告だけする
  const pick = (value, options, label) => {
    if (!value) return '';
    if (options.indexOf(value) !== -1) return value;
    result.unmatched.push(label + '「' + value + '」は選択肢にないため、現在の設定のままにしました');
    return '';
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // ■区切り行でセクションを切り替える
    if (line.indexOf('■') === 0) {
      if (line.indexOf('強化値') !== -1) section = 'enhance';
      else if (line.indexOf('マニューバ') !== -1) section = 'maneuver';
      else if (line.indexOf('その他') !== -1) section = 'other';
      else section = 'header'; // ■パーソナルデータ■ など
      continue;
    }

    if (line.indexOf('[記憶のカケラ]') === 0) {
      section = 'memory';
      const rest = line.replace('[記憶のカケラ]', '').trim();
      if (rest && rest !== '内容') {
        result.memories.push(...parseHokanshoMemoryLine(rest));
      }
      continue;
    }
    if (line.indexOf('[未練]') === 0) {
      section = 'mire';
      continue; // 見出し行（内容 狂気度 発狂時）は読み飛ばす
    }

    if (section === 'memory') {
      result.memories.push(...parseHokanshoMemoryLine(line));
      continue;
    }
    if (section === 'mire') {
      parseHokanshoMireLine(line, result);
      continue;
    }
    if (section === 'enhance') {
      parseHokanshoEnhanceLine(line, result);
      continue;
    }
    if (section === 'maneuver') {
      parseHokanshoManeuverLine(line, result, LOC_MAP);
      continue;
    }
    if (section === 'other') {
      parseHokanshoOtherLine(line, result);
      continue;
    }

    parseHokanshoHeaderLine(line, result, POS_OPTIONS, MC_OPTIONS, SC_OPTIONS, PS_OPTIONS, pick);
  }

  // 基本パーツは DEFAULT_PARTS の並び順に揃える
  // （applyData → restorePartsFromData が基本パーツを位置で対応付けるため）
  sortHokanshoBasicParts(result.parts);

  return result;
}

// 記憶のカケラ1行を「名前：説明」形式の文字列に変換する（0〜1件返す）
function parseHokanshoMemoryLine(line) {
  const m = line.match(/^(\S+?)[　 \t]{2,}(.+)$/);
  if (m) return [m[1].trim() + '：' + m[2].trim()];
  if (line) return [line.trim()];
  return [];
}

// 未練1行を {target, emotion, madness} に変換する。発狂時は欄がないので備考に残す
function parseHokanshoMireLine(line, result) {
  const m = line.match(/^(.*?)\s*への\s*(.*?)\s*([■□]+)\s*(.*)$/);
  if (!m) {
    result.unparsed.push('未練：' + line);
    return;
  }
  const madness = (m[3].match(/■/g) || []).length;
  const target = (m[1] || '').trim();
  const note = (m[4] || '').trim();
  result.list.push({
    target: target,
    emotion: (m[2] || '').trim(),
    madness: String(madness)
  });
  if (note && note !== '()') {
    result.notes.push('未練「' + (target || '（無名）') + '」の発狂時「' + note + '」は反映先がないため表示のみです');
  }
}

// 強化値セクションの1行。=合計= 行だけテキスト値として保持する（自動計算のため直接は反映しない）
function parseHokanshoEnhanceLine(line, result) {
  if (line.indexOf('=合計=') === -1) return;
  const nums = line.match(/[０-９0-9]+/g);
  if (!nums || nums.length < 3) return;
  const vals = nums.map(n => parseInt(hokanHalfwidth(n), 10));
  result.textEnhance = { wep: vals[0], mut: vals[1], cyb: vals[2] };
}

// マニューバ1行をスキルまたはパーツに変換する
function parseHokanshoManeuverLine(line, result, LOC_MAP) {
  const m = line.match(/^\[(.+?)\]\s*(.+)$/);
  if (!m) {
    result.unparsed.push('マニューバ：' + line);
    return;
  }
  const locKey = m[1].trim();
  const rest = m[2].trim();
  const cols = rest.split(/[:：]/);
  if (cols.length < 2) {
    result.unparsed.push('マニューバ：' + line);
    return;
  }
  const name = (cols[0] || '').trim();
  if (!name || name === 'マニューバ名') return; // 見出し行
  const timing = (cols[1] || '').trim();
  if (timing === 'タイミング') return; // 見出し行の念のため
  const cost = hokanHalfwidth((cols[2] || '').trim());
  const range = hokanHalfwidth((cols[3] || '').trim());
  const memo = hokanHalfwidth(cols.slice(4).join(':').trim());

  if (locKey === 'ポジション' || locKey === 'メインクラス' || locKey === 'サブクラス') {
    const category = locKey === 'ポジション' ? result.pos
      : locKey === 'メインクラス' ? result.mc : result.sc;
    const skill = {
      category: category || locKey, name, timing, cost, range, memo,
      tag: '', isUsed: false
    };
    skill.tag = hokanDetectTag(memo);
    result.skills.push(skill);
    // スキル名がデータにないと、選択肢の再構築で名前が残らないため注意書きする
    if (typeof SKILL_DATABASE !== 'undefined') {
      const list = SKILL_DATABASE[skill.category];
      if (!list || !list.some(s => s.name === name)) {
        result.unmatched.push('スキル「' + name + '」は「' + skill.category + '」のスキル一覧にないため、名前が選択肢に反映されない場合があります');
      }
    }
    return;
  }

  const location = LOC_MAP[locKey];
  if (!location) {
    result.unparsed.push('マニューバ：' + line);
    return;
  }
  const found = hokanLookupPart(name);
  let type = '武装';
  let level = '1';
  let isEditable = true;
  if (found) {
    type = found.type;
    level = found.level;
    isEditable = false;
  } else {
    result.unmatched.push('パーツ「' + name + '」は種別・レベルがデータにないため「武装Lv1（自由入力）」として取り込みました');
  }
  const part = {
    isBroken: false, isUsed: false,
    location, name, type, level,
    timing, cost, range, memo,
    isEditable, tag: ''
  };
  part.tag = hokanDetectTag(memo);
  result.parts.push(part);
}

// その他セクションの1行。寵愛点は自動集計のため直接は反映せず、テキスト値として保持する。
// 成長履歴はセッション履歴（獲得）に反映する。保管所側に戦闘/個人の区切りはないため合計を戦闘寵愛に入れる。
// メモ末尾の数字（例：「武装３「ダイナマイト」10」の「10」）は消費点か判別できないため、使い道には振り分けずメモに残す。
function parseHokanshoOtherLine(line, result) {
  let m = line.match(/^寵愛点[:：]\s*([０-９0-9]+)/);
  if (m) {
    result.textChouai = hokanHalfwidth(m[1]);
    return;
  }
  if (line.indexOf('成長履歴') === 0) return; // 「成長履歴：」の見出し行
  if (line.indexOf('No.') === 0 && line.indexOf('獲得寵愛点') !== -1) return; // 表の見出し行

  // 成長履歴の行（内訳あり）：No. 合計点(達成 / ボーナス / ピンゾロ) メモ
  m = line.match(/^([０-９0-9]+)\s+([０-９0-9]+)点\s*\(([^)]*)\)\s*(.*)$/);
  if (m) {
    const no = hokanHalfwidth(m[1]);
    const total = parseInt(hokanHalfwidth(m[2]), 10) || 0;
    const inner = (m[3] || '').split('/').map(s => parseInt(hokanHalfwidth(s.trim()), 10) || 0);
    const ach = inner[0] || 0, bon = inner[1] || 0, pin = inner[2] || 0;
    const memoText = (m[4] || '').trim();
    if (total === 0 && !memoText && ach === 0 && bon === 0 && pin === 0) return; // 0点で空欄の行は作らない
    result.history.push({
      scenario: 'No.' + no,
      battle: total,
      personal: 0,
      memo: '達成 ' + ach + ' / ボーナス ' + bon + ' / ピンゾロ ' + pin + (memoText ? ' / ' + memoText : '')
    });
    hokanNoteHistoryOnce(result, memoText);
    return;
  }

  // 成長履歴の行（() なしのフォールバック）：No. 合計点 メモ
  m = line.match(/^([０-９0-9]+)\s+([０-９0-9]+)点\s*(.*)$/);
  if (m) {
    const no = hokanHalfwidth(m[1]);
    const total = parseInt(hokanHalfwidth(m[2]), 10) || 0;
    const memoText = (m[3] || '').trim();
    if (total === 0 && !memoText) return; // 0点で空欄の行は作らない
    result.history.push({
      scenario: 'No.' + no,
      battle: total,
      personal: 0,
      memo: '達成 0 / ボーナス 0 / ピンゾロ 0（内訳不明）' + (memoText ? ' / ' + memoText : '')
    });
    hokanNoteHistoryOnce(result, memoText);
    return;
  }
  // その他の行（表の罫線など）は読み飛ばす
}

// 成長履歴の反映方法についての備考を一度だけ追加する
function hokanNoteHistoryOnce(result, memoText) {
  const note1 = '成長履歴は戦闘/個人の区切りがないため、合計を戦闘寵愛（獲得）に入れています';
  if (result.notes.indexOf(note1) === -1) result.notes.push(note1);
  if (memoText) {
    const note2 = 'メモ末尾の数字（例：「武装３「ダイナマイト」10」の「10」）は消費点か判別できないため、使い道（消費）には自動で振り分けず、メモに残しています';
    if (result.notes.indexOf(note2) === -1) result.notes.push(note2);
  }
}

// ヘッダー（基本情報）セクションの1行
function parseHokanshoHeaderLine(line, result, POS_OPTIONS, MC_OPTIONS, SC_OPTIONS, PS_OPTIONS, pick) {
  const kv = key => {
    const m = line.match(new RegExp('^' + key + '[:：]\\s*(.*)$'));
    return m ? m[1].trim() : null;
  };
  let v;
  if ((v = kv('キャラクター名')) !== null) { result.name = v; return; }
  if ((v = kv('ポジション')) !== null) { result.pos = pick(v, POS_OPTIONS, 'ポジション'); return; }
  if ((v = kv('クラス')) !== null) {
    const parts = v.split('/').map(s => s.trim()).filter(Boolean);
    if (parts[0]) result.mc = pick(parts[0], MC_OPTIONS, 'メインクラス');
    if (parts[1]) result.sc = pick(parts[1], SC_OPTIONS, 'サブクラス');
    return;
  }
  if ((v = kv('享年')) !== null) { result.age = v; return; }
  if ((v = kv('初期配置')) !== null) { result.ps = pick(v, PS_OPTIONS, '初期配置'); return; }
  if ((v = kv('行動値')) !== null) { result.textAct = hokanHalfwidth(v); return; }
  if ((v = kv('暗示')) !== null) { result.hint = v; return; }
  if (line.indexOf('タイトル') === 0) return; // シートのタイトル（情報のみ）
  if (line.indexOf('種族') === 0) {
    const val = kv('種族') || '';
    if (val) result.notes.push('種族「' + val + '」は反映先がないため表示のみです');
    return;
  }
  // 外見情報（身長・体重・髪の色など）は反映先がない。値が入っている場合のみ備考に残す
  if (line.indexOf('身長') === 0 || line.indexOf('体重') === 0 || line.indexOf('髪の色') === 0) {
    const hasValue = line.split('/').some(seg => {
      const m = seg.match(/[:：]\s*(.*)$/);
      return m && m[1].trim() !== '';
    });
    if (hasValue) {
      result.notes.push('外見情報「' + line + '」は反映先がないため表示のみです');
    }
    return;
  }
  result.unparsed.push(line);
}

// 基本パーツだけを DEFAULT_PARTS の並び順に揃える（追加パーツとの相対順序は変えない）
function sortHokanshoBasicParts(parts) {
  if (typeof DEFAULT_PARTS === 'undefined') return;
  const secOf = { '頭部': 'head', '腕部': 'arm', '胴部': 'body', '脚部': 'leg' };
  const order = {};
  Object.keys(DEFAULT_PARTS).forEach(secId => {
    DEFAULT_PARTS[secId].forEach((p, idx) => {
      const key = secId + ':' + p.name;
      if (!(key in order)) order[key] = idx;
    });
  });
  parts.sort((a, b) => {
    if (a.type !== '基本' || b.type !== '基本') return 0;
    const ao = order[(secOf[a.location] || '') + ':' + a.name];
    const bo = order[(secOf[b.location] || '') + ':' + b.name];
    const av = ao !== undefined ? ao : 99;
    const bv = bo !== undefined ? bo : 99;
    return av - bv;
  });
}

// ---------------- 自動計算値との照合（直接は書き込まない） ----------------
function compareHokanshoAct(textAct, actNow) {
  if (!textAct || !actNow) return '';
  if (String(textAct) !== String(actNow)) {
    return '※行動値がテキストと異なります（テキスト：' + textAct + '、計算結果：' + actNow + '）。基本行動値やパーツの損傷を確認してください。';
  }
  return '';
}

function compareHokanshoTotals(textEnhance, totalNow) {
  if (!textEnhance || !totalNow) return '';
  if (textEnhance.wep !== totalNow.wep ||
      textEnhance.mut !== totalNow.mut ||
      textEnhance.cyb !== totalNow.cyb) {
    return '※強化値の合計がテキストと異なります（テキスト：武装' + textEnhance.wep + ' / 変異' + textEnhance.mut + ' / 改造' + textEnhance.cyb +
      '、計算結果：武装' + totalNow.wep + ' / 変異' + totalNow.mut + ' / 改造' + totalNow.cyb + '）。ボーナスの選択を確認してください。';
  }
  return '';
}

function compareHokanshoChouai(textChouai, currentNow) {
  if (textChouai === '' || textChouai == null || currentNow === '' || currentNow == null) return '';
  if (String(textChouai) !== String(currentNow)) {
    return '※寵愛点がテキストと異なります（テキスト：' + textChouai + '点、現在の残り：' + currentNow + '点）。セッション履歴の獲得・使用を確認してください。';
  }
  return '';
}

// ---------------- モーダルUI ----------------
let hokanLastParsed = null;

function openHokanshoImport() {
  const overlay = document.getElementById('hokansho-import-overlay');
  if (!overlay) return;
  overlay.style.display = 'block';
  overlay.scrollTop = 0;
  const preview = document.getElementById('hokansho-import-preview');
  if (preview) preview.innerHTML = '';
  hokanLastParsed = null;
}

function closeHokanshoImport() {
  const overlay = document.getElementById('hokansho-import-overlay');
  if (overlay) overlay.style.display = 'none';
}

function hokanEscape(str) {
  if (typeof escapeHtml === 'function') return escapeHtml(str);
  return String(str || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function renderHokanshoPreview(parsed) {
  const preview = document.getElementById('hokansho-import-preview');
  if (!preview) return;
  if (!parsed || (!parsed.name && parsed.skills.length === 0 && parsed.parts.length === 0 && parsed.history.length === 0)) {
    preview.innerHTML = '<p style="color:#ff8888;">キャラクター保管所のテキストとして認識できませんでした。保管所からコピーした全文を貼り付けているか確認してください。</p>';
    return;
  }
  const rows = [];
  rows.push('<p><b>ドール名：</b>' + hokanEscape(parsed.name || '（不明）') + '　<b>ポジション：</b>' + hokanEscape(parsed.pos || '（不明）') + '</p>');
  rows.push('<p><b>メイン：</b>' + hokanEscape(parsed.mc || '（不明）') + '　<b>サブ：</b>' + hokanEscape(parsed.sc || '（不明）') + '　<b>享年：</b>' + hokanEscape(parsed.age || '（不明）') + '　<b>初期配置：</b>' + hokanEscape(parsed.ps || '（不明）') + '　<b>暗示：</b>' + hokanEscape(parsed.hint || '（不明）') + '</p>');
  rows.push('<p>スキル ' + parsed.skills.length + '件、パーツ ' + parsed.parts.length + '件、記憶のカケラ ' + parsed.memories.length + '件、未練 ' + parsed.list.length + '件</p>');
  if (parsed.textAct || parsed.textEnhance) {
    rows.push('<p>行動値（テキスト）：' + hokanEscape(parsed.textAct || '（なし）') + ' ／ 強化値（テキスト）：' +
      (parsed.textEnhance ? '武装' + parsed.textEnhance.wep + ' / 変異' + parsed.textEnhance.mut + ' / 改造' + parsed.textEnhance.cyb : '（なし）') +
      ' ※自動計算のため直接は反映しません</p>');
  }
  if (parsed.textChouai !== '' || parsed.history.length) {
    rows.push('<p>セッション履歴 ' + parsed.history.length + '件、寵愛点（テキスト）：' + hokanEscape(parsed.textChouai || '（なし）') + '点 ※自動集計のため直接は反映しません</p>');
  }
  if (parsed.history.length) rows.push('<p>セッション履歴：' + parsed.history.map(h => hokanEscape(h.scenario + '：' + h.battle + '点（' + h.memo + '）')).join(' ／ ') + '</p>');
  if (parsed.skills.length) rows.push('<p>スキル：' + parsed.skills.map(s => hokanEscape(s.name)).join('、') + '</p>');
  if (parsed.parts.length) rows.push('<p>パーツ：' + parsed.parts.map(p => hokanEscape(p.name)).join('、') + '</p>');
  if (parsed.memories.length) rows.push('<p>記憶のカケラ：' + parsed.memories.map(m => hokanEscape(m)).join(' ／ ') + '</p>');
  if (parsed.unmatched.length) rows.push('<p style="color:#f0c060;">補えなかったもの：<br>' + parsed.unmatched.map(hokanEscape).join('<br>') + '</p>');
  if (parsed.notes.length) rows.push('<p style="color:#aaa;">備考：<br>' + parsed.notes.map(hokanEscape).join('<br>') + '</p>');
  if (parsed.unparsed.length) rows.push('<p style="color:#ff8888;">読み込めなかった行：<br>' + parsed.unparsed.map(hokanEscape).join('<br>') + '</p>');
  preview.innerHTML = rows.join('');
}

function previewHokanshoImport() {
  const textEl = document.getElementById('hokansho-import-text');
  const text = textEl ? textEl.value : '';
  hokanLastParsed = parseHokanshoText(text);
  renderHokanshoPreview(hokanLastParsed);
}

// 解析結果を既存の getFullData 形式に組み立てる
// （基本情報は空の場合に現在の値を残す。スキル・パーツ・記憶・未練はテキストの内容で置き換える）
function buildHokanshoImportData(parsed) {
  const data = getFullData();
  if (parsed.name) data.name = parsed.name;
  if (parsed.pos) data.pos = parsed.pos;
  if (parsed.mc) data.mc = parsed.mc;
  if (parsed.sc) data.sc = parsed.sc;
  if (parsed.age) data.age = parsed.age;
  if (parsed.ps) data.ps = parsed.ps;
  if (parsed.hint) data.hint = parsed.hint;
  data.skills = parsed.skills;
  data.parts = parsed.parts;
  data.memories = parsed.memories;
  data.list = parsed.list;
  if (parsed.history.length > 0) data.history = parsed.history; // 0件のときは今の履歴を残す
  return data;
}

function importHokanshoText() {
  const textEl = document.getElementById('hokansho-import-text');
  const text = textEl ? textEl.value : '';
  const parsed = parseHokanshoText(text);
  hokanLastParsed = parsed;
  if (!parsed.name && parsed.skills.length === 0 && parsed.parts.length === 0 && parsed.history.length === 0) {
    alert('キャラクター保管所のテキストとして認識できませんでした。保管所からコピーした全文を貼り付けているか確認してください。');
    return;
  }
  const chouaiLine = parsed.textChouai !== '' ? '\n寵愛点（テキスト）：' + parsed.textChouai + '点 ※自動集計のため直接は反映しません' : '';
  if (!confirm('「' + (parsed.name || '(無名)') + '」を読み込みます。\n今の編集中の内容は上書きされます（「元に戻す」で戻せます）。\n\nスキル ' + parsed.skills.length + '件、パーツ ' + parsed.parts.length + '件、記憶のカケラ ' + parsed.memories.length + '件、未練 ' + parsed.list.length + '件、セッション履歴 ' + parsed.history.length + '件を反映します。' + chouaiLine + '\n\nよろしいですか？')) return;

  pushUndoSnapshot();
  const data = buildHokanshoImportData(parsed);
  applyData(data);

  // 自動計算される値との照合（直接は書き込まない）
  const lines = [];
  lines.push('「' + (parsed.name || '(無名)') + '」を読み込みました');
  lines.push('スキル ' + parsed.skills.length + '件、パーツ ' + parsed.parts.length + '件、記憶のカケラ ' + parsed.memories.length + '件、未練 ' + parsed.list.length + '件、セッション履歴 ' + parsed.history.length + '件を反映しました');
  const actNow = document.getElementById('act') ? document.getElementById('act').value : '';
  const actMsg = compareHokanshoAct(parsed.textAct, actNow);
  if (actMsg) lines.push(actMsg);
  const totalNow = {
    wep: parseInt(document.getElementById('total-wep') ? document.getElementById('total-wep').textContent : '0', 10) || 0,
    mut: parseInt(document.getElementById('total-mut') ? document.getElementById('total-mut').textContent : '0', 10) || 0,
    cyb: parseInt(document.getElementById('total-cyb') ? document.getElementById('total-cyb').textContent : '0', 10) || 0
  };
  const totalMsg = compareHokanshoTotals(parsed.textEnhance, totalNow);
  if (totalMsg) lines.push(totalMsg);
  if (parsed.textChouai !== '') {
    lines.push('寵愛点（テキスト）：' + parsed.textChouai + '点 ※自動集計のため直接は反映しません');
  }
  const chouaiNow = document.getElementById('current-chouai') ? document.getElementById('current-chouai').textContent : '';
  const chouaiMsg = compareHokanshoChouai(parsed.textChouai, chouaiNow);
  if (chouaiMsg) lines.push(chouaiMsg);
  if (parsed.unmatched.length) lines.push('補えなかったもの：\n' + parsed.unmatched.join('\n'));
  if (parsed.notes.length) lines.push('備考：\n' + parsed.notes.join('\n'));
  if (parsed.unparsed.length) lines.push('読み込めなかった行：\n' + parsed.unparsed.join('\n'));

  closeHokanshoImport();
  alert(lines.join('\n'));
  if (confirm('このブラウザにもキャラクターとして保存しますか？\n（保存すると「保存済みキャラクター」からいつでも呼び出せます）')) {
    saveData();
  }
  markDirty();
}
