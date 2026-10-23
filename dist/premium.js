/* =====================================================================
   Battle du panier — couche graphique premium.
   Ce module observe l'écran affiché et l'habille (images 3D, décors,
   animations). Il ne modifie ni les règles, ni les scores, ni les
   boutons : il ne lit l'état du jeu que pour savoir quoi afficher.
   ===================================================================== */
import * as THREE from 'three';
import { buildFood, foodKey, mat } from './food3d.js';
import { iconURL, spinURL, sharedEnvironment, studioLights, iconsAvailable } from './icons3d.js';

const app = document.getElementById('app');
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const isEmoji = t => !!t && t.length <= 6 && EMOJI_RE.test(t);
const game = () => (typeof state !== 'undefined' ? state : {});
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Images 3D ---------- */
function imgHTML(key, cls = 'f3d') {
  const src = key && iconURL(key);
  return src ? `<img class="${cls}" src="${src}" alt="" draggable="false">` : '';
}
/* Remplace un emoji par son image 3D (une seule fois par élément). */
function setIcon(el, key, cls = 'f3d') {
  if (!el || !key) return;
  if (el.dataset.f3d === key) return;
  const html = imgHTML(key, cls);
  if (!html) return;
  el.dataset.f3d = key;
  el.dataset.emoji = el.textContent.trim();
  el.innerHTML = html;
}
function spinHTML(key, cls = '') {
  const src = key && spinURL(key);
  return src ? `<span class="f3d-spin ${cls}"><img src="${src}" alt="" draggable="false"></span>` : imgHTML(key, cls);
}
const iconForEmojiSlot = (el, name = '') => {
  const t = el.dataset.emoji || el.textContent.trim();
  if (!isEmoji(t) && !el.dataset.f3d) return;
  setIcon(el, foodKey(t, name));
};

/* ---------- Habillages par écran ---------- */
const decorators = [];
const on = (fn) => decorators.push(fn);

/* Icônes génériques présentes dans plusieurs écrans */
on(root => {
  root.querySelectorAll('.food .emoji').forEach(el => iconForEmojiSlot(el, (el.closest('.food')?.getAttribute('aria-label') || '').replace(/^Choisir\s*/, '')));
  root.querySelectorAll('.food-info-icon').forEach(el => iconForEmojiSlot(el, (el.nextElementSibling?.querySelector('b')?.textContent || '').split('·')[0]));
  root.querySelectorAll('.food-example b').forEach(el => iconForEmojiSlot(el, el.nextElementSibling?.textContent || ''));
  root.querySelectorAll('.group-number').forEach(el => iconForEmojiSlot(el, el.parentElement?.querySelector('h3')?.textContent || ''));
  root.querySelectorAll('.nutri-card-icon').forEach(el => iconForEmojiSlot(el, el.nextElementSibling?.textContent || ''));
  root.querySelectorAll('.nutri-pack').forEach(el => iconForEmojiSlot(el, el.parentElement?.querySelector('b')?.textContent || ''));
  root.querySelectorAll('.nutri-basket-picked span').forEach(el => iconForEmojiSlot(el, (el.parentElement?.textContent || '').split(':').pop()));
  root.querySelectorAll('.candidate-emoji').forEach(el => iconForEmojiSlot(el, el.nextElementSibling?.textContent || ''));
  root.querySelectorAll('.reveal-emoji').forEach(el => iconForEmojiSlot(el, el.parentElement?.querySelector('small')?.textContent || ''));
  root.querySelectorAll('.nutri-cart-mini > span').forEach(el => setIcon(el, 'cart'));
  root.querySelectorAll('.brief-bomb, .rush-bomb, .bomb-result-hero > span').forEach(el => setIcon(el, 'bomb'));
  root.querySelectorAll('.platefood').forEach(el => iconForEmojiSlot(el));
  root.querySelectorAll('.cp-food b').forEach(el => iconForEmojiSlot(el, el.nextElementSibling?.textContent || ''));
  root.querySelectorAll('.lp-food b').forEach(el => iconForEmojiSlot(el, el.nextElementSibling?.textContent || el.closest('.lp-step,.lp-flip,.run-learn-item')?.querySelector('strong')?.textContent || ''));
});

/* QR code généré sur place (aucun service externe) vers l'adresse du jeu */
const shareURL = () => window.BATTLE_URL || (location.origin + location.pathname);
function qrDataURL(text) {
  if (!window.qrcode) return null;
  try { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); return q.createDataURL(8, 16); } catch (e) { return null; }
}
on(root => {
  document.querySelectorAll('img[src*="api.qrserver.com"]').forEach(img => { const u = qrDataURL(shareURL()); if (u) { img.src = u; img.style.imageRendering = 'pixelated'; } });
});

/* Texte d'aide de l'écran SIGA (l'original affichait « [object Object] »). */
on(root => {
  root.querySelectorAll('p.copy').forEach(p => { if (p.textContent === '[object Object]') p.textContent = 'Chaque cran d’écart enlève 10 points, jusqu’à 0. Le feedback t’indique si tu étais proche ou loin.'; });
});

/* Tri NOVA : le nom de l'aliment est maintenant affiché en haut du décor */
on(root => { const tip = root.querySelector('.market-tip'); if (tip && tip.textContent.includes('s’affiche en bas')) tip.textContent = tip.textContent.replace('s’affiche en bas', 's’affiche en haut'); });

/* Conseils « dans la vie de tous les jours » après chaque réponse */
const tipHTML = t => `<div class="lp-tip daily"><b>💡 Dans la vie de tous les jours</b><p>${t}</p></div>`;
on(root => {
  if (typeof DAILY_TIPS === 'undefined') return;
  const s = game();
  const siga = root.querySelector('#feed.show .siga-reveal');
  if (siga && !root.querySelector('#feed .daily')) { const n = +((siga.textContent.match(/SIGA (\d)/) || [])[1] || 0); if (n) root.querySelector('#feed .resultbox')?.insertAdjacentHTML('beforeend', tipHTML(DAILY_TIPS.siga(n))); }
  const body = root.querySelector('#nutri-feedback .nutri-feedback');
  if (body && !body.querySelector('.daily')) { const m = nutrientBodyMissions[Number(s.nutriBodyIndex) || 0]; if (m && DAILY_TIPS.body[m.zone]) body.insertAdjacentHTML('beforeend', tipHTML(DAILY_TIPS.body[m.zone])); }
  const feed = root.querySelector('#feed.show');
  if (feed && !feed.querySelector('.daily')) {
    if (s.phase === 'plate') feed.querySelector('.resultbox')?.insertAdjacentHTML('beforeend', tipHTML(DAILY_TIPS.plate));
    if (s.phase === 'who') feed.querySelector('.resultbox')?.insertAdjacentHTML('beforeend', tipHTML(DAILY_TIPS.who));
  }
});

/* Score : petit rebond quand il change */
let lastPoints = null;
on(root => {
  const p = root.querySelector('.points');
  if (!p) return;
  if (lastPoints !== null && p.textContent !== lastPoints) { p.classList.remove('bump'); void p.offsetWidth; p.classList.add('bump'); }
  lastPoints = p.textContent;
});

/* Accueil : aliments 3D qui flottent autour des mascottes */
on(root => {
  const hero = root.querySelector('.hero-mascots');
  if (!hero || hero.querySelector('.hero-foods')) return;
  const items = [['apple', 4, 8], ['broccoli', 80, 4], ['carrot', 2, 62], ['banana', 82, 58], ['water', 46, -4]];
  const box = document.createElement('div'); box.className = 'hero-foods';
  box.innerHTML = items.map(([k, x, y], i) => { const s = iconURL(k); return s ? `<img src="${s}" alt="" style="left:${x}%;top:${y}%;animation-delay:${-i * .7}s">` : ''; }).join('');
  hero.prepend(box);
});

/* Fin de partie : Professeur Fraise en grand */
on(root => {
  const t = root.querySelector('.gamecard.center > .teacher');
  if (!t || t.dataset.prof) return;
  t.dataset.prof = '1';
  t.className = 'sprite sprite-strawberry prof-end'; t.removeAttribute('style'); t.innerHTML = '';
});

/* ---------- 2. SIGA : laboratoire scanner ---------- */
on(root => {
  const q = root.querySelector('.siga-question');
  if (!q || q.previousElementSibling?.classList.contains('siga-lab')) return;
  const name = q.querySelector('.question-product b')?.textContent || '';
  const emoji = q.querySelector('.question-product span')?.textContent || '';
  const key = foodKey(emoji, name);
  const lab = document.createElement('div'); lab.className = 'siga-lab';
  lab.innerHTML = `<div class="lab-title"><span><i></i>SCANNER SIGA</span><span>ANALYSE…</span></div>
    <div class="scan-stage"><div class="pedestal"></div>${spinHTML(key, 'scan-food')}<div class="beam"></div><i class="corner c1"></i><i class="corner c2"></i><i class="corner c3"></i><i class="corner c4"></i></div>
    <div class="scan-name"><small>PRODUIT ANALYSÉ</small>${name}</div>`;
  q.before(lab);
  const panel = root.querySelector('.siga-answer'), range = root.querySelector('#sigarange');
  if (!panel || !range || panel.querySelector('.siga-gauge')) return;
  const gauge = document.createElement('div'); gauge.className = 'siga-gauge';
  gauge.innerHTML = `<div class="segs">${[1, 2, 3, 4, 5, 6, 7].map(n => `<div class="seg" data-n="${n}">${n}</div>`).join('')}</div>`;
  panel.querySelector('.sliderrow')?.before(gauge);
  const hint = document.createElement('div'); hint.className = 'siga-hint'; hint.innerHTML = 'Ton choix : <b>4</b>';
  panel.querySelector('.sliderrow')?.after(hint);
  const ends = document.createElement('div'); ends.className = 'siga-gauge'; ends.innerHTML = '<div class="ends"><span>1 · peu transformé</span><span>7 · ultra-transformé</span></div>';
  hint.after(ends);
  const sync = () => {
    const v = range.value;
    gauge.querySelectorAll('.seg').forEach(s => s.classList.toggle('on', s.dataset.n === v));
    const b = hint.querySelector('b');
    if (b.textContent !== v) { b.textContent = v; b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); try { navigator.vibrate?.(6); } catch (e) {} }
  };
  range.addEventListener('input', sync); sync();
});

/* ---------- 4. Labo du corps (Three.js) ---------- */
let lab = null;
on(root => {
  const scene = root.querySelector('.nutri-body-scene');
  if (scene && !scene.classList.contains('has-3d')) mountBodyLab(scene);
  if (lab && lab.host.isConnected) {
    const fig = lab.host.querySelector('#nutri-body');
    const zone = [...(fig?.classList || [])].find(c => c.startsWith('focus-'))?.slice(6);
    if (zone && zone !== lab.zone) lab.focus(zone, !document.querySelector('.nutri-answer.wrong'));
  }
});

function mountBodyLab(host) {
  let r;
  try { r = lab?.renderer || new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return; }
  host.classList.add('has-3d');
  if (!lab) lab = { renderer: r };
  r.setPixelRatio(Math.min(devicePixelRatio, 2)); r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.setClearColor(0, 0);
  lab.env ??= sharedEnvironment(r);
  const scene = new THREE.Scene(); scene.environment = lab.env; studioLights(scene, 1);
  const cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.set(0, 1.4, 5.3); cam.lookAt(0, 1.15, 0);

  /* Plateforme et anneaux holographiques */
  const glowTex = radialTexture();
  const platform = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, .16, 48), mat(0xffffff, { cc: 1, r: .2 })); platform.position.y = -.08; scene.add(platform);
  const ringM = new THREE.MeshBasicMaterial({ color: 0x5fd3ff, transparent: true, opacity: .55 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, .025, 8, 80), ringM); ring1.rotation.x = Math.PI / 2; ring1.position.y = .02; scene.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(.95, .015, 8, 80), ringM.clone()); ring2.rotation.x = Math.PI / 2.2; ring2.position.y = 1.2; scene.add(ring2);
  const floorGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x7fe6ff, transparent: true, opacity: .55, depthWrite: false }));
  floorGlow.scale.set(3.6, 1.2, 1); floorGlow.position.y = .05; scene.add(floorGlow);

  /* Humain stylisé, jeune adulte souriant */
  const body = new THREE.Group(); scene.add(body);
  const skin = mat(0xf2b48c, { r: .55, cc: .2 }), shirt = mat(0x2fc6b0, { r: .45 }), pants = mat(0x2f4f9a, { r: .5 }), hair = mat(0x4a2c1f, { r: .5 }), shoe = mat(0xffffff, { cc: .6 });
  const part = (geo, m, x, y, z = 0, rz = 0) => { const q = new THREE.Mesh(geo, m); q.position.set(x, y, z); q.rotation.z = rz; body.add(q); return q; };
  const head = part(new THREE.SphereGeometry(.33, 32, 24), skin, 0, 2.02); head.scale.set(1, 1.08, 1);
  part(new THREE.SphereGeometry(.345, 32, 16, 0, Math.PI * 2, 0, 1.45), hair, 0, 2.08, -.02).rotation.x = -.25;
  for (const x of [-.11, .11]) { part(new THREE.SphereGeometry(.05, 12, 10), mat(0xffffff), x, 2.05, .29); part(new THREE.SphereGeometry(.028, 10, 8), mat(0x2a2f36), x, 2.05, .335); }
  const smile = part(new THREE.TorusGeometry(.09, .016, 8, 20, Math.PI), mat(0xb5424a), 0, 1.93, .3); smile.rotation.z = Math.PI;
  for (const x of [-.19, .19]) part(new THREE.SphereGeometry(.045, 10, 8), mat(0xff9a9a, { op: .7 }), x, 1.95, .27).scale.set(1, .6, .4);
  part(new THREE.CylinderGeometry(.1, .12, .18, 16), skin, 0, 1.72);
  const torso = part(new THREE.CapsuleGeometry(.36, .55, 8, 20), shirt, 0, 1.28); torso.scale.set(1, 1, .72);
  const armL = new THREE.Group(), armR = new THREE.Group(); armL.position.set(-.46, 1.55, 0); armR.position.set(.46, 1.55, 0); body.add(armL, armR);
  const upperM = mat(0x2fc6b0, { r: .45 });
  for (const [g, s] of [[armL, -1], [armR, 1]]) {
    const up = new THREE.Mesh(new THREE.CapsuleGeometry(.11, .32, 6, 14), upperM); up.position.set(0, -.2, 0); g.add(up);
    const low = new THREE.Mesh(new THREE.CapsuleGeometry(.095, .3, 6, 14), skin); low.position.set(s * .02, -.58, .02); g.add(low);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(.1, 14, 10), skin); hand.position.set(s * .03, -.82, .03); g.add(hand);
    g.rotation.z = s * .18;
  }
  for (const x of [-.17, .17]) {
    part(new THREE.CapsuleGeometry(.14, .62, 6, 14), pants, x, .5);
    part(new THREE.SphereGeometry(.14, 16, 10), shoe, x, .08, .07).scale.set(1, .55, 1.5);
  }
  part(new THREE.CylinderGeometry(.33, .3, .12, 24), mat(0x23407e), 0, .9).scale.z = .75;

  /* Zones lumineuses du corps */
  const Z = { brain: [-.12, 2.3, .1], eyes: [.12, 2.05, .35], muscles: [.52, 1.38, .05], bones: [-.17, .45, .15], blood: [-.12, 1.42, .28], energy: [.1, 1.05, .3], shield: [0, 1.2, 0] };
  const labels = { brain: ['brain', 'cerveau'], eyes: ['eye', 'yeux'], muscles: ['dumbbell', 'muscles'], bones: ['bone', 'os'], blood: ['blood', 'sang'], energy: ['bolt', 'énergie'], shield: ['shield', 'défenses'] };
  const glows = {};
  for (const [k, p] of Object.entries(Z)) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd84a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.position.set(...p); s.scale.setScalar(k === 'shield' ? 3.4 : .9); body.add(s); glows[k] = s;
  }
  const aura = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), new THREE.MeshBasicMaterial({ color: 0x7ff09c, transparent: true, opacity: 0, depthWrite: false, side: THREE.BackSide }));
  aura.scale.set(.95, 1.35, .8); aura.position.y = 1.2; body.add(aura);
  const labelBox = document.createElement('div'); labelBox.className = 'lab-zone-labels';
  labelBox.innerHTML = Object.entries(labels).map(([k, [ic, t]]) => `<span data-z="${k}" class="${['brain', 'blood', 'bones'].includes(k) ? 'l' : 'r'}">${imgHTML(ic, 'f3d-inline')}${t}</span>`).join('');

  /* Particules de nutriments */
  const parts = [], pGeo = new THREE.SphereGeometry(.045, 8, 6);
  const fly = (zone, color) => {
    const target = new THREE.Vector3(...Z[zone]);
    for (let i = 0; i < 46; i++) {
      const m = new THREE.Mesh(pGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
      const from = new THREE.Vector3((Math.random() - .5) * 2.4, -.4 - Math.random() * .4, 1 + Math.random());
      const mid = from.clone().lerp(target, .5).add(new THREE.Vector3((Math.random() - .5) * 1.6, .8 + Math.random(), .6));
      m.position.copy(from); body.add(m);
      parts.push({ m, from, mid, target, t: -i * .022 });
    }
  };

  host.prepend(r.domElement); host.append(labelBox);
  let w = 0, h = 0, raf = 0, last = performance.now(), focusT = 0;
  const api = lab;
  Object.assign(api, {
    host, zone: null,
    focus(zone, good) {
      api.zone = zone; focusT = 0;
      const col = good ? 0x7ff09c : 0xffd84a;
      glows[zone].material.color.set(col);
      if (zone === 'shield') aura.material.color.set(col);
      if (zone === 'muscles') upperM.emissive.set(col), upperM.emissiveIntensity = 0;
      labelBox.querySelector(`[data-z="${zone}"]`)?.classList.add('on');
      fly(zone, good ? 0x6dff98 : 0xffd84a);
    }
  });
  upperM.emissive.set(0); upperM.emissiveIntensity = 0;
  const v = new THREE.Vector3();
  const loop = now => {
    if (!host.isConnected) { cancelAnimationFrame(raf); return; }
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    const rw = host.clientWidth, rh = host.clientHeight;
    if (rw !== w || rh !== h) { w = rw; h = rh; r.setSize(w, h, false); cam.aspect = w / h; cam.position.z = w / h < .9 ? 6.2 : 5.3; cam.updateProjectionMatrix(); }
    const t = now / 1000;
    body.rotation.y = Math.sin(t * .6) * .35;
    torso.scale.y = 1 + Math.sin(t * 2.2) * .015;
    armL.rotation.z = -.18 - Math.sin(t * 1.6) * .05; armR.rotation.z = .18 + Math.sin(t * 1.6) * .05;
    if (api.zone === 'muscles') armR.rotation.z = .18 + Math.min(1, focusT) * .9, armR.rotation.x = -Math.min(1, focusT) * .5;
    ring1.rotation.z += dt * .6; ring2.rotation.z -= dt * .4; ring2.position.y = 1.2 + Math.sin(t * .9) * .5;
    if (api.zone) {
      focusT += dt;
      const pulse = .65 + Math.sin(t * 5) * .25, g = glows[api.zone];
      g.material.opacity = Math.min(1, focusT * 1.5) * pulse;
      if (api.zone === 'shield') aura.material.opacity = Math.min(.28, focusT * .3) * (.8 + Math.sin(t * 4) * .2);
      if (api.zone === 'muscles') upperM.emissiveIntensity = Math.min(.6, focusT) * pulse;
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.t += dt * 1.1;
      const k = Math.max(0, Math.min(1, p.t)), a = p.from.clone().lerp(p.mid, k), b = p.mid.clone().lerp(p.target, k);
      p.m.position.copy(a.lerp(b, k)); p.m.visible = p.t > 0;
      if (p.t >= 1) { body.remove(p.m); p.m.material.dispose(); parts.splice(i, 1); }
    }
    labelBox.querySelectorAll('span').forEach(s => {
      v.set(...Z[s.dataset.z]); if (s.dataset.z === 'shield') v.set(.75, .55, 0);
      body.localToWorld(v); v.project(cam);
      s.style.left = ((v.x + 1) / 2 * 100) + '%'; s.style.top = ((1 - v.y) / 2 * 100) + '%';
    });
    r.render(scene, cam);
  };
  raf = requestAnimationFrame(loop);
}
function radialTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ---------- 5. Courses au supermarché ---------- */
const TAG_ICONS = [[/protéine/, 'dumbbell'], [/fibre/, 'wheat'], [/calcium/, 'milk'], [/fer/, 'blood'], [/glucide/, 'bolt'], [/vitamine/, 'orange'], [/lipide|insatur/, 'oildrop'], [/sucr/, 'candy'], [/sel/, 'salt'], [/légume/, 'broccoli'], [/fruit/, 'apple'], [/boisson/, 'water'], [/pratique/, 'star'], [/transform|recette|vérifier|regarder/, 'can'], [/occasionnel|varier/, 'heart']];
on(root => {
  const market = root.querySelector('.nutri-market');
  if (!market) return;
  if (!market.querySelector('.shelf-deco')) {
    const deco = document.createElement('div'); deco.className = 'shelf-deco';
    deco.innerHTML = ['apple', 'milk', 'cereal', 'banana', 'water', 'broccoli', 'yogurt', 'carrot', 'bread', 'orange', 'oil', 'pear'].map(k => imgHTML(k)).join('');
    market.prepend(deco);
    const cart = document.createElement('div'); cart.className = 'market-cart'; cart.innerHTML = imgHTML('cart'); market.append(cart);
  }
  const sit = market.querySelector('.nutri-situation');
  if (sit && !sit.querySelector('.time-icon')) {
    const t = (sit.querySelector('.meal-time')?.textContent || '').toLowerCase();
    const k = t.includes('matin') ? 'sunrise' : t.includes('soir') ? 'moon' : 'sun';
    sit.querySelector('.meal-time')?.insertAdjacentHTML('afterend', imgHTML(k, 'f3d time-icon'));
  }
  market.querySelectorAll('.nutri-tags span').forEach(s => {
    if (s.dataset.icon) return; s.dataset.icon = '1';
    const k = TAG_ICONS.find(([re]) => re.test(s.textContent.toLowerCase()))?.[1];
    if (k) s.insertAdjacentHTML('afterbegin', imgHTML(k, 'f3d-inline'));
  });
  const picked = market.querySelector('.nutri-product.selected');
  if (picked && !picked.dataset.flown) {
    picked.dataset.flown = '1';
    const from = picked.querySelector('.nutri-pack img'), cart = market.querySelector('.market-cart');
    if (from && cart && !reduceMotion) flyTo(from, cart, () => { cart.classList.remove('bump'); void cart.offsetWidth; cart.classList.add('bump'); });
  }
});
function flyTo(img, target, done) {
  const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
  const f = img.cloneNode(); f.className = 'f3d nutri-flyer';
  Object.assign(f.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
  document.body.append(f);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height * .35 - (a.top + a.height / 2);
  f.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)' },
    { transform: `translate(${dx * .5}px,${dy * .5 - 120}px) scale(1.15) rotate(200deg)`, offset: .45 },
    { transform: `translate(${dx}px,${dy}px) scale(.45) rotate(380deg)`, opacity: .9 }
  ], { duration: 900, easing: 'cubic-bezier(.45,.05,.4,1)' }).onfinish = () => { f.remove(); done?.(); };
}

/* ---------- 6. Compose ton assiette ---------- */
on(root => {
  const layout = root.querySelector('.meal-layout');
  if (!layout) return;
  const s = game(), round = (typeof plates !== 'undefined' && plates[s.round]) ? plates[s.round] : null;
  const plateEl = layout.querySelector('.mealplate');
  if (plateEl && !plateEl.querySelector('.plate-zones')) {
    plateEl.insertAdjacentHTML('afterbegin', '<i class="plate-cross"></i><div class="plate-zones"><span class="z-veg">Légumes & fruits</span><span class="z-starch">Féculents</span><span class="z-prot">Protéines</span><span class="z-drink">Boisson non sucrée</span></div>');
  }
  const grid = layout.querySelector('.foodgrid');
  /* Les 10 aliments restent ensemble : c'est au joueur de réfléchir à ses choix. */
  if (grid && !grid.dataset.mixed) {
    grid.dataset.mixed = '1';
    /* Ordre mélangé à l'affichage (les réponses et les points ne changent pas) */
    [...grid.querySelectorAll('.food')].map(b => [Math.random(), b]).sort((a, b) => a[0] - b[0]).forEach(([, b]) => grid.append(b));
    grid.querySelectorAll('.food').forEach(enableDrag);
  }

  /* Placement libre : un aliment glissé reste là où on l'a lâché */
  if (grid && !layout.dataset.freeInit) { layout.dataset.freeInit = '1'; freePos.clear(); }
  layout.querySelectorAll('.platefood').forEach((el, n) => {
    const i = s.selected?.[n], p = i !== undefined && freePos.get(i);
    if (p) { el.style.left = p[0] + '%'; el.style.top = p[1] + '%'; }
  });
  const feed = layout.parentElement?.querySelector('#feed.show');
  if (feed && plateEl && !plateEl.dataset.done) {
    plateEl.dataset.done = '1'; plateEl.classList.add('plate-done');
    const sp = document.createElement('div'); sp.className = 'plate-sparkles';
    sp.innerHTML = Array.from({ length: 14 }, (_, i) => `<i style="left:${50 + Math.cos(i) * 48}%;top:${50 + Math.sin(i * 1.3) * 48}%;animation-delay:${i * .06}s"></i>`).join('');
    plateEl.append(sp); setTimeout(() => sp.remove(), 2400);
  }
});
/* Positions choisies par le joueur (index de l'aliment → [x %, y %] dans l'assiette). */
const freePos = new Map();
const platePoint = (x, y) => {
  const box = document.querySelector('.plate-foods')?.getBoundingClientRect(); if (!box) return null;
  const px = (x - box.left) / box.width * 100, py = (y - box.top) / box.height * 100;
  return Math.hypot(px - 50, py - 50) <= 50 ? [Math.max(12, Math.min(88, px)), Math.max(12, Math.min(88, py))] : null;
};
/* Glisser un aliment vers l'assiette = même effet qu'un toucher, mais il reste où on le lâche. */
function enableDrag(btn) {
  if (btn.dataset.drag) return; btn.dataset.drag = '1';
  let start = null, ghost = null, suppress = false;
  btn.addEventListener('pointerdown', e => { if (btn.disabled) return; start = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
  btn.addEventListener('pointermove', e => {
    if (!start || btn.disabled) return;
    if (!ghost && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 12) {
      const src = btn.querySelector('img')?.src;
      ghost = document.createElement(src ? 'img' : 'div'); if (src) ghost.src = src; else { ghost.textContent = btn.textContent.replace('✓', '').trim(); ghost.style.fontSize = '54px'; }
      ghost.className = 'food-ghost'; document.body.append(ghost);
      try { btn.setPointerCapture(start.id); } catch (er) {}
    }
    if (ghost) {
      ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px';
      const plate = document.querySelector('.mealplate'), r = plate?.getBoundingClientRect();
      plate?.classList.toggle('drop-ok', !!r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
    }
  });
  const end = e => {
    if (ghost) {
      const plate = document.querySelector('.mealplate'), r = plate?.getBoundingClientRect();
      const over = r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
      plate?.classList.remove('drop-ok'); ghost.remove(); ghost = null; suppress = true; setTimeout(() => suppress = false, 50);
      const spot = over && platePoint(e.clientX, e.clientY), idx = +btn.dataset.i;
      if (spot) freePos.set(idx, spot);
      if (over && !btn.classList.contains('selected')) { suppress = false; btn.click(); suppress = true; setTimeout(() => suppress = false, 50); }
      else if (spot) { const n = (game().selected || []).indexOf(idx), el = document.querySelectorAll('.platefood')[n]; if (el) { el.style.left = spot[0] + '%'; el.style.top = spot[1] + '%'; } }
    }
    start = null;
  };
  btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end);
  btn.addEventListener('click', e => { if (suppress) { e.stopImmediatePropagation(); e.preventDefault(); } }, true);
}

/* ---------- 7. Qui suis-je ? ---------- */
on(root => {
  const orb = root.querySelector('.mystery-orb');
  if (!orb) return;
  if (!orb.dataset.key && typeof whoQs !== 'undefined') {
    const q = whoQs[(game().idx ?? 8) - 8] || whoQs[0];
    const key = foodKey(q.emoji, q.name); orb.dataset.key = key || '';
    orb.innerHTML = spinHTML(key, 'silhouette');
  }
  if (root.querySelector('.answer.correct')) orb.classList.add('revealed');
});

/* ---------- 8. Défi bombe : console d'arcade ---------- */
on(root => {
  const brief = root.querySelector('.bomb-briefing');
  if (brief && !brief.parentElement.classList.contains('arcade')) wrap([brief]);
  const head = root.querySelector('.bomb-rush-head'), panel = root.querySelector('.bomb-rush-panel');
  if (head && panel && !head.parentElement.classList.contains('arcade')) {
    wrap([head, panel]);
    head.insertAdjacentHTML('beforeend', '<span class="sprite sprite-strawberry prof-mini" role="img" aria-label="Professeur Fraise"></span>');
  }
  const q = root.querySelector('#rush-question');
  if (q && !q.querySelector('.q-icon')) {
    const txt = q.textContent, first = [...txt][0];
    const key = isEmoji(first) && foodKey(first);
    if (key) {
      const html = imgHTML(key, 'f3d q-icon');
      if (html) { q.textContent = txt.slice(first.length).trim(); q.insertAdjacentHTML('afterbegin', html); }
    }
  }
  /* Compteur « 1 / 10 / 10 questions » : on n'affiche le total qu'une fois */
  const count = root.querySelector('#rush-count');
  const tail = count?.nextSibling;
  if (tail && tail.nodeType === 3 && /\/\s*10/.test(count.textContent) && tail.textContent.includes('/ 10')) tail.textContent = ' questions';
  const list = root.querySelector('.bomb-review-list');
  if (list && !root.querySelector('.bomb-progress')) {
    const rows = [...list.querySelectorAll('.bomb-review')], ok = rows.filter(r => r.classList.contains('good')).length;
    const pct = rows.length ? Math.round(ok / rows.length * 100) : 0;
    list.insertAdjacentHTML('beforebegin', `<div class="bomb-progress"><div class="ring" style="--p:${pct}"><b>${ok}/${rows.length}</b></div><div class="dots">${rows.map((r, i) => `<i class="${r.classList.contains('good') ? 'ok' : 'ko'}" style="animation-delay:${i * .07}s">${i + 1}</i>`).join('')}</div></div>`);
  }
});
function wrap(nodes) {
  const box = document.createElement('div'); box.className = 'arcade';
  nodes[0].before(box); nodes.forEach(n => box.append(n));
}

/* ---------- Boucle d'observation ---------- */
let busy = false;
const observer = new MutationObserver(() => run());
function run() {
  if (busy) return; busy = true;
  observer.disconnect();
  try { for (const d of decorators) { try { d(app); } catch (e) { console.warn('[premium]', e); } } }
  finally {
    observer.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'src'], characterData: true });
    busy = false;
  }
}
if (iconsAvailable()) {
  const bm = document.querySelector('.brandmark'); if (bm) setIcon(bm, 'plate');
}
document.documentElement.classList.add('premium-ready');
run();

/* Assiette : un aliment déjà posé peut être déplacé au doigt, librement. */
let movingFood = null;
document.addEventListener('pointerdown', e => {
  const el = e.target.closest?.('.platefood'); if (!el || document.querySelector('#feed.show')) return;
  const n = [...document.querySelectorAll('.platefood')].indexOf(el), idx = game().selected?.[n];
  if (idx === undefined) return;
  movingFood = { el, idx }; el.setPointerCapture?.(e.pointerId); e.preventDefault();
});
document.addEventListener('pointermove', e => {
  if (!movingFood) return;
  const p = platePoint(e.clientX, e.clientY); if (!p) return;
  movingFood.el.style.transition = 'none'; movingFood.el.style.left = p[0] + '%'; movingFood.el.style.top = p[1] + '%'; freePos.set(movingFood.idx, p);
});
document.addEventListener('pointerup', () => { if (movingFood) { movingFood.el.style.transition = ''; movingFood = null; } });
