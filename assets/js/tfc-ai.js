/* Markdown copy, AI sharing, and documentation links. */
(function(docs) {
  'use strict';

  var isChineseContext = docs.isChinese;
  var toastTimer = null;

  function aiUsage(isZh) {
    return docs.config.aiUsage[isZh ? 'zh' : 'en'];
  }

  function showToast(msg) {
    var toast = document.getElementById('tfc-toast');
    var toastMsg = document.getElementById('tfc-toast-message');
    if (!toast) return;
    if (toastMsg && msg) toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() {
      toast.classList.remove('show');
    }, 2400);
  }

  function positionAiDropdown() {
    var dropdown = document.getElementById('tfc-ai-dropdown');
    var btn = document.getElementById('tfc-ai-btn-dropdown');
    if (!dropdown || !btn || !dropdown.classList.contains('show')) return;
    var rect = btn.getBoundingClientRect();
    var below = Math.max(0, window.innerHeight - rect.bottom - 22);
    var above = Math.max(0, rect.top - 22);
    var opensUp = below < dropdown.scrollHeight && above > below;
    dropdown.classList.toggle('opens-up', opensUp);
    dropdown.style.setProperty('--tfc-menu-max-height', Math.floor(opensUp ? above : below) + 'px');
  }

  function toggleAiDropdown(forceClose) {
    var dropdown = document.getElementById('tfc-ai-dropdown');
    var btn = document.getElementById('tfc-ai-btn-dropdown');
    if (!dropdown) return;
    var isOpen = dropdown.classList.contains('show');
    if (forceClose || isOpen) {
      if (dropdown.contains(document.activeElement) && btn) btn.focus();
      dropdown.classList.remove('show');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.classList.add('show');
      if (btn) btn.setAttribute('aria-expanded', 'true');
      positionAiDropdown();
    }
  }

  window.addEventListener('resize', positionAiDropdown, { passive: true });
  window.addEventListener('scroll', positionAiDropdown, { passive: true });
  document.addEventListener('focusin', function(e) {
    if (!e.target.closest('#tfc-ai-actions-wrap')) toggleAiDropdown(true);
  });

  var beginCopy = docs.beginCopy;
  var writeLatestCopy = docs.writeLatestCopy;

  function copyPageMarkdown(pagePath) {
    var operation = beginCopy();
    var isZh = isChineseContext();
    var messages = docs.messages();
    var mainEl = document.querySelector('main');
    var textFallback = mainEl ? (mainEl.innerText || mainEl.textContent) : document.title;
    var usedFallback = false;
    if (!pagePath) {
      var copyItem = document.getElementById('tfc-action-copy-md');
      if (copyItem) pagePath = copyItem.getAttribute('data-path');
    }
    if (!pagePath) {
      var p = window.location.pathname;
      var base = docs.config.baseUrl;
      if (base && (p === base || p.indexOf(base + '/') === 0)) p = p.slice(base.length);
      p = p.replace(/^\//, '').replace(/\/index(?:\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
      if (!p) {
        pagePath = 'index.md';
      } else if (p === 'zh') {
        pagePath = 'zh/index.md';
      } else {
        pagePath = p + '.md';
      }
    }

    var rawUrl = docs.sourceUrl(pagePath);
    fetch(rawUrl, { signal: operation.signal })
      .then(function(res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.text();
      })
      .then(function(text) {
        if (/{%-?\s*(?:include(?:_cached)?|capture)\b/.test(text)) {
          return fetchKnowledgeBase(operation, isZh).then(function(bundle) {
            return bundledPageMarkdown(bundle, pagePath, isZh);
          });
        }
        return text.replace(/^---[\s\S]*?---\s*/, '');
      })
      .catch(function() {
        usedFallback = true;
        return textFallback;
      })
      .then(function(text) { return writeLatestCopy(operation, '> ' + aiUsage(isZh) + '\n\n' + text); })
      .then(function(copied) {
        if (!copied || !operation.isCurrent()) return;
        showToast(usedFallback
          ? messages.copy_page_text_success
          : messages.copy_page_success);
      })
      .catch(function() {
        if (operation.isCurrent()) showToast(messages.copy_page_error);
      });
  }

  function bundledPageMarkdown(bundle, pagePath, isZh) {
    var marker = '\n---\n# ' + (isZh ? '来源章节' : 'SOURCE') + ': ';
    var section = bundle.split(marker + pagePath + '\n---\n\n')[1];
    if (section === undefined) throw new Error('Page missing from documentation bundle');
    return section.split(marker)[0].replace(/^[^\n]+\n\n/, '').trim();
  }

  function fetchKnowledgeBase(operation, isZh) {
    var fileName = isZh ? 'llms-full-zh.txt' : 'llms-full.txt';
    var baseUrl = docs.docsUrl(fileName);
    var rawUrl = docs.sourceUrl(fileName);

    function fetchRaw() {
      if (!operation.isCurrent() || (operation.signal && operation.signal.aborted)) {
        throw new DOMException('Aborted', 'AbortError');
      }
      return fetch(rawUrl, { signal: operation.signal });
    }

    return fetch(baseUrl, { signal: operation.signal })
      .then(function(res) {
        if (res.ok) return res;
        return fetchRaw();
      }, function(err) {
        if (!operation.isCurrent() || (operation.signal && operation.signal.aborted) ||
            (err && err.name === 'AbortError')) {
          throw err;
        }
        return fetchRaw();
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.text();
      });
  }

  function copyFullKnowledgeBase() {
    var operation = beginCopy();
    var isZh = isChineseContext();
    var messages = docs.messages();
    fetchKnowledgeBase(operation, isZh)
      .then(function(text) {
        return writeLatestCopy(operation, text);
      })
      .then(function(copied) {
        if (!copied || !operation.isCurrent()) return;
        showToast(messages.copy_all_success);
      })
      .catch(function(err) {
        if (!operation.isCurrent()) return;
        if (err && err.name === 'AbortError') return;
        console.error('Failed to copy full knowledge base:', err);
        showToast(messages.copy_all_error);
      });
  }


  function sharedPageUrl() {
    var origin = window.location.origin;
    var localHost = /^(localhost|127\.0\.0\.1|\[::1\])$/;
    if (localHost.test(window.location.hostname)) {
      origin = new URL(docs.config.siteUrl).origin;
      var canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        var publishedUrl = new URL(canonical.href);
        if (!localHost.test(publishedUrl.hostname)) origin = publishedUrl.origin;
      }
      showToast(docs.messages().preview_share_notice);
    }
    return origin + window.location.pathname;
  }

  function openChatGPT() {
    var isZh = isChineseContext();
    var messages = docs.messages();
    var pageUrl = sharedPageUrl();
    var prompt = messages.chatgpt_prompt.replace('{url}', pageUrl);
    prompt += '\n\n' + aiUsage(isZh);
    var url = 'https://chatgpt.com/?hints=search&q=' + encodeURIComponent(prompt);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openClaude() {
    var isZh = isChineseContext();
    var messages = docs.messages();
    var pageUrl = sharedPageUrl();
    var prompt = messages.claude_prompt.replace('{url}', pageUrl);
    prompt += '\n\n' + aiUsage(isZh);
    var url = 'https://claude.ai/new?q=' + encodeURIComponent(prompt);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  var modalReturnFocus = null;

  function toggleMcpModal(open) {
    toggleAiDropdown(true);
    var modal = document.getElementById('tfc-mcp-modal');
    if (!modal) return;
    if (open) {
      if (modal.classList.contains('show')) return;
      modalReturnFocus = document.getElementById('tfc-ai-btn-dropdown') || document.activeElement;
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tfc-modal-open');
      var closeButton = document.getElementById('tfc-mcp-close');
      (closeButton || modal).focus();
    } else {
      var wasOpen = modal.classList.contains('show');
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tfc-modal-open');
      if (wasOpen && modalReturnFocus && modalReturnFocus.isConnected) modalReturnFocus.focus();
    }
  }

  function copyMcpCode(copyBtn) {
    var targetId = copyBtn.getAttribute('data-target');
    var codeEl = targetId ? document.getElementById(targetId) : null;
    if (!codeEl) {
      var parentContent = copyBtn.closest('.tfc-mcp-tab-content');
      if (parentContent) codeEl = parentContent.querySelector('code');
    }
    if (codeEl) {
      if (copyBtn.disabled) return;
      var operation = beginCopy();
      copyBtn.disabled = true;
      var originalLabel = copyBtn.innerHTML;
      var codeText = codeEl.innerText || codeEl.textContent;
      writeLatestCopy(operation, codeText).then(function(copied) {
        if (!copied || !operation.isCurrent()) { copyBtn.disabled = false; return; }
        copyBtn.innerHTML = docs.messages().copy_urls_success;
        setTimeout(function() {
          copyBtn.innerHTML = originalLabel;
          copyBtn.disabled = false;
        }, 1500);
      }).catch(function() {
        copyBtn.disabled = false;
        if (operation.isCurrent()) showToast(docs.messages().copy_urls_error);
      });
    }
  }


  document.addEventListener('click', function(e) {
    var copyBtn = e.target.closest('#tfc-ai-btn-copy');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyPageMarkdown();
      return;
    }

    var dropdownBtn = e.target.closest('#tfc-ai-btn-dropdown');
    if (dropdownBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown();
      if (e.detail === 0 && dropdownBtn.getAttribute('aria-expanded') === 'true') {
        document.querySelector('#tfc-ai-dropdown [role="menuitem"]').focus();
      }
      return;
    }

    var copyItem = e.target.closest('#tfc-action-copy-md');
    if (copyItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyPageMarkdown(copyItem.getAttribute('data-path'));
      return;
    }

    var copyFullItem = e.target.closest('#tfc-action-copy-full');
    if (copyFullItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyFullKnowledgeBase();
      return;
    }

    var viewRawItem = e.target.closest('#tfc-action-view-raw');
    if (viewRawItem) {
      toggleAiDropdown(true);
      return;
    }

    var chatgptItem = e.target.closest('#tfc-action-chatgpt');
    if (chatgptItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      openChatGPT();
      return;
    }

    var claudeItem = e.target.closest('#tfc-action-claude');
    if (claudeItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      openClaude();
      return;
    }

    var mcpItem = e.target.closest('#tfc-action-mcp');
    if (mcpItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleMcpModal(true);
      return;
    }

    var mcpClose = e.target.closest('#tfc-mcp-close');
    if (mcpClose || e.target.id === 'tfc-mcp-modal') {
      e.preventDefault();
      e.stopPropagation();
      toggleMcpModal(false);
      return;
    }

    var copyCodeBtn = e.target.closest('.tfc-mcp-copy-code');
    if (copyCodeBtn) {
      e.preventDefault();
      e.stopPropagation();
      copyMcpCode(copyCodeBtn);
      return;
    }

    var insideWrap = e.target.closest('#tfc-ai-actions-wrap');
    if (!insideWrap) {
      toggleAiDropdown(true);
    }
  });

  document.addEventListener('keydown', function(e) {
    var dropdown = document.getElementById('tfc-ai-dropdown');
    var trigger = e.target.closest('#tfc-ai-btn-dropdown');
    var inMenu = dropdown && dropdown.contains(e.target);
    if ((trigger || inMenu) && ['ArrowDown', 'ArrowUp', 'Home', 'End'].indexOf(e.key) !== -1) {
      e.preventDefault();
      if (!dropdown.classList.contains('show')) toggleAiDropdown();
      var items = Array.prototype.slice.call(dropdown.querySelectorAll('[role="menuitem"]'));
      var index = items.indexOf(document.activeElement);
      if (e.key === 'Home') index = 0;
      else if (e.key === 'End') index = items.length - 1;
      else if (e.key === 'ArrowUp') index = index <= 0 ? items.length - 1 : index - 1;
      else index = (index + 1) % items.length;
      items[index].focus();
      return;
    }
    if (e.key === 'Escape') {
      toggleAiDropdown(true);
      toggleMcpModal(false);
    } else if (e.key === 'Tab') {
      var modal = document.getElementById('tfc-mcp-modal');
      if (!modal || !modal.classList.contains('show')) return;
      var focusable = Array.prototype.filter.call(
        modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function(el) { return el.getClientRects().length > 0; }
      );
      var first = focusable[0] || modal;
      var last = focusable[focusable.length - 1] || modal;
      if (e.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !modal.contains(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  });
})(window.tfcDocs);
