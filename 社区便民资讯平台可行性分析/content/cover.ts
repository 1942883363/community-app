import { Paragraph, PageBreak, TextRun, AlignmentType, LineRuleType } from "docx";
import { CJK_FONT, FONT_SIZES } from "../styles/fonts";

export function buildCoverSection(): {
  properties: Record<string, unknown>;
  children: Paragraph[];
} {
  const coverChildren: Paragraph[] = [];

  // 顶部留白
  for (let i = 0; i < 6; i++) {
    coverChildren.push(
      new Paragraph({
        spacing: { line: 360, lineRule: LineRuleType.AUTO },
        children: [],
      })
    );
  }

  // 主标题
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "社区便民资讯平台",
          font: CJK_FONT,
          size: 52,
          bold: true,
        }),
      ],
    })
  );

  // 副标题
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({
          text: "可行性分析报告",
          font: CJK_FONT,
          size: 44,
          bold: true,
        }),
      ],
    })
  );

  coverChildren.push(
    new Paragraph({
      spacing: { line: 360, lineRule: LineRuleType.AUTO },
      children: [],
    })
  );

  // 版本、日期等信息
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "版本号：V1.0",
          font: CJK_FONT,
          size: FONT_SIZES.coverInfo,
        }),
      ],
    })
  );
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "编制日期：2026 年 7 月",
          font: CJK_FONT,
          size: FONT_SIZES.coverInfo,
        }),
      ],
    })
  );
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: "编制单位：社区便民资讯平台项目组",
          font: CJK_FONT,
          size: FONT_SIZES.coverInfo,
        }),
      ],
    })
  );

  // 底部留白
  for (let i = 0; i < 8; i++) {
    coverChildren.push(
      new Paragraph({
        spacing: { line: 360, lineRule: LineRuleType.AUTO },
        children: [],
      })
    );
  }

  // 保密声明
  coverChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "【内部资料 请勿外传】",
          font: CJK_FONT,
          size: 20,
          color: "999999",
        }),
      ],
    })
  );

  // 封面后分页
  coverChildren.push(new Paragraph({ children: [new PageBreak()] }));

  return {
    properties: {},
    children: coverChildren,
  };
}
