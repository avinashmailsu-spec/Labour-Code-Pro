import {readFileSync,statSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import path from 'node:path';
const site=path.resolve('site');let failures=0;
const checks={wages:[29,69,'0d17b967a528da2d6b827655ba9a701dc15d78b4d4f58b9bbc21d6789a680c85'],industrial:[56,104,'43cadbd9ed08dd00dfba43571253eaf63d655f9fc411df5b9a1059de8d40ce09'],security:[116,164,'975235e57b8b8c3f4a09f6c9f0dbb2bfc663c15faf3715108ea33113ef565be7'],osh:[86,143,'9ce8f68b88f725fbce4fadfb45d9ddc3ed7a5f59d92a2ebd3d5bd7ebb1c83891']};
for(const [id,[pages,sections,expectedHash]] of Object.entries(checks)){
 const pdf=readFileSync(path.join(site,'assets/acts',id+'.pdf'));
 const json=JSON.parse(readFileSync(path.join(site,'assets/legal',id+'.json')));
 const valid=pdf.slice(0,5).toString()==='%PDF-' && json.pages.length===pages && json.sections.length===sections && pdf.length>100000 && createHash('sha256').update(pdf).digest('hex')===expectedHash;
 if(!valid)failures++;
 console.log(`${valid?'PASS':'FAIL'} ${id}: ${pdf.length} PDF bytes; ${json.pages.length}/${pages} pages; ${json.sections.length}/${sections} sections; SHA256 ${createHash('sha256').update(pdf).digest('hex').slice(0,14)}…`);
}
for(const file of ['index.html','web-bridge.js','web-edition.js','web-edition.css','app.js','data.js','manifest.webmanifest','sw.js','search-studio-v1.js','visual-learning-v11.js','modern-studio-v12.css','modern-studio-v12.js','assets/logo.png']){
 try{const bytes=statSync(path.join(site,file)).size;if(!bytes)throw Error('empty');console.log('PASS asset:',file,bytes,'bytes')}catch(e){console.log('FAIL asset:',file,e.message);failures++}
}
const html=readFileSync(path.join(site,'index.html'),'utf8');
if(!html.includes('src="web-bridge.js"')||!html.includes('src="web-edition.js"')||html.indexOf('web-bridge.js')>html.indexOf('app.js')){console.error('FAIL web bridge is not loaded before app code');failures++}
if(failures){console.error(failures+' checks failed');process.exit(1)}
console.log('PASS: Legal library and required web files verified');
