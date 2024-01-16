import { applyPreTranslations } from "./lib/crowdin";
import log from "./utils/logging";

export default async function preTranslate(fileId: number) {
  try {
    await applyPreTranslations(fileId);
    log.success(`Successfully applied pre-translations`);
  } catch (error) {
    log.error(error as string);
  }
}
