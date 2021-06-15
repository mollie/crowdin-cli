import { ExportFileResponse } from "../types";

export default (data: ExportFileResponse) => {
  const collection: { [key: string]: any } = {};

  Object.keys(data)
    .sort()
    .forEach(key => {
      collection[key] = data[key].message;
    });

  return collection;
};
