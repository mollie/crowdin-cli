import { updateFile, exportFile } from './utils/client';
import sanitizeHtml from 'sanitize-html';
import { sync as globSync } from 'glob';
import { sync as mkdirpSync } from 'mkdirp';
import fs from 'fs';

import shell from 'shelljs';

import config, { LocaleLanguageMap, Languages, Locales } from './config';
import log from './utils/logging';

export default async () => {
  /* sync source file to prevent branching issues */

  if (!fs.existsSync(config.TRANSLATIONS_FILE)) {
    log.error('Source json file does not exist.');
    process.exit(1);
  }

  log.info('CROWDIN', 'Starting download process');

  mkdirpSync(config.TRANSLATIONS_DIR);

  const updateResponse = await updateFile(config.BRANCH);

  log.info('', 'Syncing source.json');

  if (!updateResponse?.data?.success) {
    const { error } = updateResponse.data;
    log.error(error?.message || `Something went wrong when uploading source.json`);
    process.exit(1);
  }

  log.info('', 'Downloading translations')

  const exportFileResponses = await Promise.all(
    Object.keys(LocaleLanguageMap).map(
      (locale) => exportFile(config.BRANCH, LocaleLanguageMap[(locale as Locales)])
    )
  );

  log.info('', `Writing translations to: ${config.TRANSLATIONS_DIR}`);

  await Promise.all(
    Object.keys(LocaleLanguageMap).map((locale, i) => {
      const translations = exportFileResponses[i].data;
      // @ts-ignore
      const destination = `${config.TRANSLATIONS_DIR}/${locale}.js`;
      const jsData = `// Auto generated file. Do no change. Go to Crowdin to update the translations and run './node_modules/.bin/mollie-crowdin download' to update this file.\nexport default ${JSON.stringify(translations)};`;
      return new Promise(
        (resolve, reject) => fs.writeFile(destination, jsData, () => resolve(true))
      );
    })
  );

  log.info('', 'Running prettier');

  const prettier = `${config.BIN}/prettier`;

  shell.exec([
    prettier,
    '--loglevel silent',
    `--write "${config.TRANSLATIONS_DIR}/*.+(js)"`,
  ].join(' '));

  log.success('Updated translations 🎉');

}