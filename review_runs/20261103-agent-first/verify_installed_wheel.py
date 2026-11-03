"""Run package regressions from outside the checkout on the installed wheel."""
import json
import sys
import unittest
from pathlib import Path

import color_engine
from color_engine.generators.prng_mixer import load_curated_token_dataset

root = Path(__file__).resolve().parents[2]
package_path = Path(color_engine.__file__).resolve()
assert root not in package_path.parents, f'Loaded checkout instead of wheel: {package_path}'
print(json.dumps({'python': sys.version, 'package_path': str(package_path),
                  'v1_tokens': len(load_curated_token_dataset('v1')),
                  'v2_tokens': len(load_curated_token_dataset('v2'))}), flush=True)
suite = unittest.TestSuite()
for pattern in ('test_agent_contract.py', 'test_agent_edge_cases.py', 'test_agent_transport.py'):
    suite.addTests(unittest.defaultTestLoader.discover(str(root / 'tests'), pattern=pattern))
result = unittest.TextTestRunner(verbosity=2).run(suite)
sys.exit(0 if result.wasSuccessful() else 1)
