import type { PageData as BasePageData } from './$types';
import type { Database } from '$app/DatabaseDefinitions';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

export interface PageData extends BasePageData {
	supabase: SupabaseClient<Database>;
	locations: Database['public']['Tables']['locations']['Row'][];
	session: Session | null;
}

export interface ComponentFormData {
	type: string;
	family: string;
	manufacturer: string;
	quantity: number;
	location: string;
	user_id: string;
}
