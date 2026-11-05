import http from 'node:http';
import path from 'node:path';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.wav':'audio/wav','.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.png':'image/png','.json':'application/json','.woff2':'font/woff2'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{try{const route=decodeURIComponent(new URL(req.url,'http://local').pathname);let file=path.resolve(root,'.'+route);if(file!==root&&!file.startsWith(root+path.sep))throw Error();if((await stat(file)).isDirectory())file=path.join(file,'index.html');const type=types[path.extname(file)];if(!type)throw Error();res.writeHead(200,{'Content-Type':type});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${port}/`));
