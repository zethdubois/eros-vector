const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', 'host.docker.internal']);

export function requireDatabaseUrl(): URL {
	const value = process.env.DATABASE_URL;
	if (!value) {
		throw new Error('DATABASE_URL is not set');
	}

	try {
		return new URL(value);
	} catch {
		throw new Error('DATABASE_URL is not a valid PostgreSQL URL');
	}
}

export function describeDatabase(url: URL): string {
	const database = url.pathname.replace(/^\//, '') || '(default database)';
	return `${url.hostname}/${database}`;
}

export function assertDatabaseWriteAllowed(url: URL): void {
	if (LOCAL_HOSTS.has(url.hostname)) return;

	if (!process.argv.includes('--production')) {
		throw new Error(
			[
				`Refusing to write to remote database ${describeDatabase(url)}.`,
				'Use the explicit :prod command after verifying DATABASE_URL.'
			].join('\n')
		);
	}

	console.warn(`PRODUCTION DATABASE: ${describeDatabase(url)}`);
}
