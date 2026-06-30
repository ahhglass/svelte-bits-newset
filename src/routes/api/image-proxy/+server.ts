import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED_HOSTS = new Set(['i.pinimg.com', 'pinimg.com']);

export const GET: RequestHandler = async ({ url, fetch }) => {
	const target = url.searchParams.get('url');
	if (!target) error(400, 'Missing url parameter');

	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		error(400, 'Invalid url');
	}

	if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.has(parsed.hostname)) {
		error(403, 'Host not allowed');
	}

	const response = await fetch(parsed.href, {
		headers: { 'User-Agent': 'SvelteBits-Demo/1.0' }
	});

	if (!response.ok) error(response.status, 'Upstream fetch failed');

	const contentType = response.headers.get('content-type') ?? 'image/jpeg';
	const body = await response.arrayBuffer();

	return new Response(body, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
