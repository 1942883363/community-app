import {
  Document,
  Packer,
  PageBreak,
  Header,
  Footer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageNumber,
  LineRuleType,
} from "docx";
import * as fs from "fs";
import { CJK_FONT, FONT_SIZES, pageProperties } from "./styles/fonts";
import { numberingConfig } from "./styles/numbering";
import { buildCoverSection } from "./content/cover";
import { buildTOCSection } from "./content/toc";
import { buildChapter1 } from "./content/01-introduction";
import { buildChapter2 } from "./content/02-premise";
import { buildChapter3 } from "./content/03-proposed-system";
import { buildChapter4 } from "./content/04-business";
import { buildChapter5 } from "./content/05-technical";
import { buildChapter6 } from "./content/06-impact";
import { buildChapter7 } from "./content/07-social-factor";
import { buildChapter8 } from "./content/08-social-promotion";
import { buildChapter9 } from "./content/09-user-usability";
import { buildChapter10 } from "./content/10-economic";
import { buildChapter11 } from "./content/11-conclusion";

// 通用页眉
const defaultHeader = new Header({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "社区便民资讯平台 — 可行性分析报告",
          font: CJK_FONT,
          size: 18,
          color: "888888",
        }),
      ],
    }),
  ],
});

// 通用页脚（含页码）
const defaultFooter = new Footer({
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "第 ",
          font: CJK_FONT,
          size: 18,
          color: "888888",
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: CJK_FONT,
          size: 18,
          color: "888888",
        }),
        new TextRun({
          text: " 页",
          font: CJK_FONT,
          size: 18,
          color: "888888",
        }),
      ],
    }),
  ],
});

async function main() {
  // 组装所有 section
  const coverSection = buildCoverSection();
  const tocSection = buildTOCSection();
  const chapter1 = buildChapter1();
  const chapter2 = buildChapter2();
  const chapter3 = buildChapter3();
  const chapter4 = buildChapter4();
  const chapter5 = buildChapter5();
  const chapter6 = buildChapter6();
  const chapter7 = buildChapter7();
  const chapter8 = buildChapter8();
  const chapter9 = buildChapter9();
  const chapter10 = buildChapter10();
  const chapter11 = buildChapter11();

  // 所有内容 section 添加统一的页眉页脚和页面属性
  const contentSections = [
    chapter1, chapter2, chapter3, chapter4, chapter5,
    chapter6, chapter7, chapter8, chapter9, chapter10, chapter11,
  ].map((section) => ({
    properties: {
      ...pageProperties,
    },
    headers: {
      default: defaultHeader,
    },
    footers: {
      default: defaultFooter,
    },
    children: section.children,
  }));

  const doc = new Document({
    creator: "社区便民资讯平台项目组",
    title: "社区便民资讯平台可行性分析报告",
    description: "社区便民资讯平台项目的技术方案、业务模式、经济效益、社会效益及潜在风险的可行性分析报告",
    features: {
      updateFields: true,
    },
    numbering: {
      config: numberingConfig,
    },
    styles: {
      default: {
        document: {
          run: {
            font: CJK_FONT,
            size: FONT_SIZES.body,
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: FONT_SIZES.h1,
            bold: true,
            font: CJK_FONT,
          },
          paragraph: {
            spacing: { before: 360, after: 200 },
            outlineLevel: 0,
            keepNext: false,
            keepLines: false,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: FONT_SIZES.h2,
            bold: true,
            font: CJK_FONT,
          },
          paragraph: {
            spacing: { before: 280, after: 160 },
            outlineLevel: 1,
            keepNext: false,
            keepLines: false,
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: FONT_SIZES.h3,
            bold: true,
            font: CJK_FONT,
          },
          paragraph: {
            spacing: { before: 200, after: 120 },
            outlineLevel: 2,
            keepNext: false,
            keepLines: false,
          },
        },
      ],
    },
    sections: [
      // 封面 section（无页眉页脚）
      coverSection,
      // 目录 section（无页眉，有页码）
      {
        properties: {
          ...pageProperties,
        },
        headers: {
          default: defaultHeader,
        },
        footers: {
          default: defaultFooter,
        },
        children: tocSection.children,
      },
      // 正文 11 章
      ...contentSections,
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  const outputDir = "d:/实习项目/社区便民资讯平台可行性分析";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = `${outputDir}/社区便民资讯平台_可行性分析报告.docx`;
  fs.writeFileSync(outputPath, buffer);
  console.log(`报告已生成: ${outputPath}`);
}

main().catch((err) => {
  console.error("生成报告时出错:", err);
  process.exit(1);
});
