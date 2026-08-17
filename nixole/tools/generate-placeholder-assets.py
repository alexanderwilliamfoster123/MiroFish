#!/usr/bin/env python3
"""
Generates local stand-in assets for src/assets/.

The nine production assets live under https://qclay.design/lovable/nixole/ and are
referenced by that path in `download-assets.sh`. That host is blocked by this
environment's egress policy, so this script renders dimension-accurate stand-ins
so the page builds, lays out and animates correctly. Run `download-assets.sh`
from a network that can reach qclay.design to replace them with the real files.
"""

import math
import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "src", "assets")
os.makedirs(ASSETS, exist_ok=True)

SANS = "Inter Tight, Inter, Helvetica Neue, Helvetica, Arial, sans-serif"


def write_svg(name: str, body: str) -> None:
    path = os.path.join(ASSETS, name)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(body.strip() + "\n")
    print("wrote", path)


# --------------------------------------------------------------------------- #
# SVG assets
# --------------------------------------------------------------------------- #

write_svg(
    "main-logo.svg",
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="11" fill="#111114"/>
  <path d="M11 27V11h3.1l8.2 10.6V11h3.1v16h-3.1L14.1 16.4V27H11z" fill="#fff"/>
  <circle cx="28.5" cy="13" r="3" fill="#FFD209"/>
</svg>
""",
)

write_svg(
    "nixole-logo.svg",
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="150" height="38" viewBox="0 0 150 38" fill="none">
  <rect width="38" height="38" rx="11" fill="#111114"/>
  <path d="M11 27V11h3.1l8.2 10.6V11h3.1v16h-3.1L14.1 16.4V27H11z" fill="#fff"/>
  <circle cx="28.5" cy="13" r="3" fill="#FFD209"/>
  <text x="47" y="27" font-family="{SANS}" font-size="26" font-weight="600"
        letter-spacing="-0.5" fill="#000">Nixole</text>
</svg>
""",
)

# 14x14 render size, 0 0 16 16 viewBox, two paths, currentColor.
write_svg(
    "programming-arrow.svg",
    """
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 16 16" fill="none">
  <path d="M3.4 12.6a.8.8 0 0 1 0-1.13L10.87 4H5.6a.8.8 0 1 1 0-1.6h7.2a.8.8 0 0 1 .8.8v7.2a.8.8 0 0 1-1.6 0V5.13l-7.47 7.47a.8.8 0 0 1-1.13 0z" fill="#fff"/>
  <path d="M2.4 14.4h11.2a.8.8 0 0 1 0 1.6H2.4a.8.8 0 0 1 0-1.6z" fill="#fff" opacity="0.55"/>
</svg>
""",
)

# Stacked customer avatars, rendered at h-44px in the testimonial card.
AVATAR_COLORS = ["#F4C77B", "#8FB8E8", "#E79C9C", "#A8D5B5"]
avatars = []
for i, colour in enumerate(AVATAR_COLORS):
    cx = 22 + i * 30
    avatars.append(
        f"""
  <g transform="translate({cx - 22},0)">
    <circle cx="22" cy="22" r="21" fill="{colour}" stroke="#fff" stroke-width="3"/>
    <circle cx="22" cy="17.5" r="7" fill="#fff" opacity="0.85"/>
    <path d="M9.5 36.5c1.8-6.4 6.6-10 12.5-10s10.7 3.6 12.5 10A21 21 0 0 1 22 43a21 21 0 0 1-12.5-6.5z"
          fill="#fff" opacity="0.85"/>
  </g>"""
    )
write_svg(
    "frame-207.svg",
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="112" height="44" viewBox="0 0 112 44" fill="none">
{''.join(avatars)}
</svg>
""",
)

# Nutanix wordmark + avatar, rendered at h-28px on the white testimonial card.
write_svg(
    "nutanix-avatar.svg",
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="132" height="28" viewBox="0 0 132 28" fill="none">
  <circle cx="14" cy="14" r="13" fill="#DDE6F2" stroke="#fff" stroke-width="2"/>
  <circle cx="14" cy="11" r="4.6" fill="#7C93AE"/>
  <path d="M5.8 23.6c1.3-4.1 4.4-6.4 8.2-6.4s6.9 2.3 8.2 6.4A13 13 0 0 1 14 27a13 13 0 0 1-8.2-3.4z" fill="#7C93AE"/>
  <text x="36" y="19" font-family="{SANS}" font-size="15" font-weight="600"
        letter-spacing="-0.2" fill="#131318">Nutanix</text>
</svg>
""",
)

# Upside wordmark, rendered at h-24px inside the (white-on-dark) marquee.
write_svg(
    "upside-logo.svg",
    f"""
<svg xmlns="http://www.w3.org/2000/svg" width="104" height="24" viewBox="0 0 104 24" fill="none">
  <path d="M12 3.5 20 12l-8 8.5L4 12l8-8.5z" fill="#fff" opacity="0.9"/>
  <text x="28" y="18" font-family="{SANS}" font-size="17" font-weight="700"
        letter-spacing="-0.4" fill="#fff">Upside</text>
</svg>
""",
)

# Kept for completeness; not rendered by the page.
write_svg(
    "nurse-icon.svg",
    """
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <path d="M8.5 9.5A7.5 7.5 0 0 1 16 3a7.5 7.5 0 0 1 7.5 6.5H8.5z" fill="#111114"/>
  <path d="M15 5h2v3h3v2h-3v3h-2v-3h-3V8h3V5z" fill="#FFD209"/>
  <circle cx="16" cy="16" r="5.5" fill="#111114"/>
  <path d="M5 30c1.6-5.4 5.8-8.5 11-8.5S25.4 24.6 27 30H5z" fill="#111114"/>
</svg>
""",
)


# --------------------------------------------------------------------------- #
# browser-mockup.png — rendered at 2x (displayed at 330px wide)
#
# The 303px display height is derived from the connector geometry in the spec:
# the dashed frame sits at top 43.25px inside the mockup and ends at y=100.75,
# which has to meet the Key Features divider dot. With the popover at
# bottom:-24px / height 222px, that pins the mockup height to ~303px.
# --------------------------------------------------------------------------- #

W, H, SCALE = 330, 303, 2
PW, PH = W * SCALE, H * SCALE


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "LiberationSans-Bold.ttf" if bold else "LiberationSans-Regular.ttf"
    return ImageFont.truetype(f"/usr/share/fonts/truetype/liberation/{name}", size)


mock = Image.new("RGBA", (PW, PH), (0, 0, 0, 0))
d = ImageDraw.Draw(mock)
r = 14 * SCALE

d.rounded_rectangle([0, 0, PW - 1, PH - 1], radius=r, fill=(255, 255, 255, 255))
# chrome bar
d.rounded_rectangle([0, 0, PW - 1, 30 * SCALE], radius=r, fill=(244, 245, 247, 255))
d.rectangle([0, 20 * SCALE, PW - 1, 30 * SCALE], fill=(244, 245, 247, 255))
d.line([0, 30 * SCALE, PW, 30 * SCALE], fill=(226, 228, 232, 255), width=SCALE)

for i, colour in enumerate([(255, 95, 87), (254, 188, 46), (40, 200, 64)]):
    cx = (14 + i * 12) * SCALE
    cy = 15 * SCALE
    rr = 3.5 * SCALE
    d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=colour + (255,))

d.rounded_rectangle(
    [58 * SCALE, 8 * SCALE, (W - 14) * SCALE, 22 * SCALE],
    radius=7 * SCALE,
    fill=(255, 255, 255, 255),
)
d.text((66 * SCALE, 11 * SCALE), "medical.ai/dashboard", font=font(8 * SCALE), fill=(140, 145, 155))

# sidebar
d.rectangle([0, 30 * SCALE, 74 * SCALE, PH], fill=(250, 250, 251, 255))
d.line([74 * SCALE, 30 * SCALE, 74 * SCALE, PH], fill=(232, 233, 238, 255), width=SCALE)
d.rounded_rectangle(
    [12 * SCALE, 42 * SCALE, 24 * SCALE, 54 * SCALE], radius=4 * SCALE, fill=(17, 17, 20, 255)
)
d.text((30 * SCALE, 45 * SCALE), "Medical.AI", font=font(9 * SCALE, True), fill=(17, 17, 20))

for i, label in enumerate(["Overview", "Patients", "Calls", "Payments", "Settings"]):
    y = (68 + i * 22) * SCALE
    active = i == 3
    if active:
        d.rounded_rectangle(
            [8 * SCALE, y - 5 * SCALE, 66 * SCALE, y + 13 * SCALE],
            radius=5 * SCALE,
            fill=(240, 241, 244, 255),
        )
    d.rounded_rectangle(
        [14 * SCALE, y, 22 * SCALE, y + 8 * SCALE],
        radius=2 * SCALE,
        fill=(255, 210, 9, 255) if active else (208, 211, 218, 255),
    )
    d.text(
        (28 * SCALE, y - 1 * SCALE),
        label,
        font=font(8 * SCALE, active),
        fill=(17, 17, 20) if active else (135, 139, 149),
    )

# main panel
d.text((88 * SCALE, 44 * SCALE), "Payments", font=font(12 * SCALE, True), fill=(17, 17, 20))
d.text((88 * SCALE, 60 * SCALE), "Recurring enrollment revenue", font=font(8 * SCALE), fill=(140, 145, 155))

stats = [("$48.2k", "MRR"), ("312", "Enrolled"), ("94%", "Collected")]
for i, (value, label) in enumerate(stats):
    x = (88 + i * 79) * SCALE
    d.rounded_rectangle(
        [x, 78 * SCALE, x + 71 * SCALE, 118 * SCALE],
        radius=8 * SCALE,
        fill=(249, 249, 250, 255),
        outline=(233, 234, 239, 255),
        width=SCALE,
    )
    d.text((x + 9 * SCALE, 86 * SCALE), value, font=font(11 * SCALE, True), fill=(17, 17, 20))
    d.text((x + 9 * SCALE, 102 * SCALE), label, font=font(8 * SCALE), fill=(140, 145, 155))

d.rounded_rectangle(
    [88 * SCALE, 128 * SCALE, (W - 14) * SCALE, (H - 14) * SCALE],
    radius=8 * SCALE,
    fill=(249, 249, 250, 255),
    outline=(233, 234, 239, 255),
    width=SCALE,
)
bars = [0.35, 0.52, 0.44, 0.68, 0.58, 0.81, 0.72, 0.95]
base = (H - 26) * SCALE
for i, value in enumerate(bars):
    x = (100 + i * 27) * SCALE
    top = base - int(value * (H - 154) * SCALE)
    colour = (255, 210, 9, 255) if i >= len(bars) - 2 else (24, 24, 28, 255)
    d.rounded_rectangle([x, top, x + 16 * SCALE, base], radius=3 * SCALE, fill=colour)

# round the corners out of the alpha channel
mask = Image.new("L", (PW, PH), 0)
ImageDraw.Draw(mask).rounded_rectangle([0, 0, PW - 1, PH - 1], radius=r, fill=255)
mock.putalpha(mask)
mock.save(os.path.join(ASSETS, "browser-mockup.png"))
print("wrote", os.path.join(ASSETS, "browser-mockup.png"))


# --------------------------------------------------------------------------- #
# nurse-video.mp4 — square, silent, seamlessly looping
# --------------------------------------------------------------------------- #

VW = 320
FPS = 25
FRAMES = 100  # 4s loop
frames_dir = os.path.join(ROOT, ".asset-frames")
os.makedirs(frames_dir, exist_ok=True)


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


for n in range(FRAMES):
    phase = n / FRAMES
    wobble = math.sin(phase * 2 * math.pi)

    frame = Image.new("RGB", (VW, VW), (255, 255, 255))
    fd = ImageDraw.Draw(frame)

    top = lerp((255, 236, 199), (214, 232, 250), 0.5 + 0.5 * wobble)
    bottom = lerp((252, 214, 160), (183, 208, 236), 0.5 + 0.5 * wobble)
    for y in range(VW):
        fd.line([(0, y), (VW, y)], fill=lerp(top, bottom, y / VW))

    drift = 3 * wobble
    # shoulders / scrubs
    fd.ellipse([40, 196 + drift, 280, 400 + drift], fill=(86, 132, 176))
    fd.polygon(
        [(160, 208 + drift), (196, 250 + drift), (160, 300 + drift), (124, 250 + drift)],
        fill=(240, 244, 249),
    )
    # neck + head
    fd.rounded_rectangle([140, 168 + drift, 180, 214 + drift], radius=14, fill=(226, 184, 148))
    fd.ellipse([108, 86 + drift, 212, 196 + drift], fill=(238, 197, 160))
    # hair
    fd.chord([104, 74 + drift, 216, 178 + drift], 180, 360, fill=(74, 56, 46))
    # cap with cross
    fd.rounded_rectangle([120, 72 + drift, 200, 104 + drift], radius=8, fill=(255, 255, 255))
    fd.rectangle([154, 78 + drift, 166, 98 + drift], fill=(226, 74, 74))
    fd.rectangle([148, 84 + drift, 172, 92 + drift], fill=(226, 74, 74))
    # eyes blink on a slow cycle
    blink = 0.02 < phase < 0.06 or 0.54 < phase < 0.58
    for ex in (140, 180):
        if blink:
            fd.line([ex - 7, 140 + drift, ex + 7, 140 + drift], fill=(60, 46, 40), width=3)
        else:
            fd.ellipse([ex - 6, 134 + drift, ex + 6, 148 + drift], fill=(60, 46, 40))
    # smile
    fd.arc([140, 148 + drift, 180, 176 + drift], 20, 160, fill=(168, 92, 78), width=4)

    frame.save(os.path.join(frames_dir, f"f{n:04d}.png"))

import imageio_ffmpeg  # noqa: E402

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
out = os.path.join(ASSETS, "nurse-video.mp4")
subprocess.run(
    [
        ffmpeg, "-y", "-loglevel", "error",
        "-framerate", str(FPS),
        "-i", os.path.join(frames_dir, "f%04d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24",
        "-movflags", "+faststart", "-an",
        out,
    ],
    check=True,
)
for f in os.listdir(frames_dir):
    os.remove(os.path.join(frames_dir, f))
os.rmdir(frames_dir)
print("wrote", out)
