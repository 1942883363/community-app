# Checklist

## 代码层验证（已通过）
- [x] DDL 建表脚本 `backend/sql/init.sql` 已创建，包含全部 11 张表的完整 DDL
- [x] 种子数据脚本 `backend/seed.py` 已创建，包含管理员和初始分类数据
- [x] 后端 Python 导入验证通过（`config.py`, `database.py`, `models`, `routers`, `schemas` 全部正常导入）
- [x] 后端 `.env.example` 配置模板已创建
- [x] 统一响应格式 `utils/response.py` 已实现（`success_response`, `error_response`, `paginated_response`）
- [x] JWT 认证逻辑已实现（`POST /api/auth/login`, `GET /api/auth/me`, Bearer Token 验证）
- [x] 资讯分类 CRUD API 已实现（`routers/category.py`）
- [x] 资讯 CRUD API 已实现（`routers/news.py`，含分页、分类筛选、点赞、浏览计数）
- [x] 意见反馈 API 已实现（`routers/feedback.py`，含状态流转和图片上传）
- [x] 电话簿 API 已实现（`routers/phone.py`，分类 CRUD + 条目 CRUD）
- [x] 活动 API 已实现（`routers/event.py`，含名额校验和防重复报名）
- [x] 商家 API 已实现（`routers/business.py`，分类 CRUD + 商家 CRUD）
- [x] 公交查询 API 已实现（`routers/transit.py`，4 个代理端点）
- [x] 公交地铁查询 Skill 已创建（`skill.yaml` + `handler.py`，7 大功能模块）
- [x] 管理后台 TypeScript 编译通过（`npx tsc --noEmit` 零错误）
- [x] 管理后台登录页面已实现（Login 表单 + Token 存储）
- [x] 管理后台路由守卫已实现（AuthGuard 组件 + Axios 401 拦截）
- [x] 管理后台主布局已实现（侧边导航 + 顶栏用户信息 + 内容区）
- [x] 管理后台资讯管理页面已实现（分类管理 + 资讯列表 + 发布/编辑）
- [x] 管理后台反馈工单管理页面已实现（列表、状态筛选、状态流转、备注）
- [x] 管理后台电话簿管理页面已实现（分类/条目 CRUD）
- [x] 管理后台活动管理页面已实现（活动 CRUD + 报名记录查看）
- [x] 管理后台商家管理页面已实现（分类/商家 CRUD）
- [x] 小程序项目结构已创建（app.json 配置 + TabBar 导航）
- [x] 小程序 HTTP 请求工具已封装（Promise 化 + X-User-Id + 错误处理）
- [x] 小程序首页已实现（Banner 轮播、功能入口、最新资讯）
- [x] 小程序资讯模块已实现（列表、详情、点赞、分享、搜索）
- [x] 小程序电话簿页已实现（分类筛选 + 条目列表 + 一键拨号）
- [x] 小程序活动模块已实现（列表、详情、在线报名表单）
- [x] 小程序周边商家模块已实现（分类筛选、列表、详情、地图导航）
- [x] 小程序公交查询页已实现（定位 + 周边站点 + 线路搜索）
- [x] 小程序反馈提交页已实现（表单 + 图片上传）
- [x] 小程序个人中心页已实现（点赞/报名/反馈记录查看）

## 运行时验证（需配置 MySQL 和高德 API Key 后验证）
- [ ] MySQL 数据库 `community_db` 创建成功，字符集为 utf8mb4
- [ ] 所有 11 张表建表 DDL 执行成功，外键和索引正确
- [ ] 种子数据脚本可成功插入默认管理员和初始分类
- [ ] 后端项目可正常启动，`/api/health` 返回健康状态
- [ ] 管理员可通过 POST /api/auth/login 获取 JWT Token
- [ ] 公交地铁查询 Skill 可正常调用高德 API 返回周边站点
- [ ] 公交地铁查询 Skill 可返回线路实时到站信息
