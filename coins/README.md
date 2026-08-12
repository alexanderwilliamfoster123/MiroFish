# coins

A standalone page for the "shiny coins loop" Spline scene — nothing else,
by design. The vanilla Spline runtime is vendored in `vendor/spline/`, and
the scene itself streams from Spline's CDN
(`https://prod.spline.design/axM-a3i4zLUUEn54/scene.splinecode`), the same
way the original Next.js export loaded it.

## Run

```bash
python3 -m http.server 8080   # in this folder
# open http://localhost:8080
```

Or upload the folder to any static host.

## Notes

- To swap the scene, change `SCENE_URL` in `index.html`.
- The scene requires internet access at view time (it streams from Spline).
  To make it fully self-hosted, export/download the `.splinecode` file from
  the Spline editor, drop it in this folder, and point `SCENE_URL` at it —
  the local runtime loads local files too.
- This page is intentionally not linked from the library site; say the word
  to add it as a tab or a /command in the control panel.
