import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import {
  GlassCard,
  GlassCardHeader,
  GlassCardTitle,
  GlassCardContent,
  GlassCardDescription,
  GlassCardAction,
  GlassCardFooter,
} from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const BG = "https://qclay.design/lovable/synex/GrassTree.png";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setDone(true);
  };

  const close = () => {
    onClose();
    setDone(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label={mode === "signup" ? "Create your account" : "Login to your account"}
        >
          {/* Background image + dark veil */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "#F2F2F0",
              backgroundImage: `url(${BG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            onClick={close}
          />
          {/* Whisper of a veil — keeps the moss vibrant while lifting card contrast */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "rgba(5, 5, 12, 0.10)" }}
          />

          <motion.div
            className="relative w-full max-w-sm"
            initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute -top-12 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition hover:bg-white/30"
            >
              <X size={16} />
            </button>

            <GlassCard className="w-full bg-black/45 border-white/25 shadow-[0_30px_80px_rgba(5,5,12,0.35)]">
              {done ? (
                <GlassCardContent className="py-10 text-center">
                  <GlassCardTitle className="text-lg">
                    {mode === "signup" ? "You're on the list" : "Welcome back"}
                  </GlassCardTitle>
                  <GlassCardDescription className="mt-2 text-white/80">
                    {mode === "signup"
                      ? "We'll email you as soon as your Squared³ access is ready."
                      : "Redirecting you to your dashboard…"}
                  </GlassCardDescription>
                  <Button className="mt-6 w-full rounded-full" onClick={close}>
                    Back to site
                  </Button>
                </GlassCardContent>
              ) : (
                <>
                  <GlassCardHeader>
                    <GlassCardTitle>
                      {mode === "signup"
                        ? "Create your Squared³ account"
                        : "Login to your account"}
                    </GlassCardTitle>
                    <GlassCardDescription className="text-white/80">
                      {mode === "signup"
                        ? "Subscribe to strategies in minutes. No upfront fees."
                        : "Enter your email below to login to your account"}
                    </GlassCardDescription>
                    <GlassCardAction>
                      <Button
                        variant="link"
                        className="text-white"
                        onClick={() =>
                          setMode(mode === "signup" ? "login" : "signup")
                        }
                      >
                        {mode === "signup" ? "Login" : "Sign Up"}
                      </Button>
                    </GlassCardAction>
                  </GlassCardHeader>
                  <GlassCardContent>
                    <form id="auth-form" onSubmit={handleSubmit}>
                      <div className="flex flex-col gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="auth-email">Email</Label>
                          <Input
                            id="auth-email"
                            type="email"
                            placeholder="m@example.com"
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-center">
                            <Label htmlFor="auth-password">Password</Label>
                            {mode === "login" && (
                              <a
                                href="#"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                              >
                                Forgot your password?
                              </a>
                            )}
                          </div>
                          <Input id="auth-password" type="password" required />
                        </div>
                      </div>
                    </form>
                  </GlassCardContent>
                  <GlassCardFooter className="flex-col gap-2">
                    <Button
                      type="submit"
                      form="auth-form"
                      className="w-full rounded-full"
                    >
                      {mode === "signup" ? "Request access" : "Login"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full rounded-full text-white hover:bg-white/10 hover:text-white"
                      type="button"
                    >
                      Continue with Google
                    </Button>
                  </GlassCardFooter>
                </>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
