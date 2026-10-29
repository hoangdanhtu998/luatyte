import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const xml = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
const files = locs.map(u => new URL(u).pathname.replace(/^\//, "") || "index.html");

test("sitemap: mọi URL trỏ tới file có thật, không trùng", () => {
  assert.ok(locs.every(u => u.startsWith("https://luatyte.online/")));
  assert.equal(new Set(locs).size, locs.length);
  for (const f of files) assert.ok(fs.existsSync(path.join(ROOT, f)), `thiếu file ${f}`);
});
test("sitemap: có các trang học công khai", () => {
  for (const f of ["index.html", "ly_thuyet.html", "game.html", "tin_luat.html", "tham_chieu.html"]) assert.ok(files.includes(f), f);
});
test("sitemap: không có trang nội bộ hoặc chỉ để thử", () => {
  for (const f of files) {
    assert.ok(!/^_/.test(f), `trang tạm: ${f}`);
    assert.ok(!/^so-do-/.test(f), `sơ đồ nội bộ: ${f}`);
    assert.notEqual(f, "benh-vien-2-phong-thu.html");
    assert.notEqual(f, "dang-nhap.html");
    const html = fs.readFileSync(path.join(ROOT, f), "utf8");
    assert.ok(!/<meta name="robots" content="[^"]*noindex/i.test(html), `noindex: ${f}`);
  }
});
