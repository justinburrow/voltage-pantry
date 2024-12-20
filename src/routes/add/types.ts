import type { PageData as BasePageData } from './$types';
import type { Database } from '$app/DatabaseDefinitions';

export interface PageData extends BasePageData {
	types: Database['public']['Tables']['component_types']['Row'][];
	locations: Database['public']['Tables']['locations']['Row'][];
}

export type ActionData = {
	error?: string;
	success?: boolean;
} | null;

export type ComponentInsert = Database['public']['Tables']['components']['Insert'];