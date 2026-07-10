import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

import { getPosts } from '$lib/utils';

export const entries = () => getPosts().map((post) => ({ slug: post.slug }));

export const load: PageLoad = async ({ params }) => {
	try {
		const post = await import(`../../../posts/${params.slug}.md`);
		return {
			content: post.default,
			meta: post.metadata
		};
	} catch {
		error(404, 'Not found');
	}
};
