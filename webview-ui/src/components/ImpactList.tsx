// ImpactList.tsx (now with real computation)  
import type { Node, Edge } from 'reactflow';
import type { NodeField } from '../model/NodeField';

interface ImpactListProps {
  node: Node;
  nodes: Node[];
  edges: Edge[];
}

export function ImpactList({ node, nodes, edges }: ImpactListProps) {
  if (!node) return null;

  const isQuery = node.data.type === 'Query';

  // Helper: get all target DEs this query writes to
  const getImpactedDEs = (queryNode: Node) => {
    return edges
      .filter(edge => edge.source === queryNode.id) // outgoing edges from query
      .map(edge => edge.target)                     // target node IDs
      .map(targetId => nodes.find(n => n.id === targetId))
      .filter(Boolean)
      .filter(n => n?.data.type === 'DE')
      .map(n => n?.data?.label || n?.data?.name || 'Unnamed DE');
  };

  // Helper: get all queries that read from this DE
  const getIncomingQueries = (deNode: Node) => {
    return edges
      .filter(edge => edge.target === deNode.id) // incoming edges to DE
      .map(edge => edge.source)
      .map(sourceId => nodes.find(n => n.id === sourceId))
      .filter(Boolean)
      .filter(n => n?.data.type === 'Query')
      .map(n => n?.data?.label || n?.data?.name || 'Unnamed Query');
  };

  // Compute writes too
  const outgoingQueries = edges
    .filter(e => e.source === node.id)
    .map(e => nodes.find(n => n.id === e.target))
    .filter(n => n?.type === 'query')
    .map(n => n?.data?.label);

  // Temp field usage (replace with real Fuse.js index Thu)
  const getFieldUsage = (field: NodeField) => {

    const fieldLower = field.Name.toLowerCase();

    // Pre-index nodes by label (do this once outside if possible)
    const nodeByLabel = new Map(
      nodes.map(n => [n.data.label, n])
    );

    let count = 0;

    for (const q of incomingQueries) {
      const node = nodeByLabel.get(q);
      const sql = node?.data.sql;
      if (typeof sql !== "string") continue;

      if (sql.toLowerCase().includes(fieldLower)) {
        count++;
      }
    }

    return count;
  };


  // Compute impact
  const impactedDEs = isQuery ? getImpactedDEs(node) : [];
  const incomingQueries = !isQuery ? getIncomingQueries(node) : [];

  return (
    <div>
      {
        isQuery && (
          <div className="border-t border-gray-800">
            <div className="p-4 bg-gray-950/50">
              <p className="text-sm font-medium text-gray-300 mb-2">
                Impact: {impactedDEs.length > 0 ? (
                  <span className="text-red-400 font-bold">Breaks {impactedDEs.length} Data Extensions</span>
                ) : (
                  <span className="text-green-400 font-bold">No downstream breaks</span>
                )}
              </p>
              {impactedDEs.length > 0 && (
                <ul className="text-xs text-gray-400 space-y-1 max-h-32 overflow-auto">
                  {impactedDEs.map((de, i) => (
                    <li key={i}>• {de}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )
      }

      {/* DE impact section */}
      {
        // !isQuery && (
        //   <div className="flex-1 p-6 space-y-6 text-gray-300">
        //     <div>
        //       <p className="text-4xl font-bold text-indigo-400">{incomingQueries.length}</p>
        //       <p className="text-sm">Queries read from this DE</p>
        //     </div>

        //     <div className="space-y-2">
        //       <p className="text-sm font-medium">Key Info:</p>
        //       <ul className="text-xs space-y-1">
        //         <li>• Fields: {node.data.fields?.length || 'N/A'}</li>
        //         <li>• Last Modified: {node.data.lastModified || 'Unknown'}</li>
        //         <li>• Records: {node.data.recordCount || 'N/A'}</li>
        //         <li>• Primary Key: {node.data.primaryKey || 'SubscriberKey'}</li>
        //       </ul>
        //     </div>

        //     <div className="space-y-2">
        //       <p className="text-sm font-medium">Incoming Queries:</p>
        //       <ul className="text-xs space-y-1 max-h-48 overflow-auto">
        //         {incomingQueries.map((q, i) => (
        //           <li key={i}>• {q}</li>
        //         ))}
        //       </ul>
        //     </div>
        //   </div>
        // )
      }

      {!isQuery && (
        <div className="flex-1 p-6 space-y-6 text-gray-300 overflow-auto">
          {/* Hero Stats */}
          <div className="flex items-center gap-8">
            <div>
              <p className="text-5xl font-bold text-indigo-400">{incomingQueries.length}</p>
              <p className="text-sm">Queries read from</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-red-400">{outgoingQueries.length}</p>
              <p className="text-sm">Queries write to</p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{node.data.createdDate || 'N/A'}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Modified</p>
              <p className="font-medium">{node.data.lastModified || 'N/A'}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Owner</p>
              <p className="font-medium">{node.data.owner || 'N/A'}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Rows</p>
              <p className="font-medium">{node.data.recordCount?.toLocaleString() || 'N/A'}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Category</p>
              <p className="font-medium">{node.data.category?.toLocaleString() || 'Uncategorized'}</p>
            </div>
            <div className="bg-gray-800/50 p-3 rounded">
              <p className="text-gray-500">Primary Key</p>
              <p className="font-medium">{node.data.primaryKey?.toLocaleString() || 'N/A'}</p>
            </div>
          </div>

          {/* New: Sendable / Testable */}
          <div className="flex gap-4">
            <div className="px-3 py-1 rounded bg-gray-800 text-sm">
              Sendable: {node.data.isSendable ? '✅ Yes' : 'No'}
            </div>
            <div className="px-3 py-1 rounded bg-gray-800 text-sm">
              Testable: {node.data.isTestable ? '✅ Yes' : 'No'}
            </div>
          </div>

          {/* New: Fields list */}
          {/* <div className="space-y-2"> 
            <p className="text-sm font-medium">Fields ({node.data.fields?.length || 0})</p>
            {node.data.fields?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {node.data.fields.map((field: NodeField, i: number) => (
                  <div key={i} className="bg-gray-800 p-2 rounded">
                    <span className="font-mono text-blue-300">{field.Name}</span>
                    <span className="text-gray-500 ml-2">({field.FieldType})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No fields loaded yet</p>
            )}
          </div> */}

          {/* Field Risks */}
          <div className="space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              High-Impact Fields
              {node.data.fields?.length > 20 && <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">20+ fields — review for bloat</span>}
            </p>
            <ul className="text-xs space-y-1.5 max-h-40 overflow-auto">
              {node.data.fields?.slice(0, 15).map((field: NodeField, i: number) => {
                const usage = getFieldUsage(field); // implement below
                return (
                  <li key={i} className="flex justify-between items-center">
                    <span>• {field.Name}</span>
                    {usage > 10 && <span className="text-red-400 text-xs">Used in {usage} queries ⚠️</span>}
                  </li>
                );
              }) || <li className="text-gray-500">No fields loaded</li>}
            </ul>
            {node.data.fields?.length > 15 && <p className="text-xs text-gray-500">... +{node.data.fields.length - 15} more</p>}
          </div>

          {/* Incoming Queries List */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Incoming Queries ({incomingQueries.length}):</p>
            <ul className="text-xs space-y-1 max-h-32 overflow-auto">
              {incomingQueries.map((q, i) => <li key={i}>• {q}</li>)}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-800">
            <button className="flex-1 py-2 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-500 transition">
              Open in SFMC
            </button>
            <button className="flex-1 py-2 text-xs font-medium text-gray-300 bg-gray-800 rounded hover:bg-gray-700 transition">
              Copy CustomerKey
            </button>
          </div>
        </div>
      )}
    </div>)
};