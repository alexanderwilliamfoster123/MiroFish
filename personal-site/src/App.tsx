import { CaptureStep } from "@/components/email-gate";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import { useEffect, useState } from "react";

const EMAIL_KEY = "gate:email";
const NAME_KEY = "gate:name";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(EMAIL_KEY),
  );
  const [name, setName] = useState<string | null>(() =>
    localStorage.getItem(NAME_KEY),
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

  if (!email) {
    return (
      <CaptureStep
        key="email"
        heading="Every world needs a key."
        sub="Yours is an email."
        placeholder="you@somewhere.com"
        validate={(value) => EMAIL_PATTERN.test(value)}
        errorText="That doesn’t look right."
        onSubmit={setEmail}
      />
    );
  }

  if (!name) {
    return (
      <CaptureStep
        key="name"
        heading="And your name."
        placeholder="your name"
        allowSpaces
        onSubmit={setName}
      />
    );
  }

  return (
    <SubscriptionReceipt
      name={name}
      email={email}
      onReset={() => {
        setEmail(null);
        setName(null);
      }}
    />
  );
}
