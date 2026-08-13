import { EmailGate } from "@/components/email-gate";
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

  useEffect(() => {
    if (email && name) {
      localStorage.setItem(EMAIL_KEY, email);
      localStorage.setItem(NAME_KEY, name);
    } else {
      localStorage.removeItem(EMAIL_KEY);
      localStorage.removeItem(NAME_KEY);
    }
  }, [email, name]);

  if (!email || !name) {
    return (
      <EmailGate
        onEnter={(newName, newEmail) => {
          setName(newName);
          setEmail(newEmail);
        }}
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
