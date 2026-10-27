import path from 'node:path';
import { fileURLToPath } from 'node:url';

const agentCli = fileURLToPath(new URL('../../studio-agent-tools/src/cli.mjs', import.meta.url));
const mcpServer = fileURLToPath(new URL('../../studio-agent-tools/src/mcp.mjs', import.meta.url));

/** The line a user can paste to their coding agent so it listens for Studio requests. Absolute paths work however the package was installed. */
export function agentInstruction(root, cli = agentCli) {
  const base = `node "${cli}" --project "${path.resolve(root)}"`;
  return `Listen for Unparalleled Studio requests. First read how to handle them: ${base} context --reference studio-requests . Then run ${base} next --wait 25000 . For each request, find the source with locate, read it, make the smallest change with patch (several files in one patch when the change needs them), check the result, and reply honestly. Repeat while I keep working.`;
}

/** The same tools as an MCP server, for agents that support one. */
export function mcpSetup(root, server = mcpServer) {
  const project = path.resolve(root);
  return { command: 'node', args: [server, '--project', project], claudeCode: `claude mcp add unparalleled-studio -- node "${server}" --project "${project}"` };
}
