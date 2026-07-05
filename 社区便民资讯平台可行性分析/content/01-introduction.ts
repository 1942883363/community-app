import { Paragraph } from "docx";
import { h1, h2, bodyParaIndent } from "../styles/paragraph-styles";
import { pageProperties } from "../styles/fonts";

export function buildChapter1(): { properties: Record<string, unknown>; children: Paragraph[] } {
  const children: Paragraph[] = [];

  children.push(h1("1  引言"));

  // 1.1 编制目的
  children.push(h2("1.1  编制目的"));
  children.push(bodyParaIndent(
    "本报告旨在对《社区便民资讯平台》项目的技术方案、业务模式、经济效益、社会效益及潜在风险进行全面、系统的分析评估。通过深入分析项目的市场需求、技术可行性、经济可行性和社会可行性，为项目的立项决策、资源投入和实施规划提供科学依据。本报告的主要读者对象包括项目决策层、投资方、技术开发团队以及相关社区管理部门。"
  ));

  // 1.2 背景及现状分析
  children.push(h2("1.2  背景及现状分析"));
  children.push(bodyParaIndent(
    "随着我国城市化进程的不断推进和数字经济的快速发展，社区治理数字化转型已成为提升基层服务能力的重要方向。然而，当前多数社区在便民信息传播方面仍面临诸多挑战：社区资讯发布渠道分散，主要依赖公告栏张贴和微信群转发，信息更新不及时、传播效率低下；居民获取便民服务信息（如物业维修、医疗急救、周边商家等）缺乏统一入口；社区活动组织仍以线下人工登记为主，名额管理和报名流程繁琐；居民意见反馈缺乏便捷的数字化渠道，处理进度不透明。"
  ));
  children.push(bodyParaIndent(
    "本项目所建议开发的软件名称为《社区便民资讯平台》，由社区便民资讯平台项目组提出和开发。项目的目标用户群体包括社区居民（通过微信小程序端访问）和社区管理者（通过React管理后台操作）。该系统为独立的全栈应用，后端通过高德地图Web API对接公交地铁实时查询服务，与微信小程序生态紧密集成。"
  ));

  // 1.3 参考资料
  children.push(h2("1.3  参考资料"));
  children.push(bodyParaIndent(
    "本报告在编制过程中参考了以下资料：（1）《社区便民资讯平台需求规格说明书》（项目内部文档，spec.md）；（2）《社区便民资讯平台系统设计文档》（项目内部文档，design.md）；（3）FastAPI官方文档（https://fastapi.tiangolo.com/）；（4）React 19 官方文档；（5）MySQL 8.0 参考手册；（6）高德地图Web API开发文档；（7）《中华人民共和国个人信息保护法》（2021年）；（8）《信息安全技术 个人信息安全规范》（GB/T 35273-2020）。"
  ));

  return { properties: pageProperties, children };
}
