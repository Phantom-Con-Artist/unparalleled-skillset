# Setup diagnostics

The model export encountered two setup errors before the successful export. These excerpts are transcribed from captured tool output; the original export log filename was reused during setup. Existing logs from earlier research runs were not modified.

1. Running `python3 scripts/export_linear.py` without the repository on the module search path could not resolve the trusted research bundle's class:

   ```text
   ModuleNotFoundError: No module named 'research'
   ```

   Reproduction instructions now use `PYTHONPATH=.` for export scripts.

2. The initial model manifest included NumPy vocabulary indices, which Python's JSON encoder rejected:

   ```text
   TypeError: Object of type int64 is not JSON serializable
   when serializing dict item 'cold'
   when serializing dict item 'vocabulary'
   ```

   The export now converts all vocabulary indices to ordinary Python integers.

Successful baseline and refined exports are retained separately in `logs/model-export.log` and `logs/model-export-refined.log`. Initial and subsequent catalog audit failures have their original separate logs, including `alpha-tests-initial.log` and the three `catalog-build*` logs.
