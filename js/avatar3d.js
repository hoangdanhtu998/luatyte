/* Trợ lý 3D — 16 con vật đồng hành xuất từ Blender (GLB) + three.js vendored.
   Contract giống bản SVG cũ: mount(container) => {play(state, sec), resume(), pause(), setCompanion(id)}.
   - Trạng thái: idle, thinking, talking, wave, happy, shrug, cheer, sad.
   - talking = há miệng (chỉ khi đọc / giảng bài); mọi trạng thái khác luôn mím miệng.
   - Trạng thái có thời lượng tự về idle; không có thời lượng thì chạy tới khi play("idle").
   - WebGL lỗi hoặc không tải được GLB => fallback ảnh thumb PNG (không dùng SVG bác sĩ).
   Paths dẫn từ import.meta.url nên chạy được từ trang chính, hoc-test lẫn mirror. */

import * as THREE from "./vendor/three.module.min.js";
import { GLTFLoader } from "./vendor/GLTFLoader.js";

const BASE = new URL("../assets/companions/", import.meta.url);
const MANIFEST = new URL("../data/companions.json", import.meta.url);
const FALLBACK_ID = "soc";
const FOV = 30;

let LIST = null;   // manifest data/companions.json, tải một lần

function readId() {
  try {
    const v = JSON.parse(localStorage.getItem("lyt_companion") || "null");
    if (typeof v === "string" && v) return v;
  } catch {}
  return FALLBACK_ID;
}
function writeId(id) {
  try { localStorage.setItem("lyt_companion", JSON.stringify(id)); } catch {}
}

async function entry(id) {
  if (!LIST) {
    try {
      const r = await fetch(MANIFEST);
      if (r.ok) LIST = await r.json();
    } catch {}
  }
  const l = Array.isArray(LIST) ? LIST : [];
  return l.find(x => x && x.id === id) || l[0] ||
    { id: FALLBACK_ID, name: "Sóc", glb: "soc.glb", thumb: "thumbs/soc.png" };
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch { return false; }
}

function disposeTree(o) {
  o.traverse(n => {
    if (n.geometry) n.geometry.dispose();
    const m = n.material;
    if (m) (Array.isArray(m) ? m : [m]).forEach(x => x && x.dispose && x.dispose());
  });
}

/* Trục mỏng nhất của geometry = chiều mở miệng / chiều nheo mắt (GLB luôn +Y up). */
function thinAxis(o) {
  const g = o && o.geometry;
  if (!g) return "y";
  if (!g.boundingBox) g.computeBoundingBox();
  const s = g.boundingBox.getSize(new THREE.Vector3());
  return (s.y <= s.x && s.y <= s.z) ? "y" : (s.x <= s.z ? "x" : "z");
}

export function mount(container) {
  if (!container) return null;

  const reduced = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  const st = {
    id: readId(),
    state: "idle", until: 0,
    renderer: null, scene: null, camera: null, stage: null, root: null,
    head: null, mouth: null, eyes: [], mouthAxis: "y",
    headRot: null, mouthScale: null, eyeScale: [],
    raf: 0, running: false, t: 0, last: 0,
    blinkAt: 0, blinkTo: 0,
    failed: false, disposed: false, seq: 0, ro: null,
    h: 1.6, w: 1
  };

  /* ---------- khung hình ---------- */
  function frame() {
    const cam = st.camera;
    if (!cam) return;
    const cw = container.clientWidth || 340;
    const ch = container.clientHeight || 130;
    const aspect = Math.max(0.2, cw / Math.max(1, ch));
    const tan = Math.tan(FOV * Math.PI / 360);
    const dV = (st.h * 1.16) / (2 * tan);            // vừa chiều cao
    const dH = (st.w * 1.30) / (2 * tan * aspect);   // vừa chiều rộng
    cam.aspect = aspect;
    cam.position.set(0, st.h * 0.5, Math.max(dV, dH));
    cam.lookAt(0, st.h * 0.5, 0);
    cam.updateProjectionMatrix();
  }

  function resize() {
    if (!st.renderer) return;
    const w = Math.max(1, container.clientWidth || 340);
    const h = Math.max(1, container.clientHeight || 130);
    st.renderer.setSize(w, h, false);
    frame();
    if (!st.running) draw(performance.now());
  }

  /* ---------- vẽ 1 khung ---------- */
  function draw(now) {
    if (!st.renderer || !st.root) return;
    pose(now);
    st.renderer.render(st.scene, st.camera);
  }

  /* ---------- pose theo trạng thái ---------- */
  function pose(now) {
    const stage = st.stage;
    if (!stage) return;
    const t = st.t;
    let open = 0;                       // 0 = mím, 1 = há hết cỡ

    stage.position.set(0, 0, 0);
    stage.rotation.set(0, 0, 0);
    stage.scale.set(1, 1, 1);
    if (st.head && st.headRot) st.head.rotation.copy(st.headRot);

    switch (st.state) {
      case "talking":                    // đọc / giảng: há miệng + nhịp nhẹ
        if (!reduced) {
          stage.position.y = Math.abs(Math.sin(t * 6)) * 0.028;
          stage.rotation.z = Math.sin(t * 4) * 0.03;
        }
        open = 0.5 + 0.5 * Math.abs(Math.sin(t * 10.5));
        break;
      case "thinking":
        if (st.head) st.head.rotation.z = st.headRot.z + 0.17 + (reduced ? 0 : Math.sin(t * 2) * 0.05);
        if (!reduced) stage.rotation.z = Math.sin(t * 1.5) * 0.02;
        break;
      case "wave":
        stage.rotation.z = reduced ? 0.1 : Math.sin(t * 8.5) * 0.13;
        if (!reduced) stage.position.y = Math.abs(Math.sin(t * 5)) * 0.07;
        break;
      case "happy":
      case "cheer": {
        const strong = st.state === "cheer";
        if (!reduced) {
          const p = Math.abs(Math.sin(t * (strong ? 7 : 6)));
          stage.position.y = p * (strong ? 0.13 : 0.09);
          stage.scale.y = 1 + (1 - p) * 0.06;
          stage.scale.x = stage.scale.z = 1 - (1 - p) * 0.035;
        }
        if (st.head) st.head.rotation.z = st.headRot.z + (reduced ? 0 : Math.sin(t * 3) * 0.07);
        break;
      }
      case "shrug":
        if (!reduced) stage.rotation.z = Math.sin(t * 3.2) * 0.14;
        if (st.head) st.head.rotation.z = st.headRot.z - stage.rotation.z * 0.55;
        break;
      case "sad":
        stage.position.y = -0.05;
        if (st.head) st.head.rotation.z = st.headRot.z + 0.17;
        if (!reduced) stage.rotation.z = Math.sin(t * 1.1) * 0.02;
        break;
      default:                            // idle
        if (!reduced) {
          stage.position.y = Math.sin(t * 2) * 0.018;
          stage.rotation.z = Math.sin(t * 1.3) * 0.02;
          stage.scale.y = 1 + Math.sin(t * 2) * 0.012;
        }
    }

    // miệng: mím mặc định, chỉ há khi talking
    if (st.mouth && st.mouthScale) {
      st.mouth.scale.copy(st.mouthScale);
      st.mouth.scale[st.mouthAxis] = st.mouthScale[st.mouthAxis] * (1 + open * 2.6);
    }

    // chớp mắt
    let blink = 1;
    if (!reduced) {
      if (now >= st.blinkAt) { st.blinkTo = now + 110; st.blinkAt = now + 2400 + Math.random() * 3400; }
      if (now < st.blinkTo) blink = 0.14;
    }
    st.eyes.forEach((e, i) => {
      const b = st.eyeScale[i];
      if (!b) return;
      e.scale.copy(b);
      e.scale.y = b.y * blink;
    });
  }

  function tick(now) {
    if (!st.running) return;
    st.raf = requestAnimationFrame(tick);
    const dt = Math.min(0.05, (now - st.last) / 1000);
    st.last = now;
    st.t += dt;
    if (st.until && now >= st.until) { st.state = "idle"; st.until = 0; }
    draw(now);
  }

  function resume() {
    if (st.disposed || st.failed || !st.renderer || !st.root) return;
    if (reduced) { draw(performance.now()); return; }
    if (st.running) return;
    st.running = true;
    st.last = performance.now();
    if (!st.blinkAt) st.blinkAt = st.last + 1600;
    st.raf = requestAnimationFrame(tick);
  }

  function pause() {
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
    if (!st.running) return;
    st.running = false;
    if (st.failed || reduced) return;
    st.state = "idle";                  // đóng panel => về trạng thái thường (mím miệng)
    st.until = 0;
    draw(performance.now());
  }

  /* ---------- tải model ---------- */
  async function applyModel(id) {
    const seq = ++st.seq;
    const e = await entry(id);
    const gltf = await new GLTFLoader().loadAsync(new URL(e.glb, BASE).href);
    if (seq !== st.seq) { disposeTree(gltf.scene); return false; }   // đã có lượt tải mới hơn

    const root = gltf.scene;
    st.stage.add(root);
    root.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    root.position.x -= ctr.x;            // căn giữa ngang
    root.position.z -= ctr.z;
    root.position.y -= box.min.y;        // đặt chân xuống y = 0
    root.updateMatrixWorld(true);

    if (st.root) { st.stage.remove(st.root); disposeTree(st.root); }
    st.root = root;
    st.head = root.getObjectByName("Head") || null;
    st.mouth = root.getObjectByName("Mouth") || null;
    st.eyes = [root.getObjectByName("eyeL"), root.getObjectByName("eyeR")].filter(Boolean);
    st.headRot = st.head ? st.head.rotation.clone() : null;
    st.mouthScale = st.mouth ? st.mouth.scale.clone() : null;
    st.eyeScale = st.eyes.map(o => o.scale.clone());
    st.mouthAxis = st.mouth ? thinAxis(st.mouth) : "y";
    st.h = Math.max(0.1, size.y);
    st.w = Math.max(0.1, size.x);
    st.id = id;
    st.t = 0;
    st.blinkAt = 0;
    frame();
    draw(performance.now());
    return true;
  }

  /* ---------- fallback ảnh PNG khi WebGL lỗi ---------- */
  async function fallback(id) {
    st.failed = true;
    pause();
    if (st.ro) { st.ro.disconnect(); st.ro = null; }
    if (st.renderer) {
      st.renderer.dispose();
      st.renderer = null;
    }
    let img = container.querySelector("img.a3d-fb");
    if (!img) {
      img = document.createElement("img");
      img.className = "a3d-fb";
      img.alt = "";
      img.setAttribute("aria-hidden", "true");
      container.replaceChildren(img);
    }
    try {
      const e = await entry(id);
      img.src = new URL(e.thumb, BASE).href;
    } catch {}
    return img;
  }

  function pop() {
    if (reduced) return;
    const img = container.querySelector("img.a3d-fb");
    if (!img) return;
    img.classList.remove("a3d-pop");
    void img.offsetWidth;                 // restart animation
    img.classList.add("a3d-pop");
  }

  /* ---------- boot ---------- */
  (async function boot() {
    if (st.disposed) return;
    if (!hasWebGL()) { await fallback(st.id); return; }
    try {
      const r = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      r.outputColorSpace = THREE.SRGBColorSpace;
      r.setClearAlpha(0);
      st.renderer = r;
      container.replaceChildren(r.domElement);

      st.scene = new THREE.Scene();
      st.camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 60);
      st.scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      st.scene.add(new THREE.HemisphereLight(0xffffff, 0x9fb0bc, 0.6));
      const key = new THREE.DirectionalLight(0xffffff, 2.0);
      key.position.set(2.6, 5, 3.4);
      const rim = new THREE.DirectionalLight(0xffffff, 0.7);
      rim.position.set(-3, 2.5, -2.5);
      st.scene.add(key, rim);
      st.stage = new THREE.Group();
      st.scene.add(st.stage);
    } catch { await fallback(st.id); return; }

    try {
      await applyModel(st.id);
    } catch { await fallback(st.id); return; }

    if (st.disposed) return;
    resize();
    st.ro = new ResizeObserver(() => resize());
    st.ro.observe(container);
    resume();
  })();

  return {
    play(state, sec) {
      st.state = state || "idle";
      st.until = sec ? performance.now() + sec * 1000 : 0;
      if (st.failed) { pop(); return; }
      if (reduced) { draw(performance.now()); return; }
      if (!st.running) resume();
    },
    resume,
    pause,
    async setCompanion(id) {
      if (!id || st.disposed) return;
      st.id = id;
      writeId(id);
      if (st.failed) { await fallback(id); return; }
      if (!st.renderer) return;          // vẫn đang boot, boot sẽ đọc st.id
      try {
        if (await applyModel(id) && !st.running) resume();
      } catch { await fallback(id); }
    },
    dispose() {
      st.disposed = true;
      st.seq++;
      pause();
      if (st.ro) { st.ro.disconnect(); st.ro = null; }
      if (st.root) { st.stage && st.stage.remove(st.root); disposeTree(st.root); st.root = null; }
      if (st.renderer) { st.renderer.dispose(); st.renderer = null; }
      container.replaceChildren();
    }
  };
}
