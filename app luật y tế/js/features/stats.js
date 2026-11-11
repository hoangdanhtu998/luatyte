/* Thống kê chi tiết cho luatyte.online
 * Hiển thị biểu đồ tiến độ theo ngày, bài học nhiều nhất, tỷ lệ hoàn thành */
(function() {
  var STATS_KEY = 'luatyte-stats';
  var PROG_KEY = 'luatyte-slides-progress';
  var BAI_GIANG_KEY = 'luatyte-baigiang-completed';

  function getProgress() {
    try { return JSON.parse(localStorage.getItem(PROG_KEY) || '{}'); } catch(e) { return {}; }
  }
  function getBaigiangCompleted() {
    try { return JSON.parse(localStorage.getItem(BAI_GIANG_KEY) || '{}'); } catch(e) { return {}; }
  }

  // Ghi nhận hoạt động mỗi ngày
  function recordDay(dateStr) {
    var stats = getStats();
    if (!stats.days) stats.days = {};
    if (!stats.days[dateStr]) stats.days[dateStr] = { views: 0, quizzes: 0, lessons: 0 };
    stats.days[dateStr].views++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  function recordQuiz() {
    var stats = getStats();
    if (!stats.days) stats.days = {};
    var today = new Date().toISOString().slice(0, 10);
    if (!stats.days[today]) stats.days[today] = { views: 0, quizzes: 0, lessons: 0 };
    stats.days[today].quizzes++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }

  function getStats() {
    try { return JSON.parse(localStorage.getItem(STATS_KEY) || '{}'); } catch(e) { return {}; }
  }

  function renderStats() {
    var progress = getProgress();
    var baigiang = getBaigiangCompleted();
    var stats = getStats();
    
    // Tính tổng số bài đã xem từ progress
    var totalLessons = Object.keys(progress).length;
    var totalBaigiang = Object.keys(baigiang).length;
    var totalScore = 0;
    var totalAttempts = 0;
    Object.values(progress).forEach(function(p) {
      totalScore += p.score ? p.score.ok : 0;
      totalAttempts += p.score ? p.score.total : 0;
    });
    
    // Lấy 7 ngày gần nhất
    var days = [];
    var now = new Date();
    for (var i = 6; i >= 0; i--) {
      var d = new Date(now);
      d.setDate(d.getDate() - i);
      var ds = d.toISOString().slice(0, 10);
      var dayData = stats.days ? stats.days[ds] : null;
      days.push({
        date: ds.slice(5), // MM-DD
        views: dayData ? dayData.views : 0,
        quizzes: dayData ? dayData.quizzes : 0
      });
    }
    
    // Tìm bài học được xem nhiều nhất
    var topLessons = Object.entries(progress)
      .sort(function(a, b) { 
        var aUpdated = a[1].updated ? new Date(a[1].updated) : 0;
        var bUpdated = b[1].updated ? new Date(b[1].updated) : 0;
        return bUpdated - aUpdated;
      })
      .slice(0, 5);
    
    // Render HTML
    var container = document.getElementById('stats-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${totalLessons}</div>
          <div class="stat-label">Bài slide đã học</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalBaigiang}</div>
          <div class="stat-label">Bài giảng hoàn thành</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${totalAttempts > 0 ? Math.round(totalScore/totalAttempts*100) : 0}%</div>
          <div class="stat-label">Tỷ lệ đúng trung bình</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${days.filter(function(d){return d.views > 0}).length}/7</div>
          <div class="stat-label">Ngày có hoạt động</div>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>Hoạt động 7 ngày qua</h3>
        <div class="bar-chart">
          ${days.map(function(d) {
            var height = Math.max(10, Math.min(100, (d.views + d.quizzes) * 15));
            return '<div class="bar-col">' +
              '<div class="bar" style="height:' + height + 'px"></div>' +
              '<div class="bar-label">' + d.date + '</div>' +
            '</div>';
          }).join('')}
        </div>
      </div>
      
      ${topLessons.length > 0 ? `
      <div class="top-lessons">
        <h3>Bài học gần đây</h3>
        <ul>
          ${topLessons.map(function(item) {
            var id = item[0];
            var p = item[1];
            var percent = p.score ? Math.round(p.score.ok / p.score.total * 100) : 0;
            return '<li class="lesson-item">' +
              '<span class="lesson-id">#' + id.replace(/_/g, '-') + '</span>' +
              '<span class="lesson-score">' + percent + '% đúng</span>' +
              '<span class="lesson-date">' + (p.updated ? p.updated.slice(5, 10) : '') + '</span>' +
            '</li>';
          }).join('')}
        </ul>
      </div>
      ` : ''}
    `;
  }

  window.LYTStats = { recordDay, recordQuiz, renderStats };
})();
