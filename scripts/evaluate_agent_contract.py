"""Write reproducible contract and generated-theme measurements; never overwrite evidence."""
import argparse
import hashlib
import json
import platform
import random
import subprocess
import sys
import time
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from color_engine.generators.ui_system import generate_ui_design_system
from color_engine import hex_to_rgb, wcag_contrast_ratio


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    out = Path(args.output)
    if out.exists():
        raise SystemExit(f'Refusing to overwrite {out}')
    rng = random.Random(20261103)
    seeds = ['#2563EB', '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']
    seeds += [f'#{rng.randrange(1 << 24):06X}' for _ in range(32)]
    rows = []
    started = time.perf_counter()
    for seed in seeds:
        result = generate_ui_design_system(seed)
        for mode in ['light_theme', 'dark_theme']:
            theme = result[mode]
            for role, fg in theme['typography'].items():
                for surface, bg in theme['surfaces'].items():
                    ratio = wcag_contrast_ratio(hex_to_rgb(fg), hex_to_rgb(bg))
                    rows.append({'seed': seed, 'theme': mode, 'role': role, 'surface': surface,
                                 'foreground': fg, 'background': bg, 'contrast_ratio': ratio,
                                 'passes_aa_normal': ratio >= 4.5})
    suite = unittest.defaultTestLoader.discover(str(ROOT / 'tests'), pattern='test_agent_contract.py')
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {
        'python': platform.python_version(),
        'base_commit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
        'test_source_sha256': hashlib.sha256((ROOT/'tests/test_agent_contract.py').read_bytes()).hexdigest(),
        'fixture_sha256': hashlib.sha256((ROOT/'tests/fixtures/ou_luo_2006.json').read_bytes()).hexdigest(),
        'contract': {'tests': result.testsRun, 'failure_events': len(result.failures), 'error_events': len(result.errors),
                     'failed_test_ids': sorted(set(t.id() for t, _ in result.failures + result.errors))},
        'theme_measurements': {'seeds': len(seeds), 'pairs': len(rows),
                               'passes': sum(r['passes_aa_normal'] for r in rows),
                               'minimum_ratio': min(r['contrast_ratio'] for r in rows), 'rows': rows},
        'seconds': time.perf_counter() - started,
        'scope': 'Correctness and usability contracts; does not measure human aesthetic preference or ML accuracy.',
    }
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open('x') as f:
        json.dump(report, f, indent=2, allow_nan=False)
        f.write('\n')
    print(json.dumps({k: v for k, v in report.items() if k != 'theme_measurements'}, indent=2))
    print('Theme pairs passing:', report['theme_measurements']['passes'], '/', len(rows))


if __name__ == '__main__':
    main()
