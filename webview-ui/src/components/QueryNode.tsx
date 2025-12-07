import type { JSX } from "react";
import type { NodeData } from "../model/NodeData";
import { Handle, Position } from "reactflow";

export const QueryNode = (() => {
    return ({ data }: { data: NodeData }): JSX.Element => (
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
    );
})();

