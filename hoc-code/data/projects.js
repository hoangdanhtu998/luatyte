// Danh sách dự án C/C++ lấy từ practical-tutorials/project-based-learning (mục C/C++).
// level: 1 = làm quen, 2 = trung bình, 3 = nâng cao. Cách xếp cấp là do mình đề xuất, anh có thể đổi.
// parts: số phần của loạt bài (nếu có). url: bài/trang chính.
const LEVELS = [
  { id: 1, name: 'Cấp 1 · Làm quen', desc: 'Con trỏ, quản lý bộ nhớ, cấu trúc dữ liệu cơ bản. Nên làm trước.' },
  { id: 2, name: 'Cấp 2 · Trung bình', desc: 'Viết chương trình có nhiều module, vòng lặp sự kiện, đồ họa 2D/3D đơn giản.' },
  { id: 3, name: 'Cấp 3 · Nâng cao', desc: 'Trình biên dịch, hệ điều hành, mạng, debugger. Cần nền tảng vững.' },
];

const PROJECTS = [
  { id: 'hash-table', level: 1, title: 'Viết hash table bằng C', desc: 'Cài đặt bảng băm: hàm băm, xử lý va chạm, thêm/xóa/tìm.', url: 'https://github.com/jamesroutley/write-a-hash-table' },
  { id: 'allocator', level: 1, title: 'Memory Allocators 101', desc: 'Viết một bộ cấp phát bộ nhớ đơn giản (malloc/free tự làm).', url: 'https://arjunsreedharan.org/post/148675821737/memory-allocators-101-write-a-simple-memory' },
  { id: 'shell', level: 1, title: 'Viết shell bằng C', desc: 'Một shell kiểu Unix: đọc lệnh, tách tham số, fork/exec, pipe.', url: 'https://brennan.io/2015/01/16/write-a-shell-in-c/' },
  { id: 'tetris', level: 1, title: 'Tetris bằng C++', desc: 'Game Tetris không phụ thuộc nền tảng, tập trung vào logic game.', url: 'http://javilop.com/gamedev/tetris-tutorial-in-c-platform-independent-focused-in-game-logic-for-beginners/' },

  { id: 'text-editor', level: 2, title: 'Tự viết text editor trong terminal', desc: 'Editor nhỏ chạy trong terminal (kilo): mở file, sửa, cuộn, tìm kiếm.', url: 'http://viewsourcecode.org/snaptoken/kilo/' },
  { id: 'lisp', level: 2, title: 'Build Your Own Lisp', desc: 'Viết interpreter cho một ngôn ngữ kiểu Lisp.', url: 'http://www.buildyourownlisp.com/' },
  { id: 'chip8', level: 2, title: 'Emulator CHIP-8', desc: 'Giả lập máy ảo CHIP-8: CPU, bộ nhớ, màn hình, bàn phím.', url: 'https://austinmorlan.com/posts/chip8_emulator/' },
  { id: 'sdl-game', level: 2, title: 'Lập trình game C++ với SDL', desc: 'Nhập môn game: cửa sổ, vẽ ảnh, sự kiện, vòng lặp game.', url: 'http://lazyfoo.net/tutorials/SDL/' },
  { id: 'kv-store', level: 2, title: 'Key-Value Store từ đầu', desc: 'Xây kho lưu trữ khóa-giá trị: bộ nhớ, lưu xuống đĩa.', url: 'http://codecapsule.com/2012/11/07/ikvs-implementing-a-key-value-store-table-of-contents/' },
  { id: 'tiny-renderer', level: 2, title: 'Tiny Renderer (đồ họa 3D phần mềm)', desc: 'Vẽ 3D bằng phần mềm trong khoảng 500 dòng.', url: 'https://github.com/ssloy/tinyrenderer/wiki' },
  { id: 'tiny-raytracer', level: 2, title: 'Tiny RayTracer', desc: 'Ray tracer khoảng 256 dòng.', url: 'https://github.com/ssloy/tinyraytracer/wiki' },
  { id: 'tiny-kaboom', level: 2, title: 'KABOOM! (tiny graphics)', desc: 'Dự án đồ họa nhỏ khoảng 180 dòng.', url: 'https://github.com/ssloy/tinykaboom/wiki' },
  { id: 'tiny-raycaster', level: 2, title: 'Tiny Raycaster', desc: 'FPS kiểu cũ khoảng 486 dòng.', url: 'https://github.com/ssloy/tinyraycaster/wiki' },
  { id: 'simple-db', level: 2, title: "Let's Build a Simple Database", desc: 'Cơ sở dữ liệu đơn giản: bảng, lưu trữ, truy vấn.', url: 'https://cstack.github.io/db_tutorial/' },
  { id: 'space-invaders', level: 2, title: 'Space Invaders from Scratch', desc: 'Làm game Space Invaders từ đầu.', url: 'http://nicktasios.nl/posts/space-invaders-from-scratch-part-1.html', parts: 5 },
  { id: 'matmul', level: 2, title: 'Nhân ma trận hiệu năng cao', desc: 'Tối ưu phép nhân ma trận: cache, vòng lặp, đo thời gian.', url: 'https://gist.github.com/nadavrot/5b35d44e8ba3dd718e595e40184d03f0' },
  { id: 'meta-crush', level: 2, title: 'Meta Crush Saga (C++17 lúc biên dịch)', desc: 'Trò chơi chạy ở thời điểm biên dịch bằng template C++17.', url: 'https://jguegant.github.io//jguegant.github.io/blogs/tech/meta-crush-saga.html' },
  { id: 'breakout', level: 2, title: 'Breakout bằng C++ và OpenGL', desc: 'Làm game phá gạch 2D: sprite, va chạm, power-up, âm thanh.', url: 'https://learnopengl.com/In-Practice/2D-Game/Breakout' },
  { id: 'live-reload', level: 2, title: 'Thư viện reload code khi chạy', desc: 'Thư viện C++ nạp lại code trong lúc chương trình đang chạy.', url: 'http://howistart.org/posts/cpp/1/index-hoccode.html' },

  { id: 'interpreter', level: 3, title: 'Build an Interpreter (Crafting Interpreters)', desc: 'Viết interpreter; từ chương 14 trở đi làm bản bằng C.', url: 'http://www.craftinginterpreters.com/' },
  { id: 'fuse', level: 3, title: 'Viết filesystem FUSE', desc: 'Filesystem chạy ở userspace bằng FUSE.', url: 'https://www.cs.nmsu.edu/~pfeiffer/fuse-tutorial/' },
  { id: 'nes', level: 3, title: 'Lập trình game NES bằng C', desc: 'Viết game cho máy NES.', url: 'https://nesdoug.com/' },
  { id: 'os-tuhdo', level: 3, title: 'Viết OS từ đầu (os01)', desc: 'Xây hệ điều hành cơ bản.', url: 'https://github.com/tuhdo/os01' },
  { id: 'os-tutorial', level: 3, title: 'OS tutorial tối thiểu', desc: 'Hướng dẫn xây một OS tối thiểu từng bước.', url: 'https://github.com/cfenollosa/os-tutorial' },
  { id: 'jit', level: 3, title: 'Trình biên dịch JIT x86-64 tối thiểu bằng C++', desc: 'Sinh mã máy lúc chạy cho x86-64.', url: 'https://solarianprogrammer.com/2018/01/10/writing-minimal-x86-64-jit-compiler-cpp/', parts: 2 },
  { id: 'kernel', level: 3, title: "Let's Write a Kernel", desc: 'Viết kernel đơn giản.', url: 'http://arjunsreedharan.org/post/82710718100/kernel-101-lets-write-a-kernel' },
  { id: 'bootloader', level: 3, title: 'Viết bootloader bằng C', desc: 'Chương trình khởi động máy trước hệ điều hành.', url: 'http://3zanders.co.uk/2017/10/13/writing-a-bootloader/' },
  { id: 'container', level: 3, title: 'Linux container trong 500 dòng', desc: 'Container Linux tối thiểu: namespace, cgroup.', url: 'https://blog.lizzie.io/linux-containers-in-500-loc.html' },
  { id: 'lc3-vm', level: 3, title: 'Máy ảo LC-3', desc: 'Viết máy ảo LC-3 và tập lệnh của nó.', url: 'https://justinmeiners.github.io/lc3-vm/' },
  { id: 'kvm', level: 3, title: 'Học KVM bằng cách tự cài đặt', desc: 'Ghi chú và thực hành về KVM.', url: 'https://david942j.blogspot.com/2018/10/note-learning-kvm-implement-your-own.html' },
  { id: 'redis', level: 3, title: 'Tự viết Redis bằng C/C++', desc: 'Máy chủ kiểu Redis: giao thức, cấu trúc dữ liệu, mạng.', url: 'https://build-your-own.org/redis/' },
  { id: 'compiler-norasandler', level: 3, title: 'Viết trình biên dịch C (10 phần)', desc: 'Từ lexer đến sinh mã, biến, hàm, điều khiển luồng.', url: 'https://norasandler.com/2017/11/29/Write-a-Compiler.html', parts: 10 },
  { id: 'llvm', level: 3, title: 'Ngôn ngữ với LLVM (Kaleidoscope)', desc: 'Làm ngôn ngữ dùng LLVM làm backend.', url: 'https://llvm.org/docs/tutorial/#kaleidoscope-implementing-a-language-with-llvm' },
  { id: 'debugger', level: 3, title: 'Viết debugger Linux (10 phần)', desc: 'Breakpoint, thanh ghi, ELF/DWARF, stack unwinding.', url: 'https://blog.tartanllama.xyz/writing-a-linux-debugger-setup/', parts: 10 },
  { id: 'compiler-briancallahan', level: 3, title: "Let's write a compiler (8 phần)", desc: 'Lexer, parser, sinh mã, mảng và chuỗi.', url: 'https://briancallahan.net/blog/20210814.html', parts: 8 },
  { id: 'tcp-ip', level: 3, title: "Let's Code a TCP/IP Stack (5 phần)", desc: 'Ethernet/ARP, IPv4/ICMP, bắt tay TCP, socket, truyền lại.', url: 'http://www.saminiir.com/lets-code-tcp-ip-stack-1-ethernet-arp/', parts: 5 },
  { id: 'concurrent-servers', level: 3, title: 'Viết server đồng thời (6 phần)', desc: 'So sánh thread, event-driven, libuv, mô hình async.', url: 'https://eli.thegreenplace.net/2017/concurrent-servers-part-1-introduction/', parts: 6 },
  { id: 'mqtt', level: 3, title: 'MQTT broker từ đầu (7 phần)', desc: 'Giao thức MQTT, mạng, topic, đa luồng.', url: 'https://codepr.github.io/posts/sol-mqtt-broker', parts: 7 },
  { id: 'networking-scratch', level: 3, title: 'Networking from Scratch', desc: 'Tự xây các thành phần mạng.', url: 'https://github.com/TanayK07/networking-from-scratch' },
  { id: 'handmade-hero', level: 3, title: 'Handmade Hero', desc: 'Loạt bài dài xây dựng game từ đầu.', url: 'https://handmadehero.org' },
  { id: 'minecraft', level: 3, title: 'Minecraft bằng C++/OpenGL (video)', desc: 'Loạt video làm game kiểu Minecraft.', url: 'https://www.youtube.com/playlist?list=PLMZ_9w2XRxiZq1vfw1lrpCMRDufe2MKV_' },
];
