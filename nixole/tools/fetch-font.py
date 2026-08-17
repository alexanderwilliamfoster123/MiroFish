#!/usr/bin/env python3
"""
Fetches the Inter Tight latin variable-font subset to tools/inter-tight.woff2.

The standalone build inlines this as a data: URI because the Artifact CSP blocks
font CDNs — a <link> to fonts.googleapis.com there fails silently and the page
falls back to the system sans.

Google serves one variable file (weight 300-700) for every weight in the query,
so a single woff2 covers all five weights the design uses.
"""

import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(HERE, "inter-tight.woff2")
CSS_URL = (
    "https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap"
)
# woff2 is only offered to a browser UA; the default curl UA gets legacy ttf.
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

css = subprocess.run(
    ["curl", "-sSfL", "-A", UA, CSS_URL], check=True, capture_output=True, text=True
).stdout

blocks = re.split(r"/\*\s*([a-z\-]+)\s*\*/", css)
url = None
for i in range(1, len(blocks), 2):
    if blocks[i] == "latin":
        url = re.search(r"url\((https://[^)]+)\)", blocks[i + 1]).group(1)
        break

if not url:
    sys.exit("could not find a latin subset in the Google Fonts CSS")

subprocess.run(["curl", "-sSfL", "-o", DEST, url], check=True)
print(f"wrote {DEST} ({os.path.getsize(DEST) / 1024:.0f} KB)")
