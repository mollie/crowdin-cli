export default (locale: string) => {
  // Gets the last two chars and their hex UTF-16 code
  let firstChar = locale.toLowerCase().charCodeAt(locale.length - 2);
  let secondChar = locale.toLowerCase().charCodeAt(locale.length - 1);

  // Add 133 to match it to Emoji lettering definition
  firstChar += 133;
  secondChar += 133;

  // Turn those chars into Emojis in UTF Hex
  const firstPartEmoji = `0x1F1${firstChar.toString(16)}`;
  const secondPartEmoji = `0x1F1${secondChar.toString(16)}`;

  // Return the concatenated UTF codes that create the flag Emoji
  // @ts-ignore
  return `${String.fromCodePoint(firstPartEmoji)}${String.fromCodePoint(secondPartEmoji)}`;
};