// Co nội dung slide vừa khung khi quá dài, để không bị cắt mất chân trang hay dòng cuối.
// Chỉ chạy trên slide đang hiện. Thu nhỏ tối đa còn 60% để chữ vẫn đọc được.
(function () {
  var MIN_ZOOM = 0.6;

  function fitSlide(slide) {
    var content = slide.querySelector('.content');
    if (!content) return;
    content.style.zoom = '';
    if (!slide.classList.contains('active')) return;
    var room = content.clientHeight;
    var need = content.scrollHeight;
    if (room > 0 && need > room + 2) {
      content.style.zoom = String(Math.max(MIN_ZOOM, room / need));
    }
  }

  function fitAll() {
    document.querySelectorAll('.slide').forEach(fitSlide);
  }

  document.querySelectorAll('.slide').forEach(function (slide) {
    new MutationObserver(function () { fitSlide(slide); })
      .observe(slide, { attributes: true, attributeFilter: ['class'] });
  });

  window.addEventListener('load', fitAll);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
})();
