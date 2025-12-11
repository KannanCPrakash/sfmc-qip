// ImpactList.tsx (now with real computation)  
import type { Node, Edge } from 'reactflow';

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

  // Compute impact
  const impactedDEs = isQuery ? getImpactedDEs(node) : [];
  const incomingQueries = !isQuery ? getIncomingQueries(node) : [];
  console.log('ImpactList - isQuery:', isQuery, 'impactedDEs:', impactedDEs, 'incomingQueries:', incomingQueries);
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
        !isQuery && (
          <div className="flex-1 p-6 space-y-6 text-gray-300">
            <div>
              <p className="text-4xl font-bold text-indigo-400">{incomingQueries.length}</p>
              <p className="text-sm">Queries read from this DE</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Key Info:</p>
              <ul className="text-xs space-y-1">
                <li>• Fields: {node.data.fields?.length || 'N/A'}</li>
                <li>• Last Modified: {node.data.lastModified || 'Unknown'}</li>
                <li>• Records: {node.data.recordCount || 'N/A'}</li>
                <li>• Primary Key: {node.data.primaryKey || 'SubscriberKey'}</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Incoming Queries:</p>
              <ul className="text-xs space-y-1 max-h-48 overflow-auto">
                {incomingQueries.map((q, i) => (
                  <li key={i}>• {q}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      }
    </div>)
};