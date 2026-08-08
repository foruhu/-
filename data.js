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
    { name: 'サイボーグ', type: '改造', level: 3, timing: '', cost: '0', range: '' },
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
  { name: 'よぷんなめ', type: '変異', level: 2, timing: '', cost: '', range: '' },
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
