export function mapTree(
    tree,
    modifier?,
    simplify = false,
    path = [],
    siblings = [],
    position = 0) {
    // skip current tree if only one child
    if (simplify && Array.isArray(tree) && tree.length === 1) {
        return mapTree(
            tree[0], modifier, simplify,
            path, siblings, position
        );
    }

    let fraction = siblings.reduce((f, d) => f / d, 1);
    if (!Array.isArray(tree)) {
        return modifier ? modifier(tree, { path, siblings, fraction, position }) : tree;
    }
    if (Array.isArray(tree)) {
        siblings = siblings.concat([tree.length]);
        fraction = fraction / tree.length;
        return tree.map((subtree, index) =>
            mapTree(
                subtree, modifier, simplify,
                path.concat([index]),
                siblings,
                position + index * fraction
            )
        )
    }
}

export function flattenTree(tree) {
    const flat = []
    mapTree(tree, (value, props) => flat.push(Object.assign(props, { value })));
    return flat;
}

export function expandTree(tree) {
    // TODO
}