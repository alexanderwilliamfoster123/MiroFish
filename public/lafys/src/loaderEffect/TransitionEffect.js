import { Effect } from 'postprocessing';
import { Uniform, Vector2, TextureLoader, RepeatWrapping } from 'three';
import { transitionFragmentShader } from './transition.glsl.js';
import { makeNoiseTexture } from './noiseTexture.js';

// Ассет mud-нормали разрешается относительно ЭТОГО модуля — поэтому достаточно
// скопировать папку effect/ целиком, путь подхватится бандлером (Vite/webpack 5).
// Можно переопределить через опцию { mudNormalUrl }.
const DEFAULT_MUD_URL = 'https://qclay.design/lovable/lafys/loaderEffect/mud_normal.webp';

/**
 * Переход «круг из центра» как Effect библиотеки postprocessing.
 * Полный порт hero-перехода lafys Editions: edge-dissolve + текстуры
 * шума/mud + HDR-glow (под bloom).
 *
 * Сам эффект НЕ знает о сценах. Оркестратор снаружи рендерит две сцены в
 * render target'ы и каждый кадр передаёт их текстуры через setInputs().
 */
export class TransitionEffect extends Effect {
  constructor({ mudNormalUrl = DEFAULT_MUD_URL } = {}) {
    const noise = makeNoiseTexture();
    const mud = new TextureLoader().load(mudNormalUrl);
    mud.wrapS = mud.wrapT = RepeatWrapping;

    super('TransitionEffect', transitionFragmentShader, {
      uniforms: new Map([
        ['tCurrent', new Uniform(null)],
        ['tNext', new Uniform(null)],
        ['tMudNormal', new Uniform(mud)],
        ['tNoise', new Uniform(noise)],
        ['uProgress', new Uniform(0)],
        ['uAspect', new Uniform(1)],
        ['uTime', new Uniform(0)],
        ['uMouse', new Uniform(new Vector2(0.5, 0.5))],
        ['uCenter', new Uniform(new Vector2(0.5, 0.5))],
      ]),
    });
  }

  /** Вызывается postprocessing'ом каждый кадр — копим время для анимации шума. */
  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('uTime').value += deltaTime;
  }

  /** Текстуры двух сцен + прогресс перехода (0..1). Звать каждый кадр. */
  setInputs(texCurrent, texNext, progress) {
    this.uniforms.get('tCurrent').value = texCurrent;
    this.uniforms.get('tNext').value = texNext;
    this.uniforms.get('uProgress').value = progress;
  }

  /** Курсор в uv (0..1). y должен быть перевёрнут под gl (1 - y). */
  setMouse(x, y) {
    this.uniforms.get('uMouse').value.set(x, y);
  }

  /** Центр раскрытия в uv (0..1). По умолчанию 0.5, 0.5. */
  setCenter(x, y) {
    this.uniforms.get('uCenter').value.set(x, y);
  }

  setAspect(width, height) {
    this.uniforms.get('uAspect').value = width / height;
  }
}
