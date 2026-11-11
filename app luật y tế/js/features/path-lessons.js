/* Lộ trình học - Lưu danh sách bài học để renderPath có thể sử dụng */
(function() {
  window.__lessons = window.__lessons || [];
  
  // Hàm lưu danh sách lessons từ các trang khác
  function saveLessons(lessons) {
    window.__lessons = lessons;
  }
  
  window.LYTPathLessons = { saveLessons };
})();
