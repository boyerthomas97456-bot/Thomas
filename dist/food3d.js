/* Bibliothèque d'aliments 3D cartoon, construits en code avec Three.js.
   Chaque modèle est un THREE.Group centré, d'environ 1 unité de haut.
   Utilisée pour les icônes des écrans et directement dans les jeux 3D. */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const V2 = (x, y) => new THREE.Vector2(x, y);

/* ---------- Matériaux partagés ---------- */
const matCache = new Map();
export function mat(color, o = {}) {
  const k = color + JSON.stringify(o, (n, v) => (v && v.isTexture ? v.uuid : v));
  if (!matCache.has(k)) {
    matCache.set(k, new THREE.MeshPhysicalMaterial({
      color, roughness: o.r ?? .42, metalness: o.m ?? 0, clearcoat: o.cc ?? .35, clearcoatRoughness: .35,
      transparent: o.op !== undefined, opacity: o.op ?? 1, transmission: o.tr ?? 0, thickness: o.tr ? .5 : 0,
      emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 0, side: o.ds ? THREE.DoubleSide : THREE.FrontSide,
      map: o.map ?? null, bumpMap: o.bump ?? null, bumpScale: o.bs ?? 1, flatShading: !!o.flat
    }));
  }
  return matCache.get(k);
}

/* ---------- Textures dessinées ---------- */
const texCache = new Map();
function canvasTex(key, w, h, draw) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  texCache.set(key, t); return t;
}
const noiseTex = (key, dots, size = 128) => canvasTex('noise' + key, size, size, (x, w, h) => {
  x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < dots; i++) { x.fillStyle = r() > .5 ? '#5a5a5a' : '#a8a8a8'; x.beginPath(); x.arc(r() * w, r() * h, 1 + r() * 2.2, 0, 7); x.fill(); }
});
/* Étiquette générique (sans marque). wrap = 'cyl' ou 'sph' : l'étiquette entoure l'objet,
   le texte est alors centré face à la caméra. */
export function labelTex(key, bg, fg, text, sub = '', icon = '', wrap = null) {
  const W = wrap ? 1024 : 512, cx = W / 2;
  const t = canvasTex('lbl' + key + wrap, W, 256, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(0, 0, w, 24); x.fillRect(0, h - 24, w, 24);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    const maxW = wrap ? 250 : 470, big = text.length > 7 ? 60 : 82;
    x.font = `900 ${big}px "Baloo 2", "Arial Rounded MT Bold", Arial`;
    const tw = Math.min(maxW - (icon ? 70 : 0), x.measureText(text).width);
    const ix = cx - (tw + (icon ? 76 : 0)) / 2;
    if (icon) { x.font = '70px serif'; x.fillText(icon, ix + 34, h / 2 - (sub ? 10 : 0)); }
    x.font = `900 ${big}px "Baloo 2", "Arial Rounded MT Bold", Arial`;
    x.fillText(text, ix + (icon ? 76 : 0) + tw / 2, h / 2 - (sub ? 20 : 0), maxW - (icon ? 70 : 0));
    if (sub) { x.font = '800 32px Arial'; x.fillText(sub, ix + (icon ? 76 : 0) + tw / 2, h / 2 + 48, maxW); }
  });
  if (wrap) { t.wrapS = THREE.RepeatWrapping; t.offset.x = wrap === 'sph' ? .18 : .43; }
  return t;
}

/* ---------- Géométries utiles ---------- */
const geoCache = new Map();
const G = (k, f) => { if (!geoCache.has(k)) geoCache.set(k, f()); return geoCache.get(k); };
const sph = (r = .5, w = 32, h = 24) => G(`s${r}${w}${h}`, () => new THREE.SphereGeometry(r, w, h));
const cyl = (rt, rb, h, n = 32, open = false) => G(`c${rt}${rb}${h}${n}${open}`, () => new THREE.CylinderGeometry(rt, rb, h, n, 1, open));
const cone = (r, h, n = 24) => G(`k${r}${h}${n}`, () => new THREE.ConeGeometry(r, h, n));
const tor = (r, t, a = 16, b = 40) => G(`t${r}${t}${a}${b}`, () => new THREE.TorusGeometry(r, t, a, b));
const rbox = (w, h, d, r = .06) => G(`b${w}${h}${d}${r}`, () => new RoundedBoxGeometry(w, h, d, 4, r));
const lathe = (k, pts, n = 40) => G('l' + k, () => {
  /* Profil lissé pour des formes rondes et douces. */
  const smooth = new THREE.SplineCurve(pts.map(p => V2(p[0], p[1]))).getPoints(Math.max(24, pts.length * 8)).map(p => V2(Math.max(0, p.x), p.y));
  return new THREE.LatheGeometry(smooth, n);
});
/* Tube effilé le long d'une courbe : banane, carotte, frites, saucisse… */
function taper(k, points, radius, seg = 40, radial = 16, closed = true) {
  return G('tp' + k, () => {
    const curve = new THREE.CatmullRomCurve3(points), frames = curve.computeFrenetFrames(seg, false);
    const pos = [], idx = [];
    for (let i = 0; i <= seg; i++) {
      const t = i / seg, p = curve.getPointAt(t), r = radius(t), N = frames.normals[i], B = frames.binormals[i];
      for (let j = 0; j <= radial; j++) {
        const a = j / radial * Math.PI * 2;
        pos.push(p.x + r * (Math.cos(a) * N.x + Math.sin(a) * B.x), p.y + r * (Math.cos(a) * N.y + Math.sin(a) * B.y), p.z + r * (Math.cos(a) * N.z + Math.sin(a) * B.z));
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  });
}

/* ---------- Petit outil de construction ---------- */
function kit() {
  const g = new THREE.Group();
  const put = (geo, m, x = 0, y = 0, z = 0, o = {}) => {
    const q = new THREE.Mesh(geo, m); q.position.set(x, y, z);
    if (o.s) Array.isArray(o.s) ? q.scale.set(...o.s) : q.scale.setScalar(o.s);
    if (o.r) q.rotation.set(...o.r);
    q.castShadow = true; q.receiveShadow = true; (o.p || g).add(q); return q;
  };
  return { g, put };
}
const C = {
  red: 0xe8343a, red2: 0xc81f2c, green: 0x58b947, leaf: 0x2f9a3e, dleaf: 0x1f7a33, lime: 0xa6d84a, yellow: 0xffd23f,
  banana: 0xffd84a, orange: 0xff8a1c, brown: 0x8a5230, wood: 0xb97a45, cream: 0xfff3dc, white: 0xffffff, bone: 0xf6efe0,
  pink: 0xff7aa8, purple: 0x8b4fc4, blue: 0x2f8be0, sky: 0x8fd3ff, navy: 0x203a72, choco: 0x5b3420, crust: 0xd9963f,
  gold: 0xe9a93a, grey: 0xb9c3c9, metal: 0xd7dde2, black: 0x2a2f36, beige: 0xe8cf9e, rice: 0xfffaf0, salmon: 0xff8f6b
};

/* ---------- Modèles ---------- */
function appleLike(col, k = 'apple') {
  const { g, put } = kit();
  put(lathe(k, [[0, -.46], [.22, -.47], [.42, -.33], [.5, -.05], [.46, .22], [.3, .38], [.1, .36], [0, .3]]), mat(col, { cc: .8, r: .3 }));
  put(cyl(.025, .04, .26, 8), mat(C.brown), .02, .42, 0, { r: [0, 0, -.25] });
  put(sph(.14, 16, 10), mat(C.leaf), .15, .46, 0, { s: [1.3, .3, .65], r: [0, .3, .5] });
  put(sph(.08, 12, 8), mat(0xffffff, { op: .45 }), -.2, .15, .38, { s: [1, 1.4, .4] });
  return g;
}
function pear() {
  const { g, put } = kit();
  put(lathe('pear', [[0, -.5], [.25, -.49], [.4, -.32], [.4, -.1], [.27, .1], [.17, .28], [.12, .4], [0, .44]]), mat(0xc9d64b, { cc: .6 }));
  put(cyl(.025, .035, .22, 8), mat(C.brown), 0, .52, 0, { r: [0, 0, .3] });
  put(sph(.12, 16, 10), mat(C.leaf), .12, .55, 0, { s: [1.3, .3, .6], r: [0, 0, .4] });
  return g;
}
function banana() {
  const { g, put } = kit();
  const pts = [V(-.55, .25), V(-.35, -.05), V(0, -.2), V(.35, -.08), V(.56, .22)];
  const body = put(taper('banana', pts, t => .05 + .13 * Math.pow(Math.sin(Math.PI * t), .6), 40, 6), mat(C.banana, { cc: .5 }));
  body.rotation.x = .3;
  put(cyl(.035, .045, .14, 8), mat(0x6b4b22), -.6, .32, .07, { r: [0, 0, .5] });
  put(sph(.04, 8, 6), mat(0x4a3216), .6, .27, .07);
  const b2 = put(taper('banana', pts, t => .05 + .13 * Math.pow(Math.sin(Math.PI * t), .6), 40, 6), mat(0xffc72e, { cc: .5 }), 0, .12, -.18);
  b2.rotation.set(.1, .15, .12);
  return g;
}
function strawberry() {
  const { g, put } = kit();
  put(lathe('straw', [[0, -.5], [.12, -.44], [.3, -.2], [.42, .1], [.4, .27], [.25, .34], [0, .33]]), mat(C.red, { cc: .9, r: .28 }));
  const seed = mat(0xffe27a);
  const prof = [[-.5, 0], [-.44, .12], [-.2, .3], [.1, .42], [.27, .4]], rAt = y => {
    for (let i = 1; i < prof.length; i++) if (y <= prof[i][0]) { const [y0, r0] = prof[i - 1], [y1, r1] = prof[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); }
    return .4;
  };
  for (let i = 0; i < 54; i++) {
    const y = -.42 + (i / 54) * .64, a = i * 2.39996, rr = rAt(y) * 1.01;
    const q = put(sph(.022, 6, 5), seed, Math.cos(a) * rr, y, Math.sin(a) * rr, { s: [1, 1.5, 1] });
    q.lookAt(Math.cos(a) * 2, y, Math.sin(a) * 2);
  }
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; put(cone(.07, .3, 6), mat(C.leaf), Math.cos(a) * .14, .36, Math.sin(a) * .14, { r: [Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2], s: [1, 1, .35] }); }
  put(cyl(.025, .03, .16, 6), mat(C.dleaf), 0, .45, 0);
  return g;
}
function citrus(col, k) {
  const { g, put } = kit();
  put(sph(.46, 40, 30), mat(col, { bump: noiseTex(k, 900), bs: .9, r: .5, cc: .4 }), 0, 0, 0, { s: [1, .94, 1] });
  put(cyl(.03, .04, .08, 8), mat(C.dleaf), 0, .44, 0);
  put(sph(.13, 16, 10), mat(C.leaf), .13, .47, 0, { s: [1.3, .28, .6], r: [0, 0, .3] });
  return g;
}
function tomato() {
  const { g, put } = kit();
  put(sph(.46, 40, 30), mat(0xf0322f, { cc: 1, r: .2 }), 0, 0, 0, { s: [1.08, .82, 1.08] });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; put(sph(.1, 10, 6), mat(C.leaf), Math.cos(a) * .12, .36, Math.sin(a) * .12, { s: [1.6, .25, .55], r: [0, -a, 0] }); }
  put(cyl(.025, .03, .12, 6), mat(C.leaf), 0, .42, 0);
  return g;
}
function grapes() {
  const { g, put } = kit();
  const m = mat(C.purple, { cc: 1, r: .25 });
  const rows = [[0, .25, 4, .3], [0, .02, 4, .25], [0, -.2, 3, .18], [0, -.38, 1, 0]];
  rows.forEach(([, y, n, r]) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + y; put(sph(.15, 20, 14), m, Math.cos(a) * r, y, Math.sin(a) * r); } });
  put(cyl(.025, .03, .25, 6), mat(C.brown), 0, .48, 0, { r: [0, 0, .2] });
  put(sph(.14, 14, 8), mat(C.leaf), .16, .5, 0, { s: [1.4, .25, .8] });
  return g;
}
function broccoli() {
  const { g, put } = kit();
  put(cyl(.12, .17, .5, 16), mat(0x9ccf5a), 0, -.25, 0);
  for (const [x, z, r] of [[-.17, 0, .09], [.17, .02, .09], [0, .14, .08]]) put(cyl(.05, .08, .3, 10), mat(0x9ccf5a), x * .7, .02, z * .7, { r: [z * 2, 0, -x * 3] });
  const m = mat(0x2e8b3a, { bump: noiseTex('broc', 1400), bs: 2, r: .7, cc: .1 });
  const pts = [];
  for (let i = 0; i < 26; i++) { const a = i * 2.4, rr = .08 + (i / 26) * .3, y = .32 - (i / 26) * .18; pts.push([Math.cos(a) * rr, y, Math.sin(a) * rr]); }
  pts.forEach(([x, y, z], i) => put(sph(.13 + (i % 3) * .02, 16, 12), m, x, y, z));
  return g;
}
function carrot() {
  const { g, put } = kit();
  put(taper('carrot', [V(0, .32), V(0, 0), V(0, -.55)], t => .17 * (1 - t * .92) + .01, 30, 20), mat(C.orange, { cc: .4 }));
  for (let i = 0; i < 4; i++) put(tor(.12 - i * .025, .008, 6, 24), mat(0xe06d10), 0, .15 - i * .17, 0, { r: [Math.PI / 2, 0, 0] });
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; put(cone(.05, .42, 6), mat(C.leaf), Math.cos(a) * .05, .52, Math.sin(a) * .05, { r: [Math.sin(a) * .35, 0, -Math.cos(a) * .35] }); }
  g.rotation.z = -.5;
  return g;
}
function lettuce() {
  const { g, put } = kit();
  const m1 = mat(0x7fcf4a, { r: .6, bump: noiseTex('let', 500), bs: 1.5 }), m2 = mat(0xb8e46a, { r: .6 });
  put(sph(.36, 28, 20), m2, 0, -.05, 0, { s: [1, .9, 1] });
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; put(sph(.28, 20, 14), m1, Math.cos(a) * .2, -.05 + (i % 2) * .06, Math.sin(a) * .2, { s: [.7, 1.1, .3], r: [0, -a + Math.PI / 2, (i % 2 ? .4 : -.3)] }); }
  return g;
}
function greenBeans() {
  const { g, put } = kit();
  const m = mat(0x4fae3b, { cc: .5 });
  for (let i = 0; i < 6; i++) {
    const pts = [V(-.5, 0), V(-.15, .06 + (i % 2) * .05), V(.2, -.03), V(.5, .05)];
    put(taper('bean' + (i % 2), pts, t => .05 * Math.sqrt(Math.sin(Math.PI * t)) + .008, 24, 8), m, 0, (i - 2.5) * .09, (i % 3 - 1) * .08, { r: [0, 0, (i - 2.5) * .1] });
  }
  return g;
}
function pepper() {
  const { g, put } = kit();
  const m = mat(0x3daa3a, { cc: 1, r: .2 });
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; put(sph(.26, 24, 18), m, Math.cos(a) * .14, -.05, Math.sin(a) * .14, { s: [1, 1.5, 1] }); }
  put(cyl(.06, .05, .2, 8), mat(0x2b7a28), 0, .42, 0, { r: [0, 0, .3] });
  return g;
}
function corn() {
  const { g, put } = kit();
  put(sph(.24, 24, 20), mat(0xffd84a, { bump: noiseTex('corn', 1800, 256), bs: 3, cc: .6 }), 0, .02, 0, { s: [1, 2.1, 1] });
  for (const a of [0, 2.2, 4.2]) put(sph(.22, 16, 12), mat(C.green, { ds: true }), Math.cos(a) * .12, -.18, Math.sin(a) * .12, { s: [.5, 1.9, .2], r: [Math.sin(a) * .3, -a, Math.cos(a) * .3] });
  g.rotation.z = -.4;
  return g;
}
function potato() {
  const { g, put } = kit();
  put(sph(.4, 30, 22), mat(0xc49a5c, { bump: noiseTex('pot', 300), bs: 2, r: .75, cc: .05 }), 0, 0, 0, { s: [1.3, .8, .9] });
  for (const [x, y, z] of [[.2, .15, .25], [-.25, .05, .3], [.05, -.1, .34]]) put(sph(.03, 6, 4), mat(0x8a6534), x, y, z);
  return g;
}
function avocado() {
  const { g, put } = kit();
  const shell = put(lathe('avo', [[0, -.48], [.3, -.42], [.38, -.15], [.3, .2], [.16, .45], [0, .5]]), mat(0x2d5a1f, { bump: noiseTex('avo', 700), bs: 1.5, r: .7 }));
  shell.scale.z = .55; shell.position.z = -.08;
  put(lathe('avoflesh', [[0, -.43], [.27, -.38], [.34, -.13], [.27, .18], [.14, .41], [0, .45]]), mat(0xd9ec7a, { r: .5 }), 0, 0, .02, { s: [1, 1, .14] });
  put(sph(.15, 24, 18), mat(0x8a4f22, { cc: .8 }), 0, -.13, .07, { s: [1, 1.1, .7] });
  return g;
}
function bottle(k, glassCol, liquidCol, capCol, label, o = {}) {
  const { g, put } = kit();
  const prof = o.tall ? [[0, -.55], [.2, -.55], [.22, -.5], [.22, .12], [.14, .3], [.09, .42], [.09, .5], [0, .5]] : [[0, -.5], [.26, -.5], [.28, -.44], [.28, .08], [.18, .26], [.11, .36], [.11, .45], [0, .45]];
  put(lathe('bt' + (o.tall ? 't' : ''), prof), mat(glassCol, { op: o.op ?? .55, r: .08, cc: 1 }));
  if (liquidCol) put(lathe('btl' + (o.tall ? 't' : ''), prof.map(([x, y]) => [x * .9, Math.min(y, o.fill ?? .1)])), mat(liquidCol, { op: .85, r: .2 }));
  put(cyl(.115, .115, .12, 20), mat(capCol, { cc: .6 }), 0, (o.tall ? .55 : .5), 0);
  if (label) put(cyl(o.tall ? .224 : .284, o.tall ? .224 : .284, .32, 40, true), mat(0xffffff, { map: label, ds: true }), 0, -.2, 0);
  return g;
}
function can(k, label, o = {}) {
  const { g, put } = kit();
  const h = o.h ?? .9, r = o.r ?? .3;
  put(lathe('can' + h + r, [[0, -h / 2], [r * .85, -h / 2], [r, -h / 2 + .06], [r, h / 2 - .1], [r * .82, h / 2], [0, h / 2]]), mat(o.col ?? 0xffffff, { map: label, m: .2, r: .3, cc: .8 }));
  put(cyl(r * .82, r * .82, .02, 32), mat(C.metal, { m: .8, r: .25 }), 0, h / 2, 0);
  if (o.tab) put(rbox(.12, .02, .2, .01), mat(C.metal, { m: .8 }), 0, h / 2 + .015, .05);
  return g;
}
function chicken() {
  const { g, put } = kit();
  put(sph(.32, 30, 22), mat(0xc6742e, { bump: noiseTex('chk', 600), bs: 1.5, cc: .7, r: .35 }), -.12, 0, 0, { s: [1.25, 1, 1] });
  put(cyl(.06, .07, .45, 12), mat(C.bone), .32, .12, 0, { r: [0, 0, -1.1] });
  put(sph(.075, 12, 10), mat(C.bone), .52, .24, .05); put(sph(.075, 12, 10), mat(C.bone), .54, .2, -.06);
  return g;
}
function nuggets() {
  const { g, put } = kit();
  const m = mat(0xe3a54a, { bump: noiseTex('nug', 900), bs: 2.5, r: .65 });
  [[-.25, 0, 0, .2], [.18, .02, .08, -.4], [0, .14, -.15, .6], [.05, -.02, .28, .1]].forEach(([x, y, z, r]) => put(sph(.24, 20, 14), m, x, y, z, { s: [1.2, .55, .9], r: [0, r, .1] }));
  return g;
}
function fish(col, belly, k) {
  const { g, put } = kit();
  put(sph(.36, 32, 24), mat(col, { cc: 1, r: .25, m: .15 }), 0, 0, 0, { s: [1.5, .8, .6] });
  put(sph(.3, 24, 16), mat(belly, { cc: 1, r: .3 }), .02, -.1, 0, { s: [1.5, .45, .55] });
  put(cone(.26, .36, 4), mat(col, { cc: .8 }), -.64, 0, 0, { r: [0, 0, Math.PI / 2], s: [1, 1, .25] });
  put(cone(.14, .24, 3), mat(col), 0, .3, 0, { s: [1.3, 1, .2] });
  put(sph(.07, 14, 10), mat(0xffffff), .36, .07, .17); put(sph(.04, 10, 8), mat(C.black), .39, .07, .2);
  return g;
}
function egg() {
  const { g, put } = kit();
  put(lathe('egg', [[0, -.46], [.24, -.42], [.34, -.2], [.32, .08], [.22, .3], [0, .4]]), mat(0xf3d2a8, { cc: .5, r: .35 }));
  return g;
}
function bowl(k, col, fill) {
  const { g, put } = kit();
  put(lathe('bowl', [[0, -.32], [.25, -.32], [.32, -.26], [.48, -.05], [.52, .12], [.48, .12], [.44, -.02], [.3, -.22], [0, -.24]]), mat(col, { cc: .9, r: .2, ds: true }));
  fill(put);
  return g;
}
function riceBowl(brown) {
  return bowl('rice', brown ? 0x6b8f5a : 0x3b7fd0, put => {
    put(sph(.46, 32, 16), mat(brown ? 0xd8b98a : C.rice, { bump: noiseTex('rice', 2600, 256), bs: 3, r: .6 }), 0, .02, 0, { s: [1, .42, 1] });
    if (!brown) put(rbox(.1, .02, .06, .01), mat(C.leaf), .12, .2, .1);
  });
}
function oats() {
  return bowl('oats', 0xf2a640, put => {
    put(sph(.46, 32, 16), mat(0xf4e3c3, { r: .6 }), 0, .02, 0, { s: [1, .38, 1] });
    for (let i = 0; i < 26; i++) { const a = i * 2.4, r = Math.sqrt(i / 26) * .38; put(sph(.07, 8, 6), mat(0xd8b170, { r: .8 }), Math.cos(a) * r, .17 - r * .12, Math.sin(a) * r, { s: [1, .3, .8], r: [i, i, 0] }); }
  });
}
function lentils() {
  return bowl('lent', 0xe86f3a, put => {
    put(sph(.46, 32, 16), mat(0x7a4a26, { r: .6 }), 0, .02, 0, { s: [1, .38, 1] });
    for (let i = 0; i < 40; i++) { const a = i * 2.4, r = Math.sqrt(i / 40) * .4; put(sph(.05, 8, 6), mat(i % 3 ? 0xa0582c : 0xc77a3a, { cc: .6 }), Math.cos(a) * r, .17 - r * .1, Math.sin(a) * r, { s: [1, .5, 1] }); }
  });
}
function pasta() {
  const { g, put } = kit();
  put(cyl(.6, .45, .08, 40), mat(0xffffff, { cc: 1, r: .15 }), 0, -.25, 0);
  const m = mat(0xf6d47a, { r: .4 });
  for (let i = 0; i < 9; i++) put(tor(.16 + (i % 3) * .07, .03, 8, 30), m, Math.cos(i) * .08, -.12 + (i % 4) * .04, Math.sin(i) * .08, { r: [Math.PI / 2 + Math.sin(i) * .3, i, 0] });
  put(sph(.2, 20, 14), mat(0xd8321e, { cc: .8, r: .3 }), 0, .02, 0, { s: [1.3, .5, 1.3] });
  put(sph(.06, 10, 8), mat(C.leaf), .06, .1, .05, { s: [1.5, .3, 1] });
  return g;
}
function noodleCup() {
  const { g, put } = kit();
  put(cyl(.4, .3, .7, 32), mat(0xffffff, { map: labelTex('nood', '#ff7a2f', '#fff', 'NOUILLES', 'instantanées', '', 'cyl') }), 0, -.08, 0);
  put(cyl(.38, .38, .04, 32), mat(0xf6d47a, { bump: noiseTex('nd', 1200), bs: 3 }), 0, .26, 0);
  put(cyl(.36, .36, .015, 32), mat(0xf2f5f7, { m: .15, r: .35 }), .1, .38, -.05, { r: [-.9, 0, .2] });
  return g;
}
function bread() {
  const { g, put } = kit();
  put(taper('bag', [V(-.62, -.05), V(0, .05), V(.62, -.05)], t => .2 * Math.pow(Math.sin(Math.PI * t), .35) + .02, 40, 20), mat(C.crust, { bump: noiseTex('br', 500), bs: 1, r: .55, cc: .2 }), 0, 0, 0, { s: [1, 1, 1.1] });
  for (let i = 0; i < 4; i++) put(sph(.08, 12, 8), mat(0xf5d7a0, { r: .7 }), -.36 + i * .24, .2 - Math.abs(i - 1.5) * .02, 0, { s: [1.6, .25, .7], r: [0, .5, 0] });
  g.rotation.z = .2;
  return g;
}
function milkCarton() {
  const { g, put } = kit();
  const lbl = labelTex('milk', '#ffffff', '#2f7fd8', 'LAIT', 'demi-écrémé', '🥛');
  put(rbox(.5, .7, .5, .04), [mat(0xffffff, { map: lbl }), mat(0xffffff, { map: lbl }), mat(0x5aa7f0), mat(0x5aa7f0), mat(0xffffff, { map: lbl }), mat(0xffffff, { map: lbl })], 0, -.12, 0);
  const roof = put(cyl(.0, .36, .26, 4), mat(0x5aa7f0, { cc: .5 }), 0, .36, 0, { r: [0, Math.PI / 4, 0], s: [1, 1, 1] });
  roof.scale.set(1, 1, 1);
  put(cyl(.06, .06, .06, 16), mat(0xffffff), .1, .45, .05);
  return g;
}
function cheeseWedge() {
  const { g, put } = kit();
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(.9, 0); shape.lineTo(0, .5); shape.lineTo(0, 0);
  const geo = G('wedge', () => { const q = new THREE.ExtrudeGeometry(shape, { depth: .42, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 3 }); q.center(); return q; });
  put(geo, mat(0xffc93a, { cc: .4, r: .45 }), 0, 0, 0, { r: [0, -.5, 0] });
  for (const [x, y, z] of [[.05, -.05, .24], [-.2, .1, .21], [.22, -.12, .1]]) put(sph(.06, 12, 10), mat(0xe2a21d), x, y, z, { s: [1, 1, .4] });
  return g;
}
function babybel() {
  const { g, put } = kit();
  put(sph(.4, 32, 24), mat(0xe1262c, { cc: 1, r: .2 }), 0, 0, 0, { s: [1, .62, 1] });
  put(tor(.4, .03, 8, 40), mat(0xf6f0e6), 0, 0, 0, { r: [0, .4, Math.PI / 2] });
  return g;
}
function yogurt(lidCol = 0x3b82d6, txt = 'NATURE', bodyCol = '#ffffff', fg = '#3b82d6') {
  const { g, put } = kit();
  put(cyl(.36, .28, .6, 36), mat(0xffffff, { map: labelTex('yo' + txt, bodyCol, fg, txt, 'yaourt', '', 'cyl') }), 0, -.1, 0);
  put(cyl(.39, .39, .03, 36), mat(lidCol, { m: .4, r: .3 }), 0, .21, 0);
  return g;
}
function yopBottle() { return bottle('yop', 0xffffff, 0xff9fc0, 0xff5f97, labelTex('yop', '#ff8fb6', '#fff', 'FRAISE', 'à boire', '', 'cyl'), { op: .95, fill: .3 }); }
function flan(choco) {
  const { g, put } = kit();
  put(lathe('flan', [[0, -.32], [.42, -.32], [.36, .12], [.3, .2], [0, .2]]), mat(choco ? 0x6a3a22 : 0xf6d27a, { cc: .9, r: .2 }));
  put(cyl(.3, .3, .05, 32), mat(choco ? 0x4a2614 : 0xb5651d, { cc: 1, r: .1 }), 0, .21, 0);
  put(cyl(.6, .55, .05, 40), mat(0xffffff, { cc: 1 }), 0, -.35, 0);
  return g;
}
function water() { return bottle('water', 0xbfe7ff, 0xd9f2ff, 0x2f8be0, labelTex('eau', '#2f8be0', '#fff', 'EAU', 'plate', '💧', 'cyl'), { tall: true, op: .45, fill: .3 }); }
function sparkling() { return bottle('perrier', 0x3fae5a, 0x8fd99b, 0xcfd8dc, labelTex('pet', '#f4f1d0', '#2c7a3c', 'EAU', 'gazeuse', '🫧', 'cyl'), { tall: true, op: .7, fill: .3 }); }
function sodaCan(zero) { return can('soda', labelTex(zero ? 'sodaz' : 'soda', zero ? '#22262b' : '#e3262f', '#fff', 'SODA', zero ? 'zéro sucre' : 'cola', '', 'cyl'), { tab: true }); }
function energyCan() { return can('energy', labelTex('nrj', '#1d3c8f', '#ffe13a', 'ÉNERGIE', 'boisson', '⚡', 'cyl'), { tab: true, h: 1, r: .24 }); }
function juiceBox(col = '#ff9a1f', txt = 'JUS') {
  const { g, put } = kit();
  const l = labelTex('jb' + txt + col, col, '#fff', txt, 'de fruits', '🍊');
  put(rbox(.5, .78, .32, .04), [mat(0xffffff, { map: l }), mat(0xffffff, { map: l }), mat(0xffe1b0), mat(0xffe1b0), mat(0xffffff, { map: l }), mat(0xffffff, { map: l })]);
  put(cyl(.025, .025, .45, 8), mat(0xff5f97), .1, .5, 0, { r: [0, 0, -.35] });
  return g;
}
function teaCup() {
  const { g, put } = kit();
  put(lathe('cup', [[0, -.3], [.3, -.3], [.38, .15], [.36, .16], [.27, -.26], [0, -.26]]), mat(0x8fd19e, { cc: 1, ds: true }));
  put(cyl(.35, .35, .02, 32), mat(0xc9e07a, { op: .9 }), 0, .1, 0);
  put(tor(.11, .035, 10, 24), mat(0x8fd19e, { cc: 1 }), .41, -.06, 0);
  put(cyl(.55, .5, .04, 40), mat(0xffffff, { cc: 1 }), 0, -.32, 0);
  return g;
}
function bubbleTea() {
  const { g, put } = kit();
  put(cyl(.33, .26, .85, 32), mat(0xf3d9b5, { op: .9, cc: 1, r: .15 }), 0, -.05, 0);
  for (let i = 0; i < 12; i++) put(sph(.06, 10, 8), mat(0x3a2418, { cc: 1 }), Math.cos(i * 2.1) * .17, -.4 + (i % 3) * .06, Math.sin(i * 2.1) * .17);
  put(sph(.34, 24, 12), mat(0xffffff, { op: .6 }), 0, .38, 0, { s: [1, .3, 1] });
  put(cyl(.035, .035, .6, 10), mat(0xff6fa0), .06, .58, 0, { r: [0, 0, -.15] });
  return g;
}
function cookie() {
  const { g, put } = kit();
  put(cyl(.46, .44, .14, 40), mat(0xd9a05b, { bump: noiseTex('ck', 500), bs: 2, r: .7 }));
  for (let i = 0; i < 9; i++) { const a = i * 2.3, r = .08 + (i % 3) * .12; put(sph(.055, 10, 8), mat(C.choco, { cc: .7 }), Math.cos(a) * r, .08, Math.sin(a) * r, { s: [1, .7, 1] }); }
  g.rotation.x = .75;
  return g;
}
function sandwichCookie() {
  const { g, put } = kit();
  for (const y of [-.12, .12]) put(cyl(.4, .4, .13, 40), mat(0x4a2a1c, { bump: noiseTex('oreo', 300), bs: 1.5, r: .6 }), 0, y, 0);
  put(cyl(.37, .37, .12, 40), mat(0xfff7ea), 0, 0, 0);
  g.rotation.x = .9;
  return g;
}
function candy() {
  const { g, put } = kit();
  const cols = [0xff4f8b, 0x41c3ff, 0xffd23f];
  cols.forEach((c, i) => {
    const x = (i - 1) * .32, y = i === 1 ? .16 : -.06, z = i === 1 ? -.1 : .05;
    put(sph(.2, 24, 18), mat(c, { cc: 1, r: .15 }), x, y, z, { s: [1.2, 1, 1] });
    put(cone(.12, .18, 8), mat(c, { cc: .6 }), x - .27, y, z, { r: [0, 0, -Math.PI / 2] });
    put(cone(.12, .18, 8), mat(c, { cc: .6 }), x + .27, y, z, { r: [0, 0, Math.PI / 2] });
  });
  return g;
}
function chocoBar() {
  const { g, put } = kit();
  put(rbox(.95, .5, .1, .03), mat(0x1d5fbf, { map: labelTex('choc', '#7a3dc4', '#fff', 'CHOCO', 'barre') }), 0, -.1, 0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) put(rbox(.13, .13, .07, .02), mat(C.choco, { cc: .9, r: .2 }), -.15 + i * .15, .25 + j * .15, .02);
  put(rbox(.48, .32, .06, .02), mat(C.choco, { cc: .8 }), 0, .32, -.01);
  g.rotation.z = .25;
  return g;
}
function cakeSlice() {
  const { g, put } = kit();
  const shape = new THREE.Shape(); shape.moveTo(0, 0); shape.lineTo(.8, -.35); shape.lineTo(.8, .35); shape.lineTo(0, 0);
  const geo = G('cake', () => { const q = new THREE.ExtrudeGeometry(shape, { depth: .26, bevelEnabled: true, bevelSize: .03, bevelThickness: .03 }); q.rotateX(-Math.PI / 2); q.center(); return q; });
  put(geo, mat(0xffe6b8, { r: .6 }), 0, -.15, 0, { r: [0, .6, 0] });
  put(geo, mat(0xfff8f2, { r: .4 }), 0, .02, 0, { r: [0, .6, 0], s: [1.02, .35, 1.02] });
  put(geo, mat(0x6b3a22, { r: .4 }), 0, .14, 0, { r: [0, .6, 0], s: [1.03, .3, 1.03] });
  put(sph(.1, 16, 12), mat(C.red, { cc: 1 }), .08, .28, 0, { s: [1, 1.2, 1] });
  return g;
}
function donut() {
  const { g, put } = kit();
  put(tor(.3, .16, 24, 48), mat(0xe2a35e, { r: .6 }), 0, 0, 0, { r: [Math.PI / 2, 0, 0] });
  put(tor(.3, .155, 24, 48), mat(0xff7ab6, { cc: 1, r: .2 }), 0, .06, 0, { r: [Math.PI / 2, 0, 0], s: [1.02, 1.02, .6] });
  const cols = [0xffffff, 0x41c3ff, 0xffd23f, 0x7ad65a];
  for (let i = 0; i < 22; i++) { const a = i * 2.39, r = .22 + (i % 3) * .07; put(cyl(.012, .012, .07, 6), mat(cols[i % 4]), Math.cos(a) * r, .17, Math.sin(a) * r, { r: [Math.PI / 2, 0, a] }); }
  g.rotation.x = .5;
  return g;
}
function chips() {
  const { g, put } = kit();
  put(cyl(.24, .24, .95, 32), mat(0xffffff, { map: labelTex('chips', '#e8342f', '#ffe13a', 'CHIPS', 'tuile', '', 'cyl') }), 0, -.05, 0, {});
  put(cyl(.25, .25, .06, 32), mat(0xffd23f), 0, .45, 0);
  put(sph(.15, 16, 8), mat(0xf6c35a, { r: .6 }), .02, .52, 0, { s: [1.2, .2, .8], r: [.3, 0, .2] });
  return g;
}
function bagChips() {
  const { g, put } = kit();
  put(sph(.45, 32, 24), mat(0xffffff, { map: labelTex('chipbag', '#ffcf2e', '#e8342f', 'CHIPS', 'nature', '', 'sph') }), 0, 0, 0, { s: [1, 1.15, .45] });
  return g;
}
function burger() {
  const { g, put } = kit();
  put(cyl(.44, .4, .14, 40), mat(0xe2a44f, { r: .5 }), 0, -.3, 0);
  put(cyl(.46, .46, .12, 40), mat(0x5e331d, { bump: noiseTex('patty', 600), bs: 2, r: .7 }), 0, -.15, 0);
  put(rbox(.78, .03, .78, .01), mat(0xffc72e), 0, -.07, 0, { r: [0, .4, 0] });
  put(cyl(.48, .48, .04, 20), mat(0x6fcf4b, { r: .6 }), 0, -.02, 0, { s: [1, 1, 1] });
  put(cyl(.36, .36, .05, 24), mat(0xe8342f, { cc: .8 }), 0, .02, 0);
  put(sph(.46, 36, 20), mat(0xe9a64e, { cc: .6, r: .35 }), 0, .04, 0, { s: [1, .55, 1] });
  for (let i = 0; i < 14; i++) { const a = i * 2.4, r = .1 + (i % 4) * .08; put(sph(.025, 6, 4), mat(0xfff3d6), Math.cos(a) * r, .26 - r * .2, Math.sin(a) * r, { s: [1.4, .6, 1] }); }
  return g;
}
function fries() {
  const { g, put } = kit();
  for (let i = 0; i < 11; i++) put(rbox(.08, .6, .08, .02), mat(0xffcf45, { r: .5 }), (i % 6 - 2.5) * .085, .12 + (i % 3) * .05, (i < 6 ? .03 : -.06), { r: [0, 0, (i % 5 - 2) * .07] });
  put(lathe('fbox', [[.26, -.45], [.38, .12], [.36, .12], [.24, -.42]], 4), mat(0xe8342f, { cc: .6, ds: true }), 0, 0, 0, { r: [0, Math.PI / 4, 0], s: [1.15, 1, .75] });
  put(cyl(.25, .37, .55, 4, true), mat(0xe8342f, { ds: true }), 0, -.17, 0, { r: [0, Math.PI / 4, 0], s: [1.15, 1, .75] });
  return g;
}
function pizza() {
  const { g, put } = kit();
  const shape = new THREE.Shape(); shape.moveTo(0, -.55); shape.lineTo(.45, .4); shape.quadraticCurveTo(0, .55, -.45, .4); shape.lineTo(0, -.55);
  const geo = G('pizza', () => { const q = new THREE.ExtrudeGeometry(shape, { depth: .06, bevelEnabled: true, bevelSize: .02, bevelThickness: .02 }); q.center(); return q; });
  put(geo, mat(0xffc94a, { r: .5 }), 0, 0, 0);
  put(taper('crust', [V(-.46, .4), V(0, .53), V(.46, .4)], () => .07, 20, 12), mat(0xd9913a, { r: .6 }), 0, -.04, .03);
  for (const [x, y] of [[0, .15], [-.15, .3], [.17, .28], [0, -.15]]) put(cyl(.09, .09, .03, 20), mat(0xc8352a, { cc: .6 }), x, y - .05, .07, { r: [Math.PI / 2, 0, 0] });
  g.rotation.x = -.6;
  return g;
}
function hotdog() {
  const { g, put } = kit();
  put(taper('bun', [V(-.55, 0), V(0, 0), V(.55, 0)], t => .17 * Math.pow(Math.sin(Math.PI * t), .3) + .03, 30, 16), mat(0xe9a64e, { r: .5 }), 0, -.05, .1, { s: [1, .9, 1.3] });
  put(taper('bun', [V(-.55, 0), V(0, 0), V(.55, 0)], t => .17 * Math.pow(Math.sin(Math.PI * t), .3) + .03, 30, 16), mat(0xe9a64e, { r: .5 }), 0, -.05, -.12, { s: [1, .9, 1.3] });
  put(taper('saus', [V(-.62, 0), V(0, .02), V(.62, 0)], t => .11 * Math.pow(Math.sin(Math.PI * t), .25) + .02, 30, 16), mat(0xc0442a, { cc: 1, r: .25 }), 0, .08, 0);
  put(taper('must', [V(-.4, .02), V(-.2, .06), V(0, .02), V(.2, .06), V(.4, .02)], () => .025, 30, 8), mat(0xffd23f), 0, .17, 0);
  return g;
}
function salt() {
  const { g, put } = kit();
  put(lathe('salt', [[0, -.42], [.25, -.42], [.28, -.35], [.22, .1], [.2, .25], [0, .25]]), mat(0xf5fbff, { op: .7, cc: 1, r: .1 }));
  put(sph(.2, 24, 12), mat(C.metal, { m: .8, r: .25 }), 0, .23, 0, { s: [1.05, .8, 1.05] });
  for (let i = 0; i < 5; i++) put(sph(.018, 6, 4), mat(C.black), Math.cos(i * 1.25) * .08, .38, Math.sin(i * 1.25) * .08);
  return g;
}
function sugar() {
  const { g, put } = kit();
  const m = mat(0xffffff, { bump: noiseTex('sug', 1500), bs: 2, r: .8, cc: .2 });
  [[-.2, -.18, 0], [.2, -.18, .05], [0, .2, 0], [-.05, -.18, -.35]].forEach(([x, y, z], i) => put(rbox(.36, .36, .36, .04), m, x, y, z, { r: [0, i * .4, 0] }));
  return g;
}
function butter() {
  const { g, put } = kit();
  put(rbox(1, .06, .66, .02), mat(0xdfe6ea, { m: .7, r: .3 }), 0, -.24, 0);
  put(rbox(.82, .36, .5, .05), mat(0xffe27a, { cc: .6, r: .35 }), 0, -.02, 0);
  return g;
}
function oilBottle() {
  const { g, put } = kit();
  const b = bottle('oil', 0xd8e86a, 0xc9c22a, 0x2f6a2a, labelTex('oil', '#2f6a2a', '#ffe36f', 'HUILE', 'd’olive', '', 'cyl'), { tall: true, op: .5, fill: .2 });
  g.add(b);
  put(sph(.1, 16, 12), mat(0x5a7a2a, { cc: 1 }), .34, -.48, .14, { s: [1, 1.3, 1] });
  put(sph(.1, 16, 12), mat(0x3a4a1a, { cc: 1 }), .48, -.48, .02, { s: [1, 1.3, 1] });
  return g;
}
function tinCan(k, col, txt, sub, icon) { return can('tin', labelTex('tin' + k, col, '#fff', txt, sub, icon, 'cyl'), { h: .72, r: .34 }); }
function sardines() {
  const { g, put } = kit();
  put(rbox(.9, .2, .55, .1), mat(C.metal, { m: .8, r: .25 }), 0, -.15, 0);
  put(rbox(.82, .04, .47, .08), mat(0x2f6aa8, { m: .3 }), -.1, .25, -.25, { r: [-1.1, 0, 0] });
  for (const z of [-.12, 0, .12]) put(sph(.12, 16, 10), mat(0xb8c6d0, { m: .5, cc: 1 }), 0, -.03, z, { s: [3, .6, .7] });
  return g;
}
function cerealBox(col = '#ffcf2e', txt = 'CÉRÉALES', sub = 'au miel') {
  const { g, put } = kit();
  const l = labelTex('cer' + txt + sub, col, '#d1342b', txt, sub, '🥣');
  put(rbox(.62, .9, .22, .03), [mat(0xffffff, { map: l }), mat(0xffffff, { map: l }), mat(0xffe08a), mat(0xffe08a), mat(0xffffff, { map: l }), mat(0xffffff, { map: l })]);
  return g;
}
function honey() {
  const { g, put } = kit();
  put(lathe('honey', [[0, -.4], [.32, -.4], [.4, -.1], [.36, .2], [.26, .28], [0, .28]]), mat(0xf2a91d, { op: .85, cc: 1, r: .1 }));
  put(cyl(.29, .29, .1, 32), mat(0xd94d2b), 0, .33, 0);
  return g;
}
function compote(sugar) {
  const { g, put } = kit();
  put(cyl(.32, .3, .62, 36), mat(0xffffff, { map: labelTex('comp' + sugar, sugar ? '#ffb347' : '#8bcf5a', '#fff', 'COMPOTE', sugar ? 'sucrée' : '100 % pomme', '🍎', 'cyl') }), 0, -.08, 0);
  put(cyl(.33, .33, .06, 36), mat(0xe8dfc8, { m: .3 }), 0, .25, 0);
  return g;
}
function frozenBag() {
  const { g, put } = kit();
  put(sph(.45, 32, 24), mat(0xffffff, { map: labelTex('frz', '#3a9be0', '#fff', 'SURGELÉS', 'nature', '❄️', 'sph') }), 0, 0, 0, { s: [1, 1.2, .35] });
  return g;
}
function readyMeal() {
  const { g, put } = kit();
  put(rbox(1, .22, .7, .06), mat(0x2a2f36, { r: .4 }), 0, -.1, 0);
  put(rbox(.44, .08, .55, .04), mat(0xf6d47a), -.22, .03, 0);
  put(rbox(.4, .1, .26, .04), mat(0x8a4a2a, { cc: .5 }), .24, .04, -.13);
  put(rbox(.4, .08, .24, .04), mat(0x5fb547), .24, .03, .14);
  return g;
}
function ham() {
  const { g, put } = kit();
  for (let i = 0; i < 3; i++) put(sph(.42, 32, 12), mat(i === 2 ? 0xf7a3a8 : 0xf28e95, { cc: .5, r: .4 }), i * .05, -.12 + i * .09, -i * .04, { s: [1.15, .08, .8], r: [.3, 0, -.08 * i] });
  return g;
}
function plate() {
  const { g, put } = kit();
  put(lathe('plate', [[0, -.06], [.62, -.06], [.72, .02], [.78, .08], [.74, .1], [.6, .02], [0, .02]], 60), mat(0xffffff, { cc: 1, r: .12 }));
  put(rbox(.08, .02, .8, .01), mat(C.metal, { m: .9, r: .2 }), -.92, -.03, 0);
  put(rbox(.08, .02, .8, .01), mat(C.metal, { m: .9, r: .2 }), .92, -.03, 0);
  g.rotation.x = .5;
  return g;
}
/* Pictogrammes 3D (nutriments, corps, interface) */
function bolt() {
  const { g, put } = kit();
  const s = new THREE.Shape(); s.moveTo(.1, .55); s.lineTo(-.3, -.05); s.lineTo(-.02, -.05); s.lineTo(-.12, -.55); s.lineTo(.32, .1); s.lineTo(.04, .1); s.lineTo(.1, .55);
  put(G('bolt', () => { const q = new THREE.ExtrudeGeometry(s, { depth: .16, bevelEnabled: true, bevelSize: .04, bevelThickness: .04, bevelSegments: 3 }); q.center(); return q; }), mat(0xffcf1f, { cc: 1, r: .2, e: 0xff9a00, ei: .15 }));
  return g;
}
function shield() {
  const { g, put } = kit();
  const s = new THREE.Shape(); s.moveTo(0, .5); s.quadraticCurveTo(.25, .42, .42, .42); s.quadraticCurveTo(.45, -.2, 0, -.52); s.quadraticCurveTo(-.45, -.2, -.42, .42); s.quadraticCurveTo(-.25, .42, 0, .5);
  put(G('shield', () => { const q = new THREE.ExtrudeGeometry(s, { depth: .14, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 4 }); q.center(); return q; }), mat(0x34b46b, { cc: 1, r: .2 }));
  put(G('shieldin', () => { const q = new THREE.ExtrudeGeometry(s, { depth: .05, bevelEnabled: false }); q.center(); return q; }), mat(0xffffff, { cc: .8 }), 0, 0, .1, { s: .62 });
  put(G('plus', () => new THREE.BoxGeometry(.24, .07, .06)), mat(0x34b46b), 0, .02, .15); put(G('plus2', () => new THREE.BoxGeometry(.07, .24, .06)), mat(0x34b46b), 0, .02, .15);
  return g;
}
function bone() {
  const { g, put } = kit();
  const m = mat(C.bone, { cc: .6, r: .35 });
  put(cyl(.09, .09, .8, 16), m, 0, 0, 0, { r: [0, 0, -Math.PI / 4] });
  for (const s of [-1, 1]) for (const o of [-1, 1]) put(sph(.13, 16, 12), m, s * .3 + o * .09 * -s, s * .3 + o * .09 * s, 0);
  return g;
}
function drop(col, k) {
  const { g, put } = kit();
  put(lathe('drop', [[0, -.45], [.25, -.4], [.36, -.18], [.32, .05], [.15, .3], [0, .5]]), mat(col, { cc: 1, r: .1, op: k === 'oil' ? .9 : undefined }));
  put(sph(.07, 12, 8), mat(0xffffff, { op: .6 }), -.13, -.12, .26, { s: [1, 1.6, .5] });
  return g;
}
function dumbbell() {
  const { g, put } = kit();
  put(cyl(.06, .06, .9, 16), mat(C.metal, { m: .8, r: .25 }), 0, 0, 0, { r: [0, 0, Math.PI / 2] });
  for (const x of [-.36, .36]) { put(cyl(.24, .24, .16, 28), mat(0x2f6fe0, { cc: 1, r: .2 }), x, 0, 0, { r: [0, 0, Math.PI / 2] }); put(cyl(.18, .18, .1, 24), mat(0x2f6fe0, { cc: 1 }), x * 1.33, 0, 0, { r: [0, 0, Math.PI / 2] }); }
  g.rotation.z = .35;
  return g;
}
function rainbow() {
  const { g, put } = kit();
  [0xef4444, 0xf59e0b, 0xfacc15, 0x22c55e, 0x3b82f6, 0x8b5cf6].forEach((c, i) => put(G('arc' + i, () => new THREE.TorusGeometry(.55 - i * .07, .036, 12, 40, Math.PI)), mat(c, { cc: .8 }), 0, -.15, 0));
  put(sph(.14, 16, 12), mat(0xffffff), -.5, -.18, 0, { s: [1.4, 1, 1] }); put(sph(.14, 16, 12), mat(0xffffff), .5, -.18, 0, { s: [1.4, 1, 1] });
  return g;
}
function brain() {
  const { g, put } = kit();
  const m = mat(0xff9fb8, { cc: .8, r: .3, bump: noiseTex('brain', 400), bs: 2 });
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; put(sph(.2, 20, 14), m, Math.cos(a) * .22, .05 + Math.sin(a * 2) * .05, Math.sin(a) * .16); }
  put(sph(.28, 20, 14), m, 0, .12, 0, { s: [1.2, .8, .9] });
  return g;
}
function eye() {
  const { g, put } = kit();
  put(sph(.4, 32, 24), mat(0xffffff, { cc: 1 }));
  put(sph(.2, 24, 16), mat(0x2f8be0, { cc: 1 }), 0, 0, .33, { s: [1, 1, .45] });
  put(sph(.1, 16, 12), mat(C.black), 0, 0, .39, { s: [1, 1, .4] });
  put(sph(.04, 8, 6), mat(0xffffff), .06, .06, .43);
  return g;
}
function heart() {
  const { g, put } = kit();
  const s = new THREE.Shape(); s.moveTo(0, -.45); s.bezierCurveTo(-.6, -.05, -.45, .45, 0, .2); s.bezierCurveTo(.45, .45, .6, -.05, 0, -.45);
  put(G('heart', () => { const q = new THREE.ExtrudeGeometry(s, { depth: .2, bevelEnabled: true, bevelSize: .06, bevelThickness: .06, bevelSegments: 4 }); q.center(); return q; }), mat(0xef3b4f, { cc: 1, r: .15 }));
  return g;
}
function star(col = 0xffc61a) {
  const { g, put } = kit();
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? .22 : .52; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  put(G('star', () => { const q = new THREE.ExtrudeGeometry(s, { depth: .14, bevelEnabled: true, bevelSize: .05, bevelThickness: .05, bevelSegments: 3 }); q.center(); return q; }), mat(col, { cc: 1, r: .15, e: 0xff9a00, ei: .1 }));
  return g;
}
function check(ok) {
  const { g, put } = kit();
  put(cyl(.46, .46, .14, 40), mat(ok ? 0x2fbf5a : 0xef3b4f, { cc: 1, r: .2 }), 0, 0, 0, { r: [Math.PI / 2, 0, 0] });
  const m = mat(0xffffff, { cc: .5 });
  if (ok) { put(rbox(.12, .26, .08, .03), m, -.1, -.04, .09, { r: [0, 0, .75] }); put(rbox(.12, .5, .08, .03), m, .1, .04, .09, { r: [0, 0, -.65] }); }
  else { put(rbox(.12, .55, .08, .03), m, 0, 0, .09, { r: [0, 0, .78] }); put(rbox(.12, .55, .08, .03), m, 0, 0, .09, { r: [0, 0, -.78] }); }
  return g;
}
function bomb() {
  const { g, put } = kit();
  put(sph(.45, 40, 30), mat(0x2b3550, { cc: 1, r: .18, m: .2 }), 0, -.08, 0);
  put(cyl(.13, .15, .14, 20), mat(0x8a96a8, { m: .7, r: .25 }), .2, .36, 0, { r: [0, 0, -.5] });
  put(taper('fuse', [V(.25, .42), V(.35, .55), V(.3, .66)], () => .03, 12, 8), mat(0xc49a5c), 0, 0, 0);
  put(sph(.08, 12, 10), mat(0xffd23f, { e: 0xff8a00, ei: 1.5 }), .3, .68, 0);
  for (const x of [-.14, .12]) { put(sph(.075, 14, 12), mat(0xffffff), x, .0, .4); put(sph(.04, 10, 8), mat(C.black), x + .01, -.01, .46); }
  put(tor(.09, .022, 8, 20, Math.PI), mat(0xffffff), -.01, -.13, .41, { r: [0, 0, Math.PI] });
  for (const x of [-.24, .22]) put(sph(.06, 10, 8), mat(0xff8fa8, { op: .8 }), x, -.1, .37, { s: [1, .6, .4] });
  return g;
}
function cart() {
  const { g, put } = kit();
  const m = mat(0x2f8be0, { m: .3, r: .3, cc: 1 });
  put(rbox(.9, .5, .55, .06), mat(0x2f8be0, { op: .85, cc: 1 }), 0, .05, 0);
  put(cyl(.025, .025, .5, 8), m, -.52, .35, 0, { r: [0, 0, -.5] });
  put(cyl(.025, .025, .6, 8), m, -.62, .55, 0, { r: [Math.PI / 2, 0, 0] });
  for (const [x, z] of [[-.32, .22], [.32, .22], [-.32, -.22], [.32, -.22]]) put(cyl(.08, .08, .05, 16), mat(C.black), x, -.32, z, { r: [Math.PI / 2, 0, 0] });
  put(rbox(.82, .04, .04, .01), m, 0, -.24, .22); put(rbox(.82, .04, .04, .01), m, 0, -.24, -.22);
  return g;
}
function sunIcon(moon) {
  const { g, put } = kit();
  if (moon) {
    put(sph(.42, 32, 24), mat(0xffe9a8, { cc: .8, e: 0xffd060, ei: .2 }));
    put(sph(.35, 32, 24), mat(0x4a5fb0), .22, .14, .12);
    put(star(0xffe066).children[0].geometry, mat(0xffe066, { e: 0xffc400, ei: .3 }), -.5, .4, 0, { s: .35 });
    return g;
  }
  put(sph(.32, 32, 24), mat(0xffc61a, { cc: 1, e: 0xff9a00, ei: .35 }));
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; put(cone(.08, .18, 8), mat(0xffa21a, { e: 0xff7a00, ei: .3 }), Math.cos(a) * .47, Math.sin(a) * .47, 0, { r: [0, 0, a - Math.PI / 2] }); }
  return g;
}
function sunrise() {
  const { g } = kit();
  const s = sunIcon(false); s.position.y = .1; g.add(s);
  const m = new THREE.Mesh(rbox(1.3, .26, .3, .1), mat(0x9ad7ff, { cc: .5 })); m.position.y = -.35; g.add(m);
  return g;
}
function wheat() {
  const { g, put } = kit();
  for (const a of [-.3, 0, .3]) {
    const st = new THREE.Group(); st.rotation.z = a; g.add(st);
    put(cyl(.02, .02, .9, 6), mat(0xc9a34a), 0, -.1, 0, { p: st });
    for (let i = 0; i < 6; i++) for (const s of [-1, 1]) put(sph(.06, 10, 8), mat(0xe8c25a, { cc: .5 }), s * .05, .1 + i * .07, 0, { s: [.8, 1.6, .8], r: [0, 0, -s * .5], p: st });
  }
  return g;
}

/* ---------- Catalogue ---------- */
const MODELS = {
  apple: () => appleLike(0xe8343a), greenapple: () => appleLike(0x9ed34a, 'apple'), pear, banana, strawberry,
  orange: () => citrus(0xff9419, 'or'), lemon: () => citrus(0xffde3a, 'le'), tomato, grapes, broccoli, carrot,
  lettuce, greenbeans: greenBeans, pepper, corn, potato, avocado, chicken, nuggets,
  fish: () => fish(0x3b8ee0, 0xdcefff), salmon: () => fish(0xff8a6a, 0xffd9c9), egg,
  lentils, rice: () => riceBowl(false), brownrice: () => riceBowl(true), oats, pasta, noodles: noodleCup, bread,
  milk: milkCarton, cheese: cheeseWedge, babybel, yogurt: () => yogurt(), yogurtfruit: () => yogurt(0xff6f9a, 'FRAISE', '#ffd1df', '#e2457a'),
  yop: yopBottle, pudding: () => flan(false), chocopudding: () => flan(true),
  water, sparkling, soda: () => sodaCan(false), sodazero: () => sodaCan(true), energy: energyCan,
  juice: () => juiceBox(), fruitdrink: () => juiceBox('#ff5f97', 'BOISSON'), icetea: () => juiceBox('#c98a3a', 'THÉ GLACÉ'),
  tea: teaCup, bubbletea: bubbleTea, cookie, sandwichcookie: sandwichCookie, candy, chocolate: chocoBar, cake: cakeSlice, donut,
  chips, chipsbag: bagChips, burger, fries, pizza, hotdog, salt, sugar, butter, oil: oilBottle,
  can: () => tinCan('veg', '#3f9b4a', 'LÉGUMES', 'en conserve', '🥫'), chickpeas: () => tinCan('pois', '#d99a3a', 'POIS', 'chiches', ''),
  sauce: () => tinCan('sauce', '#c8352a', 'SAUCE', 'tomate', ''), tuna: () => tinCan('thon', '#2f6aa8', 'THON', 'au naturel', '🐟'),
  sardines, cereal: () => cerealBox(), cerealplain: () => cerealBox('#f2b55a', 'CÉRÉALES', 'aromatisées'), honey,
  compote: () => compote(false), compotesugar: () => compote(true), frozen: frozenBag, readymeal: readyMeal, ham, plate,
  bolt, shield, bone, blood: () => drop(0xe02f3f, 'blood'), oildrop: () => drop(0xf2c230, 'oil'), dumbbell, rainbow, brain, eye,
  heart, star: () => star(), check: () => check(true), cross: () => check(false), bomb, cart, sun: () => sunIcon(false),
  moon: () => sunIcon(true), sunrise, wheat
};
export const FOOD_KEYS = Object.keys(MODELS);

/* Construit un modèle normalisé (hauteur max = size, centré, posé sur y=0 si grounded). */
export function buildFood(key, { size = 1, grounded = false } = {}) {
  const make = MODELS[key] || MODELS.star;
  const inner = make(), outer = new THREE.Group();
  outer.add(inner);
  const box = new THREE.Box3().setFromObject(inner), dim = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const s = size / Math.max(dim.x, dim.y, dim.z, .001);
  inner.position.sub(c);
  const wrap = new THREE.Group(); wrap.add(outer); outer.scale.setScalar(s);
  if (grounded) outer.position.y = dim.y * s / 2;
  wrap.userData.key = key;
  return wrap;
}

/* Correspondance emoji / nom → modèle 3D. Le nom est prioritaire car un même emoji sert à plusieurs produits. */
const BY_NAME = [
  [/pringles|tuile/i, 'chips'], [/chips/i, 'chipsbag'], [/compote.*(sucre|sirop)|sucre ajouté/i, 'compotesugar'], [/compote/i, 'compote'],
  [/riz complet/i, 'brownrice'], [/riz/i, 'rice'], [/flocons|avoine/i, 'oats'], [/céréales complètes/i, 'wheat'], [/céréales|miel pops/i, 'cereal'],
  [/surgel/i, 'frozen'], [/haricots verts en conserve|légumes en conserve|conserve.*légume|légumes.*conserve/i, 'can'], [/pois chiches/i, 'chickpeas'],
  [/haricots/i, 'greenbeans'], [/salade/i, 'lettuce'], [/thon/i, 'fish'], [/saumon/i, 'salmon'], [/sardine/i, 'sardines'], [/poisson/i, 'fish'],
  [/nuggets|cordon/i, 'nuggets'], [/poulet/i, 'chicken'], [/jambon/i, 'ham'], [/lentille|légumineuse/i, 'lentils'],
  [/yop|yaourt à boire|boisson lactée/i, 'yop'], [/yaourt aromatisé|yaourt.*sucré/i, 'yogurtfruit'], [/yaourt/i, 'yogurt'],
  [/danette|dessert lacté choc|dessert au chocolat/i, 'chocopudding'], [/dessert industriel|dessert lacté|flan/i, 'pudding'],
  [/babybel/i, 'babybel'], [/fromage/i, 'cheese'], [/lait/i, 'milk'],
  [/coca.*z[ée]ro/i, 'sodazero'], [/soda|coca/i, 'soda'], [/énergisante/i, 'energy'], [/thé glacé/i, 'bubbletea'], [/thé/i, 'tea'],
  [/oasis|boisson aux fruits/i, 'fruitdrink'], [/jus/i, 'juice'], [/perrier|gazeuse/i, 'sparkling'], [/^eau|eau$/i, 'water'],
  [/nouilles|cup noodles/i, 'noodles'], [/pâtes|panzani/i, 'pasta'], [/pain|baguette/i, 'bread'], [/pomme de terre/i, 'potato'],
  [/huile/i, 'oil'], [/beurre/i, 'butter'], [/sauce/i, 'sauce'], [/sel/i, 'salt'], [/sucre/i, 'sugar'], [/miel/i, 'honey'],
  [/kinder pingui|gâteau|dessert très sucré/i, 'cake'], [/kinder bueno|barre|lion|chocolat|nutella|m&m/i, 'chocolate'],
  [/biscuit fourré|petit écolier/i, 'sandwichcookie'], [/cookie|biscuit/i, 'cookie'], [/bonbon|skittles|confiserie/i, 'candy'],
  [/burger/i, 'burger'], [/frites/i, 'fries'], [/pizza/i, 'pizza'], [/hot-dog/i, 'hotdog'], [/plat préparé/i, 'readymeal'],
  [/fruit entier|fruit frais|orange/i, 'orange'], [/poire/i, 'pear'], [/banane/i, 'banana'], [/fraise/i, 'strawberry'], [/pomme/i, 'apple'],
  [/tomate/i, 'tomato'], [/brocoli/i, 'broccoli'], [/carotte/i, 'carrot'], [/poivron/i, 'pepper'], [/maïs/i, 'corn'], [/avocat/i, 'avocado'],
  [/œuf|oeuf/i, 'egg'], [/légume/i, 'broccoli'], [/fruit/i, 'apple']
];
const BY_EMOJI = {
  '🍎': 'apple', '🍏': 'greenapple', '🍐': 'pear', '🍌': 'banana', '🍓': 'strawberry', '🍊': 'orange', '🍋': 'lemon', '🍅': 'tomato', '🍇': 'grapes',
  '🥦': 'broccoli', '🥕': 'carrot', '🥬': 'lettuce', '🫑': 'pepper', '🌽': 'corn', '🥔': 'potato', '🥑': 'avocado', '🍗': 'chicken', '🐟': 'fish',
  '🐠': 'salmon', '🥚': 'egg', '🫘': 'lentils', '🍚': 'rice', '🌾': 'oats', '🍝': 'pasta', '🍜': 'noodles', '🍞': 'bread', '🥛': 'milk', '🧀': 'cheese',
  '🥣': 'yogurt', '🍮': 'pudding', '💧': 'water', '🫧': 'sparkling', '🥤': 'soda', '🧃': 'juice', '🍵': 'tea', '🧋': 'bubbletea', '⚡': 'bolt',
  '🍪': 'cookie', '🍬': 'candy', '🍫': 'chocolate', '🍰': 'cake', '🍩': 'donut', '🍔': 'burger', '🍟': 'fries', '🍕': 'pizza', '🌭': 'hotdog',
  '🥓': 'hotdog', '🧂': 'salt', '🥄': 'sugar', '🧈': 'butter', '🫒': 'oil', '🥫': 'can', '🍲': 'readymeal', '🥩': 'ham', '🍯': 'honey',
  '❄️': 'frozen', '🍽️': 'plate', '💪': 'dumbbell', '🛡️': 'shield', '🦴': 'bone', '🩸': 'blood', '🧠': 'brain', '👁️': 'eye', '🌈': 'rainbow',
  '⭐': 'star', '💣': 'bomb', '🛒': 'cart', '❤️': 'heart', '✅': 'check', '❌': 'cross'
};
export function foodKey(emoji = '', name = '') {
  if (name) for (const [re, k] of BY_NAME) if (re.test(name)) return k;
  const e = String(emoji).trim();
  return BY_EMOJI[e] || BY_EMOJI[e.replace(/️/g, '')] || BY_EMOJI[e + '️'] || null;
}

/* Fusionne les maillages d'un groupe par matériau (beaucoup moins d'appels de dessin, même apparence).
   Les sprites et les objets marqués userData.keep restent tels quels. */
export function bakeGroup(root) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), byMat = new Map(), drop = [];
  root.traverse(o => {
    if (!o.isMesh || o.userData.keep || Array.isArray(o.material)) return;
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.attributes.uv) return;
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld));
    const key = o.material.uuid + (o.castShadow ? 's' : '');
    if (!byMat.has(key)) byMat.set(key, { m: o.material, cast: o.castShadow, list: [] });
    byMat.get(key).list.push(g); drop.push(o);
  });
  if (drop.length < 2) return root;
  drop.forEach(o => o.parent.remove(o));
  for (const { m, cast, list } of byMat.values()) {
    const merged = mergeGeometries(list, false); if (!merged) continue;
    const mesh = new THREE.Mesh(merged, m); mesh.castShadow = cast; mesh.receiveShadow = true; root.add(mesh);
    list.forEach(g => g.dispose());
  }
  return root;
}
