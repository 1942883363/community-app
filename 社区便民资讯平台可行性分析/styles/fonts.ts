import { ISectionProperties, NumberFormat } from "docx";

// CJK 字体配置：ASCII 用 Arial，东亚字符用微软雅黑
export const CJK_FONT = {
  ascii: "Arial",
  eastAsia: "Microsoft YaHei",
  hAnsi: "Arial",
  cs: "Arial Unicode MS",
} as const;

// A4 页面尺寸 (DXA 单位)
export const A4_WIDTH = 11906;
export const A4_HEIGHT = 16838;

// 页面基础配置
export const pageProperties: ISectionProperties = {
  page: {
    size: { width: A4_WIDTH, height: A4_HEIGHT },
    margin: {
      top: 1440,     // 1 inch
      bottom: 1440,  // 1 inch
      left: 1800,    // 1.25 inch (装订线侧)
      right: 1440,   // 1 inch
    },
  },
};

// 通用字号 (half-points: 1pt = 2 half-points)
export const FONT_SIZES = {
  coverTitle: 44,     // 22pt - 封面标题
  coverSubtitle: 28,  // 14pt - 封面副标题
  coverInfo: 24,      // 12pt - 封面信息
  h1: 32,             // 16pt - 一级标题
  h2: 28,             // 14pt - 二级标题
  h3: 24,             // 12pt - 三级标题
  body: 24,           // 12pt - 正文
  tableHeader: 22,    // 11pt - 表头
  tableBody: 20,      // 10pt - 表格正文
  footer: 18,         // 9pt  - 页脚
};
