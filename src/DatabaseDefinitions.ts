export type ComponentValueType = 'capacitance' | 'resistance' | 'switch' | 'voltage' | 'current';

export type Database = {
	public: {
		Tables: {
			component_types: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					value_type: ComponentValueType | null;
					unit: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					value_type?: ComponentValueType | null;
					unit?: string | null;
				};
				Update: {
					name?: string;
					description?: string | null;
					value_type?: ComponentValueType | null;
					unit?: string | null;
				};
			};
			normalized_values: {
				Row: {
					id: string;
					component_id: string;
					base_value: number;
					display_value: string;
					value_type: ComponentValueType;
					unit: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					component_id: string;
					base_value: number;
					display_value: string;
					value_type: ComponentValueType;
					unit: string;
				};
				Update: {
					base_value?: number;
					display_value?: string;
					value_type?: ComponentValueType;
					unit?: string;
				};
			};
			components: {
				Row: {
					id: string;
					type: string;
					family: string;
					manufacturer: string;
					quantity: number;
					location: string;
					user_id: string;
					created_at: string;
					updated_at: string;
					normalized_value?: {
						base_value: number;
						display_value: string;
						value_type: ComponentValueType;
						unit: string;
					};
				};
				Insert: {
					type: string;
					family: string;
					manufacturer?: string;
					quantity?: number;
					location?: string;
					user_id: string;
				};
				Update: {
					type?: string;
					family?: string;
					manufacturer?: string;
					quantity?: number;
					location?: string;
					user_id?: string;
				};
			};
			resistor_specs: {
				Row: {
					id: string;
					component_id: string;
					resistance: number;
					wattage: number;
					tolerance: number;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					component_id: string;
					resistance: number;
					wattage: number;
					tolerance: number;
				};
				Update: {
					resistance?: number;
					wattage?: number;
					tolerance?: number;
				};
			};
			locations: {
				Row: {
					id: string;
					name: string;
					description: string;
					created_at: string;
					updated_at: string;
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
			search_components_by_value: {
				Args: {
					value_type: ComponentValueType;
					min_value: number;
					max_value: number;
				};
				Returns: Array<
					Omit<Database['public']['Tables']['components']['Row'], 'normalized_value'> & {
						base_value: number;
						display_value: string;
					}
				>;
			};
		};
	};
};

// Utility types for component operations
export type ComponentWithValue = Database['public']['Tables']['components']['Row'] & {
	normalized_value: NonNullable<
		Database['public']['Tables']['components']['Row']['normalized_value']
	>;
};

export type ComponentSearchResult = Database['public']['Tables']['components']['Row'] & {
	normalized_value?: Database['public']['Tables']['normalized_values']['Row'];
};
