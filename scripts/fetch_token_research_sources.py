"""Fetch primary sources and the pinned PAT CSVs into a NEW local research directory.

Requires pdftotext (Poppler) to extract PDFs. Does not execute downloaded code.
Full PDF/page/dataset copies are kept locally and ignored by git.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import subprocess
import urllib.request

PAPERS = {
    'text2colors-2018': 'https://arxiv.org/pdf/1804.04128',
    'multimodal-color-2023': 'https://arxiv.org/pdf/2308.04118',
    'culture-palette-2021': 'https://arxiv.org/pdf/2102.05231',
    'color-compatibility-2011': 'https://www.dgp.toronto.edu/~donovan/color/colorcomp.pdf',
    'accessible-sequences-2021': 'https://arxiv.org/pdf/2107.02270',
    'colora11y-2026': 'https://arxiv.org/pdf/2608.23852',
    'deep-sets-2017': 'https://arxiv.org/pdf/1703.06114',
    'compositional-color-2021': 'https://arxiv.org/pdf/2109.10477',
    'colorgpt-2025': 'https://arxiv.org/pdf/2508.08987',
}
PAGES = {
    'stripe-accessible-color': 'https://stripe.com/blog/accessible-color-systems',
    'oklab': 'https://bottosson.github.io/posts/oklab/',
    'leonardo': 'https://raw.githubusercontent.com/adobe/leonardo/main/README.md',
    'wcag-contrast': 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
    'wcag-non-text': 'https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html',
    'ibm-graph': 'https://research.ibm.com/publications/cognitive-color-palette-creation-using-client-message-and-color-psychology',
    'apca': 'https://raw.githubusercontent.com/Myndex/SAPC-APCA/master/documentation/APCA_in_a_Nutshell.md',
}
REVISION = '45948e2f3baddb9bab61921b5d5fbc9b0a8b6809'


class ExtractText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip = 0
        self.text = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip = max(0, self.skip - 1)
    def handle_data(self, data):
        if not self.skip and data.strip(): self.text.append(data.strip())


def fetch(root, kind, name, url):
    row = {'id': name, 'url': url, 'kind': kind, 'retrieved_utc': datetime.now(timezone.utc).isoformat()}
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'ColorEngineResearch/0.1'}), timeout=90) as response:
            raw = response.read(67_108_865)
        if len(raw) > 67_108_864: raise ValueError('Source exceeds 64 MiB download limit.')
        if kind == 'pdf':
            if not raw.startswith(b'%PDF'): raise ValueError('Expected PDF bytes.')
            path = root / 'sources/pdfs' / f'{name}.pdf'
            path.write_bytes(raw)
            subprocess.run(['pdftotext', '-layout', str(path), str(root / 'sources/text' / f'{name}.txt')], check=True, capture_output=True)
        elif kind == 'dataset':
            path = root / 'datasets' / name
            path.write_bytes(raw)
        else:
            path = root / 'sources/pages' / f'{name}.raw'
            path.write_bytes(raw)
            text = raw.decode('utf-8', errors='replace')
            if '<html' in text.lower():
                parser = ExtractText(); parser.feed(text); text = '\n'.join(parser.text)
            (root / 'sources/text' / f'{name}.txt').write_text(text)
        row.update(status='saved', path=str(path.relative_to(root)), bytes=len(raw), sha256=hashlib.sha256(raw).hexdigest())
    except Exception as exc:
        row.update(status='failed', error=f'{type(exc).__name__}: {exc}')
    print(json.dumps(row), flush=True)
    return row


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    for directory in ('sources/pdfs', 'sources/pages', 'sources/text', 'datasets'):
        (args.output / directory).mkdir(parents=True)
    (args.output / '.gitignore').write_text('sources/pdfs/\nsources/text/\nsources/pages/\ndatasets/\nmodels/\n')
    jobs = [('pdf', name, url) for name, url in PAPERS.items()] + [('page', name, url) for name, url in PAGES.items()]
    for split in ('train', 'val', 'test'):
        name = f'palette_and_text_{split}.csv'
        url = f'https://raw.githubusercontent.com/CyberAgentAILab/text2palette/{REVISION}/full_palette_generation/data/colors/{name}'
        jobs.append(('dataset', name, url))
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(lambda job: fetch(args.output, *job), jobs))
    with (args.output / 'acquisition.json').open('x') as stream:
        json.dump(rows, stream, indent=2)
        stream.write('\n')
    if any(r['status'] == 'failed' for r in rows):
        raise SystemExit('Some sources failed; acquisition.json records each failure. Existing files were retained.')


if __name__ == '__main__':
    main()
