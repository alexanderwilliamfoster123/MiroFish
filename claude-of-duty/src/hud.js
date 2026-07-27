// hud.js — thin wrapper over the DOM HUD elements (crosshair, health, ammo,
// score, killfeed, compass, wave banner, overlays).
export class HUD {
  constructor() {
    this.el = {
      crosshair: document.getElementById('crosshair'),
      healthFill: document.getElementById('health-fill'),
      ammoMag: document.querySelector('#ammo .mag'),
      ammoReserve: document.querySelector('#ammo .reserve'),
      weaponName: document.getElementById('weapon-name'),
      reloadHint: document.getElementById('reload-hint'),
      waveInfo: document.getElementById('wave-info'),
      score: document.getElementById('score'),
      enemiesLeft: document.getElementById('enemies-left'),
      waveBanner: document.getElementById('wave-banner'),
      killfeed: document.getElementById('killfeed'),
      hitflash: document.getElementById('hitflash'),
      compassStrip: document.getElementById('compass-strip'),
      overlay: document.getElementById('overlay'),
      panel: document.getElementById('panel'),
      loading: document.getElementById('loading'),
      hud: document.getElementById('hud'),
    };
    this._hitTimer = 0;
    this._buildCompass();
  }

  hideLoading() { this.el.loading.style.display = 'none'; }

  setHealth(h, max) {
    const pct = Math.max(0, h / max) * 100;
    this.el.healthFill.style.width = pct + '%';
    this.el.healthFill.classList.toggle('low', pct < 35);
  }

  setAmmo(mag, reserve, name) {
    this.el.ammoMag.textContent = mag;
    this.el.ammoReserve.textContent = reserve;
    this.el.weaponName.textContent = name;
    this.el.ammoMag.style.color = mag === 0 ? '#ff5a4d' : '#fff';
  }

  setReloadHint(text) { this.el.reloadHint.textContent = text || ''; }

  setScore(s) { this.el.score.textContent = s.toLocaleString(); }
  setWave(w) { this.el.waveInfo.textContent = 'WAVE ' + w; }
  setEnemiesLeft(n) { this.el.enemiesLeft.textContent = n + (n === 1 ? ' HOSTILE' : ' HOSTILES'); }

  banner(main, sub, hold = 1.6) {
    const b = this.el.waveBanner;
    b.innerHTML = main + (sub ? `<span class="sub">${sub}</span>` : '');
    b.style.opacity = '1';
    clearTimeout(this._bannerT);
    this._bannerT = setTimeout(() => { b.style.opacity = '0'; }, hold * 1000);
  }

  kill(label = 'HOSTILE', headshot = false) {
    const d = document.createElement('div');
    d.innerHTML = `${headshot ? '💥 ' : ''}<span class="name">${label}</span> eliminated`;
    this.el.killfeed.appendChild(d);
    setTimeout(() => d.remove(), 3500);
    while (this.el.killfeed.children.length > 5) this.el.killfeed.firstChild.remove();
  }

  hitMarker() {
    this.el.crosshair.classList.add('hit');
    clearTimeout(this._hmT);
    this._hmT = setTimeout(() => this.el.crosshair.classList.remove('hit'), 90);
  }

  damageFlash() {
    this.el.hitflash.style.opacity = '1';
    clearTimeout(this._dfT);
    this._dfT = setTimeout(() => { this.el.hitflash.style.opacity = '0'; }, 90);
  }

  _buildCompass() {
    // labels every 45°: N NE E SE S SW W NW
    this.compassLabels = ['N', '45', 'NE', '75', 'E', '135', 'SE', '', 'S', '', 'SW', '', 'W', '', 'NW', ''];
  }

  // yaw in radians; 0 = facing -z which we call North
  setCompass(yaw) {
    // build a strip showing headings around current yaw
    let deg = ((yaw * 180 / Math.PI) % 360 + 360) % 360;
    const cards = { 0: 'N', 45: 'NE', 90: 'E', 135: 'SE', 180: 'S', 225: 'SW', 270: 'W', 315: 'NW' };
    let html = '';
    for (let d = -90; d <= 90; d += 15) {
      const h = Math.round((deg + d) / 15) * 15 % 360;
      const hn = (h + 360) % 360;
      const label = cards[hn] !== undefined ? `<span class="card">${cards[hn]}</span>` : `<span>${hn}</span>`;
      html += `<span class="tick">${label}</span>`;
    }
    this.el.compassStrip.innerHTML = html;
  }

  showOverlay(html) {
    this.el.panel.innerHTML = html;
    this.el.overlay.classList.remove('hidden');
  }
  hideOverlay() { this.el.overlay.classList.add('hidden'); }
}
