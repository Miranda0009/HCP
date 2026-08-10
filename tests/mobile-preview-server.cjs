const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { extname, resolve, sep } = require('node:path');

const projectRoot = resolve(__dirname, '..');
const port = Number(process.env.HCP_PREVIEW_PORT || 4173);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
    const relativePath = pathname === '/' ? 'html/painel.html' : pathname.replace(/^\/+/, '');
    const filePath = resolve(projectRoot, relativePath);

    if (filePath !== projectRoot && !filePath.startsWith(`${projectRoot}${sep}`)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    const extension = extname(filePath).toLowerCase();
    let content = await readFile(filePath);
    if (extension === '.html') {
      content = Buffer.from(content.toString('utf8').replace(
        /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@[^\"]+"><\/script>/,
        '<script src="/tests/supabase-browser-mock.js"></script>'
      ));
    }

    response.writeHead(200, {
      'Cache-Control': 'no-store',
      'Content-Type': mimeTypes[extension] || 'application/octet-stream'
    });
    response.end(content);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`HCP mobile preview: http://127.0.0.1:${port}`);
});
