"""
WCAG 2.2 Contrast Ratio & Relative Luminance
============================================
Mathematical implementation of W3C Web Content Accessibility Guidelines (WCAG) 2.2
relative luminance (BT.709 coefficients) and contrast ratio formulas.
"""

from typing import Tuple
from ..spaces import srgb_to_linear


def wcag_relative_luminance(rgb: Tuple[int, int, int]) -> float:
    """Calculate relative luminance Y for WCAG 2.x using BT.709 coefficients."""
    r_lin = srgb_to_linear(rgb[0] / 255.0)
    g_lin = srgb_to_linear(rgb[1] / 255.0)
    b_lin = srgb_to_linear(rgb[2] / 255.0)
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin


def wcag_contrast_ratio(rgb1: Tuple[int, int, int], rgb2: Tuple[int, int, int]) -> float:
    """Calculate WCAG 2.1/2.2 contrast ratio (L1 + 0.05) / (L2 + 0.05)."""
    y1 = wcag_relative_luminance(rgb1)
    y2 = wcag_relative_luminance(rgb2)
    l1 = max(y1, y2)
    l2 = min(y1, y2)
    return (l1 + 0.05) / (l2 + 0.05)
