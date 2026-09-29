/**
 * HTTP server: serves public/ and POST /api/extract with OCR AI.
 * The AI key is read from environment variable OCR_API_KEY.
 * If no key is set, responds with error "OCR no disponible".
 */

import { createReadStream } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

/**
 * Start the server.
 * @param {Object} options
 * @param {number} options.port - Port to listen on (default: 3000)
 * @param {string} options.publicDir - Public directory path (default: join(__dirname, '../public'))
 * @returns {import('node:http').Server}
 */
export function startServer(options = {}) {
  const { port = 3000, publicDir = join(__dirname, '../public') } = options;
  const aiKey = process.env.OCR_API_KEY || '';

  const server = require('node:http').createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // POST /api/extract
    if (req.method === 'POST' && req.url === '/api/extract') {
      if (!aiKey) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OCR no disponible' }));
        return;
      }

      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
        return;
      }

      const { image, text } = data;

      try {
        // Call the AI endpoint
        const response = await fetch(process.env.OCR_ENDPOINT || 'https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${aiKey}`,
          },
          body: JSON.stringify({
            model: process.env.OCR_MODEL || 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: text || [{ type: 'input_image', image_url: image }],
              },
            ],
          }),
        });

        const result = await response.json();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'AI request failed', details: err.message }));
      }
      return;
    }

    // Serve static files from public/
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = join(publicDir, filePath);

    const ext = extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const stream = createReadStream(filePath);
      stream.on('open', () => {
        res.writeHead(200, { 'Content-Type': contentType });
        stream.pipe(res);
      });
      stream.on('error', () => {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      });
    } catch (e) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return server;
}