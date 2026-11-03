"""Exploratory background adjustment; foreground-only benchmark remains unchanged."""
import numpy as np
from color_engine.spaces import hex_to_rgb, hex_to_oklch, oklch_to_srgb_hex
from color_engine.accessibility.guidance import propose_foreground
from color_engine.accessibility.wcag import wcag_contrast_ratio
from .model import constrain_palette, assign_roles, audit_roles, rgb_to_lab_batch


def constrain_with_background_fallback(rgb, theme, allow_background_changes=False):
    initial = constrain_palette(rgb, theme)
    initial['constraint_strategy'] = 'foreground_only'
    initial['background_fallback_used'] = False
    if initial['status'] == 'verified_declared_usages' or not allow_background_changes:
        return initial
    before = assign_roles(rgb, theme)
    for fraction in (.125, .25, .5, 1.0):
        roles = initial['roles'].copy()
        endpoint = 1 if theme == 'light' else 0
        for role in ('canvas', 'surface'):
            L, C, h = hex_to_oklch(roles[role])
            roles[role] = oklch_to_srgb_hex(L + fraction * (endpoint - L), C, h)
        for role, backgrounds, ratio, apca in [
            ('body', [roles['canvas'], roles['surface']], 4.5, 90),
            ('brand', [roles['canvas']], 3, 0),
            ('accent', [roles['canvas']], 3, 0),
        ]:
            proposal = propose_foreground(roles[role], backgrounds, ratio, apca)
            if proposal is not None:
                roles[role] = proposal['foreground']
        audits, label = audit_roles(roles)
        if not all(a['passes'] for a in audits):
            continue
        before_rgb = np.array([hex_to_rgb(c) for c in before.values()])
        after_rgb = np.array([hex_to_rgb(c) for c in roles.values()])
        movement = np.linalg.norm(rgb_to_lab_batch(before_rgb) - rgb_to_lab_batch(after_rgb), axis=1) * 100
        return {**initial, 'status': 'verified_declared_usages', 'roles': roles, 'button_label': label,
                'audits': audits, 'palette_rgb': after_rgb.tolist(),
                'mean_role_movement_oklab_x100': float(movement.mean()),
                'changes': [{'role': role, 'before': before[role], 'after': c, 'delta_e_ok_x100': float(d)}
                            for (role, c), d in zip(roles.items(), movement) if before[role] != c],
                'constraint_strategy': 'foreground_and_background', 'background_fallback_used': True,
                'background_step_fraction': fraction}
    return initial
