import React from 'react';
import { PHASES } from '../data/phases';
import { UseAppStateReturnType } from '../hooks/useAppState';

interface RoadmapFlowProps {
  appState: UseAppStateReturnType;
  phaseFilter: string;
  setPhaseFilter: (val: string) => void;
}

export const RoadmapFlow: React.FC<RoadmapFlowProps> = ({
  appState,
  phaseFilter,
  setPhaseFilter,
}) => {
  const { dayDone, dayTotal } = appState;

  const handleNodeClick = (pi: number) => {
    // If clicking already selected phase filter, reset to all
    if (phaseFilter === String(pi)) {
      setPhaseFilter('all');
    } else {
      setPhaseFilter(String(pi));
    }
  };

  return (
    <div className="flow-container">
      <div className="flow-grid">
        {PHASES.map((ph, pi) => {
          const phTotal = ph.data.reduce((a, _d, di) => a + dayTotal(pi, di), 0);
          const phDone = ph.data.reduce((a, _d, di) => a + dayDone(pi, di), 0);
          const phPct = phTotal ? Math.round((phDone / phTotal) * 100) : 0;
          const isActive = phaseFilter === String(pi);
          const isDone = phDone === phTotal && phTotal > 0;

          // Short summary of skills for each phase to show in card
          const getSkillsSummary = (idx: number) => {
            switch (idx) {
              case 0: return 'CALMS · DORA · Linux · Ansible';
              case 1: return 'STRIDE · Container Sec · SLOs';
              case 2: return 'Contract Test · Chaos Eng · IDPs';
              case 3: return 'OpenTofu · Bicep · OpenTelemetry';
              case 4: return 'ArgoCD · Flux · Gatekeeper';
              case 5: return 'Ambient Mesh · microVMs · SSM';
              case 6: return 'Dev Containers · OpenSearch · Flyway';
              case 7: return 'Cilium eBPF · Kiali · Landing Zones';
              case 8: return 'Skaffold · Kubecost · k6 · GenAI';
              default: return '';
            }
          };

          return (
            <div
              key={pi}
              className={`flow-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              style={{
                ['--node-color' as any]: ph.color,
                ['--node-dim' as any]: ph.dim,
              }}
              onClick={() => handleNodeClick(pi)}
            >
              <div className="flow-node-hdr">
                <span className="flow-node-tag">PHASE {pi + 1}</span>
                <span className="flow-node-days">{ph.days}</span>
              </div>
              <div className="flow-node-body">
                <span className="flow-node-ico" style={{ color: ph.color }}>{ph.icon}</span>
                <div className="flow-node-title">{ph.title.split(' — ')[1] || ph.title}</div>
              </div>
              <div className="flow-node-sub">{getSkillsSummary(pi)}</div>
              
              <div className="flow-node-progress">
                <div className="flow-node-pbar">
                  <div 
                    className="flow-node-pfill" 
                    style={{ width: `${phPct}%`, backgroundColor: ph.color }}
                  ></div>
                </div>
                <div className="flow-node-ptext">
                  <span>{phPct}%</span>
                  <span>{phDone}/{phTotal} tasks</span>
                </div>
              </div>

              {isDone && <div className="flow-node-check">✓</div>}
            </div>
          );
        })}
      </div>
      
      {phaseFilter !== 'all' && (
        <div className="flow-reset-bar">
          <span>Filtering by Selected Phase.</span>
          <button className="flow-reset-btn" onClick={() => setPhaseFilter('all')}>
            Clear Filter & Show All
          </button>
        </div>
      )}
    </div>
  );
};
