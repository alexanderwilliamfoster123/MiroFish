# coins

Shiny gold coins on white, looping forever, with the owner's four-chevron
logo minted into both faces as relief geometry. Built natively in Three.js
(`coins.js` + `index.html`) so the logo could be added — the original
hosted Spline scene can't be edited from this environment; it is still
viewable via `spline-original.html`, which streams the scene from Spline's
CDN with the vendored runtime in `vendor/spline/`.

## Run

```bash
python3 -m http.server 8080   # in this folder
# open http://localhost:8080
```

## Notes

- The logo is a hand-traced vector approximation of the uploaded mark; send
  the real SVG and the trace can be swapped for exact paths.
- Coin count, sizes, tilts, and spin speeds are the `place(...)` calls at
  the bottom of `coins.js`.
- This page is intentionally standalone; say the word to link it from the
  library site (a tab or a /coins command in the control panel).
