// FlyoutPanel.tsx
import React, { useEffect, useRef } from 'react';
import { X, Pin, PinOff } from 'lucide-react';
import type { Node as FlowNode } from 'reactflow';
import { SQLEditor } from './SQLEditor';
import { ImpactList } from './ImpactList';

interface FlyoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node: FlowNode | null;
}

export function FlyoutPanel({ isOpen, onClose, node }: FlyoutPanelProps) {
  const [pinned, setPinned] = React.useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-close when clicking outside (unless pinned)
  useEffect(() => {
    if (!isOpen || pinned) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, pinned, onClose]);

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

  if (!isOpen || !node ) return null;

  const isQuery = node.type === 'query';
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
        {isQuery ? (
          <>
            <div className="flex-1 overflow-hidden">
              <SQLEditor sql={sql} />
            </div>
            <div className="border-t border-gray-800">
              <ImpactList />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <div className="text-5xl font-bold text-indigo-400 mb-2">47</div>
              <div className="text-gray-400">queries touch this DE</div>
              <div className="text-xs text-gray-600 mt-6">Full details next week 🔥</div>
            </div>
          </div>
        )}
      </div>

      {/* Paste-to-validate footer */}
      {isQuery && (
        <div className="p-4 border-t border-gray-800">
          <button className="w-full py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition shadow-lg shadow-indigo-500/20">
            Paste New SQL → Validate Instantly
          </button>
        </div>
      )}
    </div>
  );
}