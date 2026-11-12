// File kiểm thử tự động mẫu cho app tập "Phòng khám Sao Mai" (bài Thực chiến 7).
//
// Cách chạy (cần Node.js 18 trở lên):
//   1. Chép thư mục tests này ra một thư mục trống trên máy bạn, mở terminal tại đó.
//   2. npm init -y
//   3. npm install -D @playwright/test
//   4. npx playwright install chromium
//   5. npx playwright test
//
// Mặc định file kiểm bản 1.0 trên trang đang chạy thật. Đổi bằng biến môi trường:
//   LAB_BUILD=1.1 npx playwright test                 (kiểm bản 1.1)
//   LAB_URL=http://localhost:8080/lab/ npx playwright test   (kiểm bản chạy trên máy bạn)
//
// Trên bản 1.0 nhiều ca KHÔNG ĐẠT. Đó là kết quả đúng: các ca đang bắt lỗi cài sẵn.
const { test, expect } = require('@playwright/test');

const BASE = process.env.LAB_URL || 'https://luatyte.online/hoc-test/lab/';
const BUILD = process.env.LAB_BUILD === '1.1' ? '1.1' : '1.0';

// Cố định "hôm nay" của app để ca về ngày chạy lại được vào bất kỳ hôm nào.
// 11/11/2026 là thứ Tư. Hôm nay + 30 là 11/12/2026, thứ Sáu.
const TODAY = '2026-11-11';
function day(offset) {
  const d = new Date(2026, 10, 11 + offset);
  const p = n => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
const SATURDAY = day(3);  // 14/11/2026
const SUNDAY = day(4);    // 15/11/2026

// Thân yêu cầu hợp lệ; mỗi ca chỉ ghi đè trường nó quan tâm.
function lich(over) {
  return Object.assign({
    name: 'Nguyễn Thị Hoa', phone: '0912345678', age: 30, guardian: '',
    doctor: 'mai', service: 'thuong', bhyt: false, date: day(2), time: '10:00',
  }, over);
}
function api(page, method, path, body) {
  return page.evaluate(([m, p, b]) => window.Lab.api(m, p, b), [method, path, body || null]);
}
const CREATED = [200, 201]; // mã 201 có ca riêng; các ca khác chỉ cần biết lịch đã được tạo

// Mỗi ca bắt đầu từ cùng một trạng thái: ngày cố định, dữ liệu mẫu.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(d => { window.localStorage.setItem('lab-saomai-clock', d); }, TODAY);
  await page.goto(BASE + 'index.html?build=' + BUILD);
  await page.evaluate(() => { window.Lab.reset(); });
  await page.reload();
});

test.describe('Tầng API: quy tắc nghiệp vụ', () => {
  test('R7: người đúng 60 tuổi được giảm 20%', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ age: 60 }));
    expect(r.body.fee).toBe(120000);
  });

  test('R7: trẻ 5 tuổi có BHYT trả 0đ, không âm', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ age: 5, guardian: 'Nguyễn Văn Nam', bhyt: true }));
    expect(r.body.fee).toBe(0);
  });

  test('R3: tuổi 120 được nhận', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ age: 120 }));
    expect(CREATED).toContain(r.status);
  });

  test('R3: tuổi 121 bị từ chối', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ age: 121 }));
    expect(r.status).toBe(400);
  });

  test('R4: Chủ nhật bị từ chối', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ date: SUNDAY }));
    expect(r.status).toBe(400);
  });

  test('R4: Thứ bảy được nhận', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ date: SATURDAY }));
    expect(CREATED).toContain(r.status);
  });

  test('R4: ngày thứ 30 được nhận', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ date: day(30) }));
    expect(CREATED).toContain(r.status);
  });

  test('R6: lịch thứ 4 vào cùng khung giờ trả 409', async ({ page }) => {
    for (let i = 1; i <= 3; i++) {
      const ok = await api(page, 'POST', '/appointments', lich({ phone: '091234560' + i }));
      expect(CREATED).toContain(ok.status);
    }
    const fourth = await api(page, 'POST', '/appointments', lich({ phone: '0912345604' }));
    expect(fourth.status).toBe(409);
  });

  test('R6: hủy một lịch thì khung giờ nhận lại được một lịch', async ({ page }) => {
    const made = [];
    for (let i = 1; i <= 3; i++) made.push(await api(page, 'POST', '/appointments', lich({ phone: '091234560' + i })));
    const first = made[0].body;
    const del = await api(page, 'DELETE', '/appointments/' + first.code + '?phone=' + first.phone);
    expect(del.status).toBe(200);
    const again = await api(page, 'POST', '/appointments', lich({ phone: '0912345609' }));
    expect(CREATED).toContain(again.status);
  });

  test('R10: tra cứu sai số điện thoại trả 404', async ({ page }) => {
    const r = await api(page, 'GET', '/appointments/SM-100001?phone=0999999999');
    expect(r.status).toBe(404);
  });

  test('API: tuổi âm bị từ chối với mã 400', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({ age: -5 }));
    expect(r.status).toBe(400);
  });

  test('API: tạo lịch thành công trả đúng mã 201', async ({ page }) => {
    const r = await api(page, 'POST', '/appointments', lich({}));
    expect(r.status).toBe(201);
  });
});

test.describe('Tầng giao diện: chỉ những gì giao diện mới có', () => {
  async function dienForm(page, phone) {
    await page.fill('#f-name', 'Trần Văn Khoa');
    await page.fill('#f-phone', phone);
    await page.fill('#f-age', '41');
    await page.selectOption('#f-doctor', 'hung');
    await page.fill('#f-date', day(5));
    await page.selectOption('#f-time', '14:00');
  }
  function soLich(page, phone) {
    return page.evaluate(p => window.Lab.load().items.filter(a => a.phone === p).length, phone);
  }

  test('Luồng chính: đặt lịch xong hiện phiếu có mã SM-', async ({ page }) => {
    await dienForm(page, '0987000001');
    await page.click('#book-submit');
    await expect(page.locator('#book-result')).toContainText('Đặt lịch thành công');
    await expect(page.locator('#book-result')).toContainText(/SM-\d{6}/);
    expect(await soLich(page, '0987000001')).toBe(1);
  });

  test('R8: bấm Đặt lịch hai lần nhanh chỉ tạo một lịch', async ({ page }) => {
    await dienForm(page, '0987000002');
    await page.dblclick('#book-submit');
    await expect(page.locator('#book-result')).toContainText('Đặt lịch thành công');
    await page.waitForTimeout(1500); // chờ hết khoảng trễ gửi của lần bấm thứ hai, nếu có
    expect(await soLich(page, '0987000002')).toBe(1);
  });
});
