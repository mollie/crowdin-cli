import {
  isCommonErrorResponse,
  unwrapValidationErrorResponse,
  applyPreTranslations,
} from "./lib/crowdin";
import log from "./utils/logging";

export default async (fileId: number) => {
  log.info("Pre-translating branch translations");

  try {
    const response = await applyPreTranslations(fileId);

    if (isCommonErrorResponse(response)) {
      log.error(response.error.message);
    } else {
      log.success(`Successfully applied pre-translations`);
    }
  } catch (errorResponse) {
    const error = unwrapValidationErrorResponse(errorResponse);

    log.error(error.code + ": " + error.message);
  }
};