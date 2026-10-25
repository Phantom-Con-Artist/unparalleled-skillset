# Regenerate with: python3 site/design/soveriegn-quantum/textures/gen_textures.py site/design/soveriegn-quantum/textures
# Generates tileable surface-imperfection maps for the Soveriegn Quantum cryostat.
import numpy as np, sys, os
from PIL import Image, ImageDraw, ImageFilter
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(42)
N = 1024

def fnoise(n, sx, sy=None, seed=None):
    # tileable noise: white noise filtered by a gaussian in frequency space
    r = np.random.default_rng(seed)
    sy = sx if sy is None else sy
    w = r.standard_normal((n, n))
    fy = np.fft.fftfreq(n)[:, None]; fx = np.fft.fftfreq(n)[None, :]
    filt = np.exp(-((fx * sx) ** 2 + (fy * sy) ** 2))
    out = np.real(np.fft.ifft2(np.fft.fft2(w) * filt))
    out -= out.min(); out /= out.max()
    return out

def scratches(n, count, length, width, seed):
    r = np.random.default_rng(seed)
    img = Image.new('L', (n * 3, n * 3), 0); d = ImageDraw.Draw(img)
    for _ in range(count):
        x, y = r.uniform(n, 2 * n, 2); a = r.uniform(0, np.pi) if r.random() > 0.4 else r.normal(0, 0.15)
        L = r.uniform(*length); pts = []
        for t in np.linspace(0, 1, 12):
            pts.append((x + np.cos(a) * L * t + r.normal(0, 1.2), y + np.sin(a) * L * t + r.normal(0, 1.2)))
        d.line(pts, fill=int(r.uniform(90, 255)), width=int(r.choice(width)))
    a = np.asarray(img, dtype=np.float32) / 255
    # fold the 3x3 canvas back onto one tile so scratches wrap seamlessly
    t = np.zeros((n, n), np.float32)
    for i in range(3):
        for j in range(3): t = np.maximum(t, a[i*n:(i+1)*n, j*n:(j+1)*n])
    return t

def fingerprints(n, count, seed):
    r = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    warp = fnoise(n, 60, seed=seed + 1) - 0.5
    acc = np.zeros((n, n), np.float32)
    for _ in range(count):
        cx, cy = r.uniform(0, n, 2); rad = r.uniform(18, 34) * n / 1024
        dx = (xx - cx + n / 2) % n - n / 2; dy = (yy - cy + n / 2) % n - n / 2
        ang = r.uniform(0, np.pi); ca, sa = np.cos(ang), np.sin(ang)
        u = (dx * ca + dy * sa) / 1.0; v = (-dx * sa + dy * ca) / 1.35
        rr = np.sqrt(u ** 2 + v ** 2)
        ridges = 0.5 + 0.5 * np.sin(rr * 2.2 * 1024 / n + warp * 8)
        mask = np.exp(-(rr / rad) ** 4)
        acc = np.maximum(acc, ridges * mask * r.uniform(0.5, 1))
    return acc

def save(name, arr, mode='L'):
    arr = np.clip(arr, 0, 1)
    if mode == 'L': Image.fromarray((arr * 255).astype(np.uint8), 'L').save(f'{OUT}/{name}.png', optimize=True)
    else: Image.fromarray((arr * 255).astype(np.uint8), 'RGB').save(f'{OUT}/{name}.png', optimize=True)

def normal_from_height(h, strength):
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * strength
    gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * strength
    nz = np.ones_like(h); l = np.sqrt(gx ** 2 + gy ** 2 + 1)
    return np.dstack([(-gx / l) * 0.5 + 0.5, (gy / l) * 0.5 + 0.5, (nz / l) * 0.5 + 0.5])

def mr(rough, metal):
    return np.dstack([np.ones_like(rough), rough, np.full_like(rough, metal)])

# shared imperfection layers
smudge = fnoise(N, 90, seed=3) ** 2.2
smudge = np.clip((smudge - 0.25) * 1.6, 0, 1)
prints = fingerprints(N, 7, seed=5)
smudge_soft = fnoise(N, 200, seed=4)
scr_fine = scratches(N, 420, (20, 140), [1], seed=7)
scr_bold = scratches(N, 24, (80, 380), [1, 2], seed=8)
brush = fnoise(N, 0.6, 260, seed=9)                 # long horizontal grain
brush2 = fnoise(N, 2.0, 600, seed=10)

# stainless steel: brushed grain, smudges, prints, scratches
rough = 0.19 + 0.08 * (brush - 0.5) + 0.05 * (brush2 - 0.5) + 0.05 * smudge_soft + 0.05 * prints + 0.07 * scr_fine - 0.04 * scr_bold
save('steel_mr', mr(np.clip(rough, 0.08, 0.6), 1.0), 'RGB')
h = brush * 0.6 + brush2 * 0.4 - scr_fine * 0.5 - scr_bold * 0.8
save('steel_n', normal_from_height(h, 2.2), 'RGB')
tone = 0.78 + 0.03 * (fnoise(N, 40, seed=11) - 0.5) - 0.012 * smudge_soft
save('steel_c', np.dstack([tone, tone, tone * 1.015]), 'RGB')

# aluminium shield: finer, more matte, rolled-sheet grain
rough = 0.36 + 0.08 * (fnoise(N, 0.8, 180, seed=12) - 0.5) + 0.06 * smudge_soft + 0.05 * prints + 0.08 * scr_fine
save('alu_mr', mr(np.clip(rough, 0.15, 0.7), 1.0), 'RGB')
save('alu_n', normal_from_height(fnoise(N, 0.8, 180, seed=12) - scr_fine * 0.4, 1.2), 'RGB')
tone = 0.86 + 0.03 * (fnoise(N, 30, seed=13) - 0.5) - 0.025 * smudge
save('alu_c', np.dstack([tone, tone * 1.005, tone * 1.01]), 'RGB')

# gold-plated copper plates: concentric lathe marks, uneven plating, handling marks (planar, non-tiling)
M = 2048
yy, xx = np.mgrid[0:M, 0:M].astype(np.float32); cx = cy = M / 2
rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (M / 2)
lathe = 0.5 + 0.5 * np.sin(rr * 900 + np.sin(rr * 37) * 2)
lathe2 = 0.5 + 0.5 * np.sin(rr * 2300)
def up(a):
    return np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((M, M), Image.BICUBIC), np.float32) / 255
sm2, pr2, sc2 = up(smudge), up(prints), up(scr_fine)
tarn = up(fnoise(N, 70, seed=14)) ** 1.5
rough = 0.18 + 0.06 * lathe + 0.03 * lathe2 + 0.16 * sm2 + 0.12 * pr2 + 0.08 * sc2 + 0.06 * tarn
save('gold_mr', mr(np.clip(rough, 0.08, 0.6), 1.0), 'RGB')
save('gold_n', normal_from_height(lathe * 0.5 + lathe2 * 0.3 - sc2 * 0.4, 1.4), 'RGB')
base = np.array([0.93, 0.74, 0.40])
col = base[None, None, :] * (1 - 0.10 * tarn[..., None]) + np.array([0.06, -0.02, -0.04])[None, None, :] * tarn[..., None] - 0.03 * sm2[..., None]
save('gold_c', col, 'RGB')

# OFHC copper: oxidation blotches, heat tint, handling
tar = fnoise(N, 55, seed=15) ** 1.4; heat = fnoise(N, 140, seed=16)
col = np.dstack([0.93 - 0.18 * tar + 0.03 * heat, 0.55 - 0.16 * tar - 0.05 * heat, 0.38 - 0.10 * tar + 0.06 * heat]) - 0.03 * smudge[..., None]
save('copper_c', col, 'RGB')
rough = 0.26 + 0.18 * tar + 0.12 * smudge + 0.10 * prints + 0.08 * scr_fine
save('copper_mr', mr(np.clip(rough, 0.12, 0.7), 1.0), 'RGB')
save('copper_n', normal_from_height(fnoise(N, 1.0, 120, seed=17) * 0.5 - scr_fine * 0.5, 1.2), 'RGB')

# powder-coated frame: orange peel, scuffs, faint grime near feet handled by vertex/UV later
peel = fnoise(N, 7, seed=18)
scuff = np.clip(scratches(N, 60, (10, 90), [2, 3], seed=19) * 1.2, 0, 1)
grime = fnoise(N, 120, seed=20) ** 3
tone = 0.90 - 0.06 * grime - 0.05 * scuff
save('paint_c', np.dstack([tone, tone * 0.995, tone * 0.98]), 'RGB')
save('paint_mr', mr(np.clip(0.38 + 0.08 * peel - 0.12 * scuff + 0.08 * grime, 0.2, 0.7), 0.0), 'RGB')
save('paint_n', normal_from_height(peel - scuff * 0.4, 3.0), 'RGB')

# G10 fibreglass: woven glass under epoxy
yy, xx = np.mgrid[0:N, 0:N].astype(np.float32)
weave = (0.5 + 0.5 * np.sin(xx * 2 * np.pi / 16)) * (0.5 + 0.5 * np.sin(yy * 2 * np.pi / 16 + np.pi * (np.floor(xx / 16) % 2)))
fib = fnoise(N, 0.6, 30, seed=21)
col = np.dstack([0.56 + 0.05 * weave + 0.04 * fib, 0.52 + 0.05 * weave + 0.03 * fib, 0.28 + 0.03 * weave])
save('g10_c', col, 'RGB')
save('g10_mr', mr(np.clip(0.32 + 0.1 * weave + 0.08 * smudge, 0.1, 0.7), 0.0), 'RGB')
save('g10_n', normal_from_height(weave * 0.6 + fib * 0.4, 1.5), 'RGB')

# mu-metal / dark anodised shield
rough = 0.42 + 0.1 * (fnoise(N, 1, 200, seed=22) - 0.5) + 0.18 * smudge + 0.14 * prints + 0.12 * scr_fine
save('dark_mr', mr(np.clip(rough, 0.2, 0.8), 1.0), 'RGB')
print('done')
