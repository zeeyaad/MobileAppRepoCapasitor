// i18next-scanner.config.cjs
module.exports = {
  input: ['src/**/*.{ts,tsx}'],
  output: './',
  options: {
    func: { list: ['t', 'i18n.t'], extensions: ['.ts', '.tsx'] },
    lngs: ['ar', 'en'],
    ns: ['common', 'auth', 'admin', 'member', 'team', 'landing'],
    defaultLng: 'ar',
    defaultNS: 'common',
    resource: {
      loadPath: 'public/locales/{{lng}}/{{ns}}.json',
      savePath: 'public/locales/{{lng}}/{{ns}}.json',
    },
    keySeparator: '.',
    pluralSeparator: '_',
  },
};
