// src/routes/login/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const session = await locals.getSession();
	if (session) {
		throw redirect(303, '/');
	}
	return {
		session: null
	};
}) satisfies PageServerLoad;