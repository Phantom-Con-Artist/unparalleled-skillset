"""Local CLI for Color Intelligence Layer; stdout contains JSON only."""
import argparse
import json
import sys
from .service import ColorIntelligenceLayer


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', help='Local SQLite catalog path.')
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('doctor')
    vocab = sub.add_parser('vocabulary'); vocab.add_argument('query', nargs='?', default='')
    generate = sub.add_parser('generate'); generate.add_argument('brief')
    generate.add_argument('--theme', choices=['light', 'dark'], default='dark')
    generate.add_argument('--tokens', help='JSON object of weighted aesthetic terms.')
    generate.add_argument('--level', choices=['AA', 'AAA'], default='AA')
    analyze = sub.add_parser('analyze'); analyze.add_argument('colors', nargs='+')
    analyze.add_argument('--usages', help='JSON array of declared usages.')
    analyze.add_argument('--detailed', action='store_true')
    search = sub.add_parser('search'); search.add_argument('query', nargs='?', default='')
    search.add_argument('--human-reviewed', action='store_true')
    export = sub.add_parser('export'); export.add_argument('palette_id'); export.add_argument('--format', choices=['json', 'css'], default='json')
    sub.add_parser('serve')
    args = parser.parse_args()
    if args.command == 'serve':
        from .mcp_server import create_server
        create_server(args.db).run(transport='stdio')
        return
    layer = None
    try:
        layer = ColorIntelligenceLayer(args.db)
        if args.command == 'doctor':
            result = layer.capabilities()
        elif args.command == 'vocabulary':
            result = layer.vocabulary(args.query)
        elif args.command == 'generate':
            result = layer.generate(tokens=json.loads(args.tokens) if args.tokens else None,
                                    brief=args.brief, theme=args.theme, level=args.level)
        elif args.command == 'analyze':
            result = layer.analyze(args.colors, json.loads(args.usages) if args.usages else None, args.detailed)
        elif args.command == 'search':
            result = {'palettes': layer.catalog.search(args.query, human_reviewed=args.human_reviewed)}
        else:
            result = layer.export(args.palette_id, args.format)
        print(json.dumps(result, indent=2, allow_nan=False))
    except (ValueError, TypeError) as exc:
        print(json.dumps({'error': str(exc)}))
        sys.exit(2)
    finally:
        if layer is not None:
            layer.close()


if __name__ == '__main__':
    main()
