// main.js — bootstrap. Detects WebGL, builds the game, shows the start menu,
// and routes overlay button clicks. All heavy work lives in the subsystems.
import { Game } from './game.js';

function fail(msg) {
  document.getElementById('loading').style.display = 'none';
  const err = document.getElementById('err');
  document.getElementById('err-msg').textContent = msg;
  err.style.display = 'flex';
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
  <div class="tag">Procedural Combat Zone</div>
  <p>Hold the market district against eight waves of hostiles. Everything you
     see — the world, the weapons, the sound — is generated procedurally. No
     art assets. Survive to the final assault.</p>
  <div class="controls">
    <span class="k">WASD</span><span class="d">Move</span>
    <span class="k">MOUSE</span><span class="d">Aim</span>
    <span class="k">LMB</span><span class="d">Fire</span>
    <span class="k">RMB</span><span class="d">Aim down sights</span>
    <span class="k">R</span><span class="d">Reload</span>
    <span class="k">SHIFT</span><span class="d">Sprint</span>
    <span class="k">CTRL</span><span class="d">Crouch</span>
    <span class="k">SPACE</span><span class="d">Jump</span>
    <span class="k">1 2 3</span><span class="d">Rifle / SMG / Pistol</span>
    <span class="k">ESC</span><span class="d">Pause</span>
  </div>
  <button class="play" data-act="start">DEPLOY</button>
`;

function boot() {
  if (!hasWebGL2()) { fail('WebGL2 is not available in this browser.'); return; }

  let game;
  try {
    game = new Game(document.getElementById('app'));
  } catch (e) {
    fail('Could not initialise the renderer: ' + (e && e.message ? e.message : e));
    return;
  }

  game.hud.hideLoading();
  game.hud.showOverlay(MENU_HTML);

  // route all overlay buttons
  document.getElementById('overlay').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'start') game.start();
    else if (act === 'resume') game.resume();
    else if (act === 'restart') game.restart();
  });

  window.__game = game;   // handy for debugging
}

// wait for module + DOM
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// surface unexpected runtime errors instead of a black screen
window.addEventListener('error', (e) => {
  if (document.getElementById('err').style.display !== 'flex') {
    fail((e.message || 'Unknown error') + (e.filename ? ` (${e.filename.split('/').pop()}:${e.lineno})` : ''));
  }
});
