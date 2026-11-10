// Người giảng cho slide: đổi lời dẫn, cách xưng hô và cách góp ý.
// Mỗi người giảng có giọng riêng (voice: khóa biến thể trong scripts/make-voice-variants.mjs, lấy từ giọng vais1000 đổi cao độ)
// và hệ số tốc độ (rate). vais = giáo viên gốc; gs = giáo sư trầm; hsg = học sinh giỏi trẻ; nt = người thân ấm; bt = bạn thân tươi.
window.SlidePersona = (function () {
  var KEY = 'luatyte-narrator';
  var DEFAULT = 'giao_vien';
  var P = {
    giao_vien: {
      lead: 'Em chú ý ý này:',
      voice: 'vais', rate: 1,
      label: 'Thầy/Cô giáo',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Rõ ràng, nhẹ nhàng, có gợi ý từng bước.'
    },
    giao_su: {
      lead: 'Chúng ta xét ý này:',
      voice: 'gs', rate: 0.95,
      label: 'Giáo sư',
      intro: 'Chúng ta cùng xem xét vấn đề này một cách có hệ thống.',
      praise: 'Lập luận đúng. Hãy ghi nhớ lý do đằng sau.',
      retry: 'Lập luận chưa chặt chẽ. Hãy kiểm tra lại tiền đề và suy luận.',
      style: 'Trang trọng, chính xác, nhấn mạnh lập luận và khái niệm.'
    },
    hoc_sinh_gioi: {
      lead: 'Ý này mình thấy:',
      voice: 'hsg', rate: 1,
      label: 'Bạn học giỏi',
      intro: 'Mình sẽ đi qua phần này cùng bạn nhé.',
      praise: 'Đúng rồi, bạn làm tốt!',
      retry: 'Gần đúng rồi, thử xem lại chỗ này nhé.',
      style: 'Gần gũi, dễ hiểu, như bạn học cùng lớp đã hiểu bài.'
    },
    nguoi_than: {
      lead: 'Con để ý chỗ này:',
      voice: 'nt', rate: 0.9,
      label: 'Người thân',
      intro: 'Con nghe này, mình học từ từ thôi nhé.',
      praise: 'Giỏi quá, con đúng rồi!',
      retry: 'Chưa đúng đâu con, đọc lại phần giải thích nhé.',
      style: 'Ấm áp, quan tâm, nói chậm và kiên nhẫn.'
    },
    ban_than: {
      lead: 'Ờ, ý này đây:',
      voice: 'bt', rate: 1,
      label: 'Bạn thân',
      intro: 'Vào học thôi, dễ mà.',
      praise: 'Chuẩn luôn!',
      retry: 'Hụt rồi, xem lại chút nhé.',
      style: 'Thân mật, vui vẻ, dùng câu ngắn.'
    },
    vn_xuan_vinh: {
      lead: 'Em chú ý ý này:',
      voice: 'xuan_vinh', rate: 1,
      label: 'Xuân Vĩnh (nam)',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Nam · Azure TTS · Phong cách tự nhiên.'
    },
    vn_doan_trang: {
      lead: 'Em chú ý ý này:',
      voice: 'doan_trang', rate: 1,
      label: 'Đoan Trang (nữ)',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Nữ · Azure TTS · Phong cách tự nhiên.'
    },
    vn_quoc_tuan: {
      lead: 'Em chú ý ý này:',
      voice: 'quoc_tuan', rate: 1,
      label: 'Quốc Tuấn (nam)',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Nam · Azure TTS · Phong cách tự nhiên.'
    },
    vn_thanh_binh: {
      lead: 'Em chú ý ý này:',
      voice: 'thanh_binh', rate: 1,
      label: 'Thanh Bình (nam)',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Nam · Azure TTS · Phong cách kể chuyện.'
    }
  };
  var current = DEFAULT;
  try { var saved = localStorage.getItem(KEY); if (saved && P[saved]) current = saved; } catch (e) {}

  return {
    list: function () { return Object.keys(P).map(function (k) { return { id: k, label: P[k].label, style: P[k].style }; }); },
    get: function () { return current; },
    set: function (id) {
      if (!P[id]) return;
      current = id;
      try { localStorage.setItem(KEY, id); } catch (e) {}
    },
    line: function (name) { return P[current][name]; },
    voice: function () { return P[current].voice; },
    rate: function () { return P[current].rate; },
    intro: function () { return P[current].intro; },
    lead: function () { return P[current].lead; },
    // Khóa file câu mở đầu đã tạo sẵn (audio/persona/<khóa>.mp3)
    opener: function () { return current; },
    label: function () { return P[current].label; }
  };
})();
