# 社区便民资讯平台 功能验证清单

## 1. 后端 API 验证

### 1.1 管理员认证
- [x] POST `/api/auth/login` — 用户名+密码登录，返回 JWT Token
- [x] GET `/api/auth/me` — 验证 Token 并返回管理员信息

### 1.2 仪表盘
- [x] GET `/api/dashboard/stats` — 返回 6 维度统计（news/feedback/phone/event/business/user）

### 1.3 资讯分类
- [x] GET `/api/categories` — 获取分类列表（公开访问）
- [x] POST `/api/categories` — 创建分类
- [x] PUT `/api/categories/{id}` — 更新分类
- [x] DELETE `/api/categories/{id}` — 删除分类

### 1.4 资讯管理
- [x] GET `/api/news` — 分页列表（category_id/status 筛选）
- [x] GET `/api/news/{id}` — 详情（view_count 自增）
- [x] POST `/api/news` — 发布（自动创建 news_cover 审核记录）
- [x] PUT `/api/news/{id}` — 编辑
- [x] DELETE `/api/news/{id}` — 删除
- [x] PUT `/api/news/{id}/top` — 置顶/取消置顶
- [x] POST `/api/news/{id}/like` — 点赞/取消点赞（toggle）
- [x] GET `/api/news/{id}/like-status` — 查询点赞状态
- [x] 资讯列表 GET 端点过滤未审核封面

### 1.5 意见反馈
- [x] POST `/api/feedback` — 提交反馈
- [x] GET `/api/feedback` — 工单列表（分页 + status 筛选）
- [x] GET `/api/feedback/{id}` — 工单详情
- [x] PUT `/api/feedback/{id}` — 处理工单（状态更新/回复）
- [x] DELETE `/api/feedback/{id}` — 删除反馈

### 1.6 便民电话簿
- [x] GET `/api/phone-categories` — 分类列表（公开）
- [x] POST `/api/phone-categories` — 创建分类
- [x] PUT `/api/phone-categories/{id}` — 更新分类
- [x] DELETE `/api/phone-categories/{id}` — 删除分类
- [x] GET `/api/phone-entries` — 条目列表（category_id 筛选）
- [x] POST `/api/phone-entries` — 创建条目
- [x] PUT `/api/phone-entries/{id}` — 更新条目
- [x] DELETE `/api/phone-entries/{id}` — 删除条目

### 1.7 社区活动
- [x] GET `/api/events` — 列表（分页 + enrolled_count 计算）
- [x] GET `/api/events/{id}` — 详情
- [x] POST `/api/events` — 发布（自动创建 event_cover 审核记录）
- [x] PUT `/api/events/{id}` — 编辑
- [x] DELETE `/api/events/{id}` — 删除（级联删除报名记录）
- [x] POST `/api/events/{id}/register` — 报名（防重复报名）
- [x] GET `/api/events/{id}/registrations` — 查看报名列表
- [x] 活动列表 GET 端点过滤未审核封面

### 1.8 周边商家
- [x] GET `/api/business-categories` — 分类列表（公开）
- [x] POST `/api/business-categories` — 创建分类
- [x] PUT `/api/business-categories/{id}` — 更新分类
- [x] DELETE `/api/business-categories/{id}` — 删除分类
- [x] GET `/api/businesses` — 商家列表（category_id 筛选）
- [x] POST `/api/businesses` — 创建商家（自动创建 business_logo 审核记录）
- [x] PUT `/api/businesses/{id}` — 更新商家
- [x] DELETE `/api/businesses/{id}` — 删除商家
- [x] 商家列表 GET 端点过滤未审核 Logo

### 1.9 公交查询
- [x] GET `/api/transit/nearby` — 周边站点（代理高德 API）
- [x] GET `/api/transit/arrival` — 实时到站信息

### 1.10 文件上传
- [x] POST `/api/upload` — 管理后台上传（MIME 白名单校验）
- [x] POST `/api/upload/public` — 小程序上传（Pillow 强制转 JPG，无 MIME 检查）

### 1.11 用户系统
- [x] PUT `/api/users/register` — 注册（昵称+手机号+密码，bcrypt 哈希）
- [x] POST `/api/users/login` — 登录（手机号+密码，openid 绑定切换）
- [x] POST `/api/users/logout` — 退出（openid 清空解绑）
- [x] GET `/api/users/me` — 获取当前用户（不存在返回空，不创建行）
- [x] PUT `/api/users/me` — 修改个人资料（含密码 bcrypt）
- [x] GET `/api/users` — 后台列表（分页+搜索）
- [x] GET `/api/users/{id}` — 详情
- [x] PUT `/api/users/{id}` — 编辑（含密码 bcrypt 哈希）
- [x] DELETE `/api/users/{id}` — 删除
- [x] GET `/api/users/search` — 按昵称搜索

### 1.12 图片审核
- [x] GET `/api/reviews` — 审核列表（分页 + status 筛选）
- [x] PUT `/api/reviews/{id}/approve` — 通过
- [x] PUT `/api/reviews/{id}/reject` — 拒绝
- [x] GET `/api/reviews/check` — 查询审核状态

---

## 2. 管理后台功能验证

### 2.1 认证
- [x] 登录页 — 用户名+密码登录
- [x] AuthGuard — 未登录跳转登录页，loading 态防闪烁
- [x] Token 存储 — sessionStorage
- [x] Token 验证 — App 启动时主动调 /auth/me
- [x] 401 拦截 — Token 失效自动跳转登录页

### 2.2 仪表盘
- [x] 六维度统计卡片（news/feedback/phone/event/business/user）
- [x] 从后端动态获取数据

### 2.3 资讯管理
- [x] 分类管理（创建/编辑/删除）
- [x] 资讯列表（分页 + 分类筛选）
- [x] 资讯编辑（富文本 + 封面上传）
- [x] 资讯新增/删除
- [x] 资讯置顶

### 2.4 反馈管理
- [x] 反馈列表（分页 + 状态筛选）
- [x] 回复反馈
- [x] 更新状态（待处理 ↔ 已处理）

### 2.5 电话簿管理
- [x] 分类管理
- [x] 条目管理（按分类 + 分页）

### 2.6 活动管理
- [x] 活动列表
- [x] 活动新增/编辑（event_date + event_time 字段对齐后端）
- [x] 报名列表查看

### 2.7 商家管理
- [x] 分类管理
- [x] 商家列表（字段对齐后端：logo/business_hours）
- [x] 商家新增/编辑（Logo 单图上传）

### 2.8 用户管理
- [x] 用户列表（分页 + 搜索）
- [x] 用户编辑（含密码输入框，留空不修改）
- [x] 用户删除

### 2.9 图片审核
- [x] 审核列表（分页 + 状态筛选）
- [x] 通过/拒绝操作

---

## 3. 小程序功能验证

### 3.1 首页
- [x] 轮播 banner
- [x] 分类入口
- [x] 最新资讯卡片
- [x] 连接失败 Toast 提示

### 3.2 资讯
- [x] 资讯列表（分类筛选 + 分页）
- [x] 资讯详情
- [x] 点赞/取消点赞

### 3.3 便民电话
- [x] 分类浏览
- [x] 一键拨号
- [x] 搜索功能

### 3.4 社区活动
- [x] 活动列表
- [x] 活动详情
- [x] 报名（防重复）
- [x] 名额展示（enrolled_count/max_participants）

### 3.5 周边商家
- [x] 分类浏览
- [x] 商家详情

### 3.6 公交查询
- [x] 周边站点
- [x] 线路实时到站

### 3.7 意见反馈
- [x] 填写内容 + 上传图片
- [x] 提交反馈

### 3.8 用户系统
- [x] 首次启动生成 openid
- [x] 注册（头像+昵称+手机号+密码）
- [x] 登录（手机号+密码）
- [x] 退出登录
- [x] 个人中心（头像/昵称展示）
- [x] 编辑资料
- [x] 头像上传（Pillow 转 JPG，upload fail 显示错误）
- [x] 图片路径解析（相对路径 → 完整 URL）

### 3.9 授权
- [x] 游客模式（跳过登录）
- [x] 页面跳转时权限判断
- [x] X-User-Id Header 自动携带

---

## 4. 安全与数据完整性

### 4.1 密码安全
- [x] 管理员密码 bcrypt 哈希存储
- [x] 用户密码 bcrypt 哈希存储
- [x] 管理后台编辑密码时 bcrypt 重新哈希
- [x] 用户修改密码时 bcrypt 重新哈希

### 4.2 认证安全
- [x] JWT Token 8h 过期
- [x] sessionStorage（关闭标签页清除）
- [x] 启动时主动验证 Token 有效性

### 4.3 图片安全
- [x] 小程序上传 Pillow 强制转 JPG
- [x] 管理后台上传 MIME 白名单
- [x] 审核记录自动创建
- [x] GET 端点过滤未审核图片
- [x] 无审核记录的旧图片默认放行

### 4.4 数据完整性
- [x] 手机号唯一性校验（注册时）
- [x] 昵称唯一性校验（注册时）
- [x] 用户注册不覆盖已有数据
- [x] 登录不丢失旧账号 data
- [x] GET /me 不创建空行
- [x] 重复报名防护（UNIQUE 约束）

---

## 5. 非功能需求

### 5.1 响应格式
- [x] 统一返回 `{"code": 200, "message": "success", "data": ...}`
- [x] 分页返回 `{"items":[...], "total":N, "page":1, "page_size":20}`
- [x] 错误返回 `{"code": 4xx/5xx, "message": "...", "data": null}`

### 5.2 跨域
- [x] CORS 中间件允许所有来源

### 5.3 静态文件
- [x] `/uploads` 挂载提供 HTTP 访问

### 5.4 全局异常
- [x] 全局异常捕获，返回统一错误格式

### 5.5 TypeScript 编译
- [x] `npx tsc --noEmit` 零错误

---

## 6. 已知限制

| # | 限制 | 说明 |
|---|------|------|
| 1 | 图片审核全部 auto_approve | 当前所有 upload 操作均自动通过，需要时可改为人工审核 |
| 2 | CORS 全开放 | 仅开发阶段使用，生产环境需限制来源 |
| 3 | openid 非微信官方 openid | 使用客户端 UUID 替代，正式上线需接入微信登录获取真实 openid |
| 4 | 公交查询依赖高德 API | 需要有效的 API Key 配置 |
| 5 | Token 无刷新机制 | 过期后需重新登录，未实现 refresh_token |
| 6 | 无接口限流 | 未配置 Rate Limiting |
| 7 | 错误码统一 HTTP 200 | 业务错误不返回对应 HTTP 状态码，需前端解析 code 字段 |
