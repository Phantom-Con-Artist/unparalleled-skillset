"""Usage-scoped numerical certification of emitted opaque sRGB colors."""
from .spaces import hex_to_oklch, oklch_to_srgb_hex
from .accessibility.guidance import canonical_hex, propose_foreground, audit_usages, contrast_measurements

ROLE_NAMES = ('canvas', 'surface', 'body', 'brand', 'accent', 'on_brand')


def role_usages(roles, font_size_px=16, font_weight=400):
    return [dict(role=f'body_on_{bg}', foreground=roles['body'], background=roles[bg],
                 kind='text', font_size_px=font_size_px, font_weight=font_weight) for bg in ('canvas', 'surface')] + [
        dict(role=f'{role}_on_canvas', foreground=roles[role], background=roles['canvas'], kind='non_text')
        for role in ('brand', 'accent')] + [dict(role='button_label', foreground=roles['on_brand'],
            background=roles['brand'], kind='text', font_size_px=font_size_px, font_weight=font_weight)]


def certify(roles, font_size_px=16, font_weight=400, level='AA', apca=True):
    if level not in ('AA', 'AAA'):
        raise ValueError('level must be AA or AAA.')
    roles = {k: canonical_hex(roles[k]) for k in ROLE_NAMES}
    usages = role_usages(roles, font_size_px, font_weight)
    audits = audit_usages(list(roles.values()), usages)
    for audit, usage in zip(audits, usages):
        if level == 'AAA' and usage['kind'] == 'text':
            large = font_size_px >= 24 or (font_size_px >= 56 / 3 and font_weight >= 700)
            audit['required_wcag_ratio'] = 4.5 if large else 7.0
            audit['passes_wcag'] = audit['wcag_contrast_ratio'] >= audit['required_wcag_ratio']
        audit['passes_requested_policy'] = audit['passes_wcag'] and (
            not apca or usage['kind'] != 'text' or audit.get('passes_apca_guidance') is True)
    return {'status': 'verified_declared_usages' if all(a['passes_requested_policy'] for a in audits) else 'infeasible',
            'level': level, 'apca_guidance_requested': apca, 'font_size_px': font_size_px, 'font_weight': font_weight,
            'audits': audits, 'scope': 'Five declared opaque sRGB role pairs only; not full WCAG conformance.',
            'limitations': ['APCA is additional experimental guidance, not a WCAG 2.2 requirement.',
                            'Transparency, images, gradients, hover states and color-only meaning require separate checks.']}


def constrain(colors, theme='dark', font_size_px=16, font_weight=400, level='AA', apca=True,
              locked_roles=None, allow_background_adjustments=True):
    if theme not in ('light', 'dark'):
        raise ValueError('theme must be light or dark.')
    colors = [canonical_hex(c) for c in colors]
    if not 2 <= len(colors) <= 16:
        raise ValueError('Provide 2–16 colors.')
    locked_roles = locked_roles or {}
    if set(locked_roles) - set(ROLE_NAMES):
        raise ValueError('Unknown locked role.')
    locked_roles = {k: canonical_hex(v) for k, v in locked_roles.items()}
    ordered = sorted(colors, key=lambda c: hex_to_oklch(c)[0])
    background = ordered[0] if theme == 'dark' else ordered[-1]
    body = ordered[-1] if theme == 'dark' else ordered[0]
    chromatic = sorted(colors, key=lambda c: hex_to_oklch(c)[1], reverse=True)
    roles = {'canvas': background, 'surface': background, 'body': body,
             'brand': chromatic[0], 'accent': chromatic[1], 'on_brand': body}
    roles.update(locked_roles)
    original = roles.copy()
    # Validate typography through the same authoritative usage auditor before a search.
    initial = certify(roles, font_size_px, font_weight, level, apca)
    best = (roles.copy(), initial)
    fractions = (0, .25, .5, .75, 1) if allow_background_adjustments else (0,)
    for fraction in fractions:
        candidate = original.copy()
        if allow_background_adjustments:
            for role, lightness in [('canvas', .08 if theme == 'dark' else .99),
                                    ('surface', .14 if theme == 'dark' else .97)]:
                if role not in locked_roles:
                    L, C, h = hex_to_oklch(original[role])
                    candidate[role] = oklch_to_srgb_hex(L + fraction * (lightness - L), C * (1 - fraction), h)
        baseline = certify(candidate, font_size_px, font_weight, level, apca)
        for role, backgrounds, index in [('body', ['canvas', 'surface'], 0), ('brand', ['canvas'], 2), ('accent', ['canvas'], 3)]:
            if role in locked_roles:
                continue
            audit = baseline['audits'][index]
            target_apca = audit.get('required_abs_apca_lc') if apca and role == 'body' else 0
            # Unsupported typography is surfaced as infeasible; it is never silently certified.
            target_apca = 90 if target_apca is None and apca and role == 'body' else target_apca or 0
            proposal = propose_foreground(candidate[role], [candidate[b] for b in backgrounds],
                                          audit['required_wcag_ratio'], target_apca)
            if proposal:
                candidate[role] = proposal['foreground']
        if 'on_brand' not in locked_roles:
            label_audit = baseline['audits'][4]
            proposal = propose_foreground(candidate['on_brand'], [candidate['brand']],
                label_audit['required_wcag_ratio'], (label_audit.get('required_abs_apca_lc') or 90) if apca else 0)
            if proposal is None and 'brand' not in locked_roles:
                # A brand swatch may pass non-text contrast yet admit no readable label.
                # Repair the brand too, then check the emitted pair again.
                brand_proposal = propose_foreground(candidate['brand'], [candidate['canvas']], 3, 90 if apca else 0)
                if brand_proposal:
                    candidate['brand'] = brand_proposal['foreground']
                    proposal = propose_foreground(candidate['on_brand'], [candidate['brand']],
                        label_audit['required_wcag_ratio'], (label_audit.get('required_abs_apca_lc') or 90) if apca else 0)
            if proposal is None and 'brand' not in locked_roles:
                L, C, h = hex_to_oklch(candidate['brand'])
                required_lc = (label_audit.get('required_abs_apca_lc') or 90) if apca else 0
                # Polarity makes APCA asymmetric: verify the real label direction.
                for lightness in sorted((i / 256 for i in range(257)), key=lambda v: abs(v - L)):
                    brand = oklch_to_srgb_hex(lightness, C, h)
                    if contrast_measurements(brand, candidate['canvas'])['wcag_contrast_ratio'] < 3:
                        continue
                    labels = [(label, contrast_measurements(label, brand)) for label in ('#000000', '#FFFFFF')]
                    feasible = [(label, metrics) for label, metrics in labels
                        if metrics['wcag_contrast_ratio'] >= label_audit['required_wcag_ratio']
                        and abs(metrics['apca_lc']) >= required_lc]
                    if feasible:
                        candidate['brand'] = brand
                        proposal = {'foreground': feasible[0][0]}
                        break
            if proposal:
                candidate['on_brand'] = proposal['foreground']
        certificate = certify(candidate, font_size_px, font_weight, level, apca)
        best = candidate, certificate
        if certificate['status'] == 'verified_declared_usages':
            break
    roles, certificate = best
    return {'roles': roles, 'certificate': certificate,
            'changes': [{'role': key, 'before': original[key], 'after': value} for key, value in roles.items() if original[key] != value],
            'locked_roles': locked_roles, 'background_adjustments_allowed': allow_background_adjustments,
            'unresolved': [a['role'] for a in certificate['audits'] if not a['passes_requested_policy']]}
