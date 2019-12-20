import { ApiResponse } from './../types';
import axios, { AxiosResponse, AxiosError } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import config, { Languages } from '../config';

const { CROWDIN_KEY, CROWDIN_PROJECT_NAME, TRANSLATIONS_FILE } = config;

const commonParams = {
  key: CROWDIN_KEY,
};

const BASE_URL = `https://api.crowdin.com/api/project/${CROWDIN_PROJECT_NAME}`;


export const createBranch = async (branch: string) =>
  axios.get<ApiResponse>(`${BASE_URL}/add-directory`, {
    params: {
      ...commonParams,
      name: branch,
      is_branch: 1,
      json: 1,
    },
  })
  .catch((err: AxiosError<ApiResponse>) => err.response);


const uploadFile = async (endpoint: 'add-file' | 'update-file', branch: string) => {
  const formData = new FormData();
  formData.append('files[source.json]', fs.createReadStream(TRANSLATIONS_FILE));

  const headers = {
    ...formData.getHeaders(),
    'Content-Type': 'text/xml;charset=UTF-8',
  };

  return axios.post(`${BASE_URL}/${endpoint}`, formData, {
    params: {
      ...commonParams,
      json: true,
      type: 'chrome',
      branch: branch,
    },
    headers,
  })
}

export const addFile = (branch: string): Promise<AxiosResponse<any>> =>
  uploadFile('add-file', branch)
    .catch((err) => err.response);

export const updateFile = (branch: string): Promise<AxiosResponse<ApiResponse>> =>
  uploadFile('update-file', branch)
    .catch((err) => err.response);

export const exportFile = (branch: string, language: Languages): Promise<AxiosResponse<ApiResponse>> =>
  axios.get(`${BASE_URL}/export-file`, {
    params: {
      ...commonParams,
      file: 'source.json',
      language,
      branch,
    }
  }).catch((err) => err.response)
