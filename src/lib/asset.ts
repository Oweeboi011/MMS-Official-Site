// Prefixes a public-folder path with the deploy base ("/" on Vercel, "/<repo>/" on GitHub Pages).
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
