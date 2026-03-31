// FlyoutPanel.tsx
import React, { useEffect, useRef } from 'react';
import { X, Pin, PinOff } from 'lucide-react';
import { SQLEditor } from './SQLEditor';
import { ImpactList } from './ImpactList';
import {
  type Node as FlowNode,
  type Edge as FlowEdge
} from 'reactflow';

interface FlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node: FlowNode | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export function FlyoutPanel({ isOpen, onClose, node, nodes, edges }: FlyoutPanelProps) {
  const [pinned, setPinned] = React.useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const [validationIssues, setValidationIssues] = React.useState<string[] | null>(null);
  
  // Auto-close when clicking outside (unless pinned)
  useEffect(() => {

    if (!isOpen || pinned) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Only proceed if the click target is a DOM Node (not a React Flow Node)
      if (panelRef.current && e.target instanceof Node && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, pinned, onClose]);


  const runValidation = () => {
    const issues: string[] = [];

    // Same checks as before – paste them here as a local function
    if (/;\s*$/m.test(sql)) issues.push('🚨 Trailing semicolon – remove it');
    if (/\/\*/.test(sql) && /\*\//.test(sql)) issues.push('🚨 Block comments detected – use -- instead for Query Studio');
    if (/^\s*\(/m.test(sql)) issues.push('🚨 Starts with ( – Query Studio hates this');
    if (/SELECT\s+\*/i.test(sql)) issues.push('🚨 SELECT * – explicit fields only, please');
    // ... add the rest from previous validator

    const forbidden = ['UPDATE', 'INSERT', 'DELETE', 'SET'];
    forbidden.forEach(word => {
      if (new RegExp(`\\b${word}\\b`, 'i').test(sql)) {
        issues.push(`🚨 Forbidden "${word}" statement`);
      }
    });

    setValidationIssues(issues.length ? issues : []);
  };

  // Uncomment for testing purposes
  // if node is null, create a dummy node for testing
  //if (!node) {    
  // node = {
  //   id: 'dummy',
  //   type: 'query',
  //   data: {
  //     label: 'Dummy Query Node',
  //     sql: 'SELECT * FROM Customers WHERE Country = \'Germany\';',
  //   },
  //   position: { x: 0, y: 0 },
  // };
  //}

  if (!isOpen || !node) return null;

  const isQuery = node.data.type === 'Query';
  const title = isQuery ? node.data.label : `${node.data.label} (Data Extension)`;
  const sql = isQuery ? node.data.sql || '-- No SQL found' : '-- This is a Data Extension';

  return (
    <div
      ref={panelRef}
      className={`absolute right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-950/90 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-100 truncate max-w-60">{title}</span>
          {isQuery && (
            <span className="px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-400/20 rounded-full border border-emerald-400/30">
              VALID
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPinned(!pinned)}
            className="p-2 hover:bg-gray-800 rounded-lg transition group"
          >
            {pinned ? (
              <PinOff className="w-4 h-4 text-gray-400 group-hover:text-gray-200" />
            ) : (
              <Pin className="w-4 h-4 text-gray-500 group-hover:text-gray-100" />
            )}
          </button>
          {!pinned && (
            <button title='btnClose'
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-4 h-4 text-gray-500 hover:text-gray-100" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isQuery && (
          <div className="flex flex-col">
            <div className="flex-1 overflow-hidden">
              <SQLEditor sqlQuery={sql} />
            </div>
            <div className="actions">
              <button onClick={runValidation} className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition duration-150 ease-in-out flex items-center gap-2">
                🔍 Validate This Query
              </button>
            </div>
          </div>
        )}

        {validationIssues !== null && (
          <div className={`mt-4 p-4 rounded-lg border-l-4 ${validationIssues.length === 0 ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
            {validationIssues.length === 0 ? (
              <p className="font-semibold">✅ Query passed basic SFMC checks – ship it!</p>
            ) : (
              <>
                <p className="font-semibold mb-2">Validation Issues Found:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validationIssues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        <div className="border-t border-gray-800">
          <ImpactList node={node} nodes={nodes} edges={edges} />
        </div>
      </div>

      {/* Paste-to-validate footer */}
      {/* {isQuery && (
        <div className="p-4 border-t border-gray-800">
          <button className="w-full py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-500/20">
            Paste New SQL → Validate Instantly           
          </button>
        </div>
      )} */}
    </div>
  );
}