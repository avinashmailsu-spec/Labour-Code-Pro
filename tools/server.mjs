import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../site');
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.txt':'text/plain; charset=utf-8'};
const port=Number(process.env.PORT||4173);
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(ROOT,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(ROOT+path.sep)&&file!==ROOT){res.writeHead(403).end('Forbidden');return}
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404,{'Content-Type':'text/plain'}).end('Not found');return}
  res.setHeader('Content-Type',MIME[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-cache');
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  if(file.endsWith('.pdf'))res.setHeader('Accept-Ranges','bytes');
  fs.createReadStream(file).pipe(res);
 });
});
server.listen(port,'127.0.0.1',()=>console.log(`LabourCode Pro running at http://127.0.0.1:${port}`));
