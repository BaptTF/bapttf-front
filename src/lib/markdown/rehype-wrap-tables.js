/** Wrap markdown tables so they can scroll horizontally on narrow viewports. */
export function rehypeWrapTables() {
	return (tree) => {
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
