import { Gate } from "@/components/email-gate";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import { CursorLight } from "@/components/ui/cursor-light";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { World } from "@/components/world";
import { useEffect, useState } from "react";

const EMAIL_KEY = "gate:email";
const NAME_KEY = "gate:name";
const ENTERED_KEY = "gate:entered";

export default function App() {
  // every visit walks the whole door: email, name, ticket. the answers are
  // still written to localStorage so the contact compose can sign the mail.
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);

  // each answer is kept the moment it's given, so a half-finished
  // signup still leaves the email behind
  useEffect(() => {
    if (email) localStorage.setItem(EMAIL_KEY, email);
    else localStorage.removeItem(EMAIL_KEY);
  }, [email]);

  useEffect(() => {
    if (name) localStorage.setItem(NAME_KEY, name);
    else localStorage.removeItem(NAME_KEY);
  }, [name]);

  useEffect(() => {
    if (entered) localStorage.setItem(ENTERED_KEY, "1");
    else localStorage.removeItem(ENTERED_KEY);
  }, [entered]);

  let screen;
  if (!name || !email) {
    screen = (
      <Gate initialStep="email" onEmail={setEmail} onName={setName} />
    );
  } else if (!entered) {
    screen = (
      <SubscriptionReceipt
        name={name}
        email={email}
        onContinue={() => setEntered(true)}
      />
    );
  } else {
    screen = <World />;
  }

  return (
    <>
      <CursorLight />
      <ThemeToggle />
      {screen}
    </>
  );
}
