#!/usr/bin/env node
/**
 * ECAN-Inspired Attention Allocation System
 * Implements adaptive attention mechanisms for cognitive kernel prioritization
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class ECANAttentionAllocator {
  constructor() {
    this.attentionValues = new Map();
    this.stimulationValues = new Map();
    this.importanceNetwork = new Map();
    this.focusedSet = new Set();
    this.attentionalFocus = null;
  }

  async initialize() {
    await fs.ensureDir('.cognitive_registry');
    await fs.ensureDir('docs/mermaid-diagrams');
  }

  /**
   * Load mesh topology and cognitive data
   */
  async loadCognitiveData() {
    const meshTopology = await fs.readJSON('.cognitive_registry/mesh_topology.json');
    const orchestrationMetrics = await fs.readJSON('.cognitive_registry/orchestration_metrics.json');
    
    // Load grammar data for semantic importance
    const registryFiles = await fs.readdir('.cognitive_registry');
    const grammarFiles = registryFiles.filter(f => f.startsWith('grammar_batch_'));
    
    const grammarData = new Map();
    for (const file of grammarFiles) {
      const batchNum = file.match(/grammar_batch_(\d+)\.json/)[1];
      const data = await fs.readJSON(path.join('.cognitive_registry', file));
      grammarData.set(parseInt(batchNum), data);
    }
    
    return { meshTopology, orchestrationMetrics, grammarData };
  }

  /**
   * Initialize ECAN attention values for all cognitive kernels
   */
  initializeAttentionValues(meshTopology, grammarData) {
    const nodes = meshTopology.nodes || {};
    
    Object.entries(nodes).forEach(([nodeId, nodeData]) => {
      // Calculate initial Short-Term Importance (STI)
      const sti = this.calculateInitialSTI(nodeData, grammarData);
      
      // Calculate initial Long-Term Importance (LTI)
      const lti = this.calculateInitialLTI(nodeData, grammarData);
      
      // Calculate Very Long-Term Importance (VLTI)
      const vlti = this.calculateInitialVLTI(nodeData);
      
      this.attentionValues.set(nodeId, {
        sti: sti,
        lti: lti,
        vlti: vlti,
        totalAttention: sti + lti + vlti,
        lastUpdate: Date.now()
      });
      
      // Initialize stimulation value
      this.stimulationValues.set(nodeId, {
        current: 0,
        threshold: this.calculateStimulationThreshold(nodeData),
        history: []
      });
    });
  }

  /**
   * Calculate initial Short-Term Importance based on processing load and recency
   */
  calculateInitialSTI(nodeData, grammarData) {
    let sti = 0;
    
    // Base STI on processing complexity
    sti += Math.log(nodeData.complexity || 1) * 10;
    
    // Add bonus for high connectivity (network effects)
    sti += (nodeData.connections?.size || 0) * 5;
    
    // Add bonus for semantic richness
    const semanticDimensions = nodeData.semanticMapping?.length || 0;
    sti += semanticDimensions * 8;
    
    // Random initial variance for exploration
    sti += Math.random() * 20;
    
    return Math.max(0, sti);
  }

  /**
   * Calculate initial Long-Term Importance based on semantic significance
   */
  calculateInitialLTI(nodeData, grammarData) {
    let lti = 0;
    
    // Find grammar data for this node
    let nodeGrammarData = null;
    for (const [batchNum, batch] of grammarData) {
      if (batch.grammarAdapters && batch.grammarAdapters[nodeData.id]) {
        nodeGrammarData = batch.grammarAdapters[nodeData.id];
        break;
      }
    }
    
    if (nodeGrammarData) {
      // LTI based on agentic capabilities
      lti += nodeGrammarData.agenticCapabilities?.length * 15 || 0;
      
      // LTI based on cognitive roles
      lti += nodeGrammarData.cognitiveRoles?.length * 12 || 0;
      
      // Bonus for advanced reasoning capabilities
      if (nodeGrammarData.agenticCapabilities?.includes('advanced_reasoning')) {
        lti += 50;
      }
      
      // Bonus for cognitive orchestrator role
      if (nodeGrammarData.cognitiveRoles?.includes('cognitive_orchestrator')) {
        lti += 40;
      }
    }
    
    // Base LTI on tensor factorization complexity
    const factorization = nodeData.factorization || [];
    lti += factorization.length * 5;
    
    return Math.max(0, lti);
  }

  /**
   * Calculate initial Very Long-Term Importance based on structural properties
   */
  calculateInitialVLTI(nodeData) {
    let vlti = 0;
    
    // VLTI based on tensor shape dimensionality
    const tensorShape = nodeData.tensorShape || [];
    vlti += tensorShape.length * 3;
    
    // VLTI based on memory footprint (larger = more important for long-term)
    vlti += Math.log(nodeData.memoryFootprint || 1);
    
    // Bonus for prime factorizations (mathematical significance)
    const factorization = nodeData.factorization || [];
    const primeFactors = factorization.filter(f => this.isPrime(f));
    vlti += primeFactors.length * 8;
    
    return Math.max(0, vlti);
  }

  /**
   * Check if a number is prime
   */
  isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) return false;
    }
    return true;
  }

  /**
   * Calculate stimulation threshold for spreading activation
   */
  calculateStimulationThreshold(nodeData) {
    const baseThreshold = 10;
    const complexityFactor = Math.log(nodeData.complexity || 1);
    return baseThreshold + complexityFactor;
  }

  /**
   * Update attention values based on usage and stimulation
   */
  updateAttentionValues(meshTopology, stimulationEvents = []) {
    const currentTime = Date.now();
    const decayRate = 0.95; // STI decay rate
    const reinforcementRate = 1.1; // LTI reinforcement rate
    
    // Decay STI for all nodes
    this.attentionValues.forEach((attention, nodeId) => {
      const timeDelta = (currentTime - attention.lastUpdate) / 1000; // seconds
      attention.sti *= Math.pow(decayRate, timeDelta);
      attention.lastUpdate = currentTime;
    });
    
    // Process stimulation events
    stimulationEvents.forEach(event => {
      const nodeId = event.nodeId;
      const attention = this.attentionValues.get(nodeId);
      const stimulation = this.stimulationValues.get(nodeId);
      
      if (attention && stimulation) {
        // Increase STI based on stimulation
        attention.sti += event.strength * 10;
        
        // Increase LTI if STI threshold is exceeded
        if (attention.sti > stimulation.threshold) {
          attention.lti *= reinforcementRate;
        }
        
        // Update stimulation history
        stimulation.current = event.strength;
        stimulation.history.push({
          timestamp: currentTime,
          strength: event.strength,
          source: event.source
        });
        
        // Keep only recent history
        if (stimulation.history.length > 100) {
          stimulation.history = stimulation.history.slice(-50);
        }
      }
    });
    
    // Update total attention values
    this.attentionValues.forEach(attention => {
      attention.totalAttention = attention.sti + attention.lti + attention.vlti;
    });
  }

  /**
   * Spread activation through the importance network
   */
  spreadActivation(meshTopology, sourceNode, activationStrength = 1.0) {
    const spreadingQueue = [{ nodeId: sourceNode, strength: activationStrength, hops: 0 }];
    const maxHops = 3;
    const spreadDecay = 0.7;
    
    const spreadingEvents = [];
    
    while (spreadingQueue.length > 0) {
      const { nodeId, strength, hops } = spreadingQueue.shift();
      
      if (hops >= maxHops || strength < 0.1) continue;
      
      const nodeData = meshTopology.nodes[nodeId];
      if (!nodeData) continue;
      
      // Spread to connected nodes
      const connections = nodeData.connections || new Set();
      connections.forEach(connectedNodeId => {
        const edge = meshTopology.edges[`${nodeId}-${connectedNodeId}`] || 
                    meshTopology.edges[`${connectedNodeId}-${nodeId}`];
        
        if (edge) {
          const connectionWeight = edge.weight || 0.5;
          const newStrength = strength * connectionWeight * spreadDecay;
          
          spreadingQueue.push({
            nodeId: connectedNodeId,
            strength: newStrength,
            hops: hops + 1
          });
          
          spreadingEvents.push({
            nodeId: connectedNodeId,
            strength: newStrength,
            source: nodeId
          });
        }
      });
    }
    
    return spreadingEvents;
  }

  /**
   * Select nodes for the attentional focus
   */
  selectAttentionalFocus(focusSize = 10) {
    // Sort nodes by total attention value
    const sortedNodes = Array.from(this.attentionValues.entries())
      .sort((a, b) => b[1].totalAttention - a[1].totalAttention);
    
    // Select top nodes for focus
    const focusedNodes = sortedNodes.slice(0, focusSize).map(([nodeId, attention]) => ({
      nodeId,
      attention: attention.totalAttention,
      sti: attention.sti,
      lti: attention.lti,
      vlti: attention.vlti
    }));
    
    this.focusedSet = new Set(focusedNodes.map(node => node.nodeId));
    this.attentionalFocus = focusedNodes;
    
    return focusedNodes;
  }

  /**
   * Allocate computational resources based on attention
   */
  allocateResources(totalResources = 1000) {
    const allocation = new Map();
    const totalAttention = Array.from(this.attentionValues.values())
      .reduce((sum, attention) => sum + attention.totalAttention, 0);
    
    if (totalAttention === 0) {
      // Equal allocation if no attention values
      const equalShare = totalResources / this.attentionValues.size;
      this.attentionValues.forEach((_, nodeId) => {
        allocation.set(nodeId, equalShare);
      });
    } else {
      this.attentionValues.forEach((attention, nodeId) => {
        const proportion = attention.totalAttention / totalAttention;
        allocation.set(nodeId, proportion * totalResources);
      });
    }
    
    return allocation;
  }

  /**
   * Generate attention allocation metrics
   */
  generateAttentionMetrics() {
    const attentionArray = Array.from(this.attentionValues.values());
    const stiValues = attentionArray.map(a => a.sti);
    const ltiValues = attentionArray.map(a => a.lti);
    const totalValues = attentionArray.map(a => a.totalAttention);
    
    const metrics = {
      attention_distribution: {
        total_nodes: this.attentionValues.size,
        focused_nodes: this.focusedSet.size,
        mean_sti: this.calculateMean(stiValues),
        std_sti: this.calculateStandardDeviation(stiValues),
        mean_lti: this.calculateMean(ltiValues),
        std_lti: this.calculateStandardDeviation(ltiValues),
        mean_total_attention: this.calculateMean(totalValues),
        attention_entropy: this.calculateAttentionEntropy(totalValues)
      },
      focus_metrics: {
        focus_concentration: this.calculateFocusConcentration(),
        focus_stability: this.calculateFocusStability(),
        attention_span: this.focusedSet.size
      },
      stimulation_metrics: {
        active_stimulations: Array.from(this.stimulationValues.values())
          .filter(s => s.current > 0).length,
        average_stimulation: this.calculateAverageStimulation(),
        stimulation_variance: this.calculateStimulationVariance()
      }
    };
    
    return metrics;
  }

  /**
   * Calculate mean of array
   */
  calculateMean(values) {
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
  }

  /**
   * Calculate standard deviation
   */
  calculateStandardDeviation(values) {
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate attention entropy
   */
  calculateAttentionEntropy(totalValues) {
    const total = totalValues.reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    const probabilities = totalValues.map(val => val / total);
    return -probabilities.reduce((entropy, p) => {
      return p > 0 ? entropy + p * Math.log2(p) : entropy;
    }, 0);
  }

  /**
   * Calculate focus concentration
   */
  calculateFocusConcentration() {
    if (!this.attentionalFocus || this.attentionalFocus.length === 0) return 0;
    
    const focusAttention = this.attentionalFocus.reduce((sum, node) => sum + node.attention, 0);
    const totalAttention = Array.from(this.attentionValues.values())
      .reduce((sum, attention) => sum + attention.totalAttention, 0);
    
    return totalAttention > 0 ? focusAttention / totalAttention : 0;
  }

  /**
   * Calculate focus stability (placeholder - would need historical data)
   */
  calculateFocusStability() {
    // Simplified stability measure based on STI variance in focus
    if (!this.attentionalFocus || this.attentionalFocus.length === 0) return 0;
    
    const stiValues = this.attentionalFocus.map(node => node.sti);
    const mean = this.calculateMean(stiValues);
    const variance = stiValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stiValues.length;
    
    return 1 / (1 + variance); // Lower variance = higher stability
  }

  /**
   * Calculate average stimulation
   */
  calculateAverageStimulation() {
    const stimulations = Array.from(this.stimulationValues.values()).map(s => s.current);
    return this.calculateMean(stimulations);
  }

  /**
   * Calculate stimulation variance
   */
  calculateStimulationVariance() {
    const stimulations = Array.from(this.stimulationValues.values()).map(s => s.current);
    const mean = this.calculateMean(stimulations);
    return stimulations.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stimulations.length;
  }

  /**
   * Generate Mermaid diagram for attention network
   */
  generateAttentionDiagram() {
    let diagram = 'graph TB\n';
    
    // Add focused nodes with special styling
    this.attentionalFocus?.forEach(node => {
      const nodeId = node.nodeId.replace(/\W/g, '_');
      const attention = node.attention.toFixed(1);
      diagram += `    ${nodeId}[${node.nodeId.substring(0, 7)}\\nATT: ${attention}]\n`;
      diagram += `    class ${nodeId} focused\n`;
    });
    
    // Add attention flow arrows for top connections
    if (this.attentionalFocus && this.attentionalFocus.length > 1) {
      for (let i = 0; i < Math.min(this.attentionalFocus.length - 1, 10); i++) {
        const source = this.attentionalFocus[i].nodeId.replace(/\W/g, '_');
        const target = this.attentionalFocus[i + 1].nodeId.replace(/\W/g, '_');
        diagram += `    ${source} -->|attention| ${target}\n`;
      }
    }
    
    // Add styling
    diagram += `    classDef focused fill:#ffeb3b,stroke:#f57f17,stroke-width:3px\n`;
    diagram += `    classDef default fill:#e3f2fd,stroke:#1976d2,stroke-width:1px\n`;
    
    return diagram;
  }

  /**
   * Main attention deployment function
   */
  async deployAttention(optimization = true) {
    const spinner = ora('Deploying ECAN attention allocation mechanisms...').start();
    
    try {
      // Load cognitive data
      const { meshTopology, orchestrationMetrics, grammarData } = await this.loadCognitiveData();
      
      // Initialize attention values
      this.initializeAttentionValues(meshTopology, grammarData);
      
      // Simulate some initial stimulation events
      const initialStimulations = this.generateInitialStimulations(meshTopology, 10);
      this.updateAttentionValues(meshTopology, initialStimulations);
      
      // Spread activation from high-importance nodes
      const topNodes = Array.from(this.attentionValues.entries())
        .sort((a, b) => b[1].totalAttention - a[1].totalAttention)
        .slice(0, 3);
        
      topNodes.forEach(([nodeId, attention]) => {
        const spreadingEvents = this.spreadActivation(meshTopology, nodeId, 1.0);
        this.updateAttentionValues(meshTopology, spreadingEvents);
      });
      
      // Select attentional focus
      const focusedNodes = this.selectAttentionalFocus(15);
      
      // Allocate resources
      const resourceAllocation = this.allocateResources(1000);
      
      // Generate metrics
      const attentionMetrics = this.generateAttentionMetrics();
      
      // Generate visualization
      const attentionDiagram = this.generateAttentionDiagram();
      
      // Save results
      const results = {
        attention_values: Object.fromEntries(this.attentionValues),
        stimulation_values: Object.fromEntries(this.stimulationValues),
        focused_nodes: focusedNodes,
        resource_allocation: Object.fromEntries(resourceAllocation),
        metrics: attentionMetrics,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJSON('.cognitive_registry/attention_allocation.json', results, { spaces: 2 });
      await fs.writeFile('docs/mermaid-diagrams/attention-network.mmd', attentionDiagram);
      
      spinner.succeed('ECAN attention allocation deployed');
      
      console.log(chalk.green('\n🧠 Attention Allocation Summary:'));
      console.log(`   • Total nodes under attention management: ${attentionMetrics.attention_distribution.total_nodes}`);
      console.log(`   • Nodes in attentional focus: ${attentionMetrics.attention_distribution.focused_nodes}`);
      console.log(`   • Focus concentration: ${attentionMetrics.focus_metrics.focus_concentration.toFixed(3)}`);
      console.log(`   • Attention entropy: ${attentionMetrics.attention_distribution.attention_entropy.toFixed(3)}`);
      console.log(`   • Active stimulations: ${attentionMetrics.stimulation_metrics.active_stimulations}`);
      
      return results;
      
    } catch (error) {
      spinner.fail(`Attention deployment failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate initial stimulation events for testing
   */
  generateInitialStimulations(meshTopology, count = 10) {
    const nodeIds = Object.keys(meshTopology.nodes || {});
    const stimulations = [];
    
    for (let i = 0; i < Math.min(count, nodeIds.length); i++) {
      const randomNode = nodeIds[Math.floor(Math.random() * nodeIds.length)];
      stimulations.push({
        nodeId: randomNode,
        strength: Math.random() * 2 + 0.5, // 0.5 to 2.5
        source: 'initial_activation'
      });
    }
    
    return stimulations;
  }
}

// CLI Interface
const program = new Command();

program
  .name('deploy-ecan-attention')
  .description('Deploy ECAN-inspired attention allocation mechanisms')
  .option('-o, --optimization <boolean>', 'enable optimization', 'true')
  .action(async (options) => {
    const allocator = new ECANAttentionAllocator();
    await allocator.initialize();
    
    const optimization = options.optimization === 'true';
    await allocator.deployAttention(optimization);
  });

if (require.main === module) {
  program.parse();
}

module.exports = ECANAttentionAllocator;