/* ConTech Landscape: figures 2 and 5-8, company drawer, tooltips and downloads.
   Relies on globals from the inline script in index.html: D (data), S (filter state), CATS, PHASES,
   $, esc, slug, isNew, matchAll, update, writeURL. */
(function(){
'use strict';
let ready=false;

/* ---------- helpers ---------- */
const NS=(W,H,cls,label)=>`<svg class="${cls}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="${esc(label)}">`;
const catColor=c=>{const i=CATS.findIndex(k=>k[0]===c);return i<0?'var(--ink-2)':`var(--c${i+1})`};
const mainCat=x=>[...(x.category||[])].sort((a,b)=>CATS.findIndex(k=>k[0]===a)-CATS.findIndex(k=>k[0]===b))[0]||'';
const firstCat=x=>(x.category||[])[0]||'';
const country=x=>(x.hq||'').split(',').pop().trim();
const REGION={'United States':'North America','Canada':'North America','Mexico':'Latin America','Brazil':'Latin America',
  'United Kingdom':'Europe','Germany':'Europe','Finland':'Europe','Netherlands':'Europe','Sweden':'Europe','France':'Europe','Spain':'Europe','Italy':'Europe','Switzerland':'Europe','Denmark':'Europe','Norway':'Europe','Ireland':'Europe','Poland':'Europe','Austria':'Europe','Belgium':'Europe','Estonia':'Europe','Portugal':'Europe',
  'Australia':'Asia-Pacific','Japan':'Asia-Pacific','Singapore':'Asia-Pacific','India':'Asia-Pacific','New Zealand':'Asia-Pacific','South Korea':'Asia-Pacific','China':'Asia-Pacific',
  'Saudi Arabia':'Middle East','Israel':'Middle East','United Arab Emirates':'Middle East','Qatar':'Middle East'};
const REGIONS=['North America','Europe','Middle East','Asia-Pacific','Latin America','Africa','Other'];
const region=x=>REGION[country(x)]||'Other';
const byCo=new Map();

/* Funding strings are free text, e.g. "Series A, EUR 8M, Jun 2025" or "Acquired by Autodesk (2018)".
   Parse them into a stage, an approximate USD amount and a date. */
const STAGES=['Pre-seed','Seed','Series A','Series B','Series C+','Other round','Acquired or public','Not disclosed'];
const STAGE_COLOR={'Pre-seed':'var(--c14)','Seed':'var(--c1)','Series A':'var(--c2)','Series B':'var(--c4)','Series C+':'var(--c5)','Other round':'var(--c3)','Acquired or public':'var(--c12)','Not disclosed':'var(--rule)'};
const FX={'$':1,'USD':1,'A$':.65,'AUD':.65,'CAD':.72,'EUR':1.08,'€':1.08,'GBP':1.27,'£':1.27,'JPY':.0066,'¥':.0066};
const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
function parseFunding(raw){
  const t=(raw||'').trim(),l=t.toLowerCase();
  let stage;
  if(!t)stage='Not disclosed';
  else if(/^(acquired|public|subsidiary)/.test(l))stage='Acquired or public';
  else if(/^pre-?seed/.test(l))stage='Pre-seed';
  else if(/^(pre-)?series a\b/.test(l))stage='Series A';
  else if(/^series b\b/.test(l))stage='Series B';
  else if(/^series [c-z]\b/.test(l))stage='Series C+';
  else if(/^seed/.test(l))stage='Seed';
  else stage='Other round';
  let usd=null;
  const m=t.match(/(A\$|AUD|CAD\s*\$?|USD|EUR|€|GBP|£|JPY|¥|\$)\s*([\d.,]+)\s*([KMB])\b/i);
  if(m){const cur=m[1].replace(/\s*\$$/,'').trim().toUpperCase()||'$',k=cur==='CAD'?'CAD':(FX[cur]!=null?cur:m[1]);
    const mult={K:1e3,M:1e6,B:1e9}[m[3].toUpperCase()];usd=parseFloat(m[2].replace(/,/g,''))*mult*(FX[k]??1)}
  let date=null;const dm=t.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{4})/i);
  if(dm)date=new Date(+dm[2],MON[dm[1].toLowerCase()],15);
  else{const y=t.match(/\b(19|20)\d\d\b/);if(y)date=new Date(+y[0],6,1)}
  return {stage,usd,date,raw:t};
}
const fmtUSD=v=>v==null?'':v>=1e9?`$${(v/1e9).toFixed(1)}B`:v>=1e6?`$${(v/1e6).toFixed(v<1e7?1:0).replace(/\.0$/,'')}M`:`$${Math.round(v/1e3)}K`;
const fmtMon=d=>d?d.toLocaleDateString('en-GB',{month:'short',year:'numeric'}):'';
const trunc=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
const initials=n=>n.replace(/[^A-Za-z0-9 ]/g,' ').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

/* ---------- tooltip ---------- */
const tip=$('#tip');
function showTip(e,html){tip.innerHTML=html;tip.hidden=false;const r=tip.getBoundingClientRect();
  let x=e.clientX+14,y=e.clientY+14;if(x+r.width>innerWidth-8)x=e.clientX-r.width-14;if(y+r.height>innerHeight-8)y=e.clientY-r.height-14;tip.style.left=x+'px';tip.style.top=y+'px'}
document.addEventListener('pointermove',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el&&e.pointerType!=='touch')showTip(e,el.dataset.tip);else tip.hidden=true});
document.addEventListener('scroll',()=>{tip.hidden=true},{passive:true});
const tipFor=x=>{const f=x.fu;return `<b>${esc(x.company)}</b>${esc(f.stage)}${f.usd?' · '+fmtUSD(f.usd):''}${f.date?' · '+fmtMon(f.date):''}<br>${esc(x.hq||'')}`};

/* ---------- company drawer ---------- */
const drawer=$('#drawer'),scrim=$('#scrim');let lastFocus=null;
function openDrawer(id,push=true){
  const x=byCo.get(id);if(!x)return;
  lastFocus=document.activeElement;S.company=id;if(push)writeURL();
  const f=x.fu,tags=(a,k)=>(a||[]).map(v=>k?`<button type="button" class="tag tagbtn" data-k="${k}" data-v="${esc(v)}">${esc(v)}</button>`:`<span class="tag s">${esc(v)}</span>`).join('');
  drawer.innerHTML=`<button type="button" class="x" aria-label="Close">✕</button>
    <span class="label">Company profile${isNew(x)?' · <span class="new">NEW</span>':''}</span>
    <h2 id="dr-name">${esc(x.company)}</h2>
    <p class="desc">${esc(x.description)||'No description yet.'}</p>
    <dl>
      <dt>Categories</dt><dd>${tags(x.category,'cat')}</dd>
      <dt>Subcategories</dt><dd>${tags(x.subcategory)||'—'}</dd>
      <dt>Customers</dt><dd>${tags(x.customer,'cust')||'—'}</dd>
      <dt>Phases</dt><dd><div class="phases">${PHASES.map(p=>`<span class="${(x.phases||[]).includes(p)?'on':''}">${esc(p==='Planning & Feasibility'?'Planning':p==='Preconstruction'?'Precon':p)}</span>`).join('')}</div></dd>
      <dt>Funding</dt><dd>${f.raw?esc(f.raw):'Not disclosed'}${f.usd&&!/^\$/.test(f.raw.split(',')[1]?.trim()||'')?`<br><span class="label">≈ ${fmtUSD(f.usd)} USD</span>`:''}</dd>
      <dt>Stage</dt><dd>${esc(f.stage)}</dd>
      <dt>Headquarters</dt><dd>${esc(x.hq)||'—'}</dd>
      <dt>Added</dt><dd>${esc(x.date_added)}</dd>
    </dl>
    <div class="links">${x.website?`<a class="btn primary" href="${esc(x.website)}" target="_blank" rel="noopener">Website ↗</a>`:''}${x.linkedin?`<a class="btn" href="${esc(x.linkedin)}" target="_blank" rel="noopener">LinkedIn ↗</a>`:''}</div>`;
  scrim.hidden=false;drawer.setAttribute('aria-hidden','false');requestAnimationFrame(()=>drawer.classList.add('open'));
  drawer.querySelector('.x').onclick=()=>closeDrawer();
  drawer.querySelectorAll('.tagbtn').forEach(b=>b.onclick=()=>{S[b.dataset.k]=b.dataset.v;const sel=b.dataset.k==='cat'?'#cat':'#cust';$(sel).value=b.dataset.v;closeDrawer(false);update();document.getElementById('directory').scrollIntoView({behavior:'smooth'})});
  setTimeout(()=>drawer.focus(),50);
}
function closeDrawer(restore=true){
  if(!drawer.classList.contains('open'))return;
  drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');scrim.hidden=true;S.company='';writeURL();
  if(restore&&lastFocus&&document.contains(lastFocus))lastFocus.focus({preventScroll:true});
}
scrim.onclick=()=>closeDrawer();
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&drawer.classList.contains('open'))closeDrawer();
  const el=e.target.closest&&e.target.closest('[data-co][role="button"]');
  if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openDrawer(el.dataset.co)}
  if(e.key==='Tab'&&drawer.classList.contains('open')){const f=[...drawer.querySelectorAll('button,a')];if(!f.length)return;
    if(e.shiftKey&&document.activeElement===f[0]){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&document.activeElement===f[f.length-1]){e.preventDefault();f[0].focus()}}
});
document.addEventListener('click',e=>{const el=e.target.closest('[data-co]');if(el&&!drawer.contains(el)){e.preventDefault();tip.hidden=true;openDrawer(el.dataset.co)}});
addEventListener('popstate',()=>{const p=new URLSearchParams(location.search).get('company');if(p&&p!==S.company)openDrawer(p,false);else if(!p)closeDrawer(false)});

/* ---------- Fig. 2 market map ---------- */
function mapFig(){
  const host=$('#mm');let shown=0;const on=new Set(D.filter(matchAll).map(x=>x.company));
  host.innerHTML=CATS.map(([c])=>{
    const xs=D.filter(x=>(x.category||[]).includes(c)).sort((a,b)=>a.company.localeCompare(b.company));
    if(!xs.length)return `<section class="mm-box empty" aria-label="${esc(c)}: no companies yet"><h3>${esc(c)}<b>0</b></h3><div class="none">No companies yet. <a href="#submit">Suggest one</a>.</div></section>`;
    return `<section class="mm-box" aria-label="${esc(c)}"><h3>${esc(c)}<b>${xs.length}</b></h3><div class="mm-tiles">${xs.map(x=>{const o=on.has(x.company);
      return `<button type="button" class="tile${isNew(x)?' new':''}${o?'':' off'}" data-co="${slug(x.company)}" title="${esc(x.company)} — open profile"><i aria-hidden="true">${esc(initials(x.company))}</i>${esc(x.company)}</button>`}).join('')}</div></section>`;
  }).join('');
  shown=on.size;
  $('#mm-count').textContent=shown===D.length?`${D.length} companies across ${new Set(D.flatMap(x=>x.category||[])).size} categories`:`${shown} of ${D.length} companies match the filters`;
}
$('#mm-png').onclick=async()=>{
  const btn=$('#mm-png');btn.disabled=true;btn.textContent='Preparing…';
  try{
    if(!window.htmlToImage)await new Promise((res,rej)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';sc.onload=res;sc.onerror=rej;document.head.appendChild(sc)});
    const bg=getComputedStyle(document.body).backgroundColor;
    const url=await htmlToImage.toPng($('#mm'),{pixelRatio:2,backgroundColor:bg,style:{padding:'24px'}});
    const a=document.createElement('a');a.href=url;a.download=`contech-landscape-map-${new Date().toISOString().slice(0,10)}.png`;a.click();
  }catch(err){alert('Could not create the image in this browser. Try a screenshot instead.')}
  btn.disabled=false;btn.textContent='Download as image';
};

/* ---------- Fig. 5 funding dot plot (pay-gap chart style) ---------- */
function fundingFig(){
  const host=$('#fd'),mode=$('#fd-plot').value,grp=$('#fd-group').value;
  const val=x=>mode==='usd'?x.fu.usd:(x.fu.date?+x.fu.date:null);
  const rows=D.filter(x=>val(x)!=null);
  const missing=D.length-rows.length;
  const key=x=>grp==='cat'?firstCat(x):grp==='stage'?x.fu.stage:region(x);
  const order=grp==='cat'?CATS.map(c=>c[0]):grp==='stage'?STAGES:REGIONS;
  const groups=order.map(g=>({g,xs:rows.filter(x=>key(x)===g).sort((a,b)=>val(b)-val(a))})).filter(o=>o.xs.length);
  const W=Math.max(320,host.clientWidth),narrow=W<760,L=narrow?118:250,R=narrow?16:30,top=50,rh=21,gh=30;
  const H=top+groups.reduce((s,o)=>s+gh+o.xs.length*rh,0)+10;
  const vs=rows.map(val),lo=Math.min(...vs),hi=Math.max(...vs);
  let sx,ticks,tl;
  if(mode==='usd'){const a=Math.log10(lo*.8),b=Math.log10(hi*1.15);sx=v=>L+(Math.log10(v)-a)/(b-a)*(W-L-R);
    ticks=[2.5e5,5e5,1e6,2e6,5e6,1e7,2e7,5e7,1e8].filter(t=>t>=lo*.8&&t<=hi*1.15);if(narrow)ticks=ticks.filter(t=>[1e6,1e7,1e8].includes(t));tl=fmtUSD}
  else{const a=new Date(new Date(lo).getFullYear(),0,1),b=new Date(new Date(hi).getFullYear()+1,0,1);sx=v=>L+(v-a)/(b-a)*(W-L-R);
    ticks=[];for(let y=a.getFullYear();y<=b.getFullYear();y++)ticks.push(+new Date(y,0,1));tl=v=>new Date(v).getFullYear()}
  let s=NS(W,H,'fd','Funding dot plot');
  ticks.forEach(t=>{const x=sx(t);s+=`<line class="grid" x1="${x}" x2="${x}" y1="${top-8}" y2="${H}"/><text x="${x}" y="${top-14}" text-anchor="middle">${tl(t)}</text>`});
  s+=`<text x="${L}" y="${top-34}">${mode==='usd'?'Latest round, USD →':'Date of latest round →'}</text>`;
  let y=top;
  groups.forEach(o=>{
    s+=`<line class="sep" x1="0" x2="${W}" y1="${y+4}" y2="${y+4}"/><text class="grp" x="${L-10}" y="${y+gh-8}" text-anchor="end">${esc(narrow&&grp==='cat'?shortCat(o.g):o.g)}</text>`;y+=gh;
    o.xs.forEach(x=>{const cx=sx(val(x)),cy=y+rh/2,on=matchAll(x);
      s+=`<text class="nm" x="${L-10}" y="${cy+4}" text-anchor="end">${esc(trunc(x.company,narrow?15:30))}</text>
      <g class="pt${on?'':' off'}" tabindex="0" role="button" data-co="${slug(x.company)}" data-tip="${esc(tipFor(x))}" aria-label="${esc(x.company)}: ${esc(x.fu.stage)}, ${mode==='usd'?fmtUSD(x.fu.usd):fmtMon(x.fu.date)}">
        <line class="stem" x1="${L}" x2="${cx}" y1="${cy}" y2="${cy}"/><circle cx="${cx}" cy="${cy}" r="6" fill="${STAGE_COLOR[x.fu.stage]}"/></g>`;
      y+=rh});
  });
  host.innerHTML=s+'</svg>';
  const used=STAGES.filter(st=>rows.some(x=>x.fu.stage===st));
  $('#fd-key').innerHTML=used.map(st=>`<span><i style="background:${STAGE_COLOR[st]}"></i>${esc(st)}</span>`).join('');
  $('#fd-note').textContent=`${missing} companies have no ${mode==='usd'?'disclosed amount':'dated round'} and are not shown.`;
}
$('#fd-plot').onchange=fundingFig;$('#fd-group').onchange=fundingFig;

/* ---------- Fig. 6 funding stairs (high-jump style) ---------- */
function stairsFig(){
  const host=$('#stairs-fig'),ST=['Pre-seed','Seed','Series A','Series B','Series C+'];
  const xs=D.filter(x=>x.fu.usd&&ST.includes(x.fu.stage));
  const st=ST.map(g=>({g,xs:xs.filter(x=>x.fu.stage===g).sort((a,b)=>a.fu.usd-b.fu.usd)})).filter(o=>o.xs.length);
  const W=Math.max(760,host.clientWidth),top=30,plotH=300,y0=top+plotH,nameH=120,H=y0+nameH,gapS=1.4;
  const slots=xs.length+gapS*(st.length-1),sw=(W-70)/slots;
  const lo=Math.min(...xs.map(x=>x.fu.usd))*.7,hi=Math.max(...xs.map(x=>x.fu.usd))*1.2,a=Math.log10(lo),b=Math.log10(hi);
  const sy=v=>y0-(Math.log10(v)-a)/(b-a)*plotH;
  let s=NS(W,H,'st','Funding stairs');
  [5e5,1e6,2e6,5e6,1e7,2e7,5e7].filter(t=>t>lo&&t<hi).forEach(t=>{s+=`<line class="grid" x1="0" x2="${W-60}" y1="${sy(t)}" y2="${sy(t)}"/><text x="${W-54}" y="${sy(t)+3}">${fmtUSD(t)}</text>`});
  let i=0;
  st.forEach((o,k)=>{
    const x0=i*sw,x1=(i+o.xs.length)*sw,vals=o.xs.map(x=>x.fu.usd),med=vals.length%2?vals[(vals.length-1)/2]:(vals[vals.length/2-1]+vals[vals.length/2])/2;
    s+=`<rect class="step" x="${x0}" y="${sy(med)}" width="${x1-x0}" height="${y0-sy(med)}"/>
      <text class="stg" x="${x0+4}" y="${sy(med)-22}">${esc(o.g)}</text><text x="${x0+4}" y="${sy(med)-8}">median ${fmtUSD(med)} · ${o.xs.length}</text>`;
    o.xs.forEach(x=>{const cx=i*sw+sw/2,cy=sy(x.fu.usd),on=matchAll(x);
      s+=`<g class="pole-g${on?'':' off'}" tabindex="0" role="button" data-co="${slug(x.company)}" data-tip="${esc(tipFor(x))}" aria-label="${esc(x.company)}: ${esc(o.g)}, ${fmtUSD(x.fu.usd)}">
        <rect x="${cx-sw/2}" y="${top}" width="${sw}" height="${H-top}" fill="transparent"/>
        <line class="pole" x1="${cx}" x2="${cx}" y1="${y0}" y2="${cy}"/><circle cx="${cx}" cy="${cy}" r="4"/>
        <text class="nm" transform="translate(${cx+3},${y0+8}) rotate(90)">${esc(x.company.length>17?x.company.slice(0,16)+'…':x.company)}</text></g>`;i++});
    i+=gapS;
  });
  s+=`<line x1="0" x2="${W-60}" y1="${y0}" y2="${y0}" stroke="var(--ink)" stroke-width="1.5"/>`;
  host.innerHTML=s+'</svg>';
  const other=D.length-xs.length;$('#st-note').textContent=`${other} companies are left out: no disclosed amount, a non-standard round, or acquired.`;
}

/* ---------- Fig. 7 week-by-week timeline (alert-chart style) ---------- */
const tlOn=new Set();let tlInit=false;
const monday=d=>{const t=new Date(d+'T00:00:00');const w=(t.getDay()+6)%7;t.setDate(t.getDate()-w);return t};
function timelineFig(){
  const host=$('#tl'),xs=D.filter(x=>x.date_added);
  const cats=CATS.map(c=>c[0]).filter(c=>xs.some(x=>mainCat(x)===c));
  if(!tlInit){cats.forEach(c=>tlOn.add(c));tlInit=true}
  $('#tl-tags').innerHTML=`<button type="button" class="all" data-a="all">All</button><button type="button" class="all" data-a="none">None</button>`+
    cats.map(c=>`<button type="button" style="--c:${catColor(c)}" aria-pressed="${tlOn.has(c)}" data-c="${esc(c)}">${esc(shortCat(c))}</button>`).join('');
  $('#tl-tags').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(b.dataset.a==='all')cats.forEach(c=>tlOn.add(c));else if(b.dataset.a==='none')tlOn.clear();else tlOn.has(b.dataset.c)?tlOn.delete(b.dataset.c):tlOn.add(b.dataset.c);timelineFig()});
  const regs=REGIONS.filter(r=>xs.some(x=>region(x)===r));
  const first=monday(xs.map(x=>x.date_added).sort()[0]),last=monday(xs.map(x=>x.date_added).sort().pop());
  const weeks=[];for(let t=new Date(first);t<=last;t.setDate(t.getDate()+7))weeks.push(new Date(t));
  const W=Math.max(640,host.clientWidth),L=78,top=34,cw=(W-L)/regs.length,gap=9,perLine=Math.max(4,Math.floor((cw-16)/gap));
  const cell=(w,r)=>xs.filter(x=>+monday(x.date_added)===+w&&region(x)===r).sort((a,b)=>CATS.findIndex(k=>k[0]===mainCat(a))-CATS.findIndex(k=>k[0]===mainCat(b))||a.company.localeCompare(b.company));
  const rowH=weeks.map(w=>Math.max(14,Math.max(...regs.map(r=>Math.ceil(cell(w,r).length/perLine)))*gap+6));
  const H=top+rowH.reduce((a,b)=>a+b,0)+16;
  let s=NS(W,H,'tl','Companies added per week by region');
  regs.forEach((r,j)=>{s+=`<text class="col" x="${L+j*cw+cw/2}" y="16" text-anchor="middle">${esc(r)}</text>`});
  s+=`<line class="axis" x1="${L-14}" x2="${L-14}" y1="${top}" y2="${H-8}"/>`;
  let y=top,prevMonth=-1;
  weeks.forEach((w,k)=>{
    const n=regs.reduce((a,r)=>a+cell(w,r).length,0);
    s+=`<line class="rule" x1="${L-10}" x2="${W}" y1="${y}" y2="${y}"/>`;
    if(n||w.getMonth()!==prevMonth){s+=`<text x="${L-20}" y="${y+11}" text-anchor="end">${w.toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</text>`;prevMonth=w.getMonth()}
    regs.forEach((r,j)=>{const cs=cell(w,r),cx0=L+j*cw+cw/2;
      cs.forEach((x,i)=>{const line=Math.floor(i/perLine),inLine=Math.min(perLine,cs.length-line*perLine),pos=i%perLine;
        const cx=cx0+(pos-(inLine-1)/2)*gap,cy=y+8+line*gap,c=mainCat(x),on=tlOn.has(c)&&matchAll(x);
        s+=`<g class="dotg${on?'':' off'}" tabindex="${on?0:-1}" role="button" data-co="${slug(x.company)}" data-tip="${esc(`<b>${esc(x.company)}</b>${esc(c)}<br>Added ${x.date_added} · ${esc(x.hq||'')}`)}" aria-label="${esc(x.company)}, added ${x.date_added}"><circle cx="${cx}" cy="${cy}" r="3.6" fill="${catColor(c)}"/></g>`})});
    y+=rowH[k];
  });
  host.innerHTML=s+'</svg>';
  $('#tl-note').textContent=`Colour shows each company's main category (the earliest in lifecycle order). ${weeks.length} weeks shown.`;
}

/* ---------- Fig. 8 geography & customers + downloads ---------- */
let custAll=false;
function geoFig(){
  const F=D.filter(matchAll);
  const cnt=(arr)=>{const m=new Map();arr.forEach(v=>v&&m.set(v,(m.get(v)||0)+1));return [...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))};
  const cs=cnt(F.map(country)),us=cnt(F.flatMap(x=>x.customer||[]));
  const bars=(list,sel,kind)=>{const mx=Math.max(1,...list.map(d=>d[1]));return list.map(([k,v])=>`<button type="button" class="hbar${sel===k?' sel':''}" data-kind="${kind}" data-v="${esc(k)}" aria-pressed="${sel===k}"><span>${esc(k)}</span><span class="t"><i style="width:${Math.round(v/mx*100)}%;max-width:calc(100% - 30px)"></i>${v}</span></button>`).join('')||'<p class="label">No companies match.</p>'};
  $('#geo-c').innerHTML=bars(cs,S.q,'country');
  const shownU=custAll?us:us.slice(0,12);
  $('#geo-u').innerHTML=bars(shownU,S.cust,'cust')+(us.length>12?`<button type="button" class="clear label" id="u-more" style="margin-top:8px;align-self:flex-start">${custAll?'Show fewer':'Show all '+us.length}</button>`:'');
  $('#u-more')&&($('#u-more').onclick=()=>{custAll=!custAll;geoFig()});
  document.querySelectorAll('.hbar').forEach(b=>b.onclick=()=>{const v=b.dataset.v;
    if(b.dataset.kind==='country'){S.q=S.q===v?'':v;$('#q').value=S.q}else{S.cust=S.cust===v?'':v;$('#cust').value=S.cust}update()});
  $('#dl-count').textContent=F.length===D.length?`All ${D.length} companies`:`${F.length} filtered companies`;
}
const COLS=['company','description','category','subcategory','customer','phases','funding','hq','website','linkedin','date_added'];
function dl(name,type,text){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
const stamp=()=>`contech-landscape-${new Date().toISOString().slice(0,10)}${D.filter(matchAll).length===D.length?'':'-filtered'}`;
$('#dl-csv').onclick=()=>{const q=v=>{v=Array.isArray(v)?v.join('; '):String(v??'');return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  dl(stamp()+'.csv','text/csv',[COLS.join(','),...D.filter(matchAll).map(x=>COLS.map(c=>q(x[c])).join(','))].join('\n')+'\n')};
$('#dl-json').onclick=()=>dl(stamp()+'.json','application/json',JSON.stringify(D.filter(matchAll).map(x=>Object.fromEntries(COLS.map(c=>[c,x[c]]))),null,2));

/* ---------- wiring ---------- */
function all(){mapFig();fundingFig();stairsFig();timelineFig();geoFig()}
window.vizInit=function(){if(ready||!D.length)return;ready=true;
  D.forEach(x=>{x.fu=parseFunding(x.funding);byCo.set(slug(x.company),x)});
  all();if(S.company)openDrawer(S.company,false);};
window.vizUpdate=function(){if(ready){mapFig();fundingFig();stairsFig();timelineFig();geoFig()}};
window.vizResize=function(){if(ready){fundingFig();stairsFig();timelineFig()}};
window.parseFunding=parseFunding;
if(typeof D!=='undefined'&&D.length)window.vizInit();
})();
