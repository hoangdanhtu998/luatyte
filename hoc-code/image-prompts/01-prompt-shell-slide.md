---
HỎI ĐỘ: Tạo slide lesson Shell (Cấp 1) cho hệ thống Học code
MỤC TIÊU: Tạo 8 slide HTML theo theme gx con trỏ và bộ nhớ (--cream: #f7f4ee, --paper: #ffffff, --navy: #1f3a5f, --teal: #0d9488, --amber: #f59e0b)
BÀI HỌC: Shell - Lệnh cơ bản, path, pipe, biến môi trường, vòng lặp, redirection
TRÒN GIẢI: 8 slideCover cấu trúc: Mục tiêu → Cấu trúc lệnh → Path → Lệnh hữu ích → Pipe → Biến môi trường → Vòng lặp & Điều kiện → Redirection → Tóm tắc
NGÔN NGỮ: Vietnamese content toàn bộ, bao gồm cả code comment và caption
FORMAT MỤC ĐIÊN: JSON object duy nhất, không có mảng, không có property nào ngoài version và ops (theo chuẩn Cindy component). Ví dụ:
{
  "version":1,
  "seq":1,
  "op":"create",
  "id":"cover",
  "kind":"section",
  "props":{
    "markdown":"# Shell\nBadge: Cấp 1 · Bài 3 · 45 phút\nLead: Hiểu shell hoạt động, lệnh cơ bản, path, pipe, biến môi trường và tự động hóa nhiệm vụ"
  }
},
{
  "version":1,
  "seq":2,
  "op":"create",
  "id":"cau-truc-lenh",
  "kind":"section",
  "props":{
    "markdown":"## Cấu trúc lệnh\ncommand [option] [argument]...\n\nVí dụ:\n- `ls` - liệt kê file\n- `ls -l` - chi tiết\n- `cd Documents` - thay đổi thư mục\n- `pwd` - đường dẫn hiện tại"
  }
},
{
  "version":1,
  "seq":3,
  "op":"create",
  "id":"path",
  "kind":"section",
  "props":{
    "markdown":"## Path (Đường dẫn)\n\n**Absolute (tuyệt đối):** bắt đầu từ gốc (`/` hoặc `C:\\`)\nVí dụ: `/home/user/Documents` hoặc `C:\\Users\\Admin`\n\n**Relative (tương đối):** tính từ thư mục hiện tại\nVí dụ: `./file.txt`, `../parent.txt`, `subdir/file.txt`\n\n<callout>Luôn dùng path tuyệt đối trong script để tránh lỗi khi chạy từ thư mục khác.</callout>"
  }
},
{
  "version":1,
  "seq":4,
  "op":"create",
  "id":"lenh-huu-ich",
  "kind":"section",
  "props":{
    "markdown":"## Lệnh hữu ích\n\n**Xem/file/directory:**\n- `ls` - liệt kê\n- `ls -l` - chi tiết (permissions, owner, size, time)\n- `ls -a` - hiện file ẩn\n\n**Tạo/xoá:**\n- `touch file.txt` - tạo file rỗng\n- `mkdir ten_thu_muc` - tạo thư mục\n- `rm file.txt` - xóa file\n- `rm -r ten_thu_muc` - xóa thư mục\n\n**In nội dung:**\n- `cat file.txt` - in nội dung\n- `head -n 10 file.txt` - 10 dòng đầu\n- `tail -n 10 file.txt` - 10 dòng cuối\n\n**Phân quyền:**\n- `chmod +x file.sh` - cho phép thực thi\n- `chmod 755 file.sh` - rwxr-xr-x"
  }
},
{
  "version":1,
  "seq":5,
  "op":"create",
  "id":"pipe",
  "kind":"section",
  "props":{
    "markdown":"## Pipe `\`|'\`\n\nNối kết quả lệnh bên trái làm đầu vào lệnh bên phải.\n\n<code>Ví dụ: đếm file .txt</code>\n`ls *.txt | wc -l`\n\n<code>Ví dụ: process monitoring</code>\n`ps aux | grep chrome`\n\n<code>Ví dụ: tìm và count</code>\n`ls *.txt | sort | uniq -c | sort -rn`\n\n<callout>Kết quả trái làm input cho phải.</callout>"
  }
},
{
  "version":1,
  "seq":6,
  "op":"create",
  "id": "bien-moi-truong",
  "kind":"section",
  "props":{
    "markdown":"## Biến môi trường\n\n<code>echo $HOME</code> → /home/user\n<code>echo $PATH</code> → danh sách thư mục tìm lệnh\n<code>echo $USER</code> → tên người dùng\n<code>echo $SHELL</code> → shell đang dùng\n\n<code>export PATH=$PATH:/c/winlibs/mingw64/bin</code> → thêm gcc vào PATH\n\n<code>name=\"Cindy\"</code> → biến cục bộ\n<code>unset name</code> → xóa biến"
  }
},
{
  "version":1,
  "seq":7,
  "op":"create",
  "id": "vong-lap",
  "kind":"section",
  "props":{
    "markdown":"## Vòng lặp & Điều kiện\n\n<code>for i in 1 2 3; do\n  echo \"Số: $i\"\ndone</code>\n\n<code>for i in {1..5}; do\n  echo \"i = $i\"\ndone</code>\n\n<code>count=1\nwhile [ $count -le 5 ]; do\n  echo \"Count: $count\"\n  count=$((count + 1))\ndone</code>\n\n<code>if [ \"$1\" == \"hello\" ]; then\n  echo \"Chào bạn!\"\nelse\n  echo \"Không phải chào\"\nfi</code>\n\n<code>if [ 5 -gt 3 ]; then\n  echo \"5 lớn hơn 3\"\nfi\n# so sánh: -gt (lớn hơn), -lt (nhỏ hơn), -eq (bằng), -ne (khác)</code>"
  }
},
{
  "version":1,
  "seq":8,
  "op":"create",
  "id": "redirection",
  "kind":"section",
  "props":{
    "markdown":"## Redirection `> >> <`\n\n<code>cmd > file</code> → đè file (truncate)\n<code>cmd >> file</code> → thêm vào file (append)\n<code>cmd < file</code> → đọc input từ file</code>\n\n<code>Ví dụ: ls > file.txt</code>\n<code>Ví dụ: grep \"error\" log.txt > errors.txt</code>\n\n<code>Redirect & combine:</code>\n`find . -name \"*.md\" -type f | head -3`\n\n<code>File input/output:</code>\n`command < file.txt` (đầu vào)<br>`command > file.txt` (đầu ra đè)<br>`command >> file.txt` (thêm vào cuối)"
  }
},
{
  "version":1,
  "seq":9,
  "op":"create",
  "id": "tam-quy",
  "kind":"section",
  "props":{
    "markdown":"## Tóm tắc lệnh quan trọng\n\n<div class=\"grid2\">\n  <div class=\"card\"><h3>ls / cd / pwd</h3><p>Liệt kê, thay đổi, đường dẫn</p></div>\n  <div class=\"card amber\"><h3>touch / mkdir / rm</h3><p>Tạo / tạo / xóa</p></div>\n  <div class=\"card navy\"><h3>cat / head / tail</h3><p>In nội dung / đầu / cuối</p></div>\n  <div class=\"card brick\"><h3>grep / wc / find</h3><p>Tìm / Đếm / Tìm file</p></div>\n</div>\n\n<div class=\"grid2\">\n  <div class=\"card\"><h3>Pipe `|</h3><p>Nối lệnh</p></div>\n  <div class=\"card amber\"><h3>Redirection</h3><p>> >> <</p></div>\n  <div class=\"card navy\"><h3>Variable</h3><p>$HOME $PATH $USER</p></div>\n  <div class=\"card brick\"><h3>Loop & If</h3><p>for/while/if</p></div>\n</div>"
  }
},
NAVIGATION: taps left/right, dots bottom, counter "8/8" top right, home link → lesson.html?id=shell
-->