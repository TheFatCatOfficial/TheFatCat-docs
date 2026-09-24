/**
 * TheFatCat Documentation — Native High-Performance PJAX Engine
 * Eliminates full-page redraws, sidebar flickering, and DOM teardowns.
 * Provides instant 60fps page transitions with preserved sidebar state.
 */
(function() {
  'use strict';

  // Only run in browser environment with modern APIs
  if (!window.fetch || !window.DOMParser || !window.history || !window.history.pushState) {
    return;
  }

  // Pre-fetch cache for instantaneous navigation
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

    // External protocol or special scheme
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return false;
    }

    try {
      var url = new URL(anchor.href, window.location.origin);
      if (url.origin !== window.location.origin) return false;

      // Hash jump on same page
      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) {
        return false;
      }

      // Check baseurl
      var base = "{{ site.baseurl }}";
      if (base && base !== "/" && !url.pathname.startsWith(base)) {
        return false;
      }

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
    // Neutralize any static nth-child rules from Just the Docs that might conflict with multi-lingual nav
    var jtdStyle = document.getElementById('jtd-nav-activation');
    if (jtdStyle) {
      jtdStyle.textContent = '';
    }

    var targetPath = normalizePath(targetUrl);

    // 1. Reset all nav-list-item active states and collapse expanders across the entire sidebar
    var allItems = document.querySelectorAll('.site-nav .nav-list-item');
    allItems.forEach(function(item) {
      item.classList.remove('active');
      var exp = item.querySelector(':scope > .nav-list-expander');
      if (exp) {
        exp.setAttribute('aria-expanded', 'false');
      }
    });

    // 2. Reset all nav-list-link active states
    var allLinks = document.querySelectorAll('.site-nav .nav-list-link');
    allLinks.forEach(function(link) {
      link.classList.remove('active');
    });

    // 3. Find matching link using normalized path
    var matchedLink = null;
    allLinks.forEach(function(link) {
      if (normalizePath(link.pathname) === targetPath) {
        matchedLink = link;
      }
    });

    // 4. Activate the matched link and expand ONLY its ancestor chain
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

      // 1. Update title
      document.title = newDoc.title;

      // 2. Swap main content and breadcrumbs
      var newWrap = newDoc.querySelector('.main-content-wrap');
      if (targetWrap && newWrap) {
        targetWrap.innerHTML = newWrap.innerHTML;
        targetWrap.style.opacity = '1';
      }

      // 3. Update body and html data-lang if needed & preserve theme
      var newBodyLang = newDoc.body.getAttribute('data-lang') || (url.indexOf('/zh') !== -1 ? 'zh' : 'en');
      document.body.setAttribute('data-lang', newBodyLang);
      document.documentElement.setAttribute('data-lang', newBodyLang);
      document.documentElement.lang = newBodyLang;
      var curTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      document.body.setAttribute('data-theme', curTheme);

      // 4. Update language switcher widget
      updateLanguageSwitcher(newDoc);

      // 4.5. Update AI actions widget (preserves markdown source path and raw view link without tearing DOM)
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

      // 5. Update sidebar active item and accordion collapse without unmounting sidebar
      updateActiveSidebar(url);

      // 6. Handle URL history
      if (pushState !== false) {
        window.history.pushState({ pjax: true, url: url }, '', url);
      }

      // 7. Handle scroll position
      var urlObj = new URL(url, window.location.origin);
      if (urlObj.hash) {
        var anchorTarget = document.querySelector(urlObj.hash);
        if (anchorTarget) {
          anchorTarget.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo(0, 0);
        }
      } else {
        window.scrollTo(0, 0);
      }

      // 8. Re-render scoped KaTeX formulas
      if (window.tfcRenderMath) {
        window.tfcRenderMath(targetWrap);
      }

      // 9. Re-initialize code block copy buttons if defined
      if (typeof window.initCopyButtons === 'function') {
        window.initCopyButtons(targetWrap);
      }

      // 10. Prune any duplicate table of contents and check scrollability
      stripRedundantTOC(targetWrap);
      updateBackToTopVisibility();

      setProgress(100);
      isNavigating = false;
    }

    var now = Date.now();
    var cached = pageCache.get(url);
    if (cached && (now - cached.time < CACHE_TTL)) {
      applyNewPage(cached.html);
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
        .catch(function(err) {
          // Fallback to normal navigation if fetch fails
          setProgress(100);
          isNavigating = false;
          window.location.href = url;
        });
    }
  }

  // Intercept click events
  document.addEventListener('click', function(e) {
    // 1. Check if user clicked an accordion expander button directly
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

    // 2. Check if user clicked an internal link for PJAX navigation
    var anchor = e.target.closest('a');
    if (!anchor) return;

    // Ignore clicks with modifier keys
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    if (isInternalDocLink(anchor)) {
      e.preventDefault();
      navigateTo(anchor.href, true);
    }
  });

  // Prefetch on hover/touchstart
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

  // Handle browser back/forward buttons
  window.addEventListener('popstate', function() {
    navigateTo(window.location.href, false);
  });

  function onInit() {
    updateActiveSidebar(window.location.href);
    stripRedundantTOC();
    updateBackToTopVisibility();
  }

  // Synchronize state on initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onInit);
  } else {
    onInit();
  }

  window.addEventListener('resize', updateBackToTopVisibility, { passive: true });

})();
