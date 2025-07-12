#!/usr/bin/env node
/**
 * OEIS Sequence Analysis for GGML Cognitive Integration
 * Analyzes OEIS sequences to determine optimal tensor shapes and cognitive grammar patterns
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class OEISSequenceAnalyzer {
  constructor() {
    this.sequenceData = new Map();
    this.tensorShapes = new Map();
    this.cognitivePatterns = new Map();
    this.primeFactorizations = new Map();
  }

  async initialize() {
    await fs.ensureDir('.cognitive_registry');
    await fs.ensureDir('.ggml_cache');
    await fs.ensureDir('.atomspace');
  }

  /**
   * Parse OEIS sequence file and extract mathematical properties
   */
  parseSequenceFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    const sequence = {
      id: null,
      name: null,
      data: [],
      comments: [],
      references: [],
      cognitiveComplexity: 0,
      semanticDimensions: []
    };

    for (const line of lines) {
      if (line.startsWith('%I ')) {
        sequence.id = line.split(' ')[1];
      } else if (line.startsWith('%N ')) {
        sequence.name = line.substring(3).trim();
      } else if (line.startsWith('%S ') || line.startsWith('%T ') || line.startsWith('%U ')) {
        // Extract sequence data
        const data = line.substring(3).trim().split(',').map(n => {
          const parsed = parseInt(n.trim());
          return isNaN(parsed) ? 0 : parsed;
        });
        sequence.data.push(...data);
      } else if (line.startsWith('%C ')) {
        sequence.comments.push(line.substring(3).trim());
      } else if (line.startsWith('%H ')) {
        sequence.references.push(line.substring(3).trim());
      }
    }

    // Calculate cognitive complexity based on sequence properties
    sequence.cognitiveComplexity = this.calculateCognitiveComplexity(sequence);
    sequence.semanticDimensions = this.extractSemanticDimensions(sequence);

    return sequence;
  }

  /**
   * Calculate cognitive complexity for tensor shape determination
   */
  calculateCognitiveComplexity(sequence) {
    let complexity = 1;
    
    // Factor in sequence length
    complexity += Math.log(sequence.data.length + 1);
    
    // Factor in value range and distribution
    if (sequence.data.length > 0) {
      const max = Math.max(...sequence.data);
      const min = Math.min(...sequence.data);
      complexity += Math.log(max - min + 1);
      
      // Entropy-based complexity
      const valueFreq = new Map();
      sequence.data.forEach(val => {
        valueFreq.set(val, (valueFreq.get(val) || 0) + 1);
      });
      
      let entropy = 0;
      for (const freq of valueFreq.values()) {
        const p = freq / sequence.data.length;
        entropy -= p * Math.log2(p);
      }
      complexity += entropy;
    }
    
    // Factor in comment complexity (semantic richness)
    complexity += sequence.comments.length * 0.5;
    complexity += sequence.references.length * 0.3;
    
    return Math.ceil(complexity);
  }

  /**
   * Extract semantic dimensions for agentic grammar mapping
   */
  extractSemanticDimensions(sequence) {
    const dimensions = ['context', 'time', 'salience']; // Base dimensions
    
    // Add domain-specific dimensions based on sequence properties
    if (sequence.name && sequence.name.toLowerCase().includes('prime')) {
      dimensions.push('primality', 'factorization');
    }
    
    if (sequence.name && sequence.name.toLowerCase().includes('fibonacci')) {
      dimensions.push('recursion', 'golden_ratio');
    }
    
    if (sequence.comments.some(c => c.toLowerCase().includes('group'))) {
      dimensions.push('algebraic_structure', 'symmetry');
    }
    
    if (sequence.comments.some(c => c.toLowerCase().includes('polynomial'))) {
      dimensions.push('polynomial_degree', 'analytic_properties');
    }

    return dimensions;
  }

  /**
   * Generate tensor shape based on prime factorization of semantic dimensions
   */
  generateTensorShape(sequence) {
    const dimensions = sequence.semanticDimensions;
    const complexity = sequence.cognitiveComplexity;
    
    // Base tensor shape calculation
    let shape = [];
    
    // Primary dimensions based on semantic complexity
    const primaryDim = Math.max(2, Math.min(complexity, 16));
    shape.push(primaryDim);
    
    // Secondary dimensions for each semantic dimension
    dimensions.forEach((dim, index) => {
      const size = this.getDimensionSize(dim, complexity);
      shape.push(size);
    });
    
    // Ensure minimum dimensionality for GGML compatibility
    while (shape.length < 3) {
      shape.push(2);
    }
    
    // Prime factorization for cognitive kernel decomposition
    const factorization = this.primeFactorize(shape.reduce((a, b) => a * b, 1));
    
    return {
      shape,
      factorization,
      totalElements: shape.reduce((a, b) => a * b, 1),
      semanticMapping: dimensions
    };
  }

  /**
   * Determine dimension size based on semantic type
   */
  getDimensionSize(dimension, complexity) {
    const baseSizes = {
      'context': 4,
      'time': 8,
      'salience': 3,
      'primality': 7,
      'factorization': 5,
      'recursion': 6,
      'golden_ratio': 2,
      'algebraic_structure': 8,
      'symmetry': 4,
      'polynomial_degree': 6,
      'analytic_properties': 5
    };
    
    const baseSize = baseSizes[dimension] || 3;
    return Math.max(2, Math.min(baseSize + Math.floor(complexity / 4), 12));
  }

  /**
   * Prime factorization for kernel shape registry
   */
  primeFactorize(n) {
    const factors = [];
    let d = 2;
    
    while (d * d <= n) {
      while (n % d === 0) {
        factors.push(d);
        n /= d;
      }
      d++;
    }
    
    if (n > 1) {
      factors.push(n);
    }
    
    return factors;
  }

  /**
   * Process all OEIS sequences in batches
   */
  async processSequences(batchSize = 100) {
    const spinner = ora('Analyzing OEIS sequences for cognitive integration...').start();
    
    try {
      const seqDir = path.join(process.cwd(), 'seq');
      const subdirs = await fs.readdir(seqDir);
      
      let totalProcessed = 0;
      const results = {
        totalSequences: 0,
        tensorShapes: {},
        cognitivePatterns: {},
        kernelRegistry: {},
        primeFactorizations: {}
      };

      for (const subdir of subdirs.slice(0, 10)) { // Process first 10 subdirectories for demo
        const subdirPath = path.join(seqDir, subdir);
        const stat = await fs.stat(subdirPath);
        
        if (!stat.isDirectory()) continue;
        
        const files = await fs.readdir(subdirPath);
        const seqFiles = files.filter(f => f.endsWith('.seq')).slice(0, batchSize);
        
        for (const file of seqFiles) {
          const filepath = path.join(subdirPath, file);
          const sequence = this.parseSequenceFile(filepath);
          const tensorShape = this.generateTensorShape(sequence);
          
          // Store results
          results.tensorShapes[sequence.id] = tensorShape;
          results.cognitivePatterns[sequence.id] = {
            complexity: sequence.cognitiveComplexity,
            dimensions: sequence.semanticDimensions,
            name: sequence.name
          };
          results.kernelRegistry[sequence.id] = {
            shape: tensorShape.shape,
            factorization: tensorShape.factorization,
            semanticMapping: tensorShape.semanticMapping
          };
          
          totalProcessed++;
          
          if (totalProcessed % 50 === 0) {
            spinner.text = `Processed ${totalProcessed} sequences...`;
          }
        }
      }
      
      results.totalSequences = totalProcessed;
      
      // Save results to cognitive registry
      await fs.writeJSON('.cognitive_registry/tensor_shapes.json', results.tensorShapes, { spaces: 2 });
      await fs.writeJSON('.cognitive_registry/cognitive_patterns.json', results.cognitivePatterns, { spaces: 2 });
      await fs.writeJSON('.cognitive_registry/kernel_registry.json', results.kernelRegistry, { spaces: 2 });
      await fs.writeFile('.cognitive_registry/kernel_count.txt', totalProcessed.toString());
      
      spinner.succeed(`Successfully analyzed ${totalProcessed} OEIS sequences`);
      
      console.log(chalk.green('\n📊 Analysis Summary:'));
      console.log(`   • Total sequences processed: ${totalProcessed}`);
      console.log(`   • Unique tensor shapes: ${Object.keys(results.tensorShapes).length}`);
      console.log(`   • Average cognitive complexity: ${this.calculateAverageComplexity(results.cognitivePatterns)}`);
      console.log(`   • Generated kernel registry with ${totalProcessed} entries`);
      
      return results;
      
    } catch (error) {
      spinner.fail(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  calculateAverageComplexity(patterns) {
    const complexities = Object.values(patterns).map(p => p.complexity);
    return (complexities.reduce((a, b) => a + b, 0) / complexities.length).toFixed(2);
  }
}

// CLI Interface
const program = new Command();

program
  .name('analyze-oeis-sequences')
  .description('Analyze OEIS sequences for GGML cognitive integration')
  .option('-b, --batch <size>', 'batch size for processing', '100')
  .option('-v, --verbose', 'verbose output')
  .action(async (options) => {
    const analyzer = new OEISSequenceAnalyzer();
    await analyzer.initialize();
    await analyzer.processSequences(parseInt(options.batch));
  });

if (require.main === module) {
  program.parse();
}

module.exports = OEISSequenceAnalyzer;