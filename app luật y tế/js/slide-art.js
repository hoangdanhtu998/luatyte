// Minh họa SVG cho slide. Màu lấy từ biến giao diện (CSS lớp .a-*), nên đổi giao diện vẫn khớp.
window.SlideArt = (function () {
  var W = 'viewBox="0 0 240 120" role="img" aria-label="Minh họa bài học"';
  var art = {
    // Sách mở và ngọn đèn: nghiên cứu, suy nghĩ
    lamp: '<svg ' + W + '><rect class="a-soft" x="30" y="70" width="180" height="10" rx="3"/><path class="a-line" d="M52 70 Q120 52 120 62 Q120 52 188 70 L188 84 Q120 68 120 78 Q120 68 52 84Z"/><path class="a-line" d="M120 62 L120 78" stroke-width="1.5"/><circle class="a-accent" cx="176" cy="34" r="12"/><path class="a-accent" d="M170 46 L182 46 L180 60 L172 60Z"/><circle class="a-glow" cx="176" cy="34" r="22" opacity=".25"/><text class="a-ink" x="120" y="110" text-anchor="middle" font-size="11">Đặt câu hỏi, lập luận</text></svg>',
    // Cân công lý: đạo đức, nghề y
    scales: '<svg ' + W + '><line class="a-ink" x1="120" y1="20" x2="120" y2="84" stroke-width="3"/><line class="a-ink" x1="70" y1="36" x2="170" y2="36" stroke-width="3"/><path class="a-line" d="M70 36 L52 66 M70 36 L88 66 M170 36 L152 66 M170 36 L188 66" stroke-width="2"/><path class="a-accent" d="M46 66 L94 66 Q70 84 46 66Z"/><path class="a-accent" d="M146 66 L194 66 Q170 84 146 66Z"/><rect class="a-ink" x="100" y="84" width="40" height="8" rx="3"/><text class="a-ink" x="120" y="112" text-anchor="middle" font-size="11">Cân nhắc các giá trị</text></svg>',
    // La bàn: giá trị, lựa chọn
    compass: '<svg ' + W + '><circle class="a-line" cx="120" cy="60" r="42" fill="none" stroke-width="3"/><path class="a-accent" d="M120 26 L130 60 L120 94 L110 60Z"/><path class="a-ink" d="M120 60 L144 52 L120 60Z" stroke-width="2"/><circle class="a-ink" cx="120" cy="60" r="3"/><text class="a-ink" x="120" y="22" text-anchor="middle" font-size="11">N</text><text class="a-ink" x="120" y="112" text-anchor="middle" font-size="11">Điều gì quan trọng với tôi?</text></svg>',
    // Bản đồ: thế giới quan
    map: '<svg ' + W + '><path class="a-soft" d="M30 30 L90 20 L150 34 L210 22 L210 96 L150 104 L90 92 L30 102Z"/><path class="a-line" d="M90 20 L90 92 M150 34 L150 104" stroke-width="1.5" fill="none"/><path class="a-accent" d="M60 70 Q96 40 130 62 T190 56" fill="none" stroke-width="3" stroke-dasharray="5 4"/><circle class="a-ink" cx="60" cy="70" r="4"/><circle class="a-accent" cx="190" cy="56" r="5"/><text class="a-ink" x="120" y="115" text-anchor="middle" font-size="11">Bản đồ trong đầu bạn</text></svg>',
    // Hai góc nhìn một ngọn núi
    mountain: '<svg ' + W + '><path class="a-soft" d="M20 100 L90 36 L130 74 L160 46 L220 100Z"/><path class="a-line" d="M90 36 L100 52" stroke-width="2"/><circle class="a-accent" cx="40" cy="30" r="8"/><circle class="a-accent" cx="200" cy="30" r="8"/><path class="a-line" d="M40 38 L40 48 M200 38 L200 48" stroke-width="2"/><text class="a-ink" x="120" y="115" text-anchor="middle" font-size="11">Cùng một việc, hai góc nhìn</text></svg>',
    // Hai bong bóng lời nói: lắng nghe, tranh luận
    bubbles: '<svg ' + W + '><rect class="a-soft" x="22" y="26" width="92" height="46" rx="10"/><path class="a-soft" d="M44 72 L56 72 L40 86Z"/><rect class="a-accent" x="126" y="44" width="92" height="46" rx="10"/><path class="a-accent" d="M190 90 L178 90 L194 104Z"/><circle class="a-ink" cx="50" cy="49" r="3"/><circle class="a-ink" cx="68" cy="49" r="3"/><circle class="a-ink" cx="86" cy="49" r="3"/><text class="a-ink" x="120" y="115" text-anchor="middle" font-size="11">Lắng nghe rồi mới đáp</text></svg>',
    // Cột đền Hy Lạp: triết học cổ đại
    columns: '<svg ' + W + '><path class="a-soft" d="M30 26 L120 10 L210 26Z"/><rect class="a-soft" x="30" y="30" width="180" height="8"/><rect class="a-line" x="46" y="42" width="16" height="50"/><rect class="a-line" x="88" y="42" width="16" height="50"/><rect class="a-line" x="130" y="42" width="16" height="50"/><rect class="a-line" x="172" y="42" width="16" height="50"/><rect class="a-soft" x="28" y="94" width="184" height="8"/><text class="a-ink" x="120" y="116" text-anchor="middle" font-size="11">Thời cổ đại</text></svg>',
    // Dấu hỏi và vòng tròn: câu hỏi nền tảng, hiện đại
    question: '<svg ' + W + '><circle class="a-soft" cx="120" cy="60" r="44"/><path class="a-accent" d="M104 46 Q104 30 120 30 Q138 30 138 46 Q138 58 120 64 L120 76" fill="none" stroke-width="7" stroke-linecap="round"/><circle class="a-accent" cx="120" cy="90" r="4.5"/><circle class="a-line" cx="46" cy="36" r="6"/><circle class="a-line" cx="200" cy="90" r="5"/><text class="a-ink" x="120" y="116" text-anchor="middle" font-size="11">Câu hỏi nền tảng</text></svg>',
    // Cây với nhiều nhánh: các trường phái, các ngành
    tree: '<svg ' + W + '><line class="a-ink" x1="120" y1="104" x2="120" y2="60" stroke-width="3"/><path class="a-line" d="M120 62 L80 30 M120 62 L160 30 M120 78 L92 56 M120 78 L150 56" stroke-width="3" fill="none"/><circle class="a-accent" cx="80" cy="26" r="9"/><circle class="a-accent" cx="160" cy="26" r="9"/><circle class="a-accent" cx="92" cy="52" r="7"/><circle class="a-accent" cx="150" cy="52" r="7"/><text class="a-ink" x="120" y="116" text-anchor="middle" font-size="11">Nhiều trường phái, một gốc</text></svg>',
    // Ngã rẽ: nhân sinh quan
    path: '<svg ' + W + '><path class="a-line" d="M120 110 L120 70 Q120 50 96 40 M120 70 Q120 50 150 40" fill="none" stroke-width="4"/><circle class="a-accent" cx="96" cy="36" r="8"/><circle class="a-accent" cx="150" cy="36" r="8"/><path class="a-ink" d="M116 108 L124 108" stroke-width="3"/><text class="a-ink" x="120" y="22" text-anchor="middle" font-size="11">Sống để làm gì?</text></svg>',
    // Chồng sách: đọc và học tiếp
    books: '<svg ' + W + '><rect class="a-accent" x="50" y="84" width="140" height="14" rx="3"/><rect class="a-soft" x="62" y="68" width="120" height="14" rx="3"/><rect class="a-line" x="56" y="52" width="130" height="14" rx="3"/><rect class="a-ink" x="70" y="36" width="100" height="14" rx="3"/><text class="a-ink" x="120" y="116" text-anchor="middle" font-size="11">Đọc thêm để hiểu sâu</text></svg>',
    // Sách mở: đọc, ôn tập
    book: '<svg ' + W + '><path class="a-soft" d="M120 36 Q90 22 40 30 L40 92 Q90 84 120 98Z"/><path class="a-soft" d="M120 36 Q150 22 200 30 L200 92 Q150 84 120 98Z"/><path class="a-line" d="M120 36 L120 98" stroke-width="2"/><text class="a-ink" x="120" y="116" text-anchor="middle" font-size="11">Đọc chậm, viết lại</text></svg>'
  };

  // Chọn minh họa theo tiêu đề slide
  var rules = [
    [/sách/i, 'books'],
    [/cách đọc|đọc chậm|đọc đối lập|thảo luận|tổng kết|tổng ôn|giới thiệu/i, 'book'],
    [/ngụy|lỗi|phản ví dụ|suy diễn|quy nạp|phương pháp/i, 'lamp'],
    [/đồng ý|bảo mật|lắng nghe|tôn trọng|đúng và sai|bài 6/i, 'bubbles'],
    [/bài 4|hai người|khác nhau|góc nhìn/i, 'mountain'],
    [/bài 7|nhân sinh|sống để làm gì/i, 'path'],
    [/bài 8|ngành|trường phái|các cách trả lời/i, 'tree'],
    [/bài 1|thế giới quan là gì|chủ đề|liên hệ với tam quan/i, 'map'],
    [/bài 2|bài 3|giá trị quan|ba cách|phương đông|tình huống/i, 'compass'],
    [/bài 5|nguyên tắc|nghề y|công lý|cân nhắc/i, 'scales'],
    [/hy lạp|socrates|trung cổ|hồi giáo|thales|cổ đại|plato|aristotle/i, 'columns'],
    [/xx|đương đại|popper|sartre|hiện tượng|hậu hiện đại|thế kỷ xix|marx|hegel/i, 'question'],
    [/phục hưng|cận đại|descartes|hume|kant|locke|spinoza|berkeley/i, 'lamp']
  ];

  return {
    svg: function (key) { return art[key] || ''; },
    forTitle: function (title) {
      for (var i = 0; i < rules.length; i++) if (rules[i][0].test(title || '')) return rules[i][1];
      return 'book';
    }
  };
})();
