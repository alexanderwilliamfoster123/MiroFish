export const AUTH_EVENT = "qsigma:auth";

/** Open the global auth modal from anywhere (any page, any component). */
export function openAuth(mode: "signup" | "login" = "signup") {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { mode } }));
}
