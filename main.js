import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xFEFEFE);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

const orbit = new OrbitControls(camera, renderer.domElement);
camera.position.set(6, 8, 14);
orbit.update();

scene.add(new THREE.GridHelper(12, 12));
scene.add(new THREE.AxesHelper(4));
scene.add(new THREE.AmbientLight(0xffffff, 1));

/* ── LOADER PREVIEW CONFIG ───────────────────────────────
   Edit these to inspect changes live. Animation is frozen.
──────────────────────────────────────────────────────── */
const CONFIG = {
  textColor:  '#000000',
  bgColor:    0xf5f5f5,

  globe1Text:        'MURAT     EKER     >     COMPUTER     ENGINEER     &     IT     ',
  globe1Font:        'Sofia Sans Condensed',
  globe1Weight:      900,
  globe1HeightScale: 1.45,

  globe2Text:        'MACHINE LEARNING       •       BACKEND DEVELOPMENT       •       IT INFRASTRUCTURE       •       PORTFOLIO       •      ',
  globe2Font:        'Spline Sans Mono',
  globe2Weight:      300,
  globe2HeightScale: 1,
};

function createTextTexture(text, heightScale, fontWeight, fontFamily, dotWeight) {
  const c   = document.createElement('canvas');
  const ctx = c.getContext('2d');
  c.width = 8192; c.height = 4096;
  ctx.clearRect(0, 0, c.width, c.height);
  const t = text + ' ';
  ctx.font = `${fontWeight} 100px "${fontFamily}", sans-serif`;
  const finalSize = 100 * (c.width / ctx.measureText(t).width);

  ctx.fillStyle    = CONFIG.textColor;
  ctx.strokeStyle  = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth    = finalSize * 0.018;
  ctx.lineJoin     = 'round';
  ctx.textBaseline = 'middle';

  if (!dotWeight) {
    ctx.font = `${fontWeight} ${finalSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.save();
    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(1, heightScale);
    ctx.strokeText(t, 0, 0);
    ctx.fillText(t, 0, 0);
    ctx.restore();
  } else {
    // Draw segment by segment so dots use dotWeight
    const segments = t.split('•');
    ctx.font = `${fontWeight} ${finalSize}px "${fontFamily}", sans-serif`;
    let x = c.width / 2 - ctx.measureText(t) .width / 2;
    const y = c.height / 2;
    ctx.save();
    ctx.translate(0, 0);
    ctx.scale(1, 1);
    for (let i = 0; i < segments.length; i++) {
      ctx.font = `${fontWeight} ${finalSize}px "${fontFamily}", sans-serif`;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, heightScale);
      ctx.strokeText(segments[i], 0, 0);
      ctx.fillText(segments[i], 0, 0);
      ctx.restore();
      x += ctx.measureText(segments[i]).width;
      if (i < segments.length - 1) {
        ctx.font = `${dotWeight} ${finalSize}px "${fontFamily}", sans-serif`;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(1, heightScale);
        ctx.strokeText('•', 0, 0);
        ctx.fillText('•', 0, 0);
        ctx.restore();
        x += ctx.measureText('•').width;
        ctx.font = `${fontWeight} ${finalSize}px "${fontFamily}", sans-serif`;
      }
    }
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter  = THREE.LinearMipmapLinearFilter;
  tex.magFilter  = THREE.LinearFilter;
  tex.wrapS      = THREE.RepeatWrapping;
  tex.wrapT      = THREE.ClampToEdgeWrapping;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate = true;
  return tex;
}

function createTextSphere(text, heightScale, fontWeight, fontFamily, dotWeight) {
  const group = new THREE.Group();
  const tex   = createTextTexture(text, heightScale, fontWeight, fontFamily, dotWeight);
  const mat   = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  group.add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), mat));
  group.userData.tex = tex;
  return group;
}

const mouse = { x: 0, y: 0 };
const tgt   = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;
  mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
});

let globe1 = null, globe2 = null, masterGroup = null;

document.fonts.ready.then(() => {
  masterGroup = new THREE.Group();
  masterGroup.rotation.x = Math.PI / 24;
  masterGroup.position.y = 2;
  scene.add(masterGroup);

  globe1 = createTextSphere(CONFIG.globe1Text, CONFIG.globe1HeightScale, CONFIG.globe1Weight, CONFIG.globe1Font);
  globe2 = createTextSphere(CONFIG.globe2Text, CONFIG.globe2HeightScale, CONFIG.globe2Weight, CONFIG.globe2Font, 700);

  globe1.position.set(0,  0.35, 0);
  globe2.position.set(0, -0.10, 0);
  globe1.userData.tex.offset.x = -25 / 64;

  masterGroup.add(globe1, globe2);
});

function animate() {
  if (globe1) globe1.userData.tex.offset.x += 0.0004;
  if (globe2) globe2.userData.tex.offset.x += 0.0008;

  if (masterGroup) {
    tgt.x += (mouse.y * 0.4 - tgt.x) * 0.05;
    tgt.y += (mouse.x * 0.4 - tgt.y) * 0.05;
    masterGroup.rotation.x = Math.PI / 24 + tgt.x;
    masterGroup.rotation.y = tgt.y;
  }

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
