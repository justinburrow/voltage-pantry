import { redirect } from '@sveltejs/kit';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event
	});

	event.locals.getSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return session;
	};

	if (!event.url.pathname.startsWith('/login')) {
		const {
			data: { user },
			error: userError
		} = await event.locals.supabase.auth.getUser();
		if (userError || !user) {
			throw redirect(303, '/login');
		}
	}

  return resolve(event, {
		filterSerializedResponseHeaders: (name) => {
			return name === 'content-range';
		}
	});
};
