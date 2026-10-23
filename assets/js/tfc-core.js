/* Shared documentation URLs and page lifecycle subscriptions. */
(function(docs) {
  'use strict';

  docs.ready = function(callback) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", callback);
    else callback();
  };

  docs.onPageLoad = function(callback) {
    document.addEventListener("tfc:page-load", function(event) {
      callback(event.detail.root, event.detail.page);
    });
  };

  docs.isChinese = function() {
    return document.documentElement.lang === 'zh';
  };
  docs.messages = function() {
    return docs.config.ui[docs.isChinese() ? 'zh' : 'en'];
  };

  // Persistent controls are outside the article replaced during navigation.
  docs.onPageLoad(function() {
    var messages = docs.messages();
    [['data-ui-text', null], ['data-ui-label', 'aria-label'], ['data-ui-title', 'title']].forEach(function(binding) {
      document.querySelectorAll('[' + binding[0] + ']').forEach(function(element) {
        var text = messages[element.getAttribute(binding[0])];
        if (binding[1]) element.setAttribute(binding[1], text);
        else element.textContent = text;
      });
    });
  });

  docs.docsUrl = function(path) {
    return (docs.config.baseUrl || '').replace(/\/$/, '') + '/' + path.replace(/^\/+/, '');
  };
  docs.sourceUrl = function(path) {
    return docs.config.rawBaseUrl + path.replace(/^\/+/, '');
  };

})(window.tfcDocs = window.tfcDocs || {});
