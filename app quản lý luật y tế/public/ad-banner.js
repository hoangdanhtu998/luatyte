// Banner quảng cáo dùng chung. Dùng: AdBanner.render(element, 'banner-top', 'top')
// Không chèn HTML từ dữ liệu: mọi chữ đều gán bằng textContent, link chỉ nhận http(s).
(function () {
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function safeUrl(u) {
    const s = String(u || '').trim();
    return /^https?:\/\//i.test(s) ? s : '';
  }

  function megaphoneIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M3 10v4a1 1 0 0 0 1 1h2l5 4V5L6 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z');
    path.setAttribute('fill', 'white');
    svg.appendChild(path);
    return svg;
  }

  // Tạo một banner từ dữ liệu quảng cáo. variant: 'top' | 'inline' | 'sidebar'
  function buildBanner(ad, variant = 'inline') {
    const root = document.createElement('article');
    root.className = `ad-banner ad-banner--${variant}`;
    root.setAttribute('aria-label', 'Quảng cáo');

    const media = document.createElement('div');
    const img = safeUrl(ad.imageUrl);
    if (img) {
      media.className = 'ad-banner__media';
      const el = document.createElement('img');
      el.src = img;
      el.alt = ad.title || '';
      el.loading = 'lazy';
      el.referrerPolicy = 'no-referrer';
      media.appendChild(el);
    } else {
      media.className = 'ad-banner__media ad-banner__media--empty';
      media.appendChild(megaphoneIcon());
    }
    root.appendChild(media);

    const body = document.createElement('div');
    body.className = 'ad-banner__body';

    const label = document.createElement('span');
    label.className = 'ad-banner__label';
    label.textContent = 'Quảng cáo';
    body.appendChild(label);

    const title = document.createElement('h3');
    title.className = 'ad-banner__title';
    title.textContent = ad.title || '';
    body.appendChild(title);

    if (ad.body) {
      const text = document.createElement('p');
      text.className = 'ad-banner__text';
      text.textContent = ad.body;
      body.appendChild(text);
    }

    const link = safeUrl(ad.linkUrl);
    if (link) {
      const a = document.createElement('a');
      a.className = 'ad-banner__cta';
      a.href = link;
      a.target = '_blank';
      a.rel = 'sponsored noopener noreferrer';
      a.textContent = 'Xem thêm';
      a.setAttribute('aria-label', `Xem thêm: ${ad.title || 'quảng cáo'} (mở tab mới)`);
      body.appendChild(a);
    }

    root.appendChild(body);
    return root;
  }

  // Tải quảng cáo của vị trí và hiển thị một banner. Không có quảng cáo thì ẩn vùng này.
  async function render(container, placement, variant = 'inline') {
    if (!container) return;
    container.hidden = true;
    try {
      const r = await fetch(`/api/public/ads?placement=${encodeURIComponent(placement)}`, { credentials: 'same-origin' });
      if (!r.ok) return;
      const data = await r.json();
      const ad = (data.ads || [])[0];
      if (!ad) return;
      container.replaceChildren(buildBanner(ad, variant));
      container.hidden = false;
    } catch (_) {
      // Lỗi mạng: không hiện gì, không làm hỏng trang.
    }
  }

  window.AdBanner = { buildBanner, render };
})();
