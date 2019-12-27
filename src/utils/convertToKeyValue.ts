import sanitize from "sanitize-html";

export default (data: string) => {
  const convertedData: { [key: string]: any } = JSON.parse(data);
  const collection: { [key: string]: any } = {};

  Object.keys(convertedData)
    .sort()
    .forEach(key => {
      collection[key] = sanitize(convertedData[key].message, {
        allowedTags: [
          "b",
          "i",
          "em",
          "strong",
          "a",
          "p",
          "ul",
          "ol",
          "li",
          "h1",
          "h2",
          "h3",
          "h4",
          "br"
        ],
        allowedAttributes: {
          a: ["href", "rel", "target"]
        },
        allowedSchemes: sanitize.defaults.allowedSchemes.concat(["tel"]),
        textFilter: text => text.replace("&amp;", "&")
      });
    });

  return collection;
};
