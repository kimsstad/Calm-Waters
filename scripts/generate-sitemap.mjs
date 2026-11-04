import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = `https://${readFileSync(new URL('../CNAME', import.meta.url), 'utf8').trim()}`;
const pages = execFileSync('git', ['ls-files', '-z', '--', '*.html'], {
  cwd: root,
  encoding: 'utf8',
}).split('\0').filter(Boolean);
const urls = new Set();

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)]
      .map(([, name, , value]) => [name.toLowerCase(), value]),
  );
}

for (const page of pages) {
  const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
  const excluded = [...html.matchAll(/<meta\b[^>]*>/gi)].some(([tag]) => {
    const meta = attributes(tag);
    return /^(robots|googlebot)$/i.test(meta.name ?? '')
      && /\bnoindex\b/i.test(meta.content ?? '');
  });
  if (excluded) continue;

  const canonical = [...html.matchAll(/<link\b[^>]*>/gi)]
    .map(([tag]) => attributes(tag))
    .find((link) => /\bcanonical\b/i.test(link.rel ?? ''));
  if (!canonical?.href) throw new Error(`Missing canonical URL: ${page}`);

  const url = new URL(canonical.href);
  const expectedPath = page === 'index.html' ? '/' : `/${page}`;
  if (url.origin !== origin || decodeURIComponent(url.pathname) !== expectedPath
      || url.search || url.hash || url.username || url.password) {
    throw new Error(`Canonical URL does not match the public page: ${page}`);
  }
  urls.add(url.href);
}

if (urls.size === 0) throw new Error('No public pages found for the sitemap.');

function escapeXml(value) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

const entries = [...urls].sort().map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`);
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries,
  '</urlset>',
  '',
].join('\n');
writeFileSync(new URL('../sitemap.xml', import.meta.url), sitemap, 'utf8');
console.log(`Generated sitemap.xml with ${urls.size} canonical page URLs.`);
