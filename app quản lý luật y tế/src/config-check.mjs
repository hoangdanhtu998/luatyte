// Kiểm tra cấu hình khi khởi động. Hàm thuần: nhận biến môi trường, trả về lỗi và cảnh báo.
// Lỗi (errors) làm máy chủ dừng. Cảnh báo (warnings) chỉ in ra log.
// Không bao giờ in giá trị bí mật vào thông báo.

export function checkConfig(env = {}) {
  const errors = [];
  const warnings = [];
  const prod = env.NODE_ENV === 'production';

  const key = env.SETTINGS_KEY || '';
  if (key && !/^[0-9a-fA-F]{64}$/.test(key)) {
    errors.push('SETTINGS_KEY phải là 64 ký tự hex (32 byte).');
  }
  if (!key) {
    (prod ? errors : warnings).push('Chưa có SETTINGS_KEY: không lưu được mật khẩu SMTP. Ở production đây là lỗi.');
  }

  const pay = env.PAYMENT_SECRET || '';
  if (pay && pay.length < 16) {
    errors.push('PAYMENT_SECRET phải có ít nhất 16 ký tự.');
  }

  if (prod && env.ALLOW_REGISTRATION !== 'false') {
    warnings.push('ALLOW_REGISTRATION đang bật ở production. Nên đặt ALLOW_REGISTRATION=false nếu chỉ admin tạo tài khoản.');
  }
  if (prod && !env.TRUST_PROXY) {
    warnings.push('TRUST_PROXY chưa đặt. Nếu chạy sau reverse proxy, đặt TRUST_PROXY=true để giới hạn đăng nhập theo IP đúng.');
  }

  return { errors, warnings };
}
