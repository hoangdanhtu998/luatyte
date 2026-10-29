// Điểm vào ESM cho Node/test: cùng API với bản trình duyệt.
// Server tĩnh của app chặn file .mjs nên game.html dùng ./swipe-core.js;
// file này giữ tên module .mjs theo spec mà không nhân đôi logic.
export * from "./swipe-core.js";
