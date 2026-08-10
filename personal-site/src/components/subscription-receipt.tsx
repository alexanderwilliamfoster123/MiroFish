import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useMemo } from "react";

interface SubscriptionReceiptProps {
  email: string;
  onReset: () => void;
}

export function SubscriptionReceipt({
  email,
  onReset,
}: SubscriptionReceiptProps) {
  const receipt = useMemo(() => {
    const now = new Date();
    const stamp = now.getTime().toString();
    const localPart = email.split("@")[0] ?? "subscriber";
    const holder = localPart
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      date: now,
      ticketId: stamp.slice(-10),
      barcodeValue: stamp.slice(-13).padStart(13, "0"),
      last4Digits: stamp.slice(-4),
      cardHolder: holder || "New Subscriber",
    };
  }, [email]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <AnimatedTicket
        ticketId={receipt.ticketId}
        amount={0}
        date={receipt.date}
        cardHolder={receipt.cardHolder}
        last4Digits={receipt.last4Digits}
        barcodeValue={receipt.barcodeValue}
      />
      <div
        className="animate-fade-up flex flex-col items-center gap-3 text-center"
        style={{ animationDelay: "0.5s" }}
      >
        <p className="text-[14px] text-foreground">
          thanks for the email — we&rsquo;ll be in touch in due course.
        </p>
        <p className="text-[12px] text-muted-foreground">{email}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 cursor-pointer text-[11px] tracking-[0.2em] text-faint uppercase transition-colors duration-300 hover:text-foreground"
        >
          not you? start over
        </button>
      </div>
    </main>
  );
}
