/* eslint-env node */
/* eslint-disable no-console */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as http from 'http';
import mime from 'mime';
import * as path from 'path';
import WebSocket, { WebSocketServer } from 'ws';

// Options

const argv = process.argv.slice(2);
const webroot = path.resolve(argv.shift());
const port = parseInt(process.env.PORT, 10) || 8080;

// File transforms

const clientJS = fs.readFileSync(
  import.meta.resolve('./client.js').replace(/^file:\/\//, ''),
);

function transformFileContents(file, contents) {
  const ext = path.extname(file);

  if (ext === '.html') {
    return contents
      .toString()
      .replace(
        '</title>',
        `</title> <script type="module">${clientJS}</script>`,
      );
  }

  return contents;
}

// Static file resolution

const fileCache = new Map();

async function readFileCached(file) {
  const cached = fileCache.get(file);
  if (cached) return cached;

  const promise = readFile(file);
  fileCache.set(file, promise);

  return promise;
}

async function readFile(file) {
  const stat = await fs.promises.lstat(file);

  if (stat.isDirectory()) {
    file = path.join(file, 'index.html');
  }

  const contents = transformFileContents(
    file,
    await fs.promises.readFile(file),
  );
  const contentType = mime.getType(file) ?? 'application/octet-stream';
  const version = crypto.createHash('sha1').update(contents).digest('base64');

  return { contents, contentType, version };
}

function invalidateFile(file) {
  fileCache.delete(file);
}

// HTTP server

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('content-type', 'text/plain');
    res.writeHead(405);
    res.end('405 Method not allowed');

    return;
  }

  const url = new URL(req.url, `http://localhost:${port}`);

  try {
    let file = path.join(webroot, path.resolve('.', url.pathname));
    let { contents, contentType, version } = await readFileCached(file);

    if (req.headers['if-none-match'] === version) {
      res.writeHead(304);
      res.end();

      return;
    }

    res.setHeader('content-type', contentType);
    res.setHeader('etag', version);
    res.writeHead(200);

    if (req.method === 'HEAD') {
      res.end();
    } else {
      res.end(contents);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.setHeader('content-type', 'text/plain');
      res.writeHead(404);
      res.end('404 Not found');
    } else {
      console.error(err);

      res.setHeader('content-type', 'text/plain');
      res.writeHead(500);
      res.end(`500 Internal server error: ${err.message}`);
    }
  }
});

server.on('listening', () => {
  console.log(`Serving ${webroot} on port ${server.address().port}`);
});

server.listen(port);

// WebSocket server

const webSocketServer = new WebSocketServer({ server });
const webSockets = new Set();

webSocketServer.on('connection', (webSocket) => {
  webSockets.add(webSocket);
});

function broadcast(message) {
  for (const webSocket of webSockets) {
    if (webSocket.readyState === WebSocket.OPEN) {
      webSocket.send(JSON.stringify(message));
    } else {
      webSockets.delete(webSocket);
      webSocket.terminate();
    }
  }
}

// File watcher

const fileWatcher = fs.watch(webroot, { recursive: true });

fileWatcher.on('change', (_, filename) => {
  invalidateFile(path.join(webroot, filename));
  broadcast({ type: 'modified', url: filename });
});
