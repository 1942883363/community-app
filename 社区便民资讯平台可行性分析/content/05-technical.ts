import { Paragraph } from "docx";
import { h1, h2, bodyParaIndent, emptyLine } from "../styles/paragraph-styles";
import { createTable } from "../styles/table-helpers";
import { pageProperties } from "../styles/fonts";

export function buildChapter5(): { properties: Record<string, unknown>; children: (Paragraph | ReturnType<typeof createTable>)[] } {
  const children: (Paragraph | ReturnType<typeof createTable>)[] = [];

  children.push(h1("5  技术可行性分析"));

  children.push(h2("5.1  技术栈成熟度评估"));
  children.push(bodyParaIndent("本项目所采用的技术栈均为业界成熟、社区活跃的主流方案，系统性地评估如下表所示："));
  children.push(emptyLine());

  const techCols = [2200, 1400, 1000, 1000, 3460];
  const techWidth = techCols.reduce((a, b) => a + b, 0);
  children.push(createTable(
    ["技术组件", "版本", "成熟度", "社区支持", "风险评估"],
    [
      ["FastAPI (Python)", "0.115.0", "高", "活跃（GitHub 75k+ Star）", "低——生产验证充分，文档完善"],
      ["SQLAlchemy ORM", "2.0.35", "高", "活跃（Python ORM 事实标准）", "低——十余年历史，生态成熟"],
      ["MySQL 数据库", "8.0", "高", "活跃（全球最流行开源数据库）", "低——运维经验丰富，生态完善"],
      ["React 前端框架", "19.2.7", "高", "活跃（前端框架份额第一）", "低——函数组件+Hooks模式成熟"],
      ["Ant Design UI 库", "6.5.0", "高", "活跃，国内企业首选", "中——大版本升级需关注兼容性"],
      ["Vite 构建工具", "8.1.1", "高", "活跃（Vue/Rollup 团队开发）", "中——版本较新，关注稳定性"],
      ["JWT 认证 (python-jose)", "3.3.0", "高", "稳定维护", "低——算法单一，HS256 安全充分"],
      ["bcrypt 密码哈希", "4.2.1", "高", "安全领域金标准", "低——单向不可逆，业界公认"],
      ["高德地图 Web API", "最新版", "高", "官方支持，国内市场份额领先", "中——依赖外部服务可用性"],
    ],
    techCols,
    techWidth
  ));

  children.push(h2("5.2  关键技术实现验证"));
  children.push(bodyParaIndent(
    "项目已完成的代码实现充分验证了关键技术方案的可行性：（1）JWT认证流程——utils/auth.py实现了完整的Token生成（HS256算法签名）和验证逻辑，包含过期时间控制和异常捕获，管理后台axios拦截器自动附加Bearer Token并在401时跳转登录页，认证链路完整且可靠；（2）XSS防护——utils/sanitize.py实现了基于白名单策略的HTML内容过滤，对script、iframe等危险标签进行块级清除，剥离onclick等事件属性，过滤javascript:协议，保留p、br、div等安全标签，确保富文本资讯的安全渲染；（3）并发安全——活动报名接口利用数据库悲观锁（SELECT ... FOR UPDATE）在事务中先锁定活动记录，再校验剩余名额和写入报名记录，从根本上杜绝了超卖问题，方案已在SQLAlchemy中实现验证；（4）统一身份管理——users表以openid为唯一标识，通过get_or_create_user()服务函数实现【查即创建】模式，所有业务表通过BIGINT外键关联用户ID，身份隔离清晰。"
  ));

  children.push(h2("5.3  技术风险与应对措施"));
  children.push(bodyParaIndent(
    "经评估，本项目存在以下可管理的技术风险：（1）风险一——Ant Design 6和Vite 8为较新大版本，可能存在与其他依赖的兼容性问题。应对措施：在package.json中锁定精确版本号，上线前执行充分的集成测试；关注官方Release Notes和Breaking Changes，必要时回退到前一个稳定版本。（2）风险二——高德地图API依赖外部服务，存在服务不可用或API变更的风险。应对措施：通过.env环境变量管理API Key，避免硬编码；在公交查询接口中加入超时控制和降级处理，API不可用时返回友好提示而非系统崩溃；关注高德开放平台公告，及时适配API变更。（3）风险三——微信小程序上线需要经过平台审核，审核周期和结果存在不确定性。应对措施：确保小程序内容合规，准备完善的隐私政策和使用说明文档；选择正确的应用类别（工具-生活服务）；预留审核不通过的整改时间。"
  ));

  return { properties: pageProperties, children };
}
