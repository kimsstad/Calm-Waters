const http = require('http');
const https = require('https');
const { URL } = require('url');
const {
  getPropertyFeedConfig,
  mergeAvailabilityForProperty
} = require('./scripts/availability-core');

const PORT = 4179;
const HOST = '127.0.0.1';

function send(res, statusCode, body, contentType = 'text/plain; charset=utf-8') {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    'Content-Type': contentType
  });
  res.end(body);
}

function fetchRemoteText(targetUrl) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(targetUrl);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const request = client.get(parsedUrl, (response) => {
      if ((response.statusCode || 0) >= 300 && (response.statusCode || 0) < 400 && response.headers.location) {
        const redirectedUrl = new URL(response.headers.location, parsedUrl).toString();
        response.resume();
        fetchRemoteText(redirectedUrl).then(resolve).catch(reject);
        return;
      }

      if ((response.statusCode || 0) >= 400) {
        response.resume();
        reject(new Error('Upstream HTTP ' + response.statusCode));
        return;
      }

      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        body += chunk;
      });
      response.on('end', () => resolve(body));
    });

    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy(new Error('Upstream timeout'));
    });
  });
}

const server = http.createServer(async (req, res) => {
  if (!req.url) {
    send(res, 400, 'Missing request URL');
    return;
  }

  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  const requestUrl = new URL(req.url, `http://${HOST}:${PORT}`);

  if (requestUrl.pathname === '/health') {
    send(res, 200, 'ok');
    return;
  }

  if (requestUrl.pathname === '/api/availability') {
    const property = (requestUrl.searchParams.get('property') || '').trim();
    if (!property) {
      send(res, 400, JSON.stringify({
        error: 'Missing property query parameter'
      }), 'application/json; charset=utf-8');
      return;
    }

    const feedConfig = getPropertyFeedConfig(property);
    if (!feedConfig) {
      send(res, 404, JSON.stringify({
        error: 'No availability feed configuration found for "' + property + '"'
      }), 'application/json; charset=utf-8');
      return;
    }

    try {
      const payload = await mergeAvailabilityForProperty(property);
      send(res, 200, JSON.stringify(payload), 'application/json; charset=utf-8');
    } catch (error) {
      send(res, 500, JSON.stringify({
        error: error.message || 'Availability request failed'
      }), 'application/json; charset=utf-8');
    }
    return;
  }

  if (requestUrl.pathname !== '/api/ical-proxy') {
    send(res, 404, 'Not found');
    return;
  }

  const targetUrl = requestUrl.searchParams.get('url') || '';
  if (!targetUrl) {
    send(res, 400, 'Missing url query parameter');
    return;
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch (error) {
    send(res, 400, 'Invalid target URL');
    return;
  }

  if (!['https:', 'http:'].includes(parsedTarget.protocol)) {
    send(res, 400, 'Only http and https URLs are allowed');
    return;
  }

  try {
    const text = await fetchRemoteText(parsedTarget.toString());
    send(res, 200, text, 'text/calendar; charset=utf-8');
  } catch (error) {
    send(res, 502, error.message || 'Upstream request failed');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Local availability server listening on http://${HOST}:${PORT}`);
});
