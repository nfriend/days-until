const typescriptTransform = require('i18next-scanner-typescript');
const tsConfig = require('./tsconfig.json');

module.exports = {
  input: ['src/**/*.ts'],
  output: './',
  options: {
    debug: true,
    func: {
      list: ['t'],
    },
    removeUnusedKeys: true,
    sort: true,

    // The list of all languages codes supported by this skill
    lngs: ['en'],

    defaultLng: 'en',
    defaultValue: (lng, ns, key) => (lng === 'en' ? key : ''),
    nsSeparator: false,
    keySeparator: false,
  },
  transform: typescriptTransform({
    extensions: ['.ts'],
    tsOptions: tsConfig,
  }),
};
