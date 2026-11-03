"""
APCA-W3 (Advanced Perceptual Contrast Algorithm v0.0.98G-4g)
============================================================
Perceptually uniform spatial contrast algorithm modeling human vision,
photopic/mesopic adaptation, black clamping, and BoW/WoB contrast polarity.
"""

from typing import Tuple


def apca_srgb_y(rgb: Tuple[int, int, int]) -> float:
    """APCA-W3 v0.98G Screen Luminance (Y) calculation using display gamma 2.4."""
    return (
        0.2126729 * ((rgb[0] / 255.0) ** 2.4) +
        0.7151522 * ((rgb[1] / 255.0) ** 2.4) +
        0.0721750 * ((rgb[2] / 255.0) ** 2.4)
    )


def apca_contrast(txt_rgb: Tuple[int, int, int], bg_rgb: Tuple[int, int, int]) -> Tuple[float, str]:
    """
    Calculate APCA Lightness Contrast (Lc) with exact SAPCA 0.0.98G-4g power-law constants.
    Returns: (Lc_contrast_score, polarity_label)
    Positive Lc: Black on White (BoW). Negative Lc: White on Black (WoB).
    """
    txt_y = apca_srgb_y(txt_rgb)
    bg_y = apca_srgb_y(bg_rgb)

    blk_thrs = 0.022
    blk_clmp = 1.414

    # Black-level soft clamping
    txt_y_c = txt_y if txt_y > blk_thrs else txt_y + ((blk_thrs - txt_y) ** blk_clmp)
    bg_y_c = bg_y if bg_y > blk_thrs else bg_y + ((blk_thrs - bg_y) ** blk_clmp)

    # Threshold check
    if abs(bg_y_c - txt_y_c) < 0.0005:
        return 0.0, "Identical"

    scale_bow = 1.14
    scale_wob = 1.14
    lo_bow_offset = 0.027
    lo_wob_offset = 0.027
    lo_clip = 0.1

    if bg_y_c > txt_y_c:
        # Normal polarity: Dark text on Light background (BoW)
        sapc = ((bg_y_c ** 0.56) - (txt_y_c ** 0.57)) * scale_bow
        output = 0.0 if sapc < lo_clip else sapc - lo_bow_offset
        polarity = "BoW"
    else:
        # Reverse polarity: Light text on Dark background (WoB)
        sapc = ((bg_y_c ** 0.65) - (txt_y_c ** 0.62)) * scale_wob
        output = 0.0 if sapc > -lo_clip else sapc + lo_wob_offset
        polarity = "WoB"

    Lc = output * 100.0
    return round(Lc, 2), polarity


def apca_readability_tier(abs_lc: float) -> str:
    """Categorize absolute APCA Lc into typography & UI usability tiers."""
    if abs_lc >= 90.0:
        return "Body_Preferred_90 (Fluent text, thin weights down to 14px)"
    elif abs_lc >= 75.0:
        return "Body_Standard_75 (Primary body text down to 16px)"
    elif abs_lc >= 60.0:
        return "Content_60 (Subheadings, prominent UI labels, 18px+)"
    elif abs_lc >= 45.0:
        return "Headline_Large_45 (H1/H2 titles 24px+ bold, primary icons)"
    elif abs_lc >= 30.0:
        return "Spot_UI_30 (Non-text UI components, borders, disabled text)"
    return "Fail (Insufficient contrast for readable content)"
