
// Mini formatter for **bold**, *italic*, and ~~strike~~
function fmt(txt){
  return String(txt)
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/~~(.+?)~~/g,'<del>$1</del>');
}

const state = {
  tenses: [],
  filters: [],
  active: [],
  activeChipIds: new Set(),
  index: 0,
};

// Load manifest -> tenses JSON files -> filters.json
async function loadData(){
  const manifest = await (await fetch('data/manifest.json')).json();
  const items = await Promise.all(manifest.map(async file => {
    const t = await (await fetch('data/'+file)).json();
    return t;
  }));
  state.tenses = items;
  state.active = [...state.tenses];
  state.filters = await (await fetch('filters.json')).json();
}

function $(id){ return document.getElementById(id); }

function renderSidebar(list){
  const wrap = $('tenseList'); wrap.innerHTML = '';
  list.forEach((t,i)=>{
    const item = document.createElement('div');
    item.className = 'tense-item' + (i===state.index?' active':'');
    item.innerHTML = `<div class="dot"></div><div><div style="font-weight:600">${t.name}</div><div class="muted" style="font-size:12px">${t.form}</div></div>`;
    item.addEventListener('click',()=>{ state.index = i; render(); });
    wrap.appendChild(item);
  });
}

function timelineBar(value){
  return `
    <div class="timeline"><div class="pos" style="left:${value}%"></div></div>
    <div class="legend"><span>Past</span><span>Now</span><span>Future</span></div>
  `;
}

function renderSlide(t){
  const slide = $('slide');
  slide.className = 'slide';
  const pitfalls = (t.pitfalls||[]).map(x=>`<li>${fmt(x)}</li>`).join('') || '<li>Sem armadilhas específicas. Foque na lógica.</li>';
  slide.innerHTML = `
    <div class="title">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <h2 style="margin:0">${t.name}</h2>
        <span class="badge">${t.form}</span>
      </div>
      <div class="tag">Logic-first</div>
    </div>

    <div class="grid">
      <div class="panel">
        <h4>Logic (how to use it)</h4>
        <div class="muted" style="line-height:1.55">${fmt(t.logic)}</div>
        ${timelineBar(t.timeline??50)}
      </div>
      <div class="panel">
        <h4>Portuguese mappings (by sense)</h4>
        <ul style="margin:0;padding-left:18px;line-height:1.7">
          ${(t.ptMap||[]).map(x=>`<li>${fmt(x)}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="panel">
      <h4>Examples</h4>
      <div class="examples">
        ${(t.examples||[]).map(ex=>`
          <div class="ex">
            <div class="en">${fmt(ex.en)}</div>
            <div class="pt">${fmt(ex.pt)}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="panel">
      <h4>Common pitfalls (EN ↔ PT)</h4>
      <ul style="margin:0;padding-left:18px;line-height:1.7">${pitfalls}</ul>
    </div>
  `;
}

function render(){
  renderSidebar(state.active);
  if(state.index<0) state.index=0;
  if(state.index>=state.active.length) state.index = Math.max(0, state.active.length-1);
  const t = state.active[state.index];
  if(!t){
    $('slide').innerHTML = `<div class="slide"><div class="muted">No results. Try clearing filters.</div></div>`;
    $('pos').textContent = '0 / 0';
    return;
  }
  renderSlide(t);
  $('pos').textContent = `${state.index+1} / ${state.active.length}`;
}

function matchesQuery(t, query){
  if(!query) return true;
  const hay = [t.name,t.form,t.logic,(t.ptMap||[]).join(' '),(t.tags||[]).join(' '),(t.examples||[]).map(e=>e.en+' '+e.pt).join(' ')].join(' ').toLowerCase();
  return hay.includes(query.toLowerCase());
}

function filterByRule(t, rule){
  if(!rule) return true;
  if(rule.type==='timelineRange'){
    const v = t.timeline ?? 50;
    if(rule.min!=null && v < rule.min) return false;
    if(rule.max!=null && v > rule.max) return false;
    return true;
  }
  if(rule.type==='tagsAnyOf'){
    const set = new Set(t.tags||[]);
    return (rule.tags||[]).some(x=>set.has(x));
  }
  return true;
}

function applyFilters(){
  const term = $('q').value.trim();
  const pool = state.tenses.filter(t => matchesQuery(t, term));
  if(state.activeChipIds.size===0){ state.active = pool; return; }
  const defs = new Map(state.filters.map(f=>[f.id,f.rule]));
  state.active = pool.filter(t => Array.from(state.activeChipIds).every(id => filterByRule(t, defs.get(id))));
}

function setupChips(){
  const wrap = $('chips'); wrap.innerHTML='';
  state.filters.forEach(f=>{
    const el = document.createElement('button');
    el.className = 'chip';
    el.textContent = f.label;
    el.addEventListener('click', ()=>{
      const on = el.classList.toggle('active');
      if(on) state.activeChipIds.add(f.id); else state.activeChipIds.delete(f.id);
      state.index=0; applyFilters(); render();
    });
    wrap.appendChild(el);
  });
}

function setupUI(){
  $('prev').addEventListener('click', ()=>{ state.index = Math.max(0, state.index-1); render(); });
  $('next').addEventListener('click', ()=>{ state.index = Math.min(state.active.length-1, state.index+1); render(); });
  $('reset').addEventListener('click', ()=>{
    $('q').value=''; state.activeChipIds.clear(); document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
    state.active=[...state.tenses]; state.index=0; render();
  });
  $('q').addEventListener('input', ()=>{ state.index=0; applyFilters(); render(); });
  $('fullscreen').addEventListener('click', toggleFS);
  window.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowLeft'){ $('prev').click(); }
    if(e.key==='ArrowRight'){ $('next').click(); }
    if(e.key==='/'){ if(document.activeElement!==$('q')){$('q').focus(); e.preventDefault();} }
    if(e.key==='f'){ toggleFS(); }
  });
}

function toggleFS(){
  if(!document.fullscreenElement){ document.documentElement.requestFullscreen(); }
  else { document.exitFullscreen(); }
}

(async function init(){
  await loadData();
  setupChips();
  setupUI();
  render();
})();
