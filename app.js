// Simple web app with zero dependencies (only Node.js built-ins)
const http = require('http');

const VERSION = process.env.APP_VERSION || 'dev';

function handler(req, res) {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', version: VERSION }));
  }
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    return res.end(`<h1>Hello from my DevOps pipeline!</h1><p>Version: ${VERSION}</p>`);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

const server = http.createServer(handler);

// Only start listening when run directly (not when imported by tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`App running on port ${PORT}`));
}

module.exports = server;
