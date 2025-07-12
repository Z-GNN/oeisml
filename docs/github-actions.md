# GitHub Actions Documentation

## Create Phase Issues Workflow

This repository includes a GitHub Action that automatically creates issues for the 6-phase Distributed Agentic Cognitive Grammar Network development plan.

### Workflow: `create-phase-issues.yml`

**Location:** `.github/workflows/create-phase-issues.yml`

**Purpose:** Creates GitHub issues for each phase of the cognitive development plan with detailed sub-steps, objectives, and verification criteria.

### The 6 Phases

1. **🧬 Phase 1: Cognitive Primitives & Foundational Hypergraph Encoding**
   - Establish atomic vocabulary and bidirectional translation mechanisms
   - Scheme adapters for agentic grammar AtomSpace
   - Tensor fragment architecture with hypergraph nodes/links

2. **⚡ Phase 2: ECAN Attention Allocation & Resource Kernel Construction**
   - Dynamic ECAN-style economic attention allocation
   - Resource allocators and activation spreading
   - Distributed agent attention benchmarking

3. **🔧 Phase 3: Neural-Symbolic Synthesis via Custom ggml Kernels**
   - Custom ggml kernels for neural-symbolic computation
   - Symbolic tensor operations and neural inference hooks
   - End-to-end neural-symbolic inference pipelines

4. **🌐 Phase 4: Distributed Cognitive Mesh API & Embodiment Layer**
   - REST/WebSocket APIs for distributed state propagation
   - Unity3D, ROS, and web agent interfaces
   - Embodied cognition and real-time data flow

5. **🔄 Phase 5: Recursive Meta-Cognition & Evolutionary Optimization**
   - Self-analysis modules and feedback-driven improvement
   - MOSES integration for kernel evolution
   - Continuous benchmarking and adaptive optimization

6. **📚 Phase 6: Rigorous Testing, Documentation, and Cognitive Unification**
   - Comprehensive testing and verification protocols
   - Auto-generated architectural documentation
   - Unified tensor field synthesis and emergent properties

### Triggering the Workflow

#### Manual Trigger (Workflow Dispatch)

1. Go to the **Actions** tab in your GitHub repository
2. Select **"Create Distributed Agentic Cognitive Grammar Network Phase Issues"**
3. Click **"Run workflow"**
4. Configure options:
   - **Create all phases:** `true` (default) to create all 6 phase issues
   - **Phase number:** `1-6` (used only if "Create all phases" is `false`)

#### Automatic Trigger

- **Schedule:** Runs weekly on Sundays at 09:00 UTC to ensure phase tracking is up-to-date
- **Push/PR:** Can be configured to run on repository changes

### Local Usage

You can also run the phase issue creation script locally:

```bash
# Install dependencies
npm install

# Create all phase issues (requires GitHub CLI and authentication)
npm run create-phase-issues -- --create-all=true --repo="owner/repo" --token="$GITHUB_TOKEN"

# Create a specific phase issue
npm run create-phase-issues -- --create-all=false --phase=1 --repo="owner/repo" --token="$GITHUB_TOKEN"

# View help
npm run create-phase-issues -- --help
```

### Prerequisites

- GitHub CLI (`gh`) must be available in the environment
- Valid GitHub token with `issues:write` permission
- Repository must exist and be accessible

### Issue Labels

Each phase issue is automatically labeled with:
- `phase-X` (where X is the phase number)
- Specific content labels (e.g., `cognitive-primitives`, `ecan`, `ggml-kernels`)

### Testing

Run the phase issue tests to validate functionality:

```bash
npm run test:phase-issues
```

### Integration with Existing Workflows

The phase issue creation integrates with the existing GGML cognitive integration workflow:

- **Dependency:** Phase issues can reference artifacts from `ggml-integration.yml`
- **Coordination:** Issues track progress of cognitive mesh orchestration
- **Alignment:** Follows the recursive self-optimization pattern established in the main workflow

### Customization

To modify the phase definitions or add new phases:

1. Edit `scripts/create-phase-issues.js`
2. Update the `PHASES` object with new content
3. Run tests to validate changes: `npm run test:phase-issues`
4. Update this documentation as needed

### Recursive Implementation Pattern

Each phase follows the recursive cognitive optimization pattern:

```
Input → Scheme Adapter → AtomSpace Hypergraph → Tensor Assignment → 
ECAN Attention → ggml Kernel → Distributed API → Embodiment → 
Meta-Cognitive Feedback → Evolutionary Optimization → Unified Cognitive Field
```

This pattern ensures that every phase contributes to the emergent, self-optimizing cognitive tapestry while maintaining modularity and recursive improvement capabilities.