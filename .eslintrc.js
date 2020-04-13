module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "no-console": "off",
    "indent": ["error", 4],
    "comma-dangle": ["error", "never"],
    "max-len": [2, {"code": 150, "tabWidth": 4, "ignoreUrls": true}],
    "prefer-destructuring": ["error", {"object": false, "array": false}],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }]
  },
};
