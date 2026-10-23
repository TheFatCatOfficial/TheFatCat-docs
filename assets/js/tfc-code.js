/* Idempotent code accessibility and copy buttons for every rendered page. */
(function(docs) {
  'use strict';

  function initCopyButtons(root) {
    var container = root || document;
    container.querySelectorAll("div.highlight").forEach(function(block) { block.tabIndex = 0; });
    var codeBlocks = container.querySelectorAll('div.highlighter-rouge, figure.highlight, pre:not(.highlight)');

    var messages = docs.messages();

    var copyIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#tfc-icon-copy-code"></use></svg>';
    var copiedIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="#tfc-icon-check"></use></svg>';

    function fallbackCopyText(text) {
      var previousFocus = document.activeElement;
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        return document.execCommand('copy');
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
        if (previousFocus && previousFocus.isConnected) previousFocus.focus();
      }
    }

    codeBlocks.forEach(function(codeBlock) {
      if (codeBlock.closest && (codeBlock.closest('#tfc-mcp-modal') || codeBlock.closest('.tfc-diagram-frame'))) {
        return;
      }
      if (codeBlock.classList && (codeBlock.classList.contains('tfc-diagram-frame') || codeBlock.classList.contains('tfc-diagram-content'))) {
        return;
      }
      if (codeBlock.tagName === 'PRE' && codeBlock.closest && codeBlock.closest('div.highlighter-rouge, figure.highlight, .tfc-diagram-frame')) {
        return;
      }

      var targetContainer = codeBlock;
      if (codeBlock.tagName === 'PRE') {
        if (codeBlock.parentElement && codeBlock.parentElement.classList.contains('tfc-code-wrap')) {
          targetContainer = codeBlock.parentElement;
        } else {
          var wrapper = document.createElement('div');
          wrapper.className = 'highlighter-rouge tfc-code-wrap';
          codeBlock.parentNode.insertBefore(wrapper, codeBlock);
          wrapper.appendChild(codeBlock);
          targetContainer = wrapper;
        }
      }

      if (targetContainer.querySelector('.tfc-code-copy-btn')) {
        return;
      }

      var copyButton = document.createElement('button');
      var timeout = null;
      var copying = false;
      copyButton.type = 'button';
      copyButton.className = 'tfc-code-copy-btn';
      copyButton.setAttribute('aria-label', messages.copy_code_label);
      copyButton.innerHTML = copyIconSvg;

      targetContainer.appendChild(copyButton);

      copyButton.addEventListener('click', function(e) {
        e.stopPropagation();
        if (timeout !== null || copying) return;
        copying = true;
        copyButton.setAttribute('aria-busy', 'true');

        var targetPre = targetContainer.querySelector('pre') || targetContainer.querySelector('code') || targetContainer;
        var code = targetPre ? (targetPre.innerText || targetPre.textContent) : '';
        code = code.replace(/\n$/, '');

        var doSuccess = function() {
          var status = targetContainer.querySelector('.tfc-code-copy-status');
          if (status) status.remove();
          copyButton.classList.add('copied');
          copyButton.innerHTML = copiedIconSvg;
          timeout = setTimeout(function() {
            copyButton.classList.remove('copied');
            copyButton.innerHTML = copyIconSvg;
            timeout = null;
          }, 2000);
        };

        var modernClipboard = navigator.clipboard && navigator.clipboard.writeText;
        var operation = docs.beginCopy();
        function doFailure() {
          if (!copyButton.isConnected || !operation.isCurrent()) return;
          var status = targetContainer.querySelector('.tfc-code-copy-status');
          if (!status) {
            status = document.createElement('span');
            status.className = 'tfc-code-copy-status';
            status.setAttribute('role', 'status');
            targetContainer.appendChild(status);
          }
          status.textContent = messages.copy_code_error;
        }
        docs.writeLatestCopy(operation, code, function() {
          if (!modernClipboard) return fallbackCopyText(code);
          return navigator.clipboard.writeText(code).catch(function() {
            return operation.isCurrent() && copyButton.isConnected && fallbackCopyText(code);
          });
        }).then(function(copied) {
          if (!operation.isCurrent() || !copyButton.isConnected) return;
          if (copied) doSuccess(); else doFailure();
        }).catch(doFailure).then(function() {
          copying = false;
          copyButton.setAttribute('aria-busy', 'false');
        });
      });
    });
  }


  docs.onPageLoad(initCopyButtons);

})(window.tfcDocs);
