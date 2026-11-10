/* LabourCode Pro 1.0 — Reading Studio, daily learning path and enhanced accessibility.
   Authoritative source text and four original Gazette PDFs remain unchanged.
   Developed by Avinash Ekka. All new core experiences work without internet. */
'use strict';
const V7_KEY='labourcodepro.reading-studio.v7';
const V7_CODES=['wages','industrial','security','osh'];
const V7_STUDY_STEPS=['read','explain','quiz'];
const V7_PREF_DEFAULT={lineHeight:1.9,width:'comfortable',focus:false,terms:true,reduceMotion:false,compact:false,optionsOpen:false,history:{},today:{},lastOpened:'wages'};
let v7prefs={...V7_PREF_DEFAULT};
try {
 const s=JSON.parse(localStorage.getItem(V7_KEY)||'{}');
 if(s && typeof s==='object')v7prefs={...V7_PREF_DEFAULT,...s};
}catch(_){/* Graceful fallback to the default comfortable reader. */}
function v7Persist(){try{localStorage.setItem(V7_KEY,JSON.stringify(v7prefs))}catch(_){} }
function v7Date(){return new Date().toLocaleDateString('en-CA');}
function v7ProgressFor(code){let c=C[code];return c&&c.lessons.length?Math.round(completedFor(code)/c.lessons.length*100):0}
function v7PercentDone(){return Math.min(100,Math.max(0,percentDone()))}
function v7TodayRecord(){const today=v7Date();if(!v7prefs.today||v7prefs.today.date!==today)v7prefs.today={date:today,code:'wages',read:false,term:false,quiz:false,choice:null,checked:false,reflected:false,confidence:0};return v7prefs.today}
function v7TodayQuestions(code){const pool=D.questions.filter(q=>q.code===code && Array.isArray(q.options) && q.options.length===4 && Number.isInteger(q.answer));const seed=Number(v7Date().replace(/\D/g,''));return pool.length?pool[(seed+V7_CODES.indexOf(code)*7)%pool.length]:null}
function v7RenderToday(){
 const x=v7TodayRecord();const tasks=[x.read,x.term,x.quiz].filter(Boolean).length;const q=v7TodayQuestions(x.code);const codeName=LEGAL_META[x.code]?.name||'Code on Wages, 2019';
 return `<section class="v7-study-header"><span class="v7-kicker">PERSONAL LEARNING PATH · FULLY OFFLINE</span><h1>Learn one useful thing today.</h1><p>Three small actions: read an original provision, understand a legal term and answer one question. No streak pressure, no external account.</p><div class="v7-daily-meter"><div class="v7-track"><span style="width:${Math.round(tasks/3*100)}%"></span></div><strong>${tasks} of 3 complete</strong></div></section>
 <section class="v7-study-panel"><div class="v7-study-intro"><div><span class="v7-kicker">CHOOSE YOUR CODE</span><h2>Today's subject</h2></div><span class="v7-time-pill">About 5 minutes</span></div><div class="v7-code-chips" role="group" aria-label="Choose a Labour Code">${V7_CODES.map((id,i)=>`<button class="${x.code===id?'selected':''}" data-v7="code" data-code="${id}" aria-pressed="${x.code===id}">${['Wages','Industrial relations','Social security','Workplace safety'][i]}</button>`).join('')}</div>
 <div class="v7-step-list"><article class="v7-task ${x.read?'done':''}"><span class="v7-step-number">${x.read?'✓':'1'}</span><div><h3>Read the original wording</h3><p>Open ${esc(codeName)} and inspect the actual enacted text—not only a summary.</p><div class="v7-task-actions"><button data-v7="read" data-code="${x.code}" class="v7-small-primary">Open full Act</button>${x.read?'<span class="v7-completed">Marked as read</span>':'<button data-v7="mark-read">Mark as read</button>'}</div></div></article>
 <article class="v7-task ${x.term?'done':''}"><span class="v7-step-number">${x.term?'✓':'2'}</span><div><h3>Understand a legal term</h3><p>Try a clear definition, workplace illustration and links to the source Code.</p><div class="v7-task-actions"><button data-v7="term" data-term="${x.code==='wages'?'wages':x.code==='industrial'?'fixed-term employment':x.code==='security'?'social security':'contract labour'}" class="v7-small-primary">Explain term</button>${x.term?'<span class="v7-completed">Explored</span>':'<button data-v7="mark-term">Mark as explored</button>'}</div></div></article>
 <article class="v7-task ${x.quiz?'done':''}"><span class="v7-step-number">${x.quiz?'✓':'3'}</span><div><h3>Apply what you learned</h3>${q?`<p class="v7-question">${esc(q.question)}</p><div class="v7-answer-grid" role="radiogroup" aria-label="Daily knowledge question">${q.options.map((a,i)=>`<button role="radio" aria-checked="${x.choice===i}" class="v7-answer ${x.choice===i?'selected':''} ${x.checked&&i===q.answer?'correct':''} ${x.checked&&i===x.choice&&i!==q.answer?'incorrect':''}" data-v7="answer" data-choice="${i}" ${x.checked?'disabled':''}><b>${'ABCD'[i]}</b><span>${esc(a)}</span></button>`).join('')}</div>${x.checked?`<div class="v7-feedback" role="status"><b>${x.choice===q.answer?'Correct — well done.':'Review the best answer.'}</b><p>${esc(q.explanation)}</p><small>Educational reference: ${esc(q.reference||codeName)}. Verify applicable rules and exceptions.</small></div>`:`<button class="v7-check-answer" data-v7="check-answer" ${x.choice===null?'disabled':''}>Check my answer</button>`}`:'<p>A verified assessment question could not be loaded for this Code.</p>'}</div></article></div>
 ${tasks===3?`<div class="v7-win-panel" role="status"><span>✦</span><div><h2>Today's learning complete</h2><p>You read the law, explored a term and tested your knowledge. Your daily progress stays on this device.</p><button class="v7-small-primary" data-go="academy">See learning analytics</button></div></div>`:''}</section>
 <section class="v7-safety-note"><b>Learn with context</b><p>Examples and questions support understanding. Original Gazette text, current applicable rules, notifications and facts determine legal outcomes.</p></section>`;
}
const v7PreviousView=renderView;
renderView=function(){return view.route==='daily-study'?v7RenderToday():v7PreviousView()};
NAV[0].items.splice(1,0,['daily-study','Today’s 5-minute lesson','academy']);
titles['daily-study']='Daily Learning';
const v7PreviousHome=renderHome;
renderHome=function(){
 const t=v7TodayRecord(),tasks=[t.read,t.term,t.quiz].filter(Boolean).length;
 const last=Object.entries(v7prefs.history||{}).sort((a,b)=>(b[1]?.seen||'').localeCompare(a[1]?.seen||''))[0];
 const lastCode=last&&LEGAL_META[last[0]]?last[0]:'wages';const hasReadingHistory=!!last||!!readerPrefs.bookmarks?.[lastCode];const lastPage=Math.max(1,Number(v7prefs.history?.[lastCode]?.page)||Number(readerPrefs.bookmarks?.[lastCode])||1);
 const ring=v7PercentDone();
 return `<section class="v7-welcome-banner"><div class="v7-welcome-copy"><span class="v7-kicker">LABOURCODE PRO 1.0 · YOUR LEARNING COMPANION</span><h1>Labour law, made easier to explore.</h1><p>The full law is always here. Read a section, understand a concept, practise with a question, and keep your place.</p><div class="v7-welcome-actions"><button data-go="daily-study" class="v7-hero-button">Start today's lesson <span aria-hidden="true">→</span></button><button data-go="fullacts" class="v7-hero-link">Read the full Acts</button></div></div><div class="v7-welcome-art" aria-hidden="true"><img src="assets/hero_v4.webp" alt=""><span class="v7-art-label">4 ORIGINAL ACTS<br><strong>287 pages offline</strong></span></div></section>
 <section class="v7-home-grid" aria-label="Your learning at a glance"><button class="v7-spotlight" data-go="daily-study"><span class="v7-small-label">DAILY LEARNING PATH</span><h2>Five minutes that build understanding</h2><p>${tasks===3?'You completed all three daily activities. Excellent.':'Three small activities. '+(3-tasks)+' remaining today.'}</p><div class="v7-track"><span style="width:${Math.round(tasks/3*100)}%"></span></div><b>${tasks} / 3 completed <span aria-hidden="true">→</span></b></button>
 <button class="v7-continue" data-v7="resume" data-code="${lastCode}" data-page="${lastPage}"><span class="v7-small-label">${hasReadingHistory?'CONTINUE READING':'START WITH THE ORIGINAL TEXT'}</span><h2>${esc(LEGAL_META[lastCode].name)}</h2><p>${hasReadingHistory?'Return to':'Begin at'} Gazette page ${lastPage}</p><b>${hasReadingHistory?'Continue reading':'Start reading'} <span aria-hidden="true">→</span></b></button>
 <div class="v7-ring-card"><div class="v7-ring" style="--v7-progress:${ring}"><span><strong>${ring}%</strong><small>Lessons</small></span></div><div><strong>Your learning progress</strong><small>${state.completed.length} of 32 lessons completed</small><button data-go="academy">View my progress →</button></div></div></section>
 <section class="v7-pathway"><div class="v7-path-heading"><div><span class="v7-small-label">AN INTERACTIVE LEARNING MAP</span><h2>Explore the four Codes</h2><p>Each step opens its complete statutory text. The progress bar tracks completed lessons, not compliance status.</p></div><button class="v7-text-link" data-go="source-map">Explore section network →</button></div><div class="v7-code-path">${V7_CODES.map((code,i)=>{let pct=v7ProgressFor(code);return `<button data-v7="open-code" data-code="${code}" class="v7-path-item"><span class="v7-path-icon v7-path-${code}">${['₹','§','✚','⚙'][i]}</span><span class="v7-path-name">${['Wages','Industrial Relations','Social Security','Safety & Conditions'][i]}</span><span class="v7-mini-meter"><span style="width:${pct}%"></span></span><small>${pct}% lessons complete</small></button>`}).join('')}</div></section>`+(()=>{const legacy=v7PreviousHome();const pos=legacy.indexOf('<div class="stats premium-stats">');return pos>=0?legacy.slice(pos):legacy.replace(v6VisualPanel(),'')})();
};
const v7OriginalTools=readerTools;
readerTools=function(code,page){
 const old=v7OriginalTools(code,page),sp=v7prefs.lineHeight,width=v7prefs.width;
 const toggle=(type,value,label)=>`<button type="button" data-v7="${type}" data-value="${value}" class="${String(v7prefs[type])===String(value)?'active':''}" aria-pressed="${String(v7prefs[type])===String(value)}">${label}</button>`;
 const controls=`<div class="v7-reading-studio"><div class="v7-studio-title"><div><b>Reading Studio</b><small>Comfort settings apply across all four complete Acts</small></div><button data-v7="focus" class="v7-focus-button" aria-pressed="${!!v7prefs.focus}">${v7prefs.focus?'Exit focus':'Focus mode'} ◇</button></div><div class="v7-studio-controls"><div><span>Line spacing</span><div class="v7-segments">${toggle('lineHeight','1.65','Compact')}${toggle('lineHeight','1.9','Comfort')}${toggle('lineHeight','2.15','Relaxed')}</div></div><div><span>Text width</span><div class="v7-segments">${toggle('width','comfortable','Easy read')}${toggle('width','wide','Wide')}</div></div></div><div class="v7-reader-extras"><button data-v7="speak-page" data-code="${code}" data-page="${page}">♪ Listen to this page</button><button data-v7="stop-speak">■ Stop</button><span>Tap <u>highlighted legal terms</u> to understand them.</span></div></div>`;
 return old.replace('</section>',controls+'</section>');
};
const v7PreviousReader=renderStatute;
renderStatute=function(){return v7PreviousReader()};
const v7PreviousRender=render;
render=function(){
 v7PreviousRender();
 document.title='LabourCode Pro 1.0 · Developed by Avinash Ekka';
 const root=document.querySelector('.workspace');if(root)root.classList.add('lcp-v7');
 document.querySelectorAll('.brand small').forEach(el=>el.textContent='PREMIUM ANDROID 1.0');
 document.querySelectorAll('.workspace-footer b').forEach(el=>el.textContent='1.0');
 const nav=document.getElementById('android-bottom-nav');if(nav){nav.classList.add('v7-bottom-nav');const h=nav.querySelector('[data-go="home"]');if(h){h.title='Overview and learning progress';if(view.route==='daily-study')h.classList.add('active')}}
 document.documentElement.classList.toggle('v7-focus-reading',!!v7prefs.focus&&view.route==='statute');
 document.documentElement.classList.toggle('v7-reduced-motion',!!v7prefs.reduceMotion);
 document.documentElement.style.setProperty('--v7-leading',String(v7prefs.lineHeight));
 document.documentElement.style.setProperty('--v7-measure',v7prefs.width==='wide'?'100%':'72ch');
 const current=document.querySelector('.legal-page-content');
 if(current){v7TrackReader();v7CompactToolbar();v7MoveNotesBelowReader();requestAnimationFrame(()=>v7InlineGlossary());}
};
function v7CompactToolbar(){
 const bar=document.querySelector('.reader-accessibility-toolbar');
 const top=bar?.querySelector('.reader-toolbar-top');
 if(!bar||!top||bar.dataset.v7Compact==='1')return;
 bar.dataset.v7Compact='1';
 const studio=bar.querySelector('.v7-reading-studio');
 const oldRows=Array.from(bar.querySelectorAll('.reader-setting-row'));
 const bookmarks=bar.querySelector('.reader-bookmark-row');
 const heading=studio?.querySelector('.v7-studio-title');
 const advanced=studio?.querySelector('.v7-studio-controls');
 const extras=studio?.querySelector('.v7-reader-extras');
 const focus=heading?.querySelector('.v7-focus-button');
 const quick=document.createElement('div');quick.className='v7-compact-actions';
 if(focus)quick.appendChild(focus);
 if(extras){extras.querySelectorAll('button').forEach(b=>quick.appendChild(b))}
 if(bookmarks){bookmarks.querySelectorAll('button').forEach(b=>quick.appendChild(b))}
 const details=document.createElement('details');details.className='v7-options-accordion';
 details.open=!!v7prefs.optionsOpen;
 const summary=document.createElement('summary');summary.textContent='Reading options · page view, paper, spacing and width';details.appendChild(summary);
 const inside=document.createElement('div');inside.className='v7-advanced-content';details.appendChild(inside);
 oldRows.forEach(r=>inside.appendChild(r));
 if(advanced)inside.appendChild(advanced);
 top.after(quick,details);
 details.addEventListener('toggle',()=>{v7prefs.optionsOpen=details.open;v7Persist()});
 if(studio)studio.remove();
}
function v7MoveNotesBelowReader(){
 const notes=document.querySelector('.v6-annotations');
 const grid=document.querySelector('.legal-reading-grid');
 const quick=document.querySelector('.v7-compact-actions');
 if(!notes||!grid)return;
 grid.after(notes);
 notes.id='v7-reading-notes';
 if(quick&&!quick.querySelector('[data-v7="notes"]')){
  const link=document.createElement('button');link.type='button';link.dataset.v7='notes';link.textContent='✎ My notes';quick.appendChild(link);
 }
}
function v7TrackReader(){
 if(view.route!=='statute'||!LEGAL_META[view.code])return;
 const code=view.code,page=Math.min(Math.max(1,Number(view.statutePage)||1),LEGAL_META[code].pages);
 const saved=v7prefs.history?.[code];if(!saved||saved.page!==page){v7prefs.history[code]={page,seen:new Date().toISOString()};v7Persist()}
 const head=document.querySelector('.legal-reader-head');if(head&&!document.getElementById('v7-reading-progress')){
 const indicator=document.createElement('div');indicator.id='v7-reading-progress';indicator.className='v7-progress-shell';indicator.innerHTML=`<div class="v7-progress-line"><span style="width:${Math.round(page/LEGAL_META[code].pages*100)}%"></span></div><span>Original Gazette · ${page} of ${LEGAL_META[code].pages} pages</span>`;head.appendChild(indicator)
 }
}
function v7InlineGlossary(){
 const page=document.querySelector('.legal-page-content');if(!page||page.dataset.v7Links==='1'||!v7prefs.terms||!D.glossary)return;
 page.dataset.v7Links='1';
 // Only a safe subset of the supplied educational glossary; never change the bundled PDF/text strings.
 const words=D.glossary.map(g=>g.term).filter(t=>t.length>=4&&t.length<=45).sort((a,b)=>b.length-a.length).slice(0,60);
 if(!words.length)return;
 const pattern=new RegExp('\\b('+words.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
 const walker=document.createTreeWalker(page,NodeFilter.SHOW_TEXT);
 let node,count=0;const selected=[];
 while((node=walker.nextNode())&&count<48){
   if(!node.nodeValue||node.nodeValue.length<5||node.parentElement?.closest('button,mark,a,.v7-term,script,style'))continue;
   if(!pattern.test(node.nodeValue)){pattern.lastIndex=0;continue}
   pattern.lastIndex=0;selected.push(node);count++;
 }
 let inserted=0;
 for(const n of selected){
  const original=n.nodeValue||'',frag=document.createDocumentFragment();let last=0,m;
  pattern.lastIndex=0;
  while((m=pattern.exec(original))!==null && inserted<70){
   const term=D.glossary.find(x=>x.term.toLowerCase()===m[0].toLowerCase());
   if(!term)continue;
   frag.append(document.createTextNode(original.slice(last,m.index)));
   const b=document.createElement('button');b.type='button';b.className='v7-term';b.dataset.action='term';b.dataset.term=term.term;b.textContent=m[0];b.title='Explain '+term.term;frag.append(b);
   last=m.index+m[0].length;inserted++;
  }
  if(last){frag.append(document.createTextNode(original.slice(last)));n.replaceWith(frag)}
 }
}
function v7SpeakPage(){
 const doc=legalCache[view.code];if(!doc){toast('Open the full Act first');return}
 const page=Number(view.statutePage)||1,text=(doc.pages[page-1]||'').slice(0,3500);
 if(window.AndroidBridge?.speakText){AndroidBridge.speakText(text);toast('Reading the original text aloud');return}
 if('speechSynthesis' in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='en-IN';u.rate=.85;speechSynthesis.speak(u);toast('Reading the original text aloud')}
 else toast('Speech output is unavailable on this device');
}
app.addEventListener('click',function(event){
 const el=event.target.closest('[data-v7]');if(!el)return;
 event.preventDefault();event.stopImmediatePropagation();
 const act=el.dataset.v7,x=v7TodayRecord(),code=el.dataset.code;
 if(act==='resume'){jumpLegal(code,Math.max(1,Number(el.dataset.page)||1));return}
 if(act==='open-code'){go('module',code);return}
 if(act==='focus'){v7prefs.focus=!v7prefs.focus;v7Persist();render();return}
 if(act==='lineHeight'){const n=Number(el.dataset.value);if([1.65,1.9,2.15].includes(n))v7prefs.lineHeight=n;v7Persist();render();return}
 if(act==='width'){if(['comfortable','wide'].includes(el.dataset.value))v7prefs.width=el.dataset.value;v7Persist();render();return}
 if(act==='speak-page'){v7SpeakPage();return}
 if(act==='notes'){document.getElementById('v7-reading-notes')?.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(act==='stop-speak'){if('speechSynthesis' in window)speechSynthesis.cancel();if(window.AndroidBridge?.stopSpeaking)AndroidBridge.stopSpeaking();toast('Read-aloud stopped');return}
 if(act==='code'){if(V7_CODES.includes(code)){v7prefs.today={date:v7Date(),code,read:false,term:false,quiz:false,choice:null,checked:false};v7Persist();render()}return}
 if(act==='read'){x.read=true;v7Persist();jumpLegal(code,1);return}
 if(act==='mark-read'){x.read=true;v7Persist();render();return}
 if(act==='term'){
  const name=el.dataset.term,t=D.glossary.find(g=>g.term.toLowerCase()===name.toLowerCase()) || D.glossary.find(g=>g.code===x.code) || D.glossary[0];
  x.term=true;v7Persist();showTerm(t.term);return;
 }
 if(act==='mark-term'){x.term=true;v7Persist();render();return}
 if(act==='answer'){if(x.checked)return;x.choice=Number(el.dataset.choice);v7Persist();render();return}
 if(act==='check-answer'){if(x.choice===null)return;x.checked=true;x.quiz=true;addStudy();markSaved();v7Persist();render();return}
},true);
document.addEventListener('keydown',e=>{
 const t=e.target;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();go('fullacts');setTimeout(()=>document.getElementById('library-search')?.focus(),40)}
 if(e.key==='Escape'&&v7prefs.focus){v7prefs.focus=false;v7Persist();render()}
 if(t?.tagName==='INPUT'||t?.tagName==='TEXTAREA'||t?.tagName==='SELECT'||t?.isContentEditable)return;
 if(view.route==='statute'&&e.key==='ArrowRight'&&readerPrefs.mode==='page'&&view.statutePage<LEGAL_META[view.code].pages){view.statutePage++;render()}
 if(view.route==='statute'&&e.key==='ArrowLeft'&&readerPrefs.mode==='page'&&view.statutePage>1){view.statutePage--;render()}
});
