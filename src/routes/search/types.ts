import type { Database } from '$app/DatabaseDefinitions';

type ComponentSearchResult = Database['public']['Tables']['components']['Row'] & {
	component_type: Database['public']['Tables']['component_types']['Row'];
	location: Pick<Database['public']['Tables']['locations']['Row'], 'name'>;
};

export interface SearchState {
	query: string;
	typeFilter: string | null;
	useValueRange: boolean;
	minValue: number | null;
	maxValue: number | null;
}

export interface PageData {
	types: Database['public']['Tables']['component_types']['Row'][];
	results: ComponentSearchResult[];
	searchParams: URLSearchParams;
}
