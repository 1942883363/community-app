import { Paragraph } from "docx";
import { h1, h2, bodyParaIndent } from "../styles/paragraph-styles";
import { pageProperties } from "../styles/fonts";

export function buildChapter9(): { properties: Record<string, unknown>; children: Paragraph[] } {
  const children: Paragraph[] = [];

  children.push(h1("9  用户使用可行性"));

  children.push(h2("9.1  居民端（微信小程序）"));
  children.push(bodyParaIndent(
    "居民端以微信小程序为载体，规划12个功能页面覆盖所有核心使用场景，包括首页资讯推荐、分类资讯列表、资讯详情、我的收藏/点赞、反馈提交与查看、电话簿查询、活动浏览与报名、商家浏览、公交线路查询等。交互设计遵循微信小程序的导航规范，首页采用Banner轮播和功能入口网格布局，用户可直观找到所需功能。列表页支持下拉刷新和上拉加载更多，加载状态和空状态均有合理提示。资讯详情页渲染富文本内容，支持图片查看和点赞操作。拨打电话、查看地图定位等操作对接微信原生能力（wx.makePhoneCall、wx.openLocation），用户无需跳转到外部应用，体验流畅统一。"
  ));

  children.push(h2("9.2  管理端（React 管理后台）"));
  children.push(bodyParaIndent(
    "管理后台基于React 19和Ant Design 6构建，包含7个功能页面：数据仪表盘首页、资讯分类管理页、资讯列表与编辑页、意见反馈管理页、电话簿管理页、活动管理页和商家管理页。所有列表页面均提供分页表格、按状态/分类筛选和关键字搜索功能，满足管理员日常运营的数据查阅需求。资讯编辑页使用富文本编辑器，支持图文混排和分类选择。状态流转操作（如反馈工单从【待处理】切换为【处理中】）需要通过二次确认防止误操作。系统通过JWT Token实现自动登录续期，Token过期或无效时自动跳转登录页，保证操作安全性。管理后台整体交互逻辑与常见的B端系统一致，管理员基本无学习成本。"
  ));

  children.push(h2("9.3  可访问性与性能"));
  children.push(bodyParaIndent(
    "在可访问性方面，系统正文采用12pt（小四号）字号，保障基本阅读舒适度；关键操作按钮色彩对比度满足WCAG 2.1 AA级标准；危险操作（如删除资讯、取消活动）均有二次确认弹窗防止误触发。在性能方面，后端API借助FastAPI的异步IO能力和数据库索引优化（如资讯表复合索引idx_category_status_published），目标将列表接口响应时间控制在500ms以内；前端采用Vite构建实现秒级开发热更新和快速生产打包；小程序端对图片资源进行自动压缩处理，优化弱网环境下的加载体验。"
  ));

  return { properties: pageProperties, children };
}
