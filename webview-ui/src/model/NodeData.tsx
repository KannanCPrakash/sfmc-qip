 import type { NodeField } from './NodeField';
 
 export type NodeData = {
    id: string;
    label: string;
    type?: 'DE' | 'Query' | string;
    fields?: NodeField[];
    pkField?: string;
    fkCount?: number;
    fieldCount?: number;
    // allow additional unknown properties from incoming data
    [key: string]: unknown;
  };