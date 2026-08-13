import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useMemo } from "react";

interface SubscriptionReceiptProps {
  name: string;
  onReset: () => void;
}

export function SubscriptionReceipt({ name, onReset }: SubscriptionReceiptProps) {
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
      <button
        type="button"
        onClick={onReset}
        className="animate-fade-up cursor-pointer text-[11px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-foreground"
        style={{ animationDelay: "0.5s" }}
      >
        not you? start over
      </button>
    </main>
  );
}
