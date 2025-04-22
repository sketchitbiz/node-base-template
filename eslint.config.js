// eslint.config.js
import perfectionist from 'eslint-plugin-perfectionist'

export default [
  perfectionist.configs['recommended-natural'],
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    rules: {
      'perfectionist/sort-array-includes': 'error',
    },
  },
] 