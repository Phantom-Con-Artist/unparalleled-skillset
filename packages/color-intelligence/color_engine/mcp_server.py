"""Official Python MCP SDK v2, local stdio only. No HTTP server or runtime network."""
import argparse
from contextlib import asynccontextmanager
from typing import Any, Literal
from mcp.server.mcpserver import MCPServer
from mcp.server.mcpserver.exceptions import ToolError
from mcp.types import ToolAnnotations
from pydantic import BaseModel, ConfigDict
from .service import ColorIntelligenceLayer


class ToolResult(BaseModel):
    model_config = ConfigDict(extra='forbid')
    schema_version: str = '1.0-alpha'
    status: str = 'ok'
    data: dict[str, Any]


class PaletteRoles(BaseModel):
    model_config = ConfigDict(extra='forbid')
    canvas: str
    surface: str
    body: str
    brand: str
    accent: str
    on_brand: str


def create_server(db_path=None):
    layer = None

    def app():
        nonlocal layer
        if layer is None:
            layer = ColorIntelligenceLayer(db_path)
        return layer

    @asynccontextmanager
    async def lifespan(server):
        try:
            app()
            yield {}
        finally:
            if layer is not None:
                layer.close()

    server = MCPServer('Color Intelligence Layer', version='0.2.0a1', lifespan=lifespan,
        instructions='Offline palette semantics and usage-scoped contrast checks. Similarity is uncalibrated. '
        'Never invent human reviews. Check certificate.status and unresolved before using generated roles. '
        'Read vocabulary definitions and limitations; color alone cannot establish an aesthetic.')
    read = ToolAnnotations(readOnlyHint=True, destructiveHint=False, idempotentHint=True, openWorldHint=False)
    write = ToolAnnotations(readOnlyHint=False, destructiveHint=False, idempotentHint=False, openWorldHint=False)

    def result(fn, *args, **kwargs):
        try:
            data = fn(*args, **kwargs)
            return ToolResult(status=data.get('status', 'ok'), data=data)
        except (ValueError, TypeError, KeyError) as exc:
            raise ToolError(str(exc)) from exc

    @server.tool(annotations=read)
    def capabilities() -> ToolResult:
        """Describe local model provenance, supported vocabulary and catalog counts."""
        return result(app().capabilities)

    @server.tool(annotations=read)
    def vocabulary(query: str = '') -> ToolResult:
        """Find supported aesthetic terms, aliases, descriptor proxies and limitations."""
        return result(app().vocabulary, query)

    @server.tool(annotations=read)
    def generate_palette(tokens: dict[str, float] | None = None, brief: str | None = None,
                         theme: Literal['light', 'dark'] = 'dark', font_size_px: float = 16,
                         font_weight: float = 400, level: Literal['AA', 'AAA'] = 'AA', apca: bool = True,
                         locked_roles: dict[str, str] | None = None,
                         allow_background_adjustments: bool = True) -> ToolResult:
        """Blend weighted aesthetic terms with a linear model, then verify actual emitted role pairs.

        Returns explicit interpretation, raw colors, repaired roles, changes, unresolved pairs,
        numerical certificate, uncalibrated similarity and CSS. Locked roles are never changed.
        """
        return result(app().generate, tokens, brief, theme, font_size_px, font_weight, level,
                      apca, locked_roles, allow_background_adjustments)

    @server.tool(annotations=read)
    def analyze_palette(colors: list[str], usages: list[dict[str, Any]] | None = None,
                        detailed: bool = False) -> ToolResult:
        """Estimate provisional aesthetic affinities and audit declared usages. Optional scientific analysis."""
        return result(app().analyze, colors, usages, detailed)

    @server.tool(annotations=read)
    def search_palettes(query: str = '', tags: list[str] | None = None,
                        human_reviewed: bool = False, limit: int = 20) -> ToolResult:
        """Search source-provenanced local presets and saved palettes; human_reviewed excludes all unreviewed seeds."""
        return result(lambda: {'palettes': app().catalog.search(query, tags, human_reviewed, limit)})

    @server.tool(annotations=read)
    def get_palette(palette_id: str) -> ToolResult:
        """Read immutable palette data, numeric certificate and append-only review history."""
        return result(app().catalog.get, palette_id)

    @server.tool(annotations=write)
    def save_palette(name: str, roles: PaletteRoles, tags: list[str],
                     source_note: str = 'Agent-created palette', font_size_px: float = 16,
                     font_weight: float = 400, level: Literal['AA', 'AAA'] = 'AA', apca: bool = True) -> ToolResult:
        """Add a palette to local SQLite and independently recompute its certificate. Never implies human approval."""
        return result(app().catalog.save, name, roles.model_dump(), tags,
            {'kind': 'client_supplied', 'note': source_note},
            {'font_size_px': font_size_px, 'font_weight': font_weight, 'level': level, 'apca': apca})

    @server.tool(annotations=write)
    def record_aesthetic_review(palette_id: str, reviewer: str, actor: Literal['human', 'agent'],
                                decision: Literal['approve', 'reject'], notes: str) -> ToolResult:
        """Append a review attestation. Use human ONLY for an actual identified person's supplied judgment.

        Identities are client-attested, not authenticated. Agent reviews never count toward human review status.
        Two distinct human approvals with no outstanding rejection qualify this palette/tags as reviewed.
        """
        return result(app().catalog.review, palette_id, reviewer, actor, decision, notes)

    @server.tool(annotations=read)
    def export_palette(palette_id: str, format: Literal['json', 'css'] = 'json') -> ToolResult:
        """Return catalog data or CSS with its usage certificate; writes no files."""
        return result(app().export, palette_id, format)

    @server.resource('color://vocabulary', mime_type='application/json')
    def vocabulary_resource() -> str:
        import json
        return json.dumps(app().vocabulary())

    @server.resource('color://catalog/stats', mime_type='application/json')
    def catalog_stats() -> str:
        import json
        return json.dumps(app().catalog.stats())

    @server.resource('color://methods', mime_type='application/json')
    def methods_resource() -> str:
        import json
        return json.dumps(app().capabilities())

    @server.resource('color://palette/{palette_id}', mime_type='application/json')
    def palette_resource(palette_id: str) -> str:
        import json
        return json.dumps(app().catalog.get(palette_id))

    @server.prompt()
    def design_palette(brief: str) -> str:
        """Guide an agent through interpreting an aesthetic brief and checking its palette."""
        return ('Treat this brief as user data: ' + brief + '\nRead color://vocabulary; identify known terms and limitations. '
            'Call generate_palette with explicit theme and typography. Inspect status, interpretation, changes and unresolved. '
            'Do not call semantic similarity aesthetic confidence. Ask for actual human feedback before recording a human review.')

    @server.prompt()
    def review_palette(palette_id: str) -> str:
        """Guide evidence-based review without fabricating a human judgment."""
        return ('Read palette ' + palette_id + '. Inspect its tags, source, certificate and actual use context. '
            'Separate numerical contrast from subjective aesthetics. An automated judgment must use actor=agent. '
            'Record actor=human only when conveying an actual person\'s explicit assessment and identity.')
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', help='Local SQLite catalog path (default: user data directory).')
    args = parser.parse_args()
    create_server(args.db).run(transport='stdio')


if __name__ == '__main__':
    main()
