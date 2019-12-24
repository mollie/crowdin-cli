import fs from 'fs';
import { createBranch, addFile, updateFile } from './utils/client';
import log from './utils/logging';
import config from './config';

export default async () => {
  log.info('', 'Uploading source file to Crowdin.');

  const response = await createBranch(config.BRANCH);

  if (!response) {
    log.error(`Something went wrong when trying to create a directory`);
    process.exit(1);
  }

  const { data: { success, error } } = response;

  if (error && error.code !== 50) {
    log.error(error?.message || `Something went wrong when trying to create a directory`);
    process.exit(1);
  }

  let fileApi = error?.code === 50 ? updateFile : addFile;

  const file = fs.createReadStream(config.TRANSLATIONS_FILE)

  if (success) {
    log.success(`Created branch: ${config.BRANCH}`)
  } else if (error?.code === 50) {
    fileApi = updateFile;
  }

  const { data: uploadRes } = await fileApi(config.BRANCH, file);
  if (uploadRes.success) {
    log.success(`Updated source.json is uploaded to branch: ${config.BRANCH}`);
  } else if (uploadRes.error) {
    log.error(error?.message || 'Something went wrong when uploading source.json');
    process.exit(1);
  }

  return;
};
