import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ValueNormalizer } from '$lib/normalizers';
import type { ComponentValueType } from '$app/DatabaseDefinitions';

export const load = (async ({ locals: { supabase } }) => {
	const [{ data: types }, { data: locations }] = await Promise.all([
		supabase.from('component_types').select('*').order('name'),
		supabase.from('locations').select('*').order('name')
	]);

	if (!locations?.length) {
		throw error(503, 'No locations configured');
	}

	return { types, locations };
}) satisfies PageServerLoad;

export const actions = {
	default: async ({ request, locals: { supabase } }) => {
		const {
			data: { user },
			error: userError
		} = await supabase.auth.getUser();
		if (userError) return fail(401, { error: 'Unauthorized' });

		const formData = await request.formData();
		const type_id = formData.get('type_id') as string;
		const family = formData.get('family') as string;
		const manufacturer = formData.get('manufacturer') as string;
		const quantity = parseInt(formData.get('quantity') as string);
		const location_id = formData.get('location_id') as string;
		const rawValue = formData.get('value') as string;

		// Validate required fields
		if (!type_id || !location_id) {
			return fail(400, {
				error: 'Missing required fields'
			});
		}

		try {
			// Get component type for value normalization
			const { data: typeData } = await supabase
				.from('component_types')
				.select('*')
				.eq('id', type_id)
				.single();

			if (!typeData) {
				return fail(400, { error: 'Invalid component type' });
			}

			// Normalize value if component type has value_type
			let normalizedValue = null;
			if (typeData.value_type && rawValue) {
				try {
					normalizedValue = ValueNormalizer.normalizeValue(
						rawValue,
						typeData.value_type as ComponentValueType
					);
				} catch (e) {
					return fail(400, {
						error: `Invalid ${typeData.value_type} value: ${(e as Error).message}`
					});
				}
			}

			// Insert component
			const { error: insertError } = await supabase.from('components').insert({
				type_id,
				family,
				manufacturer,
				quantity,
				location_id,
				user_id: user.id,
				...(normalizedValue && {
					base_value: normalizedValue.base_value,
					display_value: normalizedValue.display_value
				})
			});

			if (insertError) throw insertError;

			return { success: true };
		} catch (e) {
			console.error('Error adding component:', e);
			return fail(500, {
				error: 'Failed to add component'
			});
		}
	}
} satisfies Actions;
