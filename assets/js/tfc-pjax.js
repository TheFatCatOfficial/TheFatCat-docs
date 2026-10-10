/* Internal documentation navigation with a short-lived page cache. */
(function() {
  'use strict';

  if (!window.fetch || !window.DOMParser || !window.history || !window.history.pushState) {
    return;
  }

  var pageCache = new Map();
  var progressBar = null;
  var isNavigating = false;

  function createProgressBar() {
    if (progressBar) return progressBar;
    progressBar = document.createElement('div');
    progressBar.id = 'tfc-pjax-progress';
    progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:#48b78d;width:0%;z-index:99999;transition:width 0.2s ease, opacity 0.3s ease;pointer-events:none;box-shadow:0 0 8px rgba(72,183,141,0.6);';
    document.body.appendChild(progressBar);
    return progressBar;
  }

  function setProgress(percent) {
    var bar = createProgressBar();
    bar.style.opacity = '1';
    bar.style.width = percent + '%';
    if (percent >= 100) {
      setTimeout(function() {
        bar.style.opacity = '0';
        setTimeout(function() {
          bar.style.width = '0%';
        }, 300);
      }, 150);
    }
  }

  function isInternalDocLink(anchor) {
    if (!anchor || anchor.tagName !== 'A') return false;
    var href = anchor.getAttribute('href');
    if (!href) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;

    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }

    try {
      var url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return false;

      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        return false;
      }

      var baseMeta = document.querySelector('meta[name="tfc-baseurl"]');
      var base = baseMeta ? baseMeta.getAttribute('content') : '';
      if (base && base !== '/' && url.pathname !== base && !url.pathname.startsWith(base + '/')) {
        return false;
      }

      // PDF downloads and static assets need normal browser navigation.
      if (/\.[^/]+$/.test(url.pathname) && !url.pathname.endsWith('.html')) return false;

      return true;
    } catch (e) {
      return false;
    }
  }

  var CACHE_TTL = 15000; // 15s short TTL to prevent stale HTML across updates

  function prefetch(url) {
    var now = Date.now();
    var cached = pageCache.get(url);
    if (cached && (now - cached.time < CACHE_TTL)) return;
    fetch(url, { headers: { 'X-PJAX': 'true' } })
      .then(function(res) {
        if (res.ok) return res.text();
        throw new Error('Prefetch failed');
      })
      .then(function(html) {
        pageCache.set(url, { html: html, time: Date.now() });
      })
      .catch(function() {});
  }

  function normalizePath(p) {
    if (!p) return '';
    try {
      var pathname = new URL(p, window.location.origin).pathname;
      return pathname.replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    } catch (e) {
      return p.replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
    }
  }

  function updateActiveSidebar(targetUrl) {
    // Theme activation styles must not select both language trees.
    var jtdStyle = document.getElementById('jtd-nav-activation');
    if (jtdStyle) {
      jtdStyle.textContent = '';
    }

    var targetPath = normalizePath(targetUrl);

    var allItems = document.querySelectorAll('.site-nav .nav-list-item');
    allItems.forEach(function(item) {
      item.classList.remove('active');
      var exp = item.querySelector(':scope > .nav-list-expander');
      if (exp) {
        exp.setAttribute('aria-expanded', 'false');
      }
    });

    var allLinks = document.querySelectorAll('.site-nav .nav-list-link');
    allLinks.forEach(function(link) {
      link.classList.remove('active');
    });

    var matchedLink = null;
    allLinks.forEach(function(link) {
      if (normalizePath(link.pathname) === targetPath) {
        matchedLink = link;
      }
    });

    if (matchedLink) {
      matchedLink.classList.add('active');

      var parentItem = matchedLink.closest('.nav-list-item');
      while (parentItem) {
        parentItem.classList.add('active');
        var expander = parentItem.querySelector(':scope > .nav-list-expander');
        if (expander) {
          expander.setAttribute('aria-expanded', 'true');
        }
        var parentList = parentItem.parentElement;
        parentItem = parentList ? parentList.closest('.nav-list-item') : null;
      }
    }
  }

  function updateLanguageSwitcher(newDoc) {
    var oldSwitcher = document.getElementById('tfc-lang-switcher');
    var newSwitcher = newDoc.getElementById('tfc-lang-switcher');
    if (oldSwitcher && newSwitcher) {
      oldSwitcher.innerHTML = newSwitcher.innerHTML;
    }
  }

  function navigateTo(url, pushState) {
    if (isNavigating) return;
    isNavigating = true;
    setProgress(30);

    var targetWrap = document.querySelector('.main-content-wrap');
    if (targetWrap) {
      targetWrap.style.transition = 'opacity 0.1s ease-out';
      targetWrap.style.opacity = '0.35';
    }

    function applyNewPage(htmlText) {
      setProgress(75);
      var parser = new DOMParser();
      var newDoc = parser.parseFromString(htmlText, 'text/html');

      document.title = newDoc.title;

      var newWrap = newDoc.querySelector('.main-content-wrap');
      if (targetWrap && newWrap) {
        targetWrap.innerHTML = newWrap.innerHTML;
        targetWrap.style.opacity = '1';
      }

      var newBodyLang = newDoc.body.getAttribute('data-lang') || (url.indexOf('/zh') !== -1 ? 'zh' : 'en');
      document.body.setAttribute('data-lang', newBodyLang);
      document.documentElement.setAttribute('data-lang', newBodyLang);
      document.documentElement.lang = newBodyLang;
      var curTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      document.body.setAttribute('data-theme', curTheme);

      updateLanguageSwitcher(newDoc);

      // Refresh Markdown source links after replacing page content.
      var oldCopyItem = document.getElementById('tfc-action-copy-md');
      var newCopyItem = newDoc.getElementById('tfc-action-copy-md');
      if (oldCopyItem && newCopyItem) {
        oldCopyItem.setAttribute('data-path', newCopyItem.getAttribute('data-path') || '');
      }
      var oldRawLink = document.getElementById('tfc-action-view-raw');
      var newRawLink = newDoc.getElementById('tfc-action-view-raw');
      if (oldRawLink && newRawLink) {
        oldRawLink.setAttribute('href', newRawLink.getAttribute('href') || '');
      }

      updateActiveSidebar(url);

      if (pushState !== false) {
        window.history.pushState({ pjax: true, url: url }, '', url);
      }

      var urlObj = new URL(url, window.location.origin);
      if (urlObj.hash) {
        var anchorId = urlObj.hash.slice(1);
        try { anchorId = decodeURIComponent(anchorId); } catch (e) {}
        var anchorTarget = document.getElementById(anchorId);
        if (anchorTarget) {
          anchorTarget.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }

      if (window.tfcRenderMath) {
        window.tfcRenderMath(targetWrap);
      }

      if (typeof window.initCopyButtons === 'function') {
        window.initCopyButtons(targetWrap);
      }

      stripRedundantTOC(targetWrap);
      updateBackToTopVisibility();

      setProgress(100);
      isNavigating = false;
    }

    function fallbackNavigation() {
      setProgress(100);
      isNavigating = false;
      if (targetWrap) targetWrap.style.opacity = '1';
      window.location.href = url;
    }

    var now = Date.now();
    var cached = pageCache.get(url);
    if (cached && (now - cached.time < CACHE_TTL)) {
      Promise.resolve(cached.html).then(applyNewPage).catch(fallbackNavigation);
    } else {
      fetch(url, { headers: { 'X-PJAX': 'true' } })
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function(htmlText) {
          pageCache.set(url, { html: htmlText, time: Date.now() });
          applyNewPage(htmlText);
        })
        .catch(fallbackNavigation);
    }
  }

  document.addEventListener('click', function(e) {
    var expander = e.target.closest('.nav-list-expander');
    if (expander) {
      if (!window.jtd || typeof window.jtd.addEvent !== 'function') {
        e.preventDefault();
        var parentItem = expander.closest('.nav-list-item');
        if (parentItem) {
          var isExpanded = parentItem.classList.toggle('active');
          expander.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
        }
      }
      return;
    }

    var anchor = e.target.closest('a');
    if (!anchor) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    if (isInternalDocLink(anchor)) {
      e.preventDefault();
      navigateTo(anchor.href, true);
    }
  });

  document.addEventListener('mouseover', function(e) {
    var anchor = e.target.closest('a');
    if (anchor && isInternalDocLink(anchor)) {
      prefetch(anchor.href);
    }
  }, { passive: true });

  document.addEventListener('touchstart', function(e) {
    var anchor = e.target.closest('a');
    if (anchor && isInternalDocLink(anchor)) {
      prefetch(anchor.href);
    }
  }, { passive: true });

  function updateBackToTopVisibility() {
    var container = document.getElementById('back-to-top-container') || document.getElementById('back-to-top');
    if (!container) return;
    var el = container.id === 'back-to-top' ? (container.closest('p') || container) : container;
    var isScrollable = (document.documentElement.scrollHeight - window.innerHeight) > 40;
    if (isScrollable) {
      el.style.display = 'block';
    } else {
      el.style.display = 'none';
    }
  }

  function stripRedundantTOC(root) {
    var target = root || document;
    var deltaHeadings = target.querySelectorAll('h2.text-delta');
    deltaHeadings.forEach(function(h2) {
      if (/table\s+of\s+contents/i.test(h2.textContent.trim())) {
        var next = h2.nextElementSibling;
        if (next && next.tagName === 'UL') {
          next.remove();
        }
        var prev = h2.previousElementSibling;
        if (prev && prev.tagName === 'HR') {
          prev.remove();
        }
        h2.remove();
      }
    });
  }

  window.addEventListener('popstate', function() {
    navigateTo(window.location.href, false);
  });

  function onInit() {
    updateActiveSidebar(window.location.href);
    stripRedundantTOC();
    updateBackToTopVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onInit);
  } else {
    onInit();
  }

  window.addEventListener('resize', updateBackToTopVisibility, { passive: true });

})();
