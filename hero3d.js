/**
 * hero3d.js — Three.js interactive hero scene
 * Abhi Online Services
 *
 * ── HOW TO CONFIGURE ───────────────────────────────────────────────────────
 *   Edit the SCENE_CONFIG block below to tune colours, sizes, speeds and
 *   counts without touching any rendering or animation code.
 * ───────────────────────────────────────────────────────────────────────────
 */

import * as THREE              from 'three';
import { EffectComposer }      from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }          from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass }     from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }          from 'three/addons/postprocessing/OutputPass.js';

/* ============================================================
   SCENE CONFIG  ← tweak freely
   ============================================================ */
export const SCENE_CONFIG = {
  /* Background & fog colour */
  bgColor: 0x080f1e,
  fogDensity: 0.028,

  /* Scene X-offset  (shift everything right so left side stays free for text) */
  hubX: 2.2,

  /* Hub */
  hub: {
    coreColor:    0xf97f06,
    coreEmissive: 1.5,
    pulseSpeed:   1.85,
    pulseAmp:     0.032,
    rotationSpeed:0.11,
  },

  /* Orbital rings (decorative) */
  rings: [
    { radius: 2.10, tube: 0.020, color: 0x005caa, opacity: 0.65, rx:  Math.PI / 3.0,  ry:  Math.PI / 7,   rz: 0,              rotZ:  0.075 },
    { radius: 2.85, tube: 0.013, color: 0xf97f06, opacity: 0.35, rx: -Math.PI / 4.5,  ry:  0,             rz:  Math.PI / 6,   rotZ: -0.055 },
    { radius: 3.60, tube: 0.008, color: 0x7ab8ff, opacity: 0.22, rx:  Math.PI / 2.2,  ry: -Math.PI / 8,   rz:  Math.PI / 4,   rotY:  0.038 },
  ],

  /* Orbital service objects */
  orbitals: [
    { type: 'document',    radius: 2.95, speed: 0.19, startAngle: 0,              tilt:  0.20, yOffset:  0.38, scale: 0.84 },
    { type: 'panCard',     radius: 3.55, speed: 0.14, startAngle: Math.PI * 0.40, tilt: -0.17, yOffset: -0.32, scale: 0.88 },
    { type: 'passport',    radius: 2.75, speed: 0.27, startAngle: Math.PI * 0.78, tilt:  0.24, yOffset:  0.08, scale: 0.80 },
    { type: 'utilityDisc', radius: 3.92, speed: 0.11, startAngle: Math.PI * 1.18, tilt: -0.11, yOffset:  0.50, scale: 1.00 },
    { type: 'glassPanel',  radius: 3.15, speed: 0.21, startAngle: Math.PI * 1.52, tilt:  0.29, yOffset: -0.42, scale: 0.76 },
    { type: 'sealDisc',    radius: 3.65, speed: 0.16, startAngle: Math.PI * 1.88, tilt: -0.21, yOffset:  0.22, scale: 0.90 },
  ],

  /* Particles */
  particles: [
    { count: 130, spread: [22, 14, 12], color: 0xf97f06, size: 0.044, opacity: 0.55, rotY:  0.017 },
    { count:  90, spread: [18, 12, 10], color: 0x5599ff, size: 0.034, opacity: 0.42, rotY: -0.013 },
    { count:  65, spread: [16, 10,  8], color: 0xffffff, size: 0.022, opacity: 0.28, rotZ:  0.009 },
  ],

  /* Grid wave surface */
  grid: {
    size: 22, divisions: 26,
    color: 0x1a4a8a, opacity: 0.11,
    waveAmpX: 0.18, waveAmpZ: 0.12,
    waveSpeedX: 0.50, waveSpeedZ: 0.38,
  },

  /* Bloom post-processing */
  bloom: {
    strength:  0.75,
    radius:    0.50,
    threshold: 0.72,
  },

  /* Camera base position & parallax strength */
  camera: {
    position: [-1.5, 1.8, 10.5],
    lookAt:   [ 2.2, 0.0,  0.0],
    parallaxX: 0.62,
    parallaxY: 0.30,
    lerpSpeed: 0.042,
    scrollZoom: 1.6,
  },

  /* Hover scale multiplier when mouse is over an orbital */
  hoverScale: 1.18,
};

/* ============================================================
   OBJECT FACTORIES
   Each returns a THREE.Group.  Add new service types here.
   ============================================================ */
const OBJECTS = {

  document() {
    const g = new THREE.Group();
    // Paper base
    g.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 1.28, 0.042),
      new THREE.MeshStandardMaterial({ color: 0xf0f4ff, metalness: 0, roughness: 0.55,
        emissive: 0x1a2444, emissiveIntensity: 0.04 })
    ));
    // Orange header stripe
    const hdr = new THREE.Mesh(
      new THREE.BoxGeometry(0.92, 0.21, 0.005),
      new THREE.MeshStandardMaterial({ color: 0xf97f06, emissive: 0xf97f06, emissiveIntensity: 0.4 })
    );
    hdr.position.set(0, 0.535, 0.025);
    g.add(hdr);
    // Text line stubs
    [0.24, 0.09, -0.06, -0.20, -0.34].forEach((y, i) => {
      const ln = new THREE.Mesh(
        new THREE.BoxGeometry(i % 2 === 0 ? 0.56 : 0.40, 0.028, 0.003),
        new THREE.MeshBasicMaterial({ color: 0xb0b8cc })
      );
      ln.position.set(-0.04, y, 0.025);
      g.add(ln);
    });
    // Circular seal
    const seal = new THREE.Mesh(
      new THREE.CircleGeometry(0.11, 16),
      new THREE.MeshStandardMaterial({ color: 0xf97f06, emissive: 0xf97f06, emissiveIntensity: 0.5 })
    );
    seal.position.set(0.28, -0.46, 0.025);
    g.add(seal);
    return g;
  },

  panCard() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.BoxGeometry(1.60, 1.00, 0.045),
      new THREE.MeshStandardMaterial({ color: 0xfaf2e6, metalness: 0.08, roughness: 0.45,
        emissive: 0x1a0800, emissiveIntensity: 0.04 })
    ));
    // Blue top band
    const band = new THREE.Mesh(
      new THREE.BoxGeometry(1.60, 0.19, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x005caa, emissive: 0x005caa, emissiveIntensity: 0.22 })
    );
    band.position.set(0, 0.405, 0.026);
    g.add(band);
    // Photo placeholder
    const photo = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.40, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x8ab4d8, roughness: 0.6 })
    );
    photo.position.set(-0.54, 0.04, 0.026);
    g.add(photo);
    // Gold chip
    const chip = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.17, 0.012),
      new THREE.MeshStandardMaterial({ color: 0xf5c842, metalness: 0.9, roughness: 0.1,
        emissive: 0xf5c842, emissiveIntensity: 0.15 })
    );
    chip.position.set(0.04, 0.04, 0.03);
    g.add(chip);
    // Card-number dots
    for (let i = 0; i < 4; i++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x334455 })
      );
      dot.position.set(-0.48 + i * 0.32, -0.28, 0.026);
      g.add(dot);
    }
    return g;
  },

  passport() {
    const g = new THREE.Group();
    // Cover
    g.add(new THREE.Mesh(
      new THREE.BoxGeometry(0.90, 1.28, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x183566, emissive: 0x061020, emissiveIntensity: 0.10,
        metalness: 0.04, roughness: 0.60 })
    ));
    // Pages stack
    const pages = new THREE.Mesh(
      new THREE.BoxGeometry(0.80, 1.20, 0.11),
      new THREE.MeshStandardMaterial({ color: 0xf5f4ec, roughness: 0.9 })
    );
    pages.position.x = 0.02;
    g.add(pages);
    // Front cover face
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(0.90, 1.28, 0.012),
      new THREE.MeshStandardMaterial({ color: 0x183566, emissive: 0x0a1f40, emissiveIntensity: 0.10,
        metalness: 0.05, roughness: 0.50 })
    );
    front.position.z = 0.076;
    g.add(front);
    // Gold emblem
    const emb = new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf5c842, emissive: 0xf5c842, emissiveIntensity: 0.35,
        metalness: 0.70, roughness: 0.20 })
    );
    emb.position.set(0, 0.20, 0.085);
    g.add(emb);
    // Bottom MRZ line stub
    const mrz = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.022, 0.001),
      new THREE.MeshBasicMaterial({ color: 0xf5c842, transparent: true, opacity: 0.50 })
    );
    mrz.position.set(0, -0.14, 0.085);
    g.add(mrz);
    return g;
  },

  utilityDisc() {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(
      new THREE.CylinderGeometry(0.60, 0.60, 0.09, 36),
      new THREE.MeshStandardMaterial({ color: 0xf97f06, emissive: 0xf97f06, emissiveIntensity: 0.90,
        metalness: 0.20, roughness: 0.28 })
    ));
    // Inner white ring
    const ir = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.025, 8, 36),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
    );
    ir.rotation.x = Math.PI / 2;
    ir.position.y = 0.048;
    g.add(ir);
    // Lightning bolt (flat Shape on top face)
    const shape = new THREE.Shape();
    shape.moveTo( 0.04,  0.26); shape.lineTo( 0.14,  0.02);
    shape.lineTo( 0.04,  0.02); shape.lineTo( 0.16, -0.26);
    shape.lineTo(-0.06, -0.02); shape.lineTo( 0.04, -0.02);
    shape.lineTo(-0.08,  0.22); shape.closePath();
    const bolt = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
    );
    bolt.rotation.x = -Math.PI / 2;
    bolt.position.y = 0.048;
    g.add(bolt);
    return g;
  },

  glassPanel() {
    const g = new THREE.Group();
    const panGeo = new THREE.BoxGeometry(1.80, 1.18, 0.026);
    g.add(new THREE.Mesh(panGeo,
      new THREE.MeshPhysicalMaterial({
        color: 0x88ccff, emissive: 0x112244, emissiveIntensity: 0.12,
        metalness: 0, roughness: 0.06,
        transmission: 0.72, transparent: true, opacity: 0.32, ior: 1.4,
      })
    ));
    // Edge glow outline
    g.add(new THREE.LineSegments(
      new THREE.EdgesGeometry(panGeo),
      new THREE.LineBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.45 })
    ));
    // Progress bars + tracks
    [[0xf97f06, 0.88], [0x005caa, 0.62], [0x22dd99, 0.74]].forEach(([c, w], i) => {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.044, 0.002),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.6 })
      );
      bar.position.set(-0.44 + w / 2, 0.28 - i * 0.22, 0.016);
      g.add(bar);
      const track = new THREE.Mesh(
        new THREE.BoxGeometry(1.20, 0.028, 0.001),
        new THREE.MeshBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.35 })
      );
      track.position.set(0.16, 0.28 - i * 0.22 - 0.055, 0.014);
      g.add(track);
    });
    // Status dots
    [0xf97f06, 0x22dd99, 0x3399ff].forEach((c, i) => {
      const dot = new THREE.Mesh(
        new THREE.CircleGeometry(0.038, 8),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.9 })
      );
      dot.position.set(-0.75 + i * 0.12, 0.44, 0.016);
      g.add(dot);
    });
    return g;
  },

  sealDisc() {
    const g = new THREE.Group();
    // Hexagonal gold ring
    g.add(new THREE.Mesh(
      new THREE.CircleGeometry(0.54, 6),
      new THREE.MeshStandardMaterial({ color: 0xf5c218, emissive: 0xf5c218, emissiveIntensity: 0.45,
        metalness: 0.65, roughness: 0.18 })
    ));
    g.add(new THREE.Mesh(
      new THREE.CircleGeometry(0.40, 6),
      new THREE.MeshStandardMaterial({ color: 0xf97f06, emissive: 0xf97f06, emissiveIntensity: 0.30,
        metalness: 0.40, roughness: 0.30 })
    ));
    // Centre star
    g.add(new THREE.Mesh(
      new THREE.CircleGeometry(0.16, 5),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.70 })
    ));
    return g;
  },
};

/* ============================================================
   INIT — call this once the DOM is ready
   ============================================================ */
export function initHero3D(canvasId = 'hero-canvas', containerId = 'hero-container') {
  const canvas    = document.getElementById(canvasId);
  const container = document.getElementById(containerId);
  const cursorGlow = document.getElementById('cursor-glow');
  if (!canvas || !container) return;

  const C = SCENE_CONFIG; // shorthand

  /* ── Renderer ── */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  /* ── Scene ── */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.bgColor);
  scene.fog = new THREE.FogExp2(C.bgColor, C.fogDensity);

  /* ── Camera ── */
  const [cx, cy, cz] = C.camera.position;
  const [lx, ly, lz] = C.camera.lookAt;
  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
  camera.position.set(cx, cy, cz);
  camera.lookAt(lx, ly, lz);
  const CAM_BASE = camera.position.clone();
  const CAM_LOOK = new THREE.Vector3(lx, ly, lz);
  const camLookSmooth = new THREE.Vector3().copy(CAM_LOOK);

  /* ── Resize helper ── */
  let composer = null, bloomPass = null;
  function syncSize() {
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (composer) {
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    }
  }

  /* ────────────────────────────────────────
     LIGHTING
  ──────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0x0d1a30, 4.0));

  const hubLight = new THREE.PointLight(0xf97f06, 10, 14);
  hubLight.position.set(C.hubX, 0, 0);
  scene.add(hubLight);

  const blueLight = new THREE.PointLight(0x1a6fff, 4, 18);
  blueLight.position.set(-4, -2, 3);
  scene.add(blueLight);

  const rimLight = new THREE.DirectionalLight(0x7ab4ff, 1.2);
  rimLight.position.set(10, 8, 4);
  scene.add(rimLight);

  const fillLight = new THREE.DirectionalLight(0xffddbb, 0.4);
  fillLight.position.set(-3, 3, 7);
  scene.add(fillLight);

  /* ────────────────────────────────────────
     CENTRAL HUB
  ──────────────────────────────────────── */
  const hubGroup = new THREE.Group();
  hubGroup.position.set(C.hubX, 0, 0);
  scene.add(hubGroup);

  const coreGeo = new THREE.IcosahedronGeometry(0.76, 4);
  const coreMat = new THREE.MeshStandardMaterial({
    color: C.hub.coreColor,
    emissive: C.hub.coreColor,
    emissiveIntensity: C.hub.coreEmissive,
    metalness: 0.25, roughness: 0.18,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  hubGroup.add(core);

  // Wireframe outer shell
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.05, 2),
    new THREE.MeshBasicMaterial({ color: 0xff9933, transparent: true, opacity: 0.18, wireframe: true })
  );
  hubGroup.add(shell);

  // Glow halos (back-face spheres)
  [[1.55, 0.07], [2.30, 0.035], [3.20, 0.015]].forEach(([r, op]) => {
    hubGroup.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 16),
      new THREE.MeshBasicMaterial({
        color: C.hub.coreColor, transparent: true, opacity: op,
        side: THREE.BackSide, depthWrite: false,
      })
    ));
  });

  /* ────────────────────────────────────────
     DECORATIVE RINGS
  ──────────────────────────────────────── */
  const rings = C.rings.map(cfg => {
    const m = new THREE.Mesh(
      new THREE.TorusGeometry(cfg.radius, cfg.tube, 8, 90),
      new THREE.MeshStandardMaterial({
        color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.35,
        metalness: 0.4, roughness: 0.3,
        transparent: true, opacity: cfg.opacity,
      })
    );
    m.position.set(C.hubX, 0, 0);
    m.rotation.set(cfg.rx, cfg.ry, cfg.rz);
    scene.add(m);
    return { mesh: m, cfg };
  });

  /* ────────────────────────────────────────
     ORBITAL SERVICE OBJECTS
  ──────────────────────────────────────── */
  const orbitGroup = new THREE.Group();
  orbitGroup.position.set(C.hubX, 0, 0);
  scene.add(orbitGroup);

  const orbitals = C.orbitals.map(cfg => {
    const factory = OBJECTS[cfg.type];
    if (!factory) { console.warn(`[Hero3D] Unknown orbital type: "${cfg.type}"`); return null; }
    const mesh = factory();
    mesh.scale.setScalar(cfg.scale);
    orbitGroup.add(mesh);
    return { mesh, cfg };
  }).filter(Boolean);

  // Collect all sub-meshes for raycasting
  const rcTargets = [];
  const meshToOrbital = new Map();
  orbitals.forEach(o => {
    o.mesh.traverse(c => {
      if (c.isMesh) {
        rcTargets.push(c);
        meshToOrbital.set(c, o);
      }
    });
  });

  /* ────────────────────────────────────────
     PARTICLES
  ──────────────────────────────────────── */
  const particleSystems = C.particles.map(cfg => {
    const pos = new Float32Array(cfg.count * 3);
    for (let i = 0; i < cfg.count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * cfg.spread[0];
      pos[i * 3 + 1] = (Math.random() - 0.5) * cfg.spread[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * cfg.spread[2] - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo,
      new THREE.PointsMaterial({
        color: cfg.color, size: cfg.size,
        transparent: true, opacity: cfg.opacity,
        sizeAttenuation: true, depthWrite: false,
      })
    );
    pts.position.x = C.hubX;
    scene.add(pts);
    return { pts, cfg };
  });

  /* ────────────────────────────────────────
     GRID / WAVE SURFACE
  ──────────────────────────────────────── */
  const G = C.grid;
  const gridGeo = new THREE.PlaneGeometry(G.size, G.size, G.divisions, G.divisions);
  const gridPosAttr = gridGeo.attributes.position;
  const grid = new THREE.Mesh(gridGeo,
    new THREE.MeshBasicMaterial({ color: G.color, transparent: true, opacity: G.opacity, wireframe: true })
  );
  grid.rotation.x = -Math.PI / 2;
  grid.position.set(C.hubX, -3.8, 0);
  scene.add(grid);

  /* ────────────────────────────────────────
     POST-PROCESSING  (bloom)
  ──────────────────────────────────────── */
  try {
    composer  = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(container.offsetWidth, container.offsetHeight),
      C.bloom.strength, C.bloom.radius, C.bloom.threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  } catch (e) {
    console.warn('[Hero3D] Post-processing unavailable:', e.message);
    composer = null;
  }

  /* ────────────────────────────────────────
     INPUT STATE
  ──────────────────────────────────────── */
  const mouse    = { x: 0, y: 0, rawX: 0, rawY: 0 };
  const mouseNDC = new THREE.Vector2();
  let   scrollY  = 0;
  let   inView   = true;
  let   hoveredOrbital = null;

  window.addEventListener('mousemove', e => {
    mouse.rawX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouse.rawY = -(e.clientY / window.innerHeight - 0.5) * 2;
    mouseNDC.set(
      (e.clientX / window.innerWidth)  * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );
    if (cursorGlow) {
      const r = container.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right
                  && e.clientY >= r.top  && e.clientY <= r.bottom;
      cursorGlow.style.opacity = inside ? '1' : '0';
      cursorGlow.style.left = (e.clientX - r.left) + 'px';
      cursorGlow.style.top  = (e.clientY - r.top)  + 'px';
    }
  });

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    inView  = scrollY < window.innerHeight * 1.8;
  });

  window.addEventListener('resize', syncSize);

  /* ────────────────────────────────────────
     RAYCASTER
  ──────────────────────────────────────── */
  const raycaster = new THREE.Raycaster();

  /* ────────────────────────────────────────
     ANIMATION LOOP
  ──────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!inView) return;

    const t = clock.getElapsedTime();

    // Smooth mouse
    mouse.x += (mouse.rawX - mouse.x) * 0.038;
    mouse.y += (mouse.rawY - mouse.y) * 0.038;

    /* Hub */
    const pulse = 1 + Math.sin(t * C.hub.pulseSpeed) * C.hub.pulseAmp;
    hubGroup.scale.setScalar(pulse);
    hubGroup.rotation.y = t * C.hub.rotationSpeed;
    hubGroup.rotation.x = Math.sin(t * 0.22) * 0.07;
    coreMat.emissiveIntensity = C.hub.coreEmissive + Math.sin(t * C.hub.pulseSpeed) * 0.45;
    hubLight.intensity = 8 + Math.sin(t * C.hub.pulseSpeed) * 2.5;
    shell.rotation.y   = -t * 0.18;
    shell.rotation.z   =  t * 0.09;

    /* Decorative rings */
    rings.forEach(({ mesh, cfg }, i) => {
      if (cfg.rotZ) mesh.rotation.z += cfg.rotZ * 0.016; // per-frame delta
      if (cfg.rotY) mesh.rotation.y += cfg.rotY * 0.016;
      // ring 1 also gets a slight X drift
      if (i === 1) mesh.rotation.x = -Math.PI / 4.5 + Math.sin(t * 0.12) * 0.04;
      if (i === 2) mesh.rotation.x = Math.PI / 2.2  + Math.cos(t * 0.09) * 0.03;
    });

    /* Orbital objects */
    orbitals.forEach(({ mesh, cfg }, i) => {
      const angle  = cfg.startAngle + t * cfg.speed;
      const yWave  = Math.sin(t * 0.65 + i * 1.1) * 0.17;
      const yOrbit = Math.sin(angle) * cfg.radius * Math.sin(cfg.tilt);

      mesh.position.x = Math.cos(angle) * cfg.radius;
      mesh.position.z = Math.sin(angle) * cfg.radius;
      mesh.position.y = cfg.yOffset + yWave + yOrbit;

      mesh.rotation.y = -angle + Math.PI * 0.5 + Math.sin(t * 0.28 + i * 0.80) * 0.06;
      mesh.rotation.x = Math.sin(t * 0.32 + i * 0.95) * 0.065;
      mesh.rotation.z = Math.cos(t * 0.38 + i * 1.30) * 0.038;

      // Hover scale lerp
      const isHov = (hoveredOrbital === mesh);
      const sTgt  = isHov ? cfg.scale * C.hoverScale : cfg.scale;
      mesh.scale.lerp(new THREE.Vector3(sTgt, sTgt, sTgt), 0.08);
    });

    /* Particles */
    particleSystems.forEach(({ pts, cfg }) => {
      if (cfg.rotY) pts.rotation.y += cfg.rotY * 0.016;
      if (cfg.rotZ) pts.rotation.z += cfg.rotZ * 0.016;
    });
    particleSystems[0]?.pts && (particleSystems[0].pts.rotation.x =
      Math.sin(t * 0.08) * 0.018);

    /* Grid wave */
    for (let i = 0; i < gridPosAttr.count; i++) {
      const x = gridPosAttr.getX(i);
      const z = gridPosAttr.getZ(i);
      gridPosAttr.setY(i,
        Math.sin(x * 0.38 + t * G.waveSpeedX) * G.waveAmpX +
        Math.cos(z * 0.28 + t * G.waveSpeedZ) * G.waveAmpZ
      );
    }
    gridPosAttr.needsUpdate = true;

    /* Camera parallax */
    const scrollF = Math.min(scrollY / 520, 1.0);
    camera.position.lerp(
      new THREE.Vector3(
        CAM_BASE.x + mouse.x * C.camera.parallaxX,
        CAM_BASE.y + mouse.y * C.camera.parallaxY - scrollF * 0.4,
        CAM_BASE.z + scrollF * C.camera.scrollZoom
      ),
      C.camera.lerpSpeed
    );
    camLookSmooth.lerp(
      new THREE.Vector3(CAM_LOOK.x + mouse.x * 0.18, mouse.y * 0.12, 0),
      C.camera.lerpSpeed
    );
    camera.lookAt(camLookSmooth);

    /* Raycaster hover */
    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(rcTargets);
    hoveredOrbital = hits.length > 0
      ? (meshToOrbital.get(hits[0].object)?.mesh ?? null)
      : null;

    /* Render */
    if (composer) composer.render();
    else          renderer.render(scene, camera);
  }

  syncSize();
  animate();

  /* Return a handle for external control */
  return { scene, camera, renderer, SCENE_CONFIG };
}
