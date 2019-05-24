# ngx-kill-translate-zombies

Finds unused translation keys in your Angular project. Should be used withe angular translation library ngx-translate It searches translation keys (normally located in a [language-code].json file) in .ts, .js or .html files in the `baseSrc` and generate a fresh file at `exportFreshTranslatePath`.

It's a port of https://marketplace.visualstudio.com/items?itemName=seveseves.ngx-translate-zombies and display the progress more detail.

## Run Example

```
cd ./example
npm run kill-zombies
```

## Feature

- Check the config at `/example/kill-translate-zombies.js`

```
const killTranslateZombies = require('../build/main/index').default;

killTranslateZombies({
  translateFilePath: './src/assets/i18n/en.json',
  baseSrc: './src',
  exportFreshTranslatePath: './my-file.json'
});
```