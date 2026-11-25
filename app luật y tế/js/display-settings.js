/* Presentation preferences only. Legal and application data are never edited. */
(() => {
  'use strict';
  const script = document.currentScript;
  const qa = script.dataset.site === 'qa';
  const key = qa ? 'qa-hub-display-v1' : 'luatyte-display-v1';
  const defaults = {
    name: qa ? 'Software Testing' : 'Sổ tay Luật Y tế',
    subtitle: qa ? 'Không gian kiểm thử của bạn' : document.querySelector('.brand .sub')?.textContent || 'Học và tra cứu luật y tế',
    logo: new URL(qa ? 'qa-mark.svg' : '../icon.svg', script.src).href
  };
  const savedDefaults = { ...defaults };
  const clean = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Tệp tùy chỉnh không hợp lệ.');
    const name = typeof value.name === 'string' ? value.name.trim() : '';
    const subtitle = typeof value.subtitle === 'string' ? value.subtitle.trim() : '';
    if (!name || name.length > 64 || subtitle.length > 160) throw new Error('Tên cần từ 1–64 ký tự; mô tả tối đa 160 ký tự.');
    const logo = value.logo;
    if (logo !== defaults.logo && !(typeof logo === 'string' && logo.length < 500000 && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(logo))) throw new Error('Logo cần là ảnh PNG, JPEG hoặc WebP đã chọn từ máy.');
    return { name, subtitle, logo };
  };
  let current = { ...defaults };
  let readError = '';
  try {
    const raw = localStorage.getItem(key);
    if (raw) current = clean(JSON.parse(raw));
  } catch { readError = 'Không đọc được tùy chỉnh đã lưu. Đang dùng giao diện mặc định.'; }
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const homeBrand = document.querySelector(qa ? '.sidebar .brand' : '.hero .brand');
  let brand = homeBrand;
  if (!brand && !qa) {
    brand = make('a', 'display-brand-link');
    brand.href = 'index.html';
    const img = make('img'); img.width = 36; img.height = 36; img.alt = '';
    brand.append(img, make('span'));
    document.querySelector('.topbar')?.prepend(brand);
  }
  if (!brand) return;
  if (qa) {
    const panel = document.querySelector('.style-panel');
    if (panel) {
      const options = make('details', 'display-style-options');
      options.open = window.matchMedia('(min-width:761px)').matches;
      const summary = make('summary', '', 'Màu sắc và phông chữ');
      panel.replaceWith(options); options.append(summary, panel);
    }
  }
  const brandImage = brand.querySelector('img');
  const brandTitle = brand.querySelector(qa ? 'span' : 'h1') || brand.querySelector('span');
  let brandSubtitle = brand.querySelector('.sub');
  if (qa) {
    const words = make('div', 'display-brand-words');
    brandTitle.replaceWith(words);
    words.append(brandTitle);
    brandSubtitle = make('small'); words.append(brandSubtitle);
  }
  const apply = value => {
    brandTitle.textContent = value.name;
    if (brandSubtitle) brandSubtitle.textContent = value.subtitle;
    if (brandImage) { brandImage.src = value.logo; brandImage.onerror = () => { brandImage.onerror = null; brandImage.src = defaults.logo; }; }
  };
  apply(current);
  const open = make('button', 'display-open', 'Tùy chỉnh hiển thị');
  open.type = 'button';
  open.setAttribute('aria-haspopup', 'dialog');
  if (qa) homeBrand.after(open);
  else (document.querySelector('.hero-top') || document.querySelector('.topbar')).append(open);
  const dialog = make('dialog', 'display-dialog');
  dialog.setAttribute('aria-labelledby', 'display-heading');
  const form = make('form', 'display-form');
  const head = make('div', 'display-dialog-head');
  const heading = make('h2', '', 'Tùy chỉnh hiển thị'); heading.id = 'display-heading';
  const close = make('button', 'display-close', 'Đóng'); close.type = 'button';
  head.append(heading, close);
  const note = make('p', 'display-note', 'Đổi logo, tên và mô tả ở đầu trang. Chỉ lưu trên trình duyệt này; dùng Xuất/Nhập để chuyển sang máy khác.');
  const scope = make('p', 'display-note', qa ? 'Không thay đổi test case, bug hoặc báo cáo.' : 'Không thay đổi nội dung luật, câu hỏi hoặc tiến độ học.');
  const field = (label, type, max) => {
    const wrap = make('label', 'display-field');
    wrap.append(make('span', '', label));
    const input = make('input'); input.type = type;
    if (max) input.maxLength = max;
    wrap.append(input); form.append(wrap); return input;
  };
  form.append(head, note, scope);
  const name = field('Tên hiển thị', 'text', 64); name.required = true;
  const subtitle = field('Mô tả ngắn', 'text', 160);
  const upload = field('Logo từ máy (PNG, JPEG, WebP; tối đa 512 KB)', 'file');
  upload.accept = 'image/png,image/jpeg,image/webp';
  const preview = make('div', 'display-preview');
  const previewImage = make('img'); previewImage.width = 56; previewImage.height = 56; previewImage.alt = 'Xem trước logo';
  const previewWords = make('div');
  const previewName = make('strong'); const previewSub = make('p');
  previewWords.append(previewName, previewSub); preview.append(previewImage, previewWords);
  const status = make('p', 'display-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
  const actions = make('div', 'display-actions');
  const button = (text, type = 'button') => { const b = make('button', '', text); b.type = type; actions.append(b); return b; };
  const save = button('Lưu hiển thị', 'submit'); save.className = 'display-save';
  const cancel = button('Hủy');
  const reset = button('Khôi phục mặc định');
  const exportButton = button('Xuất tùy chỉnh');
  const importLabel = make('label', 'display-import', 'Nhập tùy chỉnh');
  const importFile = make('input'); importFile.type = 'file'; importFile.accept = 'application/json,.json';
  importLabel.append(importFile); actions.append(importLabel);
  form.append(preview, status, actions); dialog.append(form); document.body.append(dialog);
  let draftLogo = current.logo;
  let reading = false;
  const draft = () => ({ name: name.value, subtitle: subtitle.value, logo: draftLogo });
  const previewDraft = () => { previewImage.src = draftLogo; previewName.textContent = name.value; previewSub.textContent = subtitle.value; };
  const fill = value => { name.value = value.name; subtitle.value = value.subtitle; draftLogo = value.logo; upload.value = ''; previewDraft(); };
  open.addEventListener('click', () => { fill(current); status.textContent = readError; dialog.showModal(); name.focus(); });
  [close, cancel].forEach(b => b.addEventListener('click', () => dialog.close()));
  [name, subtitle].forEach(input => input.addEventListener('input', previewDraft));
  const busy = value => { reading = value; save.disabled = value; exportButton.disabled = value; importFile.disabled = value; upload.disabled = value; reset.disabled = value; };
  upload.addEventListener('change', async () => {
    const file = upload.files[0]; if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 512 * 1024) { status.textContent = 'Chọn ảnh PNG, JPEG hoặc WebP không quá 512 KB.'; upload.value = ''; return; }
    busy(true); status.textContent = 'Đang chuẩn bị logo…';
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const img = new Image(); img.src = data; await img.decode();
      const scale = Math.min(1, 256 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale)); canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      const logo = canvas.toDataURL('image/png');
      clean({ ...draft(), name: name.value.trim() || defaults.name, logo });
      draftLogo = logo; previewDraft(); status.textContent = 'Logo đã sẵn sàng. Bấm Lưu hiển thị để áp dụng.';
    } catch { status.textContent = 'Không đọc được ảnh. Hãy chọn ảnh khác.'; }
    finally { busy(false); }
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); if (reading) return;
    try {
      const value = clean(draft());
      localStorage.setItem(key, JSON.stringify(value));
      current = value; readError = ''; apply(current); status.textContent = 'Đã lưu trên trình duyệt này.';
    } catch (error) { status.textContent = error.name === 'QuotaExceededError' || error.name === 'SecurityError' ? 'Trình duyệt không cho lưu. Hãy xuất tùy chỉnh để giữ lại.' : error.message; }
  });
  reset.addEventListener('click', () => {
    fill(savedDefaults); status.textContent = 'Đang xem bản mặc định. Bấm Lưu hiển thị để giữ thay đổi.';
  });
  exportButton.addEventListener('click', () => {
    try {
      const value = clean(draft());
      // Default logo belongs to the target site, rather than an exported origin.
      const payload = { version: 1, site: qa ? 'qa' : 'lyt', ...value, logo: value.logo === defaults.logo ? null : value.logo };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const a = make('a'); a.href = url; a.download = (qa ? 'qa-hub' : 'luatyte') + '-hien-thi.json'; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = 'Đã xuất bản đang xem trước. Tệp có thể nhập trên trình duyệt khác.';
    } catch (error) { status.textContent = error.message; }
  });
  importFile.addEventListener('change', async () => {
    const file = importFile.files[0]; if (!file) return;
    busy(true);
    try {
      if (file.size > 600000) throw new Error('Tệp tùy chỉnh quá lớn.');
      const value = JSON.parse(await file.text());
      if (value.version !== 1 || value.site !== (qa ? 'qa' : 'lyt')) throw new Error('Tệp tùy chỉnh không thuộc ứng dụng này.');
      fill(clean({ ...value, logo: value.logo === null ? defaults.logo : value.logo }));
      status.textContent = 'Đã nhập để xem trước. Bấm Lưu hiển thị để áp dụng.';
    } catch { status.textContent = 'Không nhập được. Chọn tệp tùy chỉnh đã xuất từ ứng dụng này.'; }
    finally { importFile.value = ''; busy(false); }
  });
})();
