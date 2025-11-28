// components/DEGraph.tsx
import React from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from 'reactflow';
import type { Node, Edge, FitViewOptions } from 'reactflow';
import 'reactflow/dist/style.css';

interface DEGraphProps {
  nodes: Node[];
  edges: Edge[];
}

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeColor = (node: Node) => {
  return node.data.isDataView ? '#ef4444' : '#8b5cf6';
};

const DEGraph: React.FC<DEGraphProps> = ({ nodes, edges }) => {
  return (
    <div style={{ width: '100%', height: '100vh', background: '#1a1a1a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#333" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={nodeColor}
          nodeStrokeWidth={3}
          maskColor="rgba(0, 0, 0, 0.8)"
          style={{ background: '#111' }}
        />
      </ReactFlow>
    </div>
  );
};

export default DEGraph;