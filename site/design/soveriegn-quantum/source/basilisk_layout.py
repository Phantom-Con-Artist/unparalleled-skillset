# Writes the Basilisk 2 die layout as JSON for Blender: python3 basilisk_layout.py basilisk.json (needs shapely 2.1+)
# Basilisk 2 die layout (fictional, physically plausible). Units: micrometres, die centred at 0,0.
import json, math, sys
import shapely
from shapely.geometry import LineString, Polygon, box, Point
from shapely.ops import unary_union

W, G = 10.0, 6.0           # CPW centre width and gap
TR = W/2 + G
trenches, metal_add, bridges, lines_meta = [], [], [], []
FLAT, SQ, MITRE = 'flat', 'square', 'mitre'

def cpw(path, open_start=False, open_end=False, w=W, g=G, bridge_every=320.0, name=''):
    ls = LineString(path)
    tr = ls.buffer(w/2 + g, cap_style=FLAT, join_style=MITRE)
    for open_, pt, nxt in ((open_start, path[0], path[1]), (open_end, path[-1], path[-2])):
        if open_:
            # gap around an open end
            dx, dy = pt[0]-nxt[0], pt[1]-nxt[1]; L = math.hypot(dx, dy); dx, dy = dx/L, dy/L
            tr = tr.union(LineString([pt, (pt[0]+dx*g, pt[1]+dy*g)]).buffer(w/2+g, cap_style=FLAT))
    trenches.append(tr)
    metal_add.append(ls.buffer(w/2, cap_style=FLAT, join_style=MITRE))
    # airbridges at regular arc length, skipping corners
    total = ls.length; s = bridge_every*0.6
    while s < total - 60:
        p = ls.interpolate(s); p2 = ls.interpolate(min(total, s+1)); ang = math.atan2(p2.y-p.y, p2.x-p.x)
        # only on straight stretches
        pa, pb = ls.interpolate(max(0, s-20)), ls.interpolate(min(total, s+20))
        if abs(math.atan2(pb.y-pa.y, pb.x-pa.x) - ang) < 1e-3:
            bridges.append([p.x, p.y, ang, w + 2*g + 10])
        s += bridge_every
    lines_meta.append({'name': name, 'length_um': round(total, 1)})

def launch(x, y, dirx, diry, name):
    # bond pad with taper toward the chip interior; returns the inner end point
    pad, taper = 100.0, 180.0
    px, py = x, y
    ex, ey = x + dirx*(pad/2 + taper), y + diry*(pad/2 + taper)
    nx, ny = -diry, dirx
    def quad(a, wa, b, wb):
        return Polygon([(a[0]+nx*wa, a[1]+ny*wa), (b[0]+nx*wb, b[1]+ny*wb), (b[0]-nx*wb, b[1]-ny*wb), (a[0]-nx*wa, a[1]-ny*wa)])
    a = (px - dirx*pad/2, py - diry*pad/2); b = (px + dirx*pad/2, py + diry*pad/2)
    metal_add.append(quad(a, pad/2, b, pad/2)); metal_add.append(quad(b, pad/2, (ex, ey), W/2))
    trenches.append(quad((a[0]-dirx*60, a[1]-diry*60), pad/2+60, b, pad/2+60)); trenches.append(quad(b, pad/2+60, (ex, ey), TR))
    return (ex, ey)

QX = [-2400, -800, 800, 2400]; QY = [-2400, -800, 800, 2400]
ARM, AW, AG = 165.0, 24.0, 24.0
qubits = []
for r, qy in enumerate(QY):
    mirrored = r in (1, 3)        # rows 1 and 3 have their SQUID on the top arm
    for cidx, qx in enumerate(QX):
        cross = unary_union([box(qx-ARM, qy-AW/2, qx+ARM, qy+AW/2), box(qx-AW/2, qy-ARM, qx+AW/2, qy+ARM)])
        gap = unary_union([box(qx-ARM-AG, qy-AW/2-AG, qx+ARM+AG, qy+AW/2+AG), box(qx-AW/2-AG, qy-ARM-AG, qx+AW/2+AG, qy+ARM+AG)])
        trenches.append(gap); metal_add.append(cross)
        s = 1 if mirrored else -1     # direction of the SQUID arm
        qubits.append({'id': f'Q{r*4+cidx+1:02d}', 'x': qx, 'y': qy, 'squid_dir': s,
                       'squid_y': qy + s*(ARM + AG/2)})
# coupling buses between row neighbours
for qy in QY:
    for a, b in zip(QX, QX[1:]):
        x0, x1 = a + ARM + AG + 28, b - ARM - AG - 28
        trenches.append(box(x0-20, qy-15-20, x1+20, qy+15+20)); metal_add.append(box(x0, qy-15, x1, qy+15))
# feedlines in the channels between rows 0-1 and 2-3, left pad to right pad
for fy in (-1600.0, 1600.0):
    pa = launch(-4780, fy, 1, 0, 'feed-in'); pb = launch(4780, fy, -1, 0, 'feed-out')
    cpw([pa, pb], name=f'feedline {fy:+.0f}')
# readout resonators: open end near the readout arm, meander, shorted end coupling along the feedline
for q in qubits:
    qx, qy, s = q['x'], q['y'], q['squid_dir']
    d = -s                         # readout arm points away from the SQUID
    fy = -1600.0 if qy < 0 else 1600.0
    y_open = qy + d*(ARM + AG + 26)
    y_end = fy - d*28              # runs parallel to the feedline at 28 um centre spacing
    pts = [(qx, y_open), (qx, y_open + d*40)]
    y = y_open + d*40; legs = 0; x_left, x_right = qx - 210, qx + 210; side = 1
    while abs(y_end - y) > 120 and legs < 14:
        pts.append((x_right if side > 0 else x_left, y)); y += d*30; pts.append((x_right if side > 0 else x_left, y)); side = -side; legs += 1
    pts.append((qx - 230, y)); pts.append((qx - 230, y_end)); pts.append((qx + 230, y_end))
    cpw(pts, open_start=True, name=f"{q['id']} readout")
    # claw: a short bar across the open end strengthens the coupling capacitance
    metal_add.append(box(qx-45, y_open-d*3 - 6, qx+45, y_open - d*3 + 6) if d > 0 else box(qx-45, y_open+3-6, qx+45, y_open+3+6))
    trenches.append(box(qx-45-G, y_open-d*3-6-G, qx+45+G, y_open-d*3+6+G))
# control lines: XY drive (open end beside the SQUID arm) and flux bias (shorted next to the SQUID)
pads_bottom, pads_top, pads_left, pads_right = [], [], [], []
def control_targets(q):
    qx, qy, s = q['x'], q['y'], q['squid_dir']
    tip = qy + s*(ARM + AG)
    return {'xy': (qx - 105, tip + s*14), 'flux': (qx + 34, tip + s*12)}
for q in qubits:
    r = QY.index(q['y']); t = control_targets(q); s = q['squid_dir']
    for kind in ('xy', 'flux'):
        tx, ty = t[kind]
        if r == 0:
            pe = launch(tx, -4780, 0, 1, 'bottom'); path = [pe, (tx, ty)]
        elif r == 3:
            pe = launch(tx, 4780, 0, -1, 'top'); path = [pe, (tx, ty)]
        else:
            continue
        cpw(path, open_end=(kind == 'xy'), name=f"{q['id']} {kind}")
# rows 1 and 2 are fed from the sides through the channel between them
ch = []
for q in qubits:
    r = QY.index(q['y'])
    if r not in (1, 2): continue
    for kind in ('xy', 'flux'):
        ch.append((q, kind))
for side, sgn in (('left', -1), ('right', 1)):
    group = [(q, k) for q, k in ch if (q['x'] < 0) == (sgn < 0)]
    # row 1 lines (turn down) in the lower half, row 2 lines (turn up) in the upper half
    for row, yb, step in ((1, -40.0, -44.0), (2, 40.0, 44.0)):
        g = [(q, k) for q, k in group if QY.index(q['y']) == row]
        # nearest target to the entry edge takes the lane closest to its row
        g.sort(key=lambda qk: abs(control_targets(qk[0])[qk[1]][0] - sgn*5000))
        g = g[::-1]
        for lane, (q, kind) in enumerate(g):
            tx, ty = control_targets(q)[kind]
            ly = yb + step*(len(g) - 1 - lane) * (1)
            pad_y = ly * 1.0 + (0)
            pe = launch(sgn*4780, ly*4.0, -sgn, 0, side)
            path = [pe, (sgn*4300, ly*4.0), (sgn*4300 - sgn*0, ly), (tx, ly), (tx, ty)]
            # remove duplicate points
            clean = [path[0]]
            for p in path[1:]:
                if math.hypot(p[0]-clean[-1][0], p[1]-clean[-1][1]) > 1e-6: clean.append(p)
            cpw(clean, open_end=(kind == 'xy'), name=f"{q['id']} {kind}")
ground = box(-4720, -4720, 4720, 4720)
metal = ground.difference(unary_union(trenches)).union(unary_union(metal_add))
metal = shapely.make_valid(metal).buffer(0)
# flux-trapping holes: 3 um squares on a 20 um pitch, kept 8 um clear of every edge, around the hero qubit Q10
from shapely.prepared import prep
keep = box(-800-1500, 800-1500, -800+1500, 800+1500).difference(unary_union(trenches).buffer(8)).difference(unary_union(metal_add).buffer(8))
pk = prep(keep); holes = []
for ix in range(-75, 76):
    for iy in range(-75, 76):
        hx, hy = -800 + ix*20 + 10, 800 + iy*20 + 10
        sqr = box(hx-1.5, hy-1.5, hx+1.5, hy+1.5)
        if pk.contains(sqr): holes.append(sqr)
metal = metal.difference(unary_union(holes))
print('holes', len(holes))
# simplified SQUIDs for every qubit: two 2 um leads bridging the arm tip to ground
squids = []
for q in qubits:
    qx, s = q['x'], q['squid_dir']; tip = q['y'] + s*ARM
    for dx in (-7, 7):
        squids.append(box(qx+dx-1, min(tip, tip+s*AG), qx+dx+1, max(tip, tip+s*AG)))
    squids.append(box(qx-8, q['squid_y'] - 1 + s*4, qx+8, q['squid_y'] + 1 + s*4))
squid_poly = unary_union(squids)
def tri(geom):
    t = shapely.constrained_delaunay_triangles(geom)
    out = []
    for p in t.geoms:
        c = list(p.exterior.coords)[:3]; out.append([[round(v, 3) for v in xy] for xy in c])
    return out
def rings(geom):
    polys = getattr(geom, 'geoms', [geom]); out = []
    for p in polys:
        out.append([[round(x, 3), round(y, 3)] for x, y in p.exterior.coords])
        for i in p.interiors: out.append([[round(x, 3), round(y, 3)] for x, y in i.coords])
    return out
data = {'metal_tris': tri(metal), 'metal_rings': rings(metal), 'squid_tris': tri(squid_poly), 'squid_rings': rings(squid_poly),
        'bridges': bridges, 'qubits': qubits, 'lines': lines_meta}
json.dump(data, open(sys.argv[1], 'w'))
print('metal area mm2', round(metal.area/1e6, 2), 'tris', len(data['metal_tris']), 'rings', len(data['metal_rings']), 'bridges', len(bridges), 'lines', len(lines_meta))
