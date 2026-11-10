/* LabourCode Pro Web 1.2.0 — Modern Legal Studio.
   Presentation and optional learning interactions only. The four original
   Gazette PDFs, their searchable transcriptions and legal content are unchanged.
   Developed by Avinash Ekka. */
'use strict';
(function(){
  let challengeIndex=0;
  try { challengeIndex=Math.max(0,Number(sessionStorage.getItem('lcp-ms-challenge')||0)||0); } catch(_e){}
  const topics=[
    {id:'wages',short:'Pay & wages',full:'Code on Wages, 2019',desc:'Understand pay components, minimum wages, bonus and equal remuneration.',tag:'PAY & FAIRNESS',image:'editorial_wages.webp',icon:'calculator',num:'01'},
    {id:'industrial',short:'Industrial relations',full:'Industrial Relations Code, 2020',desc:'Explore worker representation, employment terms and dispute resolution.',tag:'PEOPLE & RIGHTS',image:'editorial_industrial.webp',icon:'academy',num:'02'},
    {id:'security',short:'Social security',full:'Code on Social Security, 2020',desc:'Learn about provident funds, insurance, gratuity and statutory benefits.',tag:'PROTECTION & BENEFITS',image:'editorial_security.webp',icon:'advisor',num:'03'},
    {id:'osh',short:'Safety & working conditions',full:'OSH & Working Conditions Code, 2020',desc:'Explore workplace health, safety duties and working conditions.',tag:'HEALTH & SAFETY',image:'editorial_osh.webp',icon:'compliance',num:'04'}
  ];
  const extraGroups=[
    ['LEARN & EXPLORE', [['learn','All learning modules','learn'],['academy','Learning academy','academy'],['case-studio','Workplace case studies','file'],['glossary','Legal dictionary','glossary'],['definitions','Statutory definitions','glossary'],['visuals','Infographics','chart'],['source-map','Section explorer','compare'],['section-drills','Section discovery drills','quiz']]],
    ['PROFESSIONAL TOOLS', [['advisor','Legal tutor','advisor'],['research','Legal research assistant','search'],['compliance','Compliance explorer','compliance'],['calculator','HR calculation lab','calculator'],['audit','Compliance workspaces','compliance'],['planner','Action planner','planner'],['documents','Document review','documents'],['reports','Reports & insights','reports']]],
    ['REFERENCES & SETTINGS', [['compare','Old vs new laws','compare'],['updates','Legal updates','updates'],['source-register','Legal source register','file'],['settings','Preferences','settings']]]
  ];
  const mainNav=[['home','Dashboard','home'],['fullacts','Full legal library','learn'],['search','Search the law','search'],['visual-studio','Visual learning','chart'],['daily-study','Daily study','academy'],['quiz','Quiz & practice','quiz']];
  function navItem([id,title,ico]){const active=view.route===id || (id==='fullacts'&&view.route==='actreader') || (id==='visual-studio'&&view.route==='visual-concept');return `<button type="button" data-go="${id}" class="ms-nav-link${active?' active':''}" ${active?'aria-current="page"':''} title="${esc(title)}">${icon(ico,19)}<span>${esc(title)}</span>${active?'<span class="ms-nav-dot"></span>':''}</button>`}
  renderSide=function(){
    return `<aside class="sidebar ms-sidebar" aria-label="Main sidebar"><div class="ms-brand"><span class="ms-brand-icon">${icon('learn',27)}</span><span class="ms-brand-names"><strong>LabourCode <i>Pro</i></strong><small>MODERN LEGAL STUDIO</small></span></div><nav aria-label="Primary navigation"><div class="ms-nav-kicker">YOUR WORKSPACE</div>${mainNav.map(navItem).join('')}<div class="ms-nav-separator"></div>${extraGroups.map(([label,items])=>{const open=items.some(([id])=>id===view.route);return `<details class="ms-nav-group" ${open?'open':''}><summary>${esc(label)}<span aria-hidden="true">⌄</span></summary><div class="ms-nav-nested">${items.map(navItem).join('')}</div></details>`}).join('')}</nav><div class="ms-side-progress"><div><span>YOUR STUDY PROGRESS</span><b>${percentDone()}%</b></div><div class="ms-side-track"><span style="width:${percentDone()}%"></span></div><small>${state.completed.length} of 32 guided lessons completed</small><button data-go="academy">View progress ${icon('arrow',14)}</button></div><p class="ms-side-credit">Developed by <strong>Avinash Ekka</strong></p></aside>`;
  };
  function dailySteps(){
    const n=state.completed.length;
    return [
      {n:'01',eyebrow:'READ',title:n?'Continue the complete law':'Choose a complete Code',text:'Start with the original Gazette wording.',go:'fullacts',icon:'learn',done:n>0},
      {n:'02',eyebrow:'UNDERSTAND',title:'Explore a visual explainer',text:'See a concept with diagrams and examples.',go:'visual-studio',icon:'chart',done:false},
      {n:'03',eyebrow:'PRACTISE',title:'Check your understanding',text:'Try a short question with feedback.',go:'quiz',icon:'academy',done:state.scores.length>0}
    ];
  }
  function qBank(){
    if(typeof VL11_CONCEPTS!=='undefined' && Array.isArray(VL11_CONCEPTS))return VL11_CONCEPTS.filter(q=>q.choices?.length>=2&&Number.isInteger(q.answer));
    return [{id:'wage-definition',code:'wages',question:'Which Labour Code contains the definition of wages in Section 2(y)?',choices:['Industrial Relations Code','Code on Wages','OSH Code'],answer:1,answerDetail:'Section 2(y) of the Code on Wages, 2019 defines wages and contains important inclusion, exclusion and proviso rules.',reference:'Code on Wages, 2019, Section 2(y)',page:4}];
  }
  function msQuizCard(){
    const qs=qBank(),q=qs[challengeIndex%qs.length],id=challengeIndex%qs.length;
    return `<article class="ms-challenge" id="ms-challenge"><div class="ms-card-heading"><span class="ms-mini-icon ms-mini-icon-gold">${icon('star',20)}</span><div><span class="ms-eyebrow">ONE-MINUTE CHALLENGE</span><h2>Test a legal concept</h2></div><span class="ms-challenge-count">${(id+1)} / ${qs.length}</span></div><p class="ms-challenge-question">${esc(q.question)}</p><div class="ms-answer-list" role="group" aria-label="Choose an answer">${q.choices.map((answer,i)=>`<button type="button" data-ms-answer="${i}" aria-label="Answer ${i+1}: ${att(answer)}"><span class="ms-option-letter">${String.fromCharCode(65+i)}</span><span>${esc(answer)}</span>${icon('arrow',16)}</button>`).join('')}</div><div id="ms-answer-feedback" aria-live="polite"></div><div class="ms-challenge-footer"><span>${icon('learn',15)} Drawn from the app’s existing study guides</span><button data-ms-next type="button">Another concept ${icon('arrow',15)}</button></div></article>`;
  }
  function topicCard(topic){return `<article class="ms-topic-card ms-topic-${topic.id}"><div class="ms-topic-image"><img loading="lazy" src="assets/${topic.image}" alt="Workplace illustration for ${att(topic.full)}"><span class="ms-topic-serial">${topic.num} / 04</span></div><div class="ms-topic-body"><span class="ms-topic-eyebrow">${topic.tag}</span><h3>${esc(topic.short)}</h3><p>${esc(topic.desc)}</p><div class="ms-topic-links"><button data-go="module" data-code="${topic.id}">Explore lessons ${icon('arrow',16)}</button><button data-go="actreader" data-code="${topic.id}" aria-label="Read the original ${att(topic.full)}">Original Act ${icon('learn',15)}</button></div></div></article>`}
  renderHome=function(){
    const best=state.scores.length?Math.round(Math.max(...state.scores.map(s=>100*s.correct/s.total)))+'%':'—';
    return `<div class="ms-home">
      <div class="ms-home-topline"><span class="ms-eyebrow">YOUR LEARNING WORKSPACE</span><span class="ms-verified">${icon('check',15)} Four complete original Gazette Acts</span></div>
      <section class="ms-hero" aria-label="Start learning"><div class="ms-hero-content"><div class="ms-hero-overline"><span></span> DISCOVER • UNDERSTAND • APPLY</div><h1>Labour law,<br><em>made clearer.</em></h1><p>Go beyond summaries. Read the original Acts, see real workplace examples, and make progress one concept at a time.</p><div class="ms-hero-actions"><button class="ms-primary-btn" data-go="daily-study">Start today's study ${icon('arrow',18)}</button><button class="ms-light-btn" data-go="fullacts">Explore four Codes ${icon('learn',17)}</button></div><div class="ms-hero-micro">${icon('check',15)} Original Acts preserved <span>•</span> ${icon('check',15)} Interactive learning</div></div><div class="ms-hero-visual"><img src="assets/hero_v4.webp" alt="Indian professionals and workers collaborating in workplace settings"><div class="ms-floating-tag"><span>${icon('learn',17)}</span><div><strong>Read it all</strong><small>287 pages • 4 Acts</small></div></div></div></section>
      <div class="ms-stats" aria-label="Learning library at a glance"><div>${icon('learn',19)}<span><strong>4</strong><small>complete Codes</small></span></div><div>${icon('glossary',19)}<span><strong>480</strong><small>indexed sections</small></span></div><div>${icon('academy',19)}<span><strong>32</strong><small>guided lessons</small></span></div><div>${icon('quiz',19)}<span><strong>${best}</strong><small>your best quiz score</small></span></div></div>
      <div class="ms-section-title"><div><span class="ms-eyebrow">SMALL STEPS. STRONGER KNOWLEDGE.</span><h2>Build a daily study habit</h2><p>Three simple ways to make progress, in any order.</p></div><button data-go="daily-study">Open study path ${icon('arrow',17)}</button></div>
      <div class="ms-study-grid"><section class="ms-journey"><div class="ms-journey-head"><span class="ms-mini-icon ms-mini-icon-blue">${icon('academy',21)}</span><div><strong>Your learning journey</strong><small>Pick up where you left off</small></div><div class="ms-journey-percent">${percentDone()}% <small>complete</small></div></div><div class="ms-journey-track"><span style="width:${percentDone()}%"></span></div>${dailySteps().map((s,i)=>`<button class="ms-journey-step" data-go="${s.go}"><span class="ms-step-num">${s.done?icon('check',17):s.n}</span><div><small>${s.eyebrow}</small><strong>${s.title}</strong><span>${s.text}</span></div>${icon('arrow',18)}</button>`).join('')}<div class="ms-journey-bottom"><span>Keep learning at your own pace</span><button data-go="academy">View achievements ${icon('arrow',16)}</button></div></section>${msQuizCard()}</div>
      <div class="ms-section-title ms-topic-heading"><div><span class="ms-eyebrow">THE COMPLETE LEGAL LIBRARY</span><h2>Explore the four Labour Codes</h2><p>Each Code has the original full text, guided explanations and examples.</p></div><button data-go="search">Search all Codes ${icon('search',17)}</button></div><div class="ms-topic-grid">${topics.map(topicCard).join('')}</div>
      <div class="ms-bottom-features"><button data-go="visual-studio"><span class="ms-mini-icon ms-mini-icon-teal">${icon('chart',22)}</span><span><strong>Visual Learning Studio</strong><small>Interactive diagrams and illustrated concepts</small></span>${icon('arrow',19)}</button><button data-go="case-studio"><span class="ms-mini-icon ms-mini-icon-rose">${icon('file',22)}</span><span><strong>Workplace case studies</strong><small>Apply concepts to realistic situations</small></span>${icon('arrow',19)}</button><button data-go="search"><span class="ms-mini-icon ms-mini-icon-blue">${icon('search',22)}</span><span><strong>Powerful legal search</strong><small>Find terms, sections and full text instantly</small></span>${icon('arrow',19)}</button></div>
      <p class="ms-legal-disclaimer">Educational reference. The embedded Gazette PDFs are the original enacted Acts (2019/2020), not an automatically updated consolidation. Check subsequent rules, amendments and notifications for current legal applicability.</p>
    </div>`;
  };
  const originalRender=render;
  render=function(){
    originalRender();
    document.title='LabourCode Pro — Modern Legal Studio | Developed by Avinash Ekka';
    const root=document.querySelector('.workspace');if(root){root.classList.add('ms-workspace');root.classList.toggle('ms-home-workspace',view.route==='home')}
    const chip=document.querySelector('.top-right .chip');if(chip)chip.textContent='● 4 COMPLETE ACTS';
    const br=document.querySelector('.breadcrumb');if(br&&window.innerWidth>920)br.innerHTML=`<span>Workspace</span><span aria-hidden="true"> / </span><b>${esc(titles[view.route]||'Modern Legal Studio')}</b>`;
    const bottom=document.getElementById('android-bottom-nav');
    if(bottom){const items=[['home','Home','home'],['fullacts','Read','learn'],['search','Search','search'],['visual-studio','Learn','academy']];bottom.innerHTML=items.map(([id,name,ico])=>`<button type="button" data-go="${id}" class="${(view.route===id||(id==='fullacts'&&view.route==='actreader')||(id==='visual-studio'&&['visual-concept','learn','daily-study'].includes(view.route)))?'active':''}" aria-label="${name}">${icon(ico,21)}<span>${name}</span></button>`).join('')+`<button type="button" data-action="android-menu" class="${['settings','calculator','compliance','case-studio'].includes(view.route)?'active':''}" aria-label="More sections">${icon('filter',21)}<span>More</span></button>`}
    const foot=document.querySelector('.workspace-footer');if(foot){foot.querySelectorAll('b').forEach(x=>x.textContent='Web 1.2');}
    const brand=document.querySelector('.brand small');if(brand)brand.textContent='MODERN LEGAL STUDIO';
    const mobileLabel=document.querySelector('.v8-app-name small');if(mobileLabel)mobileLabel.textContent='MODERN LEGAL STUDIO';
  };
  // Replace the old flat mobile More menu with short, grouped destinations.
  document.body.addEventListener('click',function(event){
    const more=event.target.closest('#android-bottom-nav [data-action="android-menu"]');
    if(!more)return;
    event.preventDefault();event.stopImmediatePropagation();
    const groups=[
      ['LEARN & PRACTISE',[['daily-study','Daily 5-minute study','academy'],['academy','Learning academy','academy'],['case-studio','Workplace cases','file'],['visuals','Interactive diagrams','chart'],['glossary','Legal dictionary','glossary']]],
      ['LEGAL RESEARCH',[['definitions','Statutory definitions','glossary'],['research','Legal research assistant','search'],['source-map','Section map','compare'],['compare','Old vs new laws','compare']]],
      ['PRACTICAL HR TOOLS',[['calculator','HR calculators','calculator'],['compliance','Compliance explorer','compliance'],['planner','Action planner','planner'],['reports','Reports & progress','reports'],['settings','Reading preferences','settings']]]
    ];
    popup('Explore LabourCode Pro',`<div class="ms-menu-head"><p>Choose what you want to understand, practise or explore next.</p></div><div class="ms-menu-groups">${groups.map(([name,items])=>`<section class="ms-menu-group"><h3>${name}</h3>${items.map(([route,label,ico])=>`<button type="button" data-ms-menu-go="${route}">${icon(ico,18)}<span>${label}</span>${icon('arrow',15)}</button>`).join('')}</section>`).join('')}</div>`);
  },true);
  modalRoot.addEventListener('click',function(event){
    const el=event.target.closest('[data-ms-menu-go]');if(!el)return;
    event.preventDefault();event.stopImmediatePropagation();
    const route=el.dataset.msMenuGo;
    modalRoot.innerHTML='';go(route);
  },true);
  app.addEventListener('click',function(evt){
    const answer=evt.target.closest('[data-ms-answer]');
    if(answer){
      evt.preventDefault();evt.stopImmediatePropagation();
      const bank=qBank(),q=bank[challengeIndex%bank.length],selected=Number(answer.dataset.msAnswer),correct=selected===q.answer;
      const list=document.querySelectorAll('#ms-challenge [data-ms-answer]');list.forEach((el,i)=>{el.disabled=true;el.classList.toggle('ms-correct',i===q.answer);el.classList.toggle('ms-incorrect',i===selected&&!correct);el.setAttribute('aria-pressed',String(i===selected));});
      const feedback=document.getElementById('ms-answer-feedback');if(feedback)feedback.innerHTML=`<div class="ms-feedback ${correct?'is-correct':'is-incorrect'}"><strong>${correct?'✓ Correct answer':'Good try — here is the explanation'}</strong><p>${esc(q.answerDetail||'Review the related statutory definition and explanatory materials for the correct meaning.')}</p><button type="button" data-ms-source="${q.code||'wages'}" data-page="${Number(q.page||1)}">Read the original provision ${icon('arrow',15)}</button></div>`;
      return;
    }
    const next=evt.target.closest('[data-ms-next]');if(next){evt.preventDefault();evt.stopImmediatePropagation();challengeIndex++;try{sessionStorage.setItem('lcp-ms-challenge',String(challengeIndex))}catch(_e){}const card=document.getElementById('ms-challenge');if(card)card.outerHTML=msQuizCard();return;}
    const source=evt.target.closest('[data-ms-source]');if(source){evt.preventDefault();evt.stopImmediatePropagation();view.statutePage=Number(source.dataset.page)||1;go('actreader',source.dataset.msSource);return;}
  },true);
})();
