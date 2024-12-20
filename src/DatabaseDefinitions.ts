export type ComponentValueType = 'capacitance' | 'resistance' | 'switch' | 'voltage' | 'current';

export type ProjectComponent = {
	component_id: string;
	quantity_needed: number;
	priority?: 1 | 2 | 3 | 4 | 5;
	notes?: string;
};

export type Database = {
	public: {
		Tables: {
			component_types: {
				Row: {
					id: string;
					name: string;
					value_type: ComponentValueType | null;
					unit: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					value_type?: ComponentValueType | null;
					unit?: string | null;
				};
				Update: {
					name?: string;
					value_type?: ComponentValueType | null;
					unit?: string | null;
				};
			};
			components: {
				Row: {
					id: string;
					type_id: string;
					family: string | null;
					manufacturer: string | null;
					quantity: number;
					location_id: string;
					user_id: string;
					base_value: number | null;
					display_value: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					type_id: string;
					family?: string | null;
					manufacturer?: string | null;
					quantity?: number;
					location_id: string;
					user_id: string;
					base_value?: number | null;
					display_value?: string | null;
				};
				Update: {
					type_id?: string;
					family?: string | null;
					manufacturer?: string | null;
					quantity?: number;
					location_id?: string;
					base_value?: number | null;
					display_value?: string | null;
				};
			};
			locations: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
				};
				Update: {
					name?: string;
					description?: string | null;
				};
			};
			projects: {
				Row: {
					id: string;
					name: string;
					user_id: string;
					components: ProjectComponent[];
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					user_id: string;
					components?: ProjectComponent[];
				};
				Update: {
					name?: string;
					components?: ProjectComponent[];
				};
			};
		};
		Functions: {
			search_components_fuzzy: {
				Args: {
					search_query: string;
					similarity_threshold?: number;
				};
				Returns: Array<Database['public']['Tables']['components']['Row']>;
			};
		};
	};
};

// Utility types for enhanced type safety
export type ComponentWithType = Database['public']['Tables']['components']['Row'] & {
	component_type: Database['public']['Tables']['component_types']['Row'];
};

export type ProjectWithComponents = Database['public']['Tables']['projects']['Row'] & {
	resolved_components?: Array<ComponentWithType>;
};

export type ComponentSearchResult = ComponentWithType;