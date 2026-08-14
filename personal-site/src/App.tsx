import { CursorLight } from "@/components/ui/cursor-light";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { World } from "@/components/world";

// returning visitors are already signed in; open the site with #fresh to
// forget the stored visitor and walk the login again (handy for demos)
if (typeof window !== "undefined" && window.location.hash === "#fresh") {
  localStorage.removeItem("gate:email");
  localStorage.removeItem("gate:name");
  localStorage.removeItem("gate:entered");
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

export default function App() {
  return (
    <>
      <CursorLight />
      <ThemeToggle />
      <World />
    </>
  );
}
