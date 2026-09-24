/**
 * TheFatCat Documentation — AI & LLM Interactions Engine
 * Provides one-click Markdown copy for LLMs, prompt generation for ChatGPT/Claude,
 * Model Context Protocol (MCP) modal, and standard llms.txt entrypoints.
 */
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
        showToast(isZh ? '✓ 已复制全协议完整知识库 (41章节 / 约113KB)' : '✓ Copied full protocol docs (41 chapters)');
      })
      .catch(function(err) {
        console.error('Failed to copy full knowledge base:', err);
        showToast(isZh ? '复制失败，请直接访问 llms-full 链接' : 'Copy failed, please view llms-full directly');
      });
  }

  function openChatGPT() {
    var isZh = isChineseContext();
    var prompt = isZh
      ? '请阅读并深入解析 TheFatCat 协议的这篇官方技术文档（' + window.location.href + '），帮我梳理其核心机制逻辑并回答我的问题。'
      : 'Please explain the following TheFatCat protocol documentation page, analyze its key mechanisms, and answer questions about it: ' + window.location.href;
    var url = 'https://chatgpt.com/?hints=search&q=' + encodeURIComponent(prompt);
    window.open(url, '_blank');
  }

  function openClaude() {
    var isZh = isChineseContext();
    var prompt = isZh
      ? '请阅读并深入分析 TheFatCat 协议的这篇技术文档：' + window.location.href
      : 'Please analyze this TheFatCat protocol documentation page: ' + window.location.href;
    var url = 'https://claude.ai/new?q=' + encodeURIComponent(prompt);
    window.open(url, '_blank');
  }

  function toggleMcpModal(open) {
    toggleAiDropdown(true);
    var modal = document.getElementById('tfc-mcp-modal');
    if (!modal) return;
    if (open) {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      modal.classList.add('show');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('tfc-modal-open');
    } else {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('tfc-modal-open');
    }
  }

  function switchMcpTab(tabName, tabBtn) {
    var allTabs = document.querySelectorAll('.tfc-mcp-tab');
    allTabs.forEach(function(t) { t.classList.remove('active'); });
    if (tabBtn) tabBtn.classList.add('active');

    var contents = document.querySelectorAll('.tfc-mcp-tab-content');
    contents.forEach(function(c) {
      c.style.display = 'none';
      c.classList.remove('active');
    });
    var activeContent = document.getElementById('tfc-tab-' + tabName);
    if (activeContent) {
      activeContent.style.display = 'block';
      activeContent.classList.add('active');
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
      var codeText = codeEl.innerText || codeEl.textContent;
      navigator.clipboard.writeText(codeText).then(function() {
        var origText = copyBtn.textContent;
        copyBtn.textContent = '✓ Copied!';
        setTimeout(function() { copyBtn.textContent = origText; }, 1500);
      });
    }
  }

  // Global window functions
  window.tfcCopyPageMarkdown = copyPageMarkdown;
  window.tfcCopyFullKnowledgeBase = copyFullKnowledgeBase;
  window.tfcToggleAiDropdown = toggleAiDropdown;
  window.tfcToggleMcpModal = toggleMcpModal;
  window.tfcShowToast = showToast;

  // Single robust event delegation on document
  document.addEventListener('click', function(e) {
    // 1. Direct Copy button (left portion of split button)
    var copyBtn = e.target.closest('#tfc-ai-btn-copy');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyPageMarkdown();
      return;
    }

    // 2. Dropdown trigger button (chevron portion of split button)
    var dropdownBtn = e.target.closest('#tfc-ai-btn-dropdown');
    if (dropdownBtn) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown();
      return;
    }

    // 3. Dropdown Item: Copy Markdown
    var copyItem = e.target.closest('#tfc-action-copy-md');
    if (copyItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyPageMarkdown(copyItem.getAttribute('data-path'));
      return;
    }

    // 3b. Dropdown Item: Copy Full Documentation (41 chapters)
    var copyFullItem = e.target.closest('#tfc-action-copy-full');
    if (copyFullItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      copyFullKnowledgeBase();
      return;
    }

    // 4. Dropdown Item: View Raw Markdown
    var viewRawItem = e.target.closest('#tfc-action-view-raw');
    if (viewRawItem) {
      toggleAiDropdown(true);
      return;
    }

    // 5. Dropdown Item: ChatGPT
    var chatgptItem = e.target.closest('#tfc-action-chatgpt');
    if (chatgptItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      openChatGPT();
      return;
    }

    // 6. Dropdown Item: Claude
    var claudeItem = e.target.closest('#tfc-action-claude');
    if (claudeItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleAiDropdown(true);
      openClaude();
      return;
    }

    // 7. Dropdown Item: MCP Modal
    var mcpItem = e.target.closest('#tfc-action-mcp');
    if (mcpItem) {
      e.preventDefault();
      e.stopPropagation();
      toggleMcpModal(true);
      return;
    }

    // 8. Close MCP Modal
    var mcpClose = e.target.closest('#tfc-mcp-close');
    if (mcpClose || e.target.id === 'tfc-mcp-modal') {
      e.preventDefault();
      e.stopPropagation();
      toggleMcpModal(false);
      return;
    }

    // 9. MCP Modal Tabs
    var tabBtn = e.target.closest('.tfc-mcp-tab');
    if (tabBtn) {
      e.preventDefault();
      e.stopPropagation();
      switchMcpTab(tabBtn.getAttribute('data-tab'), tabBtn);
      return;
    }

    // 10. MCP Copy Code Button
    var copyCodeBtn = e.target.closest('.tfc-mcp-copy-code');
    if (copyCodeBtn) {
      e.preventDefault();
      e.stopPropagation();
      copyMcpCode(copyCodeBtn);
      return;
    }

    // 11. Click outside dropdown -> close it
    var insideWrap = e.target.closest('#tfc-ai-actions-wrap');
    if (!insideWrap) {
      toggleAiDropdown(true);
    }
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      toggleAiDropdown(true);
      toggleMcpModal(false);
    }
  });
})();
