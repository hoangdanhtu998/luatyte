/* Nhân vật 3D của trợ lý. Dựng từ hình khối, không cần file mô hình.
   Trạng thái: idle, thinking, talking, wave, happy, shrug. Các trạng thái có thời lượng sẽ tự trở về idle. */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const TEAL = 0x0f766e, ORANGE = 0xf26b4f, INK = 0x0f172a, WHITE = 0xf5f7f6;
const LERP = 0.18;
const PX = 1; // render đúng kích thước khung, không phóng to từ ảnh nhỏ nên hết mờ

export function mount(container){
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 0.95, 5.4);
  camera.lookAt(0, 0.9, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9bb5b0, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(2, 4, 3);
  scene.add(key);

  const mat = c => new THREE.MeshStandardMaterial({ flatShading: true,  color: c, roughness: 0.55, metalness: 0.02 });
  const root = new THREE.Group();
  scene.add(root);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.55, 3, 8), mat(TEAL));
  body.position.y = 0.45;
  root.add(body);

  const head = new THREE.Group();
  head.position.y = 1.32;
  root.add(head);
  head.add(new THREE.Mesh(new THREE.SphereGeometry(0.46, 13, 10), mat(WHITE)));
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 5), mat(TEAL));
  stem.position.y = 0.58;
  head.add(stem);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), mat(ORANGE));
  bulb.position.y = 0.7;
  head.add(bulb);

  const inkMat = new THREE.MeshStandardMaterial({ flatShading: true,  color: INK, roughness: 0.3 });
  const eyeGeo = new THREE.SphereGeometry(0.06, 6, 5);
  const eyes = [-0.16, 0.16].map(x => {
    const e = new THREE.Mesh(eyeGeo, inkMat);
    e.position.set(x, 0.05, 0.4);
    head.add(e);
    return e;
  });
  const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), inkMat);
  mouth.position.set(0, -0.14, 0.42);
  head.add(mouth);

  const arm = side => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.46, 0.7, 0);
    const a = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.4, 3, 5), mat(TEAL));
    a.position.y = -0.3;
    pivot.add(a);
    root.add(pivot);
    return pivot;
  };
  const armL = arm(-1), armR = arm(1);

  const size = () => {
    const w = container.clientWidth || 300, h = container.clientHeight || 170;
    renderer.setSize(w / PX, h / PX, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(size);
  ro.observe(container);
  size();

  let state = "idle", stateStart = 0, stateUntil = Infinity;
  let running = false, raf = 0;
  const t0 = performance.now();
  const now = () => (performance.now() - t0) / 1000;

  function play(s, seconds){
    state = s;
    stateStart = now();
    stateUntil = seconds ? stateStart + seconds : Infinity;
  }

  // Tư thế đích cho từng trạng thái, mỗi khung hình tiến dần về đó
  function target(t){
    const p = { armL: -0.15, armR: 0.15, headY: 0, headZ: 0, mouth: 0.5, bobAmp: 0.02, bobSpeed: 2 };
    switch (state){
      case "thinking": p.headY = Math.sin(t * 0.9) * 0.35; p.headZ = 0.08; p.bobSpeed = 4; break;
      case "talking": p.mouth = 0.5 + Math.abs(Math.sin(t * 15)) * 1.1; break;
      case "wave": p.armR = 2.5 + Math.sin(t * 9) * 0.35; break;
      case "happy": p.armL = -2.5 + Math.sin(t * 8) * 0.3; p.armR = 2.5 - Math.sin(t * 8) * 0.3; p.bobAmp = 0.1; p.bobSpeed = 6; break;
      case "shrug": p.armL = -0.9; p.armR = 0.9; p.headZ = 0.25; break;
    }
    return p;
  }

  function frame(){
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const t = now();
    if (state !== "idle" && t > stateUntil) play("idle");

    const p = target(t - stateStart);
    root.position.y = Math.sin(t * p.bobSpeed) * p.bobAmp;
    head.rotation.y += (p.headY - head.rotation.y) * LERP;
    head.rotation.z += (p.headZ - head.rotation.z) * LERP;
    armL.rotation.z += (p.armL - armL.rotation.z) * LERP;
    armR.rotation.z += (p.armR - armR.rotation.z) * LERP;

    const blinking = (t % 3.4) < 0.12;
    eyes.forEach(e => e.scale.y = blinking ? 0.12 : 1);
    mouth.scale.set(1.6, p.mouth, 0.6);

    renderer.render(scene, camera);
  }

  return {
    play,
    resume(){ if (!running){ running = true; frame(); } },
    pause(){ running = false; cancelAnimationFrame(raf); },
  };
}
