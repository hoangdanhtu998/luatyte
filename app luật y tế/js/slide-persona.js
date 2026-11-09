// Người giảng cho slide: đổi lời dẫn, cách xưng hô và cách góp ý.
// Mỗi người giảng có giọng AI riêng (voice: khóa giọng trong scripts/make-slide-audio.mjs) và hệ số tốc độ (rate).
// Có 3 giọng nên hai người giảng có thể dùng chung một giọng; khi đó khác nhau ở tốc độ.
window.SlidePersona = (function () {
  var KEY = 'luatyte-narrator';
  var DEFAULT = 'giao_vien';
  var P = {
    giao_vien: {
      voice: 'vais', rate: 1,
      label: 'Giáo viên',
      intro: 'Hôm nay chúng ta cùng học từng ý một nhé.',
      praise: 'Đúng rồi, làm tốt lắm.',
      retry: 'Chưa đúng. Em xem lại phần giải thích bên dưới nhé.',
      style: 'Rõ ràng, nhẹ nhàng, có gợi ý từng bước.'
    },
    giao_su: {
      voice: 'vais', rate: 0.9,
      label: 'Giáo sư',
      intro: 'Ta hãy xem xét vấn đề này một cách có hệ thống.',
      praise: 'Lập luận đúng. Hãy ghi nhớ lý do đằng sau.',
      retry: 'Lập luận chưa chặt chẽ. Hãy kiểm tra lại tiền đề và suy luận.',
      style: 'Trang trọng, chính xác, nhấn mạnh lập luận và khái niệm.'
    },
    hoc_sinh_gioi: {
      voice: 'vivos', rate: 1,
      label: 'Học sinh giỏi',
      intro: 'Mình sẽ đi qua phần này cùng bạn nhé.',
      praise: 'Đúng rồi, bạn làm tốt!',
      retry: 'Gần đúng rồi, thử xem lại chỗ này nhé.',
      style: 'Gần gũi, dễ hiểu, như bạn học cùng lớp đã hiểu bài.'
    },
    nguoi_than: {
      voice: 'hours', rate: 0.9,
      label: 'Người thân',
      intro: 'Con nghe này, mình học từ từ thôi nhé.',
      praise: 'Giỏi quá, con đúng rồi!',
      retry: 'Chưa đúng đâu con, đọc lại phần giải thích nhé.',
      style: 'Ấm áp, quan tâm, nói chậm và kiên nhẫn.'
    },
    ban_than: {
      voice: 'vivos', rate: 1.05,
      label: 'Bạn thân',
      intro: 'Vào học nè, dễ mà.',
      praise: 'Chuẩn luôn!',
      retry: 'Hụt rồi, coi lại chút nha.',
      style: 'Thân mật, vui vẻ, dùng câu ngắn.'
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
    label: function () { return P[current].label; }
  };
})();
