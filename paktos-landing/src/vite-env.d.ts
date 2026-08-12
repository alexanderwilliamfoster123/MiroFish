/// <reference types="vite/client" />

declare module "*.splinecode?url" {
  const url: string;
  export default url;
}

declare module "*.wasm?url" {
  const url: string;
  export default url;
}
