import * as assert from 'assert';
import { xmlUnescape, extractTag, splitResultBlocks } from '../../sfmc/xmlUtils';

describe('xmlUnescape', () => {
    it('unescapes all standard XML entities', () => {
        assert.strictEqual(xmlUnescape('&lt;SELECT&gt;'), '<SELECT>');
        assert.strictEqual(xmlUnescape('a &amp; b'), 'a & b');
        assert.strictEqual(xmlUnescape('&quot;hello&quot;'), '"hello"');
        assert.strictEqual(xmlUnescape('it&apos;s'), "it's");
    });

    it('unescapes numeric entities for newline and tab', () => {
        assert.strictEqual(xmlUnescape('line1&#xA;line2'), 'line1\nline2');
        assert.strictEqual(xmlUnescape('col1&#x9;col2'), 'col1\tcol2');
    });

    it('unescapes SQL operators embedded in QueryText', () => {
        const encoded = 'WHERE a &lt;&gt; b AND c &gt;= 0 AND d &lt;= 10';
        const decoded = xmlUnescape(encoded);
        assert.strictEqual(decoded, 'WHERE a <> b AND c >= 0 AND d <= 10');
    });

    it('returns plain strings unchanged', () => {
        assert.strictEqual(xmlUnescape('hello world'), 'hello world');
        assert.strictEqual(xmlUnescape(''), '');
    });
});

describe('extractTag', () => {
    it('extracts simple tag content', () => {
        const xml = '<Name>My DE</Name>';
        assert.strictEqual(extractTag(xml, 'Name'), 'My DE');
    });

    it('extracts content from a tag with attributes', () => {
        const xml = '<OverallStatus xsi:type="xsd:string">OK</OverallStatus>';
        assert.strictEqual(extractTag(xml, 'OverallStatus'), 'OK');
    });

    it('extracts multiline content', () => {
        const xml = '<QueryText>SELECT a\nFROM b\nWHERE c = 1</QueryText>';
        assert.strictEqual(extractTag(xml, 'QueryText'), 'SELECT a\nFROM b\nWHERE c = 1');
    });

    it('unescapes XML entities in extracted content', () => {
        const xml = '<QueryText>WHERE a &lt;&gt; b</QueryText>';
        assert.strictEqual(extractTag(xml, 'QueryText'), 'WHERE a <> b');
    });

    it('returns empty string when tag is absent', () => {
        assert.strictEqual(extractTag('<Foo>bar</Foo>', 'Missing'), '');
    });

    it('trims surrounding whitespace from content', () => {
        const xml = '<Name>  padded  </Name>';
        assert.strictEqual(extractTag(xml, 'Name'), 'padded');
    });
});

describe('splitResultBlocks', () => {
    it('returns empty array when no Results blocks exist', () => {
        assert.deepStrictEqual(splitResultBlocks('<Response/>'), []);
    });

    it('extracts a single Results block', () => {
        const xml = '<Root><Results><Name>DE1</Name></Results></Root>';
        const blocks = splitResultBlocks(xml);
        assert.strictEqual(blocks.length, 1);
        assert.ok(blocks[0].includes('<Name>DE1</Name>'));
    });

    it('extracts multiple Results blocks in order', () => {
        const xml = [
            '<Root>',
            '<Results><Name>A</Name></Results>',
            '<Results><Name>B</Name></Results>',
            '<Results><Name>C</Name></Results>',
            '</Root>',
        ].join('');
        const blocks = splitResultBlocks(xml);
        assert.strictEqual(blocks.length, 3);
        assert.ok(blocks[0].includes('A'));
        assert.ok(blocks[1].includes('B'));
        assert.ok(blocks[2].includes('C'));
    });

    it('does not include the <Results> tags themselves', () => {
        const xml = '<Results><Name>X</Name></Results>';
        const blocks = splitResultBlocks(xml);
        assert.ok(!blocks[0].includes('<Results>'));
        assert.ok(!blocks[0].includes('</Results>'));
    });
});
