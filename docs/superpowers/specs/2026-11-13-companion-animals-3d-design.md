# Design: Bộ nhân vật động vật đồng hành 3D cho trợ lý (luatyte)

- Ngày: 13/11/2026
- Trạng thái: chờ duyệt
- Hướng đã chọn: **A — Blender thật → mô hình 3D GLB** (người dùng chọn ngày 13/11/2026)

## 1. Intent / Vì sao

Trợ lý trong panel "Hỏi trợ lý" (`index.html` → `js/avatar.js`) hiện là một bác sĩ vẽ SVG 2D với 8 trạng thái (idle, thinking, talking, wave, happy, shrug, cheer, sad). Chủ dự muốn một **bộ khoảng 10–20 nhân vật động vật đồng hành** làm avatar cho trợ lý, tạo bằng **Blender** (cài thật, dựng mô hình thật, xuất file 3D), đưa vào code thay cho bác sĩ SVG.

## 2. Goals

1. Cài Blender trên máy dev qua winget, dựng mô hình bằng script Python chạy headless (`blender -b -P`), không dựng tay.
2. Sinh **16 con vật** low-poly (thuộc khoảng 10–20 yêu cầu) + 1 file manifest.
3. Chạy 3D trong panel trợ lý với **cùng contract** như avatar cũ: `mount(container) → {play(state, sec), resume(), pause()}` để `index.html` gần như không đổi.
4. Chọn được nhân vật (16 con + bác sĩ SVG), lưu lựa chọn.
5. Giữ nguyên triết lý project: offline-first, không CDN, fallback sang bác sĩ SVG nếu WebGL/three.js lỗi.

## 3. Non-goals / Anti-goals

- Không rig xương, không bake keyframe animation cho từng con (states làm bằng transform procedural bằng JS).
- Không physics, không AR, không cho phép xoay tay bằng orbit controls.
- Không tạo ảnh AI; không đụng `bai-giang.html`, `clinic.html`, `moi-truong-pixel.html`.
- Không thêm backend/API mới; không đổi schema dữ liệu.
- Không đụng `js/clinic3d.js` (fallback 2D phòng khám, việc riêng).

## 4. Constraints

- **Offline-first, không CDN:** ba file runtime phải nằm trong repo, service worker tự cache khi fetch (handler hiện tại cache mọi GET same-origin thành công).
- **Không add file nặng vào CORE của `sw.js`** (addAll fail = fail install): chỉ add file nhỏ (`js/avatar3d.js`, `data/companions.json`); `three.module.min.js` + `*.glb` + thumbnail cache-on-first-use.
- **Không sửa file tay ngoài danh sách được phép:** chỉ `index.html` (phần `loadAvatar` + picker), `sw.js` (bump version + CORE), và các file mới. Mirror `app luật y tế/` áp dụng y hệt sau khi bản gốc chạy ngon.
- **Test hiện hữu:** `node scripts/check-local.mjs` phải xanh sau thay đổi.
- **Quyền dữ liệu/localStorage:** dùng key mới `lyt_companion`, không đổi key cũ.

## 5. Approaches (đã cân nhắc)

| | Cách | Tradeoff |
|---|---|---|
| **A ✅ (chọn)** | Blender headless → GLB + three.js vendor local | Đúng yêu cầu "Blender thật"; thêm ~700KB three.js + loader; phải có importmap; mobile yếu hơn 2D |
| B | Blender render PNG/sprite | Vẫn cần Blender nhưng ảnh tĩnh, không "3D" như kỳ vọng |
| C | 2D SVG kiểu avatar.js, không Blender | Nhẹ nhất, hợp kiến trúc nhất, nhưng không phải Blender/3D |

## 6. Quyết định đã chốt (parts)

### 6.1 Cài đặt & công cụ
- Cài: `winget install BlenderFoundation.Blender` (5.3.0). Nếu script lỗi API thì hạ LTS 4.5.
- Script: `scripts/blender/make_companions.py` — builder parametric chung (tỉ lệ cơ thể, tai, mõm, đuôi, màu) cho 16 con; flat-shaded low-poly ~500–1.500 tris/con; **không texture** (chỉ material/vertex color) để file nhỏ.
- Xuất: `export_scene.gltf` dạng **GLB**, +Y up, apply modifiers.
- Thumbnail picker: render headless engine **Workbench**, 256px, nền trong suốt → `assets/companions/thumbs/<id>.png` (~5–15KB/ảnh).

### 6.2 Danh sách 16 con (mặc định, chỉnh được)
Mèo, Chó, Gấu, Gấu trúc, Thỏ, Cáo, Cú, Vịt, Ếch, Khỉ, Cừu, Heo, Chim cánh cụt, Chuột hamster, Hươu, Rùa.

### 6.3 Runtime (trình duyệt)
- File mới `js/avatar3d.js`: dynamic import ba `./lib/three.module.min.js` và `./lib/GLTFLoader.js` (vendored, bản three mới nhất ổn định lúc triển khai, license MIT).
- `index.html`: thêm 1 tag `<script type="importmap">` tĩnh trong `<head>` map `"three"` → `./js/lib/three.module.min.js` (importmap phải đứng trước mọi module script).
- Render: `WebGLRenderer({alpha:true})`, 1 directional + ambient light, rAF **chỉ chạy khi panel mở** (`resume/pause`), tôn trọng `prefers-reduced-motion`.
- GLB chỉ load khi mở panel / đổi con; manifest `data/companions.json` (id, name, file, thumb).
- Fallback: `avatar3d.mount()` throw → catch → mount lại `avatar.js` (bác sĩ SVG) như hiện tại.

### 6.4 Mapping trạng thái (procedural, không skeletal)
| state | hành vi |
|---|---|
| idle | bob nhẹ + breathing scale (loop) |
| talking | bounce pulse + lắc nhẹ (thay cho mouth open của SVG) |
| thinking | nghiêng đầu 10° + nhìn quanh |
| wave | nhảy 2 nhịp + nghiêng |
| happy/cheer | jump + squash-stretch |
| shrug | nghiêng 2 bên |
| sad | nghiêng đầu + hạ thấp |

Semantics giữ nguyên avatar cũ: state có thời lượng tự về idle (mặc định 2.5s), `talking` chạy đến khi stop.

### 6.5 Picker & tích hợp
- Picker: hàng chip trong drawer trợ lý (tên tiếng Việt + thumb PNG, scroll ngang), option đầu tiên = "Bác sĩ" (SVG cũ, mặc định quen thuộc). Lưu `lyt_companion`.
- `loadAvatar()` đổi import sang `avatar3d.js`, giữ catch fallback.
- `sw.js`: bump `lyt-v37` → `lyt-v38`; CORE += `js/avatar3d.js`, `data/companions.json`.
- Mirror: copy `js/avatar3d.js`, `js/lib/*`, `assets/companions/*`, `data/companions.json`, sửa `index.html` + `sw.js` tương ứng trong `app luật y tế/`.

## 7. Verification (tiêu chí nghiệm thu)

1. `blender -b -P scripts/blender/make_companions.py` exit 0, ra 16 GLB + manifest + 16 thumb; mỗi GLB ≤ 60KB, tổng GLB ≤ 1.2MB.
2. Header file đúng magic `glTF` (kiểm bằng script node/test).
3. `node scripts/check-local.mjs` xanh.
4. Mở index → mở trợ lý → thấy con vật 3D, các state chạy; đổi con được; reload giữ lựa chọn.
5. Mô phỏng lỗi WebGL (block context) → vẫn thấy bác sĩ SVG.
6. Sau khi mở panel 1 lần, tắt mạng → reload → vẫn thấy 3D (cache).

## 8. Để builder tự quyết

- Tham số hình học chi tiết từng con (tỉ lệ, màu) — chỉnh tới khi "dễ thương, nhìn rõ là con gì".
- Phiên bản three.js pin cụ thể lúc triển khai.
- Markup/CSS chính xác của picker, vị trí chính xác trong drawer.

## 9. Rủi ro đã chấp nhận

- ~700KB three.js lần đầu tải (chỉ khi mở panel; đã cân bằng bằng cách không đưa vào CORE).
- State là transform procedural, không phải animation gốc của con vật — chấp nhận được vì contract chỉ cần 8 trạng thái nhận diện được.
