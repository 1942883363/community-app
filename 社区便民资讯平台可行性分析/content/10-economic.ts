import { Paragraph } from "docx";
import { h1, h2, bodyParaIndent, emptyLine } from "../styles/paragraph-styles";
import { createTable } from "../styles/table-helpers";
import { pageProperties } from "../styles/fonts";

export function buildChapter10(): { properties: Record<string, unknown>; children: (Paragraph | ReturnType<typeof createTable>)[] } {
  const children: (Paragraph | ReturnType<typeof createTable>)[] = [];

  children.push(h1("10  经济可行性分析"));

  children.push(h2("10.1  支出分析"));
  children.push(bodyParaIndent(
    "采用自下而上估算法，将项目按功能模块进行子任务分解，分别估算每个子任务的开发工作量，再汇总计算总成本。开发人员成本参数按行业平均标准设定：高级工程师15000元/月（约750元/天），中级工程师10000元/月（约500元/天），测试与运维工程师8000元/月（约400元/天）。项目总开发规模约为55人天（含需求分析、设计、编码、测试和部署全流程）。"
  ));
  children.push(emptyLine());

  const econCols = [2800, 1400, 1400, 1400, 2060];
  const econWidth = econCols.reduce((a, b) => a + b, 0); // 9060
  children.push(createTable(
    ["成本项", "人员配置", "工作量", "单价", "小计（万元）"],
    [
      ["需求分析与系统设计", "高级工程师", "10人天", "750元/天", "0.75"],
      ["后端开发（9模块+数据库）", "高级工程师", "30人天", "750元/天", "2.25"],
      ["管理前端开发（7页面）", "中级工程师", "20人天", "500元/天", "1.00"],
      ["微信小程序开发（12页面）", "中级工程师", "30人天", "500元/天", "1.50"],
      ["测试与联调", "测试工程师", "10人天", "400元/天", "0.40"],
      ["部署与运维", "运维工程师", "5人天", "400元/天", "0.20"],
      ["小计", "—", "—", "—", "6.10"],
    ],
    econCols,
    econWidth
  ));

  children.push(emptyLine());
  children.push(bodyParaIndent(
    "（1）开发成本 = 6.10万元（开发任务直接成本）。（2）管理成本 = 开发成本 × 10% = 0.61万元（项目管理与质量管理成本）。（3）直接成本 = 开发成本 + 管理成本 = 6.10 + 0.61 = 6.71万元。（4）间接成本 = 直接成本 × 10% = 0.67万元（办公场地、水电、网络等间接分摊）。（5）人力总估算成本 = 直接成本 + 间接成本 = 6.71 + 0.67 = 7.38万元。"
  ));

  children.push(emptyLine());

  const infraCols = [2800, 2800, 1860, 1600];
  const infraWidth = infraCols.reduce((a, b) => a + b, 0);
  children.push(createTable(
    ["基础设施项", "配置说明", "费用（元/年）", "备注"],
    [
      ["云服务器（ECS）", "2核4G + 50G SSD", "18,000", "按1500元/月 × 12月"],
      ["域名注册", ".com/.cn 域名", "500", "首年注册及续费"],
      ["SSL证书", "Let's Encrypt", "0", "免费自动化续期"],
      ["高德地图API", "按QPS阶梯付费", "6,000", "按500元/月预估"],
      ["微信小程序认证", "年审认证费", "300", "一次性/年"],
      ["合计", "—", "24,800", "约 2.48万元"],
    ],
    infraCols,
    infraWidth
  ));

  children.push(emptyLine());
  children.push(bodyParaIndent(
    "项目总估算成本 = 人力总估算成本 + 首年基础设施费用 = 7.38 + 2.48 = 9.86万元。"
  ));

  children.push(h2("10.2  效益分析"));
  children.push(bodyParaIndent(
    "本系统的效益可从三个维度进行衡量。（1）直接经济效益——通过数字化替代纸质公告和人工通知，预计每个社区每年可节约打印耗材和人力成本约0.5-1万元；反馈工单的线上处理可缩短平均处理周期50%以上，释放管理人员时间用于其他社区服务。（2）间接经济效益——社区资讯的高效传播和便民服务（电话簿、商家查询）的便捷获取，提升了居民满意度和社区整体形象；活动报名数字化降低了参与门槛，可增加社区活动参与率30%以上，间接促进社区商业和周边经济活力。（3）社会效益——本系统沉淀了标准化的社区数字化治理方案和数据资产，支持跨社区复制推广，有望形成社区服务数字化的参考样板，推动区域社会治理现代化进程。"
  ));

  return { properties: pageProperties, children };
}
