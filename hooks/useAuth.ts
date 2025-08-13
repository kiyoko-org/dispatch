import { useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from 'lib/supabase';

type AuthState = {
	user: User | null;
	session: Session | null;
	isLoading: boolean;
};

export function useAuth() {
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		session: null,
		isLoading: true,
	});

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setAuthState({
				user: session?.user ?? null,
				session,
				isLoading: false,
			});
		});

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setAuthState({
					user: session?.user ?? null,
					session,
					isLoading: false,
				});
			}
		);

		// Cleanup subscription
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return {
		user: authState.user,
		session: authState.session,
		isLoading: authState.isLoading,
		signOut: () => supabase.auth.signOut(),
		// You can add more auth methods here as needed
	};
}
