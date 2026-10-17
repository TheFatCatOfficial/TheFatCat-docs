---
layout: null
---
(function (jtd, undefined) {

// Event handling

jtd.addEvent = function(el, type, handler) {
  if (el.attachEvent) el.attachEvent('on'+type, handler); else el.addEventListener(type, handler);
}
jtd.removeEvent = function(el, type, handler) {
  if (el.detachEvent) el.detachEvent('on'+type, handler); else el.removeEventListener(type, handler);
}
jtd.onReady = function(ready) {
  // in case the document is already rendered
  if (document.readyState!='loading') ready();
  // modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', ready);
  // IE <= 8
  else document.attachEvent('onreadystatechange', function(){
      if (document.readyState=='complete') ready();
  });
}

jtd.isChinese = function() {
  return document.documentElement.lang === 'zh';
};
jtd.docsUrl = function(path) {
  return (jtd.docsConfig.baseUrl || '').replace(/\/$/, '') + '/' + path.replace(/^\/+/, '');
};
jtd.sourceUrl = function(path) {
  return jtd.docsConfig.rawBaseUrl + path.replace(/^\/+/, '');
};

var copySequence = 0;
var copyController = null;
var copyQueue = Promise.resolve();
jtd.beginCopy = function() {
  if (copyController) copyController.abort();
  copyController = window.AbortController ? new AbortController() : null;
  var id = ++copySequence;
  return { signal: copyController ? copyController.signal : undefined,
    isCurrent: function() { return id === copySequence; } };
};
jtd.writeLatestCopy = function(operation, text, writer) {
  // Serialize writes so an already-started old write cannot finish after the latest.
  copyQueue = copyQueue.catch(function() {}).then(function() {
    if (!operation.isCurrent()) return false;
    if (writer) return writer(text);
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
    return navigator.clipboard.writeText(text);
  }).then(function(result) { return result !== false; });
  return copyQueue;
};

// Show/hide mobile menu

function initNav() {
  jtd.addEvent(document, 'click', function(e){
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

  disableHeadStyleSheets();

  var headerActions = document.getElementById('tfc-header-actions');
  var headerControls = mainHeader.querySelector('.header-controls');
  var auxNav = headerControls.querySelector('.aux-nav');
  var siteHeader = menuButton.parentElement;
  var mobile = window.matchMedia('(max-width: 47.99rem)');

  function closeNav(returnFocus) {
    siteNav.classList.remove('nav-open');
    mainHeader.classList.remove('nav-open');
    menuButton.classList.remove('nav-open');
    menuButton.ariaExpanded = false;
    if (returnFocus) menuButton.focus();
  }

  function positionNav() {
    if (mobile.matches) {
      siteNav.style.setProperty('--tfc-nav-top', mainHeader.getBoundingClientRect().bottom + 'px');
    }
  }

  function arrangeControls() {
    closeNav(false);
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
  jtd.addEvent(menuButton, 'click', function(e) {
    e.preventDefault();
    if (siteNav.classList.contains('nav-open')) {
      closeNav(false);
    } else {
      positionNav();
      siteNav.classList.add('nav-open');
      mainHeader.classList.add('nav-open');
      menuButton.classList.add('nav-open');
      menuButton.ariaExpanded = true;
    }
  });
  jtd.addEvent(document, 'click', function(e) {
    if (!mobile.matches || !siteNav.classList.contains('nav-open')) return;
    if (e.target.closest('#menu-button')) return;
    if (e.target.closest('#site-nav a') || !siteNav.contains(e.target)) closeNav(false);
  });
  jtd.addEvent(document, 'keydown', function(e) {
    if (e.key === 'Escape' && siteNav.classList.contains('nav-open')) closeNav(true);
  });
}

// The <head> element is assumed to include the following stylesheets:
// - a <link> to /assets/css/just-the-docs-head-nav.css,
//             with id 'jtd-head-nav-stylesheet'
// - a <style> containing the result of _includes/css/activation.scss.liquid.
// To avoid relying on the order of stylesheets (which can change with HTML
// compression, user-added JavaScript, and other side effects), stylesheets
// are only interacted with via ID

function disableHeadStyleSheets() {
  const headNav = document.getElementById('jtd-head-nav-stylesheet');
  if (headNav) {
    headNav.disabled = true;
  }

  const activation = document.getElementById('jtd-nav-activation');
  if (activation) {
    activation.disabled = true;
  }
}
// Site search

function initSearch() {
  var index = null;
  var docs = null;
  var loading = false;
  var composing = false;
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var mainHeader = document.getElementById('main-header');
  var currentInput;
  var currentLanguage;
  var currentSearchIndex = 0;

  function loadIndex() {
    if (loading) return;
    loading = true;
    searchInput.setAttribute('aria-busy', 'true');
    update();
    var request = new XMLHttpRequest();
    var searchDataUrl = jtd.docsUrl('assets/js/search-data.json');
    request.open('GET', searchDataUrl, true);
    request.timeout = 15000;

    function failed() {
      loading = false;
      searchInput.setAttribute('aria-busy', 'false');
      update();
    }

    request.onload = function() {
      if (request.status < 200 || request.status >= 400) { failed(); return; }
      try {
        docs = JSON.parse(request.responseText);
        var decoder = document.createElement('textarea');
        Object.keys(docs).forEach(function(id) {
          ['doc', 'title', 'content'].forEach(function(field) {
            decoder.innerHTML = docs[id][field];
            docs[id][field] = decoder.value;
          });
        });
        lunr.tokenizer.separator = /[\s\-/]+/;
        index = lunr(function() {
          this.ref('id');
          this.field('title', { boost: 200 });
          this.field('content', { boost: 2 });
          this.metadataWhitelist = ['position'];
          for (var i in docs) {
            this.add({ id: i, title: docs[i].title, content: docs[i].content, relUrl: docs[i].relUrl });
          }
        });
      } catch (error) { failed(); return; }
      loading = false;
      searchInput.setAttribute('aria-busy', 'false');
      update();
      window.tfcHighlightSearch();
      if (document.activeElement !== searchInput && !searchResults.contains(document.activeElement)) hideSearch();
    };
    request.onerror = failed;
    request.ontimeout = failed;
    request.send();
  }

  function showSearch() {
    document.documentElement.classList.add('search-active');
  }

  function hideSearch() {
    document.documentElement.classList.remove('search-active');
  }

  function positionsOf(text, term) {
    if (!term || typeof term !== 'string' || !text) return [];
    var positions = [];
    var start = 0;
    var lower = text.toLowerCase();
    while ((start = lower.indexOf(term, start)) !== -1) {
      positions.push([start, term.length]);
      start += term.length;
    }
    return positions;
  }


  function findResults(input) {
    var terms = input.toLowerCase().match(/[\p{L}\p{N}_]+/gu) || [];
    if (!terms.length) return [];
    var results;
    // Match Chinese phrases as written; Lunr's English pipeline strips Han text.
    if (/\p{Script=Han}/u.test(input)) {
      results = [];
      Object.keys(docs).forEach(function(ref) {
        var metadata = Object.create(null);
        var score = 0;
        var matched = terms.every(function(term) {
          var fields = {};
          ['title', 'content'].forEach(function(field) {
            var positions = positionsOf(docs[ref][field], term);
            if (positions.length) {
              fields[field] = { position: positions };
              score += positions.length * (field === 'title' ? 200 : 2);
            }
          });
          metadata[term] = fields;
          return Object.keys(fields).length > 0;
        });
        if (matched) results.push({ ref: ref, score: score, matchData: { metadata: metadata } });
      });
      results.sort(function(a, b) { return b.score - a.score; });
    } else {
      results = index.query(function(query) {
        query.term(terms, { boost: 10 });
        query.term(terms, { wildcard: lunr.Query.wildcard.TRAILING });
      });
      if (!results.length && input.length > 2) {
        var fuzzyTerms = terms.filter(function(term) { return term.length < 20; });
        if (fuzzyTerms.length) {
          results = index.query(function(query) {
            query.term(fuzzyTerms, { editDistance: Math.round(Math.sqrt(input.length / 2 - 1)) });
          });
        }
      }
    }
    return results.filter(function(result) {
      var doc = docs[result.ref];
      if (!doc.content.trim() && doc.url.indexOf('#') === -1) return false;
      return Object.keys(result.matchData.metadata).some(function(term) {
        var match = result.matchData.metadata[term];
        return match.title || match.content;
      });
    });
  }

  function update() {
    if (composing) return;

    var input = searchInput.value;
    var isZh = jtd.isChinese();
    if (input === '') {
      hideSearch();
    } else {
      showSearch();
    }
    if (!index) {
      searchResults.innerHTML = '';
      var status = document.createElement('div');
      status.className = 'search-no-result';
      status.setAttribute('role', 'status');
      status.textContent = loading
        ? (isZh ? '搜索正在加载…' : 'Loading search…')
        : (isZh ? '搜索加载失败，请重试。 ' : 'Search could not load. Please retry. ');
      if (!loading) {
        var retry = document.createElement('button');
        retry.type = 'button';
        retry.className = 'btn';
        retry.textContent = isZh ? '重试' : 'Retry';
        retry.addEventListener('click', function() { searchInput.focus(); loadIndex(); });
        status.appendChild(retry);
      }
      searchResults.appendChild(status);
      return;
    }
    if (input === currentInput && isZh === currentLanguage) {
      return;
    }
    currentSearchIndex++;
    currentInput = input;
    currentLanguage = isZh;
    searchResults.innerHTML = '';
    if (input === '') {
      return;
    }

    var results = findResults(input);

    var rawResults = results;
    // Strictly filter results to match the currently viewed language (preventing EN/ZH mixing)
    results = results.filter(function (result) {
      var doc = docs[result.ref];
      if (!doc || !doc.url) return false;
      var docIsZh = (doc.url.indexOf('/zh/') !== -1 || doc.url.indexOf('/zh.html') !== -1);
      return isZh ? docIsZh : !docIsZh;
    });

    if (results.length == 0) {
      var noResultsDiv = document.createElement('div');
      noResultsDiv.classList.add('search-no-result');
      noResultsDiv.innerText = isZh ? '未找到相关中文文档' : 'No results found in English docs';
      searchResults.appendChild(noResultsDiv);

      var otherLangResults = rawResults.filter(function (result) {
        var doc = docs[result.ref];
        if (!doc || !doc.url) return false;
        var docIsZh = (doc.url.indexOf('/zh/') !== -1 || doc.url.indexOf('/zh.html') !== -1);
        return isZh ? !docIsZh : docIsZh;
      });
      if (otherLangResults.length > 0) {
        var altNotice = document.createElement('div');
        altNotice.classList.add('search-no-result-hint');
        altNotice.innerText = isZh ? 
          ('在英文文档中找到 ' + otherLangResults.length + ' 条匹配') : 
          ('Found ' + otherLangResults.length + ' match(es) in Chinese docs');
        searchResults.appendChild(altNotice);
      }
    } else {
      var resultsList = document.createElement('ul');
      resultsList.classList.add('search-results-list');
      searchResults.appendChild(resultsList);

      addResults(resultsList, results, 0, 10, 100, currentSearchIndex);
    }

    function addResults(resultsList, results, start, batchSize, batchMillis, searchIndex) {
      if (searchIndex != currentSearchIndex) {
        return;
      }
      for (var i = start; i < (start + batchSize); i++) {
        if (i == results.length) {
          return;
        }
        addResult(resultsList, results[i]);
      }
      setTimeout(function() {
        addResults(resultsList, results, start + batchSize, batchSize, batchMillis, searchIndex);
      }, batchMillis);
    }

    function addResult(resultsList, result) {
      var doc = docs[result.ref];

      var resultsListItem = document.createElement('li');
      resultsListItem.classList.add('search-results-list-item');
      resultsList.appendChild(resultsListItem);

      var resultLink = document.createElement('a');
      resultLink.classList.add('search-result');
      var resultUrl = new URL(doc.url, window.location.origin);
      resultUrl.searchParams.set('q', input.trim());
      resultLink.setAttribute('href', resultUrl.pathname + resultUrl.search + resultUrl.hash);
      resultsListItem.appendChild(resultLink);

      var resultTitle = document.createElement('div');
      resultTitle.classList.add('search-result-title');
      resultLink.appendChild(resultTitle);

      // note: the SVG svg-doc is only loaded as a Jekyll include if site.search_enabled is true; see _includes/icons/icons.html
      var resultDoc = document.createElement('div');
      resultDoc.classList.add('search-result-doc');
      resultDoc.innerHTML = '<svg viewBox="0 0 24 24" class="search-result-icon" aria-hidden="true"><use xlink:href="#svg-doc"></use></svg>';
      resultTitle.appendChild(resultDoc);

      var resultDocTitle = document.createElement('div');
      resultDocTitle.classList.add('search-result-doc-title');
      resultDocTitle.textContent = doc.doc;
      resultDoc.appendChild(resultDocTitle);
      var resultDocOrSection = resultDocTitle;

      if (doc.doc != doc.title) {
        resultDoc.classList.add('search-result-doc-parent');
        var resultSection = document.createElement('div');
        resultSection.classList.add('search-result-section');
        resultSection.textContent = doc.title;
        resultTitle.appendChild(resultSection);
        resultDocOrSection = resultSection;
      }

      var metadata = result.matchData.metadata;
      var titlePositions = [];
      var contentPositions = [];
      for (var j in metadata) {
        var meta = metadata[j];
        if (meta.title) {
          var positions = meta.title.position;
          for (var k in positions) {
            titlePositions.push(positions[k]);
          }
        }
        if (meta.content) {
          var positions = meta.content.position;
          for (var k in positions) {
            var position = positions[k];
            var previewStart = position[0];
            var previewEnd = position[0] + position[1];
            var ellipsesBefore = true;
            var ellipsesAfter = true;
            for (var k = 0; k < 5; k++) {
              var nextSpace = doc.content.lastIndexOf(' ', previewStart - 2);
              var nextDot = doc.content.lastIndexOf('. ', previewStart - 2);
              if ((nextDot >= 0) && (nextDot > nextSpace)) {
                previewStart = nextDot + 1;
                ellipsesBefore = false;
                break;
              }
              if (nextSpace < 0) {
                previewStart = 0;
                ellipsesBefore = false;
                break;
              }
              previewStart = nextSpace + 1;
            }
            for (var k = 0; k < 10; k++) {
              var nextSpace = doc.content.indexOf(' ', previewEnd + 1);
              var nextDot = doc.content.indexOf('. ', previewEnd + 1);
              if ((nextDot >= 0) && (nextDot < nextSpace)) {
                previewEnd = nextDot;
                ellipsesAfter = false;
                break;
              }
              if (nextSpace < 0) {
                previewEnd = doc.content.length;
                ellipsesAfter = false;
                break;
              }
              previewEnd = nextSpace;
            }
            contentPositions.push({
              highlight: position,
              previewStart: previewStart, previewEnd: previewEnd,
              ellipsesBefore: ellipsesBefore, ellipsesAfter: ellipsesAfter
            });
          }
        }
      }

      if (titlePositions.length > 0) {
        titlePositions.sort(function(p1, p2){ return p1[0] - p2[0] });
        resultDocOrSection.innerHTML = '';
        addHighlightedText(resultDocOrSection, doc.title, 0, doc.title.length, titlePositions);
      }

      if (contentPositions.length > 0) {
        contentPositions.sort(function(p1, p2){ return p1.highlight[0] - p2.highlight[0] });
        var contentPosition = contentPositions[0];
        var previewPosition = {
          highlight: [contentPosition.highlight],
          previewStart: contentPosition.previewStart, previewEnd: contentPosition.previewEnd,
          ellipsesBefore: contentPosition.ellipsesBefore, ellipsesAfter: contentPosition.ellipsesAfter
        };
        var previewPositions = [previewPosition];
        for (var j = 1; j < contentPositions.length; j++) {
          contentPosition = contentPositions[j];
          if (previewPosition.previewEnd < contentPosition.previewStart) {
            previewPosition = {
              highlight: [contentPosition.highlight],
              previewStart: contentPosition.previewStart, previewEnd: contentPosition.previewEnd,
              ellipsesBefore: contentPosition.ellipsesBefore, ellipsesAfter: contentPosition.ellipsesAfter
            }
            previewPositions.push(previewPosition);
          } else {
            previewPosition.highlight.push(contentPosition.highlight);
            previewPosition.previewEnd = contentPosition.previewEnd;
            previewPosition.ellipsesAfter = contentPosition.ellipsesAfter;
          }
        }

        var resultPreviews = document.createElement('div');
        resultPreviews.classList.add('search-result-previews');
        resultLink.appendChild(resultPreviews);

        var content = doc.content;
        for (var j = 0; j < Math.min(previewPositions.length, 3); j++) {
          var position = previewPositions[j];

          var resultPreview = document.createElement('div');
          resultPreview.classList.add('search-result-preview');
          resultPreviews.appendChild(resultPreview);

          if (position.ellipsesBefore) {
            resultPreview.appendChild(document.createTextNode('... '));
          }
          addHighlightedText(resultPreview, content, position.previewStart, position.previewEnd, position.highlight);
          if (position.ellipsesAfter) {
            resultPreview.appendChild(document.createTextNode(' ...'));
          }
        }
      }
      var resultRelUrl = document.createElement('span');
      resultRelUrl.classList.add('search-result-rel-url');
      resultRelUrl.innerText = doc.relUrl;
      resultTitle.appendChild(resultRelUrl);
    }

    function addHighlightedText(parent, text, start, end, positions) {
      var index = start;
      for (var i in positions) {
        var position = positions[i];
        var span = document.createElement('span');
        if (position[0] < index) continue;
        span.textContent = text.substring(index, position[0]);
        parent.appendChild(span);
        index = position[0] + position[1];
        var highlight = document.createElement('span');
        highlight.classList.add('search-result-highlight');
        highlight.textContent = text.substring(position[0], index);
        parent.appendChild(highlight);
      }
      var span = document.createElement('span');
      span.textContent = text.substring(index, end);
      parent.appendChild(span);
    }
  }

  window.tfcHighlightSearch = function() {
    var main = document.querySelector('#main-content main');
    if (!main) return;
    main.querySelectorAll('mark.tfc-search-hit').forEach(function(mark) {
      var parent = mark.parentNode;
      mark.replaceWith(document.createTextNode(mark.textContent));
      parent.normalize();
    });
    var currentUrl = new URL(window.location.href);
    var input = currentUrl.searchParams.get('q');
    if (!input || !index) return;
    var terms = new Set();
    findResults(input).forEach(function(result) {
      var doc = docs[result.ref];
      var url = new URL(doc.url, window.location.origin);
      if (url.pathname !== currentUrl.pathname || (currentUrl.hash && url.hash !== currentUrl.hash)) return;
      Object.keys(result.matchData.metadata).forEach(function(term) {
        var fields = result.matchData.metadata[term];
        ['title', 'content'].forEach(function(field) {
          if (!fields[field]) return;
          fields[field].position.forEach(function(position) {
            if (position && position[0] >= 0 && position[1] > 0 && position[0] < doc[field].length) {
              var recovered = doc[field].substr(position[0], position[1]).toLowerCase();
              if (recovered && recovered.trim()) {
                terms.add(recovered);
              }
            }
          });

        });
      });
    });
    if (!terms.size) return;

    // Retain text offsets across inline emphasis without changing its markup.
    var nodes = [];
    var text = '';
    var previousBlock = null;
    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        var parent = node.parentElement;
        return parent && !parent.closest('script, style, button, svg, math, .katex, [aria-hidden="true"]') && parent.getClientRects().length
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (walker.nextNode()) {
      var node = walker.currentNode;
      var block = node.parentElement.closest('p, li, td, th, h1, h2, h3, h4, h5, h6, pre, blockquote');
      if (block !== previousBlock) text += '\n';
      previousBlock = block;
      nodes.push({ node: node, start: text.length });
      text += node.textContent;
    }
    var positions = [];
    terms.forEach(function(term) { positions = positions.concat(positionsOf(text, term)); });
    positions.sort(function(a, b) { return a[0] - b[0] || b[1] - a[1]; });
    var lastEnd = -1;
    positions = positions.filter(function(position) {
      if (position[0] < lastEnd) return false;
      lastEnd = position[0] + position[1];
      return true;
    });
    nodes.forEach(function(entry) {
      var content = entry.node.textContent;
      var local = positions.filter(function(position) {
        return position[0] < entry.start + content.length && position[0] + position[1] > entry.start;
      });
      if (!local.length) return;
      var fragment = document.createDocumentFragment();
      var offset = 0;
      local.forEach(function(position) {
        var start = Math.max(0, position[0] - entry.start);
        var end = Math.min(content.length, position[0] + position[1] - entry.start);
        fragment.appendChild(document.createTextNode(content.slice(offset, start)));
        var mark = document.createElement('mark');
        mark.className = 'tfc-search-hit';
        mark.textContent = content.slice(start, end);
        fragment.appendChild(mark);
        offset = end;
      });
      fragment.appendChild(document.createTextNode(content.slice(offset)));
      entry.node.replaceWith(fragment);
    });

    var anchorId = currentUrl.hash.slice(1);
    try { anchorId = decodeURIComponent(anchorId); } catch (error) {}
    var anchor = anchorId && document.getElementById(anchorId);
    var nextHeading = anchor && Array.from(main.querySelectorAll('h1, h2')).find(function(heading) {
      return Number(heading.tagName.slice(1)) <= Number(anchor.tagName.slice(1)) &&
        (anchor.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    var first = Array.from(main.querySelectorAll('mark.tfc-search-hit')).find(function(mark) {
      return (!anchor || anchor.contains(mark) || (anchor.compareDocumentPosition(mark) & Node.DOCUMENT_POSITION_FOLLOWING)) &&
        (!nextHeading || (mark.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    if (first) {
      requestAnimationFrame(function() {
        if (!first.isConnected || window.location.href !== currentUrl.href) return;
        first.tabIndex = -1;
        first.focus({ preventScroll: true });
        first.scrollIntoView({ block: 'center', behavior: 'instant' });
      });
    }
  };
  window.addEventListener('hashchange', window.tfcHighlightSearch);

  jtd.addEvent(searchInput, 'focus', function(){
    setTimeout(update, 0);
  });

  jtd.addEvent(searchInput, 'compositionstart', function() { composing = true; });
  jtd.addEvent(searchInput, 'compositionend', function() { composing = false; update(); });

  jtd.addEvent(searchInput, 'input', function(e){
    if (e.isComposing) return;
    update();
  });

  // When the search bar is *not* focused, it should be hidden.
  const updateSearchFocus = function(evt) {
    const nextFocusedElement = evt.relatedTarget;
    if (!nextFocusedElement) {
      setTimeout(function() {
        if (document.activeElement !== searchInput && (!searchResults.contains(document.activeElement))) {
          hideSearch();
        }
      }, 200);
      return;
    }

    // Re-focusing on search bar - "keep focus"
    if (nextFocusedElement.id === 'search-input') return;

    // Re-focusing on the next search result element - "keep focus"
    if (searchResults.contains(nextFocusedElement)) return;

    // Otherwise, we're not focused on the search bar anymore. Hide!
    hideSearch();
  };

  searchInput.addEventListener('focusout', updateSearchFocus);
  searchResults.addEventListener('focusout', updateSearchFocus);

  // Prevent tapping/clicking inside searchResults from prematurely blurring search input on mobile
  searchResults.addEventListener('mousedown', function(e) {
    e.preventDefault();
  });

  jtd.addEvent(searchInput, 'keyup', function(e){
    if (composing || e.isComposing || e.keyCode === 229) return;
    switch (e.keyCode) {
      case 27: // When esc key is pressed, hide the results and clear the field
        searchInput.value = '';
        break;
      case 38: // arrow up
      case 40: // arrow down
      case 13: // enter
        e.preventDefault();
        return;
    }
    update();
  });

  jtd.addEvent(searchInput, 'keydown', function(e){
    if (composing || e.isComposing || e.keyCode === 229) return;
    switch (e.keyCode) {
      case 38: // arrow up
        e.preventDefault();
        var active = document.querySelector('.search-result.active');
        if (active) {
          active.classList.remove('active');
          if (active.parentElement.previousSibling) {
            var previous = active.parentElement.previousSibling.querySelector('.search-result');
            previous.classList.add('active');
          }
        }
        return;
      case 40: // arrow down
        e.preventDefault();
        var active = document.querySelector('.search-result.active');
        if (active) {
          if (active.parentElement.nextSibling) {
            var next = active.parentElement.nextSibling.querySelector('.search-result');
            active.classList.remove('active');
            next.classList.add('active');
          }
        } else {
          var next = document.querySelector('.search-result');
          if (next) {
            next.classList.add('active');
          }
        }
        return;
      case 13: // enter
        e.preventDefault();
        var targetResult = document.querySelector('.search-result.active') || document.querySelector('.search-result');
        if (targetResult) {
          hideSearch();
          searchInput.blur();
          targetResult.click();
        }
        return;
    }
  });

  jtd.addEvent(document, 'click', function(e){
    if (e.target.closest('.search-result')) {
      hideSearch();
      searchInput.blur();
      return;
    }
    if (e.target != searchInput && !searchResults.contains(e.target)) {
      hideSearch();
    }
  });

  loadIndex();
}

// Switch theme

jtd.getTheme = function() {
  var cssFileHref = document.querySelector('[rel="stylesheet"]').getAttribute('href');
  return cssFileHref.substring(cssFileHref.lastIndexOf('-') + 1, cssFileHref.length - 4);
}

jtd.setTheme = function(theme) {
  var cssFile = document.querySelector('[rel="stylesheet"]');
  cssFile.setAttribute('href', jtd.docsUrl('assets/css/just-the-docs-' + theme + '.css'));
}

// Match the same document with or without index.html, .html or a trailing slash.
function normalizeNavPath(path) {
  return new URL(path, window.location.origin).pathname
    .replace(/\/index(\.html)?$/, '').replace(/\.html$/, '').replace(/\/$/, '');
}

// Use the same selected-page and ancestor state on first load and PJAX navigation.
jtd.activateNav = function(targetUrl) {
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

// Document ready

jtd.onReady(function(){
  if (document.getElementById('site-nav')) {
    initNav();
    var activeLink = jtd.activateNav(window.location.href);
    if (activeLink) activeLink.scrollIntoView({ block: 'center' });
  }
  initSearch();
});

// Accessibility: set tabindex=0 on each code highlight block, so screenreaders
// can focus over (particularly important if there's horizontal scroll)
// see: https://dequeuniversity.com/rules/axe/4.9/scrollable-region-focusable?application=axeAPI

jtd.onReady(() => {
  document
    .querySelectorAll("div.highlight")
    .forEach(codeBlock => codeBlock.setAttribute("tabindex", "0"));
});

// Copy button on code

function initCopyButtons(root) {
  var container = root || document;
  var codeBlocks = container.querySelectorAll('div.highlighter-rouge, figure.highlight, pre:not(.highlight)');

  var isZh = jtd.isChinese();

  var copyIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="fill:none!important;stroke:currentColor!important;"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" style="fill:none!important;"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" style="fill:none!important;"></path></svg>';
  var copiedIconSvg = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="fill:none!important;stroke:currentColor!important;"><path d="M20 6 9 17l-5-5" style="fill:none!important;"></path></svg>';

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
    copyButton.setAttribute('aria-label', isZh ? '复制代码到剪贴板' : 'Copy code to clipboard');
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
      var operation = jtd.beginCopy();
      function doFailure() {
        if (!copyButton.isConnected || !operation.isCurrent()) return;
        var status = targetContainer.querySelector('.tfc-code-copy-status');
        if (!status) {
          status = document.createElement('span');
          status.className = 'tfc-code-copy-status';
          status.setAttribute('role', 'status');
          targetContainer.appendChild(status);
        }
        status.textContent = isZh ? '复制失败，请选中代码后手动复制。' : 'Copy failed. Select the code and copy it manually.';
      }
      jtd.writeLatestCopy(operation, code, function() {
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

window.initCopyButtons = initCopyButtons;

jtd.onReady(function() {
  initCopyButtons();
});

})(window.jtd = window.jtd || {});

