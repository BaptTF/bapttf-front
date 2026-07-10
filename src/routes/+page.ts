import type { PageLoad } from './$types';
import { getFeaturedProjects, getPosts, getProjects, isProjectPost } from '$lib/utils';

export const load: PageLoad = () => {
	const posts = getPosts();
	const projects = getProjects();

	return {
		posts: posts.filter((post) => !isProjectPost(post)).slice(0, 2),
		featuredProjects: getFeaturedProjects(projects)
	};
};
