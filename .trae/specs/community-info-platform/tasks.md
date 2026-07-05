# Tasks

- [x] Task 0: MySQL 数据库初始化与建表（最高优先级）
  - [x] SubTask 0.1: 创建 MySQL 数据库 `community_db`（utf8mb4）
  - [x] SubTask 0.2: 编写并执行全部 11 张表的 DDL 建表脚本（admin_users, categories, news, news_likes, feedback, phone_categories, phone_entries, events, registrations, business_categories, businesses）
  - [x] SubTask 0.3: 验证表结构（外键、索引、字段类型）

- [x] Task 1: 后端基础架构搭建
  - [x] SubTask 1.1: 初始化 FastAPI 项目结构（main.py、config.py、.env 配置文件、requirements.txt）
  - [x] SubTask 1.2: 创建 MySQL 数据库连接引擎和 Session 管理（database.py）
  - [x] SubTask 1.3: 定义统一响应模型和分页模型（schemas/common.py）
  - [x] SubTask 1.4: 创建全局异常处理器和 CORS 中间件配置
  - [x] SubTask 1.5: 实现 `/api/health` 健康检查端点

- [x] Task 2: 用户认证模块
  - [x] SubTask 2.1: 创建管理员用户 SQLAlchemy 模型（models/admin.py）
  - [x] SubTask 2.2: 实现 JWT Token 生成与验证逻辑（utils/auth.py）
  - [x] SubTask 2.3: 实现登录接口 POST /api/auth/login 和 GET /api/auth/me
  - [x] SubTask 2.4: 创建认证依赖注入（get_current_user）
  - [x] SubTask 2.5: 编写种子数据脚本，创建默认管理员账号和初始分类数据

- [x] Task 3: 资讯模块 API
  - [x] SubTask 3.1: 创建资讯模型（models/news.py）和分类模型（models/category.py）
  - [x] SubTask 3.2: 实现分类 CRUD API（routers/category.py）
  - [x] SubTask 3.3: 实现资讯管理端 CRUD API（routers/news.py）
  - [x] SubTask 3.4: 实现小程序端资讯列表与详情接口（公开访问，分页+分类筛选）
  - [x] SubTask 3.5: 实现资讯点赞/取消点赞接口 POST /api/news/{id}/like
  - [x] SubTask 3.6: 实现浏览计数自增逻辑

- [x] Task 4: 意见反馈模块 API
  - [x] SubTask 4.1: 创建反馈模型（models/feedback.py）
  - [x] SubTask 4.2: 实现用户提交反馈接口 POST /api/feedback（公开访问）
  - [x] SubTask 4.3: 实现管理端工单列表接口 GET /api/feedback（鉴权，支持状态筛选）
  - [x] SubTask 4.4: 实现工单状态更新接口 PUT /api/feedback/{id}/status（鉴权）
  - [x] SubTask 4.5: 实现反馈图片上传接口 POST /api/upload

- [x] Task 5: 便民电话簿模块 API
  - [x] SubTask 5.1: 创建电话簿模型（models/phone.py）
  - [x] SubTask 5.2: 实现电话簿分类 CRUD API（routers/phone.py）
  - [x] SubTask 5.3: 实现电话条目 CRUD API（routers/phone.py）
  - [x] SubTask 5.4: 实现小程序端电话簿查询接口（公开访问，按分类筛选）

- [x] Task 6: 社区活动报名模块 API
  - [x] SubTask 6.1: 创建活动模型（models/event.py）
  - [x] SubTask 6.2: 实现活动 CRUD API（routers/event.py）
  - [x] SubTask 6.3: 实现小程序端活动列表与详情接口（公开访问）
  - [x] SubTask 6.4: 实现活动报名接口 POST /api/events/{id}/register（校验名额、防重复报名）

- [x] Task 7: 周边商家查询模块 API
  - [x] SubTask 7.1: 创建商家模型（models/business.py）
  - [x] SubTask 7.2: 实现商家分类 CRUD API（routers/business.py）
  - [x] SubTask 7.3: 实现商家 CRUD API（routers/business.py）
  - [x] SubTask 7.4: 实现小程序端商家列表与详情接口（公开访问，按分类筛选）

- [x] Task 8: 公交地铁查询 Skill
  - [x] SubTask 8.1: 创建 Skill 目录结构并编写 skill 定义文件（.trae/skills/bus-metro-query/）
  - [x] SubTask 8.2: 实现高德公交 API 对接逻辑（周边站点查询、线路到站时间）
  - [x] SubTask 8.3: 在后端创建公交查询代理接口 GET /api/transit/nearby 和 GET /api/transit/arrival
  - [x] SubTask 8.4: 编写 Skill 使用文档和测试用例

- [x] Task 9: React 管理后台 - 项目初始化与布局
  - [x] SubTask 9.1: 使用 Vite + React + TypeScript 初始化项目
  - [x] SubTask 9.2: 安装并配置 Ant Design 5、React Router v6、Axios
  - [x] SubTask 9.3: 实现登录页面和 Token 存储逻辑
  - [x] SubTask 9.4: 实现后台主布局（侧边导航 + 顶栏 + 内容区）
  - [x] SubTask 9.5: 实现路由守卫和 Axios 请求拦截器（自动附加 Token）

- [x] Task 10: React 管理后台 - 资讯管理页面
  - [x] SubTask 10.1: 实现分类管理页面（树形表格、新增/编辑/删除对话框）
  - [x] SubTask 10.2: 实现资讯列表页面（分页表格、搜索、分类筛选）
  - [x] SubTask 10.3: 实现资讯发布/编辑页面（富文本编辑器、封面上传、分类选择）

- [x] Task 11: React 管理后台 - 功能管理页面
  - [x] SubTask 11.1: 实现反馈工单管理页面（列表、状态筛选、状态流转、备注）
  - [x] SubTask 11.2: 实现电话簿管理页面（分类管理 + 条目 CRUD）
  - [x] SubTask 11.3: 实现活动管理页面（活动 CRUD + 报名记录查看）
  - [x] SubTask 11.4: 实现商家管理页面（分类管理 + 商家 CRUD + 图片上传）

- [x] Task 12: 微信小程序端 - 项目初始化与首页
  - [x] SubTask 12.1: 初始化微信小程序项目结构（app.json、全局样式）
  - [x] SubTask 12.2: 封装 HTTP 请求工具（wx.request Promise 化 + 统一错误处理）
  - [x] SubTask 12.3: 实现首页布局（Banner 轮播、功能入口网格、最新资讯列表）
  - [x] SubTask 12.4: 实现底部 TabBar 导航（首页、资讯、服务、我的）

- [x] Task 13: 微信小程序端 - 资讯模块
  - [x] SubTask 13.1: 实现资讯列表页（分类 Tab 切换、下拉刷新、上拉加载更多）
  - [x] SubTask 13.2: 实现资讯详情页（富文本渲染、点赞互动、分享功能）
  - [x] SubTask 13.3: 实现资讯搜索功能

- [x] Task 14: 微信小程序端 - 便民服务模块
  - [x] SubTask 14.1: 实现便民电话簿页面（分类列表 + 条目列表 + 一键拨号）
  - [x] SubTask 14.2: 实现社区活动页面（活动列表 + 详情 + 在线报名表单）
  - [x] SubTask 14.3: 实现周边商家页面（分类筛选 + 商家列表 + 详情）
  - [x] SubTask 14.4: 实现公交地铁查询页面（定位 + 周边站点 + 线路到站信息）

- [x] Task 15: 微信小程序端 - 反馈与个人中心
  - [x] SubTask 15.1: 实现意见反馈页面（表单、图片上传、提交）
  - [x] SubTask 15.2: 实现"我的"页面（我的点赞、我的报名、我的反馈记录）
  - [x] SubTask 15.3: 实现反馈记录列表页（查看提交历史和处理状态）

- [x] Task 16: 集成测试与部署文档
  - [x] SubTask 16.1: 编写后端 API 测试用例（pytest）
  - [x] SubTask 16.2: 编写项目启动指南（README）
  - [x] SubTask 16.3: 编写后端 .env 配置模板

# Task Dependencies
- Task 0（建表）为所有后端任务的前置条件
- Task 1 依赖 Task 0
- Task 2 依赖 Task 1
- Task 3-7（所有业务模块 API）依赖 Task 1, Task 2
- Task 8 依赖 Task 1
- Task 9 依赖 Task 1
- Task 10-11 依赖 Task 9，并行依赖 Task 2-7 对应 API
- Task 12 独立启动，可在 Task 1 完成后开始
- Task 13-15 依赖 Task 12，并行依赖 Task 2-8 对应 API
- Task 16 依赖所有前置任务

# 可并行执行的任务组
- Task 2-8（后端 API）可在 Task 1 完成后并行开发
- Task 10-11（管理后台页面）可在 Task 9 完成后并行开发
- Task 13-15（小程序页面）可在 Task 12 完成后并行开发
