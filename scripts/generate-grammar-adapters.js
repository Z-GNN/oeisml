#!/usr/bin/env node
/**
 * Agentic Grammar Adapter Generator
 * Creates grammar mappings between OEIS sequences and cognitive agentic primitives
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class AgenticGrammarAdapter {
  constructor() {
    this.grammarMappings = new Map();
    this.agenticPrimitives = new Map();
  }

  async initialize() {
    await fs.ensureDir('.cognitive_registry');
    await this.loadAgenticPrimitives();
  }

  /**
   * Load base agentic primitives (actions, percepts, memory operations)
   */
  async loadAgenticPrimitives() {
    this.agenticPrimitives.set('actions', [
      'sequence_generate',
      'pattern_recognize',
      'value_predict',
      'relationship_discover',
      'structure_analyze',
      'symmetry_detect',
      'convergence_test',
      'recursion_trace'
    ]);

    this.agenticPrimitives.set('percepts', [
      'numerical_input',
      'pattern_signal',
      'convergence_indicator',
      'symmetry_marker',
      'complexity_measure',
      'frequency_spectrum',
      'growth_rate',
      'periodicity_detection'
    ]);

    this.agenticPrimitives.set('memory_ops', [
      'sequence_store',
      'pattern_recall',
      'context_retrieve',
      'association_link',
      'temporal_index',
      'semantic_cluster',
      'priority_rank',
      'frequency_update'
    ]);

    this.agenticPrimitives.set('cognitive_functions', [
      'attention_focus',
      'memory_consolidate',
      'pattern_abstract',
      'analogy_construct',
      'hypothesis_generate',
      'prediction_validate',
      'error_correct',
      'knowledge_integrate'
    ]);
  }

  /**
   * Extract agentic features from sequence metadata
   */
  extractAgenticFeatures(sequenceId, cognitivePattern, tensorShape) {
    const features = {
      sequenceId,
      agenticCapabilities: [],
      grammarTokens: [],
      behavioralPatterns: [],
      cognitiveRoles: []
    };

    // Map complexity to agentic capabilities
    const complexity = cognitivePattern.complexity;
    if (complexity >= 8) {
      features.agenticCapabilities.push('advanced_reasoning', 'pattern_synthesis');
    } else if (complexity >= 5) {
      features.agenticCapabilities.push('pattern_recognition', 'sequence_prediction');
    } else {
      features.agenticCapabilities.push('basic_enumeration', 'simple_patterns');
    }

    // Map semantic dimensions to grammar tokens
    cognitivePattern.dimensions.forEach(dim => {
      const tokens = this.dimensionToGrammarTokens(dim);
      features.grammarTokens.push(...tokens);
    });

    // Determine behavioral patterns from tensor shape
    const shapeComplexity = tensorShape.totalElements;
    if (shapeComplexity > 1000) {
      features.behavioralPatterns.push('complex_dynamics', 'emergent_behavior');
    } else if (shapeComplexity > 100) {
      features.behavioralPatterns.push('structured_behavior', 'predictable_patterns');
    } else {
      features.behavioralPatterns.push('simple_behavior', 'linear_patterns');
    }

    // Assign cognitive roles based on sequence properties
    features.cognitiveRoles = this.assignCognitiveRoles(cognitivePattern, tensorShape);

    return features;
  }

  /**
   * Map semantic dimensions to grammar tokens
   */
  dimensionToGrammarTokens(dimension) {
    const tokenMap = {
      'context': ['CTX', 'FRAME', 'SCOPE'],
      'time': ['TEMP', 'SEQ', 'ORDER'],
      'salience': ['ATTN', 'FOCUS', 'PRIORITY'],
      'primality': ['PRIME', 'FACTOR', 'DIVISOR'],
      'factorization': ['DECOMP', 'FACTOR', 'MULT'],
      'recursion': ['RECUR', 'SELF_REF', 'ITERATE'],
      'golden_ratio': ['PHI', 'GOLDEN', 'RATIO'],
      'algebraic_structure': ['ALG', 'GROUP', 'RING'],
      'symmetry': ['SYM', 'INVARIANT', 'EQUIV'],
      'polynomial_degree': ['POLY', 'DEGREE', 'COEFF'],
      'analytic_properties': ['ANALYTIC', 'SMOOTH', 'DIFF']
    };

    return tokenMap[dimension] || ['GENERIC', 'UNKNOWN'];
  }

  /**
   * Assign cognitive roles for agentic behavior
   */
  assignCognitiveRoles(cognitivePattern, tensorShape) {
    const roles = [];
    
    // Primary role based on complexity
    if (cognitivePattern.complexity >= 10) {
      roles.push('cognitive_orchestrator');
    } else if (cognitivePattern.complexity >= 7) {
      roles.push('pattern_synthesizer');
    } else if (cognitivePattern.complexity >= 4) {
      roles.push('sequence_analyzer');
    } else {
      roles.push('data_processor');
    }

    // Secondary roles based on semantic dimensions
    const dimensions = cognitivePattern.dimensions;
    if (dimensions.includes('primality')) {
      roles.push('number_theorist');
    }
    if (dimensions.includes('recursion')) {
      roles.push('recursive_reasoner');
    }
    if (dimensions.includes('symmetry')) {
      roles.push('symmetry_detector');
    }
    if (dimensions.includes('algebraic_structure')) {
      roles.push('algebraic_analyzer');
    }

    // Specialized roles based on tensor properties
    if (tensorShape.factorization.length > 3) {
      roles.push('complexity_manager');
    }
    
    return roles;
  }

  /**
   * Generate cognitive grammar rules
   */
  generateGrammarRules(agenticFeatures) {
    const rules = {
      sequenceId: agenticFeatures.sequenceId,
      productions: [],
      semanticActions: {},
      pragmaticConstraints: {},
      cognitiveBindings: {}
    };

    // Generate production rules
    agenticFeatures.grammarTokens.forEach(token => {
      const production = this.createProductionRule(token, agenticFeatures);
      rules.productions.push(production);
    });

    // Generate semantic actions for each capability
    agenticFeatures.agenticCapabilities.forEach(capability => {
      rules.semanticActions[capability] = this.createSemanticAction(capability, agenticFeatures);
    });

    // Generate pragmatic constraints
    rules.pragmaticConstraints = this.createPragmaticConstraints(agenticFeatures);

    // Generate cognitive bindings for memory and attention
    rules.cognitiveBindings = this.createCognitiveBindings(agenticFeatures);

    return rules;
  }

  /**
   * Create production rule for grammar token
   */
  createProductionRule(token, features) {
    return {
      token,
      leftHandSide: `${token}_EXPR`,
      rightHandSide: [
        `${token}_TERM`,
        `${token}_OP ${token}_EXPR`,
        `COMPOSE(${token}_TERM, ${token}_EXPR)`
      ],
      semanticType: this.getSemanticType(token),
      agenticRole: features.cognitiveRoles[0] || 'default'
    };
  }

  /**
   * Get semantic type for token
   */
  getSemanticType(token) {
    const typeMap = {
      'CTX': 'context',
      'TEMP': 'temporal',
      'ATTN': 'attentional',
      'PRIME': 'numerical',
      'RECUR': 'recursive',
      'SYM': 'structural',
      'POLY': 'algebraic'
    };
    return typeMap[token] || 'generic';
  }

  /**
   * Create semantic action for capability
   */
  createSemanticAction(capability, features) {
    return {
      name: capability,
      inputTypes: this.getInputTypes(capability),
      outputType: this.getOutputType(capability),
      preconditions: this.getPreconditions(capability, features),
      effects: this.getEffects(capability),
      implementation: `${capability}_kernel`
    };
  }

  /**
   * Get input types for capability
   */
  getInputTypes(capability) {
    const typeMap = {
      'pattern_recognition': ['sequence', 'context'],
      'sequence_prediction': ['sequence', 'pattern'],
      'advanced_reasoning': ['multiple_sequences', 'context', 'constraints'],
      'basic_enumeration': ['parameters'],
      'pattern_synthesis': ['patterns', 'context', 'goals']
    };
    return typeMap[capability] || ['data'];
  }

  /**
   * Get output type for capability
   */
  getOutputType(capability) {
    const typeMap = {
      'pattern_recognition': 'pattern',
      'sequence_prediction': 'prediction',
      'advanced_reasoning': 'inference',
      'basic_enumeration': 'sequence',
      'pattern_synthesis': 'synthesized_pattern'
    };
    return typeMap[capability] || 'result';
  }

  /**
   * Get preconditions for capability
   */
  getPreconditions(capability, features) {
    const conditions = [];
    
    if (features.cognitiveRoles.includes('cognitive_orchestrator')) {
      conditions.push('high_attention_available');
    }
    
    if (capability.includes('advanced')) {
      conditions.push('sufficient_context', 'adequate_memory');
    }
    
    return conditions;
  }

  /**
   * Get effects for capability
   */
  getEffects(capability) {
    return [
      'knowledge_updated',
      'attention_redistributed',
      'memory_strengthened'
    ];
  }

  /**
   * Create pragmatic constraints
   */
  createPragmaticConstraints(features) {
    return {
      attention_limits: {
        max_concurrent_processes: features.cognitiveRoles.length,
        attention_decay_rate: 0.95,
        focus_threshold: 0.1
      },
      memory_constraints: {
        max_active_patterns: 50,
        consolidation_threshold: 0.7,
        forgetting_rate: 0.02
      },
      processing_constraints: {
        max_recursion_depth: 10,
        timeout_threshold: 1000,
        complexity_limit: features.agenticCapabilities.length * 2
      }
    };
  }

  /**
   * Create cognitive bindings
   */
  createCognitiveBindings(features) {
    return {
      memory_bindings: {
        episodic: `episodic_${features.sequenceId}`,
        semantic: features.grammarTokens.map(t => `semantic_${t}`),
        procedural: features.agenticCapabilities.map(c => `procedure_${c}`)
      },
      attention_bindings: {
        focal_attention: features.cognitiveRoles[0],
        peripheral_attention: features.grammarTokens.slice(0, 3),
        inhibited_attention: []
      },
      motor_bindings: {
        cognitive_actions: features.agenticCapabilities,
        behavioral_outputs: features.behavioralPatterns
      }
    };
  }

  /**
   * Process batch of sequences for grammar generation
   */
  async processBatch(batchNumber) {
    const spinner = ora(`Generating agentic grammar adapters for batch ${batchNumber}...`).start();
    
    try {
      // Load required data
      const cognitivePatterns = await fs.readJSON('.cognitive_registry/cognitive_patterns.json');
      const tensorShapes = await fs.readJSON('.cognitive_registry/tensor_shapes.json');
      
      const batchDir = path.join('.ggml_cache', `batch_${batchNumber}`);
      const batchMetadata = await fs.readJSON(path.join(batchDir, 'batch_metadata.json'));
      
      const grammarResults = {
        batchNumber,
        grammarAdapters: {},
        agenticMappings: {},
        cognitiveRules: {}
      };
      
      // Process each sequence in the batch
      for (const sequenceId of batchMetadata.processedSequences) {
        const cognitivePattern = cognitivePatterns[sequenceId];
        const tensorShape = tensorShapes[sequenceId];
        
        if (!cognitivePattern || !tensorShape) {
          console.warn(chalk.yellow(`Warning: Missing data for ${sequenceId}`));
          continue;
        }
        
        // Extract agentic features
        const agenticFeatures = this.extractAgenticFeatures(sequenceId, cognitivePattern, tensorShape);
        
        // Generate grammar rules
        const grammarRules = this.generateGrammarRules(agenticFeatures);
        
        // Store results
        grammarResults.grammarAdapters[sequenceId] = agenticFeatures;
        grammarResults.agenticMappings[sequenceId] = {
          capabilities: agenticFeatures.agenticCapabilities,
          roles: agenticFeatures.cognitiveRoles,
          tokens: agenticFeatures.grammarTokens
        };
        grammarResults.cognitiveRules[sequenceId] = grammarRules;
      }
      
      // Save grammar results
      const outputPath = path.join('.cognitive_registry', `grammar_batch_${batchNumber}.json`);
      await fs.writeJSON(outputPath, grammarResults, { spaces: 2 });
      
      spinner.succeed(`Grammar adapters generated for batch ${batchNumber}`);
      
      console.log(chalk.green(`   • Generated ${Object.keys(grammarResults.grammarAdapters).length} grammar adapters`));
      console.log(chalk.green(`   • Created ${Object.keys(grammarResults.cognitiveRules).length} cognitive rule sets`));
      
      return grammarResults;
      
    } catch (error) {
      spinner.fail(`Grammar generation failed for batch ${batchNumber}: ${error.message}`);
      throw error;
    }
  }
}

// CLI Interface
const program = new Command();

program
  .name('generate-grammar-adapters')
  .description('Generate agentic grammar adapters for OEIS sequences')
  .option('-b, --batch <number>', 'batch number to process', '1')
  .action(async (options) => {
    const adapter = new AgenticGrammarAdapter();
    await adapter.initialize();
    
    const batchNumber = parseInt(options.batch);
    await adapter.processBatch(batchNumber);
  });

if (require.main === module) {
  program.parse();
}

module.exports = AgenticGrammarAdapter;