// Vanilla port of the LiquidMetalButton React component the user supplied:
// same layer stack (label / dark inner pill / shader shell / hit target),
// same @paper-design/shaders liquid-metal uniforms, hover speed-up, press
// states, and click ripples — without React, Tailwind, or shadcn.

import { ShaderMount, liquidMetalFragmentShader } from "@paper-design/shaders";

export function createLiquidMetalButton({ label = "enter", onClick } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "lm-wrap";
  wrap.innerHTML = `
    <div class="lm-stage">
      <div class="lm-layer lm-label"><span></span></div>
      <div class="lm-layer lm-mid"><div class="lm-inner"></div></div>
      <div class="lm-layer lm-base"><div class="lm-shell"><div class="lm-shader"></div></div></div>
      <button class="lm-hit" type="button"></button>
    </div>`;

  wrap.querySelector(".lm-label span").textContent = label;
  const stage = wrap.querySelector(".lm-stage");
  const hit = wrap.querySelector(".lm-hit");
  hit.setAttribute("aria-label", label);

  let mount = null;
  try {
    mount = new ShaderMount(
      wrap.querySelector(".lm-shader"),
      liquidMetalFragmentShader,
      {
        u_repetition: 4,
        u_softness: 0.5,
        u_shiftRed: 0.3,
        u_shiftBlue: 0.3,
        u_distortion: 0,
        u_contour: 0,
        u_angle: 45,
        u_scale: 8,
        u_shape: 1,
        u_offsetX: 0.1,
        u_offsetY: -0.1
      },
      undefined,
      0.6
    );
  } catch {
    // shader failed: the styled pill still works as a plain button
    wrap.querySelector(".lm-shell").classList.add("lm-static");
  }

  const setSpeed = (v) => mount?.setSpeed?.(v);
  let hovered = false;

  hit.addEventListener("mouseenter", () => { hovered = true; stage.classList.add("hover"); setSpeed(1); });
  hit.addEventListener("mouseleave", () => {
    hovered = false;
    stage.classList.remove("hover", "pressed");
    setSpeed(0.6);
  });
  hit.addEventListener("pointerdown", () => stage.classList.add("pressed"));
  hit.addEventListener("pointerup", () => stage.classList.remove("pressed"));
  hit.addEventListener("click", (e) => {
    setSpeed(2.4);
    setTimeout(() => setSpeed(hovered ? 1 : 0.6), 300);
    const rect = hit.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "lm-ripple";
    ripple.style.left = `${e.clientX - rect.left || rect.width / 2}px`;
    ripple.style.top = `${e.clientY - rect.top || rect.height / 2}px`;
    hit.appendChild(ripple);
    setTimeout(() => ripple.remove(), 650);
    onClick?.();
  });

  return {
    el: wrap,
    destroy() {
      mount?.destroy?.();
      wrap.remove();
    }
  };
}
