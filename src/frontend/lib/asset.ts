// Prefixes a public-folder path with the Vite base URL.
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
