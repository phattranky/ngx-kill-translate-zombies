const killTranslateZombies = require('../build/main/index').default;

killTranslateZombies({
  translateFilePath: './src/assets/i18n/en.json',
  baseSrc: './src',
  exportFreshTranslatePath: './my-file.json'
});

