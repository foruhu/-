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

// ココフォリアのチャットパレット用の文章を作る
//  先頭に判定コマンド、続けて --ポジション-- --メインクラス-- --サブクラス-- --頭-- --腕-- --胴-- --脚-- の順に
//  「【名前】\n《T:タイミング／C:コスト／R:射程》\n効果」を1件1行で並べる（\n は文字どおりの \ と n で、チャットで改行になる）
//  攻撃マニューバの行頭には「1na」（出目+Nがある場合は「1na+N」）を付けて、押すとそのまま攻撃判定できる
function buildCcfoliaCommandLines(data) {
  const one = t => String(t || '').replace(/\s*\n\s*/g, ' ').trim();
  const body = (x, prefix) => {
    const spec = `《T:${x.timing || ''}／C:${x.cost || ''}／R:${x.range || ''}》`;
    return `${prefix ? prefix + ' ' : ''}【${x.name}】\\n${spec}\\n${one(x.memo)}`;
  };
  const attackPrefix = p => {
    const memo = one(p.memo);
    if (!(p.tag === '攻撃' || /(肉弾|白兵|射撃|砲撃)(攻撃)?[0-9０-９]|攻撃[0-9０-９]/.test(memo))) return '';
    const m = memo.match(/出目\+(\d+)/);
    return m ? `1na+${m[1]}` : '1na';
  };
  const lines = ['nm 【未練決定】', '1nc 【対話判定】', '1nc 【狂気判定】', '1nc 【行動判定】'];
  const skills = (data.skills || []).filter(x => x.name);
  const skillsOf = c => c ? skills.filter(x => x.category === c) : [];
  const section = (label, arr, isPart) => {
    lines.push(`--${label}--`);
    arr.forEach(x => lines.push(body(x, isPart ? attackPrefix(x) : '')));
  };
  section('ポジション', skillsOf(data.pos), false);
  section('メインクラス', skillsOf(data.mc), false);
  section('サブクラス', skillsOf(data.sc), false);
  const parts = (data.parts || []).filter(p => p.name);
  const known = ['頭部', '腕部', '胴部', '脚部'];
  [['頭', '頭部'], ['腕', '腕部'], ['胴', '胴部'], ['脚', '脚部']].forEach(([label, loc]) => {
    section(label, parts.filter(p => p.location === loc), true);
  });
  const others = parts.filter(p => !known.includes(p.location));
  if (others.length) section('その他', others, true);
  return lines;
}

function exportCcfolia() {
  const data = getFullData();

  const actValue = parseInt(data.act, 10) || 0;
  const currentChouaiEl = document.getElementById('current-chouai');
  const currentChouai = currentChouaiEl ? (parseInt(currentChouaiEl.textContent, 10) || 0) : 0;

  // ステータス欄：行動値・寵愛点・損傷（壊れた数/パーツ数）・未練ごとの狂気点（0〜4）
  const partList = (data.parts || []).filter(p => p.name);
  const brokenCount = partList.filter(p => p.isBroken).length;
  const status = [
    { label: '行動値', value: actValue, max: actValue }
  ];
  // 「せぼね」など貯めて使うパーツは、ストック数を数えるための欄（0/0）を作る
  const stocked = [];
  partList.forEach(p => {
    if ((p.name === 'せぼね' || /貯め|ストック/.test(p.memo || '')) && !stocked.includes(p.name)) {
      stocked.push(p.name);
      status.push({ label: p.name, value: 0, max: 0 });
    }
  });
  (data.list || []).forEach(l => {
    const name = (l.target || '').trim();
    if (!name && !l.emotion) return;
    status.push({ label: `${name || '○○'}への未練`, value: Math.max(0, Math.min(4, parseInt(l.madness, 10) || 0)), max: 4 });
  });

  // パラメータ欄は使わない（情報はメモ欄に入れる）
  const params = [];

  const commandLines = buildCcfoliaCommandLines(data);

  // メモ欄：基本情報 → 記憶のかけら → 部位ごとのパーツ一覧（【名前】を並べる）
  const memoLines = [];
  memoLines.push(`名前: ${data.name || ''}`);
  memoLines.push(`ポジション: ${data.pos || ''}`);
  memoLines.push(`クラス： ${[data.mc, data.sc].filter(Boolean).join(' / ')}`);
  memoLines.push(`行動値: ${actValue}`);
  memoLines.push('');
  memoLines.push('記憶のかけら');
  const memTexts = (data.memories || []).map(memoryToText).filter(Boolean);
  if (memTexts.length) memTexts.forEach(t => memoLines.push(t)); else memoLines.push('記憶のカケラなし');
  memoLines.push('');
  const names = arr => arr.filter(x => x.name).map(x => `【${x.name}】`).join('');
  const skillsOf = c => c ? (data.skills || []).filter(x => x.category === c) : [];
  memoLines.push(`--ポジション--${names(skillsOf(data.pos))}`);
  memoLines.push(`--メインクラス--${names(skillsOf(data.mc))}`);
  memoLines.push(`--サブクラス--${names(skillsOf(data.sc))}`);
  [['頭', '頭部'], ['腕', '腕部'], ['胴', '胴部'], ['脚', '脚部']].forEach(([label, loc]) => {
    memoLines.push(`--${label}--${names((data.parts || []).filter(p => p.location === loc))}`);
  });
  memoLines.push('');
  (data.treasures || []).forEach(t => {
    if (t.name) memoLines.push(`たからもの: ${t.name}${t.content ? '（' + t.content + '）' : ''}`);
  });
  (data.list || []).forEach(l => {
    if (l.target || l.emotion) {
      memoLines.push(`未練[${l.target || '?'}] ${l.emotion || ''}（狂気点${l.madness || 0}）` + (l.madName ? ` 発狂：${l.madName}${l.madEffect ? '（' + l.madEffect + '）' : ''}` : ''));
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
  if (!confirmIssueShare(false)) return;
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
    recordShare(token, data.name, false);
    url = location.origin + location.pathname + '#tok=' + token;
  } catch (err) {
    url = location.origin + location.pathname + '#share=' + encoded;
  }

  const shareTitle = (data.name || 'ドール') + ' のキャラクターシート';

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
  if (!confirmIssueShare(true)) return;
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
    recordShare(token, data.name, true);
    url = location.origin + location.pathname + '#tok=' + token;
  } catch (err) {
    url = location.origin + location.pathname + '#view=' + encoded;
  }

  const shareTitle = (data.name || 'ドール') + ' のキャラクターシート（閲覧用）';

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
    // 編集できないようロックする（この人自身の「表示/編集」の設定は書き換えない）
    if (typeof lockViewOnly === 'function') lockViewOnly();
    // 閲覧用URLを開いた人には、最初は全項目を見せる（メモや履歴も）。この人自身の「戦闘用」の設定は書き換えない
    if (typeof applyBattleView === 'function') applyBattleView(false);
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
// 「項目名：値」の行の判定（表の途中で、表の終わりを見分けるために使う）
const HK_KEY_LINE = /^(種族|タイトル|キャラクター名|名前|享年|ポジション|クラス|初期配置|行動値|暗示|寵愛点|成長履歴|身長|体重|髪の色|髪色|瞳の色|瞳色|肌の色|肌色)\s*[:：]/;
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
  // 発狂時「幼児退行(最大行動値減少(-2))」を、名前と効果に分ける。かっこが無ければ全部を名前にする
  let madName = note, madEffect = '';
  const pm = note.match(/^([^()（）]*?)\s*[(（]([\s\S]*)[)）]\s*$/);
  if (pm) { madName = pm[1].trim(); madEffect = pm[2].trim(); }
  return { target: target, emotion: emotion, madness: (m[3].match(/■/g) || []).length, note: note, madName: madName, madEffect: madEffect, blank: !target && !emotion };
}

// テキストを解析する（画面には触らない）
function parseHokanshoText(raw) {
  const r = {
    fields: {}, memories: [], list: [], skills: [], parts: [],
    enhanceLines: [], enhance: {}, madnessNotes: [], unrecognized: [], recognized: 0,
    history: [], uses: [], blankHistoryRows: 0, blankMirenRows: 0, blankManeuverRows: 0, growth: ''
  };
  const lines = String(raw || '').replace(/\r\n?/g, '\n').split('\n');
  let section = '';
  // 同じ項目が2か所に出てくるとき（先頭の「享年：8」と、パーソナルデータの「享年：」など）、空の値が先の値を消さないようにする
  const setField = (key, val) => { if (val !== '' || r.fields[key] === undefined) r.fields[key] = val; };
  let memoryMode = false; // 「[記憶のカケラ] 内容」の見出しの後、1行1件で記憶のカケラが並んでいる間はtrue
  let mirenMode = false; // 「[未練] 内容 狂気度 発狂時」の見出しの後、1行1件で未練が並んでいる間はtrue

  // 未練の1行を結果に入れる（空の行は数えるだけ）
  const addMirenRow = row => {
    if (row.blank) { r.blankMirenRows++; return; }
    r.list.push({ target: row.target, emotion: row.emotion, madness: row.madness, madName: row.madName, madEffect: row.madEffect });
    r.recognized++;
  };

  lines.forEach(rawLine => {
    const line = rawLine.replace(/　/g, ' ').trim();
    if (!line) return;

    // ■強化値■ のような区切り行
    const head = line.match(/^■\s*([^■]+?)\s*■\s*(.*)$/) || line.match(/^■\s*([^■\s]+)\s*$/);
    if (head) {
      mirenMode = false;
      memoryMode = false;
      section = head[1];
      if (head[2] && section === '強化値') r.enhanceLines.push(head[2]); // 区切りと同じ行に値が続く場合
      return;
    }

    // 記憶のカケラの表の中の行（見出しの後に続く、1行1件の形）
    if (memoryMode) {
      if (/^[\[［【]/.test(line) || HK_KEY_LINE.test(line)) {
        memoryMode = false; // 表が終わった。この行は、ほかの行と同じように読む
      } else {
        const sp = line.match(/^(\S+)\s*[:：]?\s*(.*)$/);
        r.memories.push(sp[2] ? `${sp[1]}：${sp[2]}` : sp[1]);
        r.recognized++;
        return;
      }
    }

    // 未練の表の中の行（見出し「[未練] 内容 狂気度 発狂時」の後に続く、1行1件の形）
    if (mirenMode) {
      const isKeyLine = HK_KEY_LINE.test(line);
      const row = (!/^[\[［【]/.test(line) && !isKeyLine) ? hkParseMirenRow(line) : null;
      if (row) { addMirenRow(row); return; }
      mirenMode = false; // 表が終わった。この行は、ほかの行と同じように読む
    }

    // 「[]」（部位が空）で始まる行。マニューバ名が空なら、保管所の空き枠として読み込まない
    // （空き枠の行は「: オート :」のように初期値が入っているため、内容としては数えない）
    const emptyLab = line.match(/^[\[［【]\s*[\]］】]\s*(.*)$/);
    if (emptyLab) {
      mirenMode = false;
      const f = hkSplitFields(emptyLab[1], 4);
      if (!f[0]) { r.blankManeuverRows++; return; }
      r.unrecognized.push(line); // 名前があるのに部位が空：どこに置くか決められないので、知らせてメモに残す
      return;
    }

    // [ラベル] で始まる行
    const lab = line.match(/^[\[［【]\s*([^\]］】]+?)\s*[\]］】]\s*(.*)$/);
    if (lab) {
      const label = lab[1].trim();
      const body = lab[2].trim();
      if (label !== '未練') mirenMode = false;
      if (label !== '記憶のカケラ') memoryMode = false;
      if (label === '部位' && /マニューバ名/.test(body)) return; // 表の見出し行

      if (label === '記憶のカケラ') {
        // 「[記憶のカケラ] 内容」のような見出し行（中身が空の枠も同じ）。読み込む内容は無いので数えない
        if (!body || /^(内容|名前|詳細|内容\s*詳細|名前\s*内容)$/.test(body)) { memoryMode = !body || body !== '' ; return; }
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
        setField(HK_APPEARANCE_KEYS[mk.key], val);
        if (val) r.recognized++; // 値が空の項目は、読み込めた内容として数えない（空のひな形だけの貼り付けを見分けるため）
      });
      return;
    }

    // 「キー：値」の行
    const kv = line.match(/^(種族|タイトル|キャラクター名|名前|享年|ポジション|クラス|初期配置|行動値|暗示|寵愛点|成長履歴)\s*[:：]\s*(.*)$/);
    if (kv) {
      const key = kv[1], val = kv[2].trim();
      if (key === '種族') { if (val) r.unrecognized.push(line); return; } // このシートに欄が無い。空なら何もしない
      if (key === 'キャラクター名' || key === '名前') setField('name', val);
      else if (key === '享年') setField('age', val);
      else if (key === 'ポジション') setField('pos', val);
      else if (key === 'クラス') {
        const cls = val.split(/\s*[\/／・]\s*/);
        setField('mc', (cls[0] || '').trim());
        setField('sc', (cls[1] || '').trim());
      }
      else if (key === '初期配置') setField('ps', val);
      else if (key === '行動値') r.fields.act = parseInt(hkToHalf(val), 10);
      else if (key === '暗示') setField('hint', val);
      else if (key === '寵愛点') { const n = parseInt(hkToHalf(val), 10); if (Number.isFinite(n)) r.fields.chouai = n; }
      else if (key === '成長履歴') { if (val || !r.growth) r.growth = val; }
      // 値が空の項目は、読み込めた内容として数えない（空のひな形だけの貼り付けを見分けるため）
      if (key !== 'タイトル' && val) r.recognized++;
      return;
    }

    // 成長履歴の表の見出し行（「No. 獲得寵愛点(達成/ボーナス/ピンゾロ) メモ」）は読み飛ばす
    if (/^No\.?\s*獲得寵愛点/i.test(hkToHalf(line))) return;

    // 成長履歴の1行：「No.  合計点(戦闘/個人)  メモ」。例：「1 3点(2/1) 第一話」
    const histConv = hkToHalf(line);
    const hist = histConv.match(/^(\d+)\s*(-?\d*)\s*点\s*[(（]\s*(-?\d*)\s*[\/／]\s*(-?\d*)\s*[)）]\s*(.*)$/);
    if (hist && hist[2].startsWith('-') && hist[2].length > 1) {
      // マイナスの行は寵愛点を使った記録。「寵愛点の使い道・強化履歴」に入れる
      r.uses.push({ no: parseInt(hist[1], 10), used: -parseInt(hist[2], 10), memo: line.slice(histConv.length - hist[5].length).trim() });
      r.recognized++;
      return;
    }
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
    uses: p.uses.length > 0,
    enhance: !!((p.enhance.bonus && !p.enhance.bonus.ambiguous && p.enhance.bonus.cells.some(v => v > 0)) || (p.enhance.chouai && !p.enhance.chouai.ambiguous && p.enhance.chouai.cells.some(v => v > 0)))
  };
}

// 解析結果をキャラシに反映し、読み込み結果（件数・注意点）を返す
function applyHokanshoParsed(p) {
  const rep = {
    skills: 0, partsExtra: 0, partsBase: 0, memories: 0, list: 0, blankMirenRows: p.blankMirenRows, blankManeuverRows: p.blankManeuverRows, history: 0, appearance: 0, historyKept: false, blankHistoryRows: p.blankHistoryRows,
    growth: p.growth, unmatchedParts: [], customSkills: [], notes: [], mismatches: [],
    unrecognized: p.unrecognized.slice(), memoAdded: 0, memoSkipped: 0, madnessNotes: p.madnessNotes.slice(), enhanceApplied: []
  };

  const plan = hkReplacePlan(p);
  rep.keep = { skills: !plan.skills, parts: !plan.parts, memories: !plan.memories, list: !plan.list };
  const data = getFullData(); // 保管所テキストに無い項目（PL名・寵愛・たからもの等）は今の内容を引き継ぐ

  // メモ欄への追記：今のメモは消さない。すでにメモにある行は重ねて入れない。追加した行数を返す
  const appendToMemo = (heading, lines) => {
    const current = data.freeMemo || '';
    const existing = new Set(current.split('\n').map(l => l.trim()));
    const fresh = lines.filter(l => !existing.has(l.trim()));
    if (fresh.length) {
      data.freeMemo = (current.trim() ? current.replace(/\s+$/, '') + '\n\n' : '') + heading + '\n' + fresh.join('\n');
    }
    return { added: fresh.length, skipped: lines.length - fresh.length };
  };

  // 読み込めなかった行は、メモ欄に追記する
  if (p.unrecognized.length) {
    const res = appendToMemo('■ 保管所テキストで読み込めなかった行', p.unrecognized);
    rep.memoAdded = res.added; rep.memoSkipped = res.skipped;
  }

  // このシートに欄が無い「成長履歴」の文章も、結果画面を閉じると消えてしまうので、メモ欄に追記する
  // （発狂時の名前・効果は、未練の表の「発狂」欄に入る）
  const extraLines = [];
  if (p.growth) extraLines.push('【成長履歴】' + p.growth);
  if (extraLines.length) {
    const res = appendToMemo('■ 保管所テキストの成長履歴', extraLines);
    rep.extraMemoAdded = res.added;
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
        const none = v => /^\s*(なし|無し|無|-|ー|－|—)?\s*$/.test(v || '');
        // 「狂気点を回復」とある、または タイミングがオート・コストなし・射程なしの思い出の品のようなパーツは、たからものとみなす
        if (/狂気点.{0,6}回復/.test(pt.memo) || (/^\s*オート\s*$/.test(pt.timing || '') && none(pt.cost) && none(pt.range))) { type = 'たからもの'; level = ''; }
        else { type = '武装'; level = ''; }
        rep.unmatchedParts.push({
          loc: HK_SEC_TO_LOC[pt.sec], name: pt.name,
          assumed: type === 'たからもの' ? '種別を「たからもの」として配置（オート・コストなし・射程なし、または狂気点の回復効果のため。違う場合は分類を直してください）' : '種別を仮に「武装」・Lvを空欄で配置（種別とLvを確認してください）'
        });
      }
      // 効果メモや名前に「たからもの」と書かれているマニューバは、分類を「たからもの」にする
      if (type !== 'たからもの' && /たからもの/.test((pt.memo || '') + (pt.name || ''))) { type = 'たからもの'; level = ''; }
      // data.jsに無いパーツでも、シートの「たからもの」欄に同じ名前がある／以前「たからもの」に設定した名前なら、分類を「たからもの」にする
      const treasureNames = new Set([...(data.treasures || []).map(x => (x.name || '').trim()), ...getKnownTreasureNames()].filter(Boolean));
      if (type !== 'たからもの' && treasureNames.has((pt.name || '').trim())) { type = 'たからもの'; level = ''; }
      data.parts.push({
        isBroken: false, isUsed: false, location: HK_SEC_TO_LOC[pt.sec], name: pt.name, type: type, level: String(level),
        timing: pt.timing, cost: pt.cost, range: pt.range, memo: pt.memo, isEditable: editable, tag: detectCategoryFromMemo(pt.memo)
      });
      rep.partsExtra++;
    });
  }

  if (plan.memories) { data.memories = p.memories.slice(); rep.memories = p.memories.length; }
  if (plan.list) { data.list = p.list.map(x => ({ target: x.target, emotion: x.emotion, madness: String(x.madness), madName: x.madName || '', madEffect: x.madEffect || '' })); rep.list = p.list.length; }

  // 強化値の数字が1つだけで列が決められないとき、合計−メイン−サブの差から決められるなら決める
  (function () {
    const e = p.enhance || {};
    if (!e.total || !e.main || !e.sub || e.total.ambiguous || e.main.ambiguous || e.sub.ambiguous) return;
    const resid = [0, 1, 2].map(i => (e.total.cells[i] === null ? null : e.total.cells[i] - (e.main.cells[i] || 0) - (e.sub.cells[i] || 0)));
    if (resid.some(v => v === null)) return;
    const used = [0, 0, 0];
    if (e.chouai && e.chouai.ambiguous && e.chouai.hasNumbers) {
      const val = e.chouai.cells.find(v => v !== null && v > 0);
      const hit = resid.map((v, i) => (v === val ? i : -1)).filter(i => i >= 0);
      if (val && hit.length === 1) {
        e.chouai = { key: 'chouai', cells: [0, 1, 2].map(i => (i === hit[0] ? val : null)), hasNumbers: true, ambiguous: false, inferred: true };
        used[hit[0]] = val;
        rep.notes.push('強化値の寵愛：数字の位置が分からなかったため、合計との差から ' + ['武装', '変異', '改造'][hit[0]] + ' と判断しました。');
      }
    } else if (e.chouai && e.chouai.cells) {
      e.chouai.cells.forEach((v, i) => { used[i] = v || 0; });
    }
    if (e.bonus && !e.bonus.hasNumbers) {
      const left = resid.map((v, i) => v - used[i]);
      const pos = left.map((v, i) => (v > 0 ? i : -1)).filter(i => i >= 0);
      if (pos.length === 1 && left[pos[0]] === 1 && !e.chouai.ambiguous) {
        e.bonus = { key: 'bonus', cells: [0, 1, 2].map(i => (i === pos[0] ? 1 : null)), hasNumbers: true, ambiguous: false, inferred: true };
        rep.notes.push('強化値のボーナス：テキストの欄は空でしたが、合計との差から ' + ['武装', '変異', '改造'][pos[0]] + ' +1 と判断しました。');
      }
    }
  })();

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

  // 寵愛点の使い道：マイナスの行があるときだけ置き換える
  if (p.uses.length) {
    data.chouaiUses = p.uses.map(u => ({ used: String(u.used), memo: u.memo }));
    rep.uses = p.uses.length;
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
    ...(rep.blankManeuverRows ? [`マニューバの空き枠：${rep.blankManeuverRows}行は読み込んでいません`] : []),
    rep.keep.list ? '未練：変更なし（テキストに無かったため）' : `未練：${rep.list}件` + (rep.blankMirenRows ? `（空の行 ${rep.blankMirenRows}行は読み込んでいません）` : ''),
    ...(rep.appearance ? [`外見（身長・体重・髪/瞳/肌の色）：${rep.appearance}項目`] : []),
    ...(rep.enhanceApplied.length ? [`強化値：${rep.enhanceApplied.join('、')}`] : []),
    `寵愛点の使い道：${rep.uses || 0}件`,
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
    html += h('■ 成長履歴の文章（メモ欄に追記しました）');
    html += li([e(rep.growth)]);
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

// チャパレ：ココフォリアのチャットパレットに貼り付ける文章だけをコピーする
function exportChatPalette() {
  const text = buildCcfoliaCommandLines(getFullData()).join('\n');
  const done = () => alert('チャットパレット用の文章をコピーしました。\nココフォリアのキャラクター編集画面の「チャットパレット」欄に貼り付けてください。');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => prompt('自動コピーに失敗しました。以下の文章を手動でコピーしてください：', text));
  } else {
    prompt('以下の文章をコピーして、ココフォリアのチャットパレット欄に貼り付けてください：', text);
  }
}


// ==========================================================
// 発行した共有URLの控え（この端末の中だけの一覧）
//  ・発行したURL（#tok=…）を控えておき、あとから「コピー」で取り出せる
//  ・サーバーのデータを消す仕組みは無いので、一覧から消しても、URL自体は開けるまま
// ==========================================================
const SHARES_KEY = 'necro_shares';
function getShares() { try { const a = JSON.parse(localStorage.getItem(SHARES_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function setShares(a) { try { localStorage.setItem(SHARES_KEY, JSON.stringify(a)); } catch (e) {} }
function recordShare(token, name, viewOnly) {
  try {
    const a = getShares().filter(x => x.token !== token);
    a.unshift({ token, name: name || '(無名)', viewOnly: !!viewOnly, createdAt: new Date().toISOString() });
    setShares(a.slice(0, 100));
    renderShareList();
  } catch (e) {}
}
function shareUrlOf(token) { return location.origin + location.pathname + '#tok=' + token; }

// URLを作る前の確認（作ったURLは取り消せないため）
function confirmIssueShare(isView) {
  return confirm(`${isView ? '閲覧用' : '共有'}URLを作ります。\n\n・このURLを知っている人は、誰でもキャラクターを読み込めます。\n・作ったURLは、あとから取り消せません。\n\n作りますか？`);
}

function renderShareList() {
  const box = document.getElementById('share-list');
  if (!box) return;
  const a = getShares();
  if (!a.length) { box.innerHTML = '<div style="font-size:.78rem;color:#888;">まだ控えがありません。共有URL・閲覧用URLを作ると、ここに並びます。</div>'; return; }
  box.innerHTML = a.map(x => {
    const d = new Date(x.createdAt); const ds = isNaN(d) ? '' : `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    return `<div class="share-row">
      <div class="share-info"><b>${escapeHtml(x.name)}</b><span>${x.viewOnly ? '閲覧用' : '編集可'} ・ ${ds}</span></div>
      <div class="share-btns">
        <button type="button" class="sec" onclick="copyShareURL('${x.token}')">コピー</button>
        <button type="button" class="sec" onclick="removeShareRecord('${x.token}')">控えを消す</button>
      </div></div>`;
  }).join('');
}

function copyShareURL(token) {
  const url = shareUrlOf(token);
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(() => alert('URLをコピーしました')).catch(() => prompt('URLをコピーしてください：', url));
  else prompt('URLをコピーしてください：', url);
}

function removeShareRecord(token) {
  if (!confirm('この控えを一覧から消します。\n\n※URL自体は取り消されず、知っている人は開けるままです。')) return;
  setShares(getShares().filter(x => x.token !== token));
  renderShareList();
}

// 以前に作ったURLを、貼り付けて控えに加える
async function addShareByURL() {
  const t = prompt('控えに加えるURLを貼り付けてください（…#tok=… の形のURL）');
  if (!t) return;
  const m = t.match(/#tok=([A-Za-z0-9]+)/);
  if (!m) return alert('このURLは、控えに加えられません（短い共有URL「#tok=…」のみ対応です）');
  try {
    const row = await loadCharacterFromSupabase(m[1]);
    let name = '(無名)';
    try { name = JSON.parse(await decodeShareString(row.payload)).name || name; } catch (e) {}
    recordShare(m[1], name, !!row.view_only);
  } catch (err) { alert('読み込めませんでした。\n' + err.message); }
}
window.addEventListener('load', () => setTimeout(renderShareList, 0));
