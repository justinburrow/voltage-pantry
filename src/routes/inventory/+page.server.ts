import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals: { supabase }, url }) => {
	const {
		data: { user },
		error: userError
	} = await supabase.auth.getUser();
	if (userError || !user) throw error(401, 'Unauthorized');

	const pageSize = 20;
	const page = Number(url.searchParams.get('page') ?? '1');
	const startIndex = (page - 1) * pageSize;

	const query = supabase
		.from('components')
		.select(
			`
      *,
      component_type:component_types!inner (
        name,
        value_type,
        unit
      ),
      location:locations!inner (
        name
      )
    `
		)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false })
		.range(startIndex, startIndex + pageSize - 1);

	const countQuery = supabase
		.from('components')
		.select('*', { count: 'exact', head: true })
		.eq('user_id', user.id);

	try {
		const [{ count }, { data: components, error: componentsError }] = await Promise.all([
			countQuery,
			query
		]);

		if (componentsError) throw componentsError;

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
