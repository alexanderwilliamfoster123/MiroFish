import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { AnimatedTicket } from "@/components/ui/ticket-confirmation-card";
import { useMemo } from "react";

interface SubscriptionReceiptProps {
  email: string;
  onContinue: () => void;
}

export function SubscriptionReceipt({
  email,
  onContinue,
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
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 px-6 py-16">
      <AnimatedTicket
        ticketId={receipt.ticketId}
        amount={0}
        date={receipt.date}
        cardHolder={receipt.cardHolder}
        last4Digits={receipt.last4Digits}
        barcodeValue={receipt.barcodeValue}
      />
      <div className="animate-fade-up flex flex-col items-center gap-4" style={{ animationDelay: "0.6s" }}>
        <p className="text-[13px] tracking-wide text-muted-foreground">
          You&rsquo;re subscribed as {email}
        </p>
        <LiquidMetalButton label="Step inside" onClick={onContinue} />
      </div>
    </main>
  );
}
