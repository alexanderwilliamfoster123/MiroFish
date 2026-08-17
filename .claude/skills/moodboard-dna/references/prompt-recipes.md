# Concept recipes for social / ad creative

`plan.py` supplies the *how* — style DNA, framing, copy space. These are the *what*.
Pick 6–8 per campaign and adapt them to the board's `subject_world`.

## Why concepts stay generic here

A concept says what is depicted, in one sentence, with no style language at all. All
lighting, palette and grade come from `dna.json`. Writing style words into a concept
is the fastest way to fight the DNA and get an incoherent set — if a concept needs
"moody" to work, the DNA spec is underwritten, so fix that instead.

## The eight-slot campaign set

A run that covers these slots gives a marketing team a usable spread rather than
eight variations of a hero shot.

| Slot | Job | Concept pattern |
|---|---|---|
| Hero | The headline frame | The product or subject isolated on its ground surface |
| Context | Proof of use | The subject in the environment it belongs to, mid-use |
| Detail | Craft and quality | Macro on a single material junction, seam or edge |
| Human | Scale and warmth | Hands or a partial figure interacting, face out of frame |
| Still life | Editorial breathing room | An arrangement of related props, no primary subject |
| Texture | The layout workhorse | A single surface filling the frame, almost abstract |
| Environment | Establishing atmosphere | The wider space, subject small or absent |
| Motion | Energy | The subject mid-movement, something in transit |

The texture slot earns its place quietly: those frames become deck backgrounds, story
fills and section dividers, and a campaign is usually short of them.

## Aspect ratio strategy

- `4:5` — feed. The default; largest mobile footprint.
- `9:16` — stories, Reels, Shorts. Needs its own composition, so let the copy-space
  rotation put safe area top and bottom.
- `1:1` — grid, avatars, partner placements.
- `16:9` — YouTube, web hero, presentation.

Cycling all four across 24 rows gives six per ratio. For a single-platform campaign,
pass one ratio and let the framing axis carry the variation instead.

## Copy space discipline

Every generated row reserves negative space, because these frames are backplates —
real typography gets set over them later. Two habits keep that usable:

- Never let the model write the headline. Garbled pseudo-text is the most common
  reason an otherwise good frame is unusable, which is why `no visible text` belongs
  in nearly every `anti_dna`.
- Keep the reserved area genuinely quiet — low contrast and low detail. "Negative
  space" over a busy texture is not negative space, and copy set there will fail
  contrast checks.

## Tuning after calibration

When the four calibration frames come back, diagnose against the DNA spec rather
than rewriting prompts row by row. Almost every miss is one of:

| Symptom | Fix in `dna.json` |
|---|---|
| Right colours, wrong feeling | `lighting` is too vague — specify direction and hardness |
| Looks like stock photography | `anti_dna` is too thin — name the defaults it drifted to |
| Palette drifting warm or washed | Roles in `palette` are miscast; check coverage weights |
| Too clean, too rendered | `texture` needs grain, imperfection, material wear |
| Copy space unusable | Concepts are too busy — simplify what is depicted |

Fix the spec, bump `version`, re-plan. Editing individual prompt rows breaks the
guarantee that the set shares one DNA, which is the only reason the pipeline exists.
