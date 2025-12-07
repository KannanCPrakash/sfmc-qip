import type { JSX } from "react";
import type { NodeData } from "../model/NodeData";
import { Handle, Position } from "reactflow";

interface DENodeProps {
    data: NodeData;
}

export const DENode = ({ data }: DENodeProps): JSX.Element => {
    const hasPK = data.pkField;

    return (
        <div
            style={{
                padding: '12px 16px',
                background: '#4c1d95',
                color: 'white',
                borderRadius: 12,
                minWidth: 140,
                textAlign: 'center',
                fontWeight: '600',
                cursor: 'pointer',
                border: hasPK ? '4px solid #f59e0b' : '3px solid #a78bfa',
                boxShadow: hasPK ? '0 0 20px rgba(251, 191, 36, 0.6)' : '0 6px 20px rgba(0,0,0,0.4)',
                position: 'relative'
            }}
        >
            <div style={{ fontSize: 13 }}>{data.label}</div>
            {hasPK && (
                <div style={{ fontSize: 10, color: '#fcd34d', marginTop: 4 }}>
                    Primary Key: {hasPK}
                </div>
            )}
            {(data.fkCount ?? 0) > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        background: '#f59e0b',
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 11,
                        padding: '4px 8px',
                        borderRadius: 20,
                        border: '3px solid #451a03',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.6)'
                    }}
                >
                    {data.fkCount}
                </div>
            )}
            <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>Data Extension</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
};


export default DENode;