#!/usr/bin/env python3
"""
Build a complete design package PDF for the 27" display transport frame.
Pulls every dimension from generate_frame.py so the document always matches
the STLs / frame.scad.

Run:  python3 design_pdf.py   ->  Display_Frame_Design.pdf
"""
import matplotlib
matplotlib.use("Agg")
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.patches import Rectangle, Circle, FancyArrow
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import trimesh
import generate_frame as g

BLUE = "#9ecae1"; ORANGE = "#fdae6b"; GREY = "#eeeeee"; RED = "#d62728"
DATE = "2026-06-21"

xs, ys, nh, nv = g.edge_cut_positions()
seg_h_len = (g.outer_w - 2 * g.corner_leg) / nh
seg_v_len = (g.outer_h - 2 * g.corner_leg) / nv


# ---------------------------------------------------------------- helpers ----
def dimH(ax, x0, x1, y, txt, tcol="k", lcol="#444", below=False):
    ax.annotate("", (x1, y), (x0, y),
                arrowprops=dict(arrowstyle="<->", color=lcol, lw=1))
    ax.text((x0 + x1) / 2, y + (-3.2 if below else 1.4), txt,
            ha="center", va="top" if below else "bottom", fontsize=7.5, color=tcol)


def dimV(ax, x, y0, y1, txt, tcol="k", lcol="#444", left=False):
    ax.annotate("", (x, y1), (x, y0),
                arrowprops=dict(arrowstyle="<->", color=lcol, lw=1))
    ax.text(x + (-2 if left else 2), (y0 + y1) / 2, txt, rotation=90,
            ha="right" if left else "left", va="center", fontsize=7.5, color=tcol)


def titleblock(fig, page, title):
    fig.text(0.5, 0.965, "27\" DISPLAY TRANSPORT FRAME", ha="center",
             fontsize=15, fontweight="bold")
    fig.text(0.5, 0.94, title, ha="center", fontsize=11, color="#333")
    fig.text(0.06, 0.022, "Rimowa hard-case conversion  ·  C-channel perimeter "
             "frame  ·  all dims mm", fontsize=7.5, color="#555")
    fig.text(0.94, 0.022, f"{DATE}   ·   page {page}", ha="right",
             fontsize=7.5, color="#555")
    fig.add_artist(plt.Line2D([0.06, 0.94], [0.045, 0.045], color="#999",
                              lw=0.8, transform=fig.transFigure))


def section_axes(ax):
    """Draw the channel cross-section (radial x, thickness z) on ax."""
    fd, sz, lip, eng, wall, border = (g.frame_depth, g.slot_z, g.lip_z,
                                      g.engage, g.wall, g.border)
    ax.add_patch(Rectangle((eng, 0), wall, fd, fc=BLUE, ec="k"))
    ax.add_patch(Rectangle((0, 0), eng, lip, fc=BLUE, ec="k"))
    ax.add_patch(Rectangle((0, fd - lip), eng, lip, fc=BLUE, ec="k"))
    pz0 = lip + g.clr_z
    ax.add_patch(Rectangle((-7, pz0), eng + 7, g.panel_d, fc="#222",
                           ec="k", alpha=.85))
    ax.text(-3.5, fd / 2, "PANEL", color="w", ha="center", va="center",
            fontsize=7, fontweight="bold", rotation=90)
    dimH(ax, 0, eng + wall, -4, f"border {border:.0f}", below=True)
    dimH(ax, 0, eng, fd + 1.5, f"engage {eng:.0f}")
    dimH(ax, eng, eng + wall, fd + 1.5, f"wall {wall:.0f}")
    dimV(ax, eng + wall + 6, 0, fd, f"depth {fd:.1f}")
    dimV(ax, -8.5, pz0, pz0 + g.panel_d, f"panel {g.panel_d:.0f}", left=True)
    ax.text(eng / 2, lip / 2, "lip", ha="center", va="center", fontsize=6)
    ax.text(eng / 2, fd / 2, f"groove\n{sz:.1f}", ha="center", va="center",
            fontsize=6, color="#333")
    ax.set_xlim(-13, border + 16); ax.set_ylim(-8, fd + 6)
    ax.set_aspect("equal"); ax.axis("off")


def mesh3d(ax, stl, color=BLUE, alpha=1.0):
    m = trimesh.load(stl)
    tris = m.triangles
    pc = Poly3DCollection(tris, facecolor=color, edgecolor="#33333322",
                          linewidths=0.1, alpha=alpha)
    ax.add_collection3d(pc)
    b = m.bounds
    ax.set_xlim(b[0][0], b[1][0]); ax.set_ylim(b[0][1], b[1][1])
    ax.set_zlim(b[0][2], b[1][2])
    ax.set_box_aspect(b[1] - b[0])
    ax.view_init(elev=24, azim=-58)
    ax.set_axis_off()


# =================================================================== PDF =====
with PdfPages("Display_Frame_Design.pdf") as pdf:

    # ---- PAGE 1 : cover + key data + 3D --------------------------------
    fig = plt.figure(figsize=(8.27, 11.69))      # A4 portrait
    titleblock(fig, 1, "Design package — overview")

    ax3 = fig.add_axes([0.05, 0.55, 0.6, 0.34], projection="3d")
    mesh3d(ax3, "stl/frame_full_REFERENCE.stl")
    ax3.text2D(0.5, -0.02, "Assembled frame (reference)", transform=ax3.transAxes,
               ha="center", fontsize=8, color="#555")

    axc = fig.add_axes([0.66, 0.55, 0.31, 0.34]); section_axes(axc)
    axc.set_title("Channel section", fontsize=9)

    rows = [
        ("Target display", "Apple Studio Display 27\" (no stand / VESA)"),
        ("Panel W x H x D", f"{g.panel_w:.0f} x {g.panel_h:.0f} x {g.panel_d:.0f} mm"),
        ("Frame outer", f"{g.outer_w:.1f} x {g.outer_h:.1f} x {g.frame_depth:.1f} mm"),
        ("Border width", f"{g.border:.0f} mm  (wall {g.wall:.0f} + engage {g.engage:.0f})"),
        ("Visible aperture", f"{g.opening_w:.1f} x {g.opening_h:.1f} mm"),
        ("Fit clearance", f"{g.clr} mm in-plane / {g.clr_z} mm per face"),
        ("Print bed assumed", f"{g.bed:.0f} mm ({g.bed_usable:.0f} usable)"),
        ("Pieces", f"4 corners + {nh*2} top/bottom + {nv*2} side = "
                   f"{4+nh*2+nv*2} total"),
        ("Material (recommended)", "PETG / ASA, 4 walls, 30-40% infill"),
        ("Frame volume", f"{g.build_full_frame().volume/1000:.0f} cm3 "
                         f"(~910 g PLA / ~880 g PETG)"),
    ]
    y = 0.46
    fig.text(0.06, 0.50, "KEY SPECIFICATION", fontsize=10, fontweight="bold")
    for k, v in rows:
        fig.text(0.07, y, k, fontsize=8.5, color="#333")
        fig.text(0.40, y, v, fontsize=8.5)
        y -= 0.027
    fig.text(0.06, y - 0.005,
             "C-channel 'picture frame': front + back lips clamp the bezel "
             "faces; the outer wall\ntakes edge impacts. The panel edge sits in "
             "a groove running the full perimeter.\nThe ring is split into "
             "bed-sized pieces joined by Ø3 alignment pins + adhesive.",
             fontsize=8.5, color="#444", va="top")
    fig.text(0.06, 0.085, "FIRST: print corner_TR only and test-fit on a real "
             "screen corner before printing the full set.", fontsize=8.5,
             color=RED, fontweight="bold")
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 2 : cross-section (large) --------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 2,
        "Sheet 1 — Channel cross-section")
    ax = fig.add_axes([0.1, 0.30, 0.8, 0.55]); section_axes(ax)
    fig.text(0.5, 0.22, "Section is constant around the entire perimeter "
             "(mitred at corners).", ha="center", fontsize=9, color="#444")
    fig.text(0.1, 0.17, "Tuning:", fontsize=9, fontweight="bold")
    for i, t in enumerate([
        "clr / clr_z  — grip tightness (raise if panel won't seat)",
        "engage       — how far lips wrap the bezel (also groove depth)",
        "wall         — outer impact wall thickness",
        "lip_z        — front/back lip thickness"]):
        fig.text(0.12, 0.145 - i * 0.022, t, fontsize=8.5, family="monospace")
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 3 : plan + segmentation ----------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 3,
        "Sheet 2 — Frame plan & segmentation")
    ax = fig.add_axes([0.08, 0.30, 0.86, 0.55])
    ow, oh, cl, bd = g.outer_w, g.outer_h, g.corner_leg, g.border
    ax.add_patch(Rectangle((-ow/2, -oh/2), ow, oh, fill=False, ec="k", lw=1.2))
    ax.add_patch(Rectangle((-g.opening_w/2, -g.opening_h/2),
                           g.opening_w, g.opening_h, fc=GREY, ec="k", lw=.5))
    for sx in (-1, 1):
        for sy in (-1, 1):
            ax.add_patch(Rectangle((sx*ow/2 - (sx>0)*cl, sy*oh/2 - (sy>0)*cl),
                                   (1 if sx>0 else -1)*cl, (1 if sy>0 else -1)*cl,
                                   fc=ORANGE, ec="k", lw=.5))
    for x in xs:
        ax.plot([x, x], [oh/2 - bd, oh/2], color=RED, lw=1.2)
        ax.plot([x, x], [-oh/2, -oh/2 + bd], color=RED, lw=1.2)
    for yv in ys:
        ax.plot([ow/2 - bd, ow/2], [yv, yv], color=RED, lw=1.2)
        ax.plot([-ow/2, -ow/2 + bd], [yv, yv], color=RED, lw=1.2)
    dimH(ax, -ow/2, ow/2, oh/2 + 14, f"outer {ow:.1f}")
    dimV(ax, ow/2 + 14, -oh/2, oh/2, f"outer {oh:.1f}")
    dimH(ax, -ow/2, -ow/2 + cl, -oh/2 - 10, f"leg {cl:.0f}", below=True)
    ax.text(0, 0, f"27\" display\n{g.panel_w:.0f} x {g.panel_h:.0f}",
            ha="center", va="center", color="#777", fontsize=9)
    ax.set_xlim(-ow/2 - 40, ow/2 + 40); ax.set_ylim(-oh/2 - 30, oh/2 + 30)
    ax.set_aspect("equal"); ax.axis("off")
    fig.text(0.5, 0.24, f"Orange = 4 corner pieces  ·  Red = cut planes  ·  "
             f"{nh} segment(s) per top/bottom run, {nv} per side run",
             ha="center", fontsize=9, color="#444")
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 4 : corner detail ----------------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 4,
        "Sheet 3 — Corner piece  (x4: TR, TL, BR, BL)")
    ax = fig.add_axes([0.1, 0.42, 0.8, 0.44])
    b = g.border
    # L outline (top-right corner, legs along -x and -y from corner)
    ax.add_patch(Rectangle((0, -b), g.corner_leg, b, fc=BLUE, ec="k"))   # top leg
    ax.add_patch(Rectangle((g.corner_leg - b, -g.corner_leg), b, g.corner_leg,
                           fc=BLUE, ec="k"))                              # right leg
    # pin holes (outer wall band, on the two cut faces)
    wallc = b - g.wall/2
    ax.add_patch(Circle((0.0, -wallc), g.pin_dia/2, fc="w", ec=RED))
    ax.add_patch(Circle((g.corner_leg - wallc, -g.corner_leg), g.pin_dia/2,
                        fc="w", ec=RED))
    dimH(ax, 0, g.corner_leg, 6, f"leg {g.corner_leg:.0f}")
    dimV(ax, g.corner_leg + 6, -g.corner_leg, 0, f"leg {g.corner_leg:.0f}")
    dimH(ax, 0, b, -g.corner_leg - 6, f"border {b:.0f}", below=True)
    ax.text(0, -wallc, "  Ø3.2 pin", color=RED, fontsize=7, va="center")
    ax.set_xlim(-20, g.corner_leg + 25); ax.set_ylim(-g.corner_leg - 25, 20)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_title("Front view (looking along screen axis)", fontsize=9)
    ax3 = fig.add_axes([0.12, 0.10, 0.4, 0.3], projection="3d")
    mesh3d(ax3, "stl/corner_TR.stl", ORANGE)
    axs = fig.add_axes([0.58, 0.12, 0.34, 0.26]); section_axes(axs)
    axs.set_title("Section A-A", fontsize=8)
    fig.text(0.1, 0.075, f"Footprint {g.corner_leg:.0f} x {g.corner_leg:.0f} x "
             f"{g.frame_depth:.1f} mm  ·  2 pin holes per piece  ·  print flat, "
             "no supports.", fontsize=8.5, color="#444")
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 5 : edge details -----------------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 5,
        "Sheet 4 — Edge segments")
    # top/bottom
    ax = fig.add_axes([0.1, 0.56, 0.8, 0.26])
    L = seg_h_len
    ax.add_patch(Rectangle((0, 0), L, b, fc=BLUE, ec="k"))
    ax.add_patch(Circle((0, b - g.wall/2), g.pin_dia/2, fc="w", ec=RED))
    ax.add_patch(Circle((L, b - g.wall/2), g.pin_dia/2, fc="w", ec=RED))
    dimH(ax, 0, L, b + 4, f"length {L:.1f}")
    dimV(ax, -5, 0, b, f"{b:.0f}", left=True)
    ax.set_xlim(-25, L + 20); ax.set_ylim(-12, b + 14)
    ax.set_aspect("equal"); ax.axis("off")
    ax.set_title(f"Top / bottom segment  (x{nh*2})  — pin hole each end", fontsize=9)
    # side
    ax2 = fig.add_axes([0.1, 0.22, 0.8, 0.26])
    L2 = seg_v_len
    ax2.add_patch(Rectangle((0, 0), L2, b, fc=BLUE, ec="k"))
    ax2.add_patch(Circle((0, b - g.wall/2), g.pin_dia/2, fc="w", ec=RED))
    ax2.add_patch(Circle((L2, b - g.wall/2), g.pin_dia/2, fc="w", ec=RED))
    dimH(ax2, 0, L2, b + 4, f"length {L2:.1f}")
    dimV(ax2, -5, 0, b, f"{b:.0f}", left=True)
    ax2.set_xlim(-25, L2 + 20); ax2.set_ylim(-12, b + 14)
    ax2.set_aspect("equal"); ax2.axis("off")
    ax2.set_title(f"Left / right segment  (x{nv*2})  — shown straightened",
                  fontsize=9)
    fig.text(0.1, 0.16, f"All edge segments are border {b:.0f} mm x depth "
             f"{g.frame_depth:.1f} mm in section (same channel as the corners). "
             "Lay flat, depth standing up.", fontsize=8.5, color="#444")
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 6 : BOM / cut list ---------------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 6,
        "Sheet 5 — Bill of materials & cut list")
    bom = [
        ("Qty", "Part", "STL file", "Size (mm)"),
        ("4", "Corner (L)", "corner_TR/TL/BR/BL.stl",
         f"{g.corner_leg:.0f} x {g.corner_leg:.0f} x {g.frame_depth:.1f}"),
        (f"{nh}", "Top segment", "edge_top_1..%d.stl" % nh,
         f"{seg_h_len:.0f} x {g.border:.0f} x {g.frame_depth:.1f}"),
        (f"{nh}", "Bottom segment", "edge_bot_1..%d.stl" % nh,
         f"{seg_h_len:.0f} x {g.border:.0f} x {g.frame_depth:.1f}"),
        (f"{nv}", "Right segment", "edge_right_1..%d.stl" % nv,
         f"{seg_v_len:.0f} x {g.border:.0f} x {g.frame_depth:.1f}"),
        (f"{nv}", "Left segment", "edge_left_1..%d.stl" % nv,
         f"{seg_v_len:.0f} x {g.border:.0f} x {g.frame_depth:.1f}"),
        ("~12", "Alignment pin", "pin.stl (or Ø3 rod)",
         f"Ø{g.pin_dia-0.2:.1f} x {2*g.pin_depth-1:.0f}"),
        ("1", "Whole-ring preview", "frame_full_REFERENCE.stl", "DO NOT print whole"),
    ]
    yt = 0.84
    colx = [0.10, 0.20, 0.40, 0.70]
    for r, row in enumerate(bom):
        bold = (r == 0)
        for cx, cell in zip(colx, row):
            fig.text(cx, yt, cell, fontsize=9,
                     fontweight="bold" if bold else "normal",
                     family="monospace" if (not bold and cx == colx[2]) else "sans-serif")
        if bold:
            fig.add_artist(plt.Line2D([0.09, 0.92], [yt-0.008, yt-0.008],
                           color="#999", lw=0.8, transform=fig.transFigure))
        yt -= 0.032
    total = 4 + nh*2 + nv*2
    fig.text(0.10, yt - 0.01, f"Total printed body pieces: {total}    "
             f"Joints: {total}    Est. filament: ~910 g PLA / ~880 g PETG",
             fontsize=9, fontweight="bold")
    # consumables
    fig.text(0.10, yt - 0.06, "CONSUMABLES / HARDWARE", fontsize=10,
             fontweight="bold")
    for i, t in enumerate([
        "~1.0 kg PETG or ASA filament (structural; PLA OK for test fits only)",
        "Ø3 mm pins: printed pin.stl, or cut 3 mm rod / filament to 17 mm",
        "Epoxy or CA adhesive for the joints (frame is a permanent ring)",
        "Closed-cell foam strip to bond the outer wall to the case shell",
        "Optional: M3/M4 L-brackets to bolt the frame to the case ribs"]):
        fig.text(0.12, yt - 0.09 - i*0.025, u"• " + t, fontsize=8.8)
    pdf.savefig(fig); plt.close(fig)

    # ---- PAGE 7 : print + assembly -------------------------------------
    fig = plt.figure(figsize=(8.27, 11.69)); titleblock(fig, 7,
        "Sheet 6 — Print settings & assembly")
    def block(title, items, y0):
        fig.text(0.10, y0, title, fontsize=11, fontweight="bold")
        for i, t in enumerate(items):
            fig.text(0.12, y0 - 0.028 - i*0.026, u"• " + t, fontsize=9)
        return y0 - 0.028 - len(items)*0.026
    y = 0.86
    y = block("PRINT SETTINGS", [
        "Material: PETG / ASA / ABS (impact + heat). PLA for test fits only.",
        "Orientation: lay flat, 38.6 mm depth standing up -> pin holes "
        "horizontal, no supports.",
        "Perimeters: 4   ·   Top/bottom layers: 5   ·   Infill: 30-40% gyroid.",
        "Layer height: 0.2-0.28 mm   ·   nozzle 0.4-0.6 mm.",
        "Print one corner first and test-fit before committing the full set."], y)
    y = block("ASSEMBLY", [
        "1. Dry-fit all pieces around the display with pins in the Ø3.2 holes.",
        "2. Check the ring closes square and the lips grip evenly all round.",
        "3. Bond each joint with epoxy/CA; pins keep the faces aligned.",
        "4. Seat the assembled frame in the Rimowa shell.",
        "5. Bond closed-cell foam to the 8 mm outer wall, or bolt L-tabs "
        "through it into the case ribs."], y - 0.02)
    y = block("MEASURE BEFORE FINAL PRINT", [
        "Exact panel edge thickness (bezels taper) -> set panel_d.",
        "Rimowa internal depth must clear frame depth 38.6 mm + foam.",
        "Case internal W x H must clear frame outer 640 x 379 mm."], y - 0.02)
    y = block("RETUNE (frame.scad / generate_frame.py)", [
        "Different screen: panel_w / panel_h / panel_d.",
        "Grip: clr, clr_z.   Protection: wall, engage.   Printer: bed.",
        "Re-run: python3 generate_frame.py  (STLs) and python3 design_pdf.py "
        "(this document)."], y - 0.02)
    pdf.savefig(fig); plt.close(fig)

    d = pdf.infodict()
    d["Title"] = "27\" Display Transport Frame — Design Package"
    d["Author"] = "MiroFish / display-case-frame"
    d["Subject"] = "Parametric C-channel perimeter frame for Rimowa case conversion"

print("wrote Display_Frame_Design.pdf")
