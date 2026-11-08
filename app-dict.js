// 自分用の効果データ：data.jsに効果が入っていないスキル・パーツに、自分で書いた効果を覚えておき、次から自動で入れる
const EFFECT_DICT_KEY = 'necro_effect_dict';

function getEffectDict() {
  try {
    const d = JSON.parse(localStorage.getItem(EFFECT_DICT_KEY) || '{}');
    return (d && typeof d === 'object') ? d : {};
  } catch (e) { return {}; }
}
function setEffectDict(d) {
  try { localStorage.setItem(EFFECT_DICT_KEY, JSON.stringify(d)); return true; } catch (e) { return false; }
}
function effectKeySkill(category, name) { return 's|' + category + '|' + name; }
function effectKeyPart(name) { return 'p|' + name; }

function dbSkillEmpty(category, name) {
  const found = (typeof SKILL_DATABASE !== 'undefined' && SKILL_DATABASE[category]) ? SKILL_DATABASE[category].find(s => s.name === name) : null;
  return !!found && !found.memo;
}
function dbPartEmpty(name) {
  const all = [].concat(Object.values(EXTRA_PARTS_DB).flat(), COMMON_EXTRA_PARTS);
  const found = all.find(x => x.name === name);
  return !!found && !found.memo;
}

// 今シートにある、データ未登録のスキル・パーツのうち、効果が書いてあるものを覚える
function learnEffects() {
  const dict = getEffectDict();
  let changed = false;
  const put = (key, v) => {
    const old = dict[key];
    if (!old || old.memo !== v.memo || old.timing !== v.timing || old.cost !== v.cost || old.range !== v.range) { dict[key] = v; changed = true; }
  };
  document.querySelectorAll('#skill-tbody tr.skill-row').forEach(tr => {
    const name = tr.querySelector('.skill-name-select')?.value || '';
    const category = tr.querySelector('.skill-category')?.value || '';
    const memoTr = tr.nextElementSibling;
    const memo = (memoTr && memoTr.classList.contains('skill-memo-row')) ? (memoTr.querySelector('.skill-memo')?.value || '').trim() : '';
    if (!name || !memo || !dbSkillEmpty(category, name)) return;
    put(effectKeySkill(category, name), { timing: tr.querySelector('.skill-timing')?.value || '', cost: tr.querySelector('.skill-cost')?.value || '', range: tr.querySelector('.skill-range')?.value || '', memo });
  });
  document.querySelectorAll('#parts-container tr.part-row').forEach(tr => {
    const name = tr.querySelector('.p-name')?.value || '';
    const memoTr = tr.nextElementSibling;
    const memo = (memoTr && memoTr.classList.contains('part-memo-row')) ? (memoTr.querySelector('.p-memo')?.value || '').trim() : '';
    if (!name || !memo || !dbPartEmpty(name)) return;
    put(effectKeyPart(name), { timing: tr.querySelector('.p-timing')?.value || '', cost: tr.querySelector('.p-cost')?.value || '', range: tr.querySelector('.p-range')?.value || '', memo });
  });
  if (changed) setEffectDict(dict);
}

document.addEventListener('change', function (e) {
  if (e.target && e.target.matches && e.target.matches('.skill-memo, .p-memo')) learnEffects();
});

// バックアップに入れる／復元時に混ぜる（今ある内容は上書きしない）
function mergeEffectDict(incoming) {
  if (!incoming || typeof incoming !== 'object') return 0;
  const dict = getEffectDict();
  let n = 0;
  Object.keys(incoming).forEach(k => { if (!dict[k] && incoming[k] && incoming[k].memo) { dict[k] = incoming[k]; n++; } });
  if (n) setEffectDict(dict);
  return n;
}
