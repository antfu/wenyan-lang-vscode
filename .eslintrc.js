module.exports = {
  root: true,
  extends: '@antfu/eslint-config-ts',
  rules: {
    '@typescript-eslint/no-empty-function': 'off',
    'no-useless-escape': 'off',
    'no-cond-assign': 'off'
  },
  env: {
    jest: true
  }
}
