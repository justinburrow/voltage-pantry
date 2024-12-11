import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { getSession, supabase } }) => {
  const session = await getSession();
	return { session };
};
