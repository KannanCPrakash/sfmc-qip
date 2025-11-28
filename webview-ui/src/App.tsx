import { useEffect, useState } from 'react'
import DEGraph from './components/DEGraph';
import { vscode } from "./utilities/vscode";

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

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
        <h1>SFMC QIP DE Graph</h1>
        <button onClick={() => {
          vscode.postMessage({
            command: "refreshNodesAndEdges",
            text: "refreshNodesAndEdges",
          });
        }}>Refresh Data</button>

        <DEGraph nodes={nodes} edges={edges} />
      </div>

    </>
  )
}

export default App
