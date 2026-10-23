/* Bilingual documentation search and article match highlighting. */
(function(app) {
  'use strict';

  function initSearch() {
    var index = null;
    var docs = null;
    var loading = false;
    var composing = false;
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');
    var mainHeader = document.getElementById('main-header');
    if (!searchInput || !searchResults) return;
    var currentInput;
    var currentLanguage;
    var currentSearchIndex = 0;

    function loadIndex() {
      if (loading) return;
      loading = true;
      searchInput.setAttribute('aria-busy', 'true');
      update();
      var request = new XMLHttpRequest();
      var searchDataUrl = app.docsUrl('assets/js/search-data.json');
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
        app.highlightSearch();
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
      var isZh = app.isChinese();
      var messages = app.messages();
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
          ? messages.search_loading
          : messages.search_error;
        if (!loading) {
          var retry = document.createElement('button');
          retry.type = 'button';
          retry.className = 'btn';
          retry.textContent = messages.retry;
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
        noResultsDiv.innerText = messages.search_no_results;
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
          altNotice.innerText = messages.search_other_language.replace('{count}', otherLangResults.length);
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

    app.highlightSearch = function() {
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
    window.addEventListener('hashchange', app.highlightSearch);
    app.onPageLoad(app.highlightSearch);

    searchInput.addEventListener('focus', function(){
      setTimeout(update, 0);
    });

    searchInput.addEventListener('compositionstart', function() { composing = true; });
    searchInput.addEventListener('compositionend', function() { composing = false; update(); });

    searchInput.addEventListener('input', function(e){
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

    searchInput.addEventListener('keyup', function(e){
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

    searchInput.addEventListener('keydown', function(e){
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

    document.addEventListener('click', function(e){
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


  app.ready(initSearch);

})(window.tfcDocs);
