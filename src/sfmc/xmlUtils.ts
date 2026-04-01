export function xmlUnescape(str: string): string {
    return str
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&#xA;/g, '\n')
        .replace(/&#x9;/g, '\t');
}

export function extractTag(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`);
    const match = xml.match(regex);
    return match ? xmlUnescape(match[1].trim()) : '';
}

export function splitResultBlocks(xml: string): string[] {
    const blocks: string[] = [];
    const open = '<Results>';
    const close = '</Results>';
    let pos = 0;
    while (true) {
        const start = xml.indexOf(open, pos);
        if (start === -1) { break; }
        const end = xml.indexOf(close, start);
        if (end === -1) { break; }
        blocks.push(xml.substring(start + open.length, end));
        pos = end + close.length;
    }
    return blocks;
}
