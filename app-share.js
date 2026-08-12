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

// キャラクターデータをURLに埋め込んだ「共有URL」を作成する（対応端末ならOSの共有シートも使う）
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

  const url = location.origin + location.pathname + '#share=' + encoded;
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
  const json = JSON.stringify(data);
  let encoded;
  try {
    encoded = await encodeShareString(json);
  } catch (err) {
    alert('閲覧用URLの作成に失敗しました: ' + err.message);
    return;
  }

  const url = location.origin + location.pathname + '#view=' + encoded;
  const shareTitle = (data.name || 'ネクロニカ') + ' のキャラクターシート（閲覧用）';

  const copyFallback = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        alert(`閲覧用URLをクリップボードにコピーしました。（${url.length}文字）\n\nこのURLを開くと、相手の画面には自動的に表示モード（編集不可）でこのキャラクターが表示されます。相手のブラウザには保存されません。`);
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

// ページを開いた時にURLに共有データ（#share=... または #view=...）が含まれていれば自動で読み込む
async function checkForSharedURLOnLoad() {
  const hash = location.hash || '';
  const match = hash.match(/^#(share|view)=(.+)$/);
  if (!match) return;

  const isViewOnly = match[1] === 'view';

  // 再読み込み時に誤ってもう一度取り込まれないよう、先にURLから消しておく
  history.replaceState(null, '', location.pathname + location.search);

  try {
    const encoded = decodeURIComponent(match[2]);
    const json = await decodeShareString(encoded);
    const data = JSON.parse(json);
    pushUndoSnapshot();
    applyData(data);

    if (isViewOnly) {
      // 閲覧専用URL：保存確認は出さず、自動的に表示モードにする
      applyViewModeUI(true);
      try { localStorage.setItem('necro_view_mode', '1'); } catch (e) {}
      isDirty = false;
      alert(`「${data.name || '(無名)'}」を閲覧モードで表示しています。\n編集したい場合は左下の「✏️ 編集」から切り替えられます。`);
    } else {
      afterExternalLoad(data);
    }
  } catch (err) {
    alert('共有URLの読み込みに失敗しました。URLが正しいか確認してください。\n' + err.message);
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

