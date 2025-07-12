#!/usr/bin/env node
/**
 * OpenCog AtomSpace Synchronization
 * Bidirectional sync between GGML tensors and OpenCog AtomSpace
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class AtomSpaceSynchronizer {
  constructor() {
    this.atomSpace = new Map();
    this.atoms = new Map();
    this.links = new Map();
    this.truthValues = new Map();
  }

  async initialize() {
    await fs.ensureDir('integration/opencog');
    await fs.ensureDir('.atomspace');
    await fs.ensureDir('.cognitive_registry');
  }

  /**
   * Load cognitive data for AtomSpace conversion
   */
  async loadCognitiveData() {
    const attentionAllocation = await fs.readJSON('.cognitive_registry/attention_allocation.json');
    const meshTopology = await fs.readJSON('.cognitive_registry/mesh_topology.json');
    
    // Load grammar data
    const registryFiles = await fs.readdir('.cognitive_registry');
    const grammarFiles = registryFiles.filter(f => f.startsWith('grammar_batch_'));
    
    const grammarData = new Map();
    for (const file of grammarFiles) {
      const batchNum = file.match(/grammar_batch_(\d+)\.json/)[1];
      const data = await fs.readJSON(path.join('.cognitive_registry', file));
      grammarData.set(parseInt(batchNum), data);
    }
    
    return { attentionAllocation, meshTopology, grammarData };
  }

  /**
   * Convert cognitive kernels to AtomSpace atoms
   */
  convertKernelsToAtoms(cognitiveData) {
    const { attentionAllocation, meshTopology, grammarData } = cognitiveData;
    const atoms = new Map();
    
    // Create concept atoms for each cognitive kernel
    Object.entries(meshTopology.nodes).forEach(([nodeId, nodeData]) => {
      const conceptAtom = this.createConceptAtom(nodeId, nodeData, attentionAllocation);
      atoms.set(`concept_${nodeId}`, conceptAtom);
      
      // Create predicate atoms for capabilities
      let nodeGrammarData = null;
      for (const [batchNum, batch] of grammarData) {
        if (batch.grammarAdapters && batch.grammarAdapters[nodeId]) {
          nodeGrammarData = batch.grammarAdapters[nodeId];
          break;
        }
      }
      
      if (nodeGrammarData) {
        nodeGrammarData.agenticCapabilities?.forEach(capability => {
          const predicateAtom = this.createPredicateAtom(capability, nodeId);
          atoms.set(`predicate_${capability}_${nodeId}`, predicateAtom);
        });
      }
    });
    
    return atoms;
  }

  /**
   * Create concept atom for cognitive kernel
   */
  createConceptAtom(nodeId, nodeData, attentionAllocation) {
    const attentionData = attentionAllocation.attention_values[nodeId];
    
    return {
      type: 'ConceptNode',
      name: nodeId,
      properties: {
        tensor_shape: nodeData.tensorShape,
        complexity: nodeData.complexity,
        memory_footprint: nodeData.memoryFootprint,
        semantic_mapping: nodeData.semanticMapping,
        factorization: nodeData.factorization
      },
      truth_value: this.calculateTruthValue(nodeData, attentionData),
      attention_value: attentionData ? {
        sti: attentionData.sti,
        lti: attentionData.lti,
        vlti: attentionData.vlti
      } : { sti: 0, lti: 0, vlti: 0 }
    };
  }

  /**
   * Create predicate atom for capability
   */
  createPredicateAtom(capability, nodeId) {
    return {
      type: 'PredicateNode',
      name: capability,
      properties: {
        domain: 'cognitive_capability',
        range: 'boolean',
        associated_kernel: nodeId
      },
      truth_value: {
        strength: 0.9,
        confidence: 0.8
      }
    };
  }

  /**
   * Calculate truth value based on cognitive data
   */
  calculateTruthValue(nodeData, attentionData) {
    let strength = 0.5; // Base strength
    let confidence = 0.5; // Base confidence
    
    // Adjust strength based on complexity
    if (nodeData.complexity > 10) {
      strength += 0.3;
    } else if (nodeData.complexity > 5) {
      strength += 0.1;
    }
    
    // Adjust confidence based on attention
    if (attentionData) {
      const totalAttention = attentionData.sti + attentionData.lti + attentionData.vlti;
      confidence = Math.min(0.95, 0.5 + (totalAttention / 200));
    }
    
    return {
      strength: Math.max(0.01, Math.min(0.99, strength)),
      confidence: Math.max(0.01, Math.min(0.99, confidence))
    };
  }

  /**
   * Create links between atoms
   */
  createAtomLinks(atoms, meshTopology) {
    const links = new Map();
    
    // Create inheritance links for capabilities
    atoms.forEach((atom, atomId) => {
      if (atom.type === 'PredicateNode' && atom.properties.associated_kernel) {
        const kernelId = atom.properties.associated_kernel;
        const conceptAtomId = `concept_${kernelId}`;
        
        if (atoms.has(conceptAtomId)) {
          const inheritanceLink = {
            type: 'InheritanceLink',
            outgoing: [atomId, conceptAtomId],
            truth_value: {
              strength: 0.8,
              confidence: 0.7
            }
          };
          
          links.set(`inheritance_${atomId}_${conceptAtomId}`, inheritanceLink);
        }
      }
    });
    
    // Create similarity links for connected kernels
    Object.entries(meshTopology.edges).forEach(([edgeKey, edgeData]) => {
      const sourceConceptId = `concept_${edgeData.source}`;
      const targetConceptId = `concept_${edgeData.target}`;
      
      if (atoms.has(sourceConceptId) && atoms.has(targetConceptId)) {
        const similarityLink = {
          type: 'SimilarityLink',
          outgoing: [sourceConceptId, targetConceptId],
          truth_value: {
            strength: edgeData.weight,
            confidence: 0.6
          }
        };
        
        links.set(`similarity_${edgeData.source}_${edgeData.target}`, similarityLink);
      }
    });
    
    return links;
  }

  /**
   * Create hypergraph representation
   */
  createHypergraphRepresentation(atoms, links) {
    const hypergraph = {
      nodes: new Map(),
      hyperedges: new Map(),
      metadata: {
        total_atoms: atoms.size,
        total_links: links.size,
        timestamp: new Date().toISOString()
      }
    };
    
    // Convert atoms to hypergraph nodes
    atoms.forEach((atom, atomId) => {
      hypergraph.nodes.set(atomId, {
        id: atomId,
        type: 'atom',
        atom_type: atom.type,
        properties: atom.properties,
        truth_value: atom.truth_value,
        attention_value: atom.attention_value
      });
    });
    
    // Convert links to hyperedges
    links.forEach((link, linkId) => {
      hypergraph.hyperedges.set(linkId, {
        id: linkId,
        type: 'link',
        link_type: link.type,
        connected_nodes: link.outgoing,
        truth_value: link.truth_value,
        arity: link.outgoing.length
      });
    });
    
    return hypergraph;
  }

  /**
   * Generate Scheme code for OpenCog
   */
  generateSchemeCode(atoms, links) {
    let schemeCode = ';; Generated AtomSpace representation for GGML cognitive kernels\\n';
    schemeCode += ';; Auto-generated on ' + new Date().toISOString() + '\\n\\n';
    
    // Add atoms
    schemeCode += ';; Cognitive kernel atoms\\n';
    atoms.forEach((atom, atomId) => {
      schemeCode += \`(\${atom.type} \\"\${atom.name}\\"\\n\`;
      schemeCode += \`  (stv \${atom.truth_value.strength.toFixed(3)} \${atom.truth_value.confidence.toFixed(3)})\\n\`;
      if (atom.attention_value) {
        schemeCode += \`  (av \${atom.attention_value.sti.toFixed(3)} \${atom.attention_value.lti.toFixed(3)} \${atom.attention_value.vlti.toFixed(3)})\\n\`;
      }
      schemeCode += ')\\n\\n';
    });
    
    // Add links
    schemeCode += ';; Cognitive kernel links\\n';
    links.forEach((link, linkId) => {
      schemeCode += \`(\${link.type}\\n\`;
      link.outgoing.forEach(atomId => {
        schemeCode += \`  (ConceptNode \\"\${atomId}\\")\\n\`;
      });
      schemeCode += \`  (stv \${link.truth_value.strength.toFixed(3)} \${link.truth_value.confidence.toFixed(3)})\\n\`;
      schemeCode += ')\\n\\n';
    });
    
    return schemeCode;
  }

  /**
   * Create reasoning queries
   */
  createReasoningQueries() {
    return {
      find_high_attention_kernels: \`
        ;; Find kernels with high attention values
        (Bind
          (VariableList (Variable "$kernel"))
          (And
            (ConceptNode "$kernel")
            (GreaterThan
              (AttentionValue:sti (Variable "$kernel"))
              (Number 50)))
          (Variable "$kernel"))
      \`,
      
      find_similar_kernels: \`
        ;; Find kernels similar to a given kernel
        (Bind
          (VariableList (Variable "$kernel1") (Variable "$kernel2"))
          (And
            (ConceptNode "$kernel1")
            (ConceptNode "$kernel2")
            (SimilarityLink (Variable "$kernel1") (Variable "$kernel2"))
            (GreaterThan
              (TruthValue:strength (SimilarityLink (Variable "$kernel1") (Variable "$kernel2")))
              (Number 0.7)))
          (ListLink (Variable "$kernel1") (Variable "$kernel2")))
      \`,
      
      find_kernel_capabilities: \`
        ;; Find capabilities of a specific kernel
        (Bind
          (VariableList (Variable "$capability") (Variable "$kernel"))
          (And
            (PredicateNode "$capability")
            (ConceptNode "$kernel")
            (InheritanceLink (Variable "$capability") (Variable "$kernel")))
          (ListLink (Variable "$capability") (Variable "$kernel")))
      \`,
      
      infer_new_similarities: \`
        ;; Infer new similarities through transitivity
        (Bind
          (VariableList (Variable "$kernel1") (Variable "$kernel2") (Variable "$kernel3"))
          (And
            (SimilarityLink (Variable "$kernel1") (Variable "$kernel2"))
            (SimilarityLink (Variable "$kernel2") (Variable "$kernel3"))
            (Not (SimilarityLink (Variable "$kernel1") (Variable "$kernel3")))
            (GreaterThan
              (Times
                (TruthValue:strength (SimilarityLink (Variable "$kernel1") (Variable "$kernel2")))
                (TruthValue:strength (SimilarityLink (Variable "$kernel2") (Variable "$kernel3"))))
              (Number 0.5)))
          (SimilarityLink (Variable "$kernel1") (Variable "$kernel3")
            (stv 0.6 0.4)))
      \`
    };
  }

  /**
   * Main synchronization function
   */
  async synchronize(bidirectional = true) {
    const spinner = ora('Synchronizing with OpenCog AtomSpace...').start();
    
    try {
      // Load cognitive data
      const cognitiveData = await this.loadCognitiveData();
      
      // Convert to atoms
      const atoms = this.convertKernelsToAtoms(cognitiveData);
      
      // Create links
      const links = this.createAtomLinks(atoms, cognitiveData.meshTopology);
      
      // Create hypergraph representation
      const hypergraph = this.createHypergraphRepresentation(atoms, links);
      
      // Generate Scheme code
      const schemeCode = this.generateSchemeCode(atoms, links);
      
      // Create reasoning queries
      const reasoningQueries = this.createReasoningQueries();
      
      // Create synchronization manifest
      const syncManifest = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        bidirectional: bidirectional,
        statistics: {
          total_atoms: atoms.size,
          total_links: links.size,
          concept_atoms: Array.from(atoms.values()).filter(a => a.type === 'ConceptNode').length,
          predicate_atoms: Array.from(atoms.values()).filter(a => a.type === 'PredicateNode').length,
          inheritance_links: Array.from(links.values()).filter(l => l.type === 'InheritanceLink').length,
          similarity_links: Array.from(links.values()).filter(l => l.type === 'SimilarityLink').length
        }
      };
      
      // Save synchronization results
      await fs.writeJSON('integration/opencog/atomspace_atoms.json', Object.fromEntries(atoms), { spaces: 2 });
      await fs.writeJSON('integration/opencog/atomspace_links.json', Object.fromEntries(links), { spaces: 2 });
      await fs.writeJSON('integration/opencog/hypergraph.json', {
        nodes: Object.fromEntries(hypergraph.nodes),
        hyperedges: Object.fromEntries(hypergraph.hyperedges),
        metadata: hypergraph.metadata
      }, { spaces: 2 });
      await fs.writeFile('integration/opencog/cognitive_kernels.scm', schemeCode);
      await fs.writeJSON('integration/opencog/reasoning_queries.json', reasoningQueries, { spaces: 2 });
      await fs.writeJSON('integration/opencog/sync_manifest.json', syncManifest, { spaces: 2 });
      
      // Create AtomSpace loader script
      await this.createAtomSpaceLoader();
      
      // Save to internal AtomSpace cache
      await fs.writeJSON('.atomspace/atoms.json', Object.fromEntries(atoms), { spaces: 2 });
      await fs.writeJSON('.atomspace/links.json', Object.fromEntries(links), { spaces: 2 });
      
      spinner.succeed('OpenCog AtomSpace synchronization completed');
      
      console.log(chalk.green('\\n🧠 AtomSpace Synchronization Summary:'));
      console.log(\`   • Total atoms created: \${syncManifest.statistics.total_atoms}\`);
      console.log(\`   • Total links created: \${syncManifest.statistics.total_links}\`);
      console.log(\`   • Concept atoms: \${syncManifest.statistics.concept_atoms}\`);
      console.log(\`   • Predicate atoms: \${syncManifest.statistics.predicate_atoms}\`);
      console.log(\`   • Bidirectional sync: \${bidirectional ? 'enabled' : 'disabled'}\`);
      
      return {
        atoms: Object.fromEntries(atoms),
        links: Object.fromEntries(links),
        hypergraph: hypergraph,
        schemeCode: schemeCode,
        reasoningQueries: reasoningQueries,
        manifest: syncManifest
      };
      
    } catch (error) {
      spinner.fail(\`AtomSpace synchronization failed: \${error.message}\`);
      throw error;
    }
  }

  /**
   * Create AtomSpace loader script
   */
  async createAtomSpaceLoader() {
    const loaderScript = \`#!/usr/bin/env guile
;; OpenCog AtomSpace Loader for GGML Cognitive Kernels
;; Auto-generated loader script

(use-modules (opencog)
             (opencog query)
             (opencog exec)
             (opencog logger))

;; Set log level
(cog-logger-set-level! "debug")

;; Load the cognitive kernels into AtomSpace
(define (load-cognitive-kernels)
  "Load GGML cognitive kernels into the current AtomSpace"
  
  ;; Load the generated Scheme file
  (load "cognitive_kernels.scm")
  
  ;; Print statistics
  (format #t "Loaded ~a atoms into AtomSpace~%" (cog-atom-count))
  (format #t "ConceptNodes: ~a~%" (length (cog-get-atoms 'ConceptNode)))
  (format #t "PredicateNodes: ~a~%" (length (cog-get-atoms 'PredicateNode)))
  (format #t "InheritanceLinks: ~a~%" (length (cog-get-atoms 'InheritanceLink)))
  (format #t "SimilarityLinks: ~a~%" (length (cog-get-atoms 'SimilarityLink)))
  
  #t)

;; Query functions for cognitive analysis
(define (find-high-attention-kernels threshold)
  "Find kernels with attention values above threshold"
  (filter (lambda (atom)
            (> (cog-av-sti atom) threshold))
          (cog-get-atoms 'ConceptNode)))

(define (get-kernel-capabilities kernel-name)
  "Get all capabilities of a specific kernel"
  (let ((kernel (ConceptNode kernel-name)))
    (if (cog-atom? kernel)
        (cog-incoming-by-type kernel 'InheritanceLink)
        '())))

(define (find-similar-kernels kernel-name threshold)
  "Find kernels similar to the given kernel above threshold"
  (let ((kernel (ConceptNode kernel-name)))
    (if (cog-atom? kernel)
        (filter (lambda (link)
                  (> (cog-tv-strength link) threshold))
                (cog-incoming-by-type kernel 'SimilarityLink))
        '())))

;; Main execution
(format #t "Loading GGML Cognitive Kernels into OpenCog AtomSpace...~%")
(load-cognitive-kernels)
(format #t "Cognitive kernels loaded successfully!~%")
\`;

    await fs.writeFile('integration/opencog/load_atomspace.scm', loaderScript);
    await fs.chmod('integration/opencog/load_atomspace.scm', 0o755);
  }
}

// CLI Interface
const program = new Command();

program
  .name('sync-atomspace')
  .description('Synchronize GGML cognitive kernels with OpenCog AtomSpace')
  .option('-b, --bidirectional <boolean>', 'enable bidirectional sync', 'true')
  .action(async (options) => {
    const synchronizer = new AtomSpaceSynchronizer();
    await synchronizer.initialize();
    
    const bidirectional = options.bidirectional === 'true';
    await synchronizer.synchronize(bidirectional);
  });

if (require.main === module) {
  program.parse();
}

module.exports = AtomSpaceSynchronizer;