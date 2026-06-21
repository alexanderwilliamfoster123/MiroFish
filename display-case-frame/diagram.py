#!/usr/bin/env python3
"""Dimensioned cross-section + segmentation plan for the display frame.
Reads the parameters from generate_frame.py so it always matches the STLs."""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import generate_frame as g

fig, (axc, axp) = plt.subplots(1, 2, figsize=(13, 5.2))

# ---- cross-section (channel profile, looking along an edge) ----------------
# horizontal = radial (toward screen centre is +), vertical = thickness Z
fd, sz, lip, eng, wall = g.frame_depth, g.slot_z, g.lip_z, g.engage, g.wall
border = g.border
# frame material polygon (C-channel). r=0 at inner aperture edge, grows outward
# outer wall block:
axc.add_patch(Rectangle((eng, 0), wall, fd, fc="#9ecae1", ec="k"))
# front + back lips (radial 0..eng):
axc.add_patch(Rectangle((0, 0), eng, lip, fc="#9ecae1", ec="k"))
axc.add_patch(Rectangle((0, fd - lip), eng, lip, fc="#9ecae1", ec="k"))
# the panel (sits in the groove, radial 0..eng+clr, centred in Z)
pz0 = lip + g.clr_z
axc.add_patch(Rectangle((-6, pz0), eng + 6, g.panel_d, fc="#222", ec="k",
                        alpha=.85))
axc.text(-3, fd / 2, "PANEL\nedge", color="w", ha="center", va="center",
         fontsize=8, fontweight="bold")
axc.annotate("", (eng + wall, -3), (0, -3),
             arrowprops=dict(arrowstyle="<->"))
axc.text((eng + wall) / 2, -5.5, f"border {border:.0f}", ha="center")
axc.annotate("", (border + 4, 0), (border + 4, fd),
             arrowprops=dict(arrowstyle="<->"))
axc.text(border + 6, fd / 2, f"depth\n{fd:.1f}", va="center")
axc.text(eng / 2, lip / 2, "lip", ha="center", va="center", fontsize=7)
axc.text(eng + wall / 2, fd / 2, "wall", ha="center", va="center",
         fontsize=7, rotation=90)
axc.text(eng / 2, fd / 2, f"groove\n{sz:.1f}", ha="center", va="center",
         fontsize=7)
axc.set_xlim(-9, border + 16); axc.set_ylim(-8, fd + 4)
axc.set_aspect("equal"); axc.axis("off")
axc.set_title("Channel cross-section  (panel slides in from screen-centre side)")

# ---- plan view with segmentation -------------------------------------------
xs, ys, nh, nv = g.edge_cut_positions()
ow, oh = g.outer_w, g.outer_h
axp.add_patch(Rectangle((-ow/2, -oh/2), ow, oh, fill=False, ec="k", lw=1))
axp.add_patch(Rectangle((-g.opening_w/2, -g.opening_h/2),
                        g.opening_w, g.opening_h, fc="#eee", ec="k", lw=.5))
cl = g.corner_leg
# corner footprints
for sx in (-1, 1):
    for sy in (-1, 1):
        axp.add_patch(Rectangle((sx*ow/2 - (sx>0)*cl - (sx<0)*0,
                                 sy*oh/2 - (sy>0)*cl - (sy<0)*0),
                                 (sx>0)*cl - (sx<0)*cl,
                                 (sy>0)*cl - (sy<0)*cl,
                                 fc="#fdae6b", ec="k", lw=.5))
# cut lines
hx = ow/2 - cl
for x in xs:
    axp.plot([x, x], [oh/2 - g.border, oh/2], "r-", lw=1)
    axp.plot([x, x], [-oh/2, -oh/2 + g.border], "r-", lw=1)
vy = oh/2 - cl
for y in ys:
    axp.plot([ow/2 - g.border, ow/2], [y, y], "r-", lw=1)
    axp.plot([-ow/2, -ow/2 + g.border], [y, y], "r-", lw=1)
axp.text(0, 0, f"27\" display\n{g.panel_w:.0f} x {g.panel_h:.0f} mm",
         ha="center", va="center", fontsize=9, color="#555")
axp.text(0, oh/2 + 8, f"frame {ow:.0f} x {oh:.0f} mm  —  "
         f"4 corners + {nh*2} top/bot + {nv*2} side segments",
         ha="center", fontsize=8)
axp.set_xlim(-ow/2 - 20, ow/2 + 20); axp.set_ylim(-oh/2 - 20, oh/2 + 25)
axp.set_aspect("equal"); axp.axis("off")
axp.set_title("Segmentation plan (orange = corners, red = cuts)")

plt.tight_layout()
plt.savefig("frame_overview.png", dpi=130)
print("wrote frame_overview.png")
