import { Paragraph } from "docx";
import { h1, h2, h3, bodyParaIndent, emptyLine } from "../styles/paragraph-styles";
import { createTable } from "../styles/table-helpers";
import { pageProperties } from "../styles/fonts";

export function buildChapter3(): { properties: Record<string, unknown>; children: (Paragraph | ReturnType<typeof createTable>)[] } {
  const children: (Paragraph | ReturnType<typeof createTable>)[] = [];

  children.push(h1("3  所建议的系统"));

  // 3.1 系统概述
  children.push(h2("3.1  对所建系统的说明"));
  children.push(bodyParaIndent(
    "社区便民资讯平台是一个基于B/S架构和微信小程序的综合性社区数字化服务平台，采用三层架构设计。客户端层包含微信小程序（面向社区居民的12个功能页面）和React管理后台（面向社区管理员的7个功能页面）；服务端层基于FastAPI框架构建，提供9个路由模块共计40余个RESTful API接口；数据层采用MySQL 8.0关系型数据库，设计13张核心数据表，使用utf8mb4字符集确保全量Unicode字符兼容。系统通过高德地图Web API实现公交地铁实时查询功能，并通过TRAE Skill框架封装对外服务接口。"
  ));

  // 3.2 功能模块详述
  children.push(h2("3.2  功能模块详述"));
  children.push(bodyParaIndent("本系统涵盖以下七大核心功能模块，各模块的功能点及对应的API路由接口如下表所示："));
  children.push(emptyLine());

  const colWidths = [1000, 3500, 3000, 1560];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0); // 9060
  children.push(createTable(
    ["序号", "模块名称", "功能点", "对应路由"],
    [
      ["1", "用户认证模块", "管理员登录、JWT Token签发与验证、bcrypt密码哈希", "/api/auth"],
      ["2", "资讯管理模块", "两级分类管理、资讯CRUD、富文本发布、点赞/取消点赞、浏览计数", "/api/categories\n/api/news"],
      ["3", "意见反馈模块", "反馈工单提交(含图片)、状态流转(待处理→处理中→已解决)、处理备注", "/api/feedback"],
      ["4", "便民电话簿模块", "电话分类管理、条目CRUD、按分类查询、一键拨打", "/api/phone-categories\n/api/phone-entries"],
      ["5", "活动报名模块", "活动发布/编辑/删除、在线报名、悲观锁防超卖、取消报名(物理删除)", "/api/events"],
      ["6", "周边商家模块", "商家分类管理、商家CRUD(含图片)、按分类查询", "/api/business-categories\n/api/businesses"],
      ["7", "公交查询模块", "周边站点查询、线路实时到站、地址编码转换(高德API)", "/api/transit"],
    ],
    colWidths,
    tableWidth
  ));

  // 3.3 技术架构
  children.push(h2("3.3  技术架构"));
  children.push(bodyParaIndent("本系统采用当前业界成熟的主流技术栈，各层级技术选型及版本信息如下表所示："));
  children.push(emptyLine());

  const techCols = [2200, 3000, 1860, 2000];
  const techWidth = techCols.reduce((a, b) => a + b, 0);
  children.push(createTable(
    ["层级", "技术选型", "版本", "说明"],
    [
      ["后端框架", "FastAPI (Python)", "0.115.0", "异步Web框架，支持OpenAPI自动生成"],
      ["ORM", "SQLAlchemy", "2.0.35", "Python最成熟的ORM框架"],
      ["数据库", "MySQL", "8.0", "关系型数据库，utf8mb4字符集"],
      ["认证", "python-jose + passlib", "3.3.0 / 1.7.4", "JWT(HS256) + bcrypt密码哈希"],
      ["管理前端框架", "React + TypeScript", "19.2.7 / 6.0", "函数组件 + Hooks + TS类型约束"],
      ["UI组件库", "Ant Design", "6.5.0", "企业级React UI组件库"],
      ["构建工具", "Vite", "8.1.1", "新一代前端构建工具"],
      ["HTTP客户端", "Axios", "1.18.1", "请求拦截器注入Token，401自动跳转"],
      ["外部API", "高德地图 Web API", "—", "公交站点查询与实时到站"],
      ["微信小程序", "原生框架", "—", "12个页面的居民端应用"],
    ],
    techCols,
    techWidth
  ));

  // 3.4 数据库设计
  children.push(h2("3.4  数据库设计"));
  children.push(bodyParaIndent("系统数据库共设计13张核心表，涵盖用户管理、资讯内容、便民服务、活动报名、商家展示和附件管理六大领域："));
  children.push(emptyLine());

  const dbCols = [600, 2200, 1600, 4660];
  const dbWidth = dbCols.reduce((a, b) => a + b, 0);
  children.push(createTable(
    ["序号", "表名", "领域", "关键设计说明"],
    [
      ["1", "admin_users", "管理员", "username唯一索引；bcrypt密码哈希；支持nickname和avatar"],
      ["2", "users", "统一用户", "openid唯一索引；支持nickname/phone；统一管理小程序用户身份"],
      ["3", "categories", "资讯分类", "parent_id自引用实现两级层级；sort_order排序"],
      ["4", "news", "资讯内容", "复合索引idx_category_status_published优化列表查询；cover_image封面图"],
      ["5", "news_likes", "资讯点赞", "UNIQUE KEY(user_id, news_id)防重复点赞"],
      ["6", "feedback", "意见反馈", "status状态流转(0待处理/1处理中/2已解决)；handler_id记录处理人"],
      ["7", "phone_categories", "电话分类", "便民服务电话分类管理，如物业维修、医疗服务等"],
      ["8", "phone_entries", "电话条目", "name+phone+remark；支持一键拨打"],
      ["9", "events", "社区活动", "max_participants人数上限；location/detail活动信息"],
      ["10", "registrations", "活动报名", "UNIQUE KEY(user_id, event_id)防重复报名；物理DELETE取消报名"],
      ["11", "business_categories", "商家分类", "包含餐饮、超市、药店等8个默认分类"],
      ["12", "businesses", "商家信息", "name/address/phone/business_hours/description；支持图片展示"],
      ["13", "image_attachments", "图片附件", "多态关联(owner_type+owner_id)；替代JSON字段提升性能和可维护性"],
    ],
    dbCols,
    dbWidth
  ));

  // 3.5 安全设计
  children.push(h2("3.5  安全设计"));
  children.push(bodyParaIndent(
    "本系统在安全性方面实施了多层防护措施：（1）XSS防护——通过utils/sanitize.py实现HTML内容清洗，对<script>、<iframe>等危险标签进行块级清除，剥离onclick等事件属性，过滤javascript:伪协议，保留p、br、div等安全白名单标签，确保富文本资讯的安全展示；（2）并发安全——活动报名接口采用数据库悲观锁（SELECT ... FOR UPDATE）机制，在事务中锁定活动记录后再进行名额校验和扣减，从根本上杜绝超卖问题；（3）身份安全——设立统一的users表，以openid为唯一标识，所有业务表外键均关联users表的BIGINT型id，防止用户身份混淆和篡改；（4）认证安全——管理员登录采用JWT (HS256算法) Token认证，Token有效期8小时，密码使用bcrypt不可逆哈希存储，从源头保障凭证安全。"
  ));

  return { properties: pageProperties, children };
}
