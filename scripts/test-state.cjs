// Browser regressions for navigation, search and clipboard state boundaries.
// Serve the actual build; all external requests are blocked or mocked.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const { chromium } = require('playwright');
let build;
let results;
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/TheFatCat-docs/, ''); }
  catch { res.writeHead(400).end(); return; }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = path.resolve(build, '.' + pathname);
  if (!file.startsWith(build + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  const mime = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
let browser, origin;
const base = '/TheFatCat-docs/';
function deferred() { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; }
async function newPage(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...options });
  await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  await context.addInitScript(() => {
    window.auditCopies = [];
    window.auditRejections = [];
    window.addEventListener('unhandledrejection', event => window.auditRejections.push(String(event.reason)));
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.auditCopies.push(text); } } });
  });
  const page = await context.newPage();
  page.setDefaultTimeout(8000);
  return { context, page };
}
async function goto(page, name = 'protocol.html') {
  await page.goto(origin + base + name, { waitUntil: 'load' });
  await page.waitForTimeout(350);
}
async function clickNav(page, name) {
  await page.evaluate(href => {
    const link = document.querySelector('.site-nav a[href="' + href + '"]');
    if (!link) throw new Error('Missing nav link ' + href);
    link.click();
  }, base + name);
}
async function navigate(page, name) {
  await clickNav(page, name);
  await page.waitForURL(origin + base + name);
  await page.waitForFunction(() => document.querySelector('.main-content-wrap').style.opacity === '1');
}
async function gate(page, pathname) {
  const seen = deferred(), release = deferred();
  await page.route(origin + base + pathname, async route => {
    seen.resolve();
    const override = await release.promise;
    try {
      await route.fulfill(override || { contentType: pathname.endsWith('.json') ? 'application/json' : 'text/html', body: fs.readFileSync(path.join(build, pathname)) });
    } catch (error) {
      // The browser may have already cancelled a deliberately held request.
      if (!/closed|cancel|already handled|Invalid InterceptionId/i.test(String(error))) throw error;
    }
  });
  return { seen: seen.promise, release: release.resolve };
}
async function record(name, run) {
  const start = Date.now();
  try { const details = await run(); results.push({ name, passed: true, elapsedMs: Date.now() - start, details }); console.log('PASS ' + name + ' ' + JSON.stringify(details)); }
  catch (error) { results.push({ name, passed: false, error: String(error), stack: error.stack }); console.error('FAIL ' + name + ': ' + error.stack); }
}
async function main(directory) {
  build = path.resolve(directory || '_site');
  assert.ok(fs.existsSync(path.join(build, 'index.html')), 'Build the site before running state regressions.');
  results = [];
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({ headless: true });
  try {
    await record('D1: browser Back wins over an older response', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { window.AbortController = undefined; });
        await goto(page); await navigate(page, 'guides.html');
        const slow = await gate(page, 'safety.html');
        await clickNav(page, 'safety.html'); await slow.seen;
        await page.evaluate(() => history.back()); await page.waitForURL(origin + base + 'protocol.html');
        await page.waitForFunction(() => document.querySelector('.main-content-wrap').style.opacity === '1');
        const afterBack = await page.evaluate(() => ({ path: location.pathname, title: document.title }));
        slow.release(); await page.waitForTimeout(200);
        const afterOldResponse = await page.evaluate(() => ({ path: location.pathname, title: document.title }));
        assert.equal(afterOldResponse.path, afterBack.path);
        assert.equal(afterOldResponse.title, afterBack.title);
        return { afterBack, afterOldResponse };
      } finally { await context.close(); }
    });
    for (const abortSupported of [true, false]) {
      await record('D1: rapid Back and Forward cancel an older history response (AbortController: ' + abortSupported + ')', async () => {
        const { context, page } = await newPage();
        let slow;
        try {
          if (!abortSupported) await page.addInitScript(() => { window.AbortController = undefined; });
          await goto(page); await navigate(page, 'guides.html');
          const title = await page.title();
          await page.evaluate(() => { window.auditArticle = document.querySelector('main'); });
          slow = await gate(page, 'protocol.html');
          await page.evaluate(() => history.back()); await slow.seen;
          await page.evaluate(() => history.forward()); await page.waitForURL(origin + base + 'guides.html');
          const restoredOpacity = await page.locator('.main-content-wrap').evaluate(el => el.style.opacity);
          slow.release(); await page.waitForTimeout(200);
          assert.equal(page.url(), origin + base + 'guides.html');
          assert.equal(await page.title(), title);
          assert.equal(await page.evaluate(() => window.auditArticle.isConnected), true);
          assert.equal(restoredOpacity, '1');
          return { oldResponseIgnored: true, opacityRestored: true, abortSupported };
        } finally { if (slow) slow.release(); await context.close(); }
      });
    }
    await record('D1: Forward restores the article after failed Back', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page); await navigate(page, 'guides.html');
        const title = await page.title();
        await page.route(origin + base + 'protocol.html', route => route.fulfill({ status: 503, body: 'unavailable' }));
        await page.evaluate(() => history.back());
        await page.locator('#tfc-navigation-error button').waitFor();
        await page.evaluate(() => history.forward()); await page.waitForURL(origin + base + 'guides.html');
        await page.locator('main h1').waitFor();
        assert.equal(await page.title(), title);
        assert.equal(await page.locator('#tfc-navigation-error').count(), 0);
        assert.equal(await page.locator('.main-content-wrap').evaluate(el => el.style.opacity), '1');
        return { articleRestored: true, errorRemoved: true };
      } finally { await context.close(); }
    });
    await record('D1: hash-only Back keeps the rendered article without fetching it', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page, 'protocol/belly.html');
        let articleRequests = 0;
        page.on('request', request => { if (request.resourceType() === 'fetch' && new URL(request.url()).pathname === base + 'protocol/belly.html') articleRequests++; });
        const hashes = await page.locator('main h2[id]').evaluateAll(headings => headings.slice(0, 2).map(heading => heading.id));
        assert.equal(hashes.length, 2);
        await page.evaluate(() => { window.auditArticle = document.querySelector('main'); });
        for (const hash of hashes) {
          await page.evaluate(id => { location.hash = id; }, hash);
          await page.waitForFunction(id => decodeURIComponent(location.hash.slice(1)) === id, hash);
        }
        await page.evaluate(() => history.back());
        await page.waitForFunction(id => decodeURIComponent(location.hash.slice(1)) === id, hashes[0]);
        await page.waitForTimeout(200);
        assert.equal(articleRequests, 0);
        assert.equal(await page.evaluate(() => window.auditArticle.isConnected), true);
        return { articleRequests, originalArticleRetained: true };
      } finally { await context.close(); }
    });
    await record('D1: a later internal click cancels an unresolved navigation', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page); const slow = await gate(page, 'safety.html');
        let guidesRequests = 0; page.on('request', req => { if (req.url() === origin + base + 'guides.html') guidesRequests++; });
        await clickNav(page, 'safety.html'); await slow.seen;
        await clickNav(page, 'guides.html'); await page.waitForURL(origin + base + 'guides.html');
        const state = await page.evaluate(() => ({ path: location.pathname, opacity: document.querySelector('.main-content-wrap').style.opacity }));
        assert.equal(guidesRequests, 1); assert.equal(state.opacity, '1');
        slow.release(); await page.waitForTimeout(200);
        assert.equal(page.url(), origin + base + 'guides.html');
        return { ...state, guidesRequests };
      } finally { await context.close(); }
    });
    await record('D2: empty highlight terms return without looping', async () => {
      const source = fs.readFileSync(path.join(build, 'assets/js/just-the-docs.js'), 'utf8');
      const match = source.match(/  function positionsOf\([\s\S]*?\n  \}/);
      assert.ok(match, 'The built search helper must be available for the boundary test.');
      for (const term of ['', null, 0]) {
        const count = vm.runInNewContext(match[0] + '; positionsOf("abc", ' + JSON.stringify(term) + ').length', {}, { timeout: 1000 });
        assert.equal(count, 0);
      }
      const count = vm.runInNewContext(match[0] + '; positionsOf("banana", "an").length', {}, { timeout: 1000 });
      assert.equal(count, 2);
      return { invalidTermsIgnored: 3, normalMatches: count };
    });
    for (const action of ['Enter', 'click']) {
      await record('D3: search ' + action + ' closes the popup even without visible highlights', async () => {
        const { context, page } = await newPage();
        try {
          await goto(page);
          await page.locator('#search-input').fill('Delta');
          await page.locator('.search-result').first().waitFor();
          const target = new URL(await page.locator('.search-result').first().getAttribute('href'), origin).href;
          if (action === 'Enter') await page.locator('#search-input').press('Enter');
          else await page.locator('.search-result').first().click();
          await page.waitForURL(target);
          await page.waitForFunction(() => document.querySelector('.main-content-wrap').style.opacity === '1');
          assert.equal(await page.locator('html').evaluate(el => el.classList.contains('search-active')), false);
          assert.equal(await page.locator('mark.tfc-search-hit').count(), 0);
          assert.notEqual(await page.evaluate(() => document.activeElement.id), 'search-input');
          return { action, popupClosed: true, visibleHighlights: 0 };
        } finally { await context.close(); }
      });
    }
    await record('D5: missing Markdown metadata resolves HTML and bilingual index paths', async () => {
      const attempts = [];
      for (const [pathname, sourcePath] of [
        [base + 'protocol/belly.html', 'protocol/belly.md'],
        [base + 'zh/', 'zh/index.md'],
        [base + 'index.html', 'index.md'],
        [base + 'zh/index.html', 'zh/index.md'],
        ['/protocol/belly.html', 'protocol/belly.md'],
        ['/zh/', 'zh/index.md']
      ]) {
        const { context, page } = await newPage();
        let rawPath;
        try {
          await page.route('https://raw.githubusercontent.com/**', route => {
            rawPath = new URL(route.request().url()).pathname;
            return route.fulfill({ contentType: 'text/plain', body: '# MARKDOWN_SOURCE' });
          });
          await page.goto(origin + pathname, { waitUntil: 'load' });
          await page.locator('#tfc-action-copy-md').evaluate(el => el.removeAttribute('data-path'));
          await page.locator('#tfc-ai-btn-copy').click();
          await page.waitForFunction(() => window.auditCopies.length > 0);
          assert.equal(rawPath, '/TheFatCatOfficial/TheFatCat-docs/main/' + sourcePath);
          assert.deepEqual(await page.evaluate(() => window.auditCopies), ['# MARKDOWN_SOURCE']);
          attempts.push({ pathname, sourcePath });
        } finally { await context.close(); }
      }
      return { attempts };
    });
    for (const failure of ['http404', 'network', 'raw404']) {
      await record('D5: full-document fallback handles ' + failure + ' without duplicate retries', async () => {
        const { context, page } = await newPage();
        let rawRequests = 0;
        try {
          await page.route(origin + base + 'llms-full.txt', route => failure === 'network'
            ? route.abort('failed') : route.fulfill({ status: 404, body: 'missing' }));
          await page.route('https://raw.githubusercontent.com/**', route => {
            rawRequests++;
            return route.fulfill({ status: failure === 'raw404' ? 404 : 200, contentType: 'text/plain', body: 'RAW_BACKUP_DOCS' });
          });
          await goto(page);
          await page.locator('#tfc-ai-btn-dropdown').click();
          await page.locator('#tfc-action-copy-full').click();
          await page.waitForFunction(() => document.querySelector('#tfc-toast').classList.contains('show'));
          assert.equal(rawRequests, 1);
          assert.deepEqual(await page.evaluate(() => window.auditCopies), failure === 'raw404' ? [] : ['RAW_BACKUP_DOCS']);
          if (failure === 'raw404') assert.match(await page.locator('#tfc-toast').innerText(), /Copy failed/);
          return { failure, rawRequests, success: failure !== 'raw404' };
        } finally { await context.close(); }
      });
    }
    await record('D5: a superseded full-document download never starts its Raw fallback', async () => {
      const { context, page } = await newPage();
      let slow, rawFullRequests = 0;
      try {
        slow = await gate(page, 'llms-full.txt');
        await page.route('https://raw.githubusercontent.com/**', route => {
          if (route.request().url().endsWith('/llms-full.txt')) rawFullRequests++;
          return route.fulfill({ contentType: 'text/plain', body: 'LATEST_PAGE' });
        });
        await goto(page);
        await page.locator('#tfc-ai-btn-dropdown').click();
        await page.locator('#tfc-action-copy-full').click(); await slow.seen;
        await page.locator('#tfc-ai-btn-copy').click();
        await page.waitForFunction(() => window.auditCopies.length > 0);
        slow.release({ status: 404, body: 'missing' }); await page.waitForTimeout(200);
        assert.equal(rawFullRequests, 0);
        assert.deepEqual(await page.evaluate(() => window.auditCopies), ['LATEST_PAGE']);
        assert.deepEqual(await page.evaluate(() => window.auditRejections), []);
        return { rawFullRequests, latestPageRetained: true };
      } finally { if (slow) slow.release(); await context.close(); }
    });
    await record('Control: local AI sharing uses the published host and the current PJAX page', async () => {
      const attempts = [];
      for (const [canonical, publishedOrigin] of [
        ['http://localhost:4000' + base + 'protocol.html', 'https://thefatcatofficial.github.io'],
        ['https://docs.example.test' + base + 'protocol.html', 'https://docs.example.test'],
        [null, 'https://thefatcatofficial.github.io']
      ]) {
        const { context, page } = await newPage();
        try {
          await page.addInitScript(() => {
            window.auditShareUrl = null;
            window.open = url => { window.auditShareUrl = url; return null; };
          });
          await goto(page); await navigate(page, 'guides.html');
          await page.evaluate(href => {
            const link = document.querySelector('link[rel="canonical"]');
            if (href) link.href = href;
            else link.remove();
            history.replaceState(null, '', location.pathname + '?private-query-marker=1#private-fragment-marker');
          }, canonical);
          await page.locator('#tfc-ai-btn-dropdown').click();
          await page.locator('#tfc-action-chatgpt').click();
          const prompt = new URL(await page.evaluate(() => window.auditShareUrl)).searchParams.get('q');
          assert.ok(prompt.includes(publishedOrigin + base + 'guides.html'));
          assert.ok(!prompt.includes(origin) && !prompt.includes('private-query-marker') && !prompt.includes('private-fragment-marker'));
          attempts.push({ canonical, publishedOrigin });
        } finally { await context.close(); }
      }
      return { attempts, currentPagePreserved: true };
    });
    await record('Control: token tickers remain text beside a second dollar sign', async () => {
      const { context, page } = await newPage();
      try {
        for (const name of ['', 'zh/', 'guides/seniority-certificates.html', 'zh/guides/seniority-certificates.html']) {
          await goto(page, name);
          await page.waitForFunction(() => typeof window.renderMathInElement === 'function');
          const tickers = page.locator('main code').filter({ hasText: '$FATCAT' });
          assert.ok(await tickers.count() > 0);
          for (const ticker of await tickers.all()) {
            const mathCount = await ticker.evaluate(el => {
              const paragraph = el.closest('p, li');
              paragraph.appendChild(document.createTextNode(' Price: $5.'));
              window.tfcRenderMath(paragraph);
              return paragraph.querySelectorAll('.katex').length;
            });
            assert.equal(mathCount, 0);
          }
        }
        return { pagesChecked: 4, accidentalFormulas: 0 };
      } finally { await context.close(); }
    });
    await record('D2: index readiness replays the query typed while loading', async () => {
      const { context, page } = await newPage();
      try {
        const slow = await gate(page, 'assets/js/search-data.json');
        await page.goto(origin + base + 'protocol.html', { waitUntil: 'domcontentloaded' }); await slow.seen;
        await page.locator('#search-input').fill('Belly');
        await page.getByText('Loading search…', { exact: true }).waitFor();
        assert.equal(await page.locator('#search-input').getAttribute('aria-busy'), 'true');
        slow.release(); await page.locator('.search-result').first().waitFor();
        const beforeExtraInput = await page.locator('.search-result').count();
        assert.ok(beforeExtraInput > 0);
        assert.equal(await page.locator('#search-input').getAttribute('aria-busy'), 'false');
        return { resultsWithoutExtraInput: beforeExtraInput, query: await page.locator('#search-input').inputValue() };
      } finally { await context.close(); }
    });
    await record('D2: a failed index shows an error and retries the retained query', async () => {
      const { context, page } = await newPage();
      try {
        let attempts = 0;
        await page.route('**/assets/js/search-data.json', route => {
          attempts++;
          return route.fulfill(attempts === 1 ? { status: 503, body: 'temporary unavailable' } : { contentType: 'application/json', body: fs.readFileSync(path.join(build, 'assets/js/search-data.json')) });
        });
        await goto(page); await page.locator('#search-input').fill('Belly');
        await page.getByText('Search could not load.', { exact: false }).waitFor();
        await page.locator('#search-results button').click();
        await page.locator('.search-result').first().waitFor();
        assert.equal(attempts, 2); assert.equal(await page.locator('#search-input').inputValue(), 'Belly');
        return { attempts, results: await page.locator('.search-result').count() };
      } finally { await context.close(); }
    });
    await record('D3: composing Enter does not submit; ordinary Enter still navigates', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page, 'zh/protocol.html'); await page.locator('#search-input').fill('Belly'); await page.locator('.search-result').first().waitFor();
        const target = await page.locator('.search-result').first().getAttribute('href');
        const before = page.url();
        const eventState = await page.evaluate(() => {
          const input = document.querySelector('#search-input');
          input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true, data: 'bei' }));
          const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13, isComposing: true });
          input.dispatchEvent(event);
          return { isComposing: event.isComposing, keyCode: event.keyCode, prevented: event.defaultPrevented };
        });
        await page.waitForTimeout(200);
        assert.equal(page.url(), before); assert.equal(eventState.isComposing, true);
        assert.equal(eventState.prevented, false);
        await page.locator('#search-input').dispatchEvent('compositionend', { data: 'Belly' });
        await page.locator('#search-input').press('Enter');
        await page.waitForURL(new URL(target, origin).href);
        return { before, ordinaryEnterTarget: page.url(), eventState };
      } finally { await context.close(); }
    });
    await record('D4: ordinary typing preserves every result batch', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page);
        // Settle the focus-triggered update before the input-only control;
        // otherwise it independently cancels the same batches being measured.
        await page.locator('#search-input').focus(); await page.waitForTimeout(50);
        await page.locator('#search-input').fill('FATCAT'); await page.waitForTimeout(900);
        const inputOnly = await page.locator('.search-result').count();
        assert.ok(inputOnly > 10, 'Control needs over ten results: ' + inputOnly);
        await page.locator('#search-input').fill('');
        await page.locator('#search-input').pressSequentially('FATCAT', { delay: 15 }); await page.waitForTimeout(900);
        const typed = await page.locator('.search-result').count();
        assert.equal(typed, inputOnly);
        return { query: 'FATCAT', inputOnly, ordinaryTyping: typed };
      } finally { await context.close(); }
    });
    await record('D5: an older page response cannot overwrite the latest copy', async () => {
      const { context, page } = await newPage();
      try {
        const pending = [];
        await page.addInitScript(() => { window.AbortController = undefined; });
        await page.route('https://raw.githubusercontent.com/**', async route => { const d = deferred(); pending.push({ route, ...d }); await d.promise; });
        await goto(page); await page.locator('#tfc-ai-btn-copy').click();
        for (let n = 0; pending.length < 1 && n < 800; n++) await page.waitForTimeout(10);
        assert.equal(pending.length, 1);
        await navigate(page, 'guides.html'); await page.locator('#tfc-ai-btn-copy').click();
        for (let n = 0; pending.length < 2 && n < 800; n++) await page.waitForTimeout(10);
        assert.equal(pending.length, 2);
        await pending[1].route.fulfill({ contentType: 'text/plain', body: 'LATEST_GUIDES_MARKDOWN' }); pending[1].resolve();
        await page.waitForFunction(() => window.auditCopies.length === 1);
        await pending[0].route.fulfill({ contentType: 'text/plain', body: 'OLDER_PROTOCOL_MARKDOWN' }); pending[0].resolve();
        await page.waitForTimeout(200);
        const copies = await page.evaluate(() => window.auditCopies);
        assert.deepEqual(copies, ['LATEST_GUIDES_MARKDOWN']);
        return { paths: pending.map(p => new URL(p.route.request().url()).pathname), copies, currentPage: page.url() };
      } finally { await context.close(); }
    });
    await record('D5: failed page copy uses the original page snapshot', async () => {
      const { context, page } = await newPage();
      try {
        const d = deferred(), seen = deferred();
        await page.route('https://raw.githubusercontent.com/**', async route => { seen.resolve(); await d.promise; await route.fulfill({ status: 503, body: 'temporary unavailable' }); });
        await goto(page); const originalText = await page.locator('main').innerText();
        await page.locator('#tfc-ai-btn-copy').click(); await seen.promise;
        await navigate(page, 'guides.html');
        const currentText = await page.locator('main').innerText();
        d.resolve(); await page.waitForFunction(() => window.auditCopies.length === 1);
        const copied = await page.evaluate(() => window.auditCopies[0]);
        assert.equal(copied, originalText); assert.notEqual(copied, currentText);
        return { clickedPage: 'protocol.html', copiedPage: 'protocol.html', copiedMatchesOriginalPage: true };
      } finally { await context.close(); }
    });
    await record('D6: clipboard denial shows failure without an unhandled rejection', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { navigator.clipboard.writeText = async () => { throw new DOMException('clipboard denied by test', 'NotAllowedError'); }; });
        await page.route('https://raw.githubusercontent.com/**', route => route.fulfill({ body: 'SOURCE_MARKDOWN' }));
        await goto(page); await page.locator('#tfc-ai-btn-copy').click();
        await page.getByText('Copy failed. Select the page text and copy it manually.', { exact: true }).waitFor();
        const state = await page.evaluate(() => ({ rejections: window.auditRejections, visibleToast: document.querySelector('#tfc-toast').classList.contains('show'), copies: window.auditCopies.length }));
        assert.equal(state.copies, 0); assert.equal(state.visibleToast, true); assert.deepEqual(state.rejections, []);
        return state;
      } finally { await context.close(); }
    });
    await record('D6: legacy copy failure reports failure and restores focus', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { navigator.clipboard.writeText = async () => { throw new DOMException('clipboard denied by test', 'NotAllowedError'); }; document.execCommand = () => false; });
        await goto(page, 'guides/emergency-exit.html');
        // Use an existing rendered code block; no implementation is injected.
        const button = page.locator('.tfc-code-copy-btn').first();
        await button.locator('..').hover();
        await button.click();
        await page.getByText('Copy failed. Select the code and copy it manually.', { exact: true }).waitFor();
        const state = await button.evaluate(el => ({ text: el.textContent, title: el.title, className: el.className }));
        assert.doesNotMatch(state.className, /copied/);
        assert.equal(await page.evaluate(() => window.auditCopies.length), 0);
        assert.equal(await button.evaluate(el => document.activeElement === el), true);
        return state;
      } finally { await context.close(); }
    });
    await record('D1: navigation timeout restores controls and offers a working retry', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page); await page.clock.install();
        const slow = await gate(page, 'safety.html');
        await clickNav(page, 'safety.html'); await slow.seen;
        await page.clock.fastForward(15001);
        await page.locator('#tfc-navigation-error button').waitFor();
        assert.equal(await page.locator('.main-content-wrap').evaluate(el => el.style.opacity), '1');
        slow.release(); await page.unroute(origin + base + 'safety.html');
        await page.locator('#tfc-navigation-error button').click();
        await page.waitForURL(origin + base + 'safety.html');
        assert.equal(await page.locator('#tfc-navigation-error').count(), 0);
        return { timeoutMs: 15000, retrySucceeded: true };
      } finally { await context.close(); }
    });
    await record('D1: failed Back does not display the previous article under the target URL', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page); await navigate(page, 'guides.html');
        await page.route(origin + base + 'protocol.html', route => route.fulfill({ status: 503, body: 'unavailable' }));
        await page.evaluate(() => history.back());
        await page.locator('#tfc-navigation-error button').waitFor();
        assert.equal(page.url(), origin + base + 'protocol.html');
        assert.equal(await page.locator('main').count(), 0);
        await page.unroute(origin + base + 'protocol.html');
        await page.locator('#tfc-navigation-error button').click();
        await page.locator('main h1').waitFor();
        assert.equal(page.url(), origin + base + 'protocol.html');
        return { staleArticleRemoved: true, retrySucceeded: true };
      } finally { await context.close(); }
    });
    await record('D2: malformed index JSON has a recoverable failure state', async () => {
      const { context, page } = await newPage();
      try {
        const errors = []; page.on('pageerror', error => errors.push(String(error)));
        await page.route('**/assets/js/search-data.json', route => route.fulfill({ contentType: 'application/json', body: '{broken' }));
        await goto(page); await page.locator('#search-input').fill('Belly');
        await page.locator('#search-results button').waitFor();
        await page.unroute('**/assets/js/search-data.json');
        await page.locator('#search-results button').click(); await page.locator('.search-result').first().waitFor();
        assert.deepEqual(errors, []);
        return { retrySucceeded: true, pageErrors: errors };
      } finally { await context.close(); }
    });
    await record('D2: index network timeout exposes retry without losing the query', async () => {
      const { context, page } = await newPage();
      try {
        // Shorten the native XHR timeout while verifying the production value.
        await page.addInitScript(() => {
          const timeout = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'timeout');
          Object.defineProperty(XMLHttpRequest.prototype, 'timeout', {
            configurable: true, get: timeout.get,
            set(value) { window.requestedSearchTimeout = value; timeout.set.call(this, value === 15000 ? 100 : value); }
          });
        });
        const slow = await gate(page, 'assets/js/search-data.json');
        await page.goto(origin + base + 'protocol.html', { waitUntil: 'domcontentloaded' }); await slow.seen;
        await page.locator('#search-input').fill('Belly');
        await page.locator('#search-results button').waitFor();
        assert.equal(await page.evaluate(() => window.requestedSearchTimeout), 15000);
        slow.release(); await page.unroute(origin + base + 'assets/js/search-data.json');
        await page.locator('#search-results button').click(); await page.locator('.search-result').first().waitFor();
        assert.equal(await page.locator('#search-input').inputValue(), 'Belly');
        return { configuredTimeoutMs: 15000, simulatedTimeoutMs: 100, retrySucceeded: true };
      } finally { await context.close(); }
    });
    await record('D3: composing input is deferred until compositionend and key 229 is ignored', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page); await page.locator('#search-input').fill('FATCAT'); await page.waitForTimeout(500);
        const previousResults = await page.locator('#search-results').innerHTML();
        const originalUrl = page.url();
        await page.evaluate(() => {
          const input = document.querySelector('#search-input');
          input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
          input.value = 'Belly';
          input.dispatchEvent(new InputEvent('input', { bubbles: true, isComposing: true }));
          input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, keyCode: 229, key: 'Enter' }));
          input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, keyCode: 229 }));
        });
        assert.equal(await page.locator('#search-results').innerHTML(), previousResults);
        assert.equal(page.url(), originalUrl);
        await page.locator('#search-input').dispatchEvent('compositionend', { data: 'Belly' });
        await page.waitForFunction(old => document.querySelector('#search-results').innerHTML !== old, previousResults);
        await page.locator('.search-result').first().waitFor();
        return { intermediateResultsUnchanged: true, completedQuery: 'Belly' };
      } finally { await context.close(); }
    });
    await record('D5: an in-flight clipboard write completes before the latest write starts', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => {
          window.clipboardCalls = [];
          navigator.clipboard.writeText = text => new Promise(resolve => {
            window.clipboardCalls.push(text);
            const finish = () => { window.auditCopies.push(text); resolve(); };
            if (text === 'OLD_COPY') window.finishOldCopy = finish; else finish();
          });
        });
        let responses = 0;
        await page.route('https://raw.githubusercontent.com/**', route => {
          responses++;
          return route.fulfill({ body: route.request().url().endsWith('protocol.md') ? 'OLD_COPY' : 'LATEST_COPY' });
        });
        await goto(page); await page.locator('#tfc-ai-btn-copy').click();
        await page.waitForFunction(() => !!window.finishOldCopy);
        await navigate(page, 'guides.html'); await page.locator('#tfc-ai-btn-copy').click();
        for (let n = 0; responses < 2 && n < 800; n++) await page.waitForTimeout(10);
        assert.equal(responses, 2); await page.waitForTimeout(100);
        assert.deepEqual(await page.evaluate(() => window.clipboardCalls), ['OLD_COPY']);
        await page.evaluate(() => window.finishOldCopy());
        await page.waitForFunction(() => window.auditCopies.length === 2);
        const copies = await page.evaluate(() => window.auditCopies);
        assert.deepEqual(copies, ['OLD_COPY', 'LATEST_COPY']);
        return { copies };
      } finally { await context.close(); }
    });
    await record('D5: full-document copy supersedes an older page copy', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { window.AbortController = undefined; });
        const seen = deferred(), release = deferred();
        await page.route('https://raw.githubusercontent.com/**', async route => { seen.resolve(); await release.promise; await route.fulfill({ body: 'OLD_PAGE' }); });
        await page.route('**/llms-full.txt', route => route.fulfill({ body: 'LATEST_FULL_DOCS' }));
        await goto(page); await page.locator('#tfc-ai-btn-copy').click(); await seen.promise;
        await page.locator('#tfc-ai-btn-dropdown').click(); await page.locator('#tfc-action-copy-full').click();
        await page.waitForFunction(() => window.auditCopies.length === 1);
        release.resolve(); await page.waitForTimeout(200);
        const copies = await page.evaluate(() => window.auditCopies);
        assert.deepEqual(copies, ['LATEST_FULL_DOCS']);
        return { copies };
      } finally { await context.close(); }
    });
    await record('D5: copying modal URLs supersedes an older page copy', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { window.AbortController = undefined; });
        const seen = deferred(), release = deferred();
        await page.route('https://raw.githubusercontent.com/**', async route => { seen.resolve(); await release.promise; await route.fulfill({ body: 'OLD_PAGE' }); });
        await goto(page); await page.locator('#tfc-ai-btn-copy').click(); await seen.promise;
        await page.locator('#tfc-ai-btn-dropdown').click(); await page.locator('#tfc-action-mcp').click();
        await page.locator('.tfc-mcp-copy-code').click(); await page.waitForFunction(() => window.auditCopies.length === 1);
        const expected = await page.evaluate(() => window.auditCopies[0]);
        assert.match(expected, /llms-full/);
        release.resolve(); await page.waitForTimeout(200);
        assert.deepEqual(await page.evaluate(() => window.auditCopies), [expected]);
        return { modalCopyRetained: true };
      } finally { await context.close(); }
    });
    await record('D6: missing clipboard API has a visible page-copy failure', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined }); });
        await page.route('https://raw.githubusercontent.com/**', route => route.fulfill({ body: 'SOURCE' }));
        await goto(page); await page.locator('#tfc-ai-btn-copy').click();
        await page.getByText('Copy failed. Select the page text and copy it manually.', { exact: true }).waitFor();
        assert.deepEqual(await page.evaluate(() => window.auditRejections), []);
        return { failureVisible: true, unhandledRejections: 0 };
      } finally { await context.close(); }
    });
    await record('D6: successful legacy fallback restores focus and reports success', async () => {
      const { context, page } = await newPage();
      try {
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
          document.execCommand = () => { window.auditCopies.push(document.activeElement.value); return true; };
        });
        await goto(page, 'guides/emergency-exit.html');
        const button = page.locator('.tfc-code-copy-btn').first();
        await button.locator('..').hover(); await button.click();
        await page.waitForFunction(() => document.querySelector('.tfc-code-copy-btn').classList.contains('copied'));
        assert.equal(await button.evaluate(el => document.activeElement === el), true);
        const copies = await page.evaluate(() => window.auditCopies);
        assert.equal(copies.length, 1); assert.match(copies[0], /redeem/);
        return { legacySucceeded: true, focusRestored: true };
      } finally { await context.close(); }
    });
    await record('Control: narrow viewport modal traps Tab and restores focus', async () => {
      const { context, page } = await newPage({ viewport: { width: 390, height: 420 }, isMobile: true, hasTouch: true });
      try {
        await goto(page); await page.locator('#tfc-ai-btn-dropdown').click(); await page.locator('#tfc-action-mcp').click();
        assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-mcp-close');
        for (let n = 0; n < 12; n++) { await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.querySelector('#tfc-mcp-modal').contains(document.activeElement)), true); }
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'tfc-ai-btn-dropdown');
        return { viewport: '390x420', tabCycles: 12, focusRestored: true, realSoftKeyboardTested: false };
      } finally { await context.close(); }
    });
    await record('Control: sidebar selection is identical after load, history and language changes', async () => {
      const { context, page } = await newPage();
      const selectedState = () => page.evaluate(() => ({
        links: Array.from(document.querySelectorAll('.site-nav .nav-list-link.active')).map(el => el.getAttribute('href')),
        parents: Array.from(document.querySelectorAll('.site-nav .nav-list-item.active')).map(el => el.querySelector(':scope > .nav-list-link').getAttribute('href')),
        expanded: Array.from(document.querySelectorAll('.site-nav .nav-list-expander[aria-expanded="true"]')).map(el => el.nextElementSibling.getAttribute('href'))
      }));
      try {
        await goto(page, 'guides/staking.html');
        const initial = await selectedState();
        assert.deepEqual(initial.links, [base + 'guides/staking.html']);
        assert.equal(initial.parents.length, initial.expanded.length + 1);
        await navigate(page, 'protocol/belly.html');
        await page.evaluate(() => history.back());
        await page.waitForURL(origin + base + 'guides/staking.html');
        await page.waitForFunction(() => document.querySelector('.main-content-wrap').style.opacity === '1');
        assert.deepEqual(await selectedState(), initial);
        await page.locator('#lang-btn-zh').click();
        await page.waitForURL(origin + base + 'zh/guides/staking.html');
        await page.waitForFunction(() => document.documentElement.lang === 'zh');
        const chinese = await selectedState();
        assert.deepEqual(chinese.links, [base + 'zh/guides/staking.html']);
        assert.ok(chinese.parents.every(href => href.startsWith(base + 'zh/')));
        await page.reload({ waitUntil: 'load' });
        assert.deepEqual(await selectedState(), chinese);
        return { initial, chinese, historyAndReloadMatch: true };
      } finally { await context.close(); }
    });
    await record('Control: document language drives search and full-document copy', async () => {
      const { context, page } = await newPage();
      try {
        await page.route(origin + base + 'llms-full-zh.txt', route => route.fulfill({ body: 'CHINESE_DOCS' }));
        await goto(page);
        await page.evaluate(() => { document.documentElement.lang = 'zh'; });
        assert.equal(await page.locator('.site-nav > .nav-list > .nav-list-item[data-nav-lang="zh"]').first().isVisible(), true);
        assert.equal(await page.locator('.site-nav > .nav-list > .nav-list-item[data-nav-lang="en"]').first().isVisible(), false);
        await page.locator('#search-input').fill('资历');
        await page.locator('.search-result').first().waitFor();
        const matches = await page.locator('.search-result').evaluateAll(links => links.map(link => link.getAttribute('href')));
        assert.ok(matches.length > 0 && matches.every(href => href.includes('/zh/')));
        await page.locator('#search-input').fill('');
        await page.locator('#tfc-ai-btn-dropdown').click();
        await page.locator('#tfc-action-copy-full').click();
        await page.waitForFunction(() => window.auditCopies.length === 1);
        assert.deepEqual(await page.evaluate(() => window.auditCopies), ['CHINESE_DOCS']);
        return { canonicalLanguage: 'zh', searchMatches: matches.length, copiedChineseBundle: true };
      } finally { await context.close(); }
    });
    for (const configuredBase of ['', '/preview-docs']) {
      await record('Control: configured base URL drives search, bundles and source fallback (' + (configuredBase || 'root') + ')', async () => {
        const { context, page } = await newPage();
        const rawBase = 'https://raw.githubusercontent.com/Example/Docs/stable/';
        let searchRequests = 0, rawUrl;
        try {
          await page.route(origin + base + 'protocol.html', route => {
            const body = fs.readFileSync(path.join(build, 'protocol.html'), 'utf8')
              .replace(/(baseUrl:\s*)"[^"]*"/, '$1' + JSON.stringify(configuredBase))
              .replace(/(rawBaseUrl:\s*)"[^"]*"/, '$1' + JSON.stringify(rawBase));
            return route.fulfill({ contentType: 'text/html', body });
          });
          await page.route(origin + configuredBase + '/assets/js/search-data.json', route => {
            searchRequests++;
            return route.fulfill({ contentType: 'application/json', body: fs.readFileSync(path.join(build, 'assets/js/search-data.json')) });
          });
          await page.route(origin + configuredBase + '/llms-full.txt', route => route.fulfill({ body: 'CONFIGURED_DOCS' }));
          await page.route(rawBase + '**', route => {
            rawUrl = route.request().url();
            return route.fulfill({ body: '# CONFIGURED_SOURCE' });
          });
          await goto(page);
          await page.locator('#search-input').fill('Belly');
          await page.locator('.search-result').first().waitFor();
          assert.equal(searchRequests, 1);
          await page.locator('#search-input').fill('');
          await page.locator('#tfc-ai-btn-dropdown').click();
          await page.locator('#tfc-action-copy-full').click();
          await page.waitForFunction(() => window.auditCopies.length === 1);
          await page.evaluate(prefix => {
            history.replaceState(null, '', prefix + '/zh/index.html');
            document.querySelector('#tfc-action-copy-md').removeAttribute('data-path');
          }, configuredBase);
          await page.locator('#tfc-ai-btn-copy').click();
          await page.waitForFunction(() => window.auditCopies.length === 2);
          assert.equal(rawUrl, rawBase + 'zh/index.md');
          assert.deepEqual(await page.evaluate(() => window.auditCopies), ['CONFIGURED_DOCS', '# CONFIGURED_SOURCE']);
          return { configuredBase, searchRequests, rawUrl, configuredBundleCopied: true };
        } finally { await context.close(); }
      });
    }
    await record('Control: componentized pages copy expanded Markdown including links and diagrams', async () => {
      const { context, page } = await newPage();
      const checked = [];
      try {
        for (const prefix of ['', 'zh/']) {
          for (const name of ['links', 'guides/staking', 'topology/asset-flows', 'topology/state-machine']) {
            const sourcePath = prefix + name + '.md';
            await page.route('https://raw.githubusercontent.com/**', route => route.fulfill({
              body: fs.readFileSync(path.join(__dirname, '..', sourcePath), 'utf8')
            }));
            await goto(page, prefix + name + '.html');
            const expected = await page.evaluate(() => ({
              titles: Array.from(document.querySelectorAll('.tfc-portal-title, .tfc-portal-reference h3, .tfc-diagram-title')).map(el => el.textContent),
              links: Array.from(document.querySelectorAll('.tfc-portal-list a, .tfc-portal-references a')).map(el => el.getAttribute('href')),
              code: document.querySelector('.tfc-diagram-content code')?.textContent
            }));
            await page.locator('#tfc-ai-btn-copy').click();
            await page.waitForFunction(() => window.auditCopies.length === 1);
            const copied = await page.evaluate(() => window.auditCopies[0]);
            assert.ok(!copied.includes('{%') && !copied.includes('{{'));
            for (const text of expected.titles.concat(expected.links)) assert.ok(copied.includes(text), text);
            if (expected.code) assert.ok(copied.includes('\u0060\u0060\u0060text\n' + expected.code + '\n\u0060\u0060\u0060'));
            checked.push(sourcePath);
            await page.unroute('https://raw.githubusercontent.com/**');
          }
        }
        return { checked, unresolvedLiquid: false, directoryLinksAndDiagramSpacingPreserved: true };
      } finally { await context.close(); }
    });
    for (const failure of ['unavailable', 'missing-section']) {
      await record('Control: component page copy falls back to visible text when the bundle is ' + failure, async () => {
        const { context, page } = await newPage();
        try {
          await page.route('https://raw.githubusercontent.com/**', route => route.request().url().endsWith('/links.md')
            ? route.fulfill({ body: fs.readFileSync(path.join(__dirname, '..', 'links.md'), 'utf8') })
            : route.fulfill({ status: 503, body: 'unavailable' }));
          await page.route(origin + base + 'llms-full.txt', route => route.fulfill({
            status: failure === 'unavailable' ? 503 : 200, body: '# Incomplete bundle'
          }));
          await goto(page, 'links.html');
          await page.locator('#tfc-ai-btn-copy').click();
          await page.waitForFunction(() => window.auditCopies.length === 1);
          const copied = await page.evaluate(() => window.auditCopies[0]);
          assert.ok(copied.includes('The Belly (Staking System)') && !copied.includes('{%'));
          await page.getByText('✓ Copied page text for LLMs', { exact: true }).waitFor();
          assert.deepEqual(await page.evaluate(() => window.auditRejections), []);
          return { failure, visibleTextCopied: true, fallbackNoticeVisible: true };
        } finally { await context.close(); }
      });
    }
    await record('Control: URL anchor, language and selected theme survive refresh', async () => {
      const { context, page } = await newPage();
      try {
        await goto(page, 'zh/protocol/belly.html');
        const headingId = await page.locator('main h2[id]').first().getAttribute('id');
        assert.ok(headingId);
        await page.locator('#theme-toggle-btn').click();
        const selectedTheme = await page.locator('html').getAttribute('data-theme');
        await page.evaluate(id => { location.hash = id; }, headingId);
        const selectedUrl = page.url();
        await page.reload({ waitUntil: 'load' });
        assert.equal(page.url(), selectedUrl);
        assert.equal(await page.locator('html').getAttribute('lang'), 'zh');
        assert.equal(await page.locator('html').getAttribute('data-theme'), selectedTheme);
        return { language: 'zh', selectedTheme, anchor: headingId, retainedAfterRefresh: true };
      } finally { await context.close(); }
    });
  } finally {
    await browser.close(); server.close();
    if (process.env.TFC_STATE_REPORT) fs.writeFileSync(process.env.TFC_STATE_REPORT, JSON.stringify({ results }, null, 2) + '\n');
  }
  assert.ok(results.every(r => r.passed), 'Some audit assertions failed; inspect evidence.json');
}
module.exports = main;
if (require.main === module) main(process.argv[2]).catch(error => { console.error(error); process.exitCode = 1; server.close(); });
