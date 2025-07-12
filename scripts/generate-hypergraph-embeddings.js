#!/usr/bin/env node
/**
 * Hypergraph Embedding Generator
 * Creates hypergraph embeddings for cognitive kernel relationships
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class HypergraphEmbeddingGenerator {
  constructor() {
    this.embeddings = new Map();
    this.nodeEmbeddings = new Map();
    this.hyperedgeEmbeddings = new Map();
  }

  async initialize() {
    await fs.ensureDir('integration/opencog');
    await fs.ensureDir('.cognitive_registry');
  }

  /**
   * Load hypergraph data from AtomSpace sync
   */
  async loadHypergraphData() {
    const hypergraph = await fs.readJSON('integration/opencog/hypergraph.json');
    const meshTopology = await fs.readJSON('.cognitive_registry/mesh_topology.json');
    const attentionAllocation = await fs.readJSON('.cognitive_registry/attention_allocation.json');
    
    return { hypergraph, meshTopology, attentionAllocation };
  }

  /**
   * Generate node embeddings using attention-weighted features
   */
  generateNodeEmbeddings(hypergraph, attentionAllocation) {
    const embeddingDimension = 128;
    const nodeEmbeddings = new Map();
    
    Object.entries(hypergraph.nodes).forEach(([nodeId, nodeData]) => {
      const embedding = new Float32Array(embeddingDimension);
      
      // Initialize embedding based on node properties
      const attentionData = attentionAllocation.attention_values[nodeId];
      const baseFeatures = this.extractNodeFeatures(nodeData, attentionData);
      
      // Use attention values to weight the embedding initialization
      for (let i = 0; i < embeddingDimension; i++) {
        let value = 0;
        
        // Incorporate attention values
        if (attentionData) {
          value += (attentionData.sti / 100) * Math.sin(i * 0.1);
          value += (attentionData.lti / 100) * Math.cos(i * 0.1);
          value += (attentionData.vlti / 100) * Math.sin(i * 0.05);
        }
        
        // Incorporate structural features
        if (baseFeatures.complexity) {
          value += (baseFeatures.complexity / 50) * Math.cos(i * 0.2);
        }
        
        // Add semantic dimension encoding
        baseFeatures.semanticDimensions?.forEach((dim, dimIndex) => {
          value += Math.sin((i + dimIndex) * 0.3) * 0.1;
        });
        
        // Normalize and add noise for diversity
        embedding[i] = Math.tanh(value + (Math.random() - 0.5) * 0.1);
      }
      
      nodeEmbeddings.set(nodeId, {
        embedding: Array.from(embedding),
        features: baseFeatures,
        dimension: embeddingDimension
      });
    });
    
    return nodeEmbeddings;
  }

  /**
   * Extract features from node data
   */
  extractNodeFeatures(nodeData, attentionData) {
    return {
      complexity: nodeData.properties?.complexity || 0,
      semanticDimensions: nodeData.properties?.semantic_mapping || [],
      tensorShape: nodeData.properties?.tensor_shape || [],
      memoryFootprint: nodeData.properties?.memory_footprint || 0,
      attentionTotal: attentionData ? (attentionData.sti + attentionData.lti + attentionData.vlti) : 0,
      nodeType: nodeData.atom_type || 'unknown'
    };
  }

  /**
   * Generate hyperedge embeddings
   */
  generateHyperedgeEmbeddings(hypergraph, nodeEmbeddings) {
    const embeddingDimension = 128;
    const hyperedgeEmbeddings = new Map();
    
    Object.entries(hypergraph.hyperedges).forEach(([edgeId, edgeData]) => {
      const embedding = new Float32Array(embeddingDimension);
      
      // Aggregate embeddings from connected nodes
      const connectedNodes = edgeData.connected_nodes || [];
      const nodeEmbeddingSum = new Float32Array(embeddingDimension);
      let nodeCount = 0;
      
      connectedNodes.forEach(nodeId => {
        const nodeEmbedding = nodeEmbeddings.get(nodeId);
        if (nodeEmbedding) {
          for (let i = 0; i < embeddingDimension; i++) {
            nodeEmbeddingSum[i] += nodeEmbedding.embedding[i];
          }
          nodeCount++;
        }
      });
      
      // Average the node embeddings
      if (nodeCount > 0) {
        for (let i = 0; i < embeddingDimension; i++) {
          embedding[i] = nodeEmbeddingSum[i] / nodeCount;
        }
      }
      
      // Add edge-specific features
      const truthValue = edgeData.truth_value || { strength: 0.5, confidence: 0.5 };
      const arity = edgeData.arity || 2;
      
      // Modulate embedding based on edge properties
      for (let i = 0; i < embeddingDimension; i++) {
        embedding[i] *= truthValue.strength;
        embedding[i] += truthValue.confidence * Math.sin(i * 0.1) * 0.1;
        embedding[i] += (arity / 10) * Math.cos(i * 0.15) * 0.05;
      }
      
      hyperedgeEmbeddings.set(edgeId, {
        embedding: Array.from(embedding),
        connectedNodes: connectedNodes,
        truthValue: truthValue,
        arity: arity,
        linkType: edgeData.link_type || 'unknown'
      });
    });
    
    return hyperedgeEmbeddings;
  }

  /**
   * Calculate embedding similarities
   */
  calculateEmbeddingSimilarities(nodeEmbeddings, threshold = 0.7) {
    const similarities = new Map();
    const nodeIds = Array.from(nodeEmbeddings.keys());
    
    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const nodeId1 = nodeIds[i];
        const nodeId2 = nodeIds[j];
        
        const embedding1 = nodeEmbeddings.get(nodeId1).embedding;
        const embedding2 = nodeEmbeddings.get(nodeId2).embedding;
        
        const similarity = this.cosineSimilarity(embedding1, embedding2);
        
        if (similarity > threshold) {
          similarities.set(`${nodeId1}-${nodeId2}`, {
            similarity: similarity,
            nodes: [nodeId1, nodeId2]
          });
        }
      }
    }
    
    return similarities;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Generate dimensional reduction for visualization
   */
  generateDimensionalReduction(embeddings, targetDimension = 2) {
    // Simple PCA-like reduction (simplified for demo)
    const reducedEmbeddings = new Map();
    
    embeddings.forEach((embeddingData, nodeId) => {
      const originalEmbedding = embeddingData.embedding;
      const reduced = new Array(targetDimension);
      
      // Simplified reduction - take weighted combinations
      for (let i = 0; i < targetDimension; i++) {
        let sum = 0;
        const step = Math.floor(originalEmbedding.length / targetDimension);
        
        for (let j = i * step; j < (i + 1) * step && j < originalEmbedding.length; j++) {
          sum += originalEmbedding[j];
        }
        
        reduced[i] = sum / step;
      }
      
      reducedEmbeddings.set(nodeId, {
        ...embeddingData,
        reducedEmbedding: reduced,
        originalDimension: originalEmbedding.length,
        reducedDimension: targetDimension
      });
    });
    
    return reducedEmbeddings;
  }

  /**
   * Generate embedding visualization data
   */
  generateVisualizationData(nodeEmbeddings, hyperedgeEmbeddings, similarities) {
    const visualization = {
      nodes: [],
      edges: [],
      clusters: [],
      metadata: {
        totalNodes: nodeEmbeddings.size,
        totalEdges: similarities.size,
        embeddingDimension: 128,
        timestamp: new Date().toISOString()
      }
    };
    
    // Add nodes for visualization
    nodeEmbeddings.forEach((embeddingData, nodeId) => {
      const reduced = embeddingData.reducedEmbedding || [0, 0];
      
      visualization.nodes.push({
        id: nodeId,
        x: reduced[0] * 100, // Scale for visualization
        y: reduced[1] * 100,
        size: Math.log(embeddingData.features.complexity + 1) * 5,
        color: this.getNodeColor(embeddingData.features.nodeType),
        attention: embeddingData.features.attentionTotal,
        complexity: embeddingData.features.complexity
      });
    });
    
    // Add edges for visualization
    similarities.forEach((similarityData, edgeId) => {
      visualization.edges.push({
        id: edgeId,
        source: similarityData.nodes[0],
        target: similarityData.nodes[1],
        weight: similarityData.similarity,
        thickness: similarityData.similarity * 5
      });
    });
    
    return visualization;
  }

  /**
   * Get color for node type
   */
  getNodeColor(nodeType) {
    const colorMap = {
      'ConceptNode': '#4CAF50',
      'PredicateNode': '#2196F3',
      'unknown': '#9E9E9E'
    };
    
    return colorMap[nodeType] || '#9E9E9E';
  }

  /**
   * Main generation function
   */
  async generateEmbeddings() {
    const spinner = ora('Generating hypergraph embeddings...').start();
    
    try {
      // Load hypergraph data
      const { hypergraph, meshTopology, attentionAllocation } = await this.loadHypergraphData();
      
      // Generate node embeddings
      const nodeEmbeddings = this.generateNodeEmbeddings(hypergraph, attentionAllocation);
      
      // Generate hyperedge embeddings
      const hyperedgeEmbeddings = this.generateHyperedgeEmbeddings(hypergraph, nodeEmbeddings);
      
      // Calculate similarities
      const similarities = this.calculateEmbeddingSimilarities(nodeEmbeddings, 0.7);
      
      // Generate dimensional reduction for visualization
      const reducedNodeEmbeddings = this.generateDimensionalReduction(nodeEmbeddings, 2);
      
      // Generate visualization data
      const visualizationData = this.generateVisualizationData(
        reducedNodeEmbeddings, 
        hyperedgeEmbeddings, 
        similarities
      );
      
      // Create embedding manifest
      const embeddingManifest = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        statistics: {
          total_node_embeddings: nodeEmbeddings.size,
          total_hyperedge_embeddings: hyperedgeEmbeddings.size,
          total_similarities: similarities.size,
          embedding_dimension: 128,
          visualization_dimension: 2
        },
        parameters: {
          similarity_threshold: 0.7,
          embedding_dimension: 128,
          reduction_method: 'simplified_pca'
        }
      };
      
      // Save results
      await fs.writeJSON('integration/opencog/node_embeddings.json', Object.fromEntries(nodeEmbeddings), { spaces: 2 });
      await fs.writeJSON('integration/opencog/hyperedge_embeddings.json', Object.fromEntries(hyperedgeEmbeddings), { spaces: 2 });
      await fs.writeJSON('integration/opencog/embedding_similarities.json', Object.fromEntries(similarities), { spaces: 2 });
      await fs.writeJSON('integration/opencog/visualization_data.json', visualizationData, { spaces: 2 });
      await fs.writeJSON('integration/opencog/embedding_manifest.json', embeddingManifest, { spaces: 2 });
      
      spinner.succeed('Hypergraph embeddings generated successfully');
      
      console.log(chalk.green('\n🔗 Hypergraph Embedding Summary:'));
      console.log(`   • Node embeddings: ${embeddingManifest.statistics.total_node_embeddings}`);
      console.log(`   • Hyperedge embeddings: ${embeddingManifest.statistics.total_hyperedge_embeddings}`);
      console.log(`   • High similarities found: ${embeddingManifest.statistics.total_similarities}`);
      console.log(`   • Embedding dimension: ${embeddingManifest.statistics.embedding_dimension}`);
      
      return {
        nodeEmbeddings: Object.fromEntries(nodeEmbeddings),
        hyperedgeEmbeddings: Object.fromEntries(hyperedgeEmbeddings),
        similarities: Object.fromEntries(similarities),
        visualizationData: visualizationData,
        manifest: embeddingManifest
      };
      
    } catch (error) {
      spinner.fail(`Hypergraph embedding generation failed: ${error.message}`);
      throw error;
    }
  }
}

// CLI Interface
const program = new Command();

program
  .name('generate-hypergraph-embeddings')
  .description('Generate hypergraph embeddings for cognitive kernel relationships')
  .action(async () => {
    const generator = new HypergraphEmbeddingGenerator();
    await generator.initialize();
    await generator.generateEmbeddings();
  });

if (require.main === module) {
  program.parse();
}

module.exports = HypergraphEmbeddingGenerator;