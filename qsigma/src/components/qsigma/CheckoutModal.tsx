import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { PaymentMethodSelector } from "@/components/ui/payment-1";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FONT = '"Satoshi", "Satoshi", "Inter Tight", system-ui, sans-serif';
const MOSS = "#5F7052";

const VisaIcon = () => (
  <span
    className="flex h-8 w-12 items-center justify-center rounded-md"
    style={{ backgroundColor: "#F4F6FA", border: "1px solid rgba(0,0,0,0.06)" }}
  >
    <svg width="34" height="12" viewBox="0 0 34 12" aria-label="Visa" role="img">
      <text
        x="17"
        y="10.5"
        textAnchor="middle"
        fontFamily="Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontStyle="italic"
        fontSize="12"
        letterSpacing="0.5"
        fill="#1A1F71"
      >
        VISA
      </text>
    </svg>
  </span>
);

const MastercardIcon = () => (
  <span
    className="flex h-8 w-12 items-center justify-center rounded-md"
    style={{ backgroundColor: "#F4F6FA", border: "1px solid rgba(0,0,0,0.06)" }}
  >
    <svg width="30" height="20" viewBox="0 0 30 20" aria-label="Mastercard" role="img">
      <circle cx="11.5" cy="10" r="8" fill="#EB001B" />
      <circle cx="18.5" cy="10" r="8" fill="#F79E1B" />
      <path
        d="M15 3.7a8 8 0 0 1 0 12.6 8 8 0 0 1 0-12.6Z"
        fill="#FF5F00"
      />
    </svg>
  </span>
);

const PayPalIcon = () => (
  <span
    className="flex h-8 w-12 items-center justify-center rounded-md"
    style={{ backgroundColor: "#F4F6FA", border: "1px solid rgba(0,0,0,0.06)" }}
  >
    <svg width="16" height="18" viewBox="0 0 24 28" aria-label="PayPal" role="img">
      <path
        d="M19.9 3.2C18.6 1.7 16.3 1 13.4 1H5.9c-.5 0-1 .4-1.1.9L1.7 21.5c-.1.4.2.8.6.8h4.6l1.2-7.4-.1.5c.1-.5.6-.9 1.1-.9h2.3c4.6 0 8.1-1.9 9.2-7.2v-.5c-.1-1.2-.3-2.1-.7-2.6Z"
        fill="#253B80"
      />
      <path
        d="M20.6 5.8v.5c-1 5.4-4.6 7.2-9.2 7.2H9.1c-.5 0-1 .4-1.1.9L6.8 22l-.4 2.3c0 .4.3.7.6.7h4.1c.5 0 .9-.3 1-.8v-.2l.8-4.9v-.3c.1-.5.5-.8 1-.8h.6c4 0 7.1-1.6 8-6.3.4-2 .2-3.6-.8-4.8-.3-.4-.7-.8-1.1-1.1Z"
        fill="#179BD7"
      />
    </svg>
  </span>
);

const PAYMENT_METHODS = [
  {
    id: "visa",
    icon: <VisaIcon />,
    label: "Visa **** 0912",
    description: "Pay with your Visa card",
  },
  {
    id: "mastercard",
    icon: <MastercardIcon />,
    label: "Mastercard **** 0912",
    description: "Pay with your Mastercard",
  },
  {
    id: "paypal",
    icon: <PayPalIcon />,
    label: "Pay with PayPal",
    description: "Checkout with your PayPal account",
  },
];

const STEPS = ["Review", "Payment", "Done"] as const;

interface CheckoutModalProps {
  portfolio: string | null;
  onClose: () => void;
}

const fmtUsd = (v: number) => "$" + Math.max(0, Math.round(v)).toLocaleString("en-US");

export default function CheckoutModal({ portfolio, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState(0);
  const [allocation, setAllocation] = useState(10000);
  const [processing, setProcessing] = useState(false);

  // Reset the flow each time a new checkout opens
  useEffect(() => {
    if (portfolio) {
      setStep(0);
      setProcessing(false);
    }
  }, [portfolio]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (portfolio) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [portfolio]);

  const pay = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep(2);
    }, 1600);
  };

  const monthlyFee = (allocation * 0.005) as number;

  return (
    <AnimatePresence>
      {portfolio && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto p-4 md:items-center md:p-8"
          style={{ fontFamily: FONT }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label={`Subscribe to ${portfolio}`}
        >
          <div
            className="fixed inset-0"
            style={{ background: "rgba(5,5,12,0.55)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-[520px] overflow-hidden rounded-2xl"
            style={{ backgroundColor: "#F7F7F5", boxShadow: "0 40px 120px rgba(5,5,12,0.4)" }}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header with steps */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
            >
              <div className="flex items-center gap-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wide"
                      style={{ color: i <= step ? "#05050C" : "rgba(0,0,0,0.30)" }}
                    >
                      {s}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className="h-px w-5" style={{ backgroundColor: i < step ? "#05050C" : "rgba(0,0,0,0.15)" }} />
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close checkout"
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-black/5"
                style={{ color: "#05050C" }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-6 md:px-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <p className="text-[13px] font-medium" style={{ color: "rgba(0,0,0,0.50)" }}>
                      Subscribing to
                    </p>
                    <h3 className="mt-1 text-[26px]" style={{ fontWeight: 600, letterSpacing: "-0.6px", color: "#05050C" }}>
                      {portfolio}
                    </h3>

                    <div className="mt-5">
                      <Label htmlFor="allocation" className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.45)" }}>
                        Initial allocation
                      </Label>
                      <div
                        className="mt-2 flex items-center rounded-xl"
                        style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.10)" }}
                      >
                        <span className="pl-4 text-[15px] font-medium" style={{ color: "rgba(0,0,0,0.40)" }}>$</span>
                        <Input
                          id="allocation"
                          type="number"
                          min={1000}
                          step={500}
                          value={allocation}
                          onChange={(e) => setAllocation(Number(e.target.value) || 0)}
                          className="border-0 bg-transparent text-[15px] font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
                          style={{ color: "#05050C" }}
                        />
                      </div>
                      <p className="mt-1.5 text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.40)" }}>
                        Deployed from your connected brokerage — funds never leave your account.
                      </p>
                    </div>

                    <div
                      className="mt-5 flex flex-col gap-3 rounded-xl p-4"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.07)" }}
                    >
                      <div className="flex items-center justify-between text-[14px] font-medium">
                        <span style={{ color: "rgba(0,0,0,0.55)" }}>One-time onboarding</span>
                        <span className="font-bold tabular-nums" style={{ color: "#05050C" }}>$2,497</span>
                      </div>
                      <div className="flex items-center justify-between text-[14px] font-medium">
                        <span style={{ color: "rgba(0,0,0,0.55)" }}>Platform fee</span>
                        <span className="tabular-nums" style={{ color: "rgba(0,0,0,0.55)" }}>
                          0.50% AUM / mo (≈ {fmtUsd(monthlyFee)})
                        </span>
                      </div>
                      <div
                        className="flex items-center justify-between pt-3 text-[15px] font-bold"
                        style={{ borderTop: "1px solid rgba(0,0,0,0.07)", color: "#05050C" }}
                      >
                        <span>Due today</span>
                        <span className="tabular-nums">$2,497</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="mt-6 w-full transition-colors duration-200 hover:bg-[#333333]"
                      style={{
                        backgroundColor: "#111111",
                        color: "#FFFFFF",
                        fontFamily: "inherit",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "9999px",
                        border: "none",
                        padding: "13px 20px",
                        cursor: "pointer",
                      }}
                    >
                      Continue to payment
                    </button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <PaymentMethodSelector
                      title="Choose how to pay"
                      actionText="Add new method"
                      methods={PAYMENT_METHODS}
                      defaultSelectedId="visa"
                    />

                    <div className="mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        disabled={processing}
                        className="flex-1 transition-colors duration-200 hover:bg-black/5 disabled:opacity-50"
                        style={{
                          backgroundColor: "transparent",
                          color: "#05050C",
                          fontFamily: "inherit",
                          fontWeight: 600,
                          fontSize: "13px",
                          borderRadius: "9999px",
                          border: "1px solid rgba(0,0,0,0.15)",
                          padding: "13px 20px",
                          cursor: "pointer",
                        }}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={pay}
                        disabled={processing}
                        className="flex flex-[2] items-center justify-center gap-2 transition-colors duration-200 hover:bg-[#333333] disabled:opacity-70"
                        style={{
                          backgroundColor: "#111111",
                          color: "#FFFFFF",
                          fontFamily: "inherit",
                          fontWeight: 600,
                          fontSize: "13px",
                          borderRadius: "9999px",
                          border: "none",
                          padding: "13px 20px",
                          cursor: "pointer",
                        }}
                      >
                        {processing && <Loader2 size={14} className="animate-spin" />}
                        {processing ? "Processing…" : "Pay $2,497"}
                      </button>
                    </div>
                    <p className="mt-3 text-center text-[11px] font-medium" style={{ color: "rgba(0,0,0,0.35)" }}>
                      Payments are encrypted and processed securely.
                    </p>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="done"
                    className="flex flex-col items-center py-6 text-center"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      className="flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ backgroundColor: "rgba(95,112,82,0.12)" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Check size={26} color={MOSS} strokeWidth={2.5} />
                    </motion.div>
                    <h3 className="mt-4 text-[24px]" style={{ fontWeight: 600, letterSpacing: "-0.5px", color: "#05050C" }}>
                      You're in
                    </h3>
                    <p className="mt-2 max-w-[340px] text-[14px] font-medium leading-[1.55]" style={{ color: "rgba(0,0,0,0.50)" }}>
                      {portfolio} is now live. Your first allocation of {fmtUsd(allocation)} deploys at
                      the next rebalance in your connected brokerage.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-7 w-full max-w-[240px] transition-colors duration-200 hover:bg-[#333333]"
                      style={{
                        backgroundColor: "#111111",
                        color: "#FFFFFF",
                        fontFamily: "inherit",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "9999px",
                        border: "none",
                        padding: "13px 20px",
                        cursor: "pointer",
                      }}
                    >
                      Back to site
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
