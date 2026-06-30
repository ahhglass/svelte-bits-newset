export function isCrossOriginImage(src: string): boolean {
	try {
		return new URL(src, window.location.href).origin !== window.location.origin;
	} catch {
		return true;
	}
}

/** Same-origin proxy for external images (WebGL textures, `<img>`, canvas). */
export function resolveWebGLImageUrl(src: string): string {
	try {
		const url = new URL(src, window.location.href);
		if (url.origin === window.location.origin) return src;
		return `/api/image-proxy?url=${encodeURIComponent(src)}`;
	} catch {
		return src;
	}
}

export const resolveProxiedImageUrl = resolveWebGLImageUrl;

export function loadWebGLImage(src: string): HTMLImageElement {
	const resolved = resolveWebGLImageUrl(src);
	const img = new Image();
	if (isCrossOriginImage(resolved)) img.crossOrigin = 'anonymous';
	img.src = resolved;
	return img;
}
