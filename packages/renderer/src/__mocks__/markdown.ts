// Mock for markdown module to avoid ESM issues with unified/remark
export function html2md(html: string): string {
  // Simple HTML to markdown conversion for testing
  if (html.includes('<ul>') && html.includes('<li>')) {
    const match = html.match(/<li>(.*?)<\/li>/);
    return match ? `- ${match[1]}` : '';
  }
  if (html.includes('<mark')) {
    const match = html.match(/<mark[^>]*>(.*?)<\/mark>/);
    return match ? `:mark[${match[1]}]` : '';
  }
  return html;
}

export function parse(markdown: string) {
  return { type: 'root', children: [] };
}

export function stringify(node: any): string {
  return '';
}

export function getText(node: any): string {
  return '';
}

export function traverse(node: any, indicator: any) {}

export function html2Mdast(html: string) {
  return parse('');
}
