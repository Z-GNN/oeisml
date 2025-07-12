#!/usr/bin/env node
/**
 * Agent Zero Deployment Script
 * Deploys cognitive agents to Agent Zero runtime
 */

const AgentZero = require('agent-zero-core');
const fs = require('fs-extra');

class CognitiveAgentDeployer {
  constructor() {
    this.runtime = new AgentZero.Runtime();
    this.agents = new Map();
  }

  async deploy() {
    console.log('Deploying cognitive agents to Agent Zero runtime...');
    
    // Load agent definitions
    const agentDefs = await fs.readJSON('integration/agent-zero/agent_definitions.json');
    const connectors = await fs.readJSON('integration/agent-zero/runtime_connectors.json');
    
    // Register connectors
    Object.entries(connectors).forEach(([name, connector]) => {
      this.runtime.registerConnector(name, connector);
    });
    
    // Deploy agents
    for (const [agentId, agentDef] of Object.entries(agentDefs)) {
      try {
        const agent = await this.runtime.createAgent(agentDef);
        await agent.initialize();
        this.agents.set(agentId, agent);
        console.log(`✓ Deployed agent: ${agentId}`);
      } catch (error) {
        console.error(`✗ Failed to deploy agent ${agentId}:`, error.message);
      }
    }
    
    console.log(`Successfully deployed ${this.agents.size} cognitive agents`);
    
    // Start runtime
    await this.runtime.start();
    console.log('Agent Zero runtime started with cognitive agents');
  }

  async shutdown() {
    console.log('Shutting down cognitive agents...');
    
    for (const [agentId, agent] of this.agents) {
      await agent.shutdown();
      console.log(`✓ Shutdown agent: ${agentId}`);
    }
    
    await this.runtime.stop();
    console.log('Agent Zero runtime stopped');
  }
}

// Main execution
if (require.main === module) {
  const deployer = new CognitiveAgentDeployer();
  
  process.on('SIGINT', async () => {
    await deployer.shutdown();
    process.exit(0);
  });
  
  deployer.deploy().catch(console.error);
}

module.exports = CognitiveAgentDeployer;
