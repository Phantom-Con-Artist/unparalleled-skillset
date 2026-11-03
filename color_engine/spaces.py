"""
Color Space Conversions & Gamut Mapping
=======================================
Perceptually uniform conversions between sRGB, Linear sRGB, OKLab, OKLch, and CIELAB.
Implements Ottosson (2020), CSS Color Module Level 4 specifications, and binary-search
gamut clipping preserving exact Lightness and Hue.
"""

import math
from typing import Tuple

# Direct Linear sRGB to LMS Matrix (Björn Ottosson, 2020 & CSS Color Module Level 4)
M1_SRGB_TO_LMS = [
    [+0.4122214708, +0.5363325363, +0.0514459929],
    [+0.2119034982, +0.6806995451, +0.1073969566],
    [+0.0883024619, +0.2817188376, +0.6299787005],
]

# Non-linear LMS' to OKLab Matrix
M2_LMS_TO_OKLAB = [
    [+0.2104542553, +0.7936177850, -0.0040720468],
    [+1.9779984951, -2.4285922050, +0.4505937099],
    [+0.0259040371, +0.7827717662, -0.8086757660],
]

# Inverse OKLab to Non-linear LMS' Matrix
M2_INV = [
    [+1.0000000000, +0.3963377774, +0.2158037573],
    [+1.0000000000, -0.1055613458, -0.0638541728],
    [+1.0000000000, -0.0894841775, -1.2914855480],
]

# Inverse LMS to Linear sRGB Matrix
M1_INV = [
    [+4.0767416621, -3.3077115913, +0.2309699292],
    [-1.2684380046, +2.6097574011, -0.3413193965],
    [-0.0041960863, -0.7034186147, +1.7076147010],
]


def hex_to_rgb(hex_str: str) -> Tuple[int, int, int]:
    """Parse hex string (#RRGGBB or RRGGBB) into integer 0-255 RGB tuple."""
    hex_clean = hex_str.strip().lstrip('#')
    if len(hex_clean) == 3:
        hex_clean = ''.join(c * 2 for c in hex_clean)
    if len(hex_clean) != 6:
        raise ValueError(f"Invalid hex color code: '{hex_str}'")
    return (
        int(hex_clean[0:2], 16),
        int(hex_clean[2:4], 16),
        int(hex_clean[4:6], 16),
    )


def rgb_to_hex(r: int, g: int, b: int) -> str:
    """Format integer 0-255 RGB values as uppercase #RRGGBB."""
    r_c = max(0, min(255, int(round(r))))
    g_c = max(0, min(255, int(round(g))))
    b_c = max(0, min(255, int(round(b))))
    return f"#{r_c:02X}{g_c:02X}{b_c:02X}"


def srgb_to_linear(c_srgb: float) -> float:
    """Expand non-linear sRGB channel [0.0, 1.0] to linear light."""
    c = max(0.0, min(1.0, c_srgb))
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def linear_to_srgb(c_lin: float) -> float:
    """Compress linear channel [0.0, 1.0] to non-linear sRGB."""
    c = max(0.0, min(1.0, c_lin))
    if c <= 0.0031308:
        return c * 12.92
    return 1.055 * (c ** (1.0 / 2.4)) - 0.055


def rgb_to_oklab(rgb: Tuple[int, int, int]) -> Tuple[float, float, float]:
    """Convert sRGB (0-255) to OKLab (L in [0, 1], a, b)."""
    r_lin = srgb_to_linear(rgb[0] / 255.0)
    g_lin = srgb_to_linear(rgb[1] / 255.0)
    b_lin = srgb_to_linear(rgb[2] / 255.0)

    l = M1_SRGB_TO_LMS[0][0] * r_lin + M1_SRGB_TO_LMS[0][1] * g_lin + M1_SRGB_TO_LMS[0][2] * b_lin
    m = M1_SRGB_TO_LMS[1][0] * r_lin + M1_SRGB_TO_LMS[1][1] * g_lin + M1_SRGB_TO_LMS[1][2] * b_lin
    s = M1_SRGB_TO_LMS[2][0] * r_lin + M1_SRGB_TO_LMS[2][1] * g_lin + M1_SRGB_TO_LMS[2][2] * b_lin

    l_ = math.cbrt(l)
    m_ = math.cbrt(m)
    s_ = math.cbrt(s)

    L = M2_LMS_TO_OKLAB[0][0] * l_ + M2_LMS_TO_OKLAB[0][1] * m_ + M2_LMS_TO_OKLAB[0][2] * s_
    a = M2_LMS_TO_OKLAB[1][0] * l_ + M2_LMS_TO_OKLAB[1][1] * m_ + M2_LMS_TO_OKLAB[1][2] * s_
    b = M2_LMS_TO_OKLAB[2][0] * l_ + M2_LMS_TO_OKLAB[2][1] * m_ + M2_LMS_TO_OKLAB[2][2] * s_
    return L, a, b


def oklab_to_oklch(L: float, a: float, b: float) -> Tuple[float, float, float]:
    """Convert OKLab to OKLch (L in [0, 1], Chroma C >= 0, Hue angle h in [0, 360) deg)."""
    C = math.hypot(a, b)
    if C <= 1e-5:
        h = 0.0  # Achromatic
    else:
        h = (math.degrees(math.atan2(b, a))) % 360.0
    return L, C, h


def hex_to_oklch(hex_str: str) -> Tuple[float, float, float]:
    """Helper: direct hex to OKLch (L, C, h)."""
    rgb = hex_to_rgb(hex_str)
    L, a, b = rgb_to_oklab(rgb)
    return oklab_to_oklch(L, a, b)


def oklch_to_oklab(L: float, C: float, h_deg: float) -> Tuple[float, float, float]:
    """Convert OKLch (L in [0, 1], Chroma C >= 0, Hue angle h in [0, 360) deg) to OKLab."""
    h_rad = math.radians(h_deg % 360.0)
    a = C * math.cos(h_rad)
    b = C * math.sin(h_rad)
    return L, a, b


def oklab_to_linear_srgb(L: float, a: float, b: float) -> Tuple[float, float, float]:
    """Convert OKLab coordinates to linear sRGB light values."""
    l_ = M2_INV[0][0] * L + M2_INV[0][1] * a + M2_INV[0][2] * b
    m_ = M2_INV[1][0] * L + M2_INV[1][1] * a + M2_INV[1][2] * b
    s_ = M2_INV[2][0] * L + M2_INV[2][1] * a + M2_INV[2][2] * b

    l = l_ ** 3
    m = m_ ** 3
    s = s_ ** 3

    r_lin = M1_INV[0][0] * l + M1_INV[0][1] * m + M1_INV[0][2] * s
    g_lin = M1_INV[1][0] * l + M1_INV[1][1] * m + M1_INV[1][2] * s
    b_lin = M1_INV[2][0] * l + M1_INV[2][1] * m + M1_INV[2][2] * s

    return r_lin, g_lin, b_lin


def is_in_srgb_gamut(r_lin: float, g_lin: float, b_lin: float, eps: float = 1e-4) -> bool:
    """Check whether linear sRGB components lie within [0.0, 1.0] gamut bounds."""
    return (
        -eps <= r_lin <= 1.0 + eps
        and -eps <= g_lin <= 1.0 + eps
        and -eps <= b_lin <= 1.0 + eps
    )


def oklch_to_srgb_hex(L: float, C: float, h_deg: float) -> str:
    """
    Convert OKLch coordinates to standard uppercase #RRGGBB hex code.
    If the specified (L, C, h) falls outside the sRGB display gamut,
    uses binary search (16 iterations) to clip Chroma while holding Lightness (L)
    and Hue (h) strictly constant, preventing any perceptible hue shift.
    """
    L_clamped = max(0.0, min(1.0, L))
    L_ok, a_ok, b_ok = oklch_to_oklab(L_clamped, C, h_deg)
    r_lin, g_lin, b_lin = oklab_to_linear_srgb(L_ok, a_ok, b_ok)

    if is_in_srgb_gamut(r_lin, g_lin, b_lin):
        r = round(max(0.0, min(1.0, linear_to_srgb(r_lin))) * 255)
        g = round(max(0.0, min(1.0, linear_to_srgb(g_lin))) * 255)
        b = round(max(0.0, min(1.0, linear_to_srgb(b_lin))) * 255)
        return rgb_to_hex(r, g, b)

    # Binary search Chroma to find highest in-gamut chroma along identical (L, h)
    low_c = 0.0
    high_c = max(0.0, C)
    for _ in range(16):
        mid_c = (low_c + high_c) / 2.0
        _, a_mid, b_mid = oklch_to_oklab(L_clamped, mid_c, h_deg)
        rl, gl, bl = oklab_to_linear_srgb(L_clamped, a_mid, b_mid)
        if is_in_srgb_gamut(rl, gl, bl):
            low_c = mid_c
        else:
            high_c = mid_c

    _, a_final, b_final = oklch_to_oklab(L_clamped, low_c, h_deg)
    rl, gl, bl = oklab_to_linear_srgb(L_clamped, a_final, b_final)
    r = round(max(0.0, min(1.0, linear_to_srgb(rl))) * 255)
    g = round(max(0.0, min(1.0, linear_to_srgb(gl))) * 255)
    b = round(max(0.0, min(1.0, linear_to_srgb(bl))) * 255)
    return rgb_to_hex(r, g, b)


def delta_e_ok(L1: float, a1: float, b1: float, L2: float, a2: float, b2: float) -> float:
    """Euclidean perceptual distance in OKLab space."""
    return math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2)


def rgb_to_cielab(rgb: Tuple[int, int, int]) -> Tuple[float, float, float, float, float]:
    """
    Convert sRGB (0-255) to CIELAB (L*, a*, b*, C*ab, hab in deg) using D65 standard illuminant.
    Essential for Ou-Luo (2006) and Ou (2004) empirical harmony/emotion equations.
    """
    r_lin = srgb_to_linear(rgb[0] / 255.0)
    g_lin = srgb_to_linear(rgb[1] / 255.0)
    b_lin = srgb_to_linear(rgb[2] / 255.0)

    # sRGB to XYZ (D65)
    X = 0.4124564 * r_lin + 0.3575761 * g_lin + 0.1804375 * b_lin
    Y = 0.2126729 * r_lin + 0.7151522 * g_lin + 0.0721750 * b_lin
    Z = 0.0193339 * r_lin + 0.1191920 * g_lin + 0.9503041 * b_lin

    # D65 reference white
    Xn, Yn, Zn = 0.95047, 1.00000, 1.08883

    def f(t: float) -> float:
        delta = 6.0 / 29.0
        if t > delta ** 3:
            return math.cbrt(t)
        return t / (3.0 * delta ** 2) + 4.0 / 29.0

    fx = f(X / Xn)
    fy = f(Y / Yn)
    fz = f(Z / Zn)

    L_star = 116.0 * fy - 16.0
    a_star = 500.0 * (fx - fy)
    b_star = 200.0 * (fy - fz)
    C_star = math.hypot(a_star, b_star)
    h_star = (math.degrees(math.atan2(b_star, a_star))) % 360.0

    return L_star, a_star, b_star, C_star, h_star


def delta_e_ciede2000(lab1: Tuple[float, float, float], lab2: Tuple[float, float, float]) -> float:
    """
    Calculate ISO/CIE standard CIEDE2000 color difference (Delta E 00).
    Uses Colour-Science reference implementation with fallback to Euclidean CIE76.
    """
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message=".*Matplotlib.*")
            import colour
            import numpy as np
            val = colour.delta_E(np.array(lab1), np.array(lab2), method="CIE 2000")
            return round(float(val), 4)
    except Exception:
        return round(math.sqrt(sum((a - b) ** 2 for a, b in zip(lab1, lab2))), 4)


def rgb_to_munsell(rgb: Tuple[int, int, int]) -> str:
    """
    Convert sRGB (0-255) to Munsell Book of Color notation (e.g. '6.7PB 4.5/17.2')
    via ASTM D1535-08 computational renotation in Colour-Science.
    Returns Munsell notation string or 'N/A' if outside MacAdam paint limits.
    """
    try:
        import warnings
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore")
            import colour
            import numpy as np
            srgb = np.clip(np.array([c / 255.0 for c in rgb]), 1e-4, 1.0 - 1e-4)
            xyz = colour.sRGB_to_XYZ(srgb)
            xyy = colour.XYZ_to_xyY(xyz)
            res = colour.xyY_to_munsell_colour(xyy)
            return str(res) if res is not None else "N/A"
    except Exception:
        return "N/A"

