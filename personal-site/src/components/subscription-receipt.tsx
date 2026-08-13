import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useMemo } from "react";

interface SubscriptionReceiptProps {
  name: string;
  email: string;
  onContinue: () => void;
}

export function SubscriptionReceipt({
  name,
  email,
  onContinue,
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

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-12">
      <AnimatedTicket
        ticketId={receipt.ticketId}
        amount={0}
        date={receipt.date}
        cardHolder={name}
        email={email}
        last4Digits={receipt.last4Digits}
        barcodeValue={receipt.barcodeValue}
      />
      <div
        className="animate-fade-up flex flex-col items-center gap-6"
        style={{ animationDelay: "0.5s" }}
      >
        <div style={{ zoom: 0.72 }}>
          <LiquidMetalButton label="get started" onClick={onContinue} />
        </div>
      </div>
    </main>
  );
}
