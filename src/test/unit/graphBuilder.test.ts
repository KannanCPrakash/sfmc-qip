import * as assert from 'assert';
import { normalize, extractTables, buildGraph, DE, Query } from '../../graph/graphBuilder';

// ── normalize ────────────────────────────────────────────────────────────────

describe('normalize', () => {
    it('lowercases and strips underscores', () => {
        assert.strictEqual(normalize('My_DE'), 'my');
        assert.strictEqual(normalize('CONTACT_DATA'), 'contactdata');
    });

    it('strips trailing _DE or DE suffix', () => {
        assert.strictEqual(normalize('Subscribers_DE'), 'subscribers');
        assert.strictEqual(normalize('EmailSendsDE'), 'emailsends');
    });

    it('strips ENT. prefix', () => {
        assert.strictEqual(normalize('ENT.Subscribers'), 'subscribers');
        assert.strictEqual(normalize('ent.open_events'), 'openevents');
    });

    it('strips _DataView suffix', () => {
        assert.strictEqual(normalize('Subscribers_DataView'), 'subscribers');
    });

    it('strips the word DataExtension', () => {
        assert.strictEqual(normalize('DataExtension_Contacts'), 'contacts');
    });

    it('strips brackets and quotes', () => {
        assert.strictEqual(normalize('[My Table]'), 'mytable');
        assert.strictEqual(normalize('"quoted"'), 'quoted');
    });

    it('returns empty string for empty input', () => {
        assert.strictEqual(normalize(''), '');
    });
});

// ── extractTables ─────────────────────────────────────────────────────────────

describe('extractTables', () => {
    it('extracts table from a simple FROM clause', () => {
        const tables = extractTables('SELECT * FROM Subscribers');
        assert.ok(tables.includes(normalize('Subscribers')), `got: ${tables}`);
    });

    it('extracts tables from JOIN clauses', () => {
        const sql = 'SELECT a.* FROM TableA a INNER JOIN TableB b ON a.id = b.id';
        const tables = extractTables(sql);
        assert.ok(tables.includes(normalize('TableA')), `got: ${tables}`);
        assert.ok(tables.includes(normalize('TableB')), `got: ${tables}`);
    });

    it('handles ENT. prefix in SQL', () => {
        const sql = 'SELECT * FROM ENT.Subscribers';
        const tables = extractTables(sql);
        assert.ok(tables.includes('subscribers'), `got: ${tables}`);
    });

    it('extracts table from EXISTS subquery', () => {
        const sql = `SELECT id FROM Main WHERE EXISTS (SELECT 1 FROM LookupDE WHERE id = Main.id)`;
        const tables = extractTables(sql);
        assert.ok(tables.includes(normalize('LookupDE')), `got: ${tables}`);
    });

    it('returns an array (not a Set)', () => {
        const result = extractTables('SELECT * FROM Foo');
        assert.ok(Array.isArray(result));
    });
});

// ── buildGraph ────────────────────────────────────────────────────────────────

describe('buildGraph', () => {
    const des: DE[] = [
        {
            Name: 'Subscribers',
            CustomerKey: 'ck-sub',
            Fields: [{ Name: 'SubscriberKey', FieldType: 'Text', IsPrimaryKey: true }],
        },
        {
            Name: 'EmailSends',
            CustomerKey: 'ck-email',
            Fields: [
                { Name: 'SubscriberKey', FieldType: 'Text' },
                { Name: 'SendDate', FieldType: 'Date' },
            ],
        },
        {
            Name: 'Opens',
            CustomerKey: 'ck-opens',
            Fields: [{ Name: 'SubscriberKey', FieldType: 'Text' }],
        },
    ];

    const queries: Query[] = [
        {
            name: 'Email Performance',
            sql: 'SELECT * FROM Subscribers s JOIN EmailSends e ON s.SubscriberKey = e.SubscriberKey',
        },
    ];

    it('creates one DE node per DE', () => {
        const { nodes } = buildGraph(des, []);
        const deNodes = nodes.filter(n => n.data.type === 'DE');
        assert.strictEqual(deNodes.length, 3);
    });

    it('creates one Query node per query', () => {
        const { nodes } = buildGraph(des, queries);
        const queryNodes = nodes.filter(n => n.data.type === 'Query');
        assert.strictEqual(queryNodes.length, 1);
    });

    it('creates query→DE edges for matched tables', () => {
        const { edges } = buildGraph(des, queries);
        const queryEdges = edges.filter(e => e.source === 'query-0');
        // Should have edges to both Subscribers and EmailSends
        assert.ok(queryEdges.length >= 2, `expected ≥2 query edges, got ${queryEdges.length}`);
    });

    it('DE node ids use CustomerKey when available', () => {
        const { nodes } = buildGraph(des, []);
        const subNode = nodes.find(n => n.id === 'de-ck-sub');
        assert.ok(subNode, 'expected node with id de-ck-sub');
    });

    it('returns empty nodes and edges for empty inputs', () => {
        const result = buildGraph([], []);
        assert.deepStrictEqual(result, { nodes: [], edges: [] });
    });

    it('does not duplicate DE→DE co-occurrence edges', () => {
        const twoQueries: Query[] = [
            { name: 'Q1', sql: 'SELECT * FROM Subscribers s JOIN EmailSends e ON s.SubscriberKey = e.SubscriberKey' },
            { name: 'Q2', sql: 'SELECT * FROM EmailSends e JOIN Subscribers s ON e.SubscriberKey = s.SubscriberKey' },
        ];
        const { edges } = buildGraph(des, twoQueries);
        const deDeEdges = edges.filter(e => e.id.includes('---'));
        const ids = deDeEdges.map(e => e.id);
        const unique = new Set(ids);
        assert.strictEqual(ids.length, unique.size, 'duplicate DE→DE edges found');
    });
});
