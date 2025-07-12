#!/usr/bin/env node
/**
 * Architecture Documentation Generator
 * Generates comprehensive documentation with Mermaid diagrams
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class ArchitectureDocumentationGenerator {
  constructor() {
    this.cognitiveData = new Map();
    this.documentationSections = new Map();
  }

  async initialize() {
    await fs.ensureDir('docs');
    await fs.ensureDir('docs/mermaid-diagrams');
    await fs.ensureDir('.cognitive_registry');
  }

  /**
   * Load all cognitive data for documentation
   */
  async loadCognitiveData() {
    const data = {};
    
    try {
      data.meshTopology = await fs.readJSON('.cognitive_registry/mesh_topology.json');
    } catch (error) {
      data.meshTopology = { nodes: {}, edges: {}, clusters: {} };
    }
    
    try {
      data.attentionAllocation = await fs.readJSON('.cognitive_registry/attention_allocation.json');
    } catch (error) {
      data.attentionAllocation = { focused_nodes: [], attention_values: {} };
    }
    
    try {
      data.orchestrationMetrics = await fs.readJSON('.cognitive_registry/orchestration_metrics.json');
    } catch (error) {
      data.orchestrationMetrics = { topology: {}, performance: {}, cognitive: {} };
    }
    
    // Load grammar data
    const registryFiles = await fs.readdir('.cognitive_registry');
    const grammarFiles = registryFiles.filter(f => f.startsWith('grammar_batch_'));
    
    const grammarData = new Map();
    for (const file of grammarFiles) {
      try {
        const batchNum = file.match(/grammar_batch_(\\d+)\\.json/)[1];
        const batchData = await fs.readJSON(path.join('.cognitive_registry', file));
        grammarData.set(parseInt(batchNum), batchData);
      } catch (error) {
        console.warn(`Warning: Could not load ${file}`);
      }
    }
    data.grammarData = grammarData;
    
    return data;
  }

  /**
   * Generate main architecture diagram
   */
  generateMainArchitectureDiagram() {
    return `graph TB
    subgraph "OEIS Data Layer"
        A[OEIS Sequences] --> B[Sequence Parser]
        B --> C[Cognitive Analysis]
    end
    
    subgraph "GGML Tensor Layer"
        C --> D[Tensor Shape Registry]
        D --> E[GGML Tensorization]
        E --> F[Tensor Optimization]
    end
    
    subgraph "Agentic Grammar Layer"
        F --> G[Grammar Adapters]
        G --> H[Capability Mapping]
        H --> I[Behavioral Patterns]
    end
    
    subgraph "Cognitive Mesh Layer"
        I --> J[Mesh Orchestration]
        J --> K[Load Balancing]
        K --> L[Cluster Management]
    end
    
    subgraph "Attention System"
        L --> M[ECAN Attention]
        M --> N[Focus Selection]
        N --> O[Resource Allocation]
    end
    
    subgraph "Integration Layer"
        O --> P[Agent Zero Bridge]
        O --> Q[Bolt.diy Bridge]
        O --> R[OpenCog AtomSpace]
    end
    
    subgraph "Hypergraph Layer"
        R --> S[Hypergraph Encoding]
        S --> T[Embedding Generation]
        T --> U[Similarity Computation]
    end
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style J fill:#e8f5e8
    style M fill:#fff3e0
    style R fill:#fce4ec`;
  }

  /**
   * Generate attention flow diagram
   */
  generateAttentionFlowDiagram(attentionData) {
    let diagram = `graph TD
    subgraph "Attention Allocation Process"
        A1[Input Stimulation] --> A2[STI Calculation]
        A2 --> A3[LTI Update]
        A3 --> A4[VLTI Maintenance]
        A4 --> A5[Total Attention]
    end
    
    subgraph "Spreading Activation"
        A5 --> B1[Source Selection]
        B1 --> B2[Neighbor Discovery]
        B2 --> B3[Weight Calculation]
        B3 --> B4[Activation Spread]
    end
    
    subgraph "Focus Management"
        B4 --> C1[Attention Ranking]
        C1 --> C2[Focus Selection]
        C2 --> C3[Resource Allocation]
        C3 --> C4[Performance Monitoring]
    end
    
    style A1 fill:#ffebee
    style A5 fill:#e8f5e8
    style C2 fill:#fff3e0
    style C4 fill:#f3e5f5`;

    // Add focused nodes if available
    if (attentionData.focused_nodes && attentionData.focused_nodes.length > 0) {
      diagram += `\\n\\n    subgraph "Current Focus"\\n`;
      attentionData.focused_nodes.slice(0, 5).forEach((node, index) => {
        const nodeId = node.nodeId.replace(/\\W/g, '_');
        diagram += `        F${index}[${node.nodeId.substring(0, 10)}]\\n`;
      });
      diagram += `    end`;
    }

    return diagram;
  }

  /**
   * Generate tensor processing pipeline diagram
   */
  generateTensorPipelineDiagram() {
    return `graph LR
    subgraph "Data Ingestion"
        I1[OEIS Files] --> I2[Parser]
        I2 --> I3[Validation]
    end
    
    subgraph "Analysis Phase"
        I3 --> A1[Complexity Analysis]
        A1 --> A2[Semantic Extraction]
        A2 --> A3[Dimension Mapping]
    end
    
    subgraph "Tensorization"
        A3 --> T1[Shape Calculation]
        T1 --> T2[Data Normalization]
        T2 --> T3[GGML Formatting]
    end
    
    subgraph "Optimization"
        T3 --> O1[Memory Alignment]
        O1 --> O2[Quantization]
        O2 --> O3[Cache Storage]
    end
    
    subgraph "Integration"
        O3 --> R1[Grammar Mapping]
        R1 --> R2[Mesh Registration]
        R2 --> R3[Attention Assignment]
    end
    
    style I1 fill:#e3f2fd
    style T1 fill:#f1f8e9
    style O1 fill:#fff8e1
    style R1 fill:#fce4ec`;
  }

  /**
   * Generate cognitive mesh topology diagram
   */
  generateMeshTopologyDiagram(meshData) {
    let diagram = `graph TB
    subgraph "Cognitive Mesh Architecture"`;

    // Add cluster information if available
    const clusters = meshData.clusters || {};
    const clusterEntries = Object.entries(clusters).slice(0, 3); // Show first 3 clusters

    clusterEntries.forEach(([clusterId, clusterData], index) => {
      diagram += `\\n        subgraph "Cluster ${index + 1}"`;
      const nodes = clusterData.nodes?.slice(0, 3) || []; // Show first 3 nodes per cluster
      nodes.forEach((nodeId, nodeIndex) => {
        const safeNodeId = nodeId.replace(/\\W/g, '_');
        diagram += `\\n            ${safeNodeId}[${nodeId.substring(0, 8)}]`;
      });
      diagram += `\\n        end`;
    });

    diagram += `\\n    end
    
    subgraph "Load Balancing"
        LB1[Load Monitor] --> LB2[Resource Allocation]
        LB2 --> LB3[Performance Optimization]
    end
    
    subgraph "Communication Layer"
        C1[Message Routing] --> C2[Protocol Handling]
        C2 --> C3[Error Recovery]
    end
    
    style LB1 fill:#e8f5e8
    style C1 fill:#fff3e0`;

    return diagram;
  }

  /**
   * Generate integration architecture diagram
   */
  generateIntegrationDiagram() {
    return `graph TB
    subgraph "GGML Core"
        G1[Tensor Operations]
        G2[Memory Management]
        G3[Compute Kernels]
    end
    
    subgraph "Agent Zero Integration"
        A1[Agent Definitions]
        A2[Behavior Scripts]
        A3[Runtime Connectors]
        A4[Communication Protocols]
    end
    
    subgraph "Bolt.diy Integration"
        B1[Development Server]
        B2[Live Reload]
        B3[IDE Extensions]
        B4[CLI Tools]
    end
    
    subgraph "OpenCog Integration"
        O1[AtomSpace Sync]
        O2[Scheme Generation]
        O3[Reasoning Queries]
        O4[Hypergraph Embedding]
    end
    
    G1 --> A1
    G2 --> A2
    G3 --> A3
    
    G1 --> B1
    G2 --> B2
    
    A1 --> O1
    A2 --> O2
    A3 --> O3
    A4 --> O4
    
    style G1 fill:#e3f2fd
    style A1 fill:#e8f5e8
    style B1 fill:#fff3e0
    style O1 fill:#fce4ec`;
  }

  /**
   * Generate performance metrics documentation
   */
  generatePerformanceMetrics(metricsData) {
    const topology = metricsData.topology || {};
    const performance = metricsData.performance || {};
    const cognitive = metricsData.cognitive || {};

    return `## Performance Metrics

### Topology Metrics
- **Total Nodes**: ${topology.totalNodes || 0}
- **Total Edges**: ${topology.totalEdges || 0}
- **Total Clusters**: ${topology.totalClusters || 0}
- **Average Connectivity**: ${(topology.averageConnectivity || 0).toFixed(3)}
- **Clustering Coefficient**: ${(topology.clusteringCoefficient || 0).toFixed(3)}

### Performance Metrics
- **Total Processing Load**: ${(performance.totalProcessingLoad || 0).toFixed(2)}
- **Total Memory Footprint**: ${((performance.totalMemoryFootprint || 0) / (1024 * 1024)).toFixed(2)} MB
- **Load Balance Score**: ${(performance.loadBalanceScore || 0).toFixed(3)}
- **Redundancy Score**: ${(performance.redundancyScore || 0).toFixed(3)}

### Cognitive Metrics
- **Total Grammar Adapters**: ${cognitive.totalGrammarAdapters || 0}
- **Total Cognitive Rules**: ${cognitive.totalCognitiveRules || 0}
- **Average Complexity**: ${(cognitive.averageComplexity || 0).toFixed(2)}
- **Semantic Diversity**: ${cognitive.semanticDiversity || 0}`;
  }

  /**
   * Generate implementation roadmap
   */
  generateImplementationRoadmap() {
    return `## Implementation Roadmap

### Phase 1: Core Infrastructure ✅
- [x] OEIS sequence analysis pipeline
- [x] GGML tensor conversion system
- [x] Basic cognitive mesh orchestration
- [x] Attention allocation framework

### Phase 2: Integration Layer ✅
- [x] Agent Zero runtime integration
- [x] Bolt.diy development bridges
- [x] OpenCog AtomSpace synchronization
- [x] Hypergraph embedding generation

### Phase 3: Optimization & Enhancement
- [ ] Performance profiling and optimization
- [ ] Advanced attention mechanisms
- [ ] Multi-modal sequence support
- [ ] Federated learning capabilities

### Phase 4: Advanced Features
- [ ] Quantum computing integration
- [ ] Neuromorphic hardware support
- [ ] Real-time adaptation mechanisms
- [ ] Cross-domain knowledge transfer

### Phase 5: Production Deployment
- [ ] Scalability testing
- [ ] Security hardening
- [ ] Monitoring and alerting
- [ ] Documentation and training`;
  }

  /**
   * Generate API documentation
   */
  generateAPIDocumentation() {
    return `## API Reference

### Core Analysis API

#### \`POST /api/cognitive/analyze\`
Analyze OEIS sequences for cognitive patterns.

**Request Body:**
\`\`\`json
{
  "sequences": ["A000001", "A000002"],
  "batch_size": 100,
  "complexity_threshold": 5
}
\`\`\`

**Response:**
\`\`\`json
{
  "total_processed": 2,
  "tensor_shapes": {...},
  "cognitive_patterns": {...}
}
\`\`\`

#### \`POST /api/cognitive/tensorize\`
Convert sequences to GGML tensors.

**Request Body:**
\`\`\`json
{
  "sequence_ids": ["A000001"],
  "optimization": true,
  "target_device": "cpu"
}
\`\`\`

### Attention Management API

#### \`GET /api/attention/current\`
Get current attention allocation state.

#### \`POST /api/attention/stimulate\`
Send stimulation events to cognitive kernels.

### Mesh Orchestration API

#### \`GET /api/mesh/topology\`
Get current mesh topology and health status.

#### \`POST /api/mesh/rebalance\`
Trigger load rebalancing across the mesh.`;
  }

  /**
   * Main documentation generation function
   */
  async generateDocumentation(depth = 3) {
    const spinner = ora('Generating architecture documentation...').start();
    
    try {
      // Load cognitive data
      const cognitiveData = await this.loadCognitiveData();
      
      // Generate Mermaid diagrams
      const mainArchDiagram = this.generateMainArchitectureDiagram();
      const attentionDiagram = this.generateAttentionFlowDiagram(cognitiveData.attentionAllocation);
      const tensorPipelineDiagram = this.generateTensorPipelineDiagram();
      const meshTopologyDiagram = this.generateMeshTopologyDiagram(cognitiveData.meshTopology);
      const integrationDiagram = this.generateIntegrationDiagram();
      
      // Save Mermaid diagrams
      await fs.writeFile('docs/mermaid-diagrams/main-architecture.mmd', mainArchDiagram);
      await fs.writeFile('docs/mermaid-diagrams/attention-flow.mmd', attentionDiagram);
      await fs.writeFile('docs/mermaid-diagrams/tensor-pipeline.mmd', tensorPipelineDiagram);
      await fs.writeFile('docs/mermaid-diagrams/mesh-topology.mmd', meshTopologyDiagram);
      await fs.writeFile('docs/mermaid-diagrams/integration-architecture.mmd', integrationDiagram);
      
      // Generate comprehensive documentation
      const performanceMetrics = this.generatePerformanceMetrics(cognitiveData.orchestrationMetrics);
      const implementationRoadmap = this.generateImplementationRoadmap();
      const apiDocumentation = this.generateAPIDocumentation();
      
      // Create comprehensive documentation
      const comprehensiveDoc = `# GGML Cognitive Integration - Complete Architecture

## Overview

This document provides a comprehensive overview of the GGML-based agentic cognitive grammar integration for the OEIS mathematical sequence dataset.

## Main Architecture

\`\`\`mermaid
${mainArchDiagram}
\`\`\`

## Attention Flow System

\`\`\`mermaid
${attentionDiagram}
\`\`\`

## Tensor Processing Pipeline

\`\`\`mermaid
${tensorPipelineDiagram}
\`\`\`

## Cognitive Mesh Topology

\`\`\`mermaid
${meshTopologyDiagram}
\`\`\`

## Integration Architecture

\`\`\`mermaid
${integrationDiagram}
\`\`\`

${performanceMetrics}

${implementationRoadmap}

${apiDocumentation}

## Technical Specifications

### Tensor Format
- **Data Type**: Float32
- **Memory Layout**: Row-major
- **Optimization**: GGML-compatible alignment
- **Quantization**: Optional 8-bit/16-bit support

### Attention System
- **Algorithm**: ECAN-inspired (OpenCog)
- **Components**: STI, LTI, VLTI
- **Spreading**: Weighted activation propagation
- **Focus**: Top-K attention selection

### Mesh Configuration
- **Topology**: Dynamic graph-based
- **Load Balancing**: Attention-weighted
- **Redundancy**: Multi-level clustering
- **Communication**: Message-passing protocols

### Integration Standards
- **Agent Zero**: JSON-based agent definitions
- **Bolt.diy**: WebSocket + REST API
- **OpenCog**: Scheme code generation
- **GGML**: Native tensor operations

## Generated: ${new Date().toISOString()}
`;

      // Save comprehensive documentation
      await fs.writeFile('docs/complete-architecture.md', comprehensiveDoc);
      
      // Generate summary report
      const summaryReport = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        documentation_depth: depth,
        generated_files: [
          'docs/complete-architecture.md',
          'docs/mermaid-diagrams/main-architecture.mmd',
          'docs/mermaid-diagrams/attention-flow.mmd',
          'docs/mermaid-diagrams/tensor-pipeline.mmd',
          'docs/mermaid-diagrams/mesh-topology.mmd',
          'docs/mermaid-diagrams/integration-architecture.mmd'
        ],
        statistics: {
          total_diagrams: 5,
          total_sections: 8,
          cognitive_nodes: Object.keys(cognitiveData.meshTopology.nodes || {}).length,
          attention_focused: cognitiveData.attentionAllocation.focused_nodes?.length || 0
        }
      };
      
      await fs.writeJSON('docs/documentation-manifest.json', summaryReport, { spaces: 2 });
      
      spinner.succeed('Architecture documentation generated successfully');
      
      console.log(chalk.green('\\n📚 Documentation Generation Summary:'));
      console.log(`   • Main documentation: docs/complete-architecture.md`);
      console.log(`   • Mermaid diagrams: ${summaryReport.statistics.total_diagrams} files`);
      console.log(`   • Architecture sections: ${summaryReport.statistics.total_sections}`);
      console.log(`   • Cognitive nodes documented: ${summaryReport.statistics.cognitive_nodes}`);
      
      return summaryReport;
      
    } catch (error) {
      spinner.fail(`Documentation generation failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI Interface
const program = new Command();

program
  .name('generate-architecture-docs')
  .description('Generate comprehensive architecture documentation with Mermaid diagrams')
  .option('-d, --depth <level>', 'documentation depth level', '3')
  .action(async (options) => {
    const generator = new ArchitectureDocumentationGenerator();
    await generator.initialize();
    
    const depth = parseInt(options.depth);
    await generator.generateDocumentation(depth);
  });

if (require.main === module) {
  program.parse();
}

module.exports = ArchitectureDocumentationGenerator;