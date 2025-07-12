#!/usr/bin/env node

/**
 * Script to create GitHub issues for the 6-phase Distributed Agentic Cognitive Grammar Network
 * development plan as described in the project requirements.
 */

const { execSync } = require('child_process');
const commander = require('commander');
const chalk = require('chalk');
const ora = require('ora');

const program = new commander.Command();

// Phase definitions with detailed descriptions and sub-steps
const PHASES = {
  1: {
    title: "🧬 Phase 1: Cognitive Primitives & Foundational Hypergraph Encoding",
    description: `Establish the atomic vocabulary and bidirectional translation mechanisms between ko6ml primitives and AtomSpace hypergraph patterns.`,
    objectives: [
      "Design modular Scheme adapters for agentic grammar AtomSpace",
      "Implement round-trip translation tests (no mocks)", 
      "Encode agent/state as hypergraph nodes/links with tensor shapes",
      "Document tensor signatures and prime factorization mapping",
      "Create exhaustive test patterns for each primitive and transformation",
      "Generate visualization hypergraph fragment flowcharts"
    ],
    subSteps: [
      {
        title: "Scheme Cognitive Grammar Microservices",
        tasks: [
          "Design modular Scheme adapters for agentic grammar AtomSpace",
          "Implement round-trip translation tests (no mocks)"
        ]
      },
      {
        title: "Tensor Fragment Architecture", 
        tasks: [
          "Encode agent/state as hypergraph nodes/links with tensor shapes: `[modality, depth, context, salience, autonomy_index]`",
          "Document tensor signatures and prime factorization mapping"
        ]
      },
      {
        title: "Verification",
        tasks: [
          "Exhaustive test patterns for each primitive and transformation",
          "Visualization: Hypergraph fragment flowcharts"
        ]
      }
    ],
    labels: ["phase-1", "cognitive-primitives", "hypergraph", "foundational"]
  },
  
  2: {
    title: "⚡ Phase 2: ECAN Attention Allocation & Resource Kernel Construction",
    description: `Infuse the network with dynamic, ECAN-style economic attention allocation and activation spreading.`,
    objectives: [
      "Architect ECAN-inspired resource allocators (Scheme + Python)",
      "Integrate with AtomSpace for activation spreading",
      "Benchmark attention allocation across distributed agents", 
      "Document mesh topology and dynamic state propagation",
      "Create real-world task scheduling and attention flow tests",
      "Generate recursive resource allocation pathway flowcharts"
    ],
    subSteps: [
      {
        title: "Kernel & Scheduler Design",
        tasks: [
          "Architect ECAN-inspired resource allocators (Scheme + Python)",
          "Integrate with AtomSpace for activation spreading"
        ]
      },
      {
        title: "Dynamic Mesh Integration",
        tasks: [
          "Benchmark attention allocation across distributed agents",
          "Document mesh topology and dynamic state propagation"
        ]
      },
      {
        title: "Verification", 
        tasks: [
          "Real-world task scheduling and attention flow tests",
          "Flowchart: Recursive resource allocation pathways"
        ]
      }
    ],
    labels: ["phase-2", "ecan", "attention-allocation", "resource-kernel"]
  },

  3: {
    title: "🔧 Phase 3: Neural-Symbolic Synthesis via Custom ggml Kernels",
    description: `Engineer custom ggml kernels for seamless neural-symbolic computation and inference.`,
    objectives: [
      "Implement symbolic tensor operations in ggml",
      "Design neural inference hooks for AtomSpace integration",
      "Validate tensor operations with real data (no mocks)",
      "Document kernel API, tensor shapes, performance metrics",
      "Create end-to-end neural-symbolic inference pipeline tests",
      "Generate symbolic ↔ neural pathway recursion flowcharts"
    ],
    subSteps: [
      {
        title: "Kernel Customization",
        tasks: [
          "Implement symbolic tensor operations in ggml",
          "Design neural inference hooks for AtomSpace integration"
        ]
      },
      {
        title: "Tensor Signature Benchmarking",
        tasks: [
          "Validate tensor operations with real data (no mocks)",
          "Document: Kernel API, tensor shapes, performance metrics"
        ]
      },
      {
        title: "Verification",
        tasks: [
          "End-to-end neural-symbolic inference pipeline tests",
          "Flowchart: Symbolic ↔ Neural pathway recursion"
        ]
      }
    ],
    labels: ["phase-3", "neural-symbolic", "ggml-kernels", "synthesis"]
  },

  4: {
    title: "🌐 Phase 4: Distributed Cognitive Mesh API & Embodiment Layer",
    description: `Expose the network via REST/WebSocket APIs; bind to Unity3D, ROS, and web agents for embodied cognition.`,
    objectives: [
      "Architect distributed state propagation, task orchestration APIs",
      "Ensure real endpoints—test with live data, no simulation",
      "Implement Unity3D/ROS/WebSocket interfaces",
      "Verify bi-directional data flow and real-time embodiment",
      "Create full-stack integration tests (virtual & robotic agents)",
      "Generate embodiment interface recursion flowcharts"
    ],
    subSteps: [
      {
        title: "API & Endpoint Engineering",
        tasks: [
          "Architect distributed state propagation, task orchestration APIs",
          "Ensure real endpoints—test with live data, no simulation"
        ]
      },
      {
        title: "Embodiment Bindings",
        tasks: [
          "Implement Unity3D/ROS/WebSocket interfaces",
          "Verify bi-directional data flow and real-time embodiment"
        ]
      },
      {
        title: "Verification",
        tasks: [
          "Full-stack integration tests (virtual & robotic agents)",
          "Flowchart: Embodiment interface recursion"
        ]
      }
    ],
    labels: ["phase-4", "distributed-mesh", "api", "embodiment"]
  },

  5: {
    title: "🔄 Phase 5: Recursive Meta-Cognition & Evolutionary Optimization",
    description: `Enable the system to observe, analyze, and recursively improve itself using evolutionary algorithms.`,
    objectives: [
      "Implement feedback-driven self-analysis modules",
      "Integrate MOSES (or equivalent) for kernel evolution",
      "Create continuous benchmarking, self-tuning of kernels and agents",
      "Document evolutionary trajectories, fitness landscapes",
      "Run evolutionary cycles with live performance metrics",
      "Generate meta-cognitive recursion flowcharts"
    ],
    subSteps: [
      {
        title: "Meta-Cognitive Pathways",
        tasks: [
          "Implement feedback-driven self-analysis modules",
          "Integrate MOSES (or equivalent) for kernel evolution"
        ]
      },
      {
        title: "Adaptive Optimization",
        tasks: [
          "Continuous benchmarking, self-tuning of kernels and agents",
          "Document: Evolutionary trajectories, fitness landscapes"
        ]
      },
      {
        title: "Verification",
        tasks: [
          "Run evolutionary cycles with live performance metrics",
          "Flowchart: Meta-cognitive recursion"
        ]
      }
    ],
    labels: ["phase-5", "meta-cognition", "evolutionary", "optimization"]
  },

  6: {
    title: "📚 Phase 6: Rigorous Testing, Documentation, and Cognitive Unification",
    description: `Achieve maximal rigor, transparency, and recursive documentation—approaching cognitive unity.`,
    objectives: [
      "Perform real implementation verification for every function",
      "Publish test output, coverage, and edge cases",
      "Auto-generate architectural flowcharts for every module",
      "Maintain living documentation: code, tensors, tests, evolution",
      "Synthesize all modules into a unified tensor field",
      "Document emergent properties and meta-patterns"
    ],
    subSteps: [
      {
        title: "Deep Testing Protocols",
        tasks: [
          "For every function, perform real implementation verification",
          "Publish test output, coverage, and edge cases"
        ]
      },
      {
        title: "Recursive Documentation",
        tasks: [
          "Auto-generate architectural flowcharts for every module",
          "Maintain living documentation: code, tensors, tests, evolution"
        ]
      },
      {
        title: "Cognitive Unification",
        tasks: [
          "Synthesize all modules into a unified tensor field",
          "Document emergent properties and meta-patterns"
        ]
      }
    ],
    labels: ["phase-6", "testing", "documentation", "unification"]
  }
};

program
  .name('create-phase-issues')
  .description('Create GitHub issues for Distributed Agentic Cognitive Grammar Network phases')
  .option('--create-all <boolean>', 'Create issues for all phases', 'true')
  .option('--phase <number>', 'Create issue for specific phase (1-6)', '1')
  .option('--repo <string>', 'GitHub repository (owner/name)', '')
  .option('--token <string>', 'GitHub token', '')
  .parse();

const options = program.opts();

function createIssueBody(phaseNumber) {
  const phase = PHASES[phaseNumber];
  
  let body = `${phase.description}\n\n`;
  
  body += `## 🎯 Objectives\n\n`;
  phase.objectives.forEach(objective => {
    body += `- [ ] ${objective}\n`;
  });
  
  body += `\n## 📋 Sub-Steps\n\n`;
  phase.subSteps.forEach((subStep, index) => {
    body += `### ${index + 1}. ${subStep.title}\n\n`;
    subStep.tasks.forEach(task => {
      body += `- [ ] ${task}\n`;
    });
    body += '\n';
  });
  
  body += `## 🔗 Dependencies\n\n`;
  if (phaseNumber > 1) {
    body += `- [ ] Phase ${phaseNumber - 1} completion\n`;
  }
  if (phaseNumber < 6) {
    body += `- [ ] Prepare foundation for Phase ${phaseNumber + 1}\n`;
  }
  
  body += `\n## 📊 Success Criteria\n\n`;
  body += `- [ ] All objectives completed and verified\n`;
  body += `- [ ] All sub-step tasks implemented with real data (no mocks)\n`;
  body += `- [ ] Comprehensive testing and validation\n`;
  body += `- [ ] Documentation and flowcharts generated\n`;
  body += `- [ ] Integration tests passing\n`;
  
  body += `\n## 🔄 Recursive Implementation Notes\n\n`;
  body += `This phase is a recursive membrane, dynamically allocating attention and resources, continuously optimizing itself—synergizing into the living, distributed cognitive tapestry.\n\n`;
  
  body += `Each deliverable should follow the recursive self-optimization pattern:\n`;
  body += `\`\`\`\n`;
  body += `Input → Scheme Adapter → AtomSpace Hypergraph → Tensor Assignment → \n`;
  body += `ECAN Attention → ggml Kernel → Distributed API → Embodiment → \n`;
  body += `Meta-Cognitive Feedback → Evolutionary Optimization → Unified Cognitive Field\n`;
  body += `\`\`\`\n\n`;
  
  body += `---\n\n`;
  body += `*Part of the 6-phase Distributed Agentic Cognitive Grammar Network development plan.*`;
  
  return body;
}

function createGitHubIssue(phaseNumber) {
  const phase = PHASES[phaseNumber];
  const title = phase.title;
  const body = createIssueBody(phaseNumber);
  const labels = phase.labels.join(',');
  
  const spinner = ora(`Creating issue for ${title}`).start();
  
  try {
    // Use GitHub CLI to create the issue
    const command = `gh issue create --title "${title}" --body "${body.replace(/"/g, '\\"')}" --label "${labels}"`;
    
    const result = execSync(command, { 
      encoding: 'utf8',
      env: { 
        ...process.env, 
        GH_TOKEN: options.token 
      }
    });
    
    spinner.succeed(`Created issue for ${title}`);
    console.log(chalk.green(`✓ Issue URL: ${result.trim()}`));
    
    return result.trim();
  } catch (error) {
    spinner.fail(`Failed to create issue for ${title}`);
    console.error(chalk.red(`✗ Error: ${error.message}`));
    return null;
  }
}

async function main() {
  console.log(chalk.blue('🧬 Creating Distributed Agentic Cognitive Grammar Network Phase Issues\n'));
  
  if (!options.repo || !options.token) {
    console.error(chalk.red('Error: Repository and token are required'));
    process.exit(1);
  }
  
  // Set the repository for gh CLI
  process.env.GH_REPO = options.repo;
  
  const createAll = options.createAll === 'true';
  const createdIssues = [];
  
  if (createAll) {
    console.log(chalk.yellow('Creating issues for all 6 phases...\n'));
    
    for (let phase = 1; phase <= 6; phase++) {
      const issueUrl = createGitHubIssue(phase);
      if (issueUrl) {
        createdIssues.push({ phase, url: issueUrl });
      }
    }
  } else {
    const phaseNumber = parseInt(options.phase);
    if (phaseNumber < 1 || phaseNumber > 6) {
      console.error(chalk.red('Error: Phase number must be between 1 and 6'));
      process.exit(1);
    }
    
    console.log(chalk.yellow(`Creating issue for Phase ${phaseNumber}...\n`));
    
    const issueUrl = createGitHubIssue(phaseNumber);
    if (issueUrl) {
      createdIssues.push({ phase: phaseNumber, url: issueUrl });
    }
  }
  
  console.log(chalk.blue('\n📋 Summary:'));
  console.log(chalk.green(`✓ Created ${createdIssues.length} issue(s)`));
  
  createdIssues.forEach(({ phase, url }) => {
    console.log(chalk.cyan(`  • Phase ${phase}: ${url}`));
  });
  
  console.log(chalk.blue('\n🔄 Next Steps:'));
  console.log('• Assign team members to each phase');
  console.log('• Set up milestone tracking');
  console.log('• Begin with Phase 1: Scheme adapters + hypergraph encoding');
  console.log('• Enable recursive self-optimization spiral');
}

if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  });
}

module.exports = { PHASES, createIssueBody };