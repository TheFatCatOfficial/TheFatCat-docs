/* Shared page rendering lifecycle for direct loads and internal navigation. */
(function(docs) {
  'use strict';

  docs.renderMath = function(target) {
    if (typeof renderMathInElement === 'function') {
      var el = target || document.getElementById('main-content') || document.querySelector('main') || document.body;
      if (el) {
        renderMathInElement(el, {
          delimiters: [
            {left: '$$', right: '$$', display: true},
            {left: '$', right: '$', display: false},
            {left: '\\(', right: '\\)', display: false},
            {left: '\\[', right: '\\]', display: true}
          ],
          throwOnError: false
        });
      }
    }
  };

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
        wrapper.setAttribute('aria-label', docs.messages().table_scroll_label);
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

  docs.refreshPage = function(root, page) {
    if (page) {
      document.title = page.title;
      document.documentElement.lang = page.documentElement.lang || 'en';
      // Only page metadata is replaced; scripts, resources and user preferences persist.
      ['link[rel="canonical"]', 'meta[name="description"]', 'meta[property^="og:"]',
        'meta[name^="twitter:"]', 'script[type="application/ld+json"]'].forEach(function(selector) {
        document.head.querySelectorAll(selector).forEach(function(node) { node.remove(); });
        page.head.querySelectorAll(selector).forEach(function(node) { document.head.appendChild(node.cloneNode(true)); });
      });
    }
    document.dispatchEvent(new CustomEvent('tfc:page-load', { detail: { root: root, page: page } }));
  };

  docs.onPageLoad(function(root) {
    stripRedundantTOC(root);
    docs.renderMath(root);
    updateTableAccessibility();
    updateBackToTopVisibility();
  });
  docs.ready(function() { docs.refreshPage(document); });
  window.addEventListener('resize', updateBackToTopVisibility, { passive: true });
  window.addEventListener('resize', updateTableAccessibility, { passive: true });

})(window.tfcDocs);
