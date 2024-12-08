// src/DatabaseDefinitions.ts
export type Database = {
	public: {
		Tables: {
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
		};
	};
};