import axios, { AxiosResponse } from "axios";
import CrowdinApiClient, {
  CommonErrorResponse,
  Credentials,
  SourceFilesModel,
  UploadStorageModel,
  ResponseList,
  ResponseObject,
  ValidationErrorResponse,
  Error,
} from "@crowdin/crowdin-api-client";
import chalk from "chalk";
import fs from "fs";
import config from "../config";
import { CrowdinResponse, ExportFileResponse } from "../types";

const { CROWDIN_PERSONAL_ACCESS_TOKEN, CROWDIN_PROJECT_ID, FILE_NAME } = config;

const credentials: Credentials = {
  token: CROWDIN_PERSONAL_ACCESS_TOKEN,
};

const {
  translationsApi,
  sourceFilesApi,
  uploadStorageApi,
} = new CrowdinApiClient(credentials);

export const unwrapValidationErrorResponse = (
  response: ValidationErrorResponse
): Error => {
  return response.errors[0].error.errors[0];
};

export const isCommonErrorResponse = (
  response: CrowdinResponse<any>
): response is CommonErrorResponse => {
  return (response as CommonErrorResponse).error !== undefined;
};

const listBranches = (
  branchName: string
): Promise<ResponseList<SourceFilesModel.Branch>> => {
  return sourceFilesApi.listProjectBranches(CROWDIN_PROJECT_ID, branchName);
};

const listFiles = (
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

export const deleteBranch = async (branchName: string): Promise<void> => {
  const branches = await listBranches(branchName);
  const branchId = branches.data[0].data.id;

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

export const updateOrRestoreFile = async (
  branchName: string,
  file: fs.ReadStream
): Promise<ResponseObject<SourceFilesModel.File> | CommonErrorResponse> => {
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
