interface LogoProps {
  /** White-on-dark variant */
  light?: boolean;
  /** Height of the square mark in px */
  markSize?: number;
  /** Wordmark font size in px */
  textSize?: number;
  withText?: boolean;
}

const MOSS_DARKBG = "#A3B18A";
const MOSS_LIGHTBG = "#5F7052";

/** alpha³ — square α mark with a cubed accent, plus lowercase wordmark. */
const Logo = ({ light = false, markSize = 26, textSize = 20, withText = true }: LogoProps) => {
  const markBg = light ? "#FFFFFF" : "#111111";
  const markFg = light ? "#05050C" : "#FFFFFF";
  const cube = light ? MOSS_LIGHTBG : MOSS_DARKBG;
  const text = light ? "#FFFFFF" : "#05050C";
  const cubeText = light ? MOSS_DARKBG : MOSS_LIGHTBG;

  return (
    <span className="inline-flex items-center" style={{ gap: markSize * 0.32 }}>
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{
          width: markSize,
          height: markSize,
          borderRadius: markSize * 0.28,
          backgroundColor: markBg,
        }}
        aria-hidden="true"
      >
        <span
          style={{
            color: markFg,
            fontSize: markSize * 0.62,
            lineHeight: 1,
            fontWeight: 600,
            transform: `translate(-${markSize * 0.05}px, ${markSize * 0.02}px)`,
          }}
        >
          α
        </span>
        <span
          className="absolute"
          style={{
            top: markSize * 0.12,
            right: markSize * 0.14,
            color: cube,
            fontSize: markSize * 0.34,
            lineHeight: 1,
            fontWeight: 700,
          }}
        >
          3
        </span>
      </span>
      {withText && (
        <span
          style={{
            fontWeight: 700,
            fontSize: textSize,
            letterSpacing: "-0.5px",
            color: text,
            lineHeight: 1,
          }}
        >
          alpha<span style={{ color: cubeText }}>³</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
