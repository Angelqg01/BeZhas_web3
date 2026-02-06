/**
 * BeZhas Intelligence - MCP Server Entry Point (STDIO Transport)
 * 
 * This is the main MCP server that exposes AI tools for:
 * - Gas optimization & profitability analysis
 * - Smart BEZ <-> FIAT swap calculations
 * - Regulatory compliance verification (AML/KYC)
 * 
 * Used via STDIO for VS Code / CLI integration.
 * For Docker/Backend use the HTTP wrapper (http-server.ts).
 * 
 * @contract BEZ Token: 0xEcBa873B534C54DE2B62acDE232ADCa4369f11A8 (INMUTABLE)
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';

// Initialize MCP Server
const server = new McpServer({
    name: 'bezhas-intelligence',
    version: '1.0.0',
    description: 'BeZhas AI Intelligence Server - Gas optimization, Fiat/Crypto swap, and regulatory compliance',
});

// Register all tools
registerTools(server);

// Start STDIO transport (for VS Code / CLI)
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🧠 BeZhas Intelligence MCP Server running (STDIO)...');
