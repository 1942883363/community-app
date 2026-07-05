import { AlignmentType, LevelFormat } from "docx";

// 编号配置：提供 bullets 和 numbers 两种编号体系
export const numberingConfig = [
  {
    reference: "bullets",
    levels: [
      {
        level: 0,
        format: LevelFormat.BULLET,
        text: "\u2022", // bullet 符号
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: { indent: { left: 720, hanging: 360 } },
        },
      },
    ],
  },
  {
    reference: "numbers",
    levels: [
      {
        level: 0,
        format: LevelFormat.DECIMAL,
        text: "%1.",
        alignment: AlignmentType.LEFT,
        style: {
          paragraph: { indent: { left: 720, hanging: 360 } },
        },
      },
    ],
  },
];
