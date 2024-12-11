import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	// First wait for parent data to be ready
	const parentData = await parent();
	const { supabase } = parentData;

	const { data: locations, error: locationError } = await supabase
		.from('locations')
		.select('*')
		.order('name');

	if (locationError) {
		console.error('Location loading error:', locationError); // Helps with debugging
		throw error(500, 'Failed to load locations');
	}

	if (!locations?.length) {
		throw error(503, 'No locations configured - Administrator setup required');
	}

	return {
		...parentData, // Important: preserve all parent data
		locations
	};
};