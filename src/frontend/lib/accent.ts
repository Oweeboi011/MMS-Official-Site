// A section's accent colour is a brand token such as var(--navy). As text on a dark surface it needs the lighter
// twin (var(--navy-ink)), so both are set; anything that is not one of the three tokens is used as is.
export const accentVars = (accent: string): Record<string, string> => ({
  '--accent': accent,
  '--accent-ink': accent.replace(/^var\(--(navy|green|red)\)$/, 'var(--$1-ink)'),
});
