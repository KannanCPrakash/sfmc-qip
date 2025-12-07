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
} from 'reactflow';
import 'reactflow/dist/style.css';
import ELK from 'elkjs/lib/elk.bundled.js';
import { vscode } from "../utilities/vscode";
import { DENode } from './DENode';
import { QueryNode } from './QueryNode';

// Initialize ELK once
const elk = new ELK();

const elkLayoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.baseValue': '100',
  'elk.layered.spacing.nodeNodeBetweenLayers': '120',
  'elk.spacing.nodeNode': '80',
  'elk.layered.nodePlacement.strategy': 'LINEAR_SEGMENTS',     // ← This gives you real 2D grid!
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.crossingMinimization.semiInteractive': 'true',
  'elk.partitioning.activate': 'true',                        // Auto swimlanes by group!
  'elk.layered.thoroughness': '50',
  'elk.edgeRouting': 'ORTHOGONAL',
  'elk.layered.edgeRouting.orthogonal': 'true',
};

const getLayoutedElements = async (nodes: Node[], edges: Edge[]) => {
  const elkNodes = nodes.map(node => ({
    id: node.id,
    width: 240,
    height: 100,
    // Optional: pass group info to ELK for better clustering
    properties: {
      'elk.nodeLabels.placement': 'INSIDE V_CENTER H_CENTER',
    },
  }));

  const elkEdges = edges.map((edge, i) => ({
    id: `e${i}`,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const graph = {
    id: 'root',
    layoutOptions: elkLayoutOptions,
    children: elkNodes,
    edges: elkEdges,
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    return nodes.map(node => {
      const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
      if (!elkNode?.x || !elkNode?.y) {
        console.warn('Node not layouted:', node.id);
        return { ...node, position: { x: 0, y: 0 } };
      }

      return {
        ...node,
        position: {
          x: elkNode.x - (elkNode.width || 240) / 2,
          y: elkNode.y - (elkNode.height || 100) / 2,
        },
      };
    });
  } catch (error) {
    console.error('ELK layout failed', error);
    return nodes.map(n => ({ ...n, position: { x: 0, y: 0 } }));
  }
};

const nodeTypes = {
  DENode,
  QueryNode
};

const DEGraph: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'DE' | 'Query'>('all');
  const [masterNodes, setMasterNodes] = useState<Node[]>([]);
  const [masterEdges, setMasterEdges] = useState<Edge[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLayouting, setIsLayouting] = useState(false);

  const onNodeClickHandler = useCallback(
    (_event: React.MouseEvent | React.TouchEvent, node: Node) => {
      vscode.postMessage({
        command: "nodeClick",
        label: node.data.label
      });
    }, []);

  useEffect(() => {
    const applyLayout = async () => {
      setIsLayouting(true);  // ← Spinner ON
      try {
        const nodesWithType = masterNodes.map(n => ({
          ...n,
          type: n.data.type === 'DE' ? 'deNode' : 'queryNode',
        }));

        const layoutedNodes = await getLayoutedElements(nodesWithType, masterEdges);

        const filteredNodes = layoutedNodes.map(node => {
          const matchesSearch = node.data.label.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesType = filterType === 'all' ||
            (filterType === 'DE' && node.data.type === 'DE') ||
            (filterType === 'Query' && node.data.type === 'Query');

          return {
            ...node,
            hidden: !(matchesSearch && matchesType),
            data: { ...node.data, hidden: !(matchesSearch && matchesType) },
          };
        });

        const visibleNodeIds = new Set(filteredNodes.filter(n => !n.hidden).map(n => n.id));
        const filteredEdges = masterEdges.filter(edge =>
          visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
        );

        setNodes(filteredNodes);
        setEdges(filteredEdges);
      } finally {
        setIsLayouting(false); // ← Spinner OFF
      }
    };

    const onMsg = (event: MessageEvent) => {
      //console.log("Message received from extension:", event.data);
      const message = event.data;
      switch (message.command) {
        case 'updateNodesAndEdges':
          setMasterNodes(message.nodes);
          setMasterEdges(message.edges);
          break;
      }
    };
    window.addEventListener('message', onMsg);
    applyLayout();
    return () => {
      window.removeEventListener('message', onMsg);
    };
  }, [searchTerm, filterType, masterNodes, masterEdges, setNodes, setEdges]);

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
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterType === 'DE'}
            onChange={e => setFilterType(e.target.checked ? 'DE' : 'all')}
          />
          Data Extensions
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ea580c', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterType === 'Query'}
            onChange={e => setFilterType(e.target.checked ? 'Query' : 'all')}
          />
          Queries
        </label>
      </div>

      <button
        onClick={() => {
          setIsLayouting(true);
          vscode.postMessage({
            command: "refreshNodesAndEdges",
            text: "refreshNodesAndEdges",
          });
        }}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
          padding: '10px 20px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}
      // onMouseEnter={e => (e.currentTarget.style.background = '#4f46e5')}
      // onMouseLeave={e => (e.currentTarget.style.background = '#6366f1')}
      >
        Load Sample Data
      </button>

      {
        isLayouting && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 10, 10, 0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5, // lower than the search panel (which uses zIndex: 10)
            backdropFilter: 'blur(4px)',
          }} aria-hidden="true" role="status">
            <div style={{
              width: 64,
              height: 64,
              border: '5px solid #1a1a1a',
              borderTop: '5px solid #a78bfa',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 24,
            }} />
            <div style={{ color: '#a78bfa', fontSize: 16, fontWeight: 600 }}>
              Arranging your data universe...
            </div>
            <style>{`
            @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
            }
          `}</style>
          </div>
        )
      }
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
    </div >
  );
};

export default DEGraph;