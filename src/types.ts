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
  BRANCH_NAME: string;
  FILE_NAME: string;
  CROWDIN_PERSONAL_ACCESS_TOKEN: string;
  CROWDIN_PROJECT_ID: number;
  CROWDIN_LANGUAGES: Language[];
  INTL_DIR: string;
  MESSAGES_DIR: string;
  MESSAGES_PATTERN: string;
  NODE_EXEC: string;
  TRANSLATIONS_DIR: string;
  TRANSLATIONS_FILE: string;
}
