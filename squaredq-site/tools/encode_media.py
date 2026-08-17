#!/usr/bin/env python3
"""Turn raw generated clips into web-ready looping background beds.

Each source clip is:
  1. trimmed to a whole number of seconds,
  2. cross-faded head-into-tail so `<video loop>` has no visible seam,
  3. scaled down and encoded to H.264 at a size budget,
  4. given a JPEG poster frame so the section renders instantly.

    python3 tools/encode_media.py media/raw/hero-1.mp4 1 --width 1280 --budget 3.0

Or process everything in media/raw/ with the per-clip defaults below:

    python3 tools/encode_media.py --all
"""
import argparse
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
RAW = ROOT / "media" / "raw"
OUT = ROOT / "media"

# index -> (output width, target MB). The hero carries the page, so it gets the
# larger share of the budget; the product beds sit behind a heavy scrim and
# survive a smaller one.
PROFILE = {1: (1280, 3.0), 2: (1024, 1.9), 3: (1024, 1.9), 4: (1024, 1.9), 5: (1024, 1.9)}
FADE = 0.7  # seconds of head/tail cross-fade


def run(cmd: list) -> None:
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode:
        sys.exit("ffmpeg failed:\n%s" % proc.stderr[-2500:])


def probe(path: pathlib.Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height,r_frame_rate:format=duration",
         "-of", "json", str(path)],
        capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    s = d["streams"][0]
    return {"w": s["width"], "h": s["height"],
            "dur": float(d["format"]["duration"])}


def encode(src: pathlib.Path, index: int, width: int, budget_mb: float) -> None:
    info = probe(src)
    # keep a whole number of seconds, leaving room for the cross-fade tail
    body = max(2.0, float(int(info["dur"] * 10) / 10) - FADE)
    dst = OUT / ("hero-%d.mp4" % index)
    poster = OUT / ("hero-%d.jpg" % index)

    # A loop with no seam: take the clip's own tail, cross-fade it back over the
    # head, and cut the result to `body` seconds. Playing that on repeat is
    # continuous.
    vf = (
        "[0:v]scale={w}:-2:flags=lanczos,setsar=1,fps=24,split[a][b];"
        "[a]trim=0:{body},setpts=PTS-STARTPTS[main];"
        "[b]trim={fs}:{fe},setpts=PTS-STARTPTS,format=yuva420p,"
        "fade=t=in:st=0:d={fade}:alpha=1[tail];"
        "[main][tail]overlay=eof_action=pass[v]"
    ).format(w=width, body=round(body, 2), fade=FADE,
             fs=round(body, 2), fe=round(body + FADE, 2))

    # two-pass to hit the size budget predictably
    bitrate = int(budget_mb * 8 * 1024 / body)  # kbit/s
    base = ["ffmpeg", "-y", "-i", str(src), "-filter_complex", vf, "-map", "[v]",
            "-an", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-b:v", "%dk" % bitrate, "-maxrate", "%dk" % int(bitrate * 1.35),
            "-bufsize", "%dk" % int(bitrate * 2), "-preset", "slower",
            "-g", "48", "-movflags", "+faststart"]
    run(base + ["-pass", "1", "-passlogfile", str(OUT / ("p%d" % index)), "-f", "mp4", "/dev/null"])
    run(base + ["-pass", "2", "-passlogfile", str(OUT / ("p%d" % index)), str(dst)])
    for leftover in OUT.glob("p%d-*.log*" % index):
        leftover.unlink()

    run(["ffmpeg", "-y", "-i", str(dst), "-frames:v", "1",
         "-vf", "scale=%d:-2" % min(width, 1024), "-q:v", "6", str(poster)])

    print("hero-%d  %4dpx  %5.2fs  %6.2f MB video  %5.0f KB poster"
          % (index, width, body, dst.stat().st_size / 1e6, poster.stat().st_size / 1e3))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("src", nargs="?")
    ap.add_argument("index", nargs="?", type=int)
    ap.add_argument("--width", type=int)
    ap.add_argument("--budget", type=float)
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    if a.all:
        for i in sorted(PROFILE):
            src = RAW / ("hero-%d.mp4" % i)
            if src.exists():
                encode(src, i, *PROFILE[i])
        return
    if not a.src or not a.index:
        ap.error("give a source and index, or --all")
    w, b = PROFILE.get(a.index, (1024, 1.9))
    encode(pathlib.Path(a.src), a.index, a.width or w, a.budget or b)


if __name__ == "__main__":
    main()
