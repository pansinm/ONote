import { sortTreeNodes } from '../treeNode';

it('sortTreeNodes', () => {
    const uris = sortTreeNodes([{ type: 'directory', 'uri': 'file:///的' }, { type: 'file', uri: 'file:///a' }]).map(a => a.uri);
    expect(uris).toEqual(['file:///a', 'file:///的']);
});