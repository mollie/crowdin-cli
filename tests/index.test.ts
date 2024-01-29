import fs from "fs";
import CrowdinApiClient, { Credentials } from "@crowdin/crowdin-api-client";
import expectedJson from "./fixtures/expected.json";
import config from "../src/config";
import program from "../src/cli";
import collect from "../src/collect";
import download from "../src/download";
import upload from "../src/upload";
import deleteBranch from "../src/delete-branch";
import preTranslate from "../src/pre-translate";
import createTasks from "../src/create-tasks";
import { getCrowdinBranchName } from "../src/utils/get-crowdin-branch-name";
import { sync } from "mkdirp";

jest.mock("@crowdin/crowdin-api-client", () => ({
  __esModule: true,
  ...jest.requireActual<any>("@crowdin/crowdin-api-client"),
  default: jest.fn().mockReturnValue({
    uploadStorageApi: {
      addStorage: jest.fn().mockResolvedValue({
        data: { id: 324234 },
      }),
    },
    translationsApi: {
      exportProjectTranslation: jest.fn().mockResolvedValue({
        data: { url: "https://example.com/mock.json" },
      }),
      applyPreTranslation: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
      preTranslationStatus: jest.fn().mockResolvedValue({
        data: { status: "finished" },
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
        data: { id: 234234, name: "mock-branch-name" },
      }),
      createFile: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
      deleteBranch: jest.fn(),
    },
    tasksApi: {
      listTasks: jest.fn().mockResolvedValue({
        data: [
          {
            data: {
              id: 234234,
              description: "DO NOT CHANGE: mock-branch-name (nl)",
              fileIds: [234234],
            },
          },
        ],
      }),
      deleteTask: jest.fn(),
      createTask: jest.fn().mockResolvedValue({
        data: { id: 234234 },
      }),
    },
  }),
}));

jest.mock(
  "axios",
  jest.fn().mockReturnValue({
    ...jest.requireActual("axios"),
    get: jest.fn().mockResolvedValue({
      statusText: "OK",
      data: {
        "mollie-crowdin-content": { message: "Dit is een test" },
        "mollie-crowdin-title": { message: "Hi" },
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

jest.mock("../src/collect", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/collect").default),
  };
});

jest.mock("../src/upload", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/upload").default),
  };
});

jest.mock("../src/download", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/download").default),
  };
});

jest.mock("../src/delete-branch", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/delete-branch").default),
  };
});

jest.mock("../src/pre-translate", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/pre-translate").default),
  };
});

jest.mock("../src/create-tasks", () => {
  return {
    __esModule: true,
    default: jest.fn(jest.requireActual("../src/create-tasks").default),
  };
});

const mockGlob = "tests/fixtures/**/*.ts*";

describe("CLI", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("correctly handles `collect` command", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce("");
    await program(["node", "test", "collect", mockGlob]);
    expect(collect).toHaveBeenCalledTimes(1);
    expect(collect).toHaveBeenCalledWith(mockGlob);
  });

  it("correctly handles `upload` command", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce("");
    await program(["node", "test", "upload", mockGlob]);
    expect(collect).toHaveBeenCalledWith(mockGlob);
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        translationsFile: config.TRANSLATIONS_FILE,
        branchName: "mock-branch-name",
      })
    );

    await program([
      "node",
      "test",
      "upload",
      mockGlob,
      "-b",
      "custom-branch-name",
    ]);
    expect(upload).toHaveBeenCalledWith(
      expect.objectContaining({
        translationsFile: config.TRANSLATIONS_FILE,
        branchName: "custom-branch-name",
      })
    );
    expect(collect).toHaveBeenCalledTimes(2);
    expect(upload).toHaveBeenCalledTimes(2);

    expect(preTranslate).not.toHaveBeenCalled();
    expect(createTasks).not.toHaveBeenCalled();
  });

  it("correctly handles `upload` command with pre-translate and create-tasks options", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce("");
    await program([
      "node",
      "test",
      "upload",
      mockGlob,
      "--pre-translate",
      "--create-tasks",
    ]);
    expect(collect).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledTimes(1);
    expect(preTranslate).toHaveBeenCalledTimes(1);
    expect(createTasks).toHaveBeenCalledTimes(1);
  });

  it("correctly handles `download` command", async () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce("");
    sync(`${config.INTL_DIR}`);
    fs.writeFileSync(`${config.INTL_DIR}/english.source.json`, "");

    await program(["node", "test", "download"]);
    expect(download).toHaveBeenCalledWith(
      expect.objectContaining({ typescript: false })
    );
    await program(["node", "test", "download", "-b", "custom-branch-name"]);
    expect(download).toHaveBeenCalledWith(
      expect.objectContaining({
        typescript: false,
        branchName: "custom-branch-name",
      })
    );
    await program(["node", "test", "download", "--typescript"]);
    expect(download).toHaveBeenCalledWith(
      expect.objectContaining({ typescript: true })
    );
    expect(download).toHaveBeenCalledTimes(3);
  });

  it("correctly handles `delete-branch` command", async () => {
    const { tasksApi } = new CrowdinApiClient({
      token: config.CROWDIN_PERSONAL_ACCESS_TOKEN,
    });

    await program(["node", "test", "delete-branch"]);
    expect(deleteBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: config.BRANCH_NAME,
      })
    );
    expect(tasksApi.listTasks).not.toHaveBeenCalled();
    expect(tasksApi.deleteTask).not.toHaveBeenCalled();

    await program(["node", "test", "delete-branch", "--delete-tasks"]);
    expect(deleteBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: config.BRANCH_NAME,
        deleteTasks: true,
      })
    );
    expect(tasksApi.listTasks).toHaveBeenCalled();
    expect(tasksApi.deleteTask).toHaveBeenCalled();

    await program([
      "node",
      "test",
      "delete-branch",
      "--branch-name",
      "custom-branch-name",
    ]);
    expect(deleteBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        branchName: "custom-branch-name",
      })
    );
    expect(deleteBranch).toHaveBeenCalledTimes(3);
  });
});

describe("Handlers", () => {
  beforeEach(() => {
    // Clean up auto-generated directories
    fs.rmSync(config.INTL_DIR, { recursive: true, force: true });
    fs.rmSync(config.TRANSLATIONS_DIR, { recursive: true, force: true });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("collects messages correctly", async () => {
    expect.assertions(2);

    // Collects all messages from a component and creates english.source.json
    await collect(mockGlob);
    expect(
      fs.existsSync(`${config.INTL_DIR}/english.source.json`)
    ).toBeTruthy();

    // english.source.json matches the expected JSON file
    const sourceJson = require(`${config.INTL_DIR}/english.source.json`);
    expect(sourceJson).toEqual(expectedJson);
  });

  it("creates a branch on Crowdin and uploads the collected messages", async () => {
    expect.assertions(6);

    const credentials: Credentials = {
      token: config.CROWDIN_PERSONAL_ACCESS_TOKEN,
    };
    const { sourceFilesApi, uploadStorageApi } = new CrowdinApiClient(
      credentials
    );

    await upload({
      translationsFile: config.TRANSLATIONS_FILE,
      branchName: config.BRANCH_NAME,
    });

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

    expect(sourceFilesApi.listProjectBranches).toHaveBeenCalledTimes(1);
    expect(sourceFilesApi.listProjectBranches).toHaveBeenCalledWith(
      config.CROWDIN_PROJECT_ID,
      "mock-branch-name"
    );
  });

  it("downloads messages of the specified branch from Crowdin", async () => {
    expect.assertions(1);
    await collect(mockGlob);
    await download({
      translationsFile: config.TRANSLATIONS_FILE,
      translationsDir: config.TRANSLATIONS_DIR,
      branchName: config.BRANCH_NAME,
      languages: config.CROWDIN_LANGUAGES,
      typescript: false,
    });
    const file = fs.readFileSync(`${config.TRANSLATIONS_DIR}/nl.js`).toString();
    expect(file).toMatchSnapshot();
  });
});

describe("Utils", () => {
  test("getCrowdinBranchName()", () => {
    expect(getCrowdinBranchName("main")).toBe("main");
    expect(getCrowdinBranchName("branch-name")).toBe("branch-name");
    expect(getCrowdinBranchName("feature/branch-name")).toBe(
      "feature-branch-name"
    );
  });
});
