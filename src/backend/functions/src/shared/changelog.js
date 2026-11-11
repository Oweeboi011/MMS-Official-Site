// Release-note draft: commit subjects grouped by conventional prefix; noise is dropped.
const RELEASE_NOTE_TYPE_LABELS = {
  feat: "New Features",
  fix: "Fixes",
  perf: "Performance",
  refactor: "Improvements",
};
const RELEASE_NOTE_NOISE_TYPES = new Set([
  "docs",
  "style",
  "test",
  "chore",
  "ci",
  "build",
  "revert",
]);

export function groupCommitsIntoChangelog(commits) {
  const groups = {
    "New Features": [],
    Fixes: [],
    Performance: [],
    Improvements: [],
  };
  let dropped = 0;

  for (const { subject } of commits) {
    // Merge commits repeat the PR commits they bring in.
    if (/coverage/i.test(subject) || /^Merge /.test(subject)) {
      dropped++;
      continue;
    }
    // eslint-disable-next-line sonarjs/super-linear-regex -- one commit subject (GitHub, short), not user input
    const match = subject.match(/^(\w+)(\([^)]*\))?:\s*(.+)$/);
    if (match) {
      const [, type, , rest] = match;
      if (RELEASE_NOTE_NOISE_TYPES.has(type)) {
        dropped++;
        continue;
      }
      const label = RELEASE_NOTE_TYPE_LABELS[type];
      if (label) {
        groups[label].push(rest.charAt(0).toUpperCase() + rest.slice(1));
        continue;
      }
    }
    groups["Improvements"].push(
      subject.charAt(0).toUpperCase() + subject.slice(1),
    );
  }

  const sections = Object.entries(groups).filter(([, items]) => items.length > 0);
  const body = sections
    .map(([label, items]) => [label, ...items.map((i) => "- " + i)].join("\n"))
    .join("\n\n");
  return { body, dropped };
}
