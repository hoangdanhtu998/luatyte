/* Lộ trình học cá nhân hóa - Gợi ý bài tiếp theo dựa trên tiến độ */
(function() {
  var PROG_KEY = 'luatyte-slides-progress';
  var BAI_GIANG_KEY = 'luatyte-baigiang-completed';

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); } catch(e) { return {}; }
  }
  function getCompleted() {
    try { return JSON.parse(localStorage.getItem(BAI_GIANG_KEY) || '{}'); } catch(e) { return {}; }
  }

  // Tính toán gợi ý bài học tiếp theo
  function getNextLesson(lessons) {
    var progress = getProgress();
    var completed = getCompleted();
    
    // Lọc các bài chưa hoàn thành
    var remaining = lessons.filter(function(l) {
      return !completed[l.id];
    });
    
    if (remaining.length === 0) return null; // Tất cả đã xong
    
    // Sắp xếp theo thời gian sửa đổi gần nhất (ưu tiên bài đang dở)
    remaining.sort(function(a, b) {
      var progA = progress[a.id] || { updated: 0 };
      var progB = progress[b.id] || { updated: 0 };
      return new Date(progB.updated || 0) - new Date(progA.updated || 0);
    });
    
    return remaining[0];
  }

  // Render phần gợi ý lộ trình
  function renderPath(containerId, lessons) {
    var container = document.getElementById(containerId);
    if (!container) return;
    
    var next = getNextLesson(lessons);
    if (!next) {
      container.innerHTML = '<div class="path-complete"><h3>🎉 Chúc mừng!</h3><p>Bạn đã hoàn thành tất cả bài học!</p></div>';
      return;
    }
    
    var progress = getProgress();
    var p = progress[next.id] || {};
    var percent = p.score ? Math.round(p.score.ok / Math.max(1, p.score.total) * 100) : 0;
    
    container.innerHTML = `
      <div class="path-card">
        <div class="path-header">
          <span class="path-label">Bài tiếp theo</span>
          ${percent > 0 ? '<span class="path-progress">' + percent + '%</span>' : ''}
        </div>
        <a href="${next.href || '#'}" class="path-title">${next.title}</a>
        <p class="path-desc">${next.description || 'Tiếp tục học để nắm vững kiến thức.'}</p>
        ${percent > 0 ? '<button class="btn" onclick="window.location.href=\'' + (next.href || '#') + '\'">Tiếp tục học</button>' : ''}
      </div>
    `;
  }

  window.LYTPath = { getNextLesson, renderPath };
})();
