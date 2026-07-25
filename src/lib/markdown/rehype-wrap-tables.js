/**
 * @typedef {{ type?: string, tagName?: string, children?: HastNode[], properties?: Record<string, unknown> }} HastNode
 */

/** Wrap markdown tables so they can scroll horizontally on narrow viewports. */
export function rehypeWrapTables() {
	/** @param {HastNode} tree */
	return (tree) => {
		/** @param {HastNode} node */
		const walk = (node) => {
			if (!Array.isArray(node.children)) return;

			for (let i = 0; i < node.children.length; i++) {
				const child = node.children[i];
				if (child.type === 'element' && child.tagName === 'table') {
					node.children[i] = {
						type: 'element',
						tagName: 'div',
						properties: { className: ['table-scroll'] },
						children: [child]
					};
				} else {
					walk(child);
				}
			}
		};

		walk(tree);
	};
}
