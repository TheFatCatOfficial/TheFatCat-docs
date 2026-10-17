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

    await page.locator('#search-input').fill('核心');
    await page.waitForFunction(() => document.querySelector('#search-input').getAttribute('aria-busy') === 'false');
    assert.equal(await page.locator('.search-result').count(), 0, 'A Chinese query must not return unrelated English pages.');
    assert.match(await page.locator('#search-results').innerText(), /No results found in English docs/);

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
    async function checkFocusedMatch(expected) {
      await page.waitForFunction(() => document.activeElement.matches('mark.tfc-search-hit'));
      const hit = page.locator('mark.tfc-search-hit:focus');
      assert.match(await hit.innerText(), expected);
      const box = await hit.boundingBox();
      assert.ok(box && box.y >= 0 && box.y < 900, 'The clicked match must be visible in the article.');
    }
    await checkFocusedMatch(/Belly/i);
    await page.reload({ waitUntil: 'load' });
    await checkFocusedMatch(/Belly/i);
    // Matching across inline formatting must retain the original emphasis.
    await page.evaluate(() => {
      const paragraph = document.createElement('p');
      paragraph.id = 'search-inline-fixture';
      paragraph.innerHTML = 'Be<strong>lly</strong>';
      document.querySelector('#main-content main').appendChild(paragraph);
      window.tfcHighlightSearch();
    });
    assert.equal(await page.locator('#search-inline-fixture strong mark').innerText(), 'lly');
    await checkFocusedMatch(/Belly/i);

    await page.locator('#search-input').fill('核心');
    await page.locator('.search-result').first().waitFor();
    const chineseMatches = await page.locator('.search-result').evaluateAll(links => links.map(link => ({
      href: link.getAttribute('href'), text: link.textContent
    })));
    assert.ok(chineseMatches.every(match => match.href.startsWith('/TheFatCat-docs/zh/') && match.text.includes('核心')));
    await page.locator('.search-result').first().click();
    await checkFocusedMatch(/核心/);
    for (const term of ['核心量子猫猫词', '   ', '***']) {
      await page.locator('#search-input').fill(term);
      await page.locator('.search-no-result').waitFor();
      assert.equal(await page.locator('.search-result').count(), 0, 'Empty or unmatched queries must not list the site.');
    }
    await page.locator('#search-input').blur();
    await page.locator('#lang-btn-en').click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.locator('#search-input').fill('bellyx');
    await page.locator('.search-result').first().waitFor();
    await page.locator('.search-result').first().click();
    await checkFocusedMatch(/Belly/i);
    assert.equal(new URL(page.url()).searchParams.get('q'), 'bellyx');
    await page.goBack();
    await page.waitForFunction(() => !document.querySelector('mark.tfc-search-hit'));
    await page.goForward();
    await checkFocusedMatch(/Belly/i);
    await page.locator('#lang-btn-zh').click();
    await page.waitForFunction(() => document.documentElement.lang === 'zh');
    assert.equal(await page.locator('.site-nav a[href*="/contracts"]').count(), 0);
    await page.locator('.site-nav a[href="/TheFatCat-docs/zh/safety.html"]').click();
    await page.waitForURL('**/zh/safety.html');
    await page.locator('.site-nav a[href="/TheFatCat-docs/zh/safety/monitoring.html"]').click();
    await page.waitForURL('**/zh/safety/monitoring.html');
    assert.deepEqual(await page.locator('#main-content table th').allTextContents(), ['暂停环节', '停止的操作']);
    assert.equal(await page.locator('#main-content table tbody tr').count(), 3);
    assert.equal(await page.locator('mark.tfc-search-hit').count(), 0, 'Normal navigation clears search highlights.');

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
      assert.ok(prompt.includes('https://thefatcatofficial.github.io/TheFatCat-docs/zh/protocol/belly.html'));
      assert.ok(!prompt.includes(origin), 'Local preview links must use the published website.');
      assert.equal(await page.locator('#tfc-toast').innerText(), '本地预览将打开线上已发布的页面');
      assert.ok(!prompt.includes('private-query-marker') && !prompt.includes('private-fragment-marker'), 'AI sharing must remove page query strings and fragments.');
      assert.equal(await popup.evaluate(() => window.opener), null);
      assert.equal(await popup.evaluate(() => document.referrer), '');
      await popup.close();
    }
    assert.equal(externalRequests.length, 2, 'Only deliberate AI sharing may open the two external service pages.');
    // Keep documentation controls and wide content usable at the narrowest viewport.
    for (const width of [320, 390, 768, 864, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const language of ['', 'zh/']) {
        await page.goto(origin + '/TheFatCat-docs/' + language, { waitUntil: 'load' });
        assert.equal(await page.locator('.tfc-start-links a').count(), 4);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Homepage overflow at ' + width + ' ' + language);
        assert.ok(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('main p')).fontSize) >= 16));
        if (width >= 768) {
          const header = await page.locator('.main-header').boundingBox();
          const controls = await page.locator('.main-header .header-controls').boundingBox();
          const content = await page.locator('.main-content-wrap').boundingBox();
          assert.ok(controls.y >= header.y && controls.y + controls.height <= header.y + header.height,
            'Wrapped controls must fit inside the header at ' + width);
          assert.ok(content.y >= header.y + header.height, 'Header must not overlap the article at ' + width);
        }
        const trigger = page.locator('#tfc-ai-btn-dropdown');
        await trigger.press('ArrowDown');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-action-copy-md');
        await page.keyboard.press('End');
        assert.ok((await page.evaluate(() => document.activeElement.href)).includes('llms'));
        await page.waitForTimeout(180);
        assert.ok(await page.evaluate(() => {
          const rect = document.getElementById('tfc-ai-dropdown').getBoundingClientRect();
          return rect.left >= 8 && rect.right <= innerWidth - 8 && rect.top >= 8 && rect.bottom <= innerHeight - 8;
        }), 'AI menu bounds at ' + width + ' ' + language);
        await page.keyboard.press('Escape');
        assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-ai-btn-dropdown');
        if (width < 768) {
          await page.locator('#menu-button').click();
          assert.ok(await page.locator('#site-nav #lang-btn-en').isVisible());
          assert.ok(await page.locator('#site-nav #theme-toggle-btn').isVisible());
          assert.equal(await page.locator('#site-nav .aux-nav a').count(), 2);
          await page.keyboard.press('Escape');
          assert.equal(await page.locator('#menu-button').getAttribute('aria-expanded'), 'false');
        }
        if (width >= 768) assert.ok(await page.locator('#site-nav').isVisible(), 'Desktop navigation at ' + width);
        await page.goto(origin + '/TheFatCat-docs/' + language + 'protocol/how-the-machine-runs.html', { waitUntil: 'load' });
        assert.equal(await page.locator('.tfc-flow > li').count(), 5);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Article overflow at ' + width + ' ' + language);
        if (width === 320) {
          const table = page.locator('.table-wrapper').first();
          assert.equal(await table.getAttribute('tabindex'), '0');
          await table.press('ArrowRight');
          await page.waitForFunction(() => document.querySelector('.table-wrapper').scrollLeft > 0);
        }
      }
    }
    for (const width of [320, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const language of ['', 'zh/']) {
        for (const chapter of ['guides/staking', 'guides/diets-and-claiming', 'guides/emergency-exit', 'protocol/belly', 'topology/asset-flows', 'links']) {
          await page.goto(origin + '/TheFatCat-docs/' + language + chapter + '.html', { waitUntil: 'load' });
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Component page overflow: ' + width + ' ' + language + chapter);
          if (width >= 1440) {
            const frame = await page.locator('.main').boundingBox();
            const article = await page.locator('main').boundingBox();
            const left = article.x - frame.x;
            const right = frame.x + frame.width - article.x - article.width;
            assert.ok(article.width >= 1000 && article.width <= 1280, 'Desktop article uses a wider reading area');
            assert.ok(Math.abs(left - right) <= 1, 'Desktop article has balanced side margins');
          }
        }
      }
    }
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const language of ['', 'zh/']) {
        for (const chapter of ['', 'protocol/how-the-machine-runs.html']) {
          await page.goto(origin + '/TheFatCat-docs/' + language + chapter, { waitUntil: 'load' });
          if (width < 768) await page.locator('#menu-button').click();
          if (await page.locator('html').getAttribute('data-theme') !== 'light') await page.locator('#theme-toggle-btn').click();
          if (width < 768) await page.locator('#menu-button').click();
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Light theme overflow');
          await page.locator('#search-input').fill('Belly');
          await page.locator('.search-result').first().waitFor();
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Active search overflow');
          await page.locator('#search-input').fill('');
        }
      }
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(failures, []);
    console.log('UI checks passed: sidebar return, language search, encoded cached anchors, dialog focus, bilingual copy, local formula resources, private AI sharing URLs, responsive controls and bilingual light/dark layouts.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().then(() => require('./test-state.cjs')(root)).catch(error => { console.error(error); process.exitCode = 1; });
