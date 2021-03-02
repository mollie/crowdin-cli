import {
  CommonErrorResponse,
  ResponseObject,
} from "@crowdin/crowdin-api-client";

export type CrowdinResponse<T> = ResponseObject<T> | CommonErrorResponse;

export interface ExportFileResponse {
  [id: string]: {
    message: string;
  };
}

export interface Config {
  BRANCH_NAME: string;
  FILE_NAME: string;
  CROWDIN_PERSONAL_ACCESS_TOKEN: string;
  CROWDIN_PROJECT_ID: number;
  CROWDIN_LANGUAGES: string[];
  INTL_DIR: string;
  TRANSLATIONS_DIR: string;
  TRANSLATIONS_FILE: string;
}
