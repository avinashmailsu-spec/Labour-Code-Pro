/* LabourCode Pro 5.1 — Accessible full-document reading controls.
   Gazette PDFs are the authoritative source. Reflowed text is a convenience transcription.
   No network calls and no redirection to external legal sites.
   Developed by Avinash Ekka. */
'use strict';
const readerPrefsKey='labourcodepro.readerv51';
let readerPrefs={mode:'page',theme:'paper',font:19,bookmarks:{}};
try{
  const stored=JSON.parse(window.localStorage.getItem(readerPrefsKey)||'{}');
  if(['page','chapter','whole'].includes(stored.mode))readerPrefs.mode=stored.mode;
  if(['paper','sepia','night'].includes(stored.theme))readerPrefs.theme=stored.theme;
  if(Number.isFinite(stored.font))readerPrefs.font=Math.max(16,Math.min(27,stored.font));
  if(stored.bookmarks&&typeof stored.bookmarks==='object')readerPrefs.bookmarks=stored.bookmarks;
}catch(_){/* Private browsing or corrupted local preference; use accessible defaults */}
function readerSave(){try{window.localStorage.setItem(readerPrefsKey,JSON.stringify(readerPrefs))}catch(_){}}
function readerCodePages(doc,code){
  let first=Number(view.statutePage)||1,last=first;
  if(readerPrefs.mode==='whole'){first=1;last=doc.pages.length;}
  if(readerPrefs.mode==='chapter'){
    const candidates=doc.chapters.filter(x=>Number(x.page)<=Number(view.statutePage));
    const selected=candidates[candidates.length-1];
    if(selected){
      first=Number(selected.page);
      const following=doc.chapters.find(x=>Number(x.page)>first);
      last=following?Number(following.page)-1:doc.pages.length;
    }
  }
  return {first,last};
}
function readerTools(code,n){
  const last=readerPrefs.bookmarks[code];
  const toggle=(type,value,label)=>`<button type="button" class="reader-pill ${readerPrefs[type]===value?'is-active':''}" data-reader="${type}" data-value="${value}" aria-pressed="${readerPrefs[type]===value}">${label}</button>`;
  return `<section class="reader-accessibility-toolbar" aria-label="Complete statute reading preferences">
      <div class="reader-toolbar-top"><div class="reader-toolbar-label"><span aria-hidden="true">Aa</span><div><strong>Comfort reading</strong><small>Selectable text • offline • all pages included</small></div></div><div class="reader-size-buttons"><button data-reader="smaller" aria-label="Decrease reading font size">A−</button><output aria-label="Reading font size">${readerPrefs.font}px</output><button data-reader="larger" aria-label="Increase reading font size">A+</button></div></div>
      <div class="reader-setting-row"><span>Show</span><div class="reader-setting-pills">${toggle('mode','page','One page')}${toggle('mode','chapter','Chapter')}${toggle('mode','whole','Entire Act')}</div></div>
      <div class="reader-setting-row"><span>Paper</span><div class="reader-setting-pills">${toggle('theme','paper','White')}${toggle('theme','sepia','Warm')}${toggle('theme','night','Dark')}</div></div>
      <div class="reader-bookmark-row"><button data-reader="bookmark" data-code="${code}" class="reader-bookmark">☆ Save page ${n}</button>${last?`<button data-reader="resume" data-code="${code}" class="reader-bookmark reader-bookmark-resume">↗ Resume saved page ${last}</button>`:''}</div>
    </section>`;
}
const priorFullActRenderer=renderFullActs;
renderFullActs=function(){
  let html=priorFullActRenderer();
  const bookmarkInfo=Object.entries(readerPrefs.bookmarks)
    .filter(([code,page])=>LEGAL_META[code]&&Number.isInteger(page)&&page>0)
    .map(([code,page])=>`<button data-reader="resume" data-code="${code}" class="reader-resume-card"><b>${esc(LEGAL_META[code].name)}</b><small>Resume at page ${page} →</small></button>`).join('');
  if(bookmarkInfo)html=html.replace('<div class="legal-intro"><h2>Complete Code library</h2>',`<div class="reader-continue"><strong>Continue reading</strong><div>${bookmarkInfo}</div></div><div class="legal-intro"><h2>Complete Code library</h2>`);
  return html;
};
const priorStatuteRenderer=renderStatute;
renderStatute=function(){
  let html=priorStatuteRenderer();
  const code=LEGAL_META[view.code]?view.code:'wages';
  const doc=legalCache[code];
  if(!doc||!html.includes('legal-page-content'))return html;
  const current=Number(view.statutePage)||1;
  const tools=readerTools(code,current);
  html=html.replace('<div class="legal-reading-grid">',tools+'<div class="legal-reading-grid">');
  const begin=html.indexOf('<div class="legal-page-content">');
  const end=html.indexOf('</div><div class="legal-page-foot">',begin);
  if(begin<0||end<0)return html;
  const {first,last}=readerCodePages(doc,code);
  const query=view.statuteQuery.trim();
  const full=readerPrefs.mode!=='page';
  const pages=[];
  for(let page=first;page<=last;page++){
    const body=lawHighlight(doc.pages[page-1],query);
    pages.push(full?`<article class="reader-page-fragment" id="gazette-${page}"><div class="reader-fragment-label"><span>Gazette page ${page} / ${doc.pages.length}</span><button data-legal="pdf" data-code="${code}" data-page="${page}" aria-label="Open original Gazette PDF at page ${page}">Original PDF page ↗</button></div><div>${body}</div></article>`:body);
  }
  const currentStart=html.slice(0,begin);
  const tail=html.slice(end+6); // retain the existing legal-page-foot element
  html=currentStart+`<div class="legal-page-content reader-reflow-${readerPrefs.mode}" style="font-size:${readerPrefs.font}px">${pages.join('')}</div>`+tail;
  html=html.replace('<div class="legal-page-paper">',`<div class="legal-page-paper reader-theme-${readerPrefs.theme}">`);
  if(full){
    html=html.replace(`Gazette page ${current} of ${doc.pages.length}`,`${readerPrefs.mode==='whole'?'Entire Code':'Chapter'} · Pages ${first}–${last} of ${doc.pages.length}`);
  }
  return html;
};
app.addEventListener('click',function(evt){
  const target=evt.target.closest('[data-reader]');
  if(!target)return;
  evt.preventDefault();evt.stopImmediatePropagation();
  const action=target.dataset.reader,code=target.dataset.code||view.code,value=target.dataset.value;
  if(action==='mode'&&['page','chapter','whole'].includes(value))readerPrefs.mode=value;
  else if(action==='theme'&&['paper','sepia','night'].includes(value))readerPrefs.theme=value;
  else if(action==='larger')readerPrefs.font=Math.min(27,readerPrefs.font+2);
  else if(action==='smaller')readerPrefs.font=Math.max(16,readerPrefs.font-2);
  else if(action==='bookmark'){readerPrefs.bookmarks[code]=Number(view.statutePage)||1;toast(`Gazette page ${readerPrefs.bookmarks[code]} saved for later reading`)}
  else if(action==='resume'){
    if(!LEGAL_META[code])return;
    const page=Number(readerPrefs.bookmarks[code]);
    if(page>=1 && page<=LEGAL_META[code].pages){
      readerPrefs.mode='page';readerSave();jumpLegal(code,page);return;
    }
  }
  readerSave();
  if(view.route==='statute'||view.route==='fullacts')render();
},true);
