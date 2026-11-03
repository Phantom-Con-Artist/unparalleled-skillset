"""Role-based contrast audits and proposals verified against emitted sRGB colors."""
import math
from typing import Any, Dict, List, Optional

from ..spaces import hex_to_rgb, rgb_to_hex, hex_to_oklch, oklch_to_srgb_hex, rgb_to_oklab, delta_e_ok
from .wcag import wcag_contrast_ratio
from .apca import apca_contrast, apca_font_guidance


def canonical_hex(value: str) -> str:
    return rgb_to_hex(*hex_to_rgb(value))


def contrast_measurements(foreground: str, background: str) -> Dict[str, Any]:
    fg, bg = hex_to_rgb(foreground), hex_to_rgb(background)
    ratio = wcag_contrast_ratio(fg, bg)
    lc, polarity = apca_contrast(fg, bg)
    return {'foreground': canonical_hex(foreground), 'background': canonical_hex(background),
            'wcag_contrast_ratio': ratio, 'apca_lc': lc, 'apca_polarity': polarity,
            'apca_font_guidance': apca_font_guidance(lc)}


def propose_foreground(foreground: str, backgrounds: List[str], min_wcag: float = 4.5,
                       min_apca_lc: float = 0.0) -> Optional[Dict[str, Any]]:
    """Find the closest OKLab candidate on a sampled lightness axis.

    Hue/chroma are retained before gamut mapping; the actual emitted hex values
    are measured again. A failed search returns None, never an unverified fix.
    The search is bounded and does not claim a globally minimal color change.
    """
    if not backgrounds or not 1 <= min_wcag <= 21 or not 0 <= min_apca_lc <= 110:
        raise ValueError('Invalid contrast search targets or empty backgrounds.')
    foreground = canonical_hex(foreground)
    backgrounds = [canonical_hex(bg) for bg in backgrounds]
    _, C, h = hex_to_oklch(foreground)
    original_lab = rgb_to_oklab(hex_to_rgb(foreground))
    bg_rgbs = [hex_to_rgb(bg) for bg in backgrounds]
    best = None
    best_distance = float('inf')
    candidates = [foreground] + [oklch_to_srgb_hex(i / 256, C, h) for i in range(257)]
    for candidate in dict.fromkeys(candidates):
        rgb = hex_to_rgb(candidate)
        ratios = [wcag_contrast_ratio(rgb, bg) for bg in bg_rgbs]
        lcs = [apca_contrast(rgb, bg)[0] for bg in bg_rgbs]
        if min(ratios) < min_wcag or min(abs(lc) for lc in lcs) < min_apca_lc:
            continue
        distance = delta_e_ok(*original_lab, *rgb_to_oklab(rgb))
        if distance < best_distance:
            best_distance = distance
            best = {'foreground': candidate, 'backgrounds': backgrounds,
                    'wcag_contrast_ratio': min(ratios), 'minimum_abs_apca_lc': min(abs(lc) for lc in lcs),
                    'required_wcag_ratio': min_wcag, 'required_abs_apca_lc': min_apca_lc,
                    'verified': True, 'verification_scope': 'Numerical targets on listed opaque sRGB backgrounds; typography is assessed separately.',
                    'method': 'sampled_oklch_lightness_search', 'delta_e_ok': distance}
    return best


def audit_usages(palette: List[str], usages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Audit declared usage only. Missing typography defaults to 16px/400 body text."""
    if not isinstance(usages, list) or len(usages) > 256:
        raise ValueError('usages must be a list with at most 256 entries.')
    allowed = {'role', 'foreground', 'background', 'kind', 'font_size_px', 'font_weight'}
    audits = []
    for usage in usages:
        if not isinstance(usage, dict) or set(usage) - allowed:
            raise ValueError('Each usage must be an object with documented fields only.')
        if not isinstance(usage.get('role'), str) or not usage['role'].strip():
            raise ValueError('Each usage needs a non-empty role.')
        fg = canonical_hex(usage.get('foreground'))
        bg = canonical_hex(usage.get('background'))
        if fg not in palette or bg not in palette:
            raise ValueError('Usage foreground and background must occur in the palette.')
        kind = usage.get('kind', 'text')
        if kind not in ('text', 'non_text'):
            raise ValueError("Usage kind must be 'text' or 'non_text'.")
        size, weight = usage.get('font_size_px', 16), usage.get('font_weight', 400)
        if (isinstance(size, bool) or not isinstance(size, (int, float)) or not math.isfinite(size) or not 0 < size <= 1000
                or isinstance(weight, bool) or not isinstance(weight, (int, float)) or not math.isfinite(weight) or not 1 <= weight <= 1000):
            raise ValueError('font_size_px must be in (0, 1000] and font_weight in [1, 1000].')
        target = 3.0 if kind == 'non_text' or size >= 24 or (size >= 56 / 3 and weight >= 700) else 4.5
        metrics = contrast_measurements(fg, bg)
        apca_target = None
        if kind == 'text':
            # Conservative body guidance; even large body text needs at least Lc75.
            for level in (75, 90):
                if any(size >= o['font_size_px'] and weight >= o['font_weight']
                       for o in apca_font_guidance(level)['body_text_options']):
                    apca_target = level
                    break
        audits.append({**metrics, 'role': usage['role'], 'kind': kind,
                       'font_size_px': size if kind == 'text' else None,
                       'font_weight': weight if kind == 'text' else None,
                       'required_wcag_ratio': target, 'passes_wcag': metrics['wcag_contrast_ratio'] >= target,
                       'required_abs_apca_lc': apca_target,
                       'passes_apca_guidance': (abs(metrics['apca_lc']) >= apca_target if apca_target else None),
                       'apca_scope': 'Conservative body-text guidance; not WCAG conformance.' if kind == 'text' else 'Not evaluated for non-text.',
                       'assumptions': ['Opaque sRGB foreground and background.', 'Declared usage; no layout or rendering inspection.']})
    return audits
