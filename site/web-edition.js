/* LabourCode Pro Web — presentation adjustments for GitHub Pages/PWA.
 * The Acts and explanations come from the original Android learning project.
 * No automatic legal amendments or external AI assertions.
 */
'use strict';
(() => {
  // Wrap only after all base and learning extensions have installed their routes.
  const oldSide=renderSide;
  renderSide=function(){return oldSide().replaceAll('PREMIUM ANDROID 1.0','PREMIUM WEB EDITION').replaceAll('PREMIUM ANDROID','PREMIUM WEB')};
  const oldHome=renderHome;
  renderHome=function(){return oldHome().replaceAll('ANDROID LEGAL WORKSPACE','WEB LEGAL WORKSPACE').replace(/Original Acts can be embedded in a complete release or added through the device document picker\./g,'All four original Gazette Acts are embedded in this website and available after offline caching.').replace(/Original Acts are not bundled in this source build/g,'All four original Acts are bundled in this web edition')};
  renderFullActs=function(){
    return `<div class="eyebrow">OFFLINE LEGAL LIBRARY · FOUR ORIGINAL GAZETTE ACTS</div><h1 class="heading">Complete text of India's four Labour Codes</h1>
      <p class="subhead">All 287 Gazette pages, 480 indexed statutory sections and the original schedules. Open the exact original PDF or use the searchable, accessible text edition. No legal account or external website needed.</p>
      <div class="web-law-summary"><div><strong>4/4</strong><span>Original Codes included</span></div><div><strong>287</strong><span>Original pages</span></div><div><strong>480</strong><span>Indexed sections</span></div><div><strong>100%</strong><span>Searchable offline text</span></div></div>
      <div class="law-grid statute-grid">${D.codes.map(c=>`<article class="law-tile"><div class="law-art"><img src="assets/editorial_${c.id}.webp" loading="lazy" alt="Illustration for ${att(c.name)}"><span class="law-category">ACT ${ACTS_META[c.id].act}</span></div><div class="law-content"><div class="law-overline">${ACTS_META[c.id].pages} ORIGINAL PAGES</div><h3>${esc(c.name)}</h3><p>${esc(ACTS_META[c.id].note)}</p><div class="law-card-foot"><span class="source-ready">✓ Original Act embedded</span><button class="btn secondary" data-go="actreader" data-code="${c.id}">Open Code ${icon('arrow')}</button></div></div></article>`).join('')}</div>
      <div class="web-prompt"><strong>How to study</strong><p>Start with the complete text, search its exact wording, then compare a learning explanation or workplace example. The original Gazette is preserved unaltered; legal effect may depend on subsequent notifications, Rules and amendments.</p></div>`;
  };
  renderActReader=function(){
    const id=ACTS_META[view.code]?view.code:'wages',m=ACTS_META[id],page=Math.max(1,Number(view.statutePage)||1);
    return `<div class="reader-intro"><button class="btn ghost small" data-go="fullacts">${icon('back')} All four Codes</button><div class="reader-name"><div class="eyebrow">ORIGINAL GAZETTE · ACT ${m.act}</div><h1 class="heading">${esc(m.name)}</h1><p class="subhead">Complete statutory PDF · ${m.pages} pages · available offline after installation</p></div></div>
      <div class="web-reader-actions"><button class="btn" data-action="native-open-act" data-code="${id}">${icon('learn')} Open complete PDF reader</button><button class="btn secondary" data-go="statute" data-code="${id}">${icon('search')} Search and read the full text</button><a class="btn ghost" href="assets/acts/${id}.pdf#page=${page}" target="_blank" rel="noopener">Open PDF in new tab ↗</a><a class="btn ghost" href="assets/acts/${id}.pdf" download="${id}-labour-code.pdf">Save original PDF ↓</a></div>
      <div class="web-pdf-inline"><div class="web-pdf-inline-head"><strong>Original printed Act</strong><small>Use PDF toolbar to zoom, search, print and change pages.</small></div><iframe title="Original Gazette PDF — ${att(m.name)}" loading="lazy" src="assets/acts/${id}.pdf#page=${page}&zoom=page-width"></iframe><div class="web-pdf-mobile-tip">If your browser does not display PDFs inside the page, use “Open complete PDF reader” or “Open PDF in new tab”.</div></div>
      <div class="web-prompt"><strong>Learn alongside the law</strong><p>Use the searchable text reader to find clauses and schedules, tap terms to see definitions, or read the structured study guide. These explanations are separate from the original statutory text.</p><button class="btn secondary" data-go="module" data-code="${id}">Study this Code ${icon('arrow')}</button></div>
      <div class="disclosure-line">Original enacted text (2019/2020), not an automatically updated consolidation. Check subsequent commencement notifications, amendments and applicable Central/State Rules before making a legal or HR decision.</div>`;
  };
  const oldSettings=renderSettings;
  renderSettings=function(){return oldSettings().replaceAll('Android Edition · Offline-first learning','Web Edition · Installable offline PWA').replaceAll('Android device','web browser').replaceAll('Android phone','browser or installed web app').replaceAll('Close application','Close browser tab').replaceAll('on your Android','on your browser').replaceAll('Private application data (Android sandbox)','Private browser storage on this device').replaceAll('LabourCode Pro Android','LabourCode Pro Web')};
  const oldDocuments=renderDocuments;
  renderDocuments=function(){return oldDocuments().replaceAll('ON-DEVICE EDUCATIONAL DOCUMENT SCREENING','PRIVATE BROWSER DOCUMENT SCREENING').replaceAll('TXT, DOCX or text-extractable PDF','TXT or DOCX').replaceAll('TXT, DOCX or PDF','TXT or DOCX').replaceAll('local Windows application','your browser').replaceAll('accept=".txt,.docx,.pdf"','accept=".txt,.docx"')};
  const oldRender=render;
  render=function(){oldRender();document.title='LabourCode Pro — Web Edition | Developed by Avinash Ekka';document.querySelectorAll('.brand small').forEach(el=>el.textContent='PREMIUM WEB EDITION');document.querySelectorAll('.v8-app-name small').forEach(el=>el.textContent='WEB EDITION');document.querySelectorAll('.workspace-footer b').forEach(el=>{if(/^\d+\.\d+/.test(el.textContent))el.textContent='Web 1.0'});document.documentElement.dataset.lcpWeb='true';};
  window.lcpOnSupplementaryImported=function(json){try{const item=JSON.parse(json);toast('Saved supplementary PDF locally: '+item.title);if(view.route==='source-register')render()}catch(e){toast('Supplementary PDF added')}};
  // Browser-native install prompts are optional; no install requirement for reading.
  let installPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;const b=document.getElementById('web-install');if(b)b.hidden=false});
  document.addEventListener('click',e=>{if(e.target.closest('[data-web="install"]')&&installPrompt){installPrompt.prompt();installPrompt=null}},true);
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('lcp-web-pdf')){document.querySelector('#lcp-web-pdf .lcp-pdf-close')?.click()}});
  if('serviceWorker'in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1'))navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('Offline cache not available',e));
})();
