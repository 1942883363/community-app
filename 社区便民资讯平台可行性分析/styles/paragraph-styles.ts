import { Paragraph, TextRun, HeadingLevel, AlignmentType, LineRuleType } from "docx";
import { CJK_FONT, FONT_SIZES } from "./fonts";

// ===== 基础段落辅助函数 =====

/** 通用正文段落 */
export function bodyPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.body,
      }),
    ],
  });
}

/** 缩进正文段落（首行缩进2字符） */
export function bodyParaIndent(text: string): Paragraph {
  return new Paragraph({
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    indent: { firstLine: 480 }, // 12pt * 2 = 24pt = 480 twips
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.body,
      }),
    ],
  });
}

/** 短文本段落（无缩进，如列表项） */
export function shortPara(text: string): Paragraph {
  return new Paragraph({
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.body,
      }),
    ],
  });
}

/** 一级标题 */
export function h1(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.h1,
        bold: true,
      }),
    ],
  });
}

/** 二级标题 */
export function h2(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.h2,
        bold: true,
      }),
    ],
  });
}

/** 三级标题 */
export function h3(text: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.h3,
        bold: true,
      }),
    ],
  });
}

/** 空白行（用作段间距） */
export function emptyLine(): Paragraph {
  return new Paragraph({
    spacing: { line: 240, lineRule: LineRuleType.AUTO },
    children: [],
  });
}

/** 居中段落 */
export function centerPara(text: string, size?: number, bold?: boolean): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: size ?? FONT_SIZES.body,
        bold: bold ?? false,
      }),
    ],
  });
}

/** 带编号的段落 (使用 Word 编号) */
export function numberedPara(numRef: string, level: number, text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: numRef, level },
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.body,
      }),
    ],
  });
}

/** 右对齐段落（如日期、签名） */
export function rightPara(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { line: 360, lineRule: LineRuleType.AUTO },
    children: [
      new TextRun({
        text,
        font: CJK_FONT,
        size: FONT_SIZES.body,
      }),
    ],
  });
}
