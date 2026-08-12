import * as React from "react";
import NumberFlow from "@number-flow/react";

const CAP = 10000;
const START = 8912;
const CEILING = CAP - 59; // keeps the count climbing without ever quite filling

export function SpotsCounter() {
  const [claimed, setClaimed] = React.useState(START);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setClaimed((c) => Math.min(c + 1 + Math.floor(Math.random() * 12), CEILING));
      timer = setTimeout(tick, 1200 + Math.random() * 2800);
    };
    timer = setTimeout(tick, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="flex items-baseline gap-2">
        <NumberFlow
          value={claimed}
          className="text-3xl font-semibold tabular-nums text-foreground"
        />
        <span className="text-muted-foreground">/ {CAP.toLocaleString("en-US")}</span>
      </p>
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        Founding spots claimed
      </p>
    </div>
  );
}
