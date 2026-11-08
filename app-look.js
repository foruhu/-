// 見やすさの設定：配色（暗/明）・表の余白（標準/ゆったり）・種別の色の凡例
function applyTheme(t) {
  document.documentElement.classList.toggle('theme-light', t === 'light');
  const b = document.getElementById('theme-btn');
  if (b) b.textContent = t === 'light' ? '配色：明' : '配色：暗';
}
function toggleTheme() {
  let cur = 'dark';
  try { cur = localStorage.getItem('necro_theme') || 'dark'; } catch (e) {}
  const next = cur === 'light' ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem('necro_theme', next); } catch (e) {}
}
function applyRoomy(on) {
  document.documentElement.classList.toggle('table-roomy', !!on);
  const b = document.getElementById('roomy-btn');
  if (b) b.textContent = on ? '表：ゆったり' : '表：標準';
  if (typeof autoResizeAllMemoTextareas === 'function') setTimeout(autoResizeAllMemoTextareas, 50);
}
function toggleRoomy() {
  let cur = false;
  try { cur = localStorage.getItem('necro_table_roomy') === '1'; } catch (e) {}
  applyRoomy(!cur);
  try { localStorage.setItem('necro_table_roomy', !cur ? '1' : '0'); } catch (e) {}
}
// 種別（攻撃・移動など）の色が何を表すかの凡例を、スキル・マニューバの見出しの下に出す
function renderCategoryLegend() {
  ['sec-skill', 'sec-parts'].forEach(id => {
    const card = document.getElementById(id);
    if (!card || card.querySelector('.cat-legend')) return;
    const box = document.createElement('div');
    box.className = 'cat-legend';
    box.innerHTML = '<span class="cat-legend-label">色の意味：</span>' + Object.keys(MANEUVER_CATEGORY_COLORS).map(k =>
      `<span class="cat-chip"><i style="background:${MANEUVER_CATEGORY_COLORS[k]}"></i>${escapeHtml(k)}</span>`).join('');
    const title = card.querySelector('.title');
    if (title) title.after(box); else card.prepend(box);
  });
}
function initLook() {
  let th = 'dark', roomy = false;
  try { th = localStorage.getItem('necro_theme') || 'dark'; roomy = localStorage.getItem('necro_table_roomy') === '1'; } catch (e) {}
  applyTheme(th);
  applyRoomy(roomy);
  renderCategoryLegend();
}
