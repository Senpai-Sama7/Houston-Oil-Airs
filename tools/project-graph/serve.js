#!/usr/bin/env node
// Tiny static server for docs/ graph outputs
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..', 'docs');
const port = Number(process.env.PORT || 8088);

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json',
  '.dot': 'text/plain; charset=utf-8',
  '.graphml': 'application/xml',
  '.mmd': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let fp = path.join(root, url === '/' ? 'graph-viewer.html' : url.replace(/^\//,''));
  if (!fp.startsWith(root)) { res.writeHead(403).end('Forbidden'); return; }
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404).end('Not found'); return; }
    const ext = path.extname(fp).toLowerCase();
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    fs.createReadStream(fp).pipe(res);
  });
});

server.listen(port, () => {
  console.log(`📄 Serving docs from ${root}`);
  console.log(`🔗 Open http://localhost:${port}/graph-viewer.html`);
});

