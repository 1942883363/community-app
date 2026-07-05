import { Paragraph } from "docx";
import { h1, bodyParaIndent, emptyLine, rightPara } from "../styles/paragraph-styles";
import { pageProperties } from "../styles/fonts";

export function buildChapter11(): { properties: Record<string, unknown>; children: Paragraph[] } {
  const children: Paragraph[] = [];

  children.push(h1("11  可行性分析结论"));

  children.push(bodyParaIndent(
    "通过对社区便民资讯平台项目的全面可行性分析，从业务、技术、经济和社会四个维度进行系统评估，得出以下结论："
  ));

  children.push(bodyParaIndent(
    "第一，业务可行性充分。社区数字化治理的市场需求明确且紧迫，本系统设计的六大核心功能模块与社区实际工作流程高度匹配。微信小程序居民端零安装门槛、React管理后台标准化操作，用户接受度良好。"
  ));

  children.push(bodyParaIndent(
    "第二，技术可行性扎实。项目采用FastAPI + React + MySQL的全栈方案均为业界成熟技术，生态完善、社区活跃。关键安全技术（XSS防护、悲观锁防超卖、JWT认证、bcrypt哈希）已在代码中完成实现验证，技术风险可控。"
  ));

  children.push(bodyParaIndent(
    "第三，经济可行性合理。经自下而上估算，项目开发总成本约9.86万元（含首年基础设施费用），处于合理预算范围内。预期可产生直接的经济效益（节约人力物力成本）和间接效益（提升社区形象和居民满意度），投入产出比合理。"
  ));

  children.push(bodyParaIndent(
    "第四，社会可行性良好。项目符合《个人信息保护法》等法律法规要求，数据安全设计覆盖全链路；项目对提升社区服务体验和推动基层治理数字化具有正面社会价值；以微信小程序为载体，借助社区现有线上线下渠道可快速推广，具备良好的可复制性。"
  ));

  children.push(emptyLine());

  children.push(bodyParaIndent(
    "综上所述，社区便民资讯平台项目在业务、技术、经济和社会四个维度均具备可行性，项目可以立即开始进行。目前项目已完成需求分析、系统设计、后端API开发和管理前端开发等核心工作，后续建议：进入部署测试阶段，完成微信小程序端的开发，并在目标社区开展小范围试点运行，验证实际使用效果后逐步推广。"
  ));

  children.push(emptyLine());
  children.push(emptyLine());

  children.push(rightPara("社区便民资讯平台项目组"));
  children.push(rightPara("2026 年 7 月"));

  return { properties: pageProperties, children };
}
