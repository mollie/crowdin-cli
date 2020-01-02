export interface Codes {
  0: `Unknown internal error'.`;
  1: `Requested project doesn't exist or the API key is invalid`;
  2: `Unknown API action`;
  3: `API key is invalid`;
  4: `No files specified in the request`;
  5: `A file with the same name is already uploaded`;
  6: `File was uploaded with error`;
  7: `Invalid file extension`;
  8: `File was not found`;
  9: `No language specified in the request`;
  10: `Language was not found`;
  11: `Account does not exist`;
  12: `Account key is invalid`;
  13: `Unknown error occurred`;
  14: `No type specified in the request`;
  15: `Invalid file type`;
  16: `No file schema specified in the request`;
  17: `The specified directory was not found`;
  18: `No user id specified in the request`;
  19: `A user with the same id already exists`;
  20: `User not found`;
  21: `The value specified for the parameter "files" is invalid. An array is expected`;
  22: `The value specified for the parameter "titles" is invalid. An array is expected`;
  23: `The value specified for the parameter "export_patterns" is invalid. An array is expected`;
  24: `The value specified for the parameter "languages" is invalid. An array is expected`;
  25: `An error occurred while uploading the Glossary`;
  26: `The directory or path does not exist`;
  27: `One or several parameters are invalid`;
  28: `Invalid file scheme specified in the request`;
  29: `Parameter "engine" was not found`;
  30: `The specified machine translation engine is not supported`;
  31: `Microsoft Translator API key was not found`;
  32: `Google Translate API key was not found`;
  33: `Reference was not found`;
  34: `The value specified for the parameter "reference" is invalid. A string is expected`;
  35: `Parameter "tm" was not found`;
  36: `Translation Memory was not found`;
  37: `No username specified in the request`;
  38: `Specified values are invalid for some parameters`;
  39: `Yandex.Translate API key was not found`;
  40: `OAuth authorization failed`;
  41: `You do not have permissions to perform this action`;
  42: `The uploaded file is too large`;
  43: `The request cannot be submitted because this project is suspended`;
  44: `No user id or username specified in the request`;
  45: `Maximum number of uploaded files cannot exceed 20`;
  46: `Versions are not available for your current subscription plan`;
  47: `The value specified for the parameter "new_names" is invalid. An array is expected`;
  48: `This feature is not available for your current subscription plan`;
  49: `Removal of the project owner is not allowed`;
  50: `Directory with such name already exists`;
  51: `Directory name can't contain any of the following characters: \ / : * ? " < > |`;
  52: `File name can't contain any of the following characters: \ / : * ? " < > |`;
  53: `This file is currently being updated`;
  54: `Project was not built. The build was canceled or interrupted by another build in progress`;
  55: `Maximum number of concurrent requests for this endpoint is reached. Please try again shortly`;
  56: `No strings found`;
  57: `No translations found`;
  58: `The pre-translate was canceled or interrupted by another pre-translate in progress`;
  59: `DeepL Translator API key was not found`;
  60: `Watson (IBM) Translator API key was not found`;
  61: `Amazon Translate API key was not found`;
  62: `Other files are currently being processed`;
  63: `You've used up the project quota of your subscription plan. Upgrade your plan to proceed`;
}

type Code = keyof Codes;
type Message = Codes[Code];

export interface ApiResponse {
  success: boolean;
  error?: {
    code: Code;
    message: Message;
  };
}

export interface ExportFileResponse {
  [id: string]: {
    message: string;
  };
}

export interface Descriptor {
  id: string;
  defaultMessage: string;
  description?: string;
}

export interface Messages {
  [id: string]: {
    message: string;
    description?: string;
  };
}

export type Language =
  | "ach"
  | "aa"
  | "af"
  | "ak"
  | "tw"
  | "sq"
  | "am"
  | "ar"
  | "ar-BH"
  | "ar-EG"
  | "ar-SA"
  | "ar-YE"
  | "an"
  | "hy-AM"
  | "frp"
  | "as"
  | "ast"
  | "tay"
  | "av"
  | "ae"
  | "ay"
  | "az"
  | "ban"
  | "bal"
  | "bm"
  | "ba"
  | "eu"
  | "be"
  | "bn"
  | "bn-IN"
  | "ber"
  | "bh"
  | "bfo"
  | "bi"
  | "bs"
  | "br-FR"
  | "bg"
  | "my"
  | "ca"
  | "ceb"
  | "ch"
  | "ce"
  | "chr"
  | "ny"
  | "zh-CN"
  | "zh-TW"
  | "zh-HK"
  | "zh-MO"
  | "zh-SG"
  | "cv"
  | "kw"
  | "co"
  | "cr"
  | "hr"
  | "cs"
  | "da"
  | "fa-AF"
  | "dv"
  | "nl"
  | "nl-BE"
  | "nl-SR"
  | "dz"
  | "en"
  | "en-UD"
  | "en-AR"
  | "en-AU"
  | "en-BZ"
  | "en-CA"
  | "en-CB"
  | "en-CN"
  | "en-DK"
  | "en-HK"
  | "en-IN"
  | "en-ID"
  | "en-IE"
  | "en-JM"
  | "en-JA"
  | "en-MY"
  | "en-NZ"
  | "en-NO"
  | "en-PH"
  | "en-PR"
  | "en-SG"
  | "en-ZA"
  | "en-SE"
  | "en-GB"
  | "en-US"
  | "en-ZW"
  | "eo"
  | "et"
  | "ee"
  | "fo"
  | "fj"
  | "fil"
  | "fi"
  | "vls-BE"
  | "fra-DE"
  | "fr"
  | "fr-BE"
  | "fr-CA"
  | "fr-LU"
  | "fr-QC"
  | "fr-CH"
  | "fy-NL"
  | "fur-IT"
  | "ff"
  | "gaa"
  | "gl"
  | "ka"
  | "de"
  | "de-AT"
  | "de-BE"
  | "de-LI"
  | "de-LU"
  | "de-CH"
  | "got"
  | "el"
  | "el-CY"
  | "kl"
  | "gn"
  | "gu-IN"
  | "ht"
  | "ha"
  | "haw"
  | "he"
  | "hz"
  | "hil"
  | "hi"
  | "ho"
  | "hmn"
  | "hu"
  | "is"
  | "ido"
  | "ig"
  | "ilo"
  | "id"
  | "iu"
  | "ga-IE"
  | "it"
  | "it-CH"
  | "ja"
  | "jv"
  | "quc"
  | "kab"
  | "kn"
  | "pam"
  | "ks"
  | "ks-PK"
  | "csb"
  | "kk"
  | "km"
  | "rw"
  | "tlh-AA"
  | "kv"
  | "kg"
  | "kok"
  | "ko"
  | "ku"
  | "kmr"
  | "kj"
  | "ky"
  | "lol"
  | "lo"
  | "la-LA"
  | "lv"
  | "lij"
  | "li"
  | "ln"
  | "lt"
  | "jbo"
  | "nds"
  | "dsb-DE"
  | "lg"
  | "luy"
  | "lb"
  | "mk"
  | "mai"
  | "mg"
  | "ms"
  | "ms-BN"
  | "ml-IN"
  | "mt"
  | "gv"
  | "mi"
  | "arn"
  | "mr"
  | "mh"
  | "moh"
  | "mn"
  | "sr-Cyrl-ME"
  | "me"
  | "mos"
  | "na"
  | "ng"
  | "ne-NP"
  | "ne-IN"
  | "pcm"
  | "se"
  | "nso"
  | "no"
  | "nb"
  | "nn-NO"
  | "oc"
  | "oj"
  | "or"
  | "om"
  | "os"
  | "pi"
  | "pap"
  | "ps"
  | "fa"
  | "en-PT"
  | "pl"
  | "pt-PT"
  | "pt-BR"
  | "pa-IN"
  | "pa-PK"
  | "qu"
  | "qya-AA"
  | "ro"
  | "rm-CH"
  | "rn"
  | "ru"
  | "ru-BY"
  | "ru-MD"
  | "ru-UA"
  | "ry-UA"
  | "sah"
  | "sg"
  | "sa"
  | "sat"
  | "sc"
  | "sco"
  | "gd"
  | "sr"
  | "sr-CS"
  | "sh"
  | "crs"
  | "sn"
  | "ii"
  | "sd"
  | "si-LK"
  | "sk"
  | "sl"
  | "so"
  | "son"
  | "ckb"
  | "nr"
  | "sma"
  | "st"
  | "es-ES"
  | "es-EM"
  | "es-AR"
  | "es-BO"
  | "es-CL"
  | "es-CO"
  | "es-CR"
  | "es-DO"
  | "es-EC"
  | "es-SV"
  | "es-GT"
  | "es-HN"
  | "es-MX"
  | "es-NI"
  | "es-PA"
  | "es-PY"
  | "es-PE"
  | "es-PR"
  | "es-US"
  | "es-UY"
  | "es-VE"
  | "su"
  | "sw"
  | "sw-KE"
  | "sw-TZ"
  | "ss"
  | "sv-SE"
  | "sv-FI"
  | "syc"
  | "tl"
  | "ty"
  | "tg"
  | "tzl"
  | "ta"
  | "tt-RU"
  | "te"
  | "kdh"
  | "th"
  | "bo-BT"
  | "ti"
  | "ts"
  | "tn"
  | "tr"
  | "tr-CY"
  | "tk"
  | "uk"
  | "hsb-DE"
  | "ur-IN"
  | "ur-PK"
  | "ug"
  | "uz"
  | "val-ES"
  | "ve"
  | "vec"
  | "vi"
  | "wa"
  | "cy"
  | "wo"
  | "xh"
  | "yi"
  | "yo"
  | "zea"
  | "zu";

export interface Config {
  BIN: string;
  BRANCH: string;
  CROWDIN_KEY: string;
  CROWDIN_PROJECT_NAME: string;
  CROWDIN_LANGUAGES: Language[];
  INTL_DIR: string;
  MESSAGES_DIR: string;
  MESSAGES_PATTERN: string;
  NODE_EXEC: string;
  TRANSLATIONS_DIR: string;
  TRANSLATIONS_FILE: string;
}
