import {
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
} from "docx";
import { CJK_FONT, FONT_SIZES } from "./fonts";

// 表格边框样式
const border = { style: BorderStyle.SINGLE, size: 1, color: "999999" };
const borders = { top: border, bottom: border, left: border, right: border };

// 表头填充色
const headerShading = { fill: "D9E2F3", type: ShadingType.CLEAR };

// 单元格通用边距
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

/**
 * 创建一个表头单元格
 */
function headerCell(text: string, widthDxa: number): TableCell {
  return new TableCell({
    borders,
    width: { size: widthDxa, type: WidthType.DXA },
    shading: headerShading,
    margins: cellMargins,
    verticalAlign: "center" as const,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text,
            font: CJK_FONT,
            size: FONT_SIZES.tableHeader,
            bold: true,
          }),
        ],
      }),
    ],
  });
}

/**
 * 创建一个数据单元格
 */
function bodyCell(
  text: string,
  widthDxa: number,
  align: "left" | "center" = "left"
): TableCell {
  return new TableCell({
    borders,
    width: { size: widthDxa, type: WidthType.DXA },
    margins: cellMargins,
    verticalAlign: "center" as const,
    children: [
      new Paragraph({
        alignment: align === "center" ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            font: CJK_FONT,
            size: FONT_SIZES.tableBody,
          }),
        ],
      }),
    ],
  });
}

/**
 * 创建标准数据表格
 * @param headers 表头数组
 * @param rows 数据行数组，每行是字符串数组
 * @param colWidths 列宽数组 (DXA)，总和应等于表格宽度
 * @param tableWidthDxa 表格总宽度 (DXA)
 */
export function createTable(
  headers: string[],
  rows: string[][],
  colWidths: number[],
  tableWidthDxa: number
): Table {
  return new Table({
    width: { size: tableWidthDxa, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      // 表头行
      new TableRow({
        cantSplit: true,
        tableHeader: true,
        children: headers.map((h, i) => headerCell(h, colWidths[i])),
      }),
      // 数据行
      ...rows.map(
        (row) =>
          new TableRow({
            cantSplit: true,
            children: row.map((cell, i) =>
              bodyCell(cell, colWidths[i], i === 0 ? "left" : "center")
            ),
          })
      ),
    ],
  });
}

/**
 * 创建一个简单的键值对信息表格（两列）
 */
export function createInfoTable(
  items: [string, string][],
  labelWidthDxa: number = 2800,
  valueWidthDxa: number = 6260
): Table {
  const tableWidth = labelWidthDxa + valueWidthDxa;
  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths: [labelWidthDxa, valueWidthDxa],
    rows: items.map(
      ([label, value]) =>
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              borders,
              width: { size: labelWidthDxa, type: WidthType.DXA },
              shading: headerShading,
              margins: cellMargins,
              verticalAlign: "center" as const,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      font: CJK_FONT,
                      size: FONT_SIZES.tableBody,
                      bold: true,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders,
              width: { size: valueWidthDxa, type: WidthType.DXA },
              margins: cellMargins,
              verticalAlign: "center" as const,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: value,
                      font: CJK_FONT,
                      size: FONT_SIZES.tableBody,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  });
}
