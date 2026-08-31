interface LogoProps {
  /** White-on-dark variant */
  light?: boolean;
  /** Height of the layered-cube mark in px */
  markSize?: number;
  /** Wordmark font size in px */
  textSize?: number;
  withText?: boolean;
}

const INK = "#0D1B16";

/**
 * Squared³ — three layers, stacked until they form a cube.
 * Mark: stacked isometric layers. Wordmark: "Squared³" in Satoshi.
 */
const Logo = ({ light = false, markSize = 26, textSize = 20, withText = true }: LogoProps) => {
  const mark = light ? "#FFFFFF" : INK;
  const text = light ? "#FFFFFF" : "#05050C";

  return (
    <span className="inline-flex items-center" style={{ gap: markSize * 0.38 }}>
      <svg
        width={markSize}
        height={markSize}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        style={{ display: "block", flexShrink: 0 }}
      >
        <g fill={mark}>
          <path d="M32 7 L52 19 L32 31 L12 19 Z" />
          <path d="M12 27 L32 39 L52 27 L52 33 L32 45 L12 33 Z" />
          <path d="M12 38 L32 50 L52 38 L52 44 L32 56 L12 44 Z" />
        </g>
      </svg>
      {withText && (
        <span
          style={{
            fontWeight: 600,
            fontSize: textSize,
            letterSpacing: "-0.4px",
            color: text,
            lineHeight: 1,
            fontFamily: '"Satoshi", "Inter Tight", system-ui, sans-serif',
          }}
        >
          Squared
          <span
            style={{
              fontSize: textSize * 0.62,
              verticalAlign: "super",
              lineHeight: 0,
              marginLeft: 1,
            }}
          >
            3
          </span>
        </span>
      )}
    </span>
  );
};

export default Logo;
