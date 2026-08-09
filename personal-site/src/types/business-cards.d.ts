declare module "*/business-cards.js" {
  export interface BusinessCardsApp {
    goTo(index: number): void;
    open(index: number): void;
    close(): void;
    destroy(): void;
  }
  export interface BusinessCardsOptions {
    businesses: Array<{ name: string; tagline?: string; url?: string }>;
    background?: string;
    theme?: "dark" | "light";
    fontFamily?: string;
    linkLabel?: string;
  }
  export function mountBusinessCards(
    container: HTMLElement,
    options: BusinessCardsOptions,
  ): BusinessCardsApp;
}
