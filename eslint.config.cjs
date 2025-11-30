// eslint.config.cjs

const js = require('@eslint/js')
const prettierPlugin = require('eslint-plugin-prettier')

module.exports = [
  js.configs.recommended,

  {
    files: ['**/*.js'],

    plugins: {
      prettier: prettierPlugin
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        Vue: 'readonly',
        $: 'readonly',
        jQuery: 'readonly',
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        data_admin: 'readonly',
        data_salon: 'readonly',
        data_customers: 'readonly',
        total_reservations: 'readonly',
        data_services: 'readonly'
      }
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'warn',
      'prettier/prettier': 'error'
    }
  }
]
