"""Single-request JSON stdin/stdout transport for agent processes."""
import argparse
import contextlib
import json
import sys
import traceback

from . import ScientificColorEngine
from .agent_tools import get_tool_definitions


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--describe', action='store_true', help='Print provider-neutral tool definitions.')
    args = parser.parse_args()
    if args.describe:
        print(json.dumps({'schema_version': '0.2.0', 'tools': get_tool_definitions()}, allow_nan=False))
        return 0
    try:
        payload = sys.stdin.read(1_048_577)
        if len(payload) > 1_048_576:
            raise ValueError('Request exceeds 1,048,576 characters.')
        def reject_constant(value):
            raise ValueError(f'Non-finite JSON constant: {value}')
        request = json.loads(payload, parse_constant=reject_constant)
        if not isinstance(request, dict) or set(request) != {'method', 'arguments'}:
            raise ValueError('Request must contain exactly method and arguments.')
        allowed = {tool['name'] for tool in get_tool_definitions()}
        if not isinstance(request['method'], str) or request['method'] not in allowed:
            raise ValueError('Unknown method. Use --describe for available tools.')
        if not isinstance(request['arguments'], dict):
            raise ValueError('arguments must be an object.')
        # Third-party diagnostic output belongs on stderr, never in the JSON stream.
        with contextlib.redirect_stdout(sys.stderr):
            result = getattr(ScientificColorEngine(), request['method'])(**request['arguments'])
        response = {'schema_version': '0.2.0', 'ok': True, 'result': result}
        exit_code = 0
    except (ValueError, TypeError) as exc:
        response = {'schema_version': '0.2.0', 'ok': False, 'error': {'code': 'invalid_request', 'message': str(exc)}}
        exit_code = 2
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        response = {'schema_version': '0.2.0', 'ok': False, 'error': {'code': 'execution_error', 'message': str(exc)}}
        exit_code = 1
    print(json.dumps(response, allow_nan=False))
    return exit_code


if __name__ == '__main__':
    sys.exit(main())
