// signups flow into buttondown through its public embed endpoint — the
// same one its embeddable form posts to, so no api key ever ships to the
// browser. fire-and-forget: the login never waits on it or fails with it.
//
// set VITE_BUTTONDOWN_USERNAME (vercel -> project -> settings ->
// environment variables) to your buttondown username to switch it on.
// unset, the site behaves exactly as before: emails stay in the visitor's
// browser only.
const BUTTONDOWN_USERNAME = import.meta.env.VITE_BUTTONDOWN_USERNAME as
  | string
  | undefined;

export function subscribeVisitor(name: string, email: string) {
  if (!BUTTONDOWN_USERNAME) return;
  const body = new FormData();
  body.append("email", email);
  body.append("metadata__name", name);
  fetch(
    `https://buttondown.com/api/emails/embed-subscribe/${BUTTONDOWN_USERNAME}`,
    { method: "POST", mode: "no-cors", body },
  ).catch(() => {
    // a lost signup must never break the door
  });
}
