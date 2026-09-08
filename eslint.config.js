import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';

export default [{
  files: ['src/**/*.{js,jsx}'],
  languageOptions: {
    ecmaVersion: 'latest', sourceType: 'module',
    parserOptions: { ecmaFeatures: { jsx: true } },
  },
  plugins: { react, 'react-hooks': hooks },
  rules: {
    'react/jsx-key': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}];
