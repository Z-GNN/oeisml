#!/usr/bin/env node
/**
 * GGML Tensorization for OEIS Sequences
 * Converts OEIS mathematical sequences into GGML tensor representations
 */

const fs = require('fs-extra');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

class GGMLTensorizer {
  constructor() {
    this.tensorCache = new Map();
    this.batchResults = new Map();
  }

  async initialize() {
    await fs.ensureDir('.ggml_cache');
    await fs.ensureDir('.cognitive_registry');
  }

  /**
   * Load cognitive registry data from analysis phase
   */
  async loadCognitiveRegistry() {
    try {
      const tensorShapes = await fs.readJSON('.cognitive_registry/tensor_shapes.json');
      const cognitivePatterns = await fs.readJSON('.cognitive_registry/cognitive_patterns.json');
      const kernelRegistry = await fs.readJSON('.cognitive_registry/kernel_registry.json');
      
      return { tensorShapes, cognitivePatterns, kernelRegistry };
    } catch (error) {
      throw new Error(`Failed to load cognitive registry: ${error.message}`);
    }
  }

  /**
   * Convert sequence data to normalized tensor format
   */
  normalizeTensorData(sequenceData, targetShape) {
    const totalElements = targetShape.reduce((a, b) => a * b, 1);
    
    // Normalize sequence values to [0, 1] range
    const max = Math.max(...sequenceData, 1);
    const min = Math.min(...sequenceData, 0);
    const range = max - min || 1;
    
    const normalized = sequenceData.map(val => (val - min) / range);
    
    // Pad or truncate to match tensor size
    const tensorData = new Float32Array(totalElements);
    
    for (let i = 0; i < totalElements; i++) {
      if (i < normalized.length) {
        tensorData[i] = normalized[i];
      } else {
        // Use pattern repetition or interpolation for padding
        const index = i % normalized.length;
        tensorData[i] = normalized[index] * 0.1; // Dampened repetition
      }
    }
    
    return {
      data: tensorData,
      shape: targetShape,
      originalLength: sequenceData.length,
      normalizationParams: { min, max, range }
    };
  }

  /**
   * Generate GGML-compatible tensor metadata
   */
  createTensorMetadata(sequenceId, tensorData, cognitivePattern) {
    return {
      id: sequenceId,
      type: 'ggml_tensor',
      dataType: 'float32',
      shape: tensorData.shape,
      elements: tensorData.data.length,
      cognitiveComplexity: cognitivePattern.complexity,
      semanticDimensions: cognitivePattern.dimensions,
      sequenceName: cognitivePattern.name,
      normalization: tensorData.normalizationParams,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }

  /**
   * Apply GGML-specific optimizations
   */
  optimizeForGGML(tensorData) {
    // GGML prefers specific tensor layouts for performance
    const { data, shape } = tensorData;
    
    // Ensure shape compatibility with GGML operations
    const optimizedShape = this.alignShapeForGGML(shape);
    
    // Apply quantization if beneficial
    const quantized = this.quantizeTensor(data);
    
    return {
      ...tensorData,
      shape: optimizedShape,
      data: quantized,
      optimized: true
    };
  }

  /**
   * Align tensor shape for GGML compatibility
   */
  alignShapeForGGML(shape) {
    // GGML works best with powers of 2 or multiples of common sizes
    return shape.map(dim => {
      if (dim <= 4) return dim;
      if (dim <= 8) return 8;
      if (dim <= 16) return 16;
      if (dim <= 32) return 32;
      return Math.min(dim, 64);
    });
  }

  /**
   * Apply quantization for memory efficiency
   */
  quantizeTensor(data) {
    // For now, keep float32 precision but could add int8/int16 quantization
    return data;
  }

  /**
   * Save tensor to GGML format
   */
  async saveTensorToFile(tensorData, metadata, outputPath) {
    const tensorFile = {
      metadata,
      tensor: {
        shape: tensorData.shape,
        data: Array.from(tensorData.data), // Convert Float32Array to regular array for JSON
        type: 'float32'
      }
    };
    
    await fs.writeJSON(outputPath, tensorFile, { spaces: 2 });
    
    // Also save in binary format for efficiency (mock implementation)
    const binaryPath = outputPath.replace('.json', '.bin');
    await fs.writeFile(binaryPath, Buffer.from(tensorData.data.buffer));
    
    return {
      jsonPath: outputPath,
      binaryPath,
      size: tensorData.data.length * 4 // 4 bytes per float32
    };
  }

  /**
   * Process sequences in batches for GGML tensorization
   */
  async processBatch(batchNumber, totalBatches) {
    const spinner = ora(`Processing GGML tensorization batch ${batchNumber}/${totalBatches}...`).start();
    
    try {
      const registry = await this.loadCognitiveRegistry();
      const sequenceIds = Object.keys(registry.tensorShapes);
      
      // Calculate batch boundaries
      const batchSize = Math.ceil(sequenceIds.length / totalBatches);
      const startIndex = (batchNumber - 1) * batchSize;
      const endIndex = Math.min(startIndex + batchSize, sequenceIds.length);
      const batchIds = sequenceIds.slice(startIndex, endIndex);
      
      const batchResults = {
        batchNumber,
        processedSequences: [],
        tensorFiles: [],
        totalSize: 0,
        averageComplexity: 0
      };
      
      // Create batch output directory
      const batchDir = path.join('.ggml_cache', `batch_${batchNumber}`);
      await fs.ensureDir(batchDir);
      
      let totalComplexity = 0;
      
      for (const sequenceId of batchIds) {
        try {
          // Load original sequence data
          const sequenceData = await this.loadSequenceData(sequenceId);
          const tensorShape = registry.tensorShapes[sequenceId];
          const cognitivePattern = registry.cognitivePatterns[sequenceId];
          
          // Tensorize the sequence
          const tensorData = this.normalizeTensorData(sequenceData, tensorShape.shape);
          const optimizedTensor = this.optimizeForGGML(tensorData);
          const metadata = this.createTensorMetadata(sequenceId, optimizedTensor, cognitivePattern);
          
          // Save tensor files
          const outputPath = path.join(batchDir, `${sequenceId}_tensor.json`);
          const saveResult = await this.saveTensorToFile(optimizedTensor, metadata, outputPath);
          
          batchResults.processedSequences.push(sequenceId);
          batchResults.tensorFiles.push(saveResult);
          batchResults.totalSize += saveResult.size;
          totalComplexity += cognitivePattern.complexity;
          
        } catch (error) {
          console.warn(chalk.yellow(`Warning: Failed to process ${sequenceId}: ${error.message}`));
        }
      }
      
      batchResults.averageComplexity = totalComplexity / batchResults.processedSequences.length;
      
      // Save batch metadata
      const batchMetadataPath = path.join(batchDir, 'batch_metadata.json');
      await fs.writeJSON(batchMetadataPath, batchResults, { spaces: 2 });
      
      spinner.succeed(`Batch ${batchNumber} completed: ${batchResults.processedSequences.length} tensors generated`);
      
      console.log(chalk.green(`   • Total tensor size: ${(batchResults.totalSize / 1024 / 1024).toFixed(2)} MB`));
      console.log(chalk.green(`   • Average complexity: ${batchResults.averageComplexity.toFixed(2)}`));
      
      return batchResults;
      
    } catch (error) {
      spinner.fail(`Batch ${batchNumber} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Load sequence data from OEIS files
   */
  async loadSequenceData(sequenceId) {
    // Determine file path from sequence ID
    const subdir = sequenceId.substring(0, 4); // e.g., A000 from A000001
    const filePath = path.join('seq', subdir, `${sequenceId}.seq`);
    
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Sequence file not found: ${filePath}`);
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const data = [];
    
    for (const line of lines) {
      if (line.startsWith('%S ') || line.startsWith('%T ') || line.startsWith('%U ')) {
        const values = line.substring(3).trim().split(',').map(n => {
          const parsed = parseInt(n.trim());
          return isNaN(parsed) ? 0 : parsed;
        });
        data.push(...values);
      }
    }
    
    return data.filter(n => !isNaN(n)); // Remove any NaN values
  }
}

// CLI Interface
const program = new Command();

program
  .name('tensorize-sequences')
  .description('Convert OEIS sequences to GGML tensors')
  .option('-b, --batch <number>', 'batch number to process', '1')
  .option('-t, --total-batches <number>', 'total number of batches', '5')
  .option('-o, --optimize', 'enable GGML optimizations', true)
  .action(async (options) => {
    const tensorizer = new GGMLTensorizer();
    await tensorizer.initialize();
    
    const batchNumber = parseInt(options.batch);
    const totalBatches = parseInt(options.totalBatches);
    
    await tensorizer.processBatch(batchNumber, totalBatches);
  });

if (require.main === module) {
  program.parse();
}

module.exports = GGMLTensorizer;