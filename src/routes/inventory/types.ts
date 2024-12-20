import type { PageData as BasePageData } from './$types';
import type { Database } from '$app/DatabaseDefinitions';

type ComponentWithRelations = Database['public']['Tables']['components']['Row'] & {
	component_type: Database['public']['Tables']['component_types']['Row'];
	location: Pick<Database['public']['Tables']['locations']['Row'], 'name'>;
};

export interface PageData extends BasePageData {
	components: ComponentWithRelations[];
	totalCount: number;
	pageSize: number;
	currentPage: number;
}
