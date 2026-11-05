// Harness: circular deps + clean-architecture layers. Inner layers never import outer ones.
// src/frontend: lib (pure helpers) ← data (content/models) ← components (UI) ← pages (screens) ← App
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },
    { name: 'no-orphans', severity: 'error', from: { orphan: true, path: '^src/frontend', pathNot: ['\\.d\\.ts$', '^src/frontend/main\\.tsx$'] }, to: {} },
    { name: 'lib-is-pure', severity: 'error', from: { path: '^src/frontend/lib' }, to: { path: '^src/frontend/(data|components|pages)|^src/frontend/App' } },
    { name: 'data-has-no-ui', severity: 'error', from: { path: '^src/frontend/data' }, to: { path: '^src/frontend/(components|pages)|^src/frontend/App|^node_modules/react' } },
    { name: 'components-not-pages', severity: 'error', from: { path: '^src/frontend/components' }, to: { path: '^src/frontend/pages|^src/frontend/App' } },
    { name: 'src-not-tests', severity: 'error', from: { path: '^src' }, to: { path: '^tests' } },
    { name: 'no-dev-deps-in-src', severity: 'error', from: { path: '^src' }, to: { dependencyTypes: ['npm-dev'], pathNot: ['node_modules/@types/'] } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    combinedDependencies: true, // backend resolves deps from its own package.json
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'node', 'default'] },
  },
};
