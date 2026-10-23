/* Theme navigation adapter: mobile controls, language switcher and selected links. */
(function(docs) {
  'use strict';

  function initNav() {
    document.addEventListener('click', function(e){
      var target = e.target;
      while (target && !(target.classList && target.classList.contains('nav-list-expander'))) {
        target = target.parentNode;
      }
      if (target) {
        e.preventDefault();
        target.ariaExpanded = target.parentNode.classList.toggle('active');
      }
    });

    const siteNav = document.getElementById('site-nav');
    const mainHeader = document.getElementById('main-header');
    const menuButton = document.getElementById('menu-button');

    disableHeadNavStylesheet();

    var headerActions = document.getElementById('tfc-header-actions');
    var headerControls = mainHeader.querySelector('.header-controls');
    var auxNav = headerControls.querySelector('.aux-nav');
    var siteHeader = menuButton.parentElement;
    var mobile = window.matchMedia('(max-width: 47.99rem)');

    function setNavOpen(open, returnFocus) {
      [siteNav, mainHeader, menuButton].forEach(function(element) {
        element.classList.toggle('nav-open', open);
      });
      menuButton.ariaExpanded = open;
      if (returnFocus) menuButton.focus();
    }

    function positionNav() {
      if (mobile.matches) {
        siteNav.style.setProperty('--tfc-nav-top', mainHeader.getBoundingClientRect().bottom + 'px');
      }
    }

    function arrangeControls() {
      setNavOpen(false);
      if (mobile.matches) {
        mainHeader.insertBefore(menuButton, mainHeader.firstChild);
        siteNav.insertBefore(headerActions, siteNav.firstChild);
        if (auxNav) siteNav.appendChild(auxNav);
      } else {
        siteHeader.appendChild(menuButton);
        headerControls.appendChild(headerActions);
        if (auxNav) headerControls.appendChild(auxNav);
      }
      positionNav();
    }

    arrangeControls();
    mobile.addEventListener('change', arrangeControls);
    window.addEventListener('scroll', positionNav, { passive: true });
    window.addEventListener('resize', positionNav, { passive: true });
    menuButton.addEventListener('click', function(e) {
      e.preventDefault();
      positionNav();
      setNavOpen(!siteNav.classList.contains('nav-open'));
    });
    document.addEventListener('click', function(e) {
      if (!mobile.matches || !siteNav.classList.contains('nav-open')) return;
      if (e.target.closest('#menu-button')) return;
      if (e.target.closest('#site-nav a') || !siteNav.contains(e.target)) setNavOpen(false);
    });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && siteNav.classList.contains('nav-open')) setNavOpen(false, true);
    });
  }

  // The theme's no-JavaScript navigation stylesheet is replaced by this adapter.
  function disableHeadNavStylesheet() {
    const headNav = document.getElementById('jtd-head-nav-stylesheet');
    if (headNav) {
      headNav.disabled = true;
    }
  }
  // Match the same document with or without index.html, .html or a trailing slash.
  function normalizeNavPath(path) {
    return new URL(path, window.location.origin).pathname
      .replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
  }

  // Use the same selected-page and ancestor state on first load and PJAX navigation.
  docs.activateNav = function(targetUrl) {
    var activation = document.getElementById('jtd-nav-activation');
    if (activation) activation.textContent = '';
    var targetPath = normalizeNavPath(targetUrl);
    document.querySelectorAll('.site-nav .nav-list-item').forEach(function(item) {
      item.classList.remove('active');
      var expander = item.querySelector(':scope > .nav-list-expander');
      if (expander) expander.setAttribute('aria-expanded', 'false');
    });
    var matchedLink = null;
    document.querySelectorAll('.site-nav .nav-list-link').forEach(function(link) {
      link.classList.remove('active');
      if (normalizeNavPath(link.pathname) === targetPath) matchedLink = link;
    });
    if (matchedLink) {
      matchedLink.classList.add('active');
      var parentItem = matchedLink.closest('.nav-list-item');
      while (parentItem) {
        parentItem.classList.add('active');
        var expander = parentItem.querySelector(':scope > .nav-list-expander');
        if (expander) expander.setAttribute('aria-expanded', 'true');
        var parentList = parentItem.parentElement;
        parentItem = parentList ? parentList.closest('.nav-list-item') : null;
      }
    }
    return matchedLink;
  };


  docs.ready(function() { if (document.getElementById("site-nav")) initNav(); });

  docs.onPageLoad(function(root, page) {
    if (page) {
      var current = document.getElementById("tfc-lang-switcher");
      var next = page.getElementById("tfc-lang-switcher");
      if (current && next) current.innerHTML = next.innerHTML;
    }
    var active = docs.activateNav(window.location.href);
    if (root === document && active) active.scrollIntoView({ block: "center" });
  });

})(window.tfcDocs);
