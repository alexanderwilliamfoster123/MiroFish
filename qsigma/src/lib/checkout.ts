// Lightweight event bus so any section can open the checkout flow without
// prop-drilling through the whole page.
export const CHECKOUT_EVENT = "qsigma:checkout";

export function openCheckout(portfolioName: string) {
  window.dispatchEvent(new CustomEvent(CHECKOUT_EVENT, { detail: { name: portfolioName } }));
}
