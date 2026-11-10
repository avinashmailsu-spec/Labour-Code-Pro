/* LabourCode Pro — browser adapter. No server, account, analytics, or API key needed.
 * Converts Android-specific interface calls into standard Web Platform features.
 * Developed by Avinash Ekka.
 */
'use strict';
(() => {
  const STORAGE_KEY = 'labourcodepro-web-learning-v1';
  const extrasKey = 'labourcodepro-web-supplementary-v1';
  const codes = Object.freeze({wages:29,industrial:56,security:116,osh:86});
  const names = {wages:'Code on Wages, 2019',industrial:'Industrial Relations Code, 2020',security:'Code on Social Security, 2020',osh:'Occupational Safety, Health and Working Conditions Code, 2020'};
  const hashes = {wages:'',industrial:'',security:'',osh:''};
  const utf8 = new TextEncoder();
  const enc = s => utf8.encode(String(s));
  const safeName = s => String(s||'LabourCodePro_Report').replace(/[^a-z0-9_.-]+/gi,'_').slice(0,100);
  const pdfPath = code => 'assets/acts/'+code+'.pdf';
  function triggerDownload(blob,name){
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=safeName(name);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),20000);
  }
  function zipStore(files){
    const parts=[],directory=[];let offset=0;
    const add16=(v,x)=>v.setUint16(x.pos,x.n,true); // kept for compatibility with older browsers
    function header(size){return new DataView(new ArrayBuffer(size))}
    function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
    for(const [path,contents] of Object.entries(files)){
      const name=enc(path),data=typeof contents==='string'?enc(contents):contents,crc=crc32(data);
      let h=header(30+name.length);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(8,0,true);
      h.setUint32(14,crc,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);
      const head=new Uint8Array(h.buffer);head.set(name,30);parts.push(head,data);
      const d=header(46+name.length);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,crc,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);
      const de=new Uint8Array(d.buffer);de.set(name,46);directory.push(de);offset+=head.length+data.length;
    }
    const dirSize=directory.reduce((s,a)=>s+a.length,0);const e=header(22);e.setUint32(0,0x06054b50,true);e.setUint16(8,directory.length,true);e.setUint16(10,directory.length,true);e.setUint32(12,dirSize,true);e.setUint32(16,offset,true);
    return new Blob([...parts,...directory,new Uint8Array(e.buffer)],{type:'application/zip'});
  }
  const xml=s=>String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  function excelBlob(config){
    const rows=Array.isArray(config.rows)?config.rows:[];
    const cell=(txt,i,rowNumber)=>{let col='';for(let n=i+1;n;n=Math.floor((n-1)/26))col=String.fromCharCode(65+(n-1)%26)+col;return `<c r="${col}${rowNumber}" t="inlineStr"><is><t xml:space="preserve">${xml(txt)}</t></is></c>`};
    const content=rows.map((row,i)=>`<row r="${i+1}">${(Array.isArray(row)?row:[row]).map((v,j)=>cell(v,j,i+1)).join('')}</row>`).join('');
    const title=String(config.sheet||'LabourCode Pro').slice(0,31).replace(/[\\/?*\[\]:]/g,'-');
    return zipStore({
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml':`<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${xml(title)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      'xl/_rels/workbook.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      'xl/worksheets/sheet1.xml':`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${content}</sheetData></worksheet>`
    });
  }
  function docxBlob(config){
    const lines=Array.isArray(config.lines)?config.lines:[];const paras=[config.title||'LabourCode Pro Report',...lines].map((s,i)=>`<w:p><w:pPr>${i===0?'<w:pStyle w:val="Title"/>':''}</w:pPr><w:r><w:t xml:space="preserve">${xml(s)}</w:t></w:r></w:p>`).join('');
    return zipStore({
      '[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      '_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      'word/document.xml':`<?xml version="1.0" encoding="UTF-8"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${paras}<w:sectPr/></w:body></w:document>`
    });
  }
  async function openZipText(bytes,wanted){
    const dat=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);let at=0;
    while(at+30<bytes.byteLength){
      if(dat.getUint32(at,true)!==0x04034b50)break;
      const flags=dat.getUint16(at+6,true),method=dat.getUint16(at+8,true),size=dat.getUint32(at+18,true),namelen=dat.getUint16(at+26,true),extra=dat.getUint16(at+28,true);
      const name=new TextDecoder().decode(bytes.slice(at+30,at+30+namelen));const start=at+30+namelen+extra;
      if(flags&8)throw Error('This DOCX format uses unsupported ZIP descriptors');
      if(name===wanted){let chunk=bytes.slice(start,start+size);if(method===8){if(!('DecompressionStream'in window))throw Error('DOCX decompression is unsupported by this browser');const ds=new DecompressionStream('deflate-raw');chunk=new Uint8Array(await new Response(new Blob([chunk]).stream().pipeThrough(ds)).arrayBuffer())}else if(method!==0)throw Error('Unsupported DOCX compression');return new TextDecoder().decode(chunk)}
      at=start+size;
    }
    throw Error('DOCX document text could not be located');
  }
  async function reviewDocument(filename,b64){
    const binary=atob(b64);if(binary.length>5*1024*1024)throw Error('5 MB file limit');const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));let text='';
    if(/\.txt$/i.test(filename))text=new TextDecoder().decode(bytes);
    else if(/\.docx$/i.test(filename)){
      const raw=await openZipText(bytes,'word/document.xml');text=raw.replace(/<\/w:p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&amp;/g,'&');
    } else if(/\.pdf$/i.test(filename))throw Error('Browser document screening supports TXT and DOCX. Open PDFs in the built-in reader; PDF text screening requires an additional parser.');
    else throw Error('Choose TXT or DOCX');
    if(!text.trim())throw Error('No searchable text found');
    const content=text.toLowerCase();const checks=[
      ['Pay and wages',['salary','wage','deduction','minimum wage','payroll'],'Review payment terms, wage definitions and deductions.'],
      ['Employment conditions',['employment','contract','termination','notice','probation'],'Review appointment conditions, notice requirements and employment classification.'],
      ['Social security',['pf','provident fund','esic','esi','gratuity','maternity'],'Check eligible schemes and contribution requirements.'],
      ['Workplace safety',['hazard','accident','safety','health check','protective equipment'],'Review safety duties, workplace rules and incident procedures.'],
      ['Hours and leave',['shift','hours','overtime','leave','holiday'],'Review work schedules, rest, overtime and leave requirements.']
    ];
    return {filename:filename.slice(0,160),characters:text.length,findings:checks.map(([topic,terms,guidance])=>({topic,detected:terms.some(t=>content.includes(t)),guidance})),notice:'Local keyword screening only. Not a legal compliance determination. Confirm applicable law and professional advice.'};
  }
  function openPdf(code,page=1){
    if(!(code in codes))return;
    page=Math.max(1,Math.min(codes[code],Number(page)||1));
    const src=pdfPath(code)+'#page='+page+'&zoom=page-width';
    const previous=document.getElementById('lcp-web-pdf');previous?.remove();
    const modal=document.createElement('div');modal.id='lcp-web-pdf';modal.className='lcp-web-pdf';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label',names[code]+' original PDF');
    modal.innerHTML=`<header class="lcp-pdf-top"><span class="lcp-pdf-title">${names[code]} <small>Original Gazette · page ${page}/${codes[code]}</small></span><a class="lcp-pdf-button" href="${src}" target="_blank" rel="noopener" title="Use your browser's zoom controls">Open in new tab ↗</a><a class="lcp-pdf-button" href="${pdfPath(code)}" download="${code}.pdf">Save PDF</a><button class="lcp-pdf-button lcp-pdf-close" aria-label="Close PDF reader">Close ✕</button></header><main class="lcp-pdf-frame"><iframe title="Full ${names[code]}" src="${src}"></iframe><div class="lcp-pdf-help">Pinch or use your browser's PDF zoom controls to enlarge pages. On some mobile browsers, open the PDF in a new tab.</div></main>`;
    document.body.appendChild(modal);document.body.classList.add('lcp-pdf-open');modal.querySelector('button').addEventListener('click',()=>{modal.remove();document.body.classList.remove('lcp-pdf-open')});
  }
  function extrasList(){try{return JSON.parse(localStorage.getItem(extrasKey)||'[]')}catch{return []}}
  function extrasSave(items){try{localStorage.setItem(extrasKey,JSON.stringify(items))}catch(_){}}
  async function idb(){return new Promise((resolve,reject)=>{const open=indexedDB.open('lcp-supplementary-web',1);open.onupgradeneeded=()=>open.result.createObjectStore('pdfs');open.onsuccess=()=>resolve(open.result);open.onerror=()=>reject(open.error)})}
  async function idbPut(key,bytes){const db=await idb();return new Promise((resolve,reject)=>{const tx=db.transaction('pdfs','readwrite');tx.objectStore('pdfs').put(bytes,key);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
  async function idbGet(key){const db=await idb();return new Promise((resolve,reject)=>{const tx=db.transaction('pdfs');const req=tx.objectStore('pdfs').get(key);req.onsuccess=()=>{db.close();resolve(req.result)};req.onerror=()=>{db.close();reject(req.error)}})}
  async function importSupplementary(title){const picker=document.createElement('input');picker.type='file';picker.accept='.pdf,application/pdf';picker.style.display='none';document.body.appendChild(picker);picker.onchange=async()=>{try{const file=picker.files?.[0];if(!file)return;if(file.size>15*1024*1024)throw Error('Supplementary PDF exceeds 15 MB');const id=crypto.randomUUID();await idbPut(id,await file.arrayBuffer());const item={id,title:String(title||file.name).slice(0,110),filename:file.name,pages:'unknown',imported:true,date:new Date().toISOString().slice(0,10)};extrasSave([...extrasList(),item]);window.lcpOnSupplementaryImported?.(JSON.stringify(item))}catch(err){alert('Import failed: '+err.message)}finally{picker.remove()}};picker.click()}
  async function openSupplementary(id){try{const data=await idbGet(id);if(!data)throw Error('The locally imported document is unavailable');const blob=new Blob([data],{type:'application/pdf'}),url=URL.createObjectURL(blob);window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000)}catch(err){alert(err.message)}}
  const bridge={
    isBrowserAdapter:true,
    loadState(){try{return localStorage.getItem(STORAGE_KEY)||'{}'}catch{return '{}'}},
    saveState(json){try{if(json.length>1_000_000)return;JSON.parse(json);localStorage.setItem(STORAGE_KEY,json)}catch(e){console.warn('Local progress save failed',e)}},
    actStatus(){const ret={};for(const [code,pages] of Object.entries(codes))ret[code]={cached:true,bundled:true,imported:false,verifiedAgainstAttachment:true,pages,bytes:0,sha256:hashes[code]};return JSON.stringify(ret)},
    openAct:code=>openPdf(code,1),openActAtPage:openPdf,
    importAct:code=>openPdf(code,1),
    analyzeDocument(name,b64){reviewDocument(name,b64).then(data=>window.onAndroidDocumentResult?.(JSON.stringify(data))).catch(error=>window.onAndroidDocumentResult?.(JSON.stringify({error:error.message})))},
    exportXlsx(name,data){try{triggerDownload(excelBlob(JSON.parse(data)),name)}catch(e){alert('Excel export failed: '+e.message)}},
    exportDocx(name,data){try{triggerDownload(docxBlob(JSON.parse(data)),name)}catch(e){alert('Word export failed: '+e.message)}},
    saveBase64(name,mime,b64){try{const b=atob(b64),bytes=Uint8Array.from(b,x=>x.charCodeAt(0));triggerDownload(new Blob([bytes],{type:mime||'application/octet-stream'}),name)}catch(e){alert('Download failed: '+e.message)}},
    listSupplementaryPdfs:()=>JSON.stringify(extrasList()),importSupplementaryPdf:importSupplementary,openSupplementaryPdf:openSupplementary,
    shareText(subject,body){if(navigator.share){navigator.share({title:subject,text:body}).catch(()=>navigator.clipboard?.writeText(body))}else if(navigator.clipboard?.writeText)navigator.clipboard.writeText(body).then(()=>window.toast?.('Report copied to clipboard')).catch(()=>window.prompt('Copy report',body));else window.prompt('Copy report',body)},
    printCurrent(){window.print()},finishApp(){window.toast?.('Close this browser tab to exit the web app')},
    speakText(text){if(!('speechSynthesis'in window)){window.toast?.('Speech unavailable in this browser');return}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text).slice(0,5000));u.lang='en-IN';u.rate=.92;speechSynthesis.speak(u)},
    stopSpeaking(){window.speechSynthesis?.cancel()},
    startSpeechInput(){const C=window.SpeechRecognition||window.webkitSpeechRecognition;if(!C){window.toast?.('Voice input is not supported in this browser');return}const r=new C();r.lang='en-IN';r.onresult=e=>window.lcpOnSpeech?.(e.results[0][0].transcript);r.start()},
    async askSecureTutor(endpoint,bearer,question,contextJson){try{const u=new URL(endpoint);if(u.protocol!=='https:')throw Error('A HTTPS backend is required');if(!bearer||bearer.length<8)throw Error('Backend token missing');const res=await fetch(u.href,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+bearer},body:JSON.stringify({question,context:JSON.parse(contextJson),locale:'en-IN'})});const data=await res.json();if(!res.ok)throw Error(data.error||'Request failed');window.lcpOnCloudReply?.(JSON.stringify(data))}catch(e){window.lcpOnCloudReply?.(JSON.stringify({error:'Cloud request failed: '+e.message+'. Check CORS settings on your backend.'}))}}
  };
  window.AndroidBridge=Object.freeze(bridge);
  window.LCPWeb={openPdf,excelBlob,docxBlob,zipStore,reviewDocument,download:triggerDownload,codes};
})();
