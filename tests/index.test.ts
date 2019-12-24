import { BASE_URL } from './../src/utils/client';
import axios from 'axios'
import FormData from 'form-data';

import fs from 'fs';
import program from '../src/cli';
import config from '../src/config';
// @ts-ignore
import expected from './fixtures/expected.json';

jest.mock('axios');
jest.mock('form-data');
jest.mock('../src/utils/localeLanguageMap.ts', () => ({
  'nl-NL': 'nl',
}));

const axiosGet = jest.fn((url) => {
  /**
   * export file response
   */
  if (/export-file/.test(url)) {
    return Promise.resolve({
      data: {
        "mollie-crowdin-content": { message: "Dit is een test" },
        "mollie-crowdin-title": { message: "Titel" }
      },
    });
  }

  /**
   * create branch response
   */
  return Promise.resolve({
    data: {
      succes: true,
    }
  });
});

// @ts-ignore
axios.get = axiosGet;


const axiosPost = jest.fn(() => Promise.resolve({
  /**
   * upload file response
   */
  data: {
    success: true,
  }
}));

// @ts-ignore
axios.post = axiosPost;

['CROWDIN_KEY', 'CROWDIN_PROJECT_NAME'].forEach(key => {
  describe(`cli config`, () => {
    let newProgram: (argv: string[]) => Promise<void>;
    let mockExit: jest.Mock;

    beforeEach(() => {
      jest.resetModules();
      delete process.env[key];
      mockExit = jest.fn();
      // @ts-ignore
      process.exit = mockExit;
      /* have to use a new instance of the program, because process.env is already passed through
       * to the program instance on top of this file.
       * So we cannot delete an env variable and test the flow
       **/
      newProgram = require('../src/cli').default;
    });

    it(`should crash when process.env.${key} is not set`, async () => {
      await newProgram(['node', 'test', 'collect', './tests/fixtures/**.tsx']);
      expect(mockExit).toHaveBeenCalledWith(1);
    });

  });
});


describe('mollie-crowdin cli', () => {
  afterEach(() => {
    jest.resetModules();
  })

  it('collects all the messages from a component and creates a english.source.json', async () => {
    await program(['node', 'test', 'collect', './tests/fixtures/**.tsx']);
    expect(
      fs.existsSync(`${config.INTL_DIR}/english.source.json`)
    ).toBeTruthy();
  })

  it('outputs english.source.json that matches the expected json file', async () => {
    const sourceJson = require(`${config.INTL_DIR}/english.source.json`);
    expect(sourceJson).toEqual(expected);
  });

  it('creates a directory on crowdin and uploads the collected messages', async () => {
    await program(['node', 'test', 'upload', './tests/fixtures/**.tsx']);

    expect(axiosGet).toHaveBeenCalledWith(`${BASE_URL}/add-directory`, {
      params: {
        key: config.CROWDIN_KEY,
        name: 'test-branch',
        is_branch: 1,
        json: 1,
      },
    })

    expect(axiosPost).toHaveBeenCalledWith(`${BASE_URL}/add-file`, expect.any(FormData), {
      params: {
        key: config.CROWDIN_KEY,
        json: 1,
        type: 'chrome',
        branch: 'test-branch',
      },
      headers: {
      }
    });
  });

  it('downloads translated messages from the specified branch from crowdin', async () => {
    await program(['node', 'test', 'download']);

    const file = fs.readFileSync(`${config.TRANSLATIONS_DIR}/nl-NL.js`).toString();
    expect(file).toMatchSnapshot()
  });
});