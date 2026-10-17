/* Internal documentation navigation with a short-lived page cache. */
(function() {
  'use strict';

  if (!window.fetch || !window.DOMParser || !window.history || !window.history.pushState) {
    return;
  }

  var pageCache = new Map();
  var progressBar = null;
  var activeNavigation = null;
  var progressTimer = null;
  var progressResetTimer = null;
  var renderedUrl = window.location.href;


  function createProgressBar() {
    if (progressBar) return progressBar;
    progressBar = document.createElement('div');
    progressBar.id = 'tfc-pjax-progress';
    document.body.appendChild(progressBar);
    return progressBar;
  }

  function setProgress(percent) {
    clearTimeout(progressTimer);
    clearTimeout(progressResetTimer);
    var bar = createProgressBar();
    bar.style.opacity = '1';
    bar.style.width = percent + '%';
    if (percent >= 100) {
      progressTimer = setTimeout(function() {
        bar.style.opacity = '0';
        progressResetTimer = setTimeout(function() {
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

      if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash && !anchor.classList.contains('search-result')) {
        return false;
      }

      var base = window.jtd.docsConfig.baseUrl;
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
        if (pageCache.get(url) === cached) {
          pageCache.set(url, { html: html, time: Date.now() });
        }
      })
      .catch(function() {});
  }

  function updateLanguageSwitcher(newDoc) {
    var oldSwitcher = document.getElementById('tfc-lang-switcher');
    var newSwitcher = newDoc.getElementById('tfc-lang-switcher');
    if (oldSwitcher && newSwitcher) {
      oldSwitcher.innerHTML = newSwitcher.innerHTML;
    }
  }

  function navigateTo(url, pushState) {
    if (activeNavigation) {
      clearTimeout(activeNavigation.timer);
      if (activeNavigation.controller) activeNavigation.controller.abort();
    }
    var navigation = { controller: window.AbortController ? new AbortController() : null };
    activeNavigation = navigation;
    setProgress(30);

    var targetWrap = document.querySelector('.main-content-wrap');
    var oldError = document.getElementById('tfc-navigation-error');
    if (oldError) oldError.remove();
    if (targetWrap) {
      targetWrap.style.opacity = '0.35';
    }

    function applyNewPage(htmlText) {
      if (activeNavigation !== navigation) return;
      setProgress(75);
      var parser = new DOMParser();
      var newDoc = parser.parseFromString(htmlText, 'text/html');

      var newWrap = newDoc.querySelector('.main-content-wrap');
      if (!newWrap) throw new Error('Missing document content');
      document.title = newDoc.title;
      if (targetWrap && newWrap) {
        targetWrap.innerHTML = newWrap.innerHTML;
        targetWrap.style.opacity = '1';
      }

      var newBodyLang = newDoc.documentElement.lang || 'en';
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

      window.jtd.activateNav(url);

      if (pushState !== false) {
        window.history.pushState({ pjax: true, url: url }, '', url);
      }
      renderedUrl = url;


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
      updateTableAccessibility();
      updateBackToTopVisibility();
      if (window.tfcHighlightSearch) window.tfcHighlightSearch();

      setProgress(100);
      clearTimeout(navigation.timer);
      activeNavigation = null;
    }

    function showNavigationError() {
      if (activeNavigation !== navigation) return;
      clearTimeout(navigation.timer);
      activeNavigation = null;
      if (navigation.controller) navigation.controller.abort();
      setProgress(100);
      if (!targetWrap) return;
      targetWrap.style.opacity = '1';
      var isZh = window.jtd.isChinese();
      var error = document.createElement('div');
      error.id = 'tfc-navigation-error';
      error.setAttribute('role', 'alert');
      error.textContent = isZh ? '页面加载失败，请重试。 ' : 'Page could not load. Please retry. ';
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.className = 'btn';
      retry.textContent = isZh ? '重试' : 'Retry';
      retry.addEventListener('click', function() { navigateTo(url, pushState); });
      error.appendChild(retry);
      // A failed history navigation must not show the previous page under a new URL.
      if (pushState === false) {
        renderedUrl = null;
        targetWrap.replaceChildren(error);
        document.title = isZh ? '页面加载失败' : 'Page could not load';
      } else {
        targetWrap.prepend(error);
      }
      retry.focus();
    }

    navigation.timer = setTimeout(showNavigationError, 15000);
    var now = Date.now();
    var cached = pageCache.get(url);
    if (cached && (now - cached.time < CACHE_TTL)) {
      Promise.resolve(cached.html).then(applyNewPage).catch(showNavigationError);
    } else {
      fetch(url, { headers: { 'X-PJAX': 'true' }, signal: navigation.controller ? navigation.controller.signal : undefined })
        .then(function(res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.text();
        })
        .then(function(htmlText) {
          if (activeNavigation !== navigation) return;
          applyNewPage(htmlText);
          pageCache.set(url, { html: htmlText, time: Date.now() });
        })
        .catch(showNavigationError);
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

  function updateTableAccessibility() {
    document.querySelectorAll('.main-content .table-wrapper').forEach(function(wrapper) {
      if (wrapper.scrollWidth > wrapper.clientWidth + 1) {
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'region');
        wrapper.setAttribute('aria-label', window.jtd.isChinese()
          ? '表格，可左右滚动查看' : 'Table, scroll horizontally to view');
      } else {
        wrapper.removeAttribute('tabindex');
        wrapper.removeAttribute('role');
        wrapper.removeAttribute('aria-label');
      }
    });
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
    var targetUrl = window.location.href;
    try {
      var currentObj = renderedUrl && new URL(renderedUrl, window.location.origin);
      var targetObj = new URL(targetUrl, window.location.origin);
      if (currentObj && currentObj.pathname === targetObj.pathname && currentObj.search === targetObj.search) {
        if (activeNavigation) {
          var cancelledNavigation = activeNavigation;
          activeNavigation = null;
          clearTimeout(cancelledNavigation.timer);
          if (cancelledNavigation.controller) cancelledNavigation.controller.abort();
          setProgress(100);
        }
        var targetWrap = document.querySelector('.main-content-wrap');
        if (targetWrap) targetWrap.style.opacity = '1';
        renderedUrl = targetUrl;
        window.jtd.activateNav(targetUrl);
        if (targetObj.hash) {
          var anchorId = targetObj.hash.slice(1);
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
        return;
      }
    } catch (err) {}
    navigateTo(targetUrl, false);
  });

  function onInit() {
    renderedUrl = window.location.href;
    stripRedundantTOC();
    updateTableAccessibility();
    updateBackToTopVisibility();
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onInit);
  } else {
    onInit();
  }

  window.addEventListener('resize', updateBackToTopVisibility, { passive: true });
  window.addEventListener('resize', updateTableAccessibility, { passive: true });

})();
