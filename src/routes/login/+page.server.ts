import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const {
		data: { user },
		error: userError
	} = await locals.supabase.auth.getUser();
	if (user) {
		throw redirect(303, '/');
	}

	return {
		session: null
	};
}) satisfies PageServerLoad;
