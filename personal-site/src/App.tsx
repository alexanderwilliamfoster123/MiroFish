import { EmailGate } from "@/components/email-gate";
import { SubscriptionReceipt } from "@/components/subscription-receipt";
import { useEffect, useState } from "react";

const STORAGE_KEY = "gate:email";

export default function App() {
  const [email, setEmail] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );

  useEffect(() => {
    if (email) {
      localStorage.setItem(STORAGE_KEY, email);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [email]);

  if (!email) {
    return <EmailGate onEnter={setEmail} />;
  }

  return <SubscriptionReceipt email={email} onReset={() => setEmail(null)} />;
}
