---
name: moodboard-dna
description: Turn a dropped-in moodboard into mass-scale on-brand assets via Higgsfield. Use when the user adds images to moodboards/, asks to extract a brand DNA or visual identity from reference images, or asks to mass-generate social/ad creative that matches an existing look. Triggers on "moodboard", "brand DNA", "visual identity", "make more assets like this", "generate on-brand creative at scale".
---

# Moodboard → Brand DNA → Mass Assets

Extract a reusable visual DNA from a folder of reference images, then fan that DNA
out into batches of on-brand creative through Higgsfield.

The core idea: **DNA transfer runs on two rails at once.** A written spec (palette
hexes, lighting, grade, composition rules) steers the prompt, and a Higgsfield
Reference Element attaches the actual moodboard images to every generation. Using
only one rail drifts — the written spec alone reinvents the look each run, and the
Element alone can't be reasoned about or version-controlled.

## Layout

```
moodboards/<board-name>/
  *.jpg|png|webp        the dropped-in reference images
  ingest.json           generated: measured colour signature (ingest.py)
  dna.json              the brand DNA spec — the durable artefact
  brief.json            campaign concepts for a run
  runs/<run-id>/
    plan.json           the expanded prompt matrix
    assets/             downloaded results
    index.md            contact sheet with per-asset provenance
    provenance.json
```

Scripts live in `.claude/skills/moodboard-dna/scripts/`. Run them with `python3`.
`ingest.py` wants Pillow (`python3 -m pip install pillow`); without it the script
still catalogues the board and reports the degradation rather than failing.

## Getting the images in

Two routes, depending on where the user is working.

**Local checkout** — they drop files straight into `moodboards/<board>/`. Go to step 1.

**Web or mobile session** — they have no way to put files in the repo folder, and
remote MCP tools cannot read Claude chat attachments. Call `media_upload_widget`
(`type: "image"`, `min_files: 3`) so they pick images in the browser and the bytes
go directly to Higgsfield storage. Then mirror them locally so the measurement half
still runs:

1. `show_medias` (or the widget's return) for the confirmed ids and their URLs
2. `curl -fsSL '<url>' -o moodboards/<board>/<nn>.png` for each
3. Put the confirmed ids straight into `dna.json` as `reference_media_ids` — they
   are already uploaded, so step 4's upload leg is done and only the
   `show_reference_elements` call remains

Never ask a web-session user to place files in the repo, and never ask them to
attach moodboard images to Claude chat for Higgsfield — neither works.

## Workflow

### 1. Measure the board

```bash
python3 .claude/skills/moodboard-dna/scripts/ingest.py moodboards/<board>
```

Gives the objective half: per-image and board-wide palettes with coverage weights,
mean luminance, saturation and contrast, plus dedupe. Do not skip it — the exact
hexes are what stop the palette drifting between runs.

### 2. Read the images

Read every image the script listed. This is the interpretive half, and it is the
part that decides whether the output looks like the board or merely shares its
colours. Look for:

- **Lighting** — direction, hardness, colour temperature, practical sources
- **Surface and texture** — film grain, paper, matte vs specular, dust, imperfection
- **Colour grade** — lifted blacks, crushed shadows, split tone, contrast curve
- **Composition** — where subjects sit, symmetry, negative space, crop discipline
- **Subject world** — what the board is *about*: materials, environments, casting, props
- **Anti-DNA** — the look's boundaries, stated as exclusions

Anti-DNA matters more than it looks. Generation models drift toward stock-photo
defaults — glossy skin, lens flare, centred symmetry, saturated blue-orange — and
naming those exclusions is the cheapest fidelity gain available.

### 3. Write `dna.json`

Follow `references/dna-spec.md` for the schema and a worked example. Fold the
measured hexes from `ingest.json` into `palette`, sorted into dominant / accent /
neutral roles rather than dumped in raw — coverage weight tells you which is which.

Bump `version` whenever the spec changes, so a run's assets stay traceable to the
DNA that produced them.

### 4. Register the board as a Reference Element

The images are already on disk, so upload them directly rather than asking the user
to re-pick them in a widget:

1. `media_upload` with `files[]` → presigned `upload_url` per file
2. `curl -f -X PUT --upload-file <path> '<upload_url>'` for each
3. `media_confirm` with `media_ids` and `type: "image"`
4. `show_reference_elements` with `action: "create"`, passing each confirmed
   `{id, url, type: "media_input"}`, `category: "auto"`, and the board name

Write the returned element id into `dna.json` as `element_id`. `plan.py` then leads
every prompt with `<<<element_id>>>`, and the backend injects the board imagery.

**Element-capable models only**: `nano_banana_2` (default), `nano_banana_flash`,
`gpt_image_2`, `seedream_v4_5`, `seedream_v5_lite`, `cinematic_studio_2_5`. Other
models silently ignore the placeholder. If a run needs a non-Element model, leave
`element_id` null and put the confirmed media ids in `reference_media_ids` instead —
`plan.py` switches to attaching them as reference medias per request.

### 5. Agree the concepts

Concepts are *what is depicted*; the DNA is *how it looks*. Propose 6–8 concepts
drawn from the board's subject world (see `references/prompt-recipes.md`) and get
the user's confirmation before spending credits. Write them to `brief.json`:

```json
{
  "campaign": "Q3 launch",
  "count": 24,
  "ratios": ["4:5", "9:16", "1:1"],
  "resolution": "2k",
  "concepts": ["...", "..."]
}
```

### 6. Expand the matrix

```bash
python3 .claude/skills/moodboard-dna/scripts/plan.py moodboards/<board> \
  --brief moodboards/<board>/brief.json --dry-run   # inspect first
python3 .claude/skills/moodboard-dna/scripts/plan.py moodboards/<board> \
  --brief moodboards/<board>/brief.json
```

Each row cycles concept × ratio × framing × copy-space × depth on offset strides, so
24 assets are a varied family rather than 24 near-duplicates. Every row reserves
negative space for headline copy — these are ad frames, not wallpapers.

### 7. Calibrate before scaling

Generate **4 rows first**, not 24. Submit rows 0–3 via `generate_image_batch`, wait
with `jobs_wait`, display with `show_generation_by_ids`, and show the user. Credits
spent on a calibration pass are far cheaper than a 24-asset run built on a DNA spec
that was half a stop too bright. Tune `dna.json`, bump `version`, re-plan.

### 8. Run at scale

For each entry in `plan.json.batches`: `generate_image_batch` with that batch's
`{index, params}` items, then `jobs_wait` on the returned job ids (≤12 per group,
poll again while `all_terminal` is false). Collect indexed jobs across all batches
and display them with **one** `show_generation_by_ids` call.

Preflight cost with `get_cost: true` on a single representative request before a
large run, and report the figure to the user. Never pass `use_unlim: true` on your
own initiative — only when the user explicitly asks to spend their free-trial
generations.

### 9. Collect

```bash
python3 .claude/skills/moodboard-dna/scripts/collect.py moodboards/<board>/runs/<run-id> \
  --results results.json
```

Write `results.json` as `[{"index": 0, "url": "...", "job_id": "..."}]` from the
terminal job statuses. Produces `assets/`, `index.md` (contact sheet with the prompt
behind each frame) and `provenance.json`.

### 10. Commit the thinking, not the pixels

Commit `dna.json`, `brief.json`, `plan.json`, `index.md` and `provenance.json`.
`moodboards/*/runs/*/assets/` is gitignored — generated binaries would bloat the
repo, and every asset is reproducible from its plan row.

## Re-runs

Once `dna.json` exists, a new campaign is steps 5–9 only. The DNA is the asset; each
run is a cheap draw against it. To evolve a look, bump `version` and keep the old
spec in git history so an earlier campaign's frames stay reproducible.
