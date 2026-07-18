// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { AccessRole } from '$lib/server/access';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			accessRole: AccessRole | null;
			visitorId: string | null;
			sessionId: string | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
