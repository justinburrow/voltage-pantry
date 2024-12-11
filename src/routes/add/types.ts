import type { PageData as BasePageData } from './$types';
import type { Database } from '$app/DatabaseDefinitions';

export interface PageData extends BasePageData {
	locations: Database['public']['Tables']['locations']['Row'][];
}
