import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;
let browserClientKey: string | null = null;
let serverClientKey: string | null = null;

function resolveSupabaseKey(): string | null {
	const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	const isServer = typeof window === 'undefined';
	if (isServer) {
		if (supabaseServiceRoleKey) {
			return supabaseServiceRoleKey;
		}
		if (process.env.NODE_ENV !== 'test') {
			console.warn(
				'[supabase] SUPABASE_SERVICE_ROLE_KEY is not set. Falling back to anon key; protected mutations may fail due to RLS.'
			);
		}
	}
	return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

function createSupabaseClient(url: string, key: string, persistSession: boolean) {
	return createClient(url, key, {
		auth: {
			persistSession,
		},
	});
}

export function getSupabase(): SupabaseClient | null {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = resolveSupabaseKey();
	if (!supabaseUrl || !supabaseKey) {
		return null;
	}

	const isServer = typeof window === 'undefined';

	if (isServer) {
		if (!serverClient || serverClientKey !== supabaseKey) {
			serverClient = createSupabaseClient(supabaseUrl, supabaseKey, false);
			serverClientKey = supabaseKey;
		}
		return serverClient;
	}

	if (!browserClient || browserClientKey !== supabaseKey) {
		browserClient = createSupabaseClient(supabaseUrl, supabaseKey, true);
		browserClientKey = supabaseKey;
	}

	return browserClient;
}
