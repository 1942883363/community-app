import { Paragraph } from "docx";
import { h1, h2, bodyParaIndent } from "../styles/paragraph-styles";
import { pageProperties } from "../styles/fonts";

export function buildChapter6(): { properties: Record<string, unknown>; children: Paragraph[] } {
  const children: Paragraph[] = [];

  children.push(h1("6  采用建议系统可能带来的影响"));

  children.push(h2("6.1  对设备的影响"));
  children.push(bodyParaIndent(
    "服务端方面，系统初期可部署于1台云服务器（最低配置2核4G内存、50G SSD存储），随着用户规模增长可按需垂直或水平扩展。管理端运行于现代浏览器（Chrome、Edge、Firefox），无特殊硬件配置要求。居民端运行于用户的智能手机上（iOS或Android系统）通过微信小程序访问，不产生额外硬件成本。总体而言，系统对硬件设备的需求在可控范围内。"
  ));

  children.push(h2("6.2  对现有软件的影响"));
  children.push(bodyParaIndent(
    "服务端需要新增部署Python 3.10+运行环境和MySQL 8.0数据库实例，均为成熟且免费的开源软件。前端构建需要Node.js 18+环境。生产环境推荐使用Nginx作为反向代理和静态文件服务器。系统设计为独立部署，与现有软件系统无耦合关系，不需要对已有系统进行修改。"
  ));

  children.push(h2("6.3  对用户的影响"));
  children.push(bodyParaIndent(
    "对于社区居民用户，平台以微信小程序形式提供服务，无需下载安装额外的App，仅需在微信中搜索或扫码即可使用。操作界面遵循微信小程序设计规范，交互逻辑直观，无需专门培训。对于社区管理员，通过浏览器访问管理后台进行操作，界面采用Ant Design标准化组件，对于有一定计算机操作经验的管理员可以快速上手，预计培训时间不超过半天。替代原有的纸质台账和Excel管理方式后，工作效率将显著提升。"
  ));

  children.push(h2("6.4  对系统运行的影响"));
  children.push(bodyParaIndent(
    "系统采用前后端分离架构，后端API统一以/api为前缀，通过Nginx反向代理转发请求；静态资源（上传的图片文件）通过FastAPI的StaticFiles中间件挂载/uploads路径提供访问；数据库连接采用SQLAlchemy连接池管理（pool_pre_ping健康检查 + pool_recycle 3600秒自动回收），保障长时间运行的稳定性；全局异常处理中间件捕获所有未处理异常，统一返回{\"code\": 500, \"message\": \"...\", \"data\": null}格式，避免敏感信息泄露。系统失效后可通过重启服务和恢复数据库备份快速恢复，建议配置定时数据库备份策略（如每日全量备份）。"
  ));

  children.push(h2("6.5  对开发环境的影响"));
  children.push(bodyParaIndent(
    "为支持本系统的开发，需要配置以下开发环境资源：Python 3.10+开发环境及pip依赖管理（13个Python包，详见backend/requirements.txt）；Node.js 18+及npm依赖管理（7个生产依赖包，详见admin-frontend/package.json）；MySQL 8.0数据库开发实例（运行sql/init.sql完成建表，运行seed.py初始化种子数据）；Visual Studio Code等代码编辑器。所有开发工具和框架均为免费开源，不涉及商业授权费用。"
  ));

  children.push(h2("6.6  对运行环境的影响"));
  children.push(bodyParaIndent(
    "生产环境部署需要：一台Linux/Windows云服务器，配置Nginx作为反向代理和静态资源服务器，Uvicorn/Gunicorn作为Python应用服务器；一个MySQL 8.0数据库实例（可与应用共用服务器或独立部署）；一个已备案的域名及SSL证书（微信小程序强制要求HTTPS通信）；一个高德地图Web API开发者Key。系统不涉及对建筑物改造或特殊环境设施的要求。"
  ));

  children.push(h2("6.7  对经费支出的影响"));
  children.push(bodyParaIndent(
    "为开发、部署和维持本系统的运行，预计需要的各项经费开支包括：开发阶段的人力成本、服务器和域名等基础设施费用、高德地图API按量付费、微信小程序认证年费等。详细的经费支出分析和估算见本报告第10章经济可行性分析。"
  ));

  return { properties: pageProperties, children };
}
