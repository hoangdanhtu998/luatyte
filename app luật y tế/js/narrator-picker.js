// Ô chọn người giảng dùng chung. Mọi <select data-narrator-picker> được điền cùng một danh sách,
// nhóm giọng đề xuất (Azure TTS) nằm trên cùng. Chọn xong lưu bằng SlidePersona.set (localStorage),
// nên mọi trang bài học dùng chung lựa chọn. Select có data-narrator-reload sẽ tải lại trang để áp dụng ngay.
(function () {
  var RECOMMENDED = ['vn_xuan_vinh', 'vn_doan_trang', 'vn_quoc_tuan', 'vn_thanh_binh'];
  if (!window.SlidePersona) return;
  var personas = SlidePersona.list();

  function build(sel) {
    var recommended = document.createElement('optgroup');
    recommended.label = 'Đề xuất (Xuân Vĩnh)';
    var others = document.createElement('optgroup');
    others.label = 'Giọng khác';
    RECOMMENDED.forEach(function (id) {
      personas.forEach(function (p) {
        if (p.id === id) recommended.appendChild(new Option(p.label, p.id));
      });
    });
    personas.forEach(function (p) {
      if (RECOMMENDED.indexOf(p.id) < 0) others.appendChild(new Option(p.label, p.id));
    });
    sel.appendChild(recommended);
    sel.appendChild(others);
    sel.value = SlidePersona.get();
    sel.addEventListener('change', function () {
      SlidePersona.set(sel.value);
      if (sel.hasAttribute('data-narrator-reload')) location.reload();
    });
  }

  window.NarratorPicker = { fill: build };
  document.querySelectorAll('select[data-narrator-picker]').forEach(build);
})();
