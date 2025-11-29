// src/components/DEGraph.tsx
import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

interface DEGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeClick?: (node: Node) => void;
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  direction = nodes.length > 80 ? 'LR' : 'TB'; // auto-switch
  const nodeWidth = 220;
  const nodeHeight = 90;

  dagreGraph.setGraph({
    rankdir: direction,        // 'TB' = top-to-bottom (recommended)
    nodesep: 80,               // horizontal spacing between nodes
    ranksep: 180,               // vertical spacing between ranks
    marginx: 50,
    marginy: 50,
    ranker: 'tight-tree',      // best for lineage trees
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() * 20, // tiny jitter = prettier
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const nodeTypes = {
  deNode: ({ data }: any) => (
    <div
      style={{
        padding: '12px 16px',
        background: '#4c1d95',
        color: 'white',
        borderRadius: 12,
        border: '3px solid #a78bfa',
        minWidth: 140,
        textAlign: 'center',
        fontWeight: '600',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 13 }}>{data.label}</div>
      <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>Data Extension</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  ),
  queryNode: ({ data }: any) => (
    <div
      style={{
        padding: '12px 16px',
        background: '#ea580c',
        color: 'white',
        borderRadius: 12,
        border: '3px solid #fb923c',
        minWidth: 160,
        textAlign: 'center',
        fontWeight: '600',
        boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
        cursor: 'pointer',
      }}
    >
      <div style={{ fontSize: 12 }}>{data.label}</div>
      <div style={{ fontSize: 9, opacity: 0.8, marginTop: 4 }}>Query Activity</div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  ),
};

const DEGraph: React.FC<DEGraphProps> = ({ initialNodes, initialEdges, onNodeClick }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodeClickHandler = useCallback(
    (_: any, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes.map(n => ({
        ...n,
        type: n.data.type === 'DE' ? 'deNode' : 'queryNode',
      })),
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#0a0a0a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodeTypes={nodeTypes}
        fitView                     // ← THIS IS KEY
        fitViewOptions={{
          padding: 0.25,             // 25% padding around graph
          includeHiddenNodes: false,
          minZoom: 0.2,
          maxZoom: 2,
        }}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="#1a1a1a" gap={20} />
        <Controls
          showZoom={true}
          showFitView={true}        // ← adds "Fit View" button
          showInteractive={true}
        />

        <MiniMap
          nodeColor={(n) => n.data.type === 'DE' ? '#a78bfa' : '#fb923c'}
          zoomable
          pannable
        />
      </ReactFlow>
    </div>
  );
};

export default DEGraph;