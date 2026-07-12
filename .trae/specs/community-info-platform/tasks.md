# 社区便民资讯平台 开发任务记录

## 项目概述

社区便民资讯平台由 FastAPI 后端 + React 管理后台 + 微信原生小程序 三部分组成，实现了资讯管理、便民电话、社区活动、周边商家、意见反馈、公交查询、用户系统、图片审核、仪表盘统计等核心功能。

---

## 阶段一：项目初始化与基础架构

### TASK-001 后端项目搭建 ✅
- FastAPI 应用入口（main.py）
- SQLAlchemy 数据库引擎 + Session 管理（database.py）
- pydantic-settings 配置管理（config.py, .env）
- CORS 中间件 + 全局异常处理器
- MySQL 数据库初始化脚本（sql/init.sql）

### TASK-002 管理后台项目搭建 ✅
- Vite + React 18 + TypeScript + Ant Design 5 项目初始化
- axios 请求封装 + Token 拦截器 + 401 处理
- AuthProvider + useAuth React Context
- AuthGuard 路由守卫（三态：loading/authenticated/unauthenticated）
- 主布局（侧边栏 + 顶栏）

### TASK-003 小程序项目搭建 ✅
- 微信原生框架项目初始化
- wx.request Promise 封装（request.js）
- 设备标识 UUID 生成 + 存储（getUserId）
- 图片路径解析（resolveImage）
- TabBar 配置（首页/资讯/出行/我的）

---

## 阶段二：核心业务模块开发

### TASK-004 管理员认证系统 ✅
**后端**：
- AdminUser 模型 + JWT 登录（utils/auth.py）
- bcrypt 密码哈希/验证
- POST /api/auth/login + GET /api/auth/me
- get_current_user 依赖注入

**前端**：
- 登录页面
- Token sessionStorage 存储
- 启动时主动验证 Token
- 401 拦截 → 清除 Token → 跳转登录

### TASK-005 资讯模块 ✅
**后端**：
- Category + News + NewsLike 模型
- Category CRUD（/api/categories）
- News CRUD + 置顶 + 点赞 + 点赞状态查询（/api/news）
- 分页列表支持 category_id/status 筛选
- 浏览计数自增
- 封面图审核记录自动创建

**管理后台**：
- 分类管理页面
- 资讯列表（分页 + 分类筛选）
- 资讯编辑（封面上传 + 置顶）
- 资讯新增/删除

**小程序**：
- 首页轮播 + 分类入口 + 最新资讯
- 资讯列表（分类筛选 + 上拉加载）
- 资讯详情 + 点赞
- 浏览计数

### TASK-006 意见反馈模块 ✅
**后端**：Feedback 模型 + CRUD + 状态管理（/api/feedback）
**管理后台**：反馈列表 + 状态筛选 + 回复 + 删除
**小程序**：反馈表单（文字 + 图片上传）+ 提交

### TASK-007 便民电话簿模块 ✅
**后端**：PhoneCategory + PhoneEntry 模型 + CRUD（/api/phone-categories, /api/phone-entries）
**管理后台**：分类 + 条目管理
**小程序**：分类浏览 + 一键拨号 + 搜索

### TASK-008 社区活动模块 ✅
**后端**：
- Event + Registration 模型
- Event CRUD + 报名 + 报名列表（/api/events）
- enrolled_count 实时 SQL COUNT 计算
- 重复报名 UNIQUE 约束
- 封面图审核记录自动创建

**管理后台**：活动列表 + 新增/编辑 + 报名列表
**小程序**：活动列表 + 详情 + 报名

### TASK-009 周边商家模块 ✅
**后端**：BusinessCategory + Business 模型 + CRUD（/api/business-categories, /api/businesses）
**管理后台**：分类 + 商家管理（Logo 上传、business_hours）
**小程序**：分类浏览 + 详情

### TASK-010 公交查询模块 ✅
**后端**：高德 API 代理（/api/transit/nearby, /api/transit/arrival）
**小程序**：周边站点 + 实时到站查询界面

### TASK-011 文件上传系统 ✅
**后端**：
- POST /api/upload（管理上传，MIME 白名单）
- POST /api/upload/public（小程序上传，Pillow 强制转 JPG）
- create_image_review() 公共函数导出
- is_image_approved() 审核状态查询

### TASK-012 图片审核模块 ✅
**后端**：
- ImageReview 模型（image_reviews 表）
- GET /api/reviews（分页 + status 筛选）
- PUT approve / reject
- GET /api/reviews/check
- 所有业务 Create/Update 自动创建审核记录
- 所有 GET 端点过滤未审核图片

**管理后台**：
- 审核列表（三 Tab：全部/待审核/已通过/已拒绝）
- 通过/拒绝操作

---

## 阶段三：用户系统与密码安全

### TASK-013 小程序用户系统 ✅
**后端**：
- User 模型（openid + nickname + phone + password_hash + avatar）
- PUT /api/users/register（昵称+手机号唯一校验，bcrypt 哈希）
- POST /api/users/login（手机号+密码，openid 绑定切换）
- POST /api/users/logout（openid 清空解绑）
- GET/PUT /api/users/me（个人信息 + 密码修改）
- GET /api/users/search（昵称搜索）

**小程序**：
- 注册/登录页面（头像选择 + 昵称 + 手机号 + 密码）
- 头像上传 → Pillow 转 JPG
- 个人中心（头像展示 + 编辑资料）
- 游客模式（跳过登录）

### TASK-014 管理后台用户管理 ✅
**后端**：
- GET /api/users（列表 + 分页 + 搜索）
- GET/PUT/DELETE /api/users/{id}（含密码 bcrypt 重新哈希）

**前端**：
- 用户列表（分页 + 搜索）
- 编辑弹窗（含密码输入框，留空不修改）
- 用户删除

### TASK-015 密码安全加固 ✅
- users 表新增 password_hash 列
- 注册/登录双向 bcrypt 验证
- 管理后台编辑用户密码 bcrypt 重新哈希
- 用户自己修改密码 bcrypt 重新哈希
- 共享 pwd_context（utils/password.py）

### TASK-016 仪表盘统计 ✅
**后端**：
- GET /api/dashboard/stats（六维度 SELECT COUNT）
- news/feedback/phone/event/business/user

**前端**：
- 六张统计卡片
- useEffect 动态获取数据

---

## 阶段四：Bug 修复与优化

### TASK-017 Token 安全加固 ✅
**问题**：localStorage 持久存储，关闭标签页不失效
**修复**：改为 sessionStorage + 启动时主动验证 + AuthGuard 三态防闪烁

### TASK-018 Dashboard 数据全为 0 ✅
**问题**：前端 Statistic value={0} 硬编码
**修复**：新建后端统计接口 + 前端动态取值

### TASK-019 图片审核全链路缺陷 ✅
**问题 1**：审核表孤立，业务接口不创建也不读取审核记录
**修复**：create_image_review() 注入所有 Create/Update，is_image_approved() 注入所有 GET

**问题 2**：Business 前后端字段不一致（images[] vs logo）
**修复**：统一为 logo: string + 单图上传

**问题 3**：Event 前后端字段不一致（location/start_time vs address/event_date）
**修复**：全部对齐后端 schema

### TASK-020 小程序头像空白（三阶段排查）✅
**阶段一**：审核表 status=0 阻断 → auto_approve=true
**阶段二**：MIME 类型被拒绝（wx.uploadFile 非标准 Content-Type）→ 移除检查 + Pillow 转 JPG
**阶段三**：upload fail 静默吞错 → console.error + Toast 提示

### TASK-021 用户登录/注册数据覆盖 Bug ✅
**问题 1**：退出登录清空 nickname → 登录按 nickname 查找失败
**修复**：退出改 openid="" 解绑，nickname 保留

**问题 2**：同设备注册新账号覆盖旧数据
**修复**：注册新建行，旧行 openid 解绑

**问题 3**：登录切换账号丢失旧数据
**修复**：openid 绑定切换，旧行解绑，不删字段

### TASK-022 500 Internal Server Error + 重复插入 ✅
**问题 1**：openid 唯一约束冲突（两个对象同时持有）
**修复**：openid="" + db.flush() 两步法

**问题 2**：GET /me 每次创建空行
**修复**：/me 只查不创，不存在返回空

### TASK-023 管理员编辑密码不哈希 ✅
**问题**：密码字段直接写入 password_hash，未 bcrypt 处理
**修复**：update_user 和 update_self 增加密码拦截 → pwd_context.hash()

### TASK-024 审核管理页空列表 ✅
**问题**：res.data.items 取值路径错误（少一层 data 嵌套）
**修复**：兼容 body.data?.items ?? body.items ?? []

### TASK-025 小程序连接失败无提示 ✅
**问题**：首页 catch 无提示，用户只能看到空白
**修复**：console.error + Toast "网络异常，请检查服务器"

---

## 阶段五：文档与规范化

### TASK-026 系统设计文档 ✅
- 创建 docs/系统设计与实践文档.md
- 10 章完整内容：概述、架构、技术栈、数据库、后端实现、管理后台、小程序、AI 交互、安全、踩坑记录
- 更新 .trae/specs/ 四份文档与当前项目状态对齐

---

## 当前状态总结

### 已完成
| 模块 | 状态 |
|------|------|
| 后端全部 12 个路由模块 | ✅ 已完成 |
| 数据库 14 张表 | ✅ 已完成 |
| 管理后台 9 个页面 | ✅ 已完成 |
| 小程序 12 个页面 | ✅ 已完成 |
| 用户注册/登录/密码系统 | ✅ 已完成 |
| 图片审核系统 | ✅ 已完成 |
| 仪表盘统计 | ✅ 已完成 |
| JWT 安全加固 | ✅ 已完成 |
| TypeScript 编译 | ✅ 零错误 |
| 系统文档 | ✅ 已完成 |

### 待优化（未来迭代）
| 项目 | 说明 |
|------|------|
| 微信登录 | 接入 wx.login 获取真实 openid |
| Token 刷新 | refresh_token 机制 |
| 接口限流 | Rate Limiting |
| 图片审核手动模式 | 部分场景改为管理员人工审核 |
| 消息推送 | 活动通知、反馈处理通知 |
| 数据导出 | Excel/CSV 导出 |
| 小程序主题适配 | 夜间模式 |
| E2E 测试 | Playwright/Cypress |
