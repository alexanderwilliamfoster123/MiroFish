import { Gate } from "@/components/email-gate";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import { World } from "@/components/world";
import { useEffect, useState } from "react";

const EMAIL_KEY = "gate:email";
const NAME_KEY = "gate:name";
const ENTERED_KEY = "gate:entered";

export default function App() {
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(EMAIL_KEY),
  );
  const [name, setName] = useState<string | null>(() =>
    localStorage.getItem(NAME_KEY),
  );
  const [entered, setEntered] = useState<boolean>(
    () => localStorage.getItem(ENTERED_KEY) === "1",
  );

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

  const reset = () => {
    setEmail(null);
    setName(null);
    setEntered(false);
  };

  if (!name || !email) {
    return (
      <Gate
        initialStep={email ? "name" : "email"}
        onEmail={setEmail}
        onName={setName}
      />
    );
  }

  if (!entered) {
    return (
      <SubscriptionReceipt
        name={name}
        email={email}
        onContinue={() => setEntered(true)}
        onReset={reset}
      />
    );
  }

  return <World onLeave={reset} />;
}
