/* Serialize clipboard writes shared by code, page and document copying. */
(function(docs) {
  'use strict';

  var copySequence = 0;
  var copyController = null;
  var copyQueue = Promise.resolve();
  docs.beginCopy = function() {
    if (copyController) copyController.abort();
    copyController = window.AbortController ? new AbortController() : null;
    var id = ++copySequence;
    return { signal: copyController ? copyController.signal : undefined,
      isCurrent: function() { return id === copySequence; } };
  };
  docs.writeLatestCopy = function(operation, text, writer) {
    // Serialize writes so an already-started old write cannot finish after the latest.
    copyQueue = copyQueue.catch(function() {}).then(function() {
      if (!operation.isCurrent()) return false;
      if (writer) return writer(text);
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      return navigator.clipboard.writeText(text);
    }).then(function(result) { return result !== false; });
    return copyQueue;
  };

})(window.tfcDocs);
