/**
 * Lightweight error-reporting hook used by the TanStack Router error
 * boundaries in __root.tsx. Kept dependency-free — it simply forwards the
 * error to the console with any boundary context so failures are visible in
 * development without requiring an external reporting service.
 */
export function reportLovableError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (typeof console !== "undefined") {
    console.error("[lovable] error report", context ?? {}, error);
  }
}
