import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lafys")({
  component: LafysPage,
});

export default function LafysPage() {
  return (
    <iframe src="/lafys/index.html" title="LAFYS"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: 0 }} />
  );
}
