import { ExportFileResponse } from "../types";
import sanitize from "sanitize-html";

export default (data: ExportFileResponse) => {
  const collection: { [key: string]: any } = {};

  Object.keys(data)
    .sort()
    .forEach(key => {
      collection[key] = sanitize(data[key].message, {
        allowedAttributes: {
          a: ["href", "name", "rel", "target"],
        },
        textFilter: text => text.replace("&amp;", "&"),
      });
    });

  return collection;
};
