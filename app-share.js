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
// 外見などの項目名 → シートの欄（髪色/瞳色/肌色のような短い書き方も受け付ける）
const HK_APPEARANCE_KEYS = {
  '身長': 'height', '体重': 'weight',
  '髪の色': 'hair', '髪色': 'hair', '瞳の色': 'eye', '瞳色': 'eye', '肌の色': 'skin', '肌色': 'skin'
};
const HK_APPEARANCE_NAMES = { height: '身長', weight: '体重', hair: '髪の色', eye: '瞳の色', skin: '肌の色' };

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

// 強化値の表の1行「ﾒｲﾝｸﾗｽ　　 1　　 0　　 1」を読む。半角カナ・全角の「＝合計＝」なども正規化して、ラベルを判定する。
// 数字は「武装・変異・改造」の3列に割り振る。3つ並んでいれば順番どおり。少ないときは、数字の前の空白の幅（1列＝3文字分）から列を求める
// 空白の幅が合わず列が決められないときは ambiguous: true を返す（呼び出し側で「位置が分からない」と知らせる）
function hkParseEnhanceRow(rawLine) {
  const s = String(rawLine || '').normalize('NFKC').replace(/\s+$/, '');
  const m = s.match(/^\s*(メインクラス|サブクラス|ボーナス|寵愛による修正|寵愛|=?合計=?|総計)/);
  if (!m) return null;
  const labelRaw = m[1];
  const key = labelRaw === 'メインクラス' ? 'main' : labelRaw === 'サブクラス' ? 'sub' : labelRaw === 'ボーナス' ? 'bonus'
    : /寵愛/.test(labelRaw) ? 'chouai' : 'total';
  const rest = s.slice(m[0].length);
  const tokens = [];
  const re = /(\s*)([+-]?\d+)/g;
  let t;
  while ((t = re.exec(rest)) !== null) tokens.push({ gap: t[1].length, value: parseInt(t[2], 10) });

  const cells = [null, null, null];
  let ambiguous = false;
  if (tokens.length >= 3) {
    for (let i = 0; i < 3; i++) cells[i] = tokens[i].value;
  } else {
    let col = -1;
    tokens.forEach(tk => {
      if (tk.gap % 3 !== 0) ambiguous = true;
      col += Math.max(1, Math.round(tk.gap / 3));
      if (col >= 0 && col < 3) cells[col] = tk.value;
    });
  }
  return { key: key, cells: cells, hasNumbers: tokens.length > 0, ambiguous: ambiguous };
}

// 未練の1行「対象 への 内容 ■■■□ 発狂時(効果)」を読む。対象と内容が両方空なら空の行（保管所の空き枠）として返す
// 内容は ■□ を含まない文字列。狂気度は ■ の数。発狂時の「()」だけのものは空として扱う
function hkParseMirenRow(text) {
  const m = String(text || '').match(/^(.*?)\s*への\s*([^\s■□]*)\s*([■□]*)\s*(.*)$/);
  if (!m) return null;
  const target = m[1].trim(), emotion = m[2].trim();
  const note = /^[()（）\s]*$/.test(m[4]) ? '' : m[4].trim();
  return { target: target, emotion: emotion, madness: (m[3].match(/■/g) || []).length, note: note, blank: !target && !emotion };
}

// テキストを解析する（画面には触らない）
function parseHokanshoText(raw) {
  const r = {
    fields: {}, memories: [], list: [], skills: [], parts: [],
    enhanceLines: [], enhance: {}, madnessNotes: [], unrecognized: [], recognized: 0,
    history: [], blankHistoryRows: 0, blankMirenRows: 0, growth: ''
  };
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n');
  let section = '';
  let mirenMode = false; // 「[未練] 内容 狂気度 発狂時」の見出しの後、1行1件で未練が並んでいる間はtrue

  // 未練の1行を結果に入れる（空の行は数えるだけ）
  const addMirenRow = row => {
    if (row.blank) { r.blankMirenRows++; return; }
    r.list.push({ target: row.target, emotion: row.emotion, madness: row.madness });
    if (row.note) r.madnessNotes.push(`${row.target || '（対象なし）'}：${row.note}`);
    r.recognized++;
  };

  lines.forEach(rawLine => {
    const line = rawLine.replace(/　/g, ' ').trim();
    if (!line) return;

    // ■強化値■ のような区切り行
    const head = line.match(/^■\s*([^■]+?)\s*■\s*(.*)$/) || line.match(/^■\s*([^■\s]+)\s*$/);
    if (head) {
      mirenMode = false;
      section = head[1];
      if (head[2] && section === '強化値') r.enhanceLines.push(head[2]); // 区切りと同じ行に値が続く場合
      return;
    }

    // 未練の表の中の行（見出し「[未練] 内容 狂気度 発狂時」の後に続く、1行1件の形）
    if (mirenMode) {
      const isKeyLine = /^(タイトル|キャラクター名|名前|享年|ポジション|クラス|初期配置|行動値|暗示|寵愛点|成長履歴|身長|体重|髪の色|髪色|瞳の色|瞳色|肌の色|肌色)\s*[:：]/.test(line);
      const row = (!/^[\[［【]/.test(line) && !isKeyLine) ? hkParseMirenRow(line) : null;
      if (row) { addMirenRow(row); return; }
      mirenMode = false; // 表が終わった。この行は、ほかの行と同じように読む
    }

    // [ラベル] で始まる行
    const lab = line.match(/^[\[［【]\s*([^\]］】]+?)\s*[\]］】]\s*(.*)$/);
    if (lab) {
      const label = lab[1].trim();
      const body = lab[2].trim();
      if (label !== '未練') mirenMode = false;

      if (label === '記憶のカケラ') {
        const sp = body.match(/^(\S+)\s*(.*)$/);
        if (!sp) { r.unrecognized.push(line); return; }
        r.memories.push(sp[2] ? `${sp[1]}：${sp[2]}` : sp[1]);
        r.recognized++;
        return;
      }

      if (label === '未練') {
        // 「[未練] たからもの への 依存 ■■■□ …」のように1行に書かれている形
        const row = /への/.test(body) ? hkParseMirenRow(body) : null;
        if (row) { addMirenRow(row); return; }
        // 「[未練] 内容 狂気度 発狂時」のような見出し行。次の行から未練が1行ずつ並ぶ
        if (!body || /内容|狂気度|発狂/.test(body)) { mirenMode = true; return; }
        r.unrecognized.push(line);
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

    // ■強化値■ の表（見出し「武装 変異 改造」と、メインクラス/サブクラス/ボーナス/寵愛/合計の各行）
    if (section === '強化値') {
      const nl = line.normalize('NFKC');
      if (/武装/.test(nl) && /変異/.test(nl) && /改造/.test(nl) && !/\d/.test(nl)) return; // 列の見出し行は読み飛ばす
      const er = hkParseEnhanceRow(rawLine);
      if (er) {
        r.enhance[er.key] = er;
        // ボーナス・寵愛に1以上の数字があるときだけ、読み込めた内容として数える
        // （メインクラス・サブクラス・合計は自動計算と比べるだけ。空のひな形の「0 0 0」を内容として数えないため）
        if ((er.key === 'bonus' || er.key === 'chouai') && !er.ambiguous && er.cells.some(v => v > 0)) r.recognized++;
        return;
      }
    }

    // 見出し行が無くても、「…への…■■■□」の形の行は未練の1行として読む
    if (/への/.test(line) && /[■□]{2,}/.test(line)) {
      const row = hkParseMirenRow(line);
      if (row) { addMirenRow(row); return; }
    }

    // 身長・体重・髪の色・瞳の色・肌の色（1行に1項目でも、1行に複数並んでいても読む）
    if (/^(身長|体重|髪の色|髪色|瞳の色|瞳色|肌の色|肌色)\s*[:：]/.test(line)) {
      const re = /(身長|体重|髪の色|髪色|瞳の色|瞳色|肌の色|肌色)\s*[:：]\s*/g;
      const marks = [];
      let mm;
      while ((mm = re.exec(line)) !== null) marks.push({ key: mm[1], start: mm.index, valStart: re.lastIndex });
      marks.forEach((mk, i) => {
        // 次の項目との区切り（「 / 」「/」「、」「,」）は値に含めない。値の途中の「/」（例：銀/青）はそのまま残す
        const val = line.slice(mk.valStart, i + 1 < marks.length ? marks[i + 1].start : line.length).trim().replace(/[\s\/／、,，]+$/, '');
        r.fields[HK_APPEARANCE_KEYS[mk.key]] = val;
        if (val) r.recognized++; // 値が空の項目は、読み込めた内容として数えない（空のひな形だけの貼り付けを見分けるため）
      });
      return;
    }

    // 「キー：値」の行
    const kv = line.match(/^(タイトル|キャラクター名|名前|享年|ポジション|クラス|初期配置|行動値|暗示|寵愛点|成長履歴)\s*[:：]\s*(.*)$/);
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
      else if (key === '寵愛点') { const n = parseInt(hkToHalf(val), 10); if (Number.isFinite(n)) r.fields.chouai = n; }
      else if (key === '成長履歴') r.growth = val;
      // 値が空の項目は、読み込めた内容として数えない（空のひな形だけの貼り付けを見分けるため）
      if (key !== 'タイトル' && val) r.recognized++;
      return;
    }

    // 成長履歴の表の見出し行（「No. 獲得寵愛点(達成/ボーナス/ピンゾロ) メモ」）は読み飛ばす
    if (/^No\.?\s*獲得寵愛点/i.test(hkToHalf(line))) return;

    // 成長履歴の1行：「No.  合計点(戦闘/個人)  メモ」。例：「1 3点(2/1) 第一話」
    const histConv = hkToHalf(line);
    const hist = histConv.match(/^(\d+)\s*(\d*)\s*点\s*[(（]\s*(\d*)\s*[\/／]\s*(\d*)\s*[)）]\s*(.*)$/);
    if (hist) {
      const row = {
        no: parseInt(hist[1], 10),
        total: hist[2] === '' ? null : parseInt(hist[2], 10),
        battle: hist[3] === '' ? null : parseInt(hist[3], 10),
        personal: hist[4] === '' ? null : parseInt(hist[4], 10),
        memo: line.slice(histConv.length - hist[5].length).trim() // メモは元の文字のまま（全角数字を半角にしない）
      };
      if (row.total === null && row.battle === null && row.personal === null && !row.memo) {
        r.blankHistoryRows++; // 中身が空の行（ひな形のまま）は読み込まない
      } else {
        r.history.push(row);
        r.recognized++;
      }
      return;
    }

    // ■強化値■ の中の行は、後で計算結果との比較に使う
    if (section === '強化値' && /武装|変異|改造/.test(line)) { r.enhanceLines.push(line); return; }

    r.unrecognized.push(line);
  });

  return r;
}

// どの項目を置き換えるか。キャラ名・スキル・パーツのどれかがある＝シート全体のテキストとみなして全項目を置き換え、
// 「■その他■」だけを貼った場合などは、テキストに入っている項目だけを置き換えて、無い項目は今のまま残す
function hkReplacePlan(p) {
  const full = !!(p.fields.name || p.skills.length || p.parts.length);
  return {
    full: full,
    skills: full || p.skills.length > 0,
    parts: full || p.parts.length > 0,
    memories: full || p.memories.length > 0,
    list: full || p.list.length > 0,
    history: p.history.length > 0,
    enhance: !!((p.enhance.bonus && !p.enhance.bonus.ambiguous && p.enhance.bonus.cells.some(v => v > 0)) || (p.enhance.chouai && !p.enhance.chouai.ambiguous && p.enhance.chouai.cells.some(v => v > 0)))
  };
}

// 解析結果をキャラシに反映し、読み込み結果（件数・注意点）を返す
function applyHokanshoParsed(p) {
  const rep = {
    skills: 0, partsExtra: 0, partsBase: 0, memories: 0, list: 0, blankMirenRows: p.blankMirenRows, history: 0, appearance: 0, historyKept: false, blankHistoryRows: p.blankHistoryRows,
    growth: p.growth, unmatchedParts: [], customSkills: [], notes: [], mismatches: [],
    unrecognized: p.unrecognized.slice(), memoAdded: 0, memoSkipped: 0, madnessNotes: p.madnessNotes.slice(), enhanceApplied: []
  };

  const plan = hkReplacePlan(p);
  rep.keep = { skills: !plan.skills, parts: !plan.parts, memories: !plan.memories, list: !plan.list };
  const data = getFullData(); // 保管所テキストに無い項目（PL名・寵愛・たからもの等）は今の内容を引き継ぐ

  // 読み込めなかった行は、メモ欄に追記する（今のメモは消さない。すでにメモにある行は重ねて入れない）
  if (p.unrecognized.length) {
    const current = data.freeMemo || '';
    const existing = new Set(current.split('\n').map(l => l.trim()));
    const fresh = p.unrecognized.filter(l => !existing.has(l.trim()));
    rep.memoSkipped = p.unrecognized.length - fresh.length;
    if (fresh.length) {
      data.freeMemo = (current.trim() ? current.replace(/\s+$/, '') + '\n\n' : '') + '■ 保管所テキストで読み込めなかった行\n' + fresh.join('\n');
      rep.memoAdded = fresh.length;
    }
  }
  const selectHas = (id, v) => Array.from(document.getElementById(id).options).some(o => o.value === v);
  const f = p.fields;

  if (f.name) data.name = f.name;
  if (f.age !== undefined) data.age = f.age;
  if (f.hint !== undefined) data.hint = f.hint;
  Object.keys(HK_APPEARANCE_NAMES).forEach(k => {
    if (f[k] !== undefined) { data[k] = f[k]; if (f[k]) rep.appearance++; }
  });
  [['pos', 'ポジション'], ['mc', 'メインクラス'], ['sc', 'サブクラス'], ['ps', '初期配置']].forEach(([key, label]) => {
    if (!f[key]) return;
    if (selectHas(key, f[key])) data[key] = f[key];
    else rep.notes.push(`${label}「${f[key]}」はこのシートの選択肢に無いため、今の設定のままにしました。`);
  });

  // スキル（区分＝ポジション/メインクラス/サブクラスの今の設定）
  if (plan.skills) data.skills = p.skills.map(s => {
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
  if (plan.parts) {
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
  }

  if (plan.memories) { data.memories = p.memories.slice(); rep.memories = p.memories.length; }
  if (plan.list) { data.list = p.list.map(x => ({ target: x.target, emotion: x.emotion, madness: String(x.madness) })); rep.list = p.list.length; }

  // 強化値：ボーナス（+1する列）と寵愛による修正を反映する。メインクラス・サブクラス・合計は自動計算なので、反映せず後で比べるだけ
  const en = p.enhance || {};
  const COLS = ['武装', '変異', '改造'];
  if (en.bonus) {
    const idx = en.bonus.cells.findIndex(v => v > 0);
    if (en.bonus.ambiguous) {
      if (en.bonus.hasNumbers) rep.notes.push('強化値のボーナス：数字の位置から武装・変異・改造のどの列か判断できなかったため、今の設定のままにしました。');
    } else if (idx >= 0) {
      data.bonus = ['wep', 'mut', 'cyb'][idx]; rep.enhanceApplied.push(`ボーナス＝${COLS[idx]}`);
    }
  }
  if (en.chouai) {
    if (en.chouai.ambiguous) {
      rep.notes.push('強化値の寵愛：数字の位置から武装・変異・改造のどの列か判断できなかったため、今の設定のままにしました。');
    } else if (en.chouai.cells.some(v => v !== null) || plan.full) {
      // シート全体のテキストで寵愛の欄が空なら、寵愛による修正は 0 とする。一部だけ貼った場合は、数字があるときだけ反映する
      const v = en.chouai.cells.map(x => x || 0);
      data.chouaiWep = String(v[0]); data.chouaiMut = String(v[1]); data.chouaiCyb = String(v[2]);
      if (v.some(x => x > 0)) rep.enhanceApplied.push(`寵愛による修正＝武装${v[0]}・変異${v[1]}・改造${v[2]}`);
    }
  }

  // セッション履歴（獲得寵愛）：中身のある行があるときだけ置き換え、ひな形だけなら今の履歴をそのまま残す
  if (p.history.length) {
    data.history = p.history.map(h => {
      const hasBreakdown = h.battle !== null || h.personal !== null;
      let battle = h.battle || 0, personal = h.personal || 0;
      if (!hasBreakdown && h.total !== null) {
        battle = h.total; // 内訳が無いときは合計を戦闘寵愛に入れる（個人寵愛と分けられないため）
        if (h.total > 0) rep.notes.push(`成長履歴 No.${h.no}：内訳が無いため、合計 ${h.total} 点を戦闘寵愛に入れました。`);
      } else if (h.total !== null && h.total !== battle + personal) {
        rep.notes.push(`成長履歴 No.${h.no}：合計 ${h.total} 点と内訳（戦闘 ${battle} ＋ 個人 ${personal}）が合いません。内訳のほうを入れています。`);
      }
      return { scenario: '', battle: String(battle), personal: String(personal), memo: h.memo };
    });
    rep.history = p.history.length;
  } else {
    rep.historyKept = (data.history || []).length > 0;
  }

  applyData(data);

  // 強化値・最大行動値は自動計算なので、テキストの値と違えば知らせる
  const num = id => parseInt(document.getElementById(id)?.textContent, 10);
  const appTotals = { '武装': num('total-wep'), '変異': num('total-mut'), '改造': num('total-cyb') };
  const textTotals = {};
  const totalRow = (p.enhance || {}).total;
  if (totalRow && totalRow.hasNumbers && !totalRow.ambiguous) {
    ['武装', '変異', '改造'].forEach((k, i) => { if (totalRow.cells[i] !== null) textTotals[k] = totalRow.cells[i]; });
  } else {
    // 従来の「武装：5 変異：1 改造：2」のような書き方
    p.enhanceLines.join(' ').replace(/(武装|変異|改造)[^\d\-]*(\d+)/g, (m, k, v) => { textTotals[k] = parseInt(v, 10); return m; });
  }
  Object.keys(textTotals).forEach(k => {
    if (textTotals[k] !== appTotals[k]) rep.mismatches.push(`強化値の合計（${k}）：テキスト ${textTotals[k]} ／ このシートの計算 ${appTotals[k]}`);
  });
  // メインクラス・サブクラスの強化値も、シートの計算（クラスから自動で決まる）と比べる
  [['main', 'メインクラス', 'mc'], ['sub', 'サブクラス', 'sc']].forEach(([k, label, pre]) => {
    const row = (p.enhance || {})[k];
    if (!row || !row.hasNumbers || row.ambiguous) return;
    const app3 = ['wep', 'mut', 'cyb'].map(x => num(`${pre}-${x}`));
    const txt3 = row.cells.map(v => (v === null ? 0 : v));
    if (txt3.some((v, i) => v !== app3[i])) rep.mismatches.push(`強化値（${label}）：テキスト 武装${txt3[0]}・変異${txt3[1]}・改造${txt3[2]} ／ このシートの計算 武装${app3[0]}・変異${app3[1]}・改造${app3[2]}`);
  });
  if (Number.isFinite(f.act)) {
    const appAct = parseInt(document.getElementById('act')?.value, 10);
    if (appAct !== f.act) rep.mismatches.push(`最大行動値：テキスト ${f.act} ／ このシートの計算 ${appAct}（基本行動値を変えるとそろえられます）`);
  }
  if (Number.isFinite(f.chouai)) {
    const earned = parseInt(document.getElementById('total-earned-chouai')?.textContent, 10);
    const left = parseInt(document.getElementById('current-chouai')?.textContent, 10);
    if (f.chouai !== earned && f.chouai !== left) {
      rep.mismatches.push(`寵愛点：テキスト ${f.chouai} ／ このシートの総獲得 ${earned}・現在の残り ${left}`);
    }
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
    rep.keep.skills ? 'スキル：変更なし（テキストに無かったため）' : `スキル：${rep.skills}件`,
    rep.keep.parts ? 'マニューバ（パーツ）：変更なし（テキストに無かったため）' : `マニューバ（パーツ）：${rep.partsExtra}件（基本パーツ ${rep.partsBase}件は自動配置済み）`,
    rep.keep.memories ? '記憶のカケラ：変更なし（テキストに無かったため）' : `記憶のカケラ：${rep.memories}件`,
    rep.keep.list ? '未練：変更なし（テキストに無かったため）' : `未練：${rep.list}件` + (rep.blankMirenRows ? `（空の行 ${rep.blankMirenRows}行は読み込んでいません）` : ''),
    ...(rep.appearance ? [`外見（身長・体重・髪/瞳/肌の色）：${rep.appearance}項目`] : []),
    ...(rep.enhanceApplied.length ? [`強化値：${rep.enhanceApplied.join('、')}`] : []),
    `セッション履歴（獲得寵愛）：${rep.history}件` + (rep.blankHistoryRows ? `（空の行 ${rep.blankHistoryRows}行は読み込んでいません）` : '') + (rep.historyKept ? '（今の履歴をそのまま残しました）' : '')
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
  if (rep.growth) {
    html += h('■ 成長履歴の文章（このシートに欄が無いため未反映）');
    html += li([e(rep.growth)]);
  }
  if (rep.madnessNotes.length) {
    html += h('■ 発狂の情報（このシートに欄が無いため未反映）');
    html += li(rep.madnessNotes.map(e));
  }
  if (rep.notes.length) { html += h('■ 注意'); html += li(rep.notes.map(e)); }
  if (rep.unrecognized.length) {
    html += h('■ 読み込めなかった行');
    html += li(rep.unrecognized.map(l => e(l.length > 60 ? l.slice(0, 60) + '…' : l)));
    // メモ欄への追記の結果
    const memoNote = rep.memoAdded
      ? `これらの行は、シート下部の「メモ」欄に追記しました（${rep.memoAdded}行）。` + (rep.memoSkipped ? `すでにメモにある ${rep.memoSkipped}行は重ねて入れていません。` : '')
      : 'すべて、すでにメモ欄にある行でした（重ねて入れていません）。';
    html += `<div style="color:#7fe3a8; font-size:0.78rem; margin-top:4px;">${e(memoNote)}</div>`;
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

  const plan = hkReplacePlan(parsed);
  const overwriteList = plan.full
    ? 'キャラ名・クラス・スキル・マニューバ・記憶のカケラ・未練' + (plan.history ? '・セッション履歴' : '') + 'など'
    : [plan.skills && 'スキル', plan.parts && 'マニューバ', plan.memories && '記憶のカケラ', plan.list && '未練', plan.history && 'セッション履歴', plan.enhance && 'ボーナス・寵愛による修正'].filter(Boolean).join('・') || '一部の項目';
  if (!confirm(`今のシートの内容（${overwriteList}）を、貼り付けたテキストの内容で上書きします。\n「↩️ 元に戻す」で戻せます。\n\nよろしいですか？`)) return;

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
