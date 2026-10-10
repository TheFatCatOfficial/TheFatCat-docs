const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(process.argv[2] || '_site');
assert.ok(fs.existsSync(path.join(root, 'index.html')), 'Build the Jekyll site before running UI checks.');

const server = http.createServer((req, res) => {
  let name;
  try {
    name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/TheFatCat-docs/, '');
  } catch (error) {
    res.writeHead(400).end();
    return;
  }
  if (name.endsWith('/')) name += 'index.html';
  const file = path.resolve(root, '.' + name);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    res.writeHead(404).end();
    return;
  }
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});

async function main() {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  let browser;
  try {
    const origin = 'http://127.0.0.1:' + server.address().port;
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const externalRequests = [];
    context.on('request', request => {
      if (new URL(request.url()).origin !== origin) externalRequests.push(request.url());
    });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) return route.continue();
      if (url.hostname === 'chatgpt.com' || url.hostname === 'claude.ai') {
        return route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>AI sharing check</title>' });
      }
      return route.abort();
    });
    const page = await context.newPage();
    const errors = [];
    const failures = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('response', response => {
      if (response.url().startsWith(origin) && response.status() >= 400) failures.push(response.url());
    });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.testCopiedText = text; } } });
    });

    await page.goto(origin + '/TheFatCat-docs/protocol.html', { waitUntil: 'load' });
    await page.locator('.site-nav a[href="/TheFatCat-docs/guides.html"]').click();
    await page.waitForURL('**/guides.html');
    await page.locator('.site-nav a[href="/TheFatCat-docs/protocol.html"]').click();
    await page.waitForURL('**/protocol.html');

    await page.locator('#search-input').fill('Belly');
    await page.locator('.search-result').first().waitFor();
    assert.ok((await page.locator('.search-result').first().getAttribute('href')).startsWith('/TheFatCat-docs/protocol/'));
    await page.locator('#search-input').blur();
    await page.locator('#lang-btn-zh').click();
    await page.waitForURL('**/zh/protocol.html');
    await page.locator('#search-input').focus();
    await page.waitForFunction(() => {
      const results = Array.from(document.querySelectorAll('.search-result'));
      return results.length > 0 && results.every(link => link.getAttribute('href').startsWith('/TheFatCat-docs/zh/'));
    });

    const hashLink = page.locator('.search-result[href*="#"]').first();
    const hashHref = await hashLink.getAttribute('href');
    assert.ok(hashHref.includes('%'), 'Exercise an encoded Chinese heading.');
    const prefetched = page.waitForResponse(response => response.url() === new URL(hashHref, origin).href.split('#')[0]);
    await hashLink.hover();
    await (await prefetched).finished();
    await page.waitForTimeout(50);
    await hashLink.click();
    await page.waitForURL(origin + hashHref);
    assert.equal(await page.evaluate(() => !!document.getElementById(decodeURIComponent(location.hash.slice(1)))), true);
    assert.equal(await page.locator('.site-nav a[href*="/contracts"]').count(), 0);
    await page.locator('.site-nav a[href="/TheFatCat-docs/zh/safety.html"]').click();
    await page.waitForURL('**/zh/safety.html');
    await page.locator('.site-nav a[href="/TheFatCat-docs/zh/safety/monitoring.html"]').click();
    await page.waitForURL('**/zh/safety/monitoring.html');
    assert.equal(await page.locator('#main-content table').count(), 0);

    await page.locator('#tfc-ai-btn-dropdown').click();
    await page.locator('#tfc-action-mcp').click();
    const modal = page.locator('#tfc-mcp-modal');
    assert.equal(await modal.getAttribute('role'), 'dialog');
    assert.equal(await modal.getAttribute('aria-modal'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-mcp-close');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await page.evaluate(() => document.activeElement.classList.contains('tfc-mcp-copy-code')), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-mcp-close');
    const copyButton = page.locator('[data-target="llms-urls-code"]');
    await copyButton.click();
    await page.waitForFunction(() => window.testCopiedText && window.testCopiedText.includes('llms-full-zh.txt'));
    await page.waitForFunction(() => document.querySelector('[data-target="llms-urls-code"] .tfc-mcp-zh'));
    assert.equal((await copyButton.innerText()).trim(), '复制全部链接');
    await page.keyboard.press('Escape');
    assert.equal(await modal.getAttribute('aria-hidden'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-ai-btn-dropdown');

    for (const language of ['', 'zh/']) {
      await page.goto(origin + '/TheFatCat-docs/' + language + 'protocol/belly.html?private-query-marker=1#private-fragment-marker', { waitUntil: 'load' });
      await page.waitForFunction(() => window.katex && window.katex.version === '0.19.0' && document.querySelectorAll('.katex').length > 0);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.katex-error').count(), 0);
      assert.equal(await page.locator('meta[name="referrer"]').getAttribute('content'), 'no-referrer');
    }
    assert.deepEqual(externalRequests, [], 'Reading and rendering formulas must not request third-party resources.');

    for (const service of ['chatgpt', 'claude']) {
      await page.locator('#tfc-ai-btn-dropdown').click();
      const popupCreated = context.waitForEvent('page');
      await page.locator('#tfc-action-' + service).click();
      const popup = await popupCreated;
      await popup.waitForLoadState('load');
      const prompt = new URL(popup.url()).searchParams.get('q');
      assert.ok(prompt.includes(origin + '/TheFatCat-docs/zh/protocol/belly.html'));
      assert.ok(!prompt.includes('private-query-marker') && !prompt.includes('private-fragment-marker'), 'AI sharing must remove page query strings and fragments.');
      assert.equal(await popup.evaluate(() => window.opener), null);
      assert.equal(await popup.evaluate(() => document.referrer), '');
      await popup.close();
    }
    assert.equal(externalRequests.length, 2, 'Only deliberate AI sharing may open the two external service pages.');
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log('UI checks passed: sidebar return, language search, encoded cached anchors, dialog focus, bilingual copy, local formula resources and private AI sharing URLs.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
