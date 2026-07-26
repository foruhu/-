const SKILL_DATABASE = {
  'アリス': [
    { name: '少女', memo: '【少女】 R/0/0\n対象の姉妹1人と対話判定を行う' },
    { name: 'お嬢様', memo: '【お嬢様】 D/0/0〜1\n自身がダメージを受けた際のみ使用可能\n他の姉妹1人の次のアクションのコストを-1' },
    { name: '癒し', memo: '【癒し】 O/無/参照\n他の姉妹からの、あなたに対する対話判定は全て出目-1' },
    { name: '楽園の天使', memo: '【楽園の天使】 R/2/自\n現在の位置に関係なく、「楽園」に配置する。これは移動ではない。' },
    { name: '負けない心', memo: '【負けない心】 O/無/自\n対話判定の出目+1' },
    { name: '祈り', memo: '【祈り】 A/0/参照\nこれが宣言されたカウントを1として数え始めて5カウント目の終了時に効果が発動する\n宣言時から効果発動までの間、自身が狂気点追加、損傷がともになければ、あなたを含む姉妹全員は各自の未練から1つを選んで狂気点-1\n1ターンに1度、残りカウントが5以上なければ宣言できない' },
    { name: '輝く表情', memo: '【輝く表情】 O/無/自\nあなたが対話判定で大成功したなら、対話対象はあなたへの未練から狂気点-1できる。記憶のカケラの減少制限に含まれる' }
  ],
  'ホリック': [
    { name: '加速する狂気', memo: '【加速する狂気】 O/無/自\nバトルパートで発狂状態の未練がある際、攻撃判定+1' },
    { name: '業怒', memo: '【業怒】 D/参照/自\n自身が与えたダメージに対してのみ使用可能\nコストとして、あなたは任意の未練に狂気点+1する。ダメージ+2' },
    { name: '衝動', memo: '【衝動】 O/参照/自\n1ターンに1回、コストを支払う代わりに、任意の未練に狂気点+1をコストとして扱う' },
    { name: '奈落の引力', memo: '【奈落の引力】 O/無/自\n現在位置から奈落方向への移動マニューバを自身に使う際、コスト-1' },
    { name: '修羅', memo: '【修羅】 J/参照/自\nコストとして、あなたは任意の未練に狂気点+1\n支援3' },
    { name: '堕地獄', memo: '【堕地獄】 A/参照/自\nコストの代わりに、任意の未練へ狂気点+1\n配置エリア地獄に変更' },
    { name: '狂気の果て', memo: '【狂気の果て】 D/0/自\n任意の未練から狂気点-1\n同じエリアに他の姉妹がいるなら、その姉妹は未練を1つ選び、狂気点+1' }
  ],
  'オートマトン': [
    { name: '援護', memo: '【援護】 O/参照/0〜1\n1ターンに1回、射程内の他の姉妹のアクションマニューバを宣言した際、自身の現在行動値-1する代わりに、宣言されたマニューバのコストを0にする' },
    { name: '私は人形', memo: '【私は人形】 O/無/自\nバトルパートで1ターン目のみ、あらゆる発狂状態の効果を無視してよい' },
    { name: '無茶', memo: '【無茶】 O/参照/自\nコストとして、あなたは任意の基本パーツ1つ損傷する\n行動・攻撃・切断判定において、振り直しできる' },
    { name: '煉獄の檻', memo: '【煉獄の檻】 O/無/自\nターン終了時に煉獄にいるなら、行動値がマイナスになっていても最大行動値まで回復させる' },
    { name: '氷の心', memo: '【氷の心】 O/無/自\n狂気判定の出目+1' },
    { name: '血の涙', memo: '【血の涙】 O/参照/自\n精神攻撃によって与えられる狂気点を無視できる\n基本パーツ1つ損傷。基本パーツがない場合は使用不可' },
    { name: '敵は敵', memo: '【敵は敵】 O/無/自\nあなたに対する精神攻撃の判定値を7以上にする' }
  ],
  'ジャンク': [
    { name: '随行', memo: '【随行】 R/0/自\n他の姉妹が移動マニューバを使用した場合のみ、使用可。移動1' },
    { name: '足掻く', memo: '【足掻く】 O/無/自\n狂気点追加での振り直しのとき、出目+1' },
    { name: '半壊', memo: '【半壊】 O/無/自\nターン終了までにたからものを損傷していた場合、ターン経過での狂気点は追加させない' },
    { name: '奈落への抗い', memo: '【奈落への抗い】 O/無/自\n奈落にいる際、アクションマニューバのコスト-1' },
    { name: '地獄の住人', memo: '【地獄の住人】 O/無/自\n地獄にいる際、攻撃判定の出目+1' },
    { name: '楽園の守護者', memo: '【楽園の守護者】 O/無/参照\n楽園か花園にいる場合、楽園にいる手駒のコストを+1させる\n完全解体状態でも有効' },
    { name: '手負いの獣', memo: '【手負いの獣】 O/無/自\n攻撃判定において、パーツがすべて損傷した箇所1つにつき修正+1' }
  ],
  'コート': [
    { name: '助言', memo: '【助言】 J/0/0〜2\n支援1か妨害1' },
    { name: '作戦', memo: '【作戦】 O/無/参照\nバトルパート開始時、敵配置を見てから姉妹1人の配置を奈落以外の望むエリアに変更してもよい' },
    { name: '冷静', memo: '【冷静】 O/無/自\n行動判定の出目+1' },
    { name: '先読み', memo: '【先読み】 A/1/0〜1\n対象が次に使うアクションのコストを-1' },
    { name: '看破', memo: '【看破】 R/0/0〜3\n対象のラピッド、ダメージ、ジャッジのうち1つの効果を打ち消す' },
    { name: '抑制', memo: '【抑制】 O/参照/自\n狂気判定で失敗した際、その結果を成功に変えてもよい（大失敗は含まない）\n自身の任意のパーツを損傷させる' },
    { name: '憎まれ役', memo: '【憎まれ役】 O/参照/参照\n他の姉妹が、狂気判定に失敗または大失敗した際、その結果を成功に変えてもよい\n任意の未練に狂気点+1' }
  ],
  'ソロリティ': [
    { name: '号令', memo: '【号令】 R/2/参照\nあなたを含む舞台上にいる姉妹全員、攻撃マニューバ1つをラピッドとして使用してよい' },
    { name: '内緒話', memo: '【内緒話】 O/無/参照\nバトルパート開始時と終了時、任意の姉妹1人と互いに対話判定できる' },
    { name: '克己心', memo: '【克己心】 O/無/自\n発狂状態のとき、狂気・対話判定の出目+1' },
    { name: '優雅', memo: '【優雅】 O/無/参照\n狂気点で振り直す際、任意の姉妹1人にあなたを対象とした対話判定をさせてよい' },
    { name: '花園の集い', memo: '【花園の集い】 R/2/参照\nあなたを含む姉妹全員、花園に配置を変更する\nこれは移動ではない' },
    { name: '姉妹のくちづけ', memo: '【姉妹のくちづけ】 R/1/0\nサヴァントに対してのみ使用可\n対象サヴァントは現在行動値-4' },
    { name: '心を鬼にして', memo: '【心を鬼にして】 O/無/参照\nあなたの攻撃によって、姉妹のパーツを損傷させたなら、その姉妹は発狂状態の未練を1つ選び、狂気点-1させる。' }
  ],
  'ステーシー': [
    { name: '蠢く肉片', memo: '【蠢く肉片】 J/0/0〜2\nダメージを受けている際のみ使用可\n妨害3' },
    { name: '平気', memo: '【平気】 O/無/自\n損傷しても、ターン終了まではそのパーツは使える' },
    { name: '死に続け', memo: '【死に続け】 R/0/自\n損傷している基本パーツを1つ修復' },
    { name: '庇う', memo: '【庇う】 D/0/0〜1\n対象のダメージを自身が肩代わりできる\n1ターンに何度でも使用可' },
    { name: '肉の盾', memo: '【肉の盾】 D/0/0〜1\nダメージに付随する効果すべてを打ち消す' },
    { name: '失敗作', memo: '【失敗作】 O/無/自\n攻撃・切断判定の出目+1\n毎ターン終了時および戦闘終了時に任意のパーツ1つ損傷させる' },
    { name: '臓物豚', memo: '【臓物豚】 O/無/参照\n戦闘終了時、あなたを含む姉妹全員、損傷している【はらわた】を修復できる' },
    { name: '死人の流儀', memo: '【死人の流儀】 J/参照/0〜1\nコストの代わりに、任意の基本パーツを1つ損傷\n支援2か妨害2' }
  ],
  'タナトス': [
    { name: '無限解体', memo: '【無限解体】 D/0/自\nダメージを与えた際のみ使用可\n次カウントまで所有する攻撃マニューバは、同対象に使う限りタイミングがダメージとなる' },
    { name: '死神', memo: '【死神】 O/無/自\n白兵の出目+1' },
    { name: '災禍', memo: '【災禍】 D/2/自\n白兵のみ使用可\n全体攻撃の効果を得る。これによる自身へのダメージはない。' },
    { name: '殺劇', memo: '【殺劇】 O/無/自\n同カウント内に他の姉妹が攻撃対象とした敵に攻撃判定する際、自身の攻撃判定の出目+1、ダメージ+1してよい' },
    { name: '刹那', memo: '【刹那】 O/無/自\n攻撃マニューバを使用した際、自身以外はラピッド、ジャッジを使うことができない' },
    { name: '必中', memo: '【必中】 O/無/自\n攻撃判定値が6だった際、任意の箇所にダメージを与えてよい' },
    { name: '断罪', memo: '【断罪】 J/0/自\n自身の白兵攻撃判定のみ使用可\n出目は必ず6となる。振り直し不可。' },
    { name: '冥王', memo: '【冥王】 O/無/自\nレギオンによる移動妨害を常に無効化\nあなたへのレギオンの攻撃の判定値は7以上でなければダメージを与えられない' }
  ],
  'ゴシック': [
    { name: '暴食', memo: '【暴食】 R/0/自\n損傷した強化パーツを1つ修復する' },
    { name: '肉の宴', memo: '【肉の宴】 A/1/自\n損傷した基本パーツを1つ修復する' },
    { name: '捕食者', memo: '【捕食者】 D/2/0\n自身のいるエリア内の敵全てに転倒' },
    { name: '舌なめずり', memo: '【舌なめずり】 R/0/0〜1\n移動妨害1' },
    { name: '悪食', memo: '【悪食】 O/無/参照\n自身の攻撃によって対象に発生させた切断判定に出目-2' },
    { name: '背徳の悦び', memo: '【背徳の悦び】 D/0/自\n使用済みのラピッド、ジャッジ、ダメージを1つ再使用可能にする' },
    { name: '引き裂き', memo: '【引き裂き】 O/無/自\n【あご】【こぶし】を肉弾1+切断になる' },
    { name: '完全捕食', memo: '【完全捕食】 O/無/0\n射程0の対象に肉弾攻撃を成功させた際、対象の残りパーツ総数が［判定値-5］以下だったなら、対象は全てのパーツが損傷する' }
  ],
  'レクイエム': [
    { name: '魔弾', memo: '【魔弾】 O/無/自\n射撃の最大射程+1' },
    { name: '銃神', memo: '【銃神】 O/無/自\n射撃の攻撃判定の出目+1' },
    { name: '死の手', memo: '【死の手】 R/0/自\n任意の攻撃マニューバ1つをラピッドで使用してよい' },
    { name: '子守唄', memo: '【子守唄】 O/無/自\n射撃の攻撃判定の出目-1、コスト-1' },
    { name: '銃型', memo: '【銃型】 J/2/0〜1\n妨害2\nその後、同対象に射撃1を行ってよい' },
    { name: '集中', memo: '【集中】 R/2/自\nターン終了まで攻撃判定の出目+1' },
    { name: '後衛の誇り', memo: '【後衛の誇り】 O/無/自\n射撃・砲撃において攻撃判定値が1以下でも失敗として扱う' },
    { name: '最高の戦友', memo: '【最高の戦友】 R/1/自\n損傷中の白兵か射撃の効果を持つパーツ1つを修復できる' }
  ],
  'バロック': [
    { name: '異形存在', memo: '【異形存在】 O/無/自\n攻撃を受ける際の命中箇所を任意に決めてよい。大成功は含めない。' },
    { name: '狂鬼', memo: '【狂鬼】 O/無/自\n肉弾の攻撃判定の出目+1' },
    { name: '怪力', memo: '【怪力】 O/無/自\n肉弾・白兵攻撃のダメージ+1' },
    { name: '歪極', memo: '【歪極】 参照/無/自\nレベル3変異パーツを得る' },
    { name: '業躯', memo: '【業躯】 O/無/自\nバトルパート終了時、望むパーツ2つ修復' },
    { name: '再生', memo: '【再生】 D/1/自\n防御1、1ターンに何度でも使用可' },
    { name: '凶化器官', memo: '【凶化器官】 O/無/自\nあらゆる攻撃マニューバが与えるダメージを、使用宣言時に1上昇させてもよい。しかし、付随する効果はすべて失われる。' },
    { name: '結晶化', memo: '【結晶化】 D/1/自\n受けたダメージに付属した切断、爆発、移動は全て無効化\n1ターンに何度でも使用可' }
  ],
  'ロマネスク': [
    { name: '戦乙女', memo: '【戦乙女】 O/無/自\n最大行動値+2' },
    { name: '円舞曲', memo: '【円舞曲】 R/1/自\nターン終了まで、あなたを対象とするすべての攻撃判定の出目-1\n同ターン中の重複は不可' },
    { name: '死の舞踏', memo: '【死の舞踏】 J/0/自\n攻撃判定の振り直し' },
    { name: '調律', memo: '【調律】 R/0/0\n損傷したパーツを1つ選び、選んだパーツはターン終了まで使用可' },
    { name: '愛撫', memo: '【愛撫】 R/0/0\n転倒' },
    { name: '時計仕掛け', memo: '【時計仕掛け】 参照/無/自\nレベル3改造パーツを得る' },
    { name: '多数の手管', memo: '【多数の手管】 O/無/自\n【うで】【あし】を使用する際、コスト-1' },
    { name: '狂った歯車', memo: '【狂った歯車】 O/無/参照\nあなたがいるエリアで、敵が大失敗した際、その結果によって発生するダメージ+1上昇' }
  ]
};

const CLASS_PARTS = {
  'ステーシー': [1,0,1],
  'タナトス':   [2,0,0],
  'ゴシック':   [0,0,2],
  'レクイエム': [1,1,0],
  'バロック':   [0,2,0],
  'ホリック':   [0,1,1],
  'ロマネスク': [0,0,2]
};

const DEFAULT_PARTS = {
  head: [
    { name: 'あたま', type: '基本', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+2' },
    { name: 'めだま', type: '基本', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+2' },
    { name: 'あご', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾1' }
  ],
  arm: [
    { name: 'こぶし', type: '基本', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾1' },
    { name: 'うで', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '支援1' },
    { name: 'かた', type: '基本', level: 1, timing: 'アクション', cost: '4', range: '自身', memo: '移動1' }
  ],
  body: [
    { name: 'せぼね', type: '基本', level: 1, timing: 'アクション', cost: '1', range: '自身', memo: '同ターン内の次カウントで使う。マニューバ1つのカウント-1(最低0)' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無', range: '無', memo: 'なし' },
    { name: 'はらわた', type: '基本', level: 1, timing: 'オート', cost: '無', range: '無', memo: 'なし' }
  ],
  leg: [
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '移動1' },
    { name: 'ほね', type: '基本', level: 1, timing: 'アクション', cost: '3', range: '自身', memo: '移動1' },
    { name: 'あし', type: '基本', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '妨害1' }
  ]
};

// 公式ルール等に存在する全パーツを網羅・整理したデータベース
const EXTRA_PARTS_DB = {
  head: [
    { name: 'カンフー', type: '武装', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+1' },
    { name: '発勁', type: '武装', level: 2, timing: 'ラピッド', cost: '2', range: '0', memo: '白兵2＋攻撃判定+1' },
    { name: 'けもみみ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+1。行動判定で使用した際、大失敗してもこのパーツは損傷しない。' },
    { name: 'よぶんなあたま', type: '変異', level: 3, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+2' },
    { name: 'アドレナリン', type: '改造', level: 1, timing: 'ラピッド', cost: '無', range: '自身', memo: '最大行動値+1' },
    { name: 'セイバートゥース', type: '改造', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾2' },
    { name: 'ボルトヘッド', type: '改造', level: 1, timing: 'ジャッジ', cost: '1', range: '自身', memo: '支援2' },
    { name: 'ボイスエフェクト', type: '改造', level: 1, timing: 'ラピッド', cost: '0〜2', range: '自身', memo: '最大行動値+1' },
    { name: 'スコープ', type: '改造', level: 2, timing: 'ジャッジ', cost: '0', range: '自身', memo: '支援2,射撃、砲撃のみ' },
    { name: 'エンバーミング', type: '改造', level: 3, timing: 'ジャッジ', cost: '2', range: '0', memo: '妨害2。1ターンに何度も使用可。1回の判定は重複不可。' },
    { name: 'すすりじた', type: '変異', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '肉弾1。この攻撃で敵のパーツを損傷させた際、自身のはらわたを損傷しているなら、1つだけ損傷前の状態に戻してよい。' },
    { name: 'アンテナ', type: '改造', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '1ターンに1回だけ、コストの代わりに加えられる狂気点1点を無効化できる。' },
    { name: 'おとこのこ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '対話判定において、判定出目+1してよい。' }
  ],
  arm: [
    { name: '釘バット', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '白兵1＋爆発' },
    { name: 'バール', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '白兵2＋攻撃判定+1' },
    { name: '斧', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '白兵3' },
    { name: '日本刀', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0', memo: '白兵1＋切断' },
    { name: 'チェーンソー', type: '武装', level: 1, timing: 'アクション', cost: '3', range: '0', memo: '白兵2+切断' },
    { name: '大型拳銃', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '白兵2' },
    { name: '狙撃ライフル', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '2〜3', memo: '射撃1、攻撃判定+1' },
    { name: '火炎ビン', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '砲撃1+爆発+連撃1攻撃判定-1' },
    { name: 'ショットガン', type: '武装', level: 2, timing: 'アクション', cost: '2', range: '0〜1', memo: '射撃1+爆発、攻撃判定+1' },
    { name: 'マシンガン', type: '武装', level: 2, timing: 'アクション', cost: '3', range: '0〜1', memo: '射撃1+全体攻撃' },
    { name: '火炎放射器', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '砲撃1+爆発+連撃1' },
    { name: '有刺鉄線', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '自身がダメージを与えた際のみ使用可。白兵・肉弾ダメージ+1。' },
    { name: 'よぶんなうで', type: '変異', level: 2, timing: 'ラピッド', cost: '0', range: '自身', memo: '望む「アクション」マニューバ1つを「ラピッド」として使用する。' },
    { name: 'しょくしゅ', type: '変異', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '移動妨害1。' }
  ],
  body: [
    { name: 'ガトリング砲', type: '武装', level: 3, timing: 'アクション', cost: '4', range: '1〜3', memo: '射撃3' },
    { name: '手榴弾', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '射撃1＋爆発' },
    { name: '肉殻', type: '変異', level: 1, timing: 'ダメージ', cost: '1', range: '自身', memo: '防御2' },
    { name: '骨組', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+1' },
    { name: '合金装甲', type: '改造', level: 1, timing: 'ダメージ', cost: '1', range: '自身', memo: '防御2' },
    { name: 'リフレクター', type: '改造', level: 2, timing: 'ダメージ', cost: '2', range: '自身', memo: '防御3' },
    { name: 'うじむし', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: 'バトルパートにてターン終了時、このパーツが損傷していたら、修復してよい。' }
  ],
  leg: [
    { name: 'ローラーシューズ', type: '武装', level: 1, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+1' },
    { name: '多節足', type: '変異', level: 1, timing: 'アクション', cost: '1', range: '自身', memo: '移動2' },
    { name: '尻尾', type: '変異', level: 1, timing: 'ジャッジ', cost: '1', range: '0', memo: '転倒' },
    { name: 'キャタピラ', type: '改造', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '最大行動値+2、移動マニューバのコスト-1' },
    { name: 'ブースター', type: '改造', level: 1, timing: 'ラピッド', cost: '2', range: '自身', memo: '移動2' }
  ],
  // ★ご提示いただいた全パーツを含めた公式任意・汎用パーツ枠
  official_any: [
    { name: '火炎ビン', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '砲撃1+爆発+連撃1攻撃判定-1' },
    { name: '有刺鉄線', type: '武装', level: 2, timing: 'ダメージ', cost: '0', range: '自身', memo: '自身がダメージを与えた際のみ使用可。白兵・肉弾ダメージ+1。' },
    { name: '手榴弾', type: '武装', level: 1, timing: 'アクション', cost: '2', range: '0〜1', memo: '射撃1＋爆発' },
    { name: '単分子繊維', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '白兵攻撃1＋切断＋連撃1。' },
    { name: 'ダイナマイト', type: '武装', level: 3, timing: 'アクション', cost: '3', range: '0〜1', memo: '砲撃攻撃2＋爆発＋全体攻撃、攻撃判定の出目-1。' },
    { name: '火炎放射器', type: '武装', level: 3, timing: 'アクション', cost: '2', range: '0〜1', memo: '砲撃1+爆発+連撃1' },
    { name: 'うじむし', type: '変異', level: 1, timing: 'オート', cost: '無', range: '自身', memo: 'バトルパートにてターン終了時、このパーツが損傷していたら、修復してよい。' },
    { name: 'おおあな', type: '変異', level: 1, timing: 'ジャッジ', cost: '0', range: '0〜3', memo: 'あなたに対する攻撃判定にのみ使用可。妨害1。' },
    { name: 'おとこのこ', type: '変異', level: 2, timing: 'オート', cost: '無', range: '自身', memo: '対話判定において、判定出目+1してよい。' },
    { name: 'ほねやり', type: '変異', level: 2, timing: 'アクション', cost: '2', range: '0', memo: '肉弾攻撃1＋連撃1。' },
    { name: 'どくばり', type: '変異', level: 2, timing: 'アクション', cost: '3', range: '0', memo: '肉弾攻撃3。' },
    { name: 'よぷんななめ', type: '変異', level: 2, timing: 'ジャッジ', cost: '1', range: '0〜1', memo: '支援2。' },
    { name: 'しょくしゅ', type: '変異', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '移動妨害1。' },
    { name: 'ほとけかずら', type: '変異', level: 2, timing: 'ジャッジ', cost: '0', range: '0', memo: '支援1か妨害1。' },
    { name: 'にくむち', type: '変異', level: 3, timing: 'アクション', cost: '3', range: '0', memo: '肉弾攻撃2＋連撃1。' },
    { name: 'くされじる', type: '変異', level: 3, timing: 'アクション', cost: '3', range: '0〜1', memo: '肉弾攻撃1＋爆発＋転倒。' },
    { name: 'ジェットノズル', type: '改造', level: 1, timing: 'ダメージ', cost: '0', range: '自身', memo: '自身がダメージを与えた際のみ使用可。コストとして、あなたは任意の基本パーツを1つ損傷する。白兵・肉弾ダメージ+1（重複不可）。1度に何度も使用してよい。' },
    { name: 'リモートアタック', type: '改造', level: 1, timing: 'アクション', cost: '3', range: '0〜1', memo: '肉弾攻撃1＋転倒。' },
    { name: 'ゾンビボム', type: '改造', level: 2, timing: 'ダメージ', cost: '0', range: '0', memo: 'このパーツが損傷した際のみ使用可。判定値8（ジャッジタイミング発生）の「砲撃攻撃2＋爆発＋全体攻撃」を与える。' },
    { name: 'エレクトリガー', type: '改造', level: 2, timing: 'アクション', cost: '2', range: '0', memo: '肉弾攻撃1＋転倒。' },
    { name: 'ドリル', type: '改造', level: 2, timing: 'アクション', cost: '3', range: '0', memo: '白兵攻撃2、この攻撃に対して「防御」は全て無効。' },
    { name: 'アサシンブレード', type: '改造', level: 2, timing: 'ラピッド', cost: '2', range: '0', memo: '白兵攻撃2＋連撃1。' },
    { name: 'レーザービーム', type: '改造', level: 2, timing: 'アクション', cost: '3', range: '0〜3', memo: '射撃攻撃1＋切断。' },
    { name: 'スパイク', type: '改造', level: 2, timing: 'ダメージ', cost: '1', range: '自身', memo: '自身がダメージを与えた際のみ使用可。白兵・肉弾ダメージ+2。' },
    { name: 'テントクル', type: '改造', level: 2, timing: 'ラピッド', cost: '1', range: '0〜1', memo: '移動妨害1。' },
    { name: 'ワイヤーリール', type: '改造', level: 2, timing: 'ラピッド', cost: '3', range: '0〜2', memo: '移動1。' },
    { name: 'パイルバンカー', type: '改造', level: 3, timing: 'アクション', cost: '2', range: '0', memo: '白兵攻撃2、この攻撃に対して「防御」は全て無効。攻撃が命中したなら対象を「移動1」してもよい。' },
    { name: 'ライトセイバー', type: '改造', level: 3, timing: 'アクション', cost: '2', range: '0', memo: '白兵攻撃1＋切断＋連撃1。' }
  ]
};

// パーツコンテナおよびセレクトボックスを生成する関数
function renderPartsContainer() {
  const container = document.getElementById('parts-container');
  if (!container) return;
  container.innerHTML = '';

  const baseSections = [
    { id: 'head', title: '頭部', val: '（最大数値：2）' },
    { id: 'arm', title: '腕部', val: '（最大数値：2）' },
    { id: 'body', title: '胴部', val: '（最大数値：2）' },
    { id: 'leg', title: '脚部', val: '（最大数値：2）' }
  ];

  const allSections = [...baseSections, ...customSections];

  let allPartsOptionsHtml = `<option value="">+ 【任意の部位】にパーツを選択して追加...</option>`;
  allPartsOptionsHtml += `<option value="custom">-- 自由入力枠を追加 --</option>`;

  const categoryNameMap = { 
    head: '頭部', 
    arm: '腕部', 
    body: '胴部', 
    leg: '脚部', 
    official_any: '公式任意・汎用' 
  };

  Object.keys(EXTRA_PARTS_DB).forEach(categoryKey => {
    const catLabel = categoryNameMap[categoryKey] || categoryKey;
    
    EXTRA_PARTS_DB[categoryKey].forEach((p, idx) => {
      allPartsOptionsHtml += `<option value="${categoryKey}_${idx}">[${catLabel} / ${p.type} Lv${p.level}] ${p.name}</option>`;
    });
  });

  allSections.forEach(sec => {
    const secDiv = document.createElement('div');
    secDiv.id = `section-box-${sec.id}`;
    
    let deleteBtnHtml = '';
    if (sec.isCustom) {
      deleteBtnHtml = `<button type="button" class="del" onclick="removeCustomSection('${sec.id}')" style="margin-left:8px;font-size:.7rem;padding:2px 6px;">部位削除</button>`;
    }

    secDiv.innerHTML = `
      <div class="part-header">
        <div style="display:flex; align-items:center;">
          ${sec.isCustom ? `<input type="text" value="${sec.title}" oninput="updateCustomTitle('${sec.id}', this.value)" style="background:#18181c; border:1px solid #555; color:#fff; padding:2px 6px; font-size:.9rem; font-weight:bold; width:140px; text-align:left;">` : `<span>${sec.title}</span>`}
          ${deleteBtnHtml}
        </div>
        <span class="val">${sec.val || ''}</span>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th style="width:8%">破損</th>
              <th style="width:20%">パーツ名</th>
              <th style="width:10%">種別</th>
              <th style="width:8%">Lv</th>
              <th style="width:12%">タイミング</th>
              <th style="width:8%">コスト</th>
              <th style="width:10%">射程</th>
              <th style="width:18%">効果メモ</th>
              <th style="width:6%">操作</th>
            </tr>
          </thead>
          <tbody id="parts-tbody-${sec.id}"></tbody>
        </table>
      </div>
      <div style="margin-top:6px;">
        <select class="add-part-select" onchange="onExtraPartSelect('${sec.id}', this)">
          ${allPartsOptionsHtml}
        </select>
      </div>
    `;
    container.appendChild(secDiv);

    const tbody = secDiv.querySelector(`#parts-tbody-${sec.id}`);
    if (DEFAULT_PARTS && DEFAULT_PARTS[sec.id]) {
      DEFAULT_PARTS[sec.id].forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, false);
      });
    }
    if (sec.isCustom && sec.partsData) {
      sec.partsData.forEach(p => {
        addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, true);
      });
    }
  });
}

// 選択時の処理（制限チェック対応）
function onExtraPartSelect(secId, selectElem) {
  const val = selectElem.value;
  if (!val) return;

  const tbody = document.getElementById(`parts-tbody-${secId}`);
  if (!tbody) return;

  if (val === 'custom') {
    addPartRow(tbody, '新規パーツ', '武装', 1, 'アクション', '1', '0', '', true);
  } else {
    const [sId, idxStr] = val.split('_');
    const idx = parseInt(idxStr, 10);
    const p = EXTRA_PARTS_DB[sId] ? [idx] : null;
    
    if (p) {
      let categoryKey = '';
      if (p.type === '武装') categoryKey = 'wep';
      else if (p.type === '変異') categoryKey = 'mut';
      else if (p.type === '改造') categoryKey = 'cyb';

      if (categoryKey) {
        const totalValElem = document.getElementById(`total-${categoryKey}`);
        const currentTotal = totalValElem ? parseInt(totalValElem.textContent, 10) || 1 : 1;
        
        const tableLimits = PART_LIMIT_TABLE[currentTotal] || PART_LIMIT_TABLE[9];
        const maxLimit = tableLimits[p.level - 1] ?? 0;
        const currentCount = countExistingParts(p.type, p.level);

        if (currentCount >= maxLimit) {
          alert(`【${p.type}】の強化値（現在 ${currentTotal}）におけるLv${p.level}パーツの取得上限（${maxLimit}個）に達しているため追加できません。`);
          selectElem.value = '';
          return;
        }
      }

      addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, true);
    }
  }
  selectElem.value = '';
}

function addPartRow(tbody, name='', type='基本', level=1, timing='オート', cost='0', range='0', memo='', isRemovable=true) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="checkbox" onchange="toggleBroken(this)" style="width:16px;height:16px;cursor:pointer;"></td>
    <td><input type="text" class="p-name" value="${name}"></td>
    <td><input type="text" class="p-type" value="${type}" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="number" class="p-level" value="${level}" min="1" max="3" style="width:40px;" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="text" class="p-timing" value="${timing}"></td>
    <td><input type="text" class="p-cost" value="${cost}"></td>
    <td><input type="text" class="p-range" value="${range}"></td>
    <td><textarea class="p-memo" rows="1">${memo}</textarea></td>
    <td>${isRemovable ? '<button type="button" class="del" onclick="this.closest(\'tr\').remove()">削</button>' : '-'}</td>
  `;
  tbody.appendChild(tr);
}

function addPartRow(tbody, name='', type='基本', level=1, timing='オート', cost='0', range='0', memo='', isRemovable=true) {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="checkbox" onchange="toggleBroken(this)" style="width:16px;height:16px;cursor:pointer;"></td>
    <td><input type="text" class="p-name" value="${name}"></td>
    <td><input type="text" class="p-type" value="${type}" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="number" class="p-level" value="${level}" min="1" max="3" style="width:40px;" ${isRemovable ? '' : 'readonly style="background:#151518;color:#aaa;"'}></td>
    <td><input type="text" class="p-timing" value="${timing}"></td>
    <td><input type="text" class="p-cost" value="${cost}"></td>
    <td><input type="text" class="p-range" value="${range}"></td>
    <td><textarea class="p-memo" rows="1">${memo}</textarea></td>
    <td>${isRemovable ? '<button type="button" class="del" onclick="this.closest(\'tr\').remove()">削</button>' : '-'}</td>
  `;
  tbody.appendChild(tr);
}

function toggleBroken(chk) {
  const tr = chk.closest('tr');
  if (chk.checked) {
    tr.classList.add('broken');
  } else {
    tr.classList.remove('broken');
  }
}

function resetUsed() {
  const checkboxes = document.querySelectorAll('#parts-container input[type="checkbox"]');
  checkboxes.forEach(chk => {
    chk.checked = false;
    toggleBroken(chk);
  });
}

function onClassChange() {
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;
  const mcVal = CLASS_PARTS[mc] || [0,0,0];
  const scVal = CLASS_PARTS[sc] || [0,0,0];

  document.getElementById('mc-wep').textContent = mcVal[0];
  document.getElementById('mc-mut').textContent = mcVal[1];
  document.getElementById('mc-cyb').textContent = mcVal[2];

  document.getElementById('sc-wep').textContent = scVal[0];
  document.getElementById('sc-mut').textContent = scVal[1];
  document.getElementById('sc-cyb').textContent = scVal[2];

  calcTotals();
  updateSkillRowsFromClass();
}

function updateSkillRowsFromClass() {
  const pos = document.getElementById('pos').value;
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;

  const rows = document.querySelectorAll('#skill-tbody tr');

  if (rows[0]) {
    const typeInput = rows[0].querySelector('.sk-type');
    if (typeInput) typeInput.value = pos;
    updateSkillSelectOptions(rows[0].querySelector('.sk-select'), [pos]);
  }

  for (let i = 1; i < rows.length; i++) {
    const typeInput = rows[i].querySelector('.sk-type');
    const selectElem = rows[i].querySelector('.sk-select');
    if (typeInput) {
      const role = typeInput.getAttribute('data-role');
      const targetClass = (role === 'sc') ? sc : mc;
      typeInput.value = targetClass;
      updateSkillSelectOptions(selectElem, [targetClass]);
    }
  }
}

function updateSkillSelectOptions(selectElem, categories) {
  if (!selectElem) return;
  const currentVal = selectElem.value;
  selectElem.innerHTML = '<option value="">-- スキルを選択 --</option>';

  categories.forEach(cat => {
    const skills = SKILL_DATABASE[cat];
    if (skills) {
      const group = document.createElement('optgroup');
      group.label = `【${cat}】`;

      skills.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = s.name;
        if (s.name === currentVal) opt.selected = true;
        group.appendChild(opt);
      });
      selectElem.appendChild(group);
    }
  });
}

function calcTotals() {
  const mc = document.getElementById('mc').value;
  const sc = document.getElementById('sc').value;
  const mcVal = CLASS_PARTS[mc] || [0,0,0];
  const scVal = CLASS_PARTS[sc] || [0,0,0];

  const bonusRadio = document.querySelector('input[name="bonus"]:checked');
  const bonusType = bonusRadio ? bonusRadio.value : 'wep';

  const chouaiWep = parseInt(document.getElementById('chouai-wep').value, 10) || 0;
  const chouaiMut = parseInt(document.getElementById('chouai-mut').value, 10) || 0;
  const chouaiCyb = parseInt(document.getElementById('chouai-cyb').value, 10) || 0;

  let totalWep = mcVal[0] + scVal[0] + (bonusType === 'wep' ? 1 : 0) + chouaiWep;
  let totalMut = mcVal[1] + scVal[1] + (bonusType === 'mut' ? 1 : 0) + chouaiMut;
  let totalCyb = mcVal[2] + scVal[2] + (bonusType === 'cyb' ? 1 : 0) + chouaiCyb;

  document.getElementById('total-wep').textContent = totalWep;
  document.getElementById('total-mut').textContent = totalMut;
  document.getElementById('total-cyb').textContent = totalCyb;
}

function addSkillRow(typeText, roleRole, defaultSkillName = '') {
  const tbody = document.getElementById('skill-tbody');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" class="sk-type" value="${typeText}" data-role="${roleRole}" readonly style="background:#151518;color:#aaa;"></td>
    <td>
      <select class="sk-select" onchange="onSkillSelectChange(this)">
        <option value="">-- スキルを選択 --</option>
      </select>
    </td>
    <td><textarea class="sk-memo" rows="1"></textarea></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">削</button></td>
  `;
  tbody.appendChild(tr);

  const selectElem = tr.querySelector('.sk-select');
  updateSkillSelectOptions(selectElem, [typeText]);

  if (defaultSkillName) {
    selectElem.value = defaultSkillName;
    onSkillSelectChange(selectElem);
  }
}

function addPosSkillRow(skillName = '') {
  const pos = document.getElementById('pos').value;
  addSkillRow(pos, 'pos', skillName);
}

function addMcSkillRow(skillName = '') {
  const mc = document.getElementById('mc').value;
  addSkillRow(mc, 'mc', skillName);
}

function addScSkillRow(skillName = '') {
  const sc = document.getElementById('sc').value;
  addSkillRow(sc, 'sc', skillName);
}

function onSkillSelectChange(selectElem) {
  const tr = selectElem.closest('tr');
  const memoTextarea = tr.querySelector('.sk-memo');
  const selectedSkillName = selectElem.value;
  const typeInput = tr.querySelector('.sk-type');
  const category = typeInput ? typeInput.value : '';

  if (!selectedSkillName) {
    memoTextarea.value = '';
    return;
  }

  const skills = SKILL_DATABASE[category];
  if (skills) {
    const found = skills.find(s => s.name === selectedSkillName);
    if (found) {
      memoTextarea.value = found.memo;
    }
  }
}

function addRow(target = '', emotion = '', madness = '0') {
  const list = document.getElementById('list');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" value="${target}" style="width:100%;"></td>
    <td><input type="text" value="${emotion}" style="width:100%;"></td>
    <td><input type="number" value="${madness}" style="width:60px;"></td>
    <td><button type="button" class="del" onclick="this.closest('tr').remove()">削</button></td>
  `;
  list.appendChild(tr);
}

function saveData() {
  const data = {
    pl: document.getElementById('pl').value,
    name: document.getElementById('name').value,
    pos: document.getElementById('pos').value,
    mc: document.getElementById('mc').value,
    sc: document.getElementById('sc').value,
    bonus: document.querySelector('input[name="bonus"]:checked')?.value || 'wep',
    chouaiWep: document.getElementById('chouai-wep').value,
    chouaiMut: document.getElementById('chouai-mut').value,
    chouaiCyb: document.getElementById('chouai-cyb').value,
    age: document.getElementById('age').value,
    ps: document.getElementById('ps').value,
    hint: document.getElementById('hint').value,
    mem: document.getElementById('mem').value,
    act: document.getElementById('act').value,
    fav: document.getElementById('fav').value,
    tr: document.getElementById('tr').value,
    customSections: customSections
  };

  const skills = [];
  document.querySelectorAll('#skill-tbody tr').forEach(tr => {
    skills.push({
      type: tr.querySelector('.sk-type')?.value || '',
      name: tr.querySelector('.sk-select')?.value || '',
      memo: tr.querySelector('.sk-memo')?.value || '',
      role: tr.querySelector('.sk-type')?.getAttribute('data-role') || ''
    });
  });
  data.skills = skills;

  const list = [];
  document.querySelectorAll('#list tr').forEach(tr => {
    list.push({
      target: tr.querySelector('.target')?.value || '',
      emotion: tr.querySelector('.emotion')?.value || '',
      madness: tr.querySelector('.madness')?.value || ''
    });
  });
  data.list = list;

  const parts = {};
  const baseIds = ['head', 'arm', 'body', 'leg'];
  baseIds.forEach(id => {
    parts[id] = [];
    const tbody = document.getElementById(`parts-tbody-${id}`);
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        parts[id].push({
          broken: tr.querySelector('input[type="checkbox"]')?.checked || false,
          name: tr.querySelector('.p-name')?.value || '',
          type: tr.querySelector('.p-type')?.value || '',
          level: tr.querySelector('.p-level')?.value || 1,
          timing: tr.querySelector('.p-timing')?.value || '',
          cost: tr.querySelector('.p-cost')?.value || '',
          range: tr.querySelector('.p-range')?.value || '',
          memo: tr.querySelector('.p-memo')?.value || ''
        });
      });
    }
  });
  data.parts = parts;

  localStorage.setItem('nechronica_sheet', JSON.stringify(data));
  alert('ブラウザにデータを保存しました。');
}

function loadData() {
  const jsonStr = localStorage.getItem('nechronica_sheet');
  if (!jsonStr) {
    alert('保存されたデータが見つかりません。');
    return;
  }
  try {
    const data = JSON.parse(jsonStr);
    document.getElementById('pl').value = data.pl || '';
    document.getElementById('name').value = data.name || '';
    document.getElementById('pos').value = data.pos || 'アリス';
    document.getElementById('mc').value = data.mc || 'ロマネスク';
    document.getElementById('sc').value = data.sc || 'ロマネスク';

    if (data.bonus) {
      const radio = document.querySelector(`input[name="bonus"][value="${data.bonus}"]`);
      if (radio) radio.checked = true;
    }

    document.getElementById('chouai-wep').value = data.chouaiWep || 0;
    document.getElementById('chouai-mut').value = data.chouaiMut || 0;
    document.getElementById('chouai-cyb').value = data.chouaiCyb || 0;
    document.getElementById('age').value = data.age || '';
    document.getElementById('ps').value = data.ps || '煉獄';
    document.getElementById('hint').value = data.hint || '';
    document.getElementById('mem').value = data.mem || '';
    document.getElementById('act').value = data.act || 9;
    document.getElementById('fav').value = data.fav || 0;
    document.getElementById('tr').value = data.tr || '';

    // カスタム部位がある場合は、各部位のパーツデータも含めて復元する
    if (data.customSections && Array.isArray(data.customSections)) {
      customSections = data.customSections.map(sec => {
        if (data.parts && data.parts[sec.id]) {
          return { ...sec, partsData: data.parts[sec.id] };
        }
        return sec;
      });
    } else {
      customSections = [];
    }

    renderPartsContainer();
    onClassChange();

    if (data.parts) {
      Object.keys(data.parts).forEach(id => {
        const tbody = document.getElementById(`parts-tbody-${id}`);
        if (tbody) {
          tbody.innerHTML = '';
          data.parts[id].forEach(p => {
            const isBase = ['head', 'arm', 'body', 'leg'].includes(id);
            addPartRow(tbody, p.name, p.type, p.level, p.timing, p.cost, p.range, p.memo, !isBase);
            const lastTr = tbody.lastElementChild;
            if (lastTr && p.broken) {
              const chk = lastTr.querySelector('input[type="checkbox"]');
              if (chk) {
                chk.checked = true;
                toggleBroken(chk);
              }
            }
          });
        }
      });
    }

    const skillTbody = document.getElementById('skill-tbody');
    skillTbody.innerHTML = '';
    if (data.skills && data.skills.length > 0) {
      data.skills.forEach(s => {
        addSkillRow(s.type, s.role || 'mc', s.name);
        const lastTr = skillTbody.lastElementChild;
        if (lastTr && s.memo) {
          lastTr.querySelector('.sk-memo').value = s.memo;
        }
      });
    }

    const listTbody = document.getElementById('list');
    listTbody.innerHTML = '';
    if (data.list && data.list.length > 0) {
      data.list.forEach(l => {
        addRow(l.target, l.emotion, l.madness);
      });
    }

    alert('データを読み込みました。');
  } catch (e) {
    console.error(e);
    alert('データの読み込みに失敗しました。');
  }
}

function exportJSON() {
  const jsonStr = localStorage.getItem('nechronica_sheet') || '{}';
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (document.getElementById('name').value || 'nechronica_chara') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function exportCcfolia() {
  alert('ココフォリア出力機能が呼び出されました。');
}

// 初期化処理
window.onload = function() {
  renderPartsContainer();
  onClassChange();
  if (document.querySelectorAll('#skill-tbody tr').length === 0) {
    addPosSkillRow();
    addMcSkillRow();
    addMcSkillRow();
    addScSkillRow();
  }
  if (document.querySelectorAll('#list tr').length === 0) {
    addRow();
  }
};
