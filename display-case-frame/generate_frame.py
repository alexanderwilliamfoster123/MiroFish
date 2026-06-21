#!/usr/bin/env python3
"""
Parametric "full perimeter frame" for carrying a 27" flat-panel display
inside a converted Rimowa (or any) hard case.

The frame is a C-channel "picture frame": front + back lips clamp the bezel
faces, and an outer wall takes side/edge impacts. The panel edge slides into
a groove that runs the whole way round.

A full 27" frame is ~640 x 379 mm, far bigger than any normal print bed, so
the ring is automatically chopped into bed-sized pieces:

    4 L-shaped corner pieces  +  straight edge segments

Adjacent pieces butt together, are located by Ø3 alignment pins, and bonded
(epoxy / CA). The frame is a permanent assembly once built.

This script mirrors, 1:1, the geometry in frame.scad (same variable names),
and renders watertight STLs with the manifold CSG backend.

Run:  python3 generate_frame.py
Out:  stl/*.stl  +  cutlist printed to stdout
"""

import math
import os
import numpy as np
import trimesh
from trimesh.transformations import rotation_matrix

# ----------------------------------------------------------------------------
# PARAMETERS  (edit these — or edit frame.scad, they are kept in sync)
# ----------------------------------------------------------------------------

# --- the display (27" Apple Studio Display, VESA/no-stand config) -----------
panel_w = 623.0   # display width  (mm)
panel_h = 362.0   # display height (mm)
panel_d = 31.0    # display thickness at the edge (mm)

# --- fit / clearance --------------------------------------------------------
clr   = 0.6   # in-plane gap each side between panel edge and groove (mm)
clr_z = 0.8   # gap each face between panel and groove walls (mm)

# --- frame profile (the C-channel cross-section) ----------------------------
engage = 10.0  # how far the lips overlap the bezel = groove depth (mm)
lip_z  = 3.0   # thickness of each front / back lip (mm)
wall   = 8.0   # outer structural wall, beyond the panel edge (mm)

# --- print / segmentation ---------------------------------------------------
bed         = 220.0   # print bed size you have (mm, square assumed)
bed_margin  = 10.0    # keep pieces this far inside the bed (mm)
corner_leg  = 90.0    # length of each leg of an L corner piece (mm)

# --- joints -----------------------------------------------------------------
pin_dia   = 3.2   # alignment-pin hole diameter (mm) -> use Ø3 pin / filament
pin_depth = 9.0   # pin hole depth into each face (mm)

# ----------------------------------------------------------------------------
# DERIVED
# ----------------------------------------------------------------------------
slot_z      = panel_d + 2 * clr_z          # groove width through thickness
frame_depth = slot_z + 2 * lip_z           # total frame thickness (Z)
border      = wall + engage                # radial width of frame material
outer_w     = panel_w + 2 * clr + 2 * wall
outer_h     = panel_h + 2 * clr + 2 * wall
opening_w   = panel_w + 2 * clr - 2 * engage   # visible aperture
opening_h   = panel_h + 2 * clr - 2 * engage
slot_w      = panel_w + 2 * clr            # groove outer span
slot_h      = panel_h + 2 * clr
bed_usable  = bed - bed_margin

EPS = 1.0  # over-cut so subtractions punch cleanly through

# ----------------------------------------------------------------------------
# helpers
# ----------------------------------------------------------------------------

def box(sx, sy, sz, cx=0.0, cy=0.0, cz=0.0):
    """Axis-aligned box of given size centred at (cx,cy,cz)."""
    b = trimesh.creation.box(extents=(sx, sy, sz))
    b.apply_translation((cx, cy, cz))
    return b


def diff(a, b):
    return a.difference(b, engine="manifold")


def inter(a, b):
    return a.intersection(b, engine="manifold")


def union(meshes):
    m = meshes[0]
    for x in meshes[1:]:
        m = m.union(x, engine="manifold")
    return m


def pin_hole(center, axis):
    """A through-cylinder (length 2*pin_depth) centred on a cut face so it
    leaves a blind hole of depth pin_depth on whichever piece is present."""
    c = trimesh.creation.cylinder(radius=pin_dia / 2.0, height=2 * pin_depth,
                                  sections=32)
    if axis == "x":
        c.apply_transform(rotation_matrix(math.pi / 2, [0, 1, 0]))
    elif axis == "y":
        c.apply_transform(rotation_matrix(math.pi / 2, [1, 0, 0]))
    c.apply_translation(center)
    return c


# radial centre line of the outer wall band (where pins live) ----------------
Y_TOP =  (outer_h / 2 - wall / 2)
Y_BOT = -(outer_h / 2 - wall / 2)
X_RIGHT =  (outer_w / 2 - wall / 2)
X_LEFT  = -(outer_w / 2 - wall / 2)
Z_MID = frame_depth / 2.0

# ----------------------------------------------------------------------------
# the full continuous frame  (C-channel picture frame)
# ----------------------------------------------------------------------------

def build_full_frame():
    outer    = box(outer_w, outer_h, frame_depth, cz=Z_MID)
    aperture = box(opening_w, opening_h, frame_depth + EPS, cz=Z_MID)
    frame    = diff(outer, aperture)                      # flat border ring

    # the groove: a rectangular-ring cavity in the central Z band, open inward
    groove_outer = box(slot_w, slot_h, slot_z, cz=Z_MID)
    groove_inner = box(opening_w, opening_h, slot_z + EPS, cz=Z_MID)
    groove = diff(groove_outer, groove_inner)
    frame  = diff(frame, groove)
    return frame


# ----------------------------------------------------------------------------
# segmentation
# ----------------------------------------------------------------------------

def edge_cut_positions():
    """X positions of cuts on the top/bottom runs and Y positions on the
    left/right runs, returned with segment count info."""
    # horizontal runs live between the corner legs
    h_run = outer_w - 2 * corner_leg
    v_run = outer_h - 2 * corner_leg
    nh = max(1, math.ceil(h_run / bed_usable))
    nv = max(1, math.ceil(v_run / bed_usable))
    xs = np.linspace(-h_run / 2, h_run / 2, nh + 1)   # cut planes on top/bottom
    ys = np.linspace(-v_run / 2, v_run / 2, nv + 1)   # cut planes on left/right
    return xs, ys, nh, nv


def corner_piece(frame, sx, sy):
    """L-shaped corner. sx,sy in {+1,-1} pick the corner."""
    cx = sx * outer_w / 2
    cy = sy * outer_h / 2
    # the two border legs meeting at the corner
    leg_h = box(corner_leg, border + EPS, frame_depth + EPS,
                cx=cx - sx * corner_leg / 2,
                cy=cy - sy * (border / 2 - EPS / 2), cz=Z_MID)
    leg_v = box(border + EPS, corner_leg, frame_depth + EPS,
                cx=cx - sx * (border / 2 - EPS / 2),
                cy=cy - sy * corner_leg / 2, cz=Z_MID)
    region = union([leg_h, leg_v])
    piece = inter(frame, region)
    # pin holes on the two cut faces
    x_cut = cx - sx * corner_leg
    y_cut = cy - sy * corner_leg
    y_band = Y_TOP if sy > 0 else Y_BOT
    x_band = X_RIGHT if sx > 0 else X_LEFT
    piece = diff(piece, pin_hole((x_cut, y_band, Z_MID), "x"))
    piece = diff(piece, pin_hole((x_band, y_cut, Z_MID), "y"))
    return piece


def edge_segment(frame, orient, sign, a, b):
    """Straight segment. orient 'h' (top/bottom) or 'v' (left/right);
    sign +1/-1 selects top/right vs bottom/left; a,b are the cut coords."""
    if orient == "h":
        cy = sign * outer_h / 2
        seg = box(abs(b - a), border + EPS, frame_depth + EPS,
                  cx=(a + b) / 2,
                  cy=cy - sign * (border / 2 - EPS / 2), cz=Z_MID)
        piece = inter(frame, seg)
        y_band = Y_TOP if sign > 0 else Y_BOT
        piece = diff(piece, pin_hole((a, y_band, Z_MID), "x"))
        piece = diff(piece, pin_hole((b, y_band, Z_MID), "x"))
    else:
        cx = sign * outer_w / 2
        seg = box(border + EPS, abs(b - a), frame_depth + EPS,
                  cx=cx - sign * (border / 2 - EPS / 2),
                  cy=(a + b) / 2, cz=Z_MID)
        piece = inter(frame, seg)
        x_band = X_RIGHT if sign > 0 else X_LEFT
        piece = diff(piece, pin_hole((x_band, a, Z_MID), "y"))
        piece = diff(piece, pin_hole((x_band, b, Z_MID), "y"))
    return piece


def alignment_pin():
    p = trimesh.creation.cylinder(radius=(pin_dia - 0.2) / 2.0,
                                  height=2 * pin_depth - 1.0, sections=32)
    return p


# ----------------------------------------------------------------------------
# main
# ----------------------------------------------------------------------------

def save(mesh, name):
    path = os.path.join("stl", name)
    mesh.export(path)
    bb = mesh.bounding_box.extents
    print(f"  {name:22s}  {bb[0]:6.1f} x {bb[1]:6.1f} x {bb[2]:5.1f} mm"
          f"   watertight={mesh.is_watertight}")
    return bb


def main():
    os.makedirs("stl", exist_ok=True)
    print("=" * 74)
    print("FULL PERIMETER DISPLAY FRAME  —  parametric build")
    print("=" * 74)
    print(f"Panel              : {panel_w} x {panel_h} x {panel_d} mm")
    print(f"Frame outer        : {outer_w:.1f} x {outer_h:.1f} x "
          f"{frame_depth:.1f} mm")
    print(f"Frame border width  : {border:.1f} mm   "
          f"(wall {wall} + engage {engage})")
    print(f"Visible aperture   : {opening_w:.1f} x {opening_h:.1f} mm")
    print(f"Print bed (usable) : {bed_usable:.0f} mm")
    print("-" * 74)

    frame = build_full_frame()
    print("Pieces  (name  /  footprint  /  watertight):")
    save(frame, "frame_full_REFERENCE.stl")     # whole ring — do NOT print whole

    xs, ys, nh, nv = edge_cut_positions()

    # 4 corners
    save(corner_piece(frame,  1,  1), "corner_TR.stl")
    save(corner_piece(frame, -1,  1), "corner_TL.stl")
    save(corner_piece(frame,  1, -1), "corner_BR.stl")
    save(corner_piece(frame, -1, -1), "corner_BL.stl")

    # top + bottom edge segments
    for i in range(nh):
        a, b = xs[i], xs[i + 1]
        save(edge_segment(frame, "h",  1, a, b), f"edge_top_{i+1}.stl")
        save(edge_segment(frame, "h", -1, a, b), f"edge_bot_{i+1}.stl")
    # left + right edge segments
    for i in range(nv):
        a, b = ys[i], ys[i + 1]
        save(edge_segment(frame, "v",  1, a, b), f"edge_right_{i+1}.stl")
        save(edge_segment(frame, "v", -1, a, b), f"edge_left_{i+1}.stl")

    save(alignment_pin(), "pin.stl")

    n_pins = 4 * 2 + (nh * 2 + nv * 2) * 2  # 2 per corner + 2 per edge end? -> joints
    n_joints = 4 + (nh - 1) * 2 + (nv - 1) * 2 + 4  # corner-edge + edge-edge
    total = 4 + nh * 2 + nv * 2
    print("-" * 74)
    print("CUT LIST")
    print(f"  4   corner pieces  ({corner_leg:.0f} x {corner_leg:.0f} mm legs)")
    print(f"  {nh*2:<3d} top/bottom edge segments  "
          f"({(outer_w-2*corner_leg)/nh:.0f} mm each)")
    print(f"  {nv*2:<3d} left/right edge segments  "
          f"({(outer_h-2*corner_leg)/nv:.0f} mm each)")
    print(f"  ---> {total} printed body pieces total")
    print(f"  joints: {n_joints}  -> print ~{n_joints} alignment pins "
          f"(Ø{pin_dia-0.2:.1f} x {2*pin_depth-1:.0f} mm) or use Ø3 rod")
    est_filament = frame.volume / 1000.0  # cm^3
    print(f"  frame solid volume : {est_filament:.0f} cm^3  "
          f"(~{est_filament*1.24:.0f} g PLA / ~{est_filament*1.20:.0f} g PETG)")
    print("=" * 74)


if __name__ == "__main__":
    main()
