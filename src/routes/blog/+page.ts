import type { PageLoad } from './$types';
import { getPosts, isProjectPost } from '$lib/utils';

export const load: PageLoad = () => {
	const posts = getPosts();
	return { posts: posts.filter((post) => !isProjectPost(post)) };
};
