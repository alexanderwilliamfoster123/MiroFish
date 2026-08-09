import { CodeBlock } from "@/components/ui/code-block";
import { useEffect, useMemo, useState } from "react";

interface WelcomeScriptProps {
  email: string;
}

export function WelcomeScript({ email }: WelcomeScriptProps) {
  const script = useMemo(
    () => `#!/usr/bin/env python3
# welcome.py — you are now living inside this script

visitor = "${email}"

world = {
    "name": "Alexander Foster",
    "builds": "quiet, careful software",
    "thinking_about": [
        "collective intelligence",
        "simulation",
        "interfaces that stay out of the way",
    ],
}

rooms = ["companies", "letters", "pictures", "movies"]

links = {
    "email": "alex@vertus.ai",
    "github": "github.com/alexanderwilliamfoster123",
}

socials = ["instagram", "x", "linkedin", "youtube"]  # below ↓

def enter(guest: str) -> None:
    print(f"welcome to the world of {world['name']}")
    print(f"you came through the door as {guest}")
    for room in rooms:
        print(f"  -> {room} is open")
    print("the dock below will take you anywhere")

if __name__ == "__main__":
    enter(visitor)
`,
    [email],
  );

  const [typed, setTyped] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 2;
      setTyped(script.slice(0, index));
      if (index >= script.length) {
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [script]);

  return (
    <CodeBlock
      language="python"
      filename="welcome.py"
      code={typed || " "}
      className="rounded-none border-0 bg-black px-6 pt-10 pb-6 sm:px-12 sm:pt-14 [&_pre]:!text-[13px] sm:[&_pre]:!text-sm"
    />
  );
}
