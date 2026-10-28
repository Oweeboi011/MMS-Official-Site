// Harness: circular deps + clean-architecture layers. Inner layers never import outer ones.
// lib (pure helpers) ← data (content/models) ← components (UI) ← pages (screens) ← App
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    { name: 'no-orphans', severity: 'error', from: { orphan: true, path: '^src', pathNot: ['\\.d\\.ts$', '^src/main\\.tsx$'] }, to: {} },
    { name: 'lib-is-pure', severity: 'error', from: { path: '^src/lib' }, to: { path: '^src/(data|components|pages)|^src/App' } },
    { name: 'data-has-no-ui', severity: 'error', from: { path: '^src/data' }, to: { path: '^src/(components|pages)|^src/App|^node_modules/react' } },
    { name: 'components-not-pages', severity: 'error', from: { path: '^src/components' }, to: { path: '^src/pages|^src/App' } },
    { name: 'src-not-tests', severity: 'error', from: { path: '^src' }, to: { path: '^tests' } },
    { name: 'no-dev-deps-in-src', severity: 'error', from: { path: '^src' }, to: { dependencyTypes: ['npm-dev'], pathNot: ['node_modules/@types/'] } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
