/* Markdown copy, AI sharing, and documentation links. */
(function() {
  'use strict';

  function isChineseContext() {
    return document.documentElement.lang === 'zh' ||
           document.body.getAttribute('data-lang') === 'zh' ||
           window.location.pathname.indexOf('/zh') !== -1;
  }

  function showToast(msg) {
    var toast = document.getElementById('tfc-toast');
    var toastMsg = document.getElementById('tfc-toast-message');
    if (!toast) return;
    if (toastMsg && msg) toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__tfc_toast_timer);
    window.__tfc_toast_timer = setTimeout(function() {
      toast.classList.remove('show');
    }, 2400);
  }

  function toggleAiDropdown(forceClose) {
    var dropdown = document.getElementById('tfc-ai-dropdown');
    var btn = document.getElementById('tfc-ai-btn-dropdown');
    if (!dropdown) return;
    var isOpen = dropdown.classList.contains('show');
    if (forceClose || isOpen) {
      dropdown.classList.remove('show');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    } else {
      dropdown.classList.add('show');
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }
  }

  function copyPageMarkdown(pagePath) {
    var isZh = isChineseContext();
    if (!pagePath) {
      var copyItem = document.getElementById('tfc-action-copy-md');
      if (copyItem) pagePath = copyItem.getAttribute('data-path');
    }
    if (!pagePath) {
      var p = window.location.pathname.replace(/^\/TheFatCat-docs\/?/, '').replace(/\/$/, '') || 'index';
      pagePath = p + '.md';
    }

    var rawUrl = 'https://raw.githubusercontent.com/TheFatCatOfficial/TheFatCat-docs/main/' + pagePath;
    fetch(rawUrl)
      .then(function(res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.text();
      })
      .then(function(text) {
        var clean = text.replace(/^---[\s\S]*?---\s*/, '');
        return navigator.clipboard.writeText(clean);
      })
      .then(function() {
        showToast(isZh ? '✓ 已复制本页纯净 Markdown (供大模型阅读)' : '✓ Copied page as Markdown for LLMs');
      })
      .catch(function() {
        var mainEl = document.querySelector('main');
        var textFallback = mainEl ? (mainEl.innerText || mainEl.textContent) : document.title;
        navigator.clipboard.writeText(textFallback).then(function() {
          showToast(isZh ? '✓ 已复制本页纯文本内容' : '✓ Copied page text for LLMs');
        });
      });
  }

  function copyFullKnowledgeBase() {
    var isZh = isChineseContext();
    var fileName = isZh ? 'llms-full-zh.txt' : 'llms-full.txt';
    var baseUrl = window.location.pathname.indexOf('/TheFatCat-docs') !== -1
      ? '/TheFatCat-docs/' + fileName
      : '/' + fileName;
    var rawUrl = 'https://raw.githubusercontent.com/TheFatCatOfficial/TheFatCat-docs/main/' + fileName;

    fetch(baseUrl)
      .then(function(res) {
        if (!res.ok) return fetch(rawUrl);
        return res;
      })
      .then(function(res) {
        if (!res.ok) throw new Error('Fetch failed: ' + res.status);
        return res.text();
      })
      .then(function(text) {
        return navigator.clipboard.writeText(text);
      })
      .then(function() {
        showToast(isZh ? '✓ 已复制完整用户文档' : '✓ Copied all user docs');
      })
      .catch(function(err) {
        console.error('Failed to copy full knowledge base:', err);
        showToast(isZh ? '复制失败，请直接访问 llms-full 链接' : 'Copy failed, please view llms-full directly');
      });
  }

  function openChatGPT() {
    var isZh = isChineseContext();
    var pageUrl = window.location.origin + window.location.pathname;
    var prompt = isZh
      ? '请阅读 TheFatCat 的这篇官方用户文档（' + pageUrl + '），帮我理解协议规则与操作说明，并回答我的问题。'
      : 'Please read this official TheFatCat user documentation page, explain the protocol rules and usage, and answer my questions: ' + pageUrl;
    var url = 'https://chatgpt.com/?hints=search&q=' + encodeURIComponent(prompt);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openClaude() {
    var isZh = isChineseContext();
    var pageUrl = window.location.origin + window.location.pathname;
    var prompt = isZh
      ? '请阅读 TheFatCat 的这篇官方用户文档，帮我理解协议规则与操作说明：' + pageUrl
      : 'Please read this official TheFatCat user documentation page and explain the protocol rules and usage: ' + pageUrl;
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
      copyBtn.disabled = true;
      var originalLabel = copyBtn.innerHTML;
      var codeText = codeEl.innerText || codeEl.textContent;
      Promise.resolve().then(function() {
        return navigator.clipboard.writeText(codeText);
      }).then(function() {
        copyBtn.innerHTML = isChineseContext() ? '✓ 已复制' : '✓ Copied!';
        setTimeout(function() {
          copyBtn.innerHTML = originalLabel;
          copyBtn.disabled = false;
        }, 1500);
      }).catch(function() {
        copyBtn.disabled = false;
        showToast(isChineseContext() ? '复制失败，请手动复制链接' : 'Copy failed, please copy the URLs manually');
      });
    }
  }

  window.tfcCopyPageMarkdown = copyPageMarkdown;
  window.tfcCopyFullKnowledgeBase = copyFullKnowledgeBase;
  window.tfcToggleAiDropdown = toggleAiDropdown;
  window.tfcToggleMcpModal = toggleMcpModal;
  window.tfcShowToast = showToast;

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
})();
