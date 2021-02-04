import fs from "fs";
import CrowdinApiClient, { Credentials } from "@crowdin/crowdin-api-client";
import expectedJson from "./fixtures/expected.json";
import config from "../src/config";
import program from "../src/cli";

jest.mock("@crowdin/crowdin-api-client", () =>
  jest.fn().mockReturnValue({
    uploadStorageApi: {
      addStorage: jest.fn().mockResolvedValue({
        data: { id: 324234 },
      }),
    },
    translationsApi: {
      exportProjectTranslation: jest.fn().mockResolvedValue({
        data: { url: "https://example.com/mock.json" },
      }),
    },
    sourceFilesApi: {
      listProjectBranches: jest.fn().mockResolvedValue({
        data: [{ data: { id: 3235234 } }],
      }),
      listProjectFiles: jest.fn().mockResolvedValue({
        data: [{ data: { id: 234234 } }],
      }),
      updateOrRestoreFile: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
      createBranch: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
      createFile: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
    },
  })
);

jest.mock(
  "axios",
  jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValueOnce({
      data: {
        "mollie-crowdin-content": { message: "Dit is een test" },
        "mollie-crowdin-title": { message: "Titel" },
      },
    }),
  })
);

jest.mock(
  "fs",
  jest.fn().mockReturnValue({
    ...jest.requireActual("fs"),
    createReadStream: jest.fn().mockReturnValue("mockReadStream"),
  })
);

describe("@mollie/crowdin-cli", () => {
  it("collects all messages from a component and creates english.source.json", async () => {
    expect.assertions(1);
    await program(["node", "test", "collect", "./tests/fixtures/**.tsx"]);
    expect(
      fs.existsSync(`${config.INTL_DIR}/english.source.json`)
    ).toBeTruthy();
  });

  it("outputs english.source.json that matches the expected JSON file", async () => {
    expect.assertions(1);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sourceJson = require(`${config.INTL_DIR}/english.source.json`);
    expect(sourceJson).toEqual(expectedJson);
  });

  it("collects all the messages from a component and creates an english.source.json", async () => {
    expect.assertions(1);
    await program(["node", "test", "collect", "./tests/fixtures/**.tsx"]);
    expect(
      fs.existsSync(`${config.INTL_DIR}/english.source.json`)
    ).toBeTruthy();
  });

  it("downloads messages of the specified branch from Crowdin", () => {
    expect.assertions(1);
    program(["node", "test", "download"]);
    const file = fs.readFileSync(`${config.TRANSLATIONS_DIR}/nl.js`).toString();
    expect(file).toMatchSnapshot();
  });

  it("creates a branch on Crowdin and uploads the collected messages", async () => {
    expect.assertions(4);

    const credentials: Credentials = {
      token: config.CROWDIN_PERSONAL_ACCESS_TOKEN,
    };
    const { sourceFilesApi, uploadStorageApi } = new CrowdinApiClient(
      credentials
    );

    await program(["node", "test", "upload", "./tests/fixtures/**.tsx"]);

    expect(sourceFilesApi.createBranch).toHaveBeenCalledTimes(1);
    expect(sourceFilesApi.createBranch).toHaveBeenCalledWith(
      config.CROWDIN_PROJECT_ID,
      {
        name: config.BRANCH_NAME,
      }
    );

    expect(uploadStorageApi.addStorage).toHaveBeenCalledTimes(1);
    expect(uploadStorageApi.addStorage).toHaveBeenCalledWith(
      config.FILE_NAME,
      "mockReadStream"
    );
  });
});
