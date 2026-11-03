"""
Color Emotion Coordinates (Ou et al., 2004)
===========================================
Formulates human affective response across three orthogonal psychophysical dimensions:
1. Warm - Cool (WC)
2. Heavy - Light (HL)
3. Active - Passive (AP)
"""

import math
from typing import Tuple, Dict


def ou_color_emotions(cielab: Tuple[float, float, float, float, float]) -> Dict[str, float]:
    """
    Calculate Ou et al. (2004) psychological emotion dimensions for a single color:
    1. Warm-Cool (WC): thermal sensation, peak positive warmth near orange-red (50 deg).
    2. Heavy-Light (HL): visual weight, strongly anti-correlated with lightness (L*).
    3. Active-Passive (AP): dynamic visual stimulation, proportional to saturation and distance from middle-gray.
    """
    L, a, b, C, h = cielab
    h_rad = math.radians(h - 50.0)  # Peak warmth at 50 deg (orange-red)

    # 1. Warm-Cool
    WC = -0.5 + 0.02 * (C ** 1.07) * math.cos(h_rad)

    # 2. Heavy-Light
    HL = -2.1 + 0.05 * (100.0 - L)

    # 3. Active-Passive
    AP = -1.1 + 0.03 * math.sqrt(C ** 2 + (L - 50.0) ** 2)

    return {
        "warm_cool": round(WC, 3),
        "heavy_light": round(HL, 3),
        "active_passive": round(AP, 3),
    }
