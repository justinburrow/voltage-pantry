import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare global {
  namespace App {
		interface Locals {
			supabase: SupabaseClient;
			getSession(): Promise<Session | null>; // Keep for backward compatibility
		}
		interface PageData {
			session: Session | null;
			locations?: Database['public']['Tables']['locations']['Row'][];
		}
		interface Platform {}
	}
}

export {};
