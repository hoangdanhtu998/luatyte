/* Tìm kiếm thông minh với fuzzy matching và highlight kết quả */
(function() {
  var MAX_DISTANCE = 2;

  function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (i = 1; i <= b.length; i++) {
      for (j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
      }
    }
    return matrix[b.length][a.length];
  }

  function normalize(str) {
    return str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "");
  }

  function highlight(text, query) {
    if (!query) return text;
    var normText = normalize(text);
    var words = normalize(query).split(/\s+/).filter(function(w){ return w.length > 2; });
    var result = text;
    words.forEach(function(word) {
      var idx = normText.indexOf(word);
      while (idx !== -1) {
        result = result.substring(0, idx) + '<mark>' + result.substring(idx, idx + word.length) + '</mark>' + result.substring(idx + word.length);
        idx = normText.indexOf(word, idx + word.length + 1);
      }
    });
    return result;
  }

  function smartSearch(query, items) {
    if (!query || !items) return [];
    var results = [];
    var normQuery = normalize(query).split(/\s+/);
    items.forEach(function(item) {
      var score = 0;
      var matched = false;
      ['title', 'content'].forEach(function(field) {
        if (item[field]) {
          var fieldNorm = normalize(item[field]);
          normQuery.forEach(function(word) {
            if (fieldNorm.includes(word)) { score += 10; matched = true; }
            if (levenshtein(word, fieldNorm.slice(0, word.length + 5)) <= 2 && word.length > 3) { score += 5; matched = true; }
          });
        }
      });
      if (matched) results.push({ item: item, score: score, highlighted: highlight(item.title, query) });
    });
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 10);
  }

  window.LYTSmartSearch = { highlight, smartSearch };
})();
