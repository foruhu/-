// --- DB類 (memo未定義部分は自動で空文字扱い) ---
const SKILL_DATABASE = {
  'アリス': [
    { name: '少女', memo: '【少女】 ラピッド/0/0\n対象の姉妹1人と対話判定を行う' },
    { name: 'お嬢様' }, { name: '癒し' }, { name: '楽園の天使' }, { name: '負けない心' }, { name: '祈り' }, { name: '輝く表情' }
  ],
  'ホリック': [
    { name: '加速する狂気' }, { name: '業怒' }, { name: '衝動' }, { name: '奈落の引力' },
    { name: '修羅', memo: '【修羅】 ジャッジ/参照/自身\nコストとして、あなたは任意の未練に狂気点+1\n支援3' },
    { name: '堕地獄' }, { name: '狂気の果て' }
  ],
  'オートマトン': [
    { name: '援護' }, { name: '私は人形' },
    { name: '無茶', memo: '【無茶】 オート/参照/自\nコストとして、あなたは任意の基本パーツ1つ損傷する\n行動・攻撃・切断判定において、振り直しできる' },
    { name: '煉獄の檻' }, { name: '氷の心' }, { name: '血の涙' }, { name: '敵は敵' }
  ],
  'ジャンク': [
    { name: '随行' }, { name: '足掻く' },
    { name: '半壊', memo: '【半壊】 オート/無し/自身\nターン終了までにたからものを損傷していた場合、ターン経過での狂気点は追加させない' },
    { name: '奈落への抗い' }, { name: '地獄の住人' }, { name: '楽園の守護者' }, { name: '手負いの獣' }
  ],
  'コート': [
    { name: '助言' }, { name: '作戦' },
    { name: '冷静', memo: '【冷静】 オート/無し/自身\n行動判定の出目+1' },
    { name: '先読み' }, { name: '看破' }, { name: '抑制' }, { name: '憎まれ役' }
  ],
  'ソロリティ': [
    { name: '号令', memo: '【号令】 ラピッド/2/参照\nあなたを含む舞台上にいる姉妹全員、攻撃マニューバ1つをラピッドとして使用してよい' },
    { name: '内緒話' }, { name: '克己心' }, { name: '優雅' }, { name: '花園の集い' }, { name: '姉妹のくちづけ' }, { name: '心を鬼にして' }
  ],
  'ステーシー': [
    { name: '蠢く肉片' },
    { name: '平気', memo: '【平気】 オート/無し/自身\n損傷しても、ターン終了まではそのパーツは使える' },
    { name: '死に続け', memo: '【死に続け】 ラピッド/0/自身\n損傷している基本パーツを1つ修復' },
    { name: '庇う', memo: '【庇う】 ダメージ/0/0〜1\n対象のダメージを自身が肩代わりできる\n1ターンに何度でも使用可' },
    { name: '肉の盾' },
    { name: '失敗作', memo: '【失敗作】 O/無し/自身\n攻撃・切断判定の出目+1\n毎ターン終了時および戦闘終了時に任意のパーツ1つ損傷させる' }
  ],
  'タナトス': [
    { name: '無限解体' },
    { name: '死神', memo: '【死神】 オート/無し/自\n白兵の出目+1' },
    { name: '災禍', memo: '【災禍】 ダメージ/2/自\n白兵のみ使用可\n全体攻撃の効果を得る。これによる自身へのダメージはない。' },
    { name: '殺劇', memo: '【殺劇】 オート/無し/自\n同カウント内に他の姉妹が攻撃対象とした敵に攻撃判定する際、自身の攻撃判定の出目+1、ダメージ+1してよい' },
    { name: '刹那' }, { name: '必中' }
  ],
  'ゴシック': [
    { name: '暴食' }, { name: '肉の宴' },
    { name: '捕食者', memo: '【捕食者】 ダメージ/2/0\n自身のいるエリア内の敵全てに転倒' },
    { name: '舌なめずり', memo: '【舌なめずり】 ラピッド/0/0〜1\n移動妨害1' },
    { name: '悪食' }, { name: '背徳の悦び' }
  ],
  'レクイエム': [
    { name: '魔弾', memo: '【魔弾】 オート/無し/自身\n射撃の最大射程+1' },
    { name: '銃神', memo: '【銃神】 オート/無し/自身\n射撃の攻撃判定の出目+1' },
    { name: '死の手' }, { name: '子守唄' }, { name: '銃型' },
    { name: '集中', memo: '【集中】 ラピッド/2/自\nターン終了まで攻撃判定の出目+1' }
  ],
  'バロック': [
    { name: '異形存在' },
    { name: '狂鬼', memo: '【狂鬼】 オート/無し/自身\n肉弾の攻撃判定の出目+1' },
    { name: '怪力', memo: '【怪力】 オート/無し/自身\n肉弾・白兵攻撃のダメージ+1' },
    { name: '歪極', memo: '【歪極】 参照/無し/自身\nレベル3変異パーツを得る' },
    { name: '業躯' }, { name: '再生' }
  ],
  'ロマネスク': [
    { name: '戦乙女' },
    { name: '円舞曲', memo: '【円舞曲】 ラピッド/1/自身\nターン終了まで、あなたを対象とするすべての攻撃判定の出目-1\n同ターン中の重複は不可' },
    { name: '死の舞踏', memo: '【死の舞踏】 ジャッジ/0/自身\n攻撃判定の振り直し' },
    { name: '調律' },
    { name: '愛撫', memo: '【愛撫】 ラピッド/0/0\n転倒' },
    { name: '時計仕掛け', memo: '【時計仕掛け】 レベル3の改造パーツを追加で1つ獲得する' }
  ]
};

const CLASS_PARTS = {
  'ステーシー': [1,1,0], 'タナトス': [1,0,1], 'ゴシック': [0,1,1],
  'レクイエム': [2,0,0], 'バロック': [0,2,0],  'ロマネスク': [0,0,2]
};

const DEFAULT_PARTS = {
  head: [
    { name: 'あたま', type: '基本', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+2' },
    { name: 'めだま', type: '基本', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+2' },
    { name: 'あご', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾1' }
  ],
  arm: [
    { name: 'こぶし', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾1' },
    { name: 'うで', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '支援1' },
    { name: 'かた', type: '基本', level: 1, timing: 'アクション', cost: '4', range: '自身', memo: '移動1' }
  ],
  body: [
    { name: 'せぼね', type: '基本', level: 1, timing: 'アクション', cost: '1', range: '自身', memo: '同ターン内の次カウントで使う。マニューバ1つのカウント-1(最低0)' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無し', range: '無し', memo: 'なし' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無し', range: '無し', memo: 'なし' }
  ],
  leg: [
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '移動1' },
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '移動1' },
    { name: 'あし', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '妨害1' }
  ]
};

const EXTRA_PARTS_DB = {
  head: [
    { name: 'カンフー', type: '武装', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+1' },
    { name: '発勁', type: '武装', level: 2, timing: '', cost: '', range: '' },
    { name: 'けもみみ', type: '変異', level: 2, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+1。行動判定で使用した際、大失敗してもこのパーツは損傷しない。' },
    { name: 'よだれじた', type: '変異', level: 2, timing: '', cost: '', range: '' },
    { name: 'よぶんなあたま', type: '変異', level: 3, timing: '', cost: '', range: '' },
    { name: 'きもちいいくすり', type: '変異', level: 3, timing: 'ダメージ', cost: '1', range: '自身', memo: '自身がダメージを受けた際のみ使用可。任意の未練から、狂気点を1減少させてよい。' },
    { name: 'アドレナリン', type: '改造', level: 1, timing: 'ラピッド', cost: '無し', range: '自身', memo: '最大行動値+1' },
    { name: 'セイバートゥース', type: '改造', level: 1, timing: '', cost: '', range: '' },
    { name: 'ボルトヘッド', type: '改造', level: 1, timing: 'ジャッジ', cost: '1', range: '自身', memo: '支援2' },
    { name: 'ボイスエフェクト', type: '改造', level: 1, timing: 'ラピッド', cost: '0〜2', range: '自身', memo: '最大行動値+1' },
    { name: 'スコープ', type: '改造', level: 2, timing: '', cost: '', range: '' },
    { name: 'エンバーミング', type: '改造', level: 3, timing: 'ジャッジ', cost: '2', range: '0', memo: '妨害2。1ターンに何度も使用可。1回の判定は重複不可。' }
  ],
  arm: [
    { name: '釘バット', type: '武装', level: 1, timing: '', cost: '', range: '' },
    { name: 'バール', type: '武装', level: 1, timing: '', cost: '', range: '' },
    { name: '斧', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0' },
    { name: '肉切り包丁', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '白兵2' },
    { name: '日本刀', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '白兵1＋切断' },
    { name: 'チェーンソー', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '白兵2+切断' },
    { name: '大型拳銃', type: '武装', level: 1, timing: '', cost: '', range: '' },
    { name: '狙撃ライフル', type: '武装', level: 1, timing: '', cost: '', range: '' },
    { name: '合金トランク', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '防御1+爆発無効' },
    { name: '鉄球鎖', type: '武装', level: 2, timing: 'アクション', cost: '2', range: '0〜1', memo: '白兵1+転倒' },
    { name: 'ショットガン', type: '武装', level: 2, timing: '', cost: '', range: '' },
    { name: 'マシンガン', type: '武装', level: 2, timing: '', cost: '', range: '' },
    { name: '熊撃ち銃', type: '武装', level: 2, timing: '', cost: '', range: '' },
    { name: '二丁拳銃', type: '武装', level: 2, timing: '', cost: '', range: '' },
    { name: 'ジョギリ', type: '武装', level: 3, timing: 'アクション', cost: '3', range: '0', memo: '白兵4、+攻撃判定+1' },
    { name: '芝刈り機', type: '武装', level: 3, timing: 'アクション', cost: '3', range: '0', memo: '白兵3+連撃2' },
    { name: '名刀', type: '武装', level: 3, timing: '', cost: '', range: '' },
    { name: '空飛ぶギロチン', type: '武装', level: 3, timing: '', cost: '', range: '' },
    { name: '対戦車ライフル', type: '武装', level: 3, timing: '', cost: '', range: '' },
    { name: 'アンデッドガン', type: '武装', level: 3, timing: '', cost: '', range: '' },
    { name: '火炎放射器', type: '武装', level: 3, timing: '', cost: '', range: '' },
    { name: 'ランチャー', type: '武装', level: 3, timing: 'アクション', cost: '4', range: '' },
    { name: 'かぎづめ', type: '変異', level: 1, timing: '', cost: '', range: '' },
    { name: 'よぶんなうで', type: '変異', level: 2, timing: 'ラピッド', cost: '0', range: '自身', memo: '望む「アクション」マニューバ1つを「ラピッド」として使用する。' },
    { name: 'よだれじた', type: '変異', level: 2, timing: '', cost: '', range: '' },
    { name: 'シザーハンズ', type: '改造', level: 1, timing: '', cost: '', range: '' },
    { name: 'ガントレット', type: '改造', level: 3, timing: '', cost: '', range: '' },
    { name: 'アームバイス', type: '改造', level: 3, timing: '', cost: '', range: '' }
  ],
  body: [
    { name: 'つぎはぎ', type: '変異', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: 'バトルパート終了時、このパーツと損傷した基本パーツ1つを修復してよい。' },
    { name: 'しんぞう', type: '変異', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+1' },
    { name: 'どろどろ', type: '変異', level: 1, timing: '', cost: '', range: '' },
    { name: 'あるびの', type: '変異', level: 1, timing: '', cost: '', range: '' },
    { name: 'ちみどろ', type: '変異', level: 1, timing: '', cost: '', range: '' },
    { name: 'うろこ', type: '変異', level: 2, timing: '', cost: '', range: '' },
    { name: 'やせきず', type: '変異', level: 3, timing: '', cost: '', range: '' },
    { name: 'だるま', type: '変異', level: 3, timing: '', cost: '', range: '' },
    { name: 'アーマースキン', type: '改造', level: 1, timing: '', cost: '0', range: '' },
    { name: 'スチールボーン', type: '改造', level: 1, timing: '', cost: '1', range: '' },
    { name: 'サイボーグ', type: '改造', level: 3, timing: '', cost: '', range: '' },
    { name: 'オートセパレート', type: '改造', level: 3, timing: '', cost: '', range: '' }
  ],
  leg: [
    { name: '仕込みブーツ', type: '武装', level: 2, timing: 'アクション', cost: '2', range: '0', memo: '白兵攻撃2、攻撃判定の出目+1' },
    { name: 'しっぽ', type: '変異', level: 1, timing: 'オート', cost: '無し', range: '自身', memo: '最大行動値+1。' },
    { name: 'はりつき', type: '変異', level: 1, timing: '', cost: '', range: '' },
    { name: 'よぶんなあし', type: '変異', level: 3, timing: '', cost: '', range: '' },
    { name: 'けもあし', type: '変異', level: 3, timing: 'アクション', cost: '2', range: '自身', memo: '移動1〜2。' },
    { name: 'キャンサー', type: '改造', level: 3, timing: '', cost: '', range: '' },
    { name: 'ホッパー', type: '改造', level: 3, timing: '', cost: '', range: '' }
  ]
};

const COMMON_EXTRA_PARTS = [
  { name: '火炎ビン', type: '武装', level: 1, timing: '', cost: '', range: '' },
  { name: '有刺鉄線', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '自身がダメージを与えた際のみ使用可。白兵・肉弾ダメージ+1' },
  { name: '手榴弾', type: '武装', level: 2, timing: '', cost: '', range: '' },
  { name: '単分子繊維', type: '武装', level: 3, timing: '', cost: '', range: '' },
  { name: 'ダイナマイト', type: '武装', level: 3, timing: '', cost: '', range: '' },
  { name: 'うじむし', type: '変異', level: 1, timing: '', cost: '', range: '' },
  { name: 'おおあな', type: '変異', level: 1, timing: 'ジャッジ', cost: '0', range: '0〜3', memo: 'あなたに対する攻撃判定にのみ使用可。妨害1' },
  { name: 'おとこのこ', type: '変異', level: 2, timing: 'オート', cost: '無し', range: '' },
  { name: 'ほねやり', type: '変異', level: 2, timing: 'アクション', cost: '2', range: '' },
  { name: 'どくばり', type: '変異', level: 2, timing: '', cost: '', range: '' },
  { name: 'よぶんなめ', type: '変異', level: 2, timing: '', cost: '', range: '' },
  { name: 'しょくしゅ', type: '変異', level: 2, timing: '', cost: '', range: '' },
  { name: 'ほとけかずら', type: '変異', level: 2, timing: 'ジャッジ', cost: '0', range: '0', memo: '支援1か妨害1' },
  { name: 'くされじる', type: '変異', level: 3, timing: '', cost: '', range: '' },
  { name: 'にくむち', type: '変異', level: 3, timing: '', cost: '', range: '' },
  { name: 'やぶれひまく', type: '変異', level: 3, timing: '', cost: '', range: '' },
  { name: 'しびとだけ', type: '変異', level: 3, timing: 'ジャッジ', cost: '0', range: '0', memo: '妨害2。' },
  { name: 'リミッター', type: '改造', level: 1, timing: '', cost: '', range: '' },
  { name: 'ジェットノズル', type: '改造', level: 1, timing: '', cost: '', range: '' },
  { name: 'リモートアタック', type: '改造', level: 1, timing: 'アクション', cost: '3', range: '0〜1', memo: '肉弾攻撃1＋転倒' },
  { name: 'ゾンビボム', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'エレクトリガー', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'ドリル', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'アサシンブレード', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'レーザービーム', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'スパイク', type: '改造', level: 2, timing: 'ダメージ', cost: '1', range: '自身', memo: '自身がダメージを与えた際のみ使用可。白兵・肉弾ダメージ+2' },
  { name: 'テンタクル', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'ワイヤーリール', type: '改造', level: 2, timing: '', cost: '', range: '' },
  { name: 'マニピュレーター', type: '改造', level: 3, timing: '', cost: '', range: '' },
  { name: 'パイルバンカー', type: '改造', level: 3, timing: '', cost: '', range: '' },
  { name: 'ライトセイバー', type: '改造', level: 3, timing: '', cost: '', range: '' }
];

const LIMIT_TABLE_DATA = [
  { lv1: 1, lv2: 0, lv3: 0 }, { lv1: 1, lv2: 1, lv3: 0 }, { lv1: 1, lv2: 1, lv3: 1 },
  { lv1: 2, lv2: 1, lv3: 1 }, { lv1: 2, lv2: 2, lv3: 1 }, { lv1: 2, lv2: 2, lv3: 2 },
  { lv1: 3, lv2: 2, lv3: 2 }, { lv1: 3, lv2: 3, lv3: 2 }, { lv1: 3, lv2: 3, lv3: 3 }
];

function getLimitByVal(val) {
  if (val < 1) return { lv1: 0, lv2: 0, lv3: 0 };
  return LIMIT_TABLE_DATA[Math.min(val, 9) - 1];
}

// オプションのHTML生成用ヘルパー関数（重複防止・共通化）
function generateOptionGroup(list, maxAllowedMap, prefix, label) {
  let groupHtml = '';
  list.forEach((p, idx) => {
    const allowed = maxAllowedMap[p.type]?.[p.level] || 0;
    if (allowed > 0) {
      const isExists = isPartAlreadyExists(p.name);
      const disabledAttr = isExists ? 'disabled' : '';
      const nameText = isExists ? `${p.name} (選択済み)` : p.name;
      groupHtml += `<option value="${prefix}_${idx}" ${disabledAttr}>[${p.type} Lv${p.level}] ${nameText}</option>`;
    }
  });
  return groupHtml ? `<optgroup label="${label}">${groupHtml}</optgroup>` : '';
}

function updateExtraPartOptions() {
  const totalWep = parseInt(document.getElementById('total-wep').textContent, 10) || 0;
  const totalMut = parseInt(document.getElementById('total-mut').textContent, 10) || 0;
  const totalCyb = parseInt(document.getElementById('total-cyb').textContent, 10) || 0;

  let hasClockwork = Array.from(document.querySelectorAll('#skill-tbody select')).some(s => s.value === '時計仕掛け');

  const limitWep = getLimitByVal(totalWep);
  const limitMut = getLimitByVal(totalMut);
  const limitCyb = getLimitByVal(totalCyb);

  const maxAllowedMap = {
    '武装': { 1: limitWep.lv1, 2: limitWep.lv2, 3: limitWep.lv3 },
    '変異': { 1: limitMut.lv1, 2: limitMut.lv2, 3: limitMut.lv3 },
    '改造': { 1: limitCyb.lv1, 2: limitCyb.lv2, 3: limitCyb.lv3 }
  };

  if (hasClockwork) maxAllowedMap['改造'][3] += 1;

  const sections = [
    { id: 'head', title: '頭部' }, { id: 'arm', title: '腕部' },
    { id: 'body', title: '胴部' }, { id: 'leg', title: '脚部' }
  ];

  sections.forEach(sec => {
    const secDiv = document.getElementById(`parts-tbody-${sec.id}`)?.closest('div.table-scroll')?.nextElementSibling;
    const selectElem = secDiv ? secDiv.querySelector('.add-part-select') : null;
    if (!selectElem) return;

    let optionsHtml = `<option value="">+ 【${sec.title}】にパーツを選択して追加...</option>`;

    if (EXTRA_PARTS_DB[sec.id]) {
      optionsHtml += generateOptionGroup(EXTRA_PARTS_DB[sec.id], maxAllowedMap, sec.id, `【${sec.title}専用パーツ】`);
    }
    if (COMMON_EXTRA_PARTS.length > 0) {
      optionsHtml += generateOptionGroup(COMMON_EXTRA_PARTS, maxAllowedMap, 'common', '【共通・汎用パーツ】');
    }

    optionsHtml += `<option value="custom">-- 自由入力枠を追加 --</option>`;
    selectElem.innerHTML = optionsHtml;
  });
}

// --- パーツエリアの動的生成 ---
function renderPartsContainer() {
  const container = document.getElementById('parts-container');
  if (!container) return;
  container.innerHTML = '';

  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
  const sections = [
    { id: 'head', title: '頭部' }, { id: 'arm', title: '腕部' },
    { id: 'body', title: '胴部' }, { id: 'leg', title: '脚部' }
  ];

  sections.forEach(sec => {
    const secDiv = document.createElement('div');
    secDiv.innerHTML = `
      <div class="part-header">
        <span>【${sec.title}】</span>
        <span class="val">基本パーツ / 追加パーツ</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th style="width:5%;">損</th><th style="width:12%;">配置部位</th>
              <th style="width:18%;">パーツ名</th><th style="width:10%;">分類</th>
              <th style="width:8%;">Lv</th><th style="width:10%;">タイミング</th>
              <th style="width:8%;">コスト</th><th style="width:8%;">射程</th>
              <th>効果メモ</th><th style="width:6%;">操作</th>
            </tr>
          </thead>
          <tbody id="parts-tbody-${sec.id}"></tbody>
        </table>
      </div>
      <div style="margin-top:6px;">
        <select class="add-part-select" onchange="onExtraPartSelect('${sec.id}', this)">
          <option value="">+ 【${sec.title}】にパーツを選択して追加...</option>
        </select>
      </div>
    `;
    container.appendChild(secDiv);

    const tbody = secDiv.querySelector(`#parts-tbody-${sec.id}`);
    const currentLocName = locMap[sec.id] || '頭部';

    if (typeof DEFAULT_PARTS !== 'undefined' && DEFAULT_PARTS[sec.id]) {
      DEFAULT_PARTS[sec.id].forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo || '', false, currentLocName);
      });
    }
  });

  updateExtraPartOptions();
}

function isPartAlreadyExists(partName) {
  if (!partName || partName === '新規パーツ') return false;
  return Array.from(document.querySelectorAll('#parts-container .p-name')).some(input => input.value.trim() === partName.trim());
}

function onExtraPartSelect(secId, selectElem) {
  const val = selectElem.value;
  if (!val) return;

  const tbody = document.getElementById(`parts-tbody-${secId}`);
  const locMap = { head: '頭部', arm: '腕部', body: '胴部', leg: '脚部' };
  const currentLocName = locMap[secId] || '頭部';

  let partData = null;

  if (val === 'custom') {
    partData = { name: '新規パーツ', type: '武装', level: 1, timing: 'アクション', cost: '1', range: '0', memo: '', isEditable: true };
  } else if (val.startsWith('common_')) {
    const p = COMMON_EXTRA_PARTS[parseInt(val.split('_')[1], 10)];
    if (p) partData = { ...p, memo: p.memo || '', isEditable: false };
  } else if (val.startsWith(secId + '_')) {
    const p = EXTRA_PARTS_DB[secId][parseInt(val.split('_')[1], 10)];
    if (p) partData = { ...p, memo: p.memo || '', isEditable: false };
  }

  if (partData) {
    if (partData.name !== '新規パーツ' && isPartAlreadyExists(partData.name)) {
      alert(`「${partData.name}」はすでに配置されています。重複して取得することはできません。`);
      selectElem.value = '';
      return;
    }
    addPartRow(tbody, partData.name, partData.type, partData.level, partData.timing, partData.cost, partData.range, partData.memo, partData.isEditable, currentLocName);
  }
  selectElem.value = '';
}

function addPartRow(tbody, name, type, level, timing, cost, range, memo, isEditable, defaultLoc = '頭部') {
  const tr = document.createElement('tr');
  const readOnlyAttr = isEditable ? '' : 'readonly';
  const disabledAttr = isEditable ? '' : 'disabled';

  const locations = ['頭部', '腕部', '胴部', '脚部', '任意・その他'];
  const locOptions = locations.map(loc => `<option value="${loc}" ${loc === defaultLoc ? 'selected' : ''}>${loc}</option>`).join('');

  tr.innerHTML = `
    <td><input type="checkbox" onchange="togglePartBreak(this)"></td>
    <td><select class="p-location" style="padding:2px;font-size:0.75rem;">${locOptions}</select></td>
    <td><input type="text" value="${name}" class="p-name" ${readOnlyAttr}></td>
    <td>
      <select class="p-type" ${disabledAttr} onchange="calcTotals()">
        ${['基本','武装','変異','改造'].map(t => `<option ${type===t?'selected':''}>${t}</option>`).join('')}
      </select>
    </td>
    <td><input type="number" value="${level}" min="1" max="3" class="p-level" ${disabledAttr} onchange="calcTotals()"></td>
    <td><input type="text" value="${timing}" class="p-timing" ${readOnlyAttr}></td>
    <td><input type="text" value="${cost}" class="p-cost" ${readOnlyAttr}></td>
    <td><input type="text" value="${range}" class="p-range" ${readOnlyAttr}></td>
    <td><textarea class="p-memo" ${readOnlyAttr}>${memo}</textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove(); calcTotals();">X</button></td>
  `;
  tbody.appendChild(tr);
  calcTotals();
}

function togglePartBreak(checkbox) {
  checkbox.closest('tr').classList.toggle('broken', checkbox.checked);
}

function resetUsed() {
  document.querySelectorAll('#parts-container tr input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('tr').classList.remove('broken');
  });
}

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

function calcTotals() {
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

  document.querySelectorAll('#parts-container tr').forEach(tr => {
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

      let statusHtml = `<span style="color:#aaa;">${current}/${maxAllowed}</span>`;
      if (current > maxAllowed) {
        statusHtml = `<span class="limit-ng" style="color:#ff6666; font-weight:bold;">超過 (${current}/${maxAllowed})</span>`;
      } else if (current > 0) {
        statusHtml = `<span class="limit-selected" style="color:#88ff88;">OK (${current}/${maxAllowed})</span>`;
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
}

function addRow(target = '', emotion = '', madness = 0) {
  const tbody = document.getElementById('list');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}"></td>
    <td><input type="text" value="${emotion}"></td>
    <td><input type="number" value="${madness}" min="0"></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">X</button></td>
  `;
  tbody.appendChild(tr);
}

function updateSkillOptions() {
  const selectedSkills = new Set(Array.from(document.querySelectorAll('#skill-tbody select')).map(s => s.value).filter(Boolean));

  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    const select = tr.querySelector('select');
    if (!select) return;
    const category = tr.querySelector('input')?.value || '';
    const currentValue = select.value;

    let optionsHtml = '<option value="">-- スキルを選択 --</option>';
    if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
      SKILL_DATABASE[category].forEach(s => {
        const isSelectedByOther = selectedSkills.has(s.name) && s.name !== currentValue;
        const disabledAttr = isSelectedByOther ? 'disabled' : '';
        const labelText = isSelectedByOther ? `${s.name} (選択済み)` : s.name;
        optionsHtml += `<option value="${s.name}" ${s.name === currentValue ? 'selected' : ''} ${disabledAttr}>${labelText}</option>`;
      });
    }
    select.innerHTML = optionsHtml;
  });
}

function addSkillRow(category, skillName = '', memo = '') {
  const tbody = document.getElementById('skill-tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${category}" readonly style="background:#1e1e24;color:#ccc;border:none;"></td>
    <td><select onchange="onSkillSelect(this)"><option value="">-- スキルを選択 --</option></select></td>
    <td><textarea style="height:38px;">${memo}</textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove(); calcTotals(); updateSkillOptions();">X</button></td>
  `;
  tbody.appendChild(tr);

  if (skillName) tr.querySelector('select').value = skillName;
  updateSkillOptions();
  calcTotals();
}

function addPosSkillRow() { addSkillRow(document.getElementById('pos').value); }
function addMcSkillRow() { addSkillRow(document.getElementById('mc').value); }
function addScSkillRow() { addSkillRow(document.getElementById('sc').value); }

function onSkillSelect(selectElem) {
  const skillName = selectElem.value;
  const tr = selectElem.closest('tr');
  const category = tr.querySelector('input').value;
  const textarea = tr.querySelector('textarea');

  if (!skillName) {
    textarea.value = '';
  } else if (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) {
    const found = SKILL_DATABASE[category].find(s => s.name === skillName);
    if (found) textarea.value = found.memo || '';
  }

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
      <input type="text" class="h-scenario" value="${scenario}" placeholder="例: 狂い咲く薔薇" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="battle-pts" value="${battle}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="personal-pts" value="${personal}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #8ff; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="h-memo" value="${memo}" placeholder="例: 2026/05/10 通過" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" onclick="this.closest('tr').remove(); calcChouaiTotals();" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  calcChouaiTotals();
}

// --- 2. 寵愛点の使い道（消費）の行追加 ---
function addChouaiUseRow(used = 0, memo = '') {
  const tbody = document.getElementById('chouai-use-tbody');
  if (!tbody) return;

  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="number" class="used-pts" value="${used}" min="0" oninput="calcChouaiTotals()" style="width: 75%; background: #1a1a20; color: #ff88c2; border: 1px solid #555; padding: 4px; text-align: center; font-weight: bold; border-radius: 3px;"> pt
    </td>
    <td style="padding: 4px; border: 1px solid #444;">
      <input type="text" class="use-memo" value="${memo}" placeholder="例: 武装基本値+1、基本パーツ修復" style="width: 95%; background: #1a1a20; color: #fff; border: 1px solid #555; padding: 4px; border-radius: 3px;">
    </td>
    <td style="padding: 4px; border: 1px solid #444; text-align: center;">
      <button type="button" onclick="this.closest('tr').remove(); calcChouaiTotals();" style="background: #ff4444; color: white; border: none; padding: 2px 6px; border-radius: 3px; cursor: pointer;">X</button>
    </td>
  `;

  tbody.appendChild(tr);
  calcChouaiTotals();
}

// --- 3. 寵愛点計算処理 ---
function calcChouaiTotals() {
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
}

// --- 保存・読込（モーダル管理） ---

const STORAGE_KEY = 'necro_dolls_list';

// 全ドールデータの取得
function getAllDolls() {
  const json = localStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : {};
}

// モーダルを閉じる
function closeModals() {
  document.getElementById('save-modal').style.display = 'none';
  document.getElementById('load-modal').style.display = 'none';
}

// ------------------------------------------
// 1. 保存処理
// ------------------------------------------

// 保存ボタンを押した時（モーダルを開く）
function openSaveModal() {
  const select = document.getElementById('save-doll-select');
  const dolls = getAllDolls();
  const currentName = document.getElementById('name')?.value || '無名ドール';

  // オプションリセット
  select.innerHTML = `<option value="">✨ 新規保存（「${currentName}」として追加）</option>`;

  // 既存のドールを上書き選択肢としてリストに追加
  Object.keys(dolls).forEach(id => {
    const doll = dolls[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `🔄 上書き: ${doll.name || '無名ドール'} (${doll.pos || '無職'})`;
    select.appendChild(option);
  });

  document.getElementById('save-modal').style.display = 'flex';
}

// 保存の実行
function confirmSave() {
  const select = document.getElementById('save-doll-select');
  const selectedId = select.value;
  
  const data = getFullData();
  // IDが指定されていない（新規保存）場合はタイムスタンプでID生成
  const dollId = selectedId || ('doll_' + Date.now());
  data.id = dollId;

  const dolls = getAllDolls();
  dolls[dollId] = data;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dolls));
  closeModals();
  alert(`「${data.name || '無名ドール'}」を保存しました！`);
}

// ------------------------------------------
// 2. 読み込み・削除処理
// ------------------------------------------

// 読み込みボタンを押した時（モーダルを開く）
function openLoadModal() {
  const select = document.getElementById('load-doll-select');
  const dolls = getAllDolls();
  const keys = Object.keys(dolls);

  if (keys.length === 0) {
    return alert('ブラウザに保存されたドールデータがありません。');
  }

  // オプションリセット
  select.innerHTML = '<option value="">-- ドールを選択してください --</option>';

  keys.forEach(id => {
    const doll = dolls[id];
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${doll.name || '無名ドール'} (ポジション: ${doll.pos || 'なし'} / PL: ${doll.pl || '未設定'})`;
    select.appendChild(option);
  });

  document.getElementById('load-modal').style.display = 'flex';
}

// 読み込みの実行
function confirmLoad() {
  const select = document.getElementById('load-doll-select');
  const dollId = select.value;

  if (!dollId) {
    return alert('読み込むドールを選択してください。');
  }

  const dolls = getAllDolls();
  const data = dolls[dollId];

  if (data) {
    applyData(data);
    closeModals();
    alert(`「${data.name || '無名ドール'}」を読み込みました！`);
  }
}

// 削除の実行
function confirmDelete() {
  const select = document.getElementById('load-doll-select');
  const dollId = select.value;

  if (!dollId) {
    return alert('削除するドールを選択してください。');
  }

  const dolls = getAllDolls();
  const targetName = dolls[dollId]?.name || '無名ドール';

  if (!confirm(`本当に「${targetName}」を削除しますか？`)) {
    return;
  }

  delete dolls[dollId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dolls));
  closeModals();
  alert(`「${targetName}」を削除しました。`);
}

// ------------------------------------------
// データ構造・復元処理
// ------------------------------------------

function getFullData() {
  const getVal = id => document.getElementById(id)?.value || '';

  return {
    pl: getVal('pl'),
    name: getVal('name'),
    pos: getVal('pos'),
    mc: getVal('mc'),
    sc: getVal('sc'),
    age: getVal('age'),
    ps: getVal('ps'),
    hint: getVal('hint'),
    mem: getVal('mem'),
    act: getVal('act'),
    fav: getVal('fav'),
    tr: getVal('tr'),
    chouaiWep: getVal('chouai-wep'),
    chouaiMut: getVal('chouai-mut'),
    chouaiCyb: getVal('chouai-cyb'),
    bonus: document.querySelector('input[name="bonus"][value]:checked')?.value || 'wep',
    skills: Array.from(document.querySelectorAll('#skill-tbody tr')).map(tr => ({
      category: tr.querySelector('input')?.value || '',
      name: tr.querySelector('select')?.value || '',
      memo: tr.querySelector('textarea')?.value || ''
    })),
    parts: Array.from(document.querySelectorAll('#parts-container tr')).filter(tr => tr.querySelector('.p-name')?.value).map(tr => ({
      isBroken: tr.querySelector('input[type="checkbox"]')?.checked || false,
      location: tr.querySelector('.p-location')?.value || '',
      name: tr.querySelector('.p-name')?.value || '',
      type: tr.querySelector('.p-type')?.value || '基本',
      level: tr.querySelector('.p-level')?.value || '1',
      timing: tr.querySelector('.p-timing')?.value || '',
      cost: tr.querySelector('.p-cost')?.value || '',
      range: tr.querySelector('.p-range')?.value || '',
      memo: tr.querySelector('.p-memo')?.value || '',
      isEditable: !tr.querySelector('.p-name')?.hasAttribute('readonly')
    })),
    list: Array.from(document.querySelectorAll('#list tr')).map(tr => {
      const inputs = tr.querySelectorAll('input');
      return inputs.length >= 3 ? { target: inputs[0].value, emotion: inputs[1].value, madness: inputs[2].value } : null;
    }).filter(Boolean),
    history: Array.from(document.querySelectorAll('#session-history-tbody tr')).map(tr => ({
      scenario: tr.querySelector('.h-scenario')?.value || '',
      battle: tr.querySelector('.battle-pts')?.value || 0,
      personal: tr.querySelector('.personal-pts')?.value || 0,
      memo: tr.querySelector('.h-memo')?.value || ''
    })),
    chouaiUses: Array.from(document.querySelectorAll('#chouai-use-tbody tr')).map(tr => ({
      used: tr.querySelector('.used-pts')?.value || 0,
      memo: tr.querySelector('.use-memo')?.value || ''
    }))
  };
}

function applyData(data) {
  const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; };

  setVal('pl', data.pl); setVal('name', data.name);
  setVal('pos', data.pos || 'アリス'); setVal('mc', data.mc || 'ロマネスク'); setVal('sc', data.sc || 'ロマネスク');
  setVal('age', data.age); setVal('ps', data.ps || '煉獄');
  setVal('hint', data.hint); setVal('mem', data.mem);
  setVal('act', data.act || '9'); setVal('fav', data.fav || '0'); setVal('tr', data.tr);
  setVal('chouai-wep', data.chouaiWep || '0'); setVal('chouai-mut', data.chouaiMut || '0'); setVal('chouai-cyb', data.chouaiCyb || '0');

  if (data.bonus) {
    const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
    if (radio) radio.checked = true;
  }

  if (typeof onClassChange === 'function') onClassChange();

  const skillTbody = document.getElementById('skill-tbody');
  if (skillTbody) {
    skillTbody.innerHTML = '';
    if (data.skills) data.skills.forEach(s => addSkillRow(s.category, s.name, s.memo));
  }

  const listTbody = document.getElementById('list');
  if (listTbody) {
    listTbody.innerHTML = '';
    if (data.list) data.list.forEach(l => addRow(l.target, l.emotion, l.madness));
  }

  const historyTbody = document.getElementById('session-history-tbody');
  if (historyTbody) {
    historyTbody.innerHTML = '';
    if (data.history) data.history.forEach(h => addSessionHistoryRow(h.scenario, h.battle, h.personal, h.memo));
  }

  const useTbody = document.getElementById('chouai-use-tbody');
  if (useTbody) {
    useTbody.innerHTML = '';
    if (data.chouaiUses) data.chouaiUses.forEach(u => addChouaiUseRow(u.used, u.memo));
  }

  if (typeof calcTotals === 'function') calcTotals();
}

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

// 修正例（要素がない場合でもエラーにならない記述）
document.getElementById('modal-save-btn')?.addEventListener('click', () => {
  // 保存処理
});

window.onload = function() {
  if (typeof renderPartsContainer === 'function') renderPartsContainer();
  onClassChange();
};