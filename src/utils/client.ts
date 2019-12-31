import axios, { AxiosResponse, AxiosError } from "axios";
import FormData from "form-data";
import fs from "fs";

import config from "../config";

import { ApiResponse, Languages } from "../types";

const { CROWDIN_KEY, CROWDIN_PROJECT_NAME } = config;

const commonParams = {
  key: CROWDIN_KEY,
  json: 1
};

export const BASE_URL = `https://api.crowdin.com/api/project/${CROWDIN_PROJECT_NAME}`;

export const createDirectory = async (branch: string) =>
  axios
    .get<ApiResponse>(`${BASE_URL}/add-directory`, {
      params: {
        ...commonParams,
        name: branch,
        is_branch: 1
      }
    })
    .catch((err: AxiosError<ApiResponse>) => err.response);

const uploadFile = async (
  endpoint: "add-file" | "update-file",
  branch: string,
  file: fs.ReadStream
) => {
  const formData = new FormData();
  formData.append("files[source.json]", file);

  const headers = {
    ...formData.getHeaders()
  };

  return axios.post(`${BASE_URL}/${endpoint}`, formData, {
    params: {
      ...commonParams,
      type: "chrome",
      branch
    },
    headers
  });
};

export const addFile = async (
  branch: string,
  file: fs.ReadStream
): Promise<AxiosResponse<any>> =>
  uploadFile("add-file", branch, file).catch(err => err.response);

export const updateFile = async (
  branch: string,
  file: fs.ReadStream
): Promise<AxiosResponse<ApiResponse>> =>
  uploadFile("update-file", branch, file).catch(err => err.response);

export const exportFile = async (
  branch: string,
  language: Languages
): Promise<AxiosResponse<ApiResponse>> =>
  axios
    .get(`${BASE_URL}/export-file`, {
      params: {
        ...commonParams,
        file: "source.json",
        language,
        branch
      }
    })
    .catch(err => err.response);
