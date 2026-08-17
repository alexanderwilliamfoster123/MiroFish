from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform
import base64, json

f=TTFont('fonts/the_future_500_normal_88448.woff2')
gs=f.getGlyphSet(); cmap=f.getBestCmap(); hmtx=f['hmtx']; upem=f['head'].unitsPerEm

def layout(text, tracking=0.0):
    out=[]; x=0.0
    for ch in text:
        if ch==' ':
            x += 0.30*upem + tracking*upem
            continue
        g=cmap[ord(ch)]
        out.append((g,x))
        x += hmtx[g][0] + tracking*upem
    return out

def bbox(items):
    x0=y0=1e9; x1=y1=-1e9
    for g,xo in items:
        bp=BoundsPen(gs); gs[g].draw(TransformPen(bp, Transform(1,0,0,1,xo,0)))
        if bp.bounds is None: continue
        a,b,c,d=bp.bounds
        x0=min(x0,a); y0=min(y0,b); x1=max(x1,c); y1=max(y1,d)
    return x0,y0,x1,y1

def paths_for(items, x0, ytop, dx=0.0, dy=0.0):
    out=[]
    for g,xo in items:
        pen=SVGPathPen(gs, ntos=lambda v: ("%.2f"%v).rstrip('0').rstrip('.'))
        gs[g].draw(TransformPen(pen, Transform(1,0,0,-1, xo-x0+dx, ytop+dy)))
        d=pen.getCommands()
        if d: out.append(d)
    return " ".join(out)

# ---------- 1. primary wordmark ----------
items=layout("SquaredQ", -0.008)
x0,y0,x1,y1=bbox(items)
d=paths_for(items, x0, y1)
wordmark=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.2f %.2f" role="img" '
          'aria-label="SquaredQ"><title>SquaredQ</title><path fill="#141318" d="%s"/></svg>')%(x1-x0,y1-y0,d)
open('squaredq-wordmark.svg','w').write(wordmark)
print("wordmark ratio %.4f"%((x1-x0)/(y1-y0)), "bytes", len(wordmark))

# ---------- 2. newsletter wordmark: SQ WEEKLY ----------
items=layout("SQ WEEKLY", 0.02)
x0,y0,x1,y1=bbox(items)
d=paths_for(items, x0, y1)
nl=('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %.2f %.2f" fill="none" aria-hidden="true" '
    'width="16px" height="16px"><path fill="#1C1B1B" d="%s"/></svg>')%(x1-x0,y1-y0,d)
open('sq-weekly.svg','w').write(nl)
print("sq-weekly ratio %.4f"%((x1-x0)/(y1-y0)), "bytes", len(nl))

# ---------- 3. app mark / favicon: rounded square + Q + exponent square ----------
S=512.0; R=112.0
qi=layout("Q")
qx0,qy0,qx1,qy1=bbox(qi)
target_h=250.0
sc=target_h/(qy1-qy0)
qw=(qx1-qx0)*sc
# glyph path in its own space, then wrap in a <g transform>
pen=SVGPathPen(gs, ntos=lambda v: ("%.2f"%v).rstrip('0').rstrip('.'))
gs[cmap[ord('Q')]].draw(TransformPen(pen, Transform(1,0,0,-1,-qx0,qy1)))
qd=pen.getCommands()
gx=(S-qw)/2 - 26
gy=(S-target_h)/2
sq=44.0
favicon=(
 '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="SquaredQ">'
 '<rect width="512" height="512" rx="%.0f" fill="#141318"/>'
 '<g transform="translate(%.2f,%.2f) scale(%.5f)"><path fill="#FFFFFF" d="%s"/></g>'
 '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="#FFFFFF"/>'
 '</svg>')%(R, gx, gy, sc, qd, gx+qw+22, gy+6, sq, sq)
open('squaredq-mark.svg','w').write(favicon)
print("favicon bytes", len(favicon))

json.dump({"wordmark_ratio": round((x1-x0)/(y1-y0),4)}, open('assets.json','w'))
