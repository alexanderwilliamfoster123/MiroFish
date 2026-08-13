import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useMemo } from "react";

interface SubscriptionReceiptProps {
  name: string;
  email: string;
  onReset: () => void;
}

export function SubscriptionReceipt({
  name,
  email,
  onReset,
}: SubscriptionReceiptProps) {
  const receipt = useMemo(() => {
    const now = new Date();
    const stamp = now.getTime().toString();
    return {
      date: now,
      ticketId: stamp.slice(-10),
      barcodeValue: stamp.slice(-13).padStart(13, "0"),
      last4Digits: stamp.slice(-4),
    };
  }, []);

  const firstName = name.trim().split(/\s+/)[0] ?? name;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <AnimatedTicket
        ticketId={receipt.ticketId}
        amount={0}
        date={receipt.date}
        cardHolder={name}
        last4Digits={receipt.last4Digits}
        barcodeValue={receipt.barcodeValue}
      />
      <div
        className="animate-fade-up flex flex-col items-center gap-3 text-center"
        style={{ animationDelay: "0.5s" }}
      >
        <p className="text-[14px] text-foreground">
          thanks, {firstName.toLowerCase()} — we&rsquo;ll be in touch in due
          course.
        </p>
        <p className="text-[12px] text-muted-foreground">{email}</p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
        >
          not you? start over
        </button>
      </div>
    </main>
  );
}
