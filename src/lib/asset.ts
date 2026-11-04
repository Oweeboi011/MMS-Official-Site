// Prefixes a public-folder path with the deploy base ("/" on Cloudflare Pages, "/<repo>/" on GitHub Pages).
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
