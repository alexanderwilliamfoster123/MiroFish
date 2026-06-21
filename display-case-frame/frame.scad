// =====================================================================
//  FULL PERIMETER DISPLAY FRAME  —  parametric (OpenSCAD)
//
//  C-channel "picture frame" that grips a 27" flat-panel display edge for
//  transport inside a converted Rimowa / hard case.  The full ring is too
//  big to print whole, so set `part` to render ONE printable piece at a time.
//
//  Variable names match generate_frame.py exactly. Edit numbers here and the
//  Python STL generator together (or just re-run generate_frame.py).
//
//  Render a part:  set `part` + `seg` below, then F6, then export STL.
// =====================================================================

/* [What to render] */
// "full", "corner", "edge_top", "edge_bot", "edge_left", "edge_right", "pin"
part = "corner";
// which corner: 1=TR 2=TL 3=BR 4=BL   |   which edge segment: 1..N
seg  = 1;

/* [Display] */
panel_w = 623;   // width  (mm)
panel_h = 362;   // height (mm)
panel_d = 31;    // edge thickness (mm)

/* [Fit] */
clr   = 0.6;     // in-plane gap each side (mm)
clr_z = 0.8;     // per-face gap (mm)

/* [Profile] */
engage = 10;     // lip overlap / groove depth (mm)
lip_z  = 3;      // front/back lip thickness (mm)
wall   = 8;      // outer wall (mm)

/* [Compliant liner] */
// Groove is oversized by this on every panel-touching face so you bond
// self-adhesive EVA foam / flock / a TPU insert in for a glove-snug,
// non-scratch grip. Set 0 for a bare rigid groove.
liner_thk = 2;   // compliant liner thickness (mm)

/* [Print / segmentation] */
bed        = 220;  // bed size (mm, square)
bed_margin = 10;   // keep inside bed (mm)
corner_leg = 90;   // corner L leg length (mm)

/* [Joints] */
pin_dia   = 3.2;   // alignment-pin hole dia (mm)
pin_depth = 9;     // hole depth each face (mm)

// ---- derived --------------------------------------------------------
slot_z      = panel_d + 2*clr_z + 2*liner_thk;
frame_depth = slot_z + 2*lip_z;
border      = wall + engage + liner_thk;
outer_w     = panel_w + 2*clr + 2*liner_thk + 2*wall;
outer_h     = panel_h + 2*clr + 2*liner_thk + 2*wall;
opening_w   = panel_w + 2*clr - 2*engage;
opening_h   = panel_h + 2*clr - 2*engage;
slot_w      = panel_w + 2*clr + 2*liner_thk;
slot_h      = panel_h + 2*clr + 2*liner_thk;
bed_usable  = bed - bed_margin;
EPS         = 1;
Zc          = frame_depth/2;

Y_TOP   =  (outer_h/2 - wall/2);
Y_BOT   = -(outer_h/2 - wall/2);
X_RIGHT =  (outer_w/2 - wall/2);
X_LEFT  = -(outer_w/2 - wall/2);

h_run = outer_w - 2*corner_leg;
v_run = outer_h - 2*corner_leg;
nh = max(1, ceil(h_run/bed_usable));
nv = max(1, ceil(v_run/bed_usable));

// ---- modules --------------------------------------------------------
module frame_full() {
    difference() {
        translate([0,0,Zc]) cube([outer_w, outer_h, frame_depth], center=true);
        translate([0,0,Zc]) cube([opening_w, opening_h, frame_depth+EPS], center=true);
        // groove ring (central Z band, open toward centre)
        difference() {
            translate([0,0,Zc]) cube([slot_w, slot_h, slot_z], center=true);
            translate([0,0,Zc]) cube([opening_w, opening_h, slot_z+EPS], center=true);
        }
    }
}

module pin_hole(p, axis) {
    translate(p) rotate(axis=="x" ? [0,90,0] : [90,0,0])
        cylinder(h = 2*pin_depth, d = pin_dia, center = true, $fn = 32);
}

module corner(sx, sy) {
    cx = sx*outer_w/2;  cy = sy*outer_h/2;
    x_cut = cx - sx*corner_leg;
    y_cut = cy - sy*corner_leg;
    y_band = sy > 0 ? Y_TOP : Y_BOT;
    x_band = sx > 0 ? X_RIGHT : X_LEFT;
    difference() {
        intersection() {
            frame_full();
            union() {
                translate([cx - sx*corner_leg/2, cy - sy*(border/2 - EPS/2), Zc])
                    cube([corner_leg, border+EPS, frame_depth+EPS], center=true);
                translate([cx - sx*(border/2 - EPS/2), cy - sy*corner_leg/2, Zc])
                    cube([border+EPS, corner_leg, frame_depth+EPS], center=true);
            }
        }
        pin_hole([x_cut, y_band, Zc], "x");
        pin_hole([x_band, y_cut, Zc], "y");
    }
}

module edge_h(sign, idx) {       // top (sign=1) / bottom (sign=-1)
    a = -h_run/2 + (idx-1)*h_run/nh;
    b = -h_run/2 +  idx   *h_run/nh;
    cy = sign*outer_h/2;
    y_band = sign > 0 ? Y_TOP : Y_BOT;
    difference() {
        intersection() {
            frame_full();
            translate([(a+b)/2, cy - sign*(border/2 - EPS/2), Zc])
                cube([abs(b-a), border+EPS, frame_depth+EPS], center=true);
        }
        pin_hole([a, y_band, Zc], "x");
        pin_hole([b, y_band, Zc], "x");
    }
}

module edge_v(sign, idx) {       // right (sign=1) / left (sign=-1)
    a = -v_run/2 + (idx-1)*v_run/nv;
    b = -v_run/2 +  idx   *v_run/nv;
    cx = sign*outer_w/2;
    x_band = sign > 0 ? X_RIGHT : X_LEFT;
    difference() {
        intersection() {
            frame_full();
            translate([cx - sign*(border/2 - EPS/2), (a+b)/2, Zc])
                cube([border+EPS, abs(b-a), frame_depth+EPS], center=true);
        }
        pin_hole([x_band, a, Zc], "y");
        pin_hole([x_band, b, Zc], "y");
    }
}

module pin() cylinder(h = 2*pin_depth - 1, d = pin_dia - 0.2, $fn = 32);

// ---- dispatch -------------------------------------------------------
if      (part == "full")       frame_full();
else if (part == "corner")     corner(seg==1||seg==3 ? 1 : -1, seg<=2 ? 1 : -1);
else if (part == "edge_top")   edge_h( 1, seg);
else if (part == "edge_bot")   edge_h(-1, seg);
else if (part == "edge_right") edge_v( 1, seg);
else if (part == "edge_left")  edge_v(-1, seg);
else if (part == "pin")        pin();

echo(str("frame outer = ", outer_w, " x ", outer_h, " x ", frame_depth, " mm"));
echo(str("segments: top/bot = ", nh, " each, sides = ", nv, " each"));
