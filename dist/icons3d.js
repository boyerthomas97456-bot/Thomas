/* Rendu des aliments 3D en images (une seule fois par aliment, puis mise en cache).
   Ces images remplacent les emojis dans les écrans HTML des jeux. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildFood } from './food3d.js';

const SIZE = 256;
let renderer = null, scene = null, camera = null, holder = null, failed = false;

export function sharedEnvironment(r) {
  const pmrem = new THREE.PMREMGenerator(r);
  const env = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  pmrem.dispose();
  return env;
}

export function studioLights(target, strength = 1) {
  target.add(new THREE.HemisphereLight(0xfff6e8, 0x9fb7c9, 1.1 * strength));
  const key = new THREE.DirectionalLight(0xfff0d8, 2.2 * strength); key.position.set(-2.5, 4, 3.5); target.add(key);
  const rim = new THREE.DirectionalLight(0xcfe8ff, 1.6 * strength); rim.position.set(3, 2.2, -3); target.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, .5 * strength); fill.position.set(2, -1, 3); target.add(fill);
}

function ensure() {
  if (renderer || failed) return !failed;
  try {
    const canvas = document.createElement('canvas');
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    /* Si le navigateur reprend ce contexte WebGL, on le recrée à la prochaine image. */
    canvas.addEventListener('webglcontextlost', () => { renderer = null; });
  } catch (e) { failed = true; return false; }
  renderer.setPixelRatio(1); renderer.setSize(SIZE, SIZE, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x000000, 0);
  scene = new THREE.Scene(); scene.environment = sharedEnvironment(renderer);
  studioLights(scene);
  camera = new THREE.PerspectiveCamera(28, 1, .1, 20); camera.position.set(0, .55, 2.75); camera.lookAt(0, 0, 0);
  holder = new THREE.Group(); scene.add(holder);
  return true;
}

const cache = new Map();
/* Image PNG (data URL) d'un aliment, vue de trois quarts. */
export function iconURL(key, angle = -.45) {
  const id = key + '|' + angle;
  if (cache.has(id)) return cache.get(id);
  if (!ensure()) return null;
  const m = buildFood(key, { size: 1.12 }); m.rotation.y = angle;
  holder.add(m); renderer.render(scene, camera); holder.remove(m);
  const url = renderer.domElement.toDataURL('image/png');
  cache.set(id, url); return url;
}

/* Bande d'images pour une rotation complète (animation CSS en « steps »). */
export function spinURL(key, frames = 16, size = 160) {
  const id = 'spin|' + key + '|' + frames;
  if (cache.has(id)) return cache.get(id);
  if (!ensure()) return null;
  const strip = document.createElement('canvas'); strip.width = size * frames; strip.height = size;
  const ctx = strip.getContext('2d'), m = buildFood(key, { size: 1.12 });
  holder.add(m);
  for (let i = 0; i < frames; i++) { m.rotation.y = i / frames * Math.PI * 2; renderer.render(scene, camera); ctx.drawImage(renderer.domElement, i * size, 0, size, size); }
  holder.remove(m);
  const url = strip.toDataURL('image/png'); cache.set(id, url); return url;
}
export const iconsAvailable = () => ensure();
