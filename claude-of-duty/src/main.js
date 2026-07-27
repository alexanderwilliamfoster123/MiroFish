// main.js — bootstrap + mode select. Creates one shared renderer and lets the
// player pick On-Foot (Game) or Flight Combat (FlightGame). Switching modes
// reloads the page (instant — everything is local), which keeps teardown
// trivial and bulletproof.
import * as THREE from 'three';
import { Game } from './game.js';
import { FlightGame } from './flight.js';
import { AudioEngine } from './audio.js';

const container = document.getElementById('app');
const overlayEl = document.getElementById('overlay');
const panelEl = document.getElementById('panel');
const hudEl = document.getElementById('hud');

function showOverlay(html) { panelEl.innerHTML = html; overlayEl.classList.remove('hidden'); }
function hideOverlay() { overlayEl.classList.add('hidden'); }

function fail(msg) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('err-msg').textContent = msg;
  document.getElementById('err').style.display = 'flex';
  console.error(msg);
}

function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGL2RenderingContext && c.getContext('webgl2'));
  } catch (e) { return false; }
}

const MENU_HTML = `
  <h1>CLAUDE OF DUTY</h1>
  <div class="tag">Choose your battlefield</div>
  <div class="modes">
    <button class="mode" data-act="onfoot">
      <div class="mi">🔫</div>
      <div class="mt">GROUND WAR</div>
      <div class="md">On-foot FPS. Hold the market district against 8 waves of infantry.</div>
    </button>
    <button class="mode" data-act="flight">
      <div class="mi">✈️</div>
      <div class="mt">FLIGHT COMBAT</div>
      <div class="md">Jet dogfighting over the ocean. Guns, heat-seekers & flares vs enemy aces.</div>
    </button>
  </div>
  <p style="font-size:13px;opacity:.6;margin-top:22px">Click a mode, then click the screen to lock your mouse. Esc pauses.</p>
`;

const GROUND_CONTROLS = `
  <div class="controls">
    <span class="k">WASD</span><span class="d">Move</span>
    <span class="k">MOUSE</span><span class="d">Aim</span>
    <span class="k">LMB</span><span class="d">Fire</span>
    <span class="k">RMB</span><span class="d">Aim down sights</span>
    <span class="k">R</span><span class="d">Reload</span>
    <span class="k">SHIFT</span><span class="d">Sprint · CTRL Crouch · SPACE Jump</span>
    <span class="k">1 2 3</span><span class="d">Rifle / SMG / Pistol</span>
  </div>`;

const FLIGHT_CONTROLS = `
  <div class="controls">
    <span class="k">MOUSE</span><span class="d">Steer (pitch & roll)</span>
    <span class="k">W / S</span><span class="d">Throttle up / down</span>
    <span class="k">SHIFT</span><span class="d">Afterburner</span>
    <span class="k">LMB</span><span class="d">Cannon</span>
    <span class="k">RMB</span><span class="d">Fire missile (hold nose on target to LOCK)</span>
    <span class="k">X</span><span class="d">Deploy flares</span>
    <span class="k">Q / E</span><span class="d">Rudder yaw</span>
    <span class="k">V</span><span class="d">Cockpit / chase cam</span>
  </div>`;

let renderer, mode = null, active = null;

function makeRenderer() {
  const r = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setSize(window.innerWidth, window.innerHeight);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(r.domElement);
  window.addEventListener('resize', () => r.setSize(window.innerWidth, window.innerHeight));
  return r;
}

function startGround() {
  hudEl.style.display = '';
  mode = 'ground';
  active = new Game(container, renderer);
  active.start();
  window.__game = active;
}

function startFlight() {
  hudEl.style.display = 'none';
  mode = 'flight';
  const audio = new AudioEngine();
  active = new FlightGame(container, renderer, audio);
  active.arm();
  active.onPause = () => showOverlay(`
    <h1>PAUSED</h1><div class="tag">Holding pattern</div>
    <div class="stat">Wave <b>${active.wave}</b> · Score <b>${active.score.toLocaleString()}</b></div>
    <button class="play" data-act="resume">RESUME</button>
    <button class="play alt" data-act="menu">MAIN MENU</button>`);
  active.onEnd = (win) => showOverlay(`
    <h1>${win ? 'AIR SUPERIORITY' : 'SHOT DOWN'}</h1>
    <div class="tag">${win ? 'All bandits splashed' : 'KIA · Wave ' + active.wave}</div>
    <div class="stat">Score <b>${active.score.toLocaleString()}</b></div>
    <div class="stat">Kills <b>${active.kills}</b></div>
    <button class="play" data-act="restart">RE-ARM</button>
    <button class="play alt" data-act="menu">MAIN MENU</button>`);
  active.start();
  window.__flight = active;
}

function boot() {
  if (!hasWebGL2()) { fail('WebGL2 is not available in this browser.'); return; }
  try {
    renderer = makeRenderer();
  } catch (e) {
    fail('Could not initialise the renderer: ' + (e && e.message ? e.message : e));
    return;
  }
  document.getElementById('loading').style.display = 'none';
  hudEl.style.display = 'none';
  showOverlay(MENU_HTML);

  overlayEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'onfoot') { hideOverlay(); startGround(); }
    else if (act === 'flight') { hideOverlay(); startFlight(); }
    else if (act === 'resume') { active && active.resume(); }
    else if (act === 'restart') { active && active.restart(); }
    else if (act === 'menu') { location.reload(); }
  });
}

if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', boot);
else boot();

window.addEventListener('error', (e) => {
  if (document.getElementById('err').style.display !== 'flex') {
    fail((e.message || 'Unknown error') + (e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''));
  }
});
