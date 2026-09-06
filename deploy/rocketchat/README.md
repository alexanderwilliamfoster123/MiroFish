# Paktos Hubs — live server (Rocket.Chat)

The Hubs section of `static/live-dashboard.html` can run against a real,
self-hosted [Rocket.Chat](https://rocket.chat) server (MIT-licensed community
core) — real channels, real messages, photo and file sharing. Without a server
it falls back to the built-in demo communities automatically.

## Boot the server

```sh
cd deploy/rocketchat
docker compose up -d
```

First boot pulls the images and takes a couple of minutes. The server is up
when `http://localhost:3000` answers. Default admin login is
`admin` / `paktos-admin-2026` (override with `ADMIN_USERNAME` / `ADMIN_PASS`
env vars — do this before exposing the server anywhere public).

Create the channels you want (e.g. `#lessons`, `#calls`, `#results`, `#wins`)
from the Rocket.Chat admin UI at `http://localhost:3000`, or via
`POST /api/v1/channels.create`.

## Connect the app

Open the Paktos dashboard → **Social → Communities** → **Connect live
server →** in the left panel. Enter the server URL and the login. The
lightning-bolt icon in the community rail is the live server; everything else
stays demo. The session persists in `localStorage` and **Disconnect** returns
to demo mode.

What works over the live connection: channel list, message history,
posting, photo upload (renders inline), any-file upload (download chip),
member roster with presence, and near-real-time updates via polling.

## Notes

- The compose file presets CORS, disables the REST rate limiter and 2FA, and
  makes uploaded files publicly readable — the settings the browser client
  needs. Tighten `API_CORS_Origin` to your real origin in production.
- The claude.ai artifact preview cannot reach any server (strict CSP) — it
  always runs in demo mode. Connect from a locally served copy instead.
- Polling runs on the app's 1.5 s ticker; swap to the Realtime API
  (WebSocket/DDP) when message volume justifies it.
