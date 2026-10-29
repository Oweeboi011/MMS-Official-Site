// Harness: bad patterns, banned APIs, complexity (errors); style/naming (warnings). See docs/solution-plan/quality-harness.md.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report', 'test-results', 'src/data/credits.ts', 'src/data/topMountains.ts'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  sonarjs.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,mjs}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // High priority — block.
      complexity: ['error', 12],
      'sonarjs/cognitive-complexity': ['error', 15],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']", message: 'XSS risk. Render text, not HTML.' },
        { selector: "MemberExpression[property.name='innerHTML']", message: 'XSS risk. Use textContent.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'lodash', message: 'Use native JS.' },
            { name: 'moment', message: 'Use Intl / native Date.' },
            { name: 'axios', message: 'Use fetch.' },
          ],
          patterns: [{ group: ['**/node_modules/**'], message: 'Import packages by name.' }],
        },
      ],
      // Low priority — warn only.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'typeLike', format: ['PascalCase'] },
        { selector: 'variable', format: ['camelCase', 'PascalCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
      ],
      // Noisy for data-heavy content files.
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  { files: ['**/*.cjs'], languageOptions: { sourceType: 'commonjs', globals: globals.node } },
  {
    files: ['tests/**', 'scripts/**', '*.config.{ts,js}'],
    rules: { 'sonarjs/no-nested-functions': 'off', 'no-console': 'off' },
  },
);
