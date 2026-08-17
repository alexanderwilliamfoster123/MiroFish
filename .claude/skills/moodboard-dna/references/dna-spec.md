# The `dna.json` spec

The durable artefact. Every run draws against it; nothing else in the pipeline is
worth keeping if this is vague.

## Schema

| Field | Type | Purpose |
|---|---|---|
| `board` | string | Board name, matches the folder |
| `version` | int | Bump on every edit — pins a run's assets to a DNA revision |
| `model` | string | Higgsfield model id (default `nano_banana_2`) |
| `element_id` | string \| null | Reference Element id for the board |
| `reference_media_ids` | string[] | Confirmed media ids, used when `element_id` is null |
| `palette.dominant` | `{hex,name}[]` | The 2–3 colours carrying the frame |
| `palette.accent` | `{hex,name}[]` | Small-area colours that punctuate |
| `palette.neutral` | `{hex,name}[]` | Grounds, papers, shadows |
| `lighting` | string | Direction, hardness, temperature, sources |
| `texture` | string | Grain, surface finish, material imperfection |
| `grade` | string | Tone curve, black level, split toning |
| `composition` | string | Framing discipline, symmetry, negative-space habit |
| `subject_world` | string | What the board is *about* — materials, casting, props |
| `mood` | string[] | 4–6 adjectives, the emotional register |
| `anti_dna` | string[] | Explicit exclusions — the look's boundaries |

## Writing rules

**Be specific enough to be falsifiable.** "Moody lighting" steers nothing. "Single
hard key from frame left at roughly 45°, no fill, shadows falling to near-black"
produces a repeatable result.

**Sort the palette by role, not by coverage.** `ingest.json` gives coverage weights;
use them to decide roles. The highest-weight swatch is usually a neutral ground, not
the brand colour — dropping raw weights straight into `dominant` is the most common
way a run comes back looking washed out.

**Anti-DNA is load-bearing.** Generation models regress toward stock defaults. Write
exclusions for what the board conspicuously lacks: if nobody is smiling at camera,
say so; if there is no lens flare, say so.

**`subject_world` is not the concept.** It constrains the world every concept is
rendered in — materials, casting, environments. The concepts in `brief.json` say
what is depicted; this says what may appear at all.

## Worked example

```json
{
  "board": "aurora",
  "version": 2,
  "model": "nano_banana_2",
  "element_id": "4f2c8a11-...-9d3e",
  "reference_media_ids": [],
  "palette": {
    "dominant": [
      { "hex": "#0B1D26", "name": "deep petrol" },
      { "hex": "#1F4A52", "name": "oxidised teal" }
    ],
    "accent": [{ "hex": "#E8734A", "name": "burnt coral" }],
    "neutral": [
      { "hex": "#E8E2D5", "name": "bone" },
      { "hex": "#8C8577", "name": "wet stone" }
    ]
  },
  "lighting": "single hard key from frame left at roughly 45 degrees, no fill, shadows falling to near-black; occasional cool north-window daylight on interiors",
  "texture": "fine 35mm grain throughout, matte uncoated paper stock, brushed metal and raw concrete, visible dust and fingerprints on glass",
  "grade": "lifted blacks with a cool teal cast, highlights held well below clipping, gentle S-curve, warm accents left unsaturated",
  "composition": "off-centre subject on a rule-of-thirds intersection, generous unbroken negative space, horizon held level, tight and deliberate crops",
  "subject_world": "cold-climate industrial materials — raw concrete, oxidised copper, sea glass, wet stone, technical outerwear; unstyled hands and profiles, never faces at camera",
  "mood": ["restrained", "cold", "precise", "quietly premium", "engineered"],
  "anti_dna": [
    "no stock-photo smiles or faces addressing camera",
    "no lens flare, bokeh balls or light leaks",
    "no centred symmetrical hero framing",
    "no saturated blue-orange blockbuster grade",
    "no glossy plastic or polished chrome",
    "no visible text, logos or watermarks"
  ]
}
```

Note the last exclusion: generation models scatter garbled pseudo-text through ad
frames, and the whole point of the reserved negative space is that real typography
gets set there later. Keep it in almost every board.
