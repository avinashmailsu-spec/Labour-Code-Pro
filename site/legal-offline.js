/* LabourCode Pro 1.0 — Complete offline legal library.
 * Original 287-page Gazette PDFs are stored byte-for-byte as APK assets.
 * This optional searchable transcription does not alter or supersede the PDFs.
 * Developed by Avinash Ekka.
 */
'use strict';

const LEGAL_META = {
  wages: {name:'Code on Wages, 2019',act:'29 of 2019',pages:29,sections:69,icon:'₹',color:'#0f998d'},
  industrial: {name:'Industrial Relations Code, 2020',act:'35 of 2020',pages:56,sections:104,icon:'IR',color:'#8972e7'},
  security: {name:'Code on Social Security, 2020',act:'36 of 2020',pages:116,sections:164,icon:'SS',color:'#d6953a'},
  osh: {name:'Occupational Safety, Health and Working Conditions Code, 2020',act:'37 of 2020',pages:86,sections:143,icon:'OSH',color:'#d66a80'}
};
const legalCache = Object.create(null);
const legalLoading = Object.create(null);
view.statutePage=1;
view.statuteQuery='';
view.libraryQuery='';
view.legalToc='chapters';
titles.statute='Full-text Statute Reader';

async function loadLegalCode(code) {
  if (legalCache[code]) return legalCache[code];
  if (legalLoading[code]) return legalLoading[code];
  legalLoading[code] = fetch('assets/legal/'+code+'.json', {cache:'force-cache'})
    .then(resp => {if (!resp.ok) throw Error('The complete indexed statute is missing.');return resp.json()})
    .then(doc => {
      if (!doc || !Array.isArray(doc.pages) || doc.pages.length !== LEGAL_META[code].pages ||
          doc.sections.length !== LEGAL_META[code].sections) {
        throw Error('The locally bundled statute index failed its completeness check.');
      }
      legalCache[code]=doc;
      return doc;
    })
    .finally(() => {delete legalLoading[code]});
  return legalLoading[code];
}
function lawEscapeRegExp(t){return t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function lawHighlight(text, query){
  const safe=esc(text);
  if (!query || query.length<2) return safe;
  const q=esc(query).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  try{return safe.replace(new RegExp('('+q+')','gi'),'<mark class="legal-hit">$1</mark>')}catch{return safe}
}
function codeSearch(doc,q,max=30){
  q=String(q||'').trim().toLocaleLowerCase('en');
  if(q.length<2) return [];
  const results=[];
  for(let i=0;i<doc.pages.length;i++) {
    const page=doc.pages[i],lower=page.toLocaleLowerCase('en');
    const pos=lower.indexOf(q);
    if(pos===-1)continue;
    const prefix=pos>100?'…':'';
    const suffix=pos+140<page.length?'…':'';
    const snippet=prefix+page.slice(Math.max(0,pos-90),Math.min(page.length,pos+q.length+140)).replace(/\s+/g,' ').trim()+suffix;
    let count=0,at=0;
    while((at=lower.indexOf(q,at))>=0){count++;at+=q.length;if(count>99)break}
    results.push({page:i+1,snippet,count});
    if (results.length>=max)break;
  }
  return results;
}
function legalPageTerms(code,text){
  const lower=text.toLocaleLowerCase('en');
  return D.glossary.filter(t=>(t.code===code||t.code==='all') && lower.includes(t.term.toLocaleLowerCase('en'))).slice(0,11);
}
function openNativeAct(code,page=1){
  if(window.AndroidBridge && typeof AndroidBridge.openActAtPage==='function'){
    AndroidBridge.openActAtPage(code,Number(page));return;
  }
  if(window.AndroidBridge){AndroidBridge.openAct(code);return;}
  window.open('assets/acts/'+code+'.pdf#page='+Number(page),'_blank','noopener,noreferrer');
}
function jumpLegal(code,page=1){
  if(!LEGAL_META[code])return;
  view.route='statute';view.code=code;
  view.statutePage=Math.min(LEGAL_META[code].pages,Math.max(1,parseInt(page)||1));
  window.scrollTo(0,0);render();
  loadLegalCode(code).then(()=>{if(view.route==='statute'&&view.code===code)render()}).catch(e=>toast(e.message));
}
function legalSearchPanel(code,doc){
  const q=view.statuteQuery.trim();
  if(!q)return `<div class="legal-search-empty">Search a word or phrase in all ${doc.pages.length} pages, including the schedules. Results will link to the original Gazette page.</div>`;
  if(q.length<2)return `<div class="legal-search-empty">Enter at least two characters to search.</div>`;
  const results=codeSearch(doc,q,60);
  return `<div class="legal-result-heading">${results.length} matching pages${results.length===60?' (first 60 shown)':''}</div>`+
    (results.map(r=>`<button class="legal-result" data-legal="page" data-page="${r.page}" aria-label="Read PDF page ${r.page}"><span class="legal-result-page">PAGE ${r.page}</span><span class="legal-result-snippet">${lawHighlight(r.snippet,q)}</span><span class="legal-result-count">${r.count} match${r.count===1?'':'es'}</span></button>`).join('')||'<div class="legal-search-empty">No matches in this Code. Try a shorter term.</div>');
}
function renderFullActs(){
  const keys=Object.keys(LEGAL_META),available=keys.filter(id=>actStatus[id]?.verifiedAgainstAttachment||actStatus[id]?.bundled).length;
  const q=(view.libraryQuery||'').trim();
  let all=[];if(q.length>=2){for(const id of keys){if(legalCache[id])all.push(...codeSearch(legalCache[id],q,8).map(r=>({...r,code:id})))}}
  return `<div class="legal-hero"><div class="legal-hero-shine"></div><div class="legal-hero-text"><div class="legal-eyebrow">COMPLETE · ORIGINAL · OFFLINE</div><h1>Every provision.<br><span>Every schedule.</span></h1><p>The complete Gazette text of all four Indian Labour Codes is installed with the app—never redirected to an external website. Search, read and study every published page.</p><div class="legal-proof-row"><span>4 complete Codes</span><span>287 original pages</span><span>480 indexed sections</span></div></div><div class="legal-hero-icon" aria-hidden="true">§<small>LEGISLATION</small></div></div>
  <div class="legal-library-banner"><span class="legal-status-light"></span><div><strong>${available}/4 full statutory PDFs embedded</strong><small>From the four attached Gazette documents; exact SHA-256 integrity checked on device</small></div><span class="legal-chip">OFFLINE ACCESS</span></div>
  <div class="legal-intro"><h2>Complete Code library</h2><p>Choose a law to open its searchable page-by-page reading view or see the unaltered original Gazette PDF.</p></div>
  <div class="legal-code-grid">${keys.map(code=>{
    const m=LEGAL_META[code],active=actStatus[code]?.verifiedAgainstAttachment||actStatus[code]?.bundled;
    return `<article class="legal-code-card" style="--code-color:${m.color}"><img src="assets/editorial_${code}.webp" alt="${att(m.name)} visual" loading="lazy"/><div class="legal-code-inner"><div class="legal-code-top"><span>ACT ${m.act}</span><b>${m.icon}</b></div><h3>${esc(m.name)}</h3><p>${m.pages} original PDF pages · ${m.sections} fully indexed sections · chapters and schedules included.</p><div class="legal-code-actions"><button class="legal-main-button" data-legal="read" data-code="${code}">Read complete text ${icon('arrow')}</button><button class="legal-sub-button" data-legal="pdf" data-code="${code}" data-page="1">Original PDF</button></div><div class="legal-integrity">${active?'✓ Document packaged and hash verified':'Bundled verification pending on device'}</div></div></article>`}).join('')}</div>
  <section class="legal-search-all"><div class="legal-intro"><h2>Search the entire legislation</h2><p>Look across the original wording of all four Codes—chapter text, sections, definitions and schedules.</p></div><label class="legal-field-label" for="library-search">Phrase or legal term</label><div class="legal-search-shell">${icon('search',22)}<input id="library-search" type="search" autocomplete="off" placeholder="For example: fixed term employment, provident fund, minimum wages…" value="${att(view.libraryQuery)}"/></div><div id="library-results">${q.length>=2?all.map(r=>`<button class="legal-result" data-legal="read-page" data-code="${r.code}" data-page="${r.page}"><b>${esc(LEGAL_META[r.code].name)}</b><span class="legal-result-page">PAGE ${r.page}</span><span class="legal-result-snippet">${lawHighlight(r.snippet,q)}</span></button>`).join('')||'<span class="legal-search-empty">Searching local text indexes…</span>':'<span class="legal-search-empty">Search works offline. No sign-in or internet is required.</span>'}</div></section>
  <div class="legal-source-note"><strong>Important legal distinction</strong><p>The bundled originals reproduce the four uploaded enacted Codes, including schedules. Later amendments, commencement notifications, rules and jurisdictional variations are separate sources and are not automatically incorporated into these original PDFs. Illustrated examples are educational, not statutory wording.</p></div><p class="legal-footer-credit">Developed by <strong>Avinash Ekka</strong></p>`;
}
function renderActReader(){
  const code=LEGAL_META[view.code]?view.code:'wages',m=LEGAL_META[code],doc=legalCache[code];
  return `<div class="legal-intro"><button class="btn ghost small" data-go="fullacts">${icon('back')} Complete law library</button><div class="legal-eyebrow">PRIMARY LEGAL TEXT · ACT ${m.act}</div><h1 class="heading">${esc(m.name)}</h1><p>Full original Gazette Act with ${m.sections} sections, including its applicable schedules. Both PDF and searchable text are stored on your device.</p></div><div class="legal-reader-actions"><button class="btn" data-legal="read" data-code="${code}">Open searchable statute ${icon('arrow')}</button><button class="btn secondary" data-legal="pdf" data-code="${code}" data-page="1">View original  ${m.pages}-page PDF</button><button class="btn ghost" data-go="module" data-code="${code}">Learning lessons & examples</button></div><div class="legal-detail-hero"><img src="assets/editorial_${code}.webp" alt="${att(m.name)}"/><div><div class="legal-eyebrow">READ WITHOUT INTERNET</div><h2>Move between the exact text and plain-language learning.</h2><p>Discover chapter and section locations, search page text, explore definitions, and open the original PDF at the corresponding page. Tables and complex layouts remain preserved in the PDF.</p><div class="legal-proof-row"><span>${m.pages} pages</span><span>${m.sections} sections</span><span>100% offline</span></div></div></div>${renderReaderAside(code,C[code],C[code].cases.slice(0,3))}`;
}
function renderStatute(){
  const code=LEGAL_META[view.code]?view.code:'wages',m=LEGAL_META[code],doc=legalCache[code];
  if(!doc){loadLegalCode(code).then(()=>{if(view.route==='statute'&&view.code===code)render()}).catch(e=>toast(e.message));return `<div class="legal-loading"><div class="spinner"></div><h2>Opening ${esc(m.name)}…</h2><p>Loading the complete locally stored text index.</p></div>`}
  const page=(Number(view.statutePage)||1).toFixed(0)*1;
  view.statutePage=Math.max(1,Math.min(doc.pages.length,page));
  const n=view.statutePage,text=doc.pages[n-1],terms=legalPageTerms(code,text);
  const section=doc.sections.filter(s=>s.page===n);
  const chapter=doc.chapters.filter(ch=>ch.page<=n).at(-1);
  const schedule=doc.schedules.filter(s=>s.page<=n).at(-1);
  const current=section.length?section.map(s=>'§ '+s.number).join(' · '):(chapter?'Chapter '+chapter.number:'Gazette text');
  const q=view.statuteQuery.trim();
  return `<div class="legal-reader-head"><button class="btn ghost small" data-go="fullacts">${icon('back')} Library</button><span class="legal-chip">ORIGINAL ACT ${m.act}</span><span class="legal-chip">OFFLINE · ${m.pages} PAGES</span><h1>${esc(m.name)}</h1><p>Read the extracted statutory text for convenience, or view the unmodified original PDF for exact layout and tables.</p></div>
  <div class="legal-reading-grid"><section class="legal-primary-column"><div class="legal-reader-toolbar"><div><strong>Gazette page ${n} of ${m.pages}</strong><small>${esc(current)}${chapter?' · '+esc(chapter.title):''}</small></div><button class="btn secondary" data-legal="pdf" data-code="${code}" data-page="${n}">Open original page ${icon('arrow')}</button></div>
  <div class="legal-page-paper"><div class="legal-page-brand"><span>THE GAZETTE OF INDIA · PRIMARY DOCUMENT</span><span>${n} / ${m.pages}</span></div><div class="legal-page-content">${lawHighlight(text,q)}</div><div class="legal-page-foot">Complete original PDF preserved separately · Layout of extracted searchable text may differ</div></div>
  ${terms.length?`<div class="legal-terms-strip"><h3>Legal terms on this page</h3><p>Tap to view explanations and workplace examples.</p><div>${terms.map(t=>`<button data-action="term" data-term="${att(t.term)}">${esc(t.term)} ${icon('arrow',14)}</button>`).join('')}</div></div>`:''}
  <div class="legal-page-navigation"><button data-legal="page" data-page="${n-1}" ${n===1?'disabled':''}>${icon('back')} Previous page</button><label>Page <input id="statute-page-input" type="number" inputmode="numeric" min="1" max="${m.pages}" value="${n}"> of ${m.pages}</label><button data-legal="jump-page">Go</button><button data-legal="page" data-page="${n+1}" ${n===m.pages?'disabled':''}>Next page ${icon('arrow')}</button></div></section>
  <aside class="legal-toc-column"><div class="legal-lookup-card"><div class="legal-eyebrow">FULL-TEXT SEARCH</div><label for="statute-search" class="legal-field-label">Search this entire Code</label><div class="legal-search-shell">${icon('search',20)}<input type="search" id="statute-search" autocomplete="off" placeholder="Search all ${m.pages} pages…" value="${att(q)}"></div><div id="statute-results" class="legal-search-results">${legalSearchPanel(code,doc)}</div></div>
  <div class="legal-lookup-card"><div class="legal-eyebrow">STATUTORY NAVIGATION</div><h3>Jump to any provision</h3><label for="statute-sections" class="legal-field-label">All ${m.sections} sections</label><select id="statute-sections"><option value="">Choose a section…</option>${doc.sections.map(s=>`<option value="${s.page}">§ ${s.number} · Page ${s.page} · ${att(short(s.preview,45))}</option>`).join('')}</select><button class="legal-main-button" data-legal="section-picker">Open selected section ${icon('arrow')}</button><details class="legal-toc-details" open><summary>Chapters (${doc.chapters.length})</summary><div>${doc.chapters.map(ch=>`<button data-legal="page" data-page="${ch.page}"><b>CHAPTER ${esc(ch.number)}</b><span>${esc(ch.title)}</span><small>p. ${ch.page}</small></button>`).join('')}</div></details>${doc.schedules.length?`<details class="legal-toc-details"><summary>Schedules (${doc.schedules.length})</summary><div>${doc.schedules.map(sc=>`<button data-legal="page" data-page="${sc.page}"><b>${esc(sc.title)}</b><small>p. ${sc.page}</small></button>`).join('')}</div></details>`:''}</div>
  <div class="legal-note-card"><strong>Learning companion</strong><p>Understand complex provisions through the guided lessons, examples and practical case studies. The statutory wording above is reproduced from the attached Code—not AI-generated.</p><button class="btn secondary" data-go="module" data-code="${code}">Open all lessons ${icon('arrow')}</button><div class="legal-page-cases"><h4>Practical workplace illustrations</h4><small>General examples for this Code; not interpretations of the page shown</small>${C[code].cases.slice(0,3).map((v,i)=>`<button data-action="case" data-code="${code}" data-index="${i}"><strong>${esc(v.title)}</strong><span>${esc(short(v.situation,135))}</span></button>`).join('')}</div></div></aside></div>
  <div class="legal-source-note"><strong>About this transcription</strong><p>Text extraction supports offline search, but column flow, line breaks and schedules may display differently than the Gazette. Use “Open original page” for the exact, unchanged PDF. This is the enacted text in the supplied attachment, not a continuously updated or amended consolidation.</p></div>`;
}
const previousLegalRenderView=renderView;
renderView=function(){return view.route==='statute'?renderStatute():previousLegalRenderView()};
const previousLegalHome=renderHome;
renderHome=function(){
  const html=previousLegalHome();
  return html.replace('Offline reference and learning','Four complete Gazette Acts offline')
             .replace('Original Acts can be embedded in a complete release or added through the device document picker.','All four full original Acts are embedded in this application and are available without links or downloads.');
};
const previousLegalSearch=renderSearch;
renderSearch=function(){return `<div class="legal-search-announcement"><div><strong>Search the full legal text—not just summaries</strong><p>Find wording across all 480 sections and 287 pages of the four Acts, entirely offline.</p></div><button class="btn secondary" data-go="fullacts">Full Acts search ${icon('arrow')}</button></div>`+previousLegalSearch()};

app.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-legal]');if(!el)return;
  ev.preventDefault();ev.stopImmediatePropagation();
  const action=el.dataset.legal;
  const code=el.dataset.code || view.code;
  if(action==='read')jumpLegal(code,1);
  else if(action==='read-page')jumpLegal(code,Number(el.dataset.page)||1);
  else if(action==='page') {view.statutePage=Math.min(LEGAL_META[view.code].pages,Math.max(1,Number(el.dataset.page)||1));render();window.scrollTo(0,0)}
  else if(action==='pdf')openNativeAct(code,el.dataset.page||1);
  else if(action==='jump-page'){
    const requested=document.getElementById('statute-page-input')?.value;
    if(!requested || !Number.isFinite(Number(requested)))toast('Enter a valid page number');else {view.statutePage=Math.min(LEGAL_META[view.code].pages,Math.max(1,Number(requested)));render()}
  } else if(action==='section-picker'){
    const v=document.getElementById('statute-sections')?.value;
    if(v){view.statutePage=Number(v);render();window.scrollTo(0,0)}else toast('Choose a section first');
  }
},true);
app.addEventListener('input',ev=>{
  if(ev.target.id==='statute-search'){
    view.statuteQuery=ev.target.value;
    const el=document.getElementById('statute-results');
    if(el && legalCache[view.code])el.innerHTML=legalSearchPanel(view.code,legalCache[view.code]);
  }
  if(ev.target.id==='library-search'){
    view.libraryQuery=ev.target.value;
    const q=view.libraryQuery.trim();const target=document.getElementById('library-results');
    if(!target)return;
    if(q.length<2){target.innerHTML='<span class="legal-search-empty">Type at least two characters.</span>';return}
    target.innerHTML='<span class="legal-search-empty">Searching all four embedded Codes…</span>';
    Promise.all(Object.keys(LEGAL_META).map(loadLegalCode)).then(()=>{
      if(view.route!=='fullacts')return;
      const answers=Object.keys(LEGAL_META).flatMap(code=>codeSearch(legalCache[code],view.libraryQuery,12).map(r=>({...r,code})));
      const box=document.getElementById('library-results');
      if(box)box.innerHTML=answers.map(r=>`<button class="legal-result" data-legal="read-page" data-code="${r.code}" data-page="${r.page}"><b>${esc(LEGAL_META[r.code].name)}</b><span class="legal-result-page">PAGE ${r.page}</span><span class="legal-result-snippet">${lawHighlight(r.snippet,view.libraryQuery)}</span></button>`).join('')||'<div class="legal-search-empty">No matching pages found.</div>';
    }).catch(err=>toast(err.message));
  }
},true);
app.addEventListener('keydown',ev=>{
  if(ev.target.id==='statute-page-input' && ev.key==='Enter'){
    ev.preventDefault();app.querySelector('[data-legal="jump-page"]')?.click();
  }
},true);

// Render the first complete-offline dashboard with the full index routes installed.
start();
