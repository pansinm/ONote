import type { TreeNode } from '@sinm/react-file-tree';
import { orderBy } from 'lodash';
import { basename } from './uri';

export function sortTreeNodes(treeNodes: TreeNode[]) {
    return orderBy(
        treeNodes,
        (treeNode) => {
            return basename(treeNode.uri);
        },
        'asc',
    );
}