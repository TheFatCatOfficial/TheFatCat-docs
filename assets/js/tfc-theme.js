/* One theme state for early rendering, the toggle and persisted preferences. */
(function(docs) {
  'use strict';

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f0e6d2' : '#111614');
  }

  var initial = 'dark';
  try {
    var saved = localStorage.getItem('tfc_docs_theme');
    initial = saved === 'light' || saved === 'dark' ? saved
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch (error) {}
  setTheme(initial);
  docs.ready(function() { setTheme(document.documentElement.getAttribute('data-theme')); });

  document.addEventListener('click', function(event) {
    var button = event.target.closest('#theme-toggle-btn');
    if (!button) return;
    event.preventDefault();
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('tfc_docs_theme', next); } catch (error) {}
    if (event.detail > 0) button.blur();
  });
})(window.tfcDocs);
