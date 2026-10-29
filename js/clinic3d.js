// Fallback 2D cho tab 3D của phòng khám khi gói WebGL/asset 3D chưa được đóng gói.
// API khớp với clinic.html: init(canvas), resize(), frame().
let canvas = null;
let ctx = null;
let drawn = false;

function draw() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const cw = w / dpr, ch = h / dpr;
  ctx.clearRect(0, 0, cw, ch);
  const bg = ctx.createLinearGradient(0, 0, 0, ch);
  bg.addColorStop(0, "#EAF7F3");
  bg.addColorStop(1, "#CFEAE2");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = "#0F3D33";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "700 18px system-ui, sans-serif";
  ctx.fillText("Phòng 3D đang được hoàn thiện", cw / 2, ch / 2 - 12);
  ctx.font = "400 13px system-ui, sans-serif";
  ctx.fillStyle = "#3E6B60";
  ctx.fillText("Bản đồ 4 phòng vẫn dùng bình thường.", cw / 2, ch / 2 + 14);
  drawn = true;
}

export function init(el) {
  canvas = el;
  ctx = canvas.getContext("2d");
  draw();
}

export function resize() {
  drawn = false;
  draw();
}

export function frame() {
  if (!drawn) draw();
}
