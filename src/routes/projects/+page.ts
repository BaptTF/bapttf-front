import type { PageLoad } from './$types';
import { getProjects } from '$lib/utils';

export const load: PageLoad = () => {
	const projects = getProjects();
	return { projects };
};
