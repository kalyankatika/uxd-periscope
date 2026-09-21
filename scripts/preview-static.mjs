import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '../static-site'));
const port = Number(process.env.PORT || 3001);
const prefix = (process.env.PERISCOPE_BASE_PATH || '').replace(/\/$/, '');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const insideRoot = (path) => path === root || path.startsWith(root + sep);
createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (prefix && pathname !== prefix && !pathname.startsWith(prefix + '/')) throw new Error('Missing prefix');
    let file = resolve(root, '.' + (pathname.slice(prefix.length) || '/'));
    if (!insideRoot(file)) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    file = await realpath(file);
    if (!insideRoot(file)) throw new Error('Outside root');
    const content = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Content-Length': content.length, 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found');
  }
}).listen(port, '127.0.0.1', () => console.log(`Periscope static preview: http://127.0.0.1:${port}${prefix}/`));
