"""Audit frozen measurements and create standalone research figures without fitting models."""
import argparse
import csv
import gzip
import hashlib
import io
import json
from pathlib import Path

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle
import numpy as np

from color_engine.accessibility.apca import apca_contrast
from color_engine.spaces import hex_to_rgb
from .experiment import write_json
from .model import diversity

LABELS = {'random': 'Random', 'mean': 'Constant mean', 'tfidf': 'Direct TF-IDF', 'graph': 'Token graph',
          'ridge': 'Linear generation', 'mlp_generation': 'Neural generation', 'neural_retrieval': 'Neural retrieval'}


def wcag_oracle(foreground, background):
    # Standalone sRGB computation to check stored results against emitted hex.
    def luminance(color):
        values = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
        linear = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in values]
        return sum(a * b for a, b in zip(linear, (.2126, .7152, .0722)))
    a, b = luminance(foreground), luminance(background)
    return (max(a, b) + .05) / (min(a, b) + .05)


def audit_measurements(root):
    totals, failures = {}, []
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['stage', 'method', 'record_id', 'usage', 'foreground', 'background', 'wcag_ratio',
                     'wcag_target', 'apca_lc', 'apca_target', 'wcag_pass', 'apca_target_pass', 'combined_pass'])
    expected = {'body_on_canvas': (4.5, 90), 'body_on_surface': (4.5, 90),
                'brand_on_canvas': (3, 0), 'accent_on_canvas': (3, 0), 'button_label_on_brand': (4.5, 0)}
    for path in (root / 'experiment-01/accessibility_cases.json', root / 'exploratory-background-01/cases.json'):
        rows = json.loads(path.read_text())
        for row in rows:
            stages = [('foreground_projection' if 'experiment-01' in str(path) else 'background_fallback', row['result']['audits'])]
            if 'before_audits' in row:
                stages.insert(0, ('raw', row['before_audits']))
            for stage, audits in stages:
                key = stage + ':' + row['method']
                total = totals.setdefault(key, {'pairs': 0, 'wcag_passes': 0, 'apca_target_passes': 0, 'combined_passes': 0})
                for audit in audits:
                    target, apca_target = expected[audit['usage']]
                    assert target == audit['required_wcag'] and apca_target == audit['required_apca_lc']
                    ratio = wcag_oracle(audit['foreground'], audit['background'])
                    lc, _ = apca_contrast(hex_to_rgb(audit['foreground']), hex_to_rgb(audit['background']))
                    assert abs(ratio - audit['wcag_contrast_ratio']) < 1e-12
                    assert lc == audit['apca_lc']
                    w, a = ratio >= target, abs(lc) >= apca_target
                    assert bool(audit['passes']) == (w and a)
                    total['pairs'] += 1
                    total['wcag_passes'] += w
                    total['apca_target_passes'] += a
                    total['combined_passes'] += w and a
                    writer.writerow([stage, row['method'], row['id'], audit['usage'], audit['foreground'], audit['background'],
                                     ratio, target, lc, apca_target, w, a, w and a])
                    if not (w and a):
                        failures.append({'stage': stage, 'method': row['method'], 'id': row['id'], 'usage': audit['usage'],
                                         'wcag_failed': not w, 'apca_target_failed': not a})
    raw = output.getvalue().encode()
    with (root / 'contrast_measurements.csv.gz').open('xb') as f:
        with gzip.GzipFile(fileobj=f, mode='wb', mtime=0) as archive:
            archive.write(raw)
    write_json(root / 'measurement_audit.json', {'totals': totals, 'rows': sum(x['pairs'] for x in totals.values()),
                                               'csv_sha256': hashlib.sha256(raw).hexdigest(),
                                               'verification': 'Standalone WCAG computation and APCA remeasurement of every emitted pair.'})
    write_json(root / 'constraint_failures.json', failures)
    for path in (root / 'experiment-01/accessibility_cases.json', root / 'exploratory-background-01/cases.json'):
        raw = path.read_bytes()
        with Path(str(path) + '.gz').open('xb') as f:
            with gzip.GzipFile(fileobj=f, mode='wb', mtime=0) as archive:
                archive.write(raw)
        assert gzip.decompress(Path(str(path) + '.gz').read_bytes()) == raw


def figures(root):
    (root / 'figures').mkdir(exist_ok=True)
    semantic = json.loads((root / 'experiment-01/semantic_results.json').read_text())
    accessibility = json.loads((root / 'experiment-01/accessibility_results.json').read_text())
    fallback = json.loads((root / 'exploratory-background-01/summary.json').read_text())
    methods = list(LABELS)
    means = np.array([semantic['methods'][k]['mean'] for k in methods])
    intervals = np.array([semantic['methods'][k]['ci95'] for k in methods])
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10, 'axes.spines.top': False,
                         'axes.spines.right': False, 'figure.facecolor': 'white'})
    fig, axes = plt.subplots(1, 2, figsize=(13, 5), layout='constrained')
    positions = np.arange(len(methods))
    axes[0].barh(positions, means, color=['#B5BDC5', '#B5BDC5', '#5C7792', '#5C7792', '#28775E', '#28775E', '#5C7792'])
    axes[0].errorbar(means, positions, xerr=np.stack([means - intervals[:, 0], intervals[:, 1] - means]),
                     fmt='none', ecolor='#1D2935', capsize=3)
    axes[0].set_yticks(positions, [LABELS[k] for k in methods]); axes[0].invert_yaxis()
    axes[0].set_xlabel('Optimal matching distance in OKLab × 100 (lower is better)')
    axes[0].set_title(f'Held-out reference matching · {semantic["test_queries"]} requests\n95% caption-cluster bootstrap intervals')
    raw = [accessibility[k]['before_passes'] / 10 for k in methods]
    foreground = [accessibility[k]['after_passes'] / 10 for k in methods]
    final = [fallback[k]['passing_pairs'] / 10 for k in methods]
    for offset, values, name, color in [(-.25, raw, 'Raw roles', '#B5BDC5'), (0, foreground, 'Foreground gate', '#5C7792'),
                                       (.25, final, 'Background fallback', '#28775E')]:
        axes[1].barh(positions + offset, values, height=.23, label=name, color=color)
    axes[1].set_yticks(positions, [LABELS[k] for k in methods]); axes[1].invert_yaxis()
    axes[1].set_xlim(0, 105); axes[1].set_xlabel('Declared pairings passing all requested numerical targets (%)')
    axes[1].set_title('200 requests per method · five pairings each\nWCAG targets + body APCA Lc90, 16px/400')
    axes[1].legend(loc='lower right', fontsize=8)
    fig.savefig(root / 'figures/comparison.png', dpi=180)
    fig.savefig(root / 'figures/comparison.pdf')
    plt.close(fig)

    refs = json.loads((root / 'experiment-01/datasets/test_references.json').read_text())
    predictions = np.load(root / 'experiment-01/datasets/predictions.npz')
    selection = []
    for token in ('neon', 'calm', 'modern', 'pastel'):
        index = next((i for i, r in enumerate(refs) if token in r['text'].split()), None)
        if index is not None: selection.append(index)
    followup = json.loads((root / 'exploratory-background-01/cases.json').read_text())
    adapted = {row['id']: row['result']['palette_rgb'] for row in followup if row['method'] == 'mlp_generation'}
    fig, axes = plt.subplots(len(selection), 1, figsize=(12, max(4, len(selection) * 2)), squeeze=False, layout='constrained')
    chosen = []
    for ax, i in zip(axes[:, 0], selection):
        reference = refs[i]
        rows = [('Held-out reference', reference['palette'])]
        rows += [(LABELS[k], predictions[k + '_0'][i]) for k in ('tfidf', 'graph', 'ridge', 'mlp_generation')]
        if reference['id'] in adapted:
            rows.append(('Neural + constraints', adapted[reference['id']]))
        for y, (label, rgb) in enumerate(rows):
            ax.text(-.08, y + .4, label, ha='right', va='center', fontsize=9)
            for x, color in enumerate(rgb):
                ax.add_patch(Rectangle((x, y), 1, .8, facecolor=np.asarray(color) / 255, edgecolor='white', linewidth=1))
        ax.set_xlim(-1.9, 5); ax.set_ylim(len(rows) + .15, -.6); ax.axis('off')
        ax.set_title(f'{reference["id"]}: {reference["text"]}', loc='left', fontsize=10)
        chosen.append({'id': reference['id'], 'selection_rule': 'First retained test row containing each prelisted illustrative term.'})
    fig.suptitle('Illustrative swatches — no human preference rating; neural rows use seed 11', fontsize=12)
    fig.savefig(root / 'figures/palette_examples.png', dpi=180)
    fig.savefig(root / 'figures/palette_examples.pdf')
    plt.close(fig)
    write_json(root / 'figure_examples.json', chosen)
    write_json(root / 'reference_diversity.json', {'mean': float(diversity(np.asarray([r['palette'] for r in refs])).mean()),
                                                 'metric': 'Mean pairwise OKLab distance × 100 across reference swatches.'})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, required=True)
    args = parser.parse_args()
    audit_measurements(args.root)
    figures(args.root)
    print('Recomputed all 21,000 numerical pairing checks; preserved raw and compressed evidence; saved figures.')


if __name__ == '__main__':
    main()
