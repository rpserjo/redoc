export enum contentTypes {
  'html',
  'asciidoc',
  'markdown',
  'text'
}
export function detectContentType (input: string) : contentTypes {
  const trimmed = input.trim();

  const asciidocPatterns = [
    /^=+ .+/m,
    /^:.*?:.+$/m,
    /^\[source.*\]$/m,
    /^\[NOTE|TIP|IMPORTANT|WARNING|CAUTION\]$/m,
    /^----$/m,
    /^--$/m,
    /^\+\+$/m
  ];
  if (asciidocPatterns.some((re) => re.test(trimmed))) {
    return contentTypes.asciidoc;
  }

  const markdownPatterns = [
    /^#{1,6} /m,
    /^> /m,
    /^-{3,}$/,
    /^```[\s\S]*?```$/m,
    /!\[.*\]\(.*\)/,
    /\[.*\]\(.*\)/,
  ];
  if (markdownPatterns.some((re) => re.test(trimmed))) {
    return contentTypes.markdown;
  }

  const htmlTagCount = (trimmed.match(/<\/?[a-z][\s\S]*?>/gi) || []).length;
  const lineCount = trimmed.split(/\r?\n/).length;
  const htmlDensity = htmlTagCount / lineCount;

  if (htmlDensity > 0.5 || /^<([a-z]+)[\s>]/i.test(trimmed)) {
    return contentTypes.html;
  }

  return contentTypes.text;
}
