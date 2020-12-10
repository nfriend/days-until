/**
 * Strips HTML from a string. Replaces `<br>`s with `\n`s.
 * @param str The string to strip HTML from
 */
export const stripHtml = (str: string) => {
  return (
    str
      // Replace <br> with \n
      .replace(/<br\s?\/?>/g, '\n')
      // Strip all other HTML
      // HTML stripping function from https://stackoverflow.com/a/5002161/1063392
      .replace(/<\/?[^>]+(>|$)/g, '')
  );
};
