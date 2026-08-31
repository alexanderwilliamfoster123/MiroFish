/**
 * Brokerage brand marks, drawn as inline SVG so they load instantly
 * and never depend on third-party asset hosts.
 */

const PUBLIC_BLUE = "#2D2DEF";
const ALPACA_YELLOW = "#FFD200";
const ALPACA_INK = "#3B3B3B";

/** Public.com — two blue dots. */
export const PublicMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ display: "block" }}>
    <circle cx="30" cy="22" r="20" fill={PUBLIC_BLUE} />
    <circle cx="14" cy="54" r="10" fill={PUBLIC_BLUE} />
  </svg>
);

/** Alpaca — yellow disc with a white alpaca silhouette. */
export const AlpacaMark = ({ size = 28 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" style={{ display: "block" }}>
    <circle cx="32" cy="32" r="32" fill={ALPACA_YELLOW} />
    <path
      d="M25 64 L25 36 C25 30 21.5 28.5 20.5 25.5 C19.5 22.5 21.5 19 25.5 17.2 L26.6 10.4 C27 8.2 30.2 8.2 30.7 10.4 L31.6 15.6 C32.7 15.4 33.9 15.3 35.1 15.5 L36.3 9.4 C36.8 7.2 40 7.4 40 9.8 L40 17.4 C43.2 19.6 44.5 23.4 44.5 28.5 L44.5 64 Z"
      fill="#FFFFFF"
    />
  </svg>
);

const wordmarkStyle = (height: number) => ({
  fontFamily: '"Satoshi", "Inter Tight", system-ui, sans-serif',
  fontSize: height * 0.62,
  lineHeight: 1,
  letterSpacing: "-0.02em",
});

/** Public.com lockup — dots + lowercase wordmark. */
export const PublicLogo = ({ height = 30 }: { height?: number }) => (
  <span className="inline-flex items-center" style={{ gap: height * 0.3 }}>
    <PublicMark size={height * 0.86} />
    <span style={{ ...wordmarkStyle(height), fontWeight: 500, color: "#0B0B0F" }}>public</span>
  </span>
);

/** Alpaca lockup — disc + bold wordmark. */
export const AlpacaLogo = ({ height = 30 }: { height?: number }) => (
  <span className="inline-flex items-center" style={{ gap: height * 0.3 }}>
    <AlpacaMark size={height * 0.94} />
    <span style={{ ...wordmarkStyle(height), fontWeight: 700, color: ALPACA_INK }}>Alpaca</span>
  </span>
);
