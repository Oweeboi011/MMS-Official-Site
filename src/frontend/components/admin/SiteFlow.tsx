import { Background, Controls, MarkerType, Position, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { buildFlow, type FlowState } from '../../data/siteFlow';
import { STATE_LABEL, type MapPage, type PageFacts, type PageState } from '../../data/siteMapStatus';

const COLOUR: Record<FlowState, string> = { live: '#2f7d4f', partial: '#c99a00', sample: '#252b73', off: '#a92e2a', info: '#6b7280' };
const LEGEND: PageState[] = ['live', 'partial', 'sample', 'off'];

// How content reaches the site, and where it is stuck: admin-entered data → pages, switch-over features, unconfirmed copy.
export default function SiteFlow({ pages, facts }: { pages: MapPage[]; facts: PageFacts }) {
  const flow = buildFlow(pages, facts);
  const nodes: Node[] = flow.nodes.map((n) => ({
    id: n.id, position: { x: n.x, y: n.y }, className: `flow-node flow-${n.state}`, style: { width: 270 }, draggable: false, selectable: false, connectable: false,
    data: { label: <><strong>{n.title}</strong><small>{n.sub}</small></> },
    sourcePosition: Position.Right, targetPosition: Position.Left,
  }));
  const edges: Edge[] = flow.edges.map((e) => ({
    id: e.id, source: e.from, target: e.to, animated: e.state !== 'live', markerEnd: { type: MarkerType.ArrowClosed, color: COLOUR[e.state] }, style: { stroke: COLOUR[e.state], strokeWidth: 1.6, strokeDasharray: e.state === 'live' ? undefined : '5 4' },
  }));
  return (
    <div className="site-flow" role="group" aria-label="Diagram of how content reaches the site and what is missing">
      <ul className="flow-legend">
        {LEGEND.map((s) => <li key={s}><span className={`flow-dot flow-${s}`} />{STATE_LABEL[s]}</li>)}
      </ul>
      <p className="climb-muted">Read left to right: content you enter in Admin (left) feeds the pages that show it (middle). A dashed line means nothing real is flowing yet. Pages that never get admin data stay on sample copy until officers confirm or replace it (right).</p>
      <div className="site-flow-canvas">
        <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.1 }} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false} zoomOnScroll={false} minZoom={0.3}>
          <Background gap={24} />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
