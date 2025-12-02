import { useEffect, useState } from 'react'
import DEGraph from './components/DEGraph';
import { vscode } from "./utilities/vscode";
import {
  type Node,
} from 'reactflow';
function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleNodeClick = (node: Node) => {
    vscode.postMessage({
      command: "nodeClick",
      label: node.data.label
    });
  }

  useEffect(() => {
    const onMsg = (event: MessageEvent) => {
      //console.log("Message received from extension:", event.data);
      const message = event.data;
      switch (message.command) {
        case 'updateNodesAndEdges':
          setNodes(message.nodes);
          setEdges(message.edges);
          break;
      }
    };
    window.addEventListener('message', onMsg);
    return () => {
      window.removeEventListener('message', onMsg);

    };
  }, []);

  return (
    <>
      <div>
        <h1>SFMC Query Intelligence Platform DE Graph</h1>
        
        <button onClick={() => {
          vscode.postMessage({
            command: "refreshNodesAndEdges",
            text: "refreshNodesAndEdges",
          });
        }}>Load Sample Data</button>

        <DEGraph initialNodes={nodes} initialEdges={edges} onNodeClick={handleNodeClick} />
      </div>

    </>
  )
}

export default App
