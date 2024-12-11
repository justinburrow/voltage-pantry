import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();

	const { data: locations, error: locationError } = await supabase
		.from('locations')
		.select('*')
		.order('name');

	if (locationError) {
		throw error(500, 'Failed to load locations');
	}

	if (!locations?.length) {
		throw error(503, 'No component locations configured yet - Administrator setup required');
	}

	return {
		supabase,
		locations
	};
};
