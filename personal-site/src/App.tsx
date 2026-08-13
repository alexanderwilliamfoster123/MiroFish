import { Gate } from "@/components/email-gate";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import { useEffect, useState } from "react";

const EMAIL_KEY = "gate:email";
const NAME_KEY = "gate:name";

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

  if (!name || !email) {
    return (
      <Gate
        initialStep={email ? "name" : "email"}
        onEmail={setEmail}
        onName={setName}
      />
    );
  }

  return (
    <SubscriptionReceipt
      name={name}
      onReset={() => {
        setEmail(null);
        setName(null);
      }}
    />
  );
}
