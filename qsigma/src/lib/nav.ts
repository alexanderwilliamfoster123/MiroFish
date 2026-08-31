/**
 * In-page section scrolling that coexists with hash routing.
 * Plain `href="#id"` anchors would fight the router's hash URLs,
 * so section jumps are done imperatively.
 */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
