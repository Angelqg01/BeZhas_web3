/**
 * Unit tests: Tool Registry
 * Verifies all 13 MCP tools are registered correctly.
 */
import { describe, it, expect } from 'vitest';
import { createMockMcpServer } from '../helpers/mockMcpServer.js';
import { registerTools } from '../../tools/index.js';

describe('Tool Registry', () => {
    it('should register all 13 MCP tools', () => {
        const { server, getToolNames } = createMockMcpServer();
        registerTools(server as any);

        const names = getToolNames();
        expect(names).toHaveLength(13);
    });

    it('should register the 3 core tools', () => {
        const { server, getToolNames } = createMockMcpServer();
        registerTools(server as any);

        const names = getToolNames();
        expect(names).toContain('analyze_gas_strategy');
        expect(names).toContain('calculate_smart_swap');
        expect(names).toContain('verify_regulatory_compliance');
    });

    it('should register all 10 extended tools', () => {
        const { server, getToolNames } = createMockMcpServer();
        registerTools(server as any);

        const names = getToolNames();
        expect(names).toContain('github_repo_manager');
        expect(names).toContain('firecrawl_scraper');
        expect(names).toContain('playwright_automation');
        expect(names).toContain('blockscout_explorer');
        expect(names).toContain('skill_creator_ai');
        expect(names).toContain('auditmos_security');
        expect(names).toContain('tally_dao_governance');
        expect(names).toContain('obliq_ai_sre');
        expect(names).toContain('kinaxis_supply_chain');
        expect(names).toContain('alpaca_markets');
    });

    it('should call server.tool exactly 13 times', () => {
        const { server } = createMockMcpServer();
        registerTools(server as any);

        expect(server.tool).toHaveBeenCalledTimes(13);
    });

    it('each tool should have name, description, schema, and handler', () => {
        const { server } = createMockMcpServer();
        registerTools(server as any);

        for (const call of server.tool.mock.calls) {
            expect(call).toHaveLength(4);
            expect(typeof call[0]).toBe('string');      // name
            expect(typeof call[1]).toBe('string');      // description
            expect(typeof call[2]).toBe('object');      // schema
            expect(typeof call[3]).toBe('function');    // handler
        }
    });
});
