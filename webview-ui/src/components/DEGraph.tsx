// src/components/DEGraph.tsx
import React, { useCallback, useEffect, useState } from 'react';
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

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph(
    {
      multigraph: true,
      compound: true
    }
  );

  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // 1. Force vertical layout + way more generous spacing
  dagreGraph.setGraph({
    rankdir: 'TB',          // Top → Bottom = vertical scrolling (sanity restored)
    ranksep: 120,           // vertical distance between ranks
    nodesep: 50,            // horizontal distance between nodes in same rank
    edgesep: 20,

    // 2. This is the secret sauce most people miss
    ranker: 'longest-path', // instead of default 'network-simplex'
    // longest-path creates much tighter, more logical groups
    // and prevents the “everyone on two lines” disease

    // 3. Align nodes nicely inside each rank
    align: 'UL',            // Upper-Left alignment = neat columns instead of zigzag
    //compound: true,        // Enable compound nodes for clustering THIS UNLOCKS setParent()
  });

  dagreGraph.setDefaultNodeLabel(() => ({ width: 180, height: 60 }));
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  //4. Pre-processing: add dummy “cluster anchor” nodes (2 lines of code!)
  function addClusterAnchors(nodes: Node[], g: dagre.graphlib.Graph): void {
    const clusters: Record<string, string> = {};

    nodes.forEach((node: Node) => {
      // Simple heuristic — group by prefix or folder (you probably already have this logic)
      const group = node.id.startsWith('DE_')
        ? node.id.split('_')[1].split('-')[0]            // e.g. DE_Segmentation → "Segmentation"
        : (node.data as any).folder || 'Queries';        // or use your real folder name

      if (!clusters[group]) {
        clusters[group] = `cluster_${group}`;
        // Invisible anchor node that forces everything in the group to stay together
        g.setNode(clusters[group], {
          cluster: true,
          width: 0, height: 0,
          style: 'opacity:0',
          label: ''
        });
      }
      console.log(`${JSON.stringify(clusters)}`)
      // Parent the real node to the invisible anchor
      g.setParent(node.id, clusters[group]);
    });
  }

  nodes.forEach(node => {
    dagreGraph.setNode(node.id, { width: 220, height: 90 });
  });
  edges.forEach(edge => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  addClusterAnchors(nodes, dagreGraph);
  dagre.layout(dagreGraph);

  return nodes.map(node => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      position: { x: x - 110, y: y - 45 },
      // We'll control visibility with `hidden` instead of removing
    };
  });
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'DE' | 'Query'>('all');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onNodeClickHandler = useCallback(
    (_: any, node: Node) => {
      onNodeClick?.(node);
    },
    [onNodeClick]
  );

  useEffect(() => {
    // 1. Apply layout to ALL nodes first (stable positions)
    const layoutedNodes = getLayoutedElements(
      initialNodes.map(n => ({
        ...n,
        type: n.data.type === 'DE' ? 'deNode' : 'queryNode',
      })),
      initialEdges
    );

    // 2. Then filter visibility (but keep positions!)
    const filteredNodes = layoutedNodes.map(node => {
      const matchesSearch = node.data.label.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || node.data.type === (filterType === 'DE' ? 'deNode' : 'queryNode');
      const isVisible = matchesSearch && matchesType;

      return {
        ...node,
        hidden: !isVisible,
        data: { ...node.data, hidden: !isVisible },
      };
    });

    // 3. Hide edges that connect only hidden nodes
    const visibleNodeIds = new Set(filteredNodes.filter(n => !n.hidden).map(n => n.id));
    const filteredEdges = initialEdges.filter(edge =>
      visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
    );

    setNodes(filteredNodes);
    setEdges(filteredEdges);

  }, [searchTerm, filterType, initialNodes, initialEdges]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#0a0a0a' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', gap: 12, background: '#111', padding: 12, borderRadius: 12, border: '1px solid #333' }}>
        <input
          type="text"
          placeholder="Search nodes (e.g. SubscriberKey)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ padding: '10px', borderRadius: 8, border: '1px solid #444', background: '#1e1e1e', color: 'white', width: 260, fontSize: 14 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterType === 'all'}
            onChange={e => setFilterType(e.target.checked ? 'all' : 'all')}
          />
          All
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterType === 'DE'}
            onChange={e => setFilterType(e.target.checked ? 'DE' : 'all')}
          />
          Data Extensions
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterType === 'Query'}
            onChange={e => setFilterType(e.target.checked ? 'Query' : 'all')}
          />
          Queries
        </label>
      </div>
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
          maxZoom: 5,
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