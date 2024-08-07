import axios, { AxiosResponse } from "axios";
import CrowdinApiClient, {
  CommonErrorResponse,
  SourceFilesModel,
  UploadStorageModel,
  ResponseList,
  ResponseObject,
  ValidationErrorResponse,
  TasksModel,
  Error,
  TranslationsModel,
} from "@crowdin/crowdin-api-client";
import chalk from "chalk";
import fs from "fs";
import config from "../config";
import { CrowdinResponse, ExportFileResponse } from "../types";

const {
  CROWDIN_PERSONAL_ACCESS_TOKEN,
  CROWDIN_PROJECT_ID,
  FILE_NAME,
  DEEPL_ENGINE_ID,
  DEEPL_SUPPORTED_LANGUAGES,
} = config;

export const CrowdinType = TasksModel.Type;

const {
  translationsApi,
  sourceFilesApi,
  uploadStorageApi,
  tasksApi,
} = new CrowdinApiClient({
  token: CROWDIN_PERSONAL_ACCESS_TOKEN,
});

export const unwrapErrorResponse = (
  response: CommonErrorResponse | ValidationErrorResponse
): Error => {
  return isCommonErrorResponse(response)
    ? response?.error
    : response?.errors?.[0]?.error?.errors[0];
};

export function isCommonErrorResponse(
  response: CrowdinResponse<unknown> | ValidationErrorResponse
): response is CommonErrorResponse {
  return (response as CommonErrorResponse).error !== undefined;
}

export const listBranches = (
  branchName: string
): Promise<ResponseList<SourceFilesModel.Branch>> => {
  return sourceFilesApi.listProjectBranches(CROWDIN_PROJECT_ID, branchName);
};

export const listFiles = (
  branchId: number
): Promise<ResponseList<SourceFilesModel.File>> => {
  return sourceFilesApi.listProjectFiles(CROWDIN_PROJECT_ID, branchId);
};

const addStorage = (
  file: fs.ReadStream
): Promise<ResponseObject<UploadStorageModel.Storage>> => {
  return uploadStorageApi.addStorage(FILE_NAME, file);
};

export const createBranch = (
  name: string
): Promise<ResponseObject<SourceFilesModel.Branch>> => {
  return sourceFilesApi.createBranch(CROWDIN_PROJECT_ID, {
    name,
  });
};

export const deleteBranch = async (branchId: number): Promise<void> => {
  return sourceFilesApi.deleteBranch(CROWDIN_PROJECT_ID, branchId);
};

export const createFile = async (
  branchName: string,
  file: fs.ReadStream
): Promise<ResponseObject<SourceFilesModel.File>> => {
  const storage = await addStorage(file);
  const branches = await listBranches(branchName);
  const branchId = branches.data[0].data.id;

  return sourceFilesApi.createFile(CROWDIN_PROJECT_ID, {
    storageId: storage.data.id,
    name: FILE_NAME,
    branchId,
  });
};

export const applyPreTranslations = async (fileId: number) => {
  if (!DEEPL_ENGINE_ID) {
    throw new Error(
      "To apply pre-translations, please set the CROWDIN_DEEPL_ENGINE_ID variable in your .env file."
    );
  }

  if (DEEPL_SUPPORTED_LANGUAGES.length === 0) {
    throw new Error(
      "To apply pre-translations, please set the CROWDIN_DEEPL_SUPPORTED_LANGUAGES variable in your .env file."
    );
  }

  const preTranslation = await translationsApi.applyPreTranslation(
    CROWDIN_PROJECT_ID,
    {
      languageIds: DEEPL_SUPPORTED_LANGUAGES,
      fileIds: [fileId],
      method: TranslationsModel.Method.MT,
      engineId: DEEPL_ENGINE_ID,
    }
  );

  return waitForPreTranslation(preTranslation.data.identifier);
};

const waitForPreTranslation = async (
  preTranslationId: string
): Promise<void> => {
  const preTranslationStatus = await translationsApi.preTranslationStatus(
    CROWDIN_PROJECT_ID,
    preTranslationId
  );

  if (preTranslationStatus.data.status === "finished") {
    return;
  }

  return new Promise(resolve => {
    setTimeout(async () => {
      await waitForPreTranslation(preTranslationId);
      resolve();
    }, 1000);
  });
};

export const updateOrRestoreFile = async ({
  branchName,
  file,
  clearTranslationsAndApprovals = false,
}: {
  branchName: string;
  file: fs.ReadStream;
  clearTranslationsAndApprovals?: boolean;
}): Promise<ResponseObject<SourceFilesModel.File> | CommonErrorResponse> => {
  const storage = await addStorage(file);
  const branches = await listBranches(branchName);
  const branchId = branches?.data[0]?.data?.id;

  if (!branchId) {
    return {
      error: {
        code: "branchNotFound",
        message: `Couldn’t find a branch with the name ${chalk.bold(
          branchName
        )}`,
      },
    };
  }

  const files = await listFiles(branchId);
  const fileId = files.data[0].data.id;

  return sourceFilesApi.updateOrRestoreFile(CROWDIN_PROJECT_ID, fileId, {
    storageId: storage.data.id,
    updateOption: clearTranslationsAndApprovals
      ? SourceFilesModel.UpdateOption.CLEAR_TRANSLATIONS_AND_APPROVALS
      : SourceFilesModel.UpdateOption.KEEP_TRANSLATIONS,
  });
};

export const exportFile = async (
  branchName: string,
  language: string
): Promise<AxiosResponse<ExportFileResponse>> => {
  const branches = await listBranches(branchName);
  const branchId = branches.data[0].data.id;
  const files = await listFiles(branchId);
  const fileIds = files.data.map(file => file.data.id);
  const translation = await translationsApi.exportProjectTranslation(
    CROWDIN_PROJECT_ID,
    {
      fileIds,
      targetLanguageId: language,
    }
  );

  return axios.get(translation.data.url);
};

export const listTasks = (
  offset: number = 0,
  limit: number = 500
): Promise<ResponseList<TasksModel.Task>> => {
  return tasksApi.listTasks(CROWDIN_PROJECT_ID, {
    limit: limit,
    offset: offset,
  });
};

export const createTask = async (
  title: string,
  fileIds: number[],
  languageId: string,
  type: TasksModel.Type,
  description?: string
): Promise<ResponseObject<TasksModel.Task>> => {
  return tasksApi.addTask(CROWDIN_PROJECT_ID, {
    title,
    fileIds,
    languageId,
    type,
    description,
  });
};

export const deleteTask = async (taskId: number) => {
  return tasksApi.deleteTask(CROWDIN_PROJECT_ID, taskId);
};
