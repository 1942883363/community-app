# 社区便民资讯平台 设计文档

## 1. 系统架构

```
┌──────────────────────┐     ┌──────────────────────┐
│   管理后台 (React)    │     │   小程序 (微信原生)    │
│   admin-frontend/    │     │   miniprogram/       │
│   port 5173 (dev)    │     │   wechat devtools    │
└──────────┬───────────┘     └──────────┬───────────┘
           │ HTTP/REST                   │ HTTP/REST
           │ Bearer Token (JWT)          │ X-User-Id Header
           ▼                             ▼
┌─────────────────────────────────────────────────────┐
│               FastAPI 后端 (Python 3.13)             │
│                   backend/                          │
│               port 8000                             │
│                                                     │
│  ┌──────────────────────────┐  ┌──────────┐             │
│  │       Routers (接口)      │  │  Utils   │             │
│  │      12 个路由模块        │  │ JWT/Auth │             │
│  │    ── 调用/依赖 ──        │  │ BCrypt   │             │
│  │  ┌─────────┐ ┌─────────┐ │  │ Password │             │
│  │  │ Models  │ │ Schemas │ │  │ Response │             │
│  │  │ (14表)  │ │ Pydantic│ │  └──────────┘             │
│  │  └────┬────┘ └─────────┘ │                          │
│  └───────┼──────────────────┘                          │
│          │                                             │
│          ▼                                             │
│     ┌──────────┐                                       │
│     │ SQLAlchemy│                                      │
│     │    ORM    │                                      │
│     └────┬─────┘                                       │
└─────────────┼──────────────────────────────────────┘
              │
              ▼
     ┌────────────────┐
     │   MySQL 8.0    │
     │  community_db  │
     └────────────────┘
```

**请求流程**：
- 管理后台 → `POST /api/auth/login` 获取 JWT Token → 后续请求携带 `Authorization: Bearer <token>` → `get_current_user` 依赖注入验证
- 小程序 → 首次启动 `wx.getStorageSync('openid')` 生成设备唯一标识 → 后续请求携带 `X-User-Id` Header → 后端按 `openid` 查找用户

---

## 2. 项目目录结构

```
community-info-platform/
├── backend/                         # FastAPI 后端
│   ├── main.py                      # 应用入口（CORS + 静态文件 + 全局异常 + 12路由注册）
│   ├── config.py                    # pydantic-settings 配置管理
│   ├── .env                         # 敏感配置（不入仓库）
│   ├── database.py                  # SQLAlchemy 引擎 & Session & get_db()
│   ├── requirements.txt             # Python 依赖
│   ├── models/                      # SQLAlchemy 模型（14 张表）
│   │   ├── admin.py                 # AdminUser (admin_users)
│   │   ├── user.py                  # User (users) — openid+phone+password_hash
│   │   ├── category.py              # Category (categories)
│   │   ├── news.py                  # News + NewsLike (news, news_likes)
│   │   ├── feedback.py              # Feedback (feedback)
│   │   ├── phone.py                 # PhoneCategory + PhoneEntry
│   │   ├── event.py                 # Event + Registration
│   │   ├── business.py              # BusinessCategory + Business
│   │   ├── image_review.py          # ImageReview (image_reviews)
│   │   ├── image.py                 # Image (images)
│   │   └── image_review.py          # ImageReview (image_reviews)
│   ├── schemas/                     # Pydantic 请求/响应模型
│   │   ├── auth.py                  # LoginRequest / TokenResponse / UserInfo
│   │   ├── category.py              # CategoryCreate / Update / Response
│   │   ├── news.py                  # NewsCreate / Update / Response / ListItem
│   │   ├── feedback.py              # FeedbackCreate / Update / Response
│   │   ├── phone.py                 # PhoneCategory + PhoneEntry schemas
│   │   ├── event.py                 # EventCreate / Update / Response
│   │   ├── business.py              # BusinessCategory + Business schemas
│   │   └── user.py                  # UserRegister / Login / Update / Response / UpdateSelf
│   ├── routers/                     # API 路由层（12 个模块）
│   │   ├── auth.py                  # POST /login + GET /me + get_current_user 依赖注入
│   │   ├── category.py              # 分类 CRUD
│   │   ├── news.py                  # 资讯 CRUD + 点赞 + 公开列表
│   │   ├── feedback.py              # 反馈 CRUD + 状态管理
│   │   ├── phone.py                 # 电话簿分类+条目 CRUD
│   │   ├── event.py                 # 活动 CRUD + 报名
│   │   ├── business.py              # 商家分类+商家 CRUD
│   │   ├── transit.py               # 公交查询代理（高德 API）
│   │   ├── upload.py                # 文件上传 + create_image_review / is_image_approved 公共函数
│   │   ├── user.py                  # 用户注册/登录/退出/个人信息+后台CRUD
│   │   ├── review.py                # 图片审核列表+通过+拒绝+查询
│   │   └── dashboard.py             # GET /stats 六维度统计
│   ├── utils/                       # 工具函数
│   │   ├── auth.py                  # JWT 签发/验证 + bcrypt 密码哈希/验证
│   │   ├── password.py              # passlib CryptContext (bcrypt)
│   │   └── response.py              # 统一响应格式 (success/error/paginated)
│   ├── sql/
│   │   └── init.sql                 # 完整 DDL 建表脚本（14 张表）
│   └── uploads/
│       └── images/                  # 用户上传图片存储目录
│
├── admin-frontend/                  # React 管理后台
│   ├── package.json
│   ├── vite.config.ts               # Vite 配置
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                  # 路由配置 + AuthGuard（三态：loading/authenticated/unauthenticated）
│   │   ├── api/                     # API 请求封装
│   │   │   ├── request.ts           # axios 实例 + Token 拦截 + 401 拦截 + uploadFile
│   │   │   ├── auth.ts              # 管理员登录/个人信息
│   │   │   ├── dashboard.ts         # 仪表盘统计
│   │   │   ├── category.ts          # 分类 CRUD
│   │   │   ├── news.ts              # 资讯 CRUD
│   │   │   ├── feedback.ts          # 反馈 CRUD
│   │   │   ├── phone.ts             # 电话簿 CRUD
│   │   │   ├── event.ts             # 活动 CRUD
│   │   │   ├── business.ts          # 商家 CRUD
│   │   │   ├── user.ts              # 用户 CRUD
│   │   │   └── review.ts            # 图片审核
│   │   ├── pages/                   # 页面组件
│   │   │   ├── Login/               # 登录页
│   │   │   ├── Dashboard/           # 仪表盘（六维度统计卡片）
│   │   │   ├── News/                # 资讯管理（CategoryManage + NewsList + NewsEdit）
│   │   │   ├── Feedback/            # 反馈工单管理
│   │   │   ├── Phone/               # 电话簿管理
│   │   │   ├── Event/               # 活动管理
│   │   │   ├── Business/            # 商家管理
│   │   │   ├── User/                # 用户管理（含密码编辑）
│   │   │   └── Review/              # 图片审核
│   │   ├── components/
│   │   │   └── Layout/              # 主布局（侧边栏+顶栏）
│   │   ├── stores/
│   │   │   └── auth.tsx             # AuthProvider + useAuth（React Context）
│   │   └── types/
│   │       └── index.ts             # 公共类型定义
│   └── tsconfig.json
│
├── miniprogram/                     # 微信小程序
│   ├── app.json                     # 页面注册 + TabBar + 权限声明
│   ├── app.js                       # App 入口（全局数据初始化）
│   ├── app.wxss                     # 全局样式
│   ├── utils/
│   │   ├── request.js               # wx.request Promise 封装 + getUserId + resolveImage
│   │   └── config.js                # API_BASE_URL + STATIC_BASE
│   └── pages/
│       ├── index/                   # 首页（轮播 + 分类入口 + 最新资讯）
│       ├── news/                    # 资讯列表
│       ├── news-detail/             # 资讯详情 + 点赞
│       ├── phone/                   # 便民电话
│       ├── event/                   # 活动列表
│       ├── event-detail/            # 活动详情 + 报名
│       ├── business/                # 周边商家列表
│       ├── business-detail/         # 商家详情
│       ├── transit/                 # 公交查询
│       ├── feedback/                # 意见反馈提交
│       ├── mine/                    # 个人中心
│       └── login/                   # 注册/登录（含密码输入）
│
├── docs/
│   └── 系统设计与实践文档.md          # 详细系统设计与 AI 交互记录
│
└── .trae/
    ├── specs/
    │   └── community-info-platform/  # 本目录
    │       ├── spec.md              # 需求规格说明书
    │       ├── design.md            # 设计文档
    │       ├── checklist.md         # 验证清单
    │       └── tasks.md             # 开发任务记录
    └── skills/
        └── bus-metro-query/         # 公交查询 Skill
```

---

## 3. 数据库设计

### 3.1 表结构总览（14 张表）

| # | 表名 | 说明 | 关键字段 |
|---|------|------|----------|
| 1 | `admin_users` | 管理员用户 | id, username(UNIQUE), password_hash, nickname, role |
| 2 | `users` | 小程序用户 | id, openid(UNIQUE), nickname, phone, password_hash, avatar |
| 3 | `categories` | 资讯分类 | id, name, sort_order |
| 4 | `news` | 资讯 | id, title, content, cover_image, category_id(FK), is_top, view_count, status |
| 5 | `news_likes` | 点赞记录 | id, news_id(FK), user_id(FK), UNIQUE(news_id,user_id) |
| 6 | `feedback` | 意见反馈 | id, user_id(FK), content, images, contact, status, reply |
| 7 | `phone_categories` | 电话分类 | id, name, icon, sort_order |
| 8 | `phone_entries` | 电话条目 | id, category_id(FK), name, phone, sort_order |
| 9 | `events` | 社区活动 | id, title, cover_image, content, address, event_date, event_time, max_participants, status |
| 10 | `registrations` | 活动报名 | id, event_id(FK), user_id(FK), UNIQUE(event_id,user_id) |
| 11 | `business_categories` | 商家分类 | id, name, icon, sort_order |
| 12 | `businesses` | 商家 | id, category_id(FK), name, logo, address, phone, description, business_hours, sort_order, status |
| 13 | `image_reviews` | 图片审核 | id, owner_type, owner_id, url, status(0/1/2), reviewer_id, reject_reason |
| 14 | `images` | 图片附件 | id, url, source_type, source_id |

### 3.2 ER 图

```
┌──────────────┐
│  admin_users │  (JWT 鉴权 — 管理员)
└──────┬───────┘
       │ reviewer_id
       ▼
┌──────────────┐      ┌──────────────┐
│image_reviews │      │    users     │
│  (图片审核)  │      │ (小程序用户)  │
└──────────────┘      └──────┬───────┘
               ┌─────────────┼──────────────────┐
               │             │                  │
          ┌────▼────┐  ┌─────▼─────┐  ┌────────▼───────┐
          │feedback │  │news_likes │  │  registrations │
          │(反馈)   │  │ (点赞)    │  │   (报名)       │
          └─────────┘  └─────┬─────┘  └────────┬───────┘
                             │                 │
                        ┌────▼────┐       ┌────▼─────┐
                        │  news   │       │  events  │
                        │ (资讯)  │       │ (活动)   │
                        └────┬────┘       └──────────┘
                             │
                        ┌────▼──────┐
                        │categories │
                        │(资讯分类) │
                        └──────────┘

┌──────────────┐     ┌──────────────────┐
│phone_entries │────►│ phone_categories │
│ (电话条目)   │     │  (电话簿分类)    │
└──────────────┘     └──────────────────┘

┌──────────┐     ┌────────────────────┐
│businesses│────►│business_categories │
│ (商家)   │     │   (商家分类)       │
└──────────┘     └────────────────────┘
```

### 3.3 关键设计决策

**用户表 `openid` 设计**：
- `openid` 为 VARCHAR(100) UNIQUE，客户端生成 UUID 存储
- 注册：创建新行，如果当前 openid 已有注册用户则解绑旧行（openid=""）
- 登录：按手机号查找 → 验证密码 → 绑定 openid 到目标行
- 退出：openid="" 解绑，数据保留
- GET /me：只查不创，不存在返回 `is_registered=false`

**图片审核 `owner_type` 枚举**：
| 值 | 对应业务 | auto_approve |
|----|---------|-------------|
| `admin_upload` | 管理后台上传 | true |
| `user_avatar` | 小程序用户头像 | true |
| `news_cover` | 资讯封面 | true |
| `business_logo` | 商家 Logo | true |
| `event_cover` | 活动封面 | true |

---

## 4. API 接口设计

### 4.1 接口规范
- 基础路径: `/api`
- 鉴权方式: `Authorization: Bearer <token>`（管理端）；`X-User-Id` 请求头（小程序端）
- 响应格式: `{"code": 200, "message": "success", "data": ...}`
- 分页格式: `{"code": 200, "data": {"items": [...], "total": N, "page": 1, "page_size": 20}}`
- 注意：业务错误（404/400/409）也返回 HTTP 200，错误码在 `code` 字段

### 4.2 认证接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 否 | 管理员登录，返回 access_token + token_type |
| GET | `/api/auth/me` | JWT | 获取当前管理员信息 |

### 4.3 仪表盘接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/dashboard/stats` | JWT | 返回 news/feedback/phone/event/business/user 六维度统计 |

### 4.4 资讯分类接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/categories` | 公开 | 获取分类列表 |
| POST | `/api/categories` | JWT | 创建分类 |
| PUT | `/api/categories/{id}` | JWT | 更新分类 |
| DELETE | `/api/categories/{id}` | JWT | 删除分类 |

### 4.5 资讯接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/news` | 公开 | 列表（分页 + category_id/status 筛选） |
| GET | `/api/news/{id}` | 公开 | 详情（view_count 自增） |
| POST | `/api/news` | JWT | 发布（含封面审核记录） |
| PUT | `/api/news/{id}` | JWT | 编辑 |
| DELETE | `/api/news/{id}` | JWT | 删除 |
| PUT | `/api/news/{id}/top` | JWT | 置顶/取消置顶 |
| POST | `/api/news/{id}/like` | X-User-Id | 点赞/取消点赞 |
| GET | `/api/news/{id}/like-status` | X-User-Id | 查询点赞状态 |

### 4.6 反馈接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/feedback` | JWT | 工单列表（分页 + status 筛选） |
| GET | `/api/feedback/{id}` | JWT | 工单详情 |
| POST | `/api/feedback` | X-User-Id | 提交反馈 |
| PUT | `/api/feedback/{id}` | JWT | 更新状态/回复 |
| DELETE | `/api/feedback/{id}` | JWT | 删除反馈 |

### 4.7 电话簿接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/phone-categories` | 公开 | 分类列表 |
| POST | `/api/phone-categories` | JWT | 创建分类 |
| PUT | `/api/phone-categories/{id}` | JWT | 更新分类 |
| DELETE | `/api/phone-categories/{id}` | JWT | 删除分类 |
| GET | `/api/phone-entries` | 公开 | 条目列表（category_id 筛选） |
| POST | `/api/phone-entries` | JWT | 创建条目 |
| PUT | `/api/phone-entries/{id}` | JWT | 更新条目 |
| DELETE | `/api/phone-entries/{id}` | JWT | 删除条目 |

### 4.8 活动接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/events` | 公开 | 活动列表（分页，enrolled_count 实时计算） |
| GET | `/api/events/{id}` | 公开 | 活动详情 |
| POST | `/api/events` | JWT | 发布活动（含封面审核记录） |
| PUT | `/api/events/{id}` | JWT | 编辑活动 |
| DELETE | `/api/events/{id}` | JWT | 删除活动（级联报名记录） |
| POST | `/api/events/{id}/register` | X-User-Id | 报名 |
| GET | `/api/events/{id}/registrations` | JWT | 查看报名列表 |

### 4.9 商家接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/business-categories` | 公开 | 分类列表 |
| POST | `/api/business-categories` | JWT | 创建分类 |
| PUT | `/api/business-categories/{id}` | JWT | 更新分类 |
| DELETE | `/api/business-categories/{id}` | JWT | 删除分类 |
| GET | `/api/businesses` | 公开 | 商家列表（category_id 筛选，过滤未审核 logo） |
| POST | `/api/businesses` | JWT | 创建商家（含 logo 审核记录） |
| PUT | `/api/businesses/{id}` | JWT | 更新商家 |
| DELETE | `/api/businesses/{id}` | JWT | 删除商家 |

### 4.10 公交查询接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/transit/nearby` | 否 | 周边公交/地铁站点（lon+lat+radius） |
| GET | `/api/transit/arrival` | 否 | 站点实时到站信息 |

### 4.11 文件上传接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/upload` | JWT | 管理后台上传（MIME 白名单校验，保留原始扩展名） |
| POST | `/api/upload/public` | X-User-Id | 小程序上传（无 MIME 检查，Pillow 强制转 JPG） |

### 4.12 用户接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| PUT | `/api/users/register` | X-User-Id | 注册（昵称+手机号+密码，唯一性校验） |
| POST | `/api/users/login` | X-User-Id | 登录（手机号+密码，openid 绑定切换） |
| POST | `/api/users/logout` | X-User-Id | 退出（openid 清空解绑） |
| GET | `/api/users/me` | X-User-Id | 获取当前用户（不存在返回空） |
| PUT | `/api/users/me` | X-User-Id | 修改个人资料（含密码） |
| GET | `/api/users` | JWT | 后台用户列表（分页+搜索） |
| GET | `/api/users/{id}` | JWT | 用户详情 |
| PUT | `/api/users/{id}` | JWT | 编辑用户（含密码 bcrypt 哈希） |
| DELETE | `/api/users/{id}` | JWT | 删除用户 |
| GET | `/api/users/search` | X-User-Id | 按昵称搜索用户 |

### 4.13 图片审核接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/reviews` | JWT | 审核列表（分页 + status 筛选） |
| PUT | `/api/reviews/{id}/approve` | JWT | 通过（status=1） |
| PUT | `/api/reviews/{id}/reject?reason=` | JWT | 拒绝（status=2） |
| GET | `/api/reviews/check?url=` | 公开 | 查询图片审核状态 |

---

## 5. 安全设计

### 5.1 管理后台安全

| 措施 | 实现 |
|------|------|
| 密码存储 | bcrypt 哈希（`$2b$12$...`） |
| Token 存储 | sessionStorage（关闭标签页清除） |
| Token 有效期 | 8 小时（jose JWT，HS256） |
| Token 验证 | 启动时主动调用 /auth/me |
| 接口保护 | get_current_user 依赖注入 |
| 401 处理 | axios 拦截器 → 清除 Token → 跳转登录 |

### 5.2 小程序安全

| 措施 | 实现 |
|------|------|
| 设备标识 | 客户端 UUID |
| 用户密码 | bcrypt 哈希，登录时 pwd_context.verify() |
| 图片审核 | 所有上传图片创建审核记录 |
| 注册唯一性 | 手机号 UNIQUE + 昵称 UNIQUE 双重校验 |

### 5.3 密码处理

```python
# utils/auth.py — 管理员密码
import bcrypt
def get_password_hash(password): bcrypt.hashpw(...)
def verify_password(plain, hashed): bcrypt.checkpw(...)

# utils/password.py — 用户密码（passlib）
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

### 5.4 图片安全

- 小程序上传：Pillow `.convert("RGB").save("JPEG")` 强制转 JPG（防止恶意文件伪装）
- 管理后台上传：MIME 类型白名单 `["image/jpeg","image/png","image/gif","image/webp"]`
- 审核系统：is_image_approved 过滤未通过图片，无记录默认放行（兼容旧数据）
