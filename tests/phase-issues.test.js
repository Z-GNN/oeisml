const { PHASES, createIssueBody } = require('../scripts/create-phase-issues');

describe('Phase Issues Creation', () => {
  describe('Phase definitions', () => {
    test('should have all 6 phases defined', () => {
      expect(Object.keys(PHASES)).toHaveLength(6);
      
      for (let i = 1; i <= 6; i++) {
        expect(PHASES[i]).toBeDefined();
        expect(PHASES[i].title).toBeTruthy();
        expect(PHASES[i].description).toBeTruthy();
        expect(PHASES[i].objectives).toBeInstanceOf(Array);
        expect(PHASES[i].subSteps).toBeInstanceOf(Array);
        expect(PHASES[i].labels).toBeInstanceOf(Array);
      }
    });

    test('should have proper phase titles with emojis', () => {
      expect(PHASES[1].title).toContain('🧬 Phase 1: Cognitive Primitives');
      expect(PHASES[2].title).toContain('⚡ Phase 2: ECAN Attention');
      expect(PHASES[3].title).toContain('🔧 Phase 3: Neural-Symbolic');
      expect(PHASES[4].title).toContain('🌐 Phase 4: Distributed Cognitive Mesh');
      expect(PHASES[5].title).toContain('🔄 Phase 5: Recursive Meta-Cognition');
      expect(PHASES[6].title).toContain('📚 Phase 6: Rigorous Testing');
    });

    test('should have appropriate labels for each phase', () => {
      expect(PHASES[1].labels).toContain('phase-1');
      expect(PHASES[1].labels).toContain('cognitive-primitives');
      expect(PHASES[2].labels).toContain('phase-2');
      expect(PHASES[2].labels).toContain('ecan');
      expect(PHASES[3].labels).toContain('phase-3');
      expect(PHASES[3].labels).toContain('ggml-kernels');
    });
  });

  describe('Issue body generation', () => {
    test('should generate complete issue body for Phase 1', () => {
      const body = createIssueBody(1);
      
      expect(body).toContain('hypergraph patterns');
      expect(body).toContain('## 🎯 Objectives');
      expect(body).toContain('## 📋 Sub-Steps');
      expect(body).toContain('## 🔗 Dependencies');
      expect(body).toContain('## 📊 Success Criteria');
      expect(body).toContain('## 🔄 Recursive Implementation Notes');
      expect(body).toContain('Scheme Cognitive Grammar Microservices');
      expect(body).toContain('Tensor Fragment Architecture');
      expect(body).toContain('hypergraph nodes/links');
    });

    test('should generate complete issue body for Phase 6', () => {
      const body = createIssueBody(6);
      
      expect(body).toContain('cognitive unity');
      expect(body).toContain('Deep Testing Protocols');
      expect(body).toContain('Recursive Documentation');
      expect(body).toContain('Cognitive Unification');
      expect(body).toContain('Phase 5 completion');
    });

    test('should include dependencies for middle phases', () => {
      const body3 = createIssueBody(3);
      expect(body3).toContain('Phase 2 completion');
      expect(body3).toContain('Phase 4');
      
      const body4 = createIssueBody(4);
      expect(body4).toContain('Phase 3 completion');
      expect(body4).toContain('Phase 5');
    });

    test('should include recursive implementation pattern in all phases', () => {
      for (let i = 1; i <= 6; i++) {
        const body = createIssueBody(i);
        expect(body).toContain('recursive membrane');
        expect(body).toContain('Input → Scheme Adapter → AtomSpace');
        expect(body).toContain('Unified Cognitive Field');
      }
    });
  });

  describe('Phase content validation', () => {
    test('Phase 1 should focus on foundational hypergraph encoding', () => {
      const phase1 = PHASES[1];
      expect(phase1.description).toContain('hypergraph patterns');
      expect(phase1.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Scheme adapters'),
          expect.stringContaining('hypergraph nodes/links'),
          expect.stringContaining('tensor shapes')
        ])
      );
    });

    test('Phase 2 should focus on ECAN attention allocation', () => {
      const phase2 = PHASES[2];
      expect(phase2.description).toContain('ECAN-style economic attention');
      expect(phase2.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('ECAN-inspired resource allocators'),
          expect.stringContaining('activation spreading'),
          expect.stringContaining('attention allocation')
        ])
      );
    });

    test('Phase 3 should focus on ggml kernel customization', () => {
      const phase3 = PHASES[3];
      expect(phase3.description).toContain('custom ggml kernels');
      expect(phase3.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('symbolic tensor operations'),
          expect.stringContaining('neural inference hooks'),
          expect.stringContaining('neural-symbolic inference')
        ])
      );
    });

    test('Phase 4 should focus on distributed APIs and embodiment', () => {
      const phase4 = PHASES[4];
      expect(phase4.description).toContain('REST/WebSocket APIs');
      expect(phase4.description).toContain('Unity3D, ROS');
      expect(phase4.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('distributed state propagation'),
          expect.stringContaining('Unity3D/ROS/WebSocket'),
          expect.stringContaining('embodiment')
        ])
      );
    });

    test('Phase 5 should focus on meta-cognition and evolution', () => {
      const phase5 = PHASES[5];
      expect(phase5.description).toContain('recursively improve itself');
      expect(phase5.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('self-analysis modules'),
          expect.stringContaining('MOSES'),
          expect.stringContaining('evolutionary')
        ])
      );
    });

    test('Phase 6 should focus on testing and unification', () => {
      const phase6 = PHASES[6];
      expect(phase6.description).toContain('cognitive unity');
      expect(phase6.objectives).toEqual(
        expect.arrayContaining([
          expect.stringContaining('implementation verification'),
          expect.stringContaining('unified tensor field'),
          expect.stringContaining('emergent properties')
        ])
      );
    });
  });
});