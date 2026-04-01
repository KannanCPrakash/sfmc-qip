export interface Field {
    Name: string;
    FieldType: string;
    MaxLength?: number;
    IsPrimaryKey?: boolean;
}

export interface DE {
    Name: string;
    CustomerKey?: string;
    Fields: Field[];
}

export interface Query {
    name: string;
    sql: string;
}

export function normalize(name: string): string {
    return name.toLowerCase()
        .replace(/^ent\./i, '')           // strip ENT. prefix before anything else
        .replace(/_de$|_dataview$/i, '')  // strip _DE / _DataView suffix before underscore removal
        .replace(/[_\-\s\[\]'"]/g, '')   // strip punctuation/whitespace
        .replace(/de$/i, '')              // strip bare DE suffix (e.g. "EmailSendsDE")
        .replace(/dataextension/gi, '')
        .trim();
}

export function extractTables(sql: string): string[] {
    const lower = sql.toLowerCase();
    const tables = new Set<string>();

    const fromJoin = [...lower.matchAll(/(?:from|join)\s+[\[\]`"]?([^,\s\[\]`"]+)[\[\]`"]?/gi)];
    fromJoin.forEach(m => tables.add(normalize(m[1])));

    const subqueries = [...lower.matchAll(/exists\s*\(\s*select.*?from\s+[\[\]`"]?([^,\s\[\]`"]+)[\[\]`"]?/gi)];
    subqueries.forEach(m => tables.add(normalize(m[1])));

    const words = lower.match(/[\w._]+/g) ?? [];
    words.forEach(word => {
        if (word.length > 2 && !['select', 'from', 'join', 'where', 'and', 'or', 'inner', 'left', 'on'].includes(word)) {
            tables.add(normalize(word));
        }
    });

    return Array.from(tables);
}

export function buildGraph(des: DE[], queries: Query[]): { nodes: any[]; edges: any[] } {
    const deNodes: any[] = [];
    const queryNodes: any[] = [];
    const edges: any[] = [];

    // Query nodes + query→DE edges
    queries.forEach((q, idx) => {
        const queryId = `query-${idx}`;
        queryNodes.push({
            id: queryId,
            type: 'default',
            data: { label: `Query: ${q.name}`, sql: q.sql, type: 'Query' },
            position: { x: 0, y: 0 },
            style: { background: '#ea580c', color: 'white', border: '2px solid #f97316' },
        });

        const tables = extractTables(q.sql);
        tables.forEach(tableNorm => {
            const de = des.find(d => normalize(d.Name) === tableNorm);
            if (de) {
                edges.push({
                    id: `${queryId}→de-${de.Name}`,
                    source: queryId,
                    target: `de-${de.CustomerKey || de.Name}`,
                    animated: true,
                    style: { stroke: '#f97316', strokeWidth: 2 },
                    label: 'uses',
                    labelStyle: { fill: '#fff', fontSize: 10 },
                });
            }
        });
    });

    // DE→DE edges (co-occurrence in the same SQL)
    queries.forEach(q => {
        const tables = extractTables(q.sql);
        for (let i = 0; i < tables.length; i++) {
            for (let j = i + 1; j < tables.length; j++) {
                const a = des.find(d => normalize(d.Name) === tables[i]);
                const b = des.find(d => normalize(d.Name) === tables[j]);
                if (a && b) {
                    const edgeId = `de-${a.Name}---de-${b.Name}`;
                    if (!edges.some(e => e.id === edgeId)) {
                        edges.push({
                            id: edgeId,
                            source: `de-${a.CustomerKey || a.Name}`,
                            target: `de-${b.CustomerKey || b.Name}`,
                            style: { stroke: '#8b5cf6', strokeWidth: 3 },
                            animated: false,
                        });
                    }
                }
            }
        }
    });

    // FK count per DE
    const pkConnections = new Map<string, string[]>();
    des.forEach(de => {
        const pkField = de.Fields.find(f =>
            f.IsPrimaryKey ||
            f.Name.toLowerCase().includes('subscriberkey') ||
            f.Name.toLowerCase() === 'contactkey' ||
            f.Name.toLowerCase() === 'subscriberid'
        );
        if (pkField) {
            if (!pkConnections.has(pkField.Name)) { pkConnections.set(pkField.Name, []); }
            pkConnections.get(pkField.Name)!.push(de.Name);
        }
    });

    const deToFkCount = new Map<string, number>();
    des.forEach(de => {
        let count = 0;
        de.Fields.forEach(field => {
            if (pkConnections.has(field.Name)) {
                count += pkConnections.get(field.Name)!.filter(src => src !== de.Name).length;
            }
        });
        deToFkCount.set(de.Name, count);
    });

    // DE nodes
    des.forEach(de => {
        deNodes.push({
            id: `de-${de.CustomerKey || de.Name}`,
            type: 'default',
            data: {
                label: de.Name,
                type: 'DE',
                pkField: de.Fields.find(f => f.IsPrimaryKey)?.Name ?? null,
                fkCount: deToFkCount.get(de.Name) ?? 0,
                fields: de.Fields,
            },
            position: { x: 0, y: 0 },
            style: { background: '#4c1d95', color: 'white', border: '2px solid #8b5cf6' },
        });
    });

    return { nodes: [...deNodes, ...queryNodes], edges };
}
