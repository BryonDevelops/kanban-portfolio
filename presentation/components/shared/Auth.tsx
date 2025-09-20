"use client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { getSupabase } from '../../../infrastructure/database/supabaseClient';

export default function AuthComponent() {
  const client = getSupabase();
  if (!client) {
    return (
      <div className="p-4 text-sm text-yellow-700 bg-yellow-50 rounded">
        Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable.
      </div>
    );
  }
  return (
    <Auth
      supabaseClient={client}
      appearance={{ theme: ThemeSupa }}
      providers={["google", "github"]}
    />
  );
}
