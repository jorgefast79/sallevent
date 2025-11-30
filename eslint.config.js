// eslint.config.js
import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'

export default [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'warn',
      'prettier/prettier': 'error'
    },
    files: ['**/*.js'],
    plugins: { prettier }
  }
]
