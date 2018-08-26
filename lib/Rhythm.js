"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function mapTree(tree, modifier, simplify, path, siblings, position) {
    if (simplify === void 0) { simplify = false; }
    if (path === void 0) { path = []; }
    if (siblings === void 0) { siblings = []; }
    if (position === void 0) { position = 0; }
    // skip current tree if only one child
    if (simplify && Array.isArray(tree) && tree.length === 1) {
        return mapTree(tree[0], modifier, simplify, path, siblings, position);
    }
    var fraction = siblings.reduce(function (f, d) { return f / d; }, 1);
    if (!Array.isArray(tree)) {
        return modifier ? modifier(tree, { path: path, siblings: siblings, fraction: fraction, position: position }) : tree;
    }
    if (Array.isArray(tree)) {
        siblings = siblings.concat([tree.length]);
        fraction = fraction / tree.length;
        return tree.map(function (subtree, index) {
            return mapTree(subtree, modifier, simplify, path.concat([index]), siblings, position + index * fraction);
        });
    }
}
exports.mapTree = mapTree;
function flattenTree(tree) {
    var flat = [];
    mapTree(tree, function (value, props) { return flat.push(Object.assign(props, { value: value })); });
    return flat;
}
exports.flattenTree = flattenTree;
function expandTree(tree) {
    // TODO
}
exports.expandTree = expandTree;
