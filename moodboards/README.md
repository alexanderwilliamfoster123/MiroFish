# Moodboards

Drop reference images here to generate on-brand assets at scale.

## Use it

1. Make a folder: `moodboards/<board-name>/`
2. Drop your reference images in it (jpg, png, webp — subfolders fine)
3. Ask Claude: **"generate assets from the `<board-name>` moodboard"**

Claude measures the board's colour signature, reads the images to extract the
interpretive DNA (lighting, texture, grade, composition, subject world), registers
the board with Higgsfield as a Reference Element, and fans that DNA out into
batches of social/ad creative.

Before a full run it generates a short calibration pass for you to approve, so the
DNA gets tuned before credits go into 24 frames.

## What lands in your board folder

```
moodboards/<board-name>/
  <your images>
  ingest.json         measured palette, luminance, saturation, contrast
  dna.json            the brand DNA spec — the durable, versioned artefact
  brief.json          campaign concepts for a run
  runs/<run-id>/
    plan.json         the expanded prompt matrix
    assets/           downloaded images (gitignored)
    index.md          contact sheet with the prompt behind every frame
    provenance.json
```

`dna.json` is the thing worth keeping. Once it exists, later campaigns skip
extraction entirely — they are cheap draws against a look you have already pinned
down. Generated images stay out of git; every asset is reproducible from its plan row.

## Notes

- Roughly 8–20 images makes a good board. Fewer gives the DNA too little to
  generalise from; far more mostly adds noise once the look is established.
- A board should express **one** look. Two competing directions average into
  something that resembles neither — split them into two boards.
- Colour extraction wants Pillow: `python3 -m pip install pillow`. Without it the
  pipeline still runs, on the interpretive DNA alone.

The full workflow lives in `.claude/skills/moodboard-dna/SKILL.md`.
