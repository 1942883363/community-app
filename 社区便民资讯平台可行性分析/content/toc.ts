import { Paragraph, PageBreak, TableOfContents } from "docx";

export function buildTOCSection(): {
  properties: Record<string, unknown>;
  children: (Paragraph | TableOfContents)[];
} {
  return {
    properties: {},
    children: [
      new Paragraph({
        children: [],
      }),
      new TableOfContents("目录", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
      new Paragraph({ children: [new PageBreak()] }),
    ],
  };
}
