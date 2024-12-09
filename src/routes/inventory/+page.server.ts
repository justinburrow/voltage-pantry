import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session?.user) throw error(401, 'Unauthorized');

	const pageSize = 20;
	const page = Number(url.searchParams.get('page') ?? '1');
	const startIndex = (page - 1) * pageSize;

	try {
		const [{ count }, { data: components }] = await Promise.all([
			// Get total count
			locals.supabase
				.from('components')
				.select('*', { count: 'exact', head: true })
				.eq('user_id', session.user.id),

			// Get paginated data with component types
			locals.supabase
				.from('components')
				.select(
					`
                    *,
                    component_types (
                        name,
                        description
                    ),
                    resistor_specs (*)
                `
				)
				.eq('user_id', session.user.id)
				.order('created_at', { ascending: false })
				.range(startIndex, startIndex + pageSize - 1)
		]);

		return {
			components: components ?? [],
			totalCount: count ?? 0,
			pageSize,
			currentPage: page
		};
	} catch (err) {
		console.error('Error loading inventory:', err);
		throw error(500, 'Error loading inventory');
	}
}) satisfies PageServerLoad;
