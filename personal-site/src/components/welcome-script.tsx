import { CodeBlock } from "@/components/ui/code-block";
import { useEffect, useState } from "react";

const SCRIPT = `// welcome.ts
const world = "Alexander Foster";
const say = console.log;

say(\`Welcome to the world\`);
say(\`of \${world}.\`);
say("Companies. Letters.");
say("Pictures. Movies.");`;

export function WelcomeScript() {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTyped(SCRIPT.slice(0, index));
      if (index >= SCRIPT.length) {
        clearInterval(interval);
      }
    }, 18);
    return () => clearInterval(interval);
  }, []);

  return (
    <CodeBlock language="tsx" filename="welcome.ts" code={typed || " "} />
  );
}
