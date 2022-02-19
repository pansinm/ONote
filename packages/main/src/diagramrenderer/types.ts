export interface Diagram {
  mime: 'image/svg+xml' | 'image/png' | 'image/jpeg';
  base64: string;
}

export interface IDiagramRenderer {
  render(): Promise<Diagram>;
}
