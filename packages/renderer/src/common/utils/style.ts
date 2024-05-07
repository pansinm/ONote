import ColorHash from 'color-hash';
export const colorHash = new ColorHash();

export function createTagColorStyle(name: string, color?: string) {
  const _color = color || colorHash.hex(name);
  return {
    color: color,
    background: `linear-gradient(rgba(255,255,255,.8),rgba(255,255,255,.8)),linear-gradient(${_color}, ${_color})`,
  };
}
