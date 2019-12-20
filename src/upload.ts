import { sync as globSync } from 'glob';
import { sync as mkdirpSync } from 'mkdirp';
import fs from 'fs';
import shell from 'shelljs';

import config from './config';

import { createBranch, addFile, updateFile } from './utils/client';
import sortByKey from './utils/sortByKey';
import log from './utils/logging';

import { Messages, Descriptor } from './types';

export default async (glob: string) => {
  log.info('CROWDIN', 'Starting upload process');

  mkdirpSync(config.INTL_DIR);

  log.info('', 'Collecting messages');

  const files = globSync(glob);

  console.log(files);

  const cmd = [
    config.NODE_EXEC,
    `${config.BIN}/formatjs`,
    'extract',
    files.join(' '),
    `--messages-dir=${config.MESSAGES_DIR}`,
  ];

  const { stderr } = shell.exec(cmd.join(' '));

  if (stderr) {
    log.error(stderr);
    process.exit(1);
  }

  const messages: Messages = globSync(config.MESSAGES_PATTERN)
    .map(filename => fs.readFileSync(filename, 'utf8'))
    .map(file => JSON.parse(file))
    .reduce((collection, descriptors) => {
      try {
        descriptors.forEach(({ id, defaultMessage, description }: Descriptor) => {
          if (collection[id] && collection[id].message !== defaultMessage) {
            log.error(`Duplicate message id: ${id}`);
            process.exit(1);
          }

          // Chrome JSON format
          collection[id] = { message: defaultMessage, description };
        });
      } catch (error) {
        log.error(error);
        process.exit(1);
      }
      return collection;
    }, {});

  const sortedMessages = sortByKey(messages);

  log.info('', `${Object.keys(sortedMessages).length} translations found.`);

  let existingTranslations;

  try {
    existingTranslations = fs.readFileSync(config.TRANSLATIONS_FILE, 'utf8');
  } catch (e) { }

  const newTranslations = JSON.stringify(sortedMessages, null, 2);

  log.info('', 'Writing new translations source file.');
  fs.writeFileSync(config.TRANSLATIONS_FILE, newTranslations);

  if (!existingTranslations || existingTranslations !== newTranslations) {
    log.info('', 'Generated translation file has changed.');
    log.info('', 'Uploading source file to Crowdin.');
  } else {
    log.info('DONE', 'No new translations found.');
    process.exit(0);
  }

  const response = await createBranch(config.BRANCH);

  if (!response) {
    log.error(`Something went wrong`);
    process.exit(1);
  }

  const { data: { success, error } } = response;

  if (error && error.code !== 50) {
    log.error(error?.message || `Something went wrong when trying to create a directory`);
    process.exit(1);
  }

  let fileApi = error?.code === 50 ? updateFile : addFile;

  if (success) {
    log.success(`Created branch: ${config.BRANCH}`)
  } else if (error?.code === 50) {
    fileApi = updateFile;
  }

  const { data: uploadRes } = await fileApi(config.BRANCH);
  if (uploadRes.success) {
    log.success(`Updated source.json is uploaded to branch: ${config.BRANCH}`);
    process.exit(0);
  } else if (uploadRes.error) {
    log.error(error?.message || 'Something went wrong when uploading source.json');
    process.exit(1);
  }
};
