# 社区便民资讯平台 设计文档

## 1. 系统架构

```
┌──────────────────────────────────────────────────────┐
│                    客户端层                           │
│  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │ 微信小程序 (用户)  │  │ React 管理后台 (管理员)    │  │
│  └────────┬─────────┘  └───────────┬──────────────┘  │
│           │         HTTPS           │                  │
├───────────┼─────────────────────────┼──────────────────┤
│           ▼                         ▼                  │
│  ┌─────────────────────────────────────────────────┐  │
│  │              FastAPI 后端服务                     │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────────┐  │  │
│  │  │ REST API │ │ JWT Auth │ │ Static Files     │  │  │
│  │  └────┬─────┘ └────┬─────┘ │ (uploads/)       │  │  │
│  │       │            │       └──────────────────┘  │  │
│  │  ┌────▼────────────▼───────────┬──────────────┐  │  │
│  │  │       业务逻辑层             │              │  │  │
│  │  │  sanitize_html (XSS防护)    │              │  │  │
│  │  │  get_or_create_user (用户)  │              │  │  │
│  │  └────────────────────┬───────────────────────┘  │  │
│  │                       │                           │  │
│  │  ┌────────────────────▼───────────────────────┐  │  │
│  │  │        数据访问层 (SQLAlchemy ORM)           │  │  │
│  │  └────────────────────┬───────────────────────┘  │  │
│  └───────────────────────┼───────────────────────────┘  │
│                          │                               │
├──────────────────────────┼───────────────────────────────┤
│                          ▼                               │
│               ┌──────────────────┐                       │
│               │    MySQL 8.0     │                       │
│               │  community_db    │                       │
│               │  13 张表         │                       │
│               └──────────────────┘                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │          TRAE Skill: bus-metro-query              │   │
│  │          ┌──────────────────────┐                 │   │
│  │          │   高德地图公交 API    │                 │   │
│  │          └──────────────────────┘                 │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

---

## 2. 项目目录结构

```
community-info-platform/
├── backend/                         # FastAPI 后端
│   ├── main.py                      # 应用入口 & 全局异常处理
│   ├── config.py                    # 配置管理（含 AMAP_API_KEY）
│   ├── .env                         # 敏感配置（不入仓库）
│   ├── .env.example                 # 配置模板
│   ├── requirements.txt             # Python 依赖
│   ├── database.py                  # SQLAlchemy 引擎 & Session
│   ├── seed.py                      # 种子数据（管理员 + 分类）
│   ├── seed_cuit.py                 # 成信大周边测试数据
│   ├── models/                      # SQLAlchemy 模型（13 张表）
│   │   ├── __init__.py
│   │   ├── user.py                  # 统一用户表（NEW）
│   │   ├── admin.py                 # 管理员用户
│   │   ├── category.py              # 资讯分类
│   │   ├── news.py                  # 资讯 + 点赞
│   │   ├── feedback.py              # 意见反馈
│   │   ├── phone.py                 # 电话簿
│   │   ├── event.py                 # 活动 + 报名
│   │   ├── business.py              # 商家 + 分类
│   │   └── image.py                 # 图片附件（NEW）
│   ├── schemas/                     # Pydantic 请求/响应模型
│   │   ├── __init__.py
│   │   ├── common.py
│   │   ├── auth.py
│   │   ├── category.py
│   │   ├── news.py
│   │   ├── feedback.py
│   │   ├── phone.py
│   │   ├── event.py
│   │   └── business.py
│   ├── routers/                     # API 路由层
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── category.py
│   │   ├── news.py
│   │   ├── feedback.py
│   │   ├── phone.py
│   │   ├── event.py
│   │   ├── business.py
│   │   ├── upload.py
│   │   └── transit.py
│   ├── utils/                       # 工具函数
│   │   ├── auth.py                  # JWT + bcrypt 密码
│   │   ├── response.py              # 统一响应格式
│   │   ├── sanitize.py              # XSS 防护过滤（NEW）
│   │   └── user_service.py          # 用户注册/查询（NEW）
│   ├── sql/
│   │   └── init.sql                 # 完整 DDL 建表脚本
│   └── uploads/
│       └── images/
│
├── admin-frontend/                  # React 管理后台
│   ├── package.json
│   ├── vite.config.ts               # Vite 配置（/api 代理）
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                  # 路由配置 + AuthGuard
│   │   ├── api/
│   │   │   ├── request.ts           # Axios 实例 & Token 拦截
│   │   │   ├── auth.ts              # 登录/当前用户
│   │   │   ├── news.ts              # 资讯 + 分类 API
│   │   │   ├── feedback.ts          # 反馈 API
│   │   │   ├── phone.ts             # 电话簿 API
│   │   │   ├── event.ts             # 活动 API
│   │   │   └── business.ts          # 商家 API
│   │   ├── pages/
│   │   │   ├── Login/
│   │   │   ├── Dashboard/
│   │   │   ├── News/
│   │   │   │   ├── CategoryManage.tsx
│   │   │   │   ├── NewsList.tsx
│   │   │   │   └── NewsEdit.tsx
│   │   │   ├── Feedback/
│   │   │   ├── Phone/
│   │   │   ├── Event/
│   │   │   └── Business/
│   │   ├── components/
│   │   │   └── Layout/
│   │   ├── stores/
│   │   │   └── auth.tsx             # AuthContext
│   │   └── types/
│   │       └── index.ts
│   └── tsconfig.json
│
├── miniprogram/                     # 微信小程序
│   ├── app.json
│   ├── app.js
│   ├── app.wxss
│   ├── project.config.json
│   ├── utils/
│   │   ├── request.js               # wx.request Promise 封装
│   │   └── config.js                # BASE_URL（IP:8000）
│   └── pages/
│       ├── index/                   # 首页
│       ├── news/                    # 资讯列表
│       ├── news-detail/             # 资讯详情
│       ├── phone/                   # 电话簿
│       ├── event/                   # 活动列表
│       ├── event-detail/            # 活动详情 + 报名
│       ├── business/                # 周边商家
│       ├── business-detail/         # 商家详情
│       ├── transit/                 # 公交查询
│       ├── feedback/                # 意见反馈
│       └── mine/                    # 个人中心
│
└── .trae/
    └── skills/
        └── bus-metro-query/         # 公交查询 Skill
            ├── skill.yaml
            └── handler.py
```

---

## 3. 数据库设计

### 3.1 数据库连接配置

```ini
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=community_db
SECRET_KEY=your-secret-key-change-in-production
AMAP_API_KEY=your_amap_web_api_key
```

### 3.2 ER 图（文字描述 — v2 修复版）

```
                        ┌─────────────┐
                        │    users    │•••••••••••••••••••••••••••••••••••••┐
                        │ (统一用户表) │                                     │
                        └──────┬──────┘                                     │
               ┌───────────────┼──────────────────────────────┐              │
               │               │                              │              │
          ┌────▼─────┐   ┌─────▼──────┐   ┌───────────┐      │              │
          │ feedback │   │ news_likes │   │registration│      │              │
          │(意见反馈)│   │ (点赞记录) │   │ (活动报名) │      │              │
          └────┬─────┘   └─────┬──────┘   └─────┬─────┘      │              │
               │               │                │            │              │
┌──────────┐   │          ┌────▼────┐      ┌────▼─────┐      │              │
│  admin   │   │          │  news   │      │  events  │      │              │
│  users   │◄──┘          │ (资讯)  │      │ (活动)   │      │              │
└──────────┘              └────┬────┘      └──────────┘      │              │
                               │                             │              │
                          ┌────▼──────┐                      │              │
                          │ categories│                      │              │
                          │(资讯分类) │                      │              │
                          └──────────┘                      │              │
                                                            │              │
┌────────────────┐     ┌──────────────────┐                 │              │
│ phone_entries  │────►│ phone_categories │                 │              │
│  (电话条目)    │     │  (电话簿分类)    │                 │              │
└────────────────┘     └──────────────────┘                 │              │
                                                            │              │
┌─────────┐     ┌──────────────────┐                        │              │
│businesses│────►│business_categories│                       │              │
│ (商家)   │    │  (商家分类)       │                       │              │
└────┬─────┘    └──────────────────┘                       │              │
     │                                                     │              │
     └─────────── 图片关联 ──────────┐                      │              │
                                    ▼                      │              │
                            ┌─────────────────┐            │              │
                            │image_attachments│◄───────────┘              │
                            │  (图片附件表)   │                           │
                            └─────────────────┘                           │
```

**13 张表总览：**

| # | 表名 | 说明 | 关键变更 |
|---|------|------|----------|
| 1 | `admin_users` | 管理员用户 | password → password_hash；INT → BIGINT |
| 2 | `users` | 统一用户表 | **NEW** — 修复身份混淆 |
| 3 | `categories` | 资讯分类 | INT → BIGINT |
| 4 | `news` | 资讯 | added idx_category_status_published 复合索引 |
| 5 | `news_likes` | 点赞记录 | user_id BIGINT FK → users |
| 6 | `feedback` | 意见反馈 | user_id BF FK；images VARCHAR 替代 JSON；增加 title/reply |
| 7 | `phone_categories` | 电话簿分类 | 移除 icon |
| 8 | `phone_entries` | 电话条目 | phone_number → phone；增加 address/description |
| 9 | `events` | 社区活动 | **移除 enrolled_count**（防超卖）；location→address；start/end_time→event_date/event_time |
| 10 | `registrations` | 活动报名 | user_id BF FK；user_name/user_phone/remark 替换冗余字段；**取消=DELETE** |
| 11 | `business_categories` | 商家分类 | — |
| 12 | `businesses` | 商家 | 移除 JSON images 和 lon/lat；增加 logo/business_hours |
| 13 | `image_attachments` | 图片附件 | **NEW** — 多态关联替代 JSON 字段 |

### 3.3 建表 DDL（v2 修复版）

```sql
CREATE DATABASE IF NOT EXISTS community_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE community_db;

DROP TABLE IF EXISTS image_attachments;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS business_categories;
DROP TABLE IF EXISTS phone_entries;
DROP TABLE IF EXISTS phone_categories;
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS news_likes;
DROP TABLE IF EXISTS news;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS users;

-- ============================================
-- 1. 管理员用户表
-- ============================================
CREATE TABLE admin_users (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    username       VARCHAR(50)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    nickname       VARCHAR(50)  DEFAULT '',
    avatar         VARCHAR(500) DEFAULT '',
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. 统一用户表（修复身份混淆漏洞）
-- ============================================
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    openid      VARCHAR(100) NOT NULL UNIQUE  COMMENT '微信OpenID或设备唯一标识',
    nickname    VARCHAR(50)  DEFAULT '',
    phone       VARCHAR(20)  DEFAULT '',
    avatar      VARCHAR(500) DEFAULT '',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_openid (openid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. 资讯分类表（支持两级层级）
-- ============================================
CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    parent_id   BIGINT      DEFAULT NULL,
    sort_order  INT         DEFAULT 0,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. 资讯表（修复复合索引缺失）
-- ============================================
CREATE TABLE news (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    title         VARCHAR(200) NOT NULL,
    content       TEXT         NOT NULL,
    summary       VARCHAR(500) DEFAULT '',
    cover_image   VARCHAR(500) DEFAULT '',
    category_id   BIGINT       NOT NULL,
    status        TINYINT      DEFAULT 1    COMMENT '0:草稿 1:已发布 2:已下架',
    is_top        TINYINT      DEFAULT 0,
    view_count    INT          DEFAULT 0,
    like_count    INT          DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category_id (category_id),
    INDEX idx_status (status),
    INDEX idx_category_status_published (category_id, status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. 资讯点赞记录表（user_id FK → users.id）
-- ============================================
CREATE TABLE news_likes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    news_id     BIGINT   NOT NULL,
    user_id     BIGINT   NOT NULL  COMMENT '用户ID，关联users表',
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_news_user (news_id, user_id),
    FOREIGN KEY (news_id) REFERENCES news(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. 意见反馈表（修复：user_id FK + VARCHAR 替代 JSON + title/reply）
-- ============================================
CREATE TABLE feedback (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL  COMMENT '用户ID，关联users表',
    title       VARCHAR(200) NOT NULL,
    content     TEXT         NOT NULL,
    images      VARCHAR(2000) DEFAULT '' COMMENT '图片URL，多个用逗号分隔',
    contact     VARCHAR(100)  DEFAULT '',
    status      TINYINT       DEFAULT 0  COMMENT '0:待处理 1:处理中 2:已解决',
    reply       TEXT          DEFAULT NULL,
    handler_id  BIGINT        DEFAULT NULL,
    handled_at  DATETIME      DEFAULT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handler_id) REFERENCES admin_users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. 电话簿分类表
-- ============================================
CREATE TABLE phone_categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50) NOT NULL,
    sort_order  INT         DEFAULT 0,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. 电话条目表
-- ============================================
CREATE TABLE phone_entries (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id   BIGINT       NOT NULL,
    name          VARCHAR(100) NOT NULL,
    phone         VARCHAR(30)  NOT NULL,
    address       VARCHAR(200) DEFAULT '',
    description   VARCHAR(500) DEFAULT '',
    sort_order    INT          DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES phone_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. 社区活动表（修复：移除 enrolled_count 防超卖）
-- ============================================
CREATE TABLE events (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    title             VARCHAR(200) NOT NULL,
    content           TEXT         NOT NULL,
    cover_image       VARCHAR(500) DEFAULT '',
    event_date        DATE         NOT NULL,
    event_time        VARCHAR(20)  DEFAULT '',
    address           VARCHAR(200) DEFAULT '',
    max_participants  INT          DEFAULT 0  COMMENT '0表示不限人数',
    status            TINYINT      DEFAULT 1  COMMENT '0:草稿 1:报名中 2:进行中 3:已结束',
    created_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. 活动报名记录表（修复：user_id FK + 取消=DELETE）
-- ============================================
CREATE TABLE registrations (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_id    BIGINT       NOT NULL,
    user_id     BIGINT       NOT NULL  COMMENT '用户ID，关联users表',
    user_name   VARCHAR(50)  DEFAULT '',
    user_phone  VARCHAR(30)  DEFAULT '',
    remark      VARCHAR(500) DEFAULT '',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_event_user (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. 商家分类表
-- ============================================
CREATE TABLE business_categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL,
    icon        VARCHAR(200) DEFAULT '',
    sort_order  INT          DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 12. 商家表（修复：移除 JSON images 和 lon/lat）
-- ============================================
CREATE TABLE businesses (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id     BIGINT       NOT NULL,
    name            VARCHAR(100) NOT NULL,
    logo            VARCHAR(500) DEFAULT '',
    description     TEXT         DEFAULT NULL,
    address         VARCHAR(200) DEFAULT '',
    phone           VARCHAR(30)  DEFAULT '',
    business_hours  VARCHAR(200) DEFAULT '',
    sort_order      INT          DEFAULT 0,
    status          TINYINT      DEFAULT 1,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES business_categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 13. 图片附件关联表（修复：替代 JSON 字段，支持多态关联）
-- ============================================
CREATE TABLE image_attachments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_type  VARCHAR(30)  NOT NULL  COMMENT '所属对象类型: business/feedback/news/event',
    owner_id    BIGINT       NOT NULL  COMMENT '所属对象ID',
    url         VARCHAR(500) NOT NULL  COMMENT '图片URL',
    sort_order  INT          DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_owner (owner_type, owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 4. API 接口设计（v2 修复版）

### 4.1 接口规范
- 基础路径: `/api`
- 鉴权方式: `Authorization: Bearer <token>`（管理端）；`X-User-Id` 请求头（用户端）
- 响应格式: `{"code": 200, "message": "success", "data": ...}`
- 分页格式: `{"code": 200, "data": {"items": [...], "total": N, "page": 1, "page_size": 20}}`
- 用户标识: 小程序端通过 `X-User-Id` 请求头传递设备唯一 ID → 服务端 `get_or_create_user()` 自动创建/匹配 users 表

### 4.2 认证接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 否 | 管理员登录，返回 `access_token` + `token_type` |
| GET  | `/api/auth/me` | 是 | 获取当前管理员信息 |

### 4.3 资讯分类接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET   | `/api/categories` | 否 | 获取分类列表（树形结构，支持两级） |
| POST  | `/api/categories` | 是 | 创建分类 |
| PUT   | `/api/categories/{id}` | 是 | 更新分类 |
| DELETE| `/api/categories/{id}` | 是 | 删除分类（有子分类或关联资讯时拒绝） |

### 4.4 资讯接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET    | `/api/news` | 否 | 小程序端资讯列表（分页 + category_id/status 筛选） |
| GET    | `/api/news/{id}` | 否 | 资讯详情（view_count 自增） |
| POST   | `/api/news` | 是 | 发布资讯（content 经 sanitize_html 过滤） |
| PUT    | `/api/news/{id}` | 是 | 编辑资讯 |
| DELETE | `/api/news/{id}` | 是 | 删除资讯（级联删除点赞记录） |
| POST   | `/api/news/{id}/like` | 否 | 点赞/取消点赞（X-User-Id 标识） |
| GET    | `/api/news/{id}/like-status` | 否 | 查询用户对该资讯的点赞状态 |

### 4.5 反馈接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/feedback` | 否 | 提交反馈（支持图片上传，X-User-Id 标识用户） |
| GET  | `/api/feedback` | 是 | 工单列表（分页 + status 筛选） |
| GET  | `/api/feedback/{id}` | 是 | 工单详情 |
| PUT  | `/api/feedback/{id}/status` | 是 | 更新工单状态 + 回复（流转：待处理→处理中→已解决） |
| GET  | `/api/feedback/my` | 否 | 我的反馈记录（X-User-Id） |

### 4.6 电话簿接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET    | `/api/phone-categories` | 否 | 电话簿分类列表 |
| POST   | `/api/phone-categories` | 是 | 创建分类 |
| PUT    | `/api/phone-categories/{id}` | 是 | 更新分类 |
| DELETE | `/api/phone-categories/{id}` | 是 | 删除分类（级联删除条目） |
| GET    | `/api/phone-entries` | 否 | 电话条目列表（category_id 筛选） |
| POST   | `/api/phone-entries` | 是 | 创建条目 |
| PUT    | `/api/phone-entries/{id}` | 是 | 更新条目 |
| DELETE | `/api/phone-entries/{id}` | 是 | 删除条目 |

### 4.7 活动接口（v2 修复版）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET    | `/api/events` | 否 | 活动列表（分页，enrolled_count 由 COUNT(registrations) 实时计算） |
| GET    | `/api/events/{id}` | 否 | 活动详情 |
| GET    | `/api/events/my` | 否 | 我的报名记录（X-User-Id） |
| POST   | `/api/events` | 是 | 发布活动 |
| PUT    | `/api/events/{id}` | 是 | 编辑活动 |
| DELETE | `/api/events/{id}` | 是 | 删除活动（级联删除报名记录） |
| POST   | `/api/events/{id}/register` | 否 | **活动报名** — SELECT FOR UPDATE 行锁 + COUNT 防超卖 |
| POST   | `/api/events/{id}/cancel` | 否 | **取消报名** — 直接 DELETE 记录（可重新报名） |
| GET    | `/api/events/{id}/registrations` | 是 | 查看报名记录列表 |

### 4.8 商家接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET    | `/api/business-categories` | 否 | 商家分类列表 |
| POST   | `/api/business-categories` | 是 | 创建分类 |
| PUT    | `/api/business-categories/{id}` | 是 | 更新分类 |
| DELETE | `/api/business-categories/{id}` | 是 | 删除分类（级联删除商家） |
| GET    | `/api/businesses` | 否 | 商家列表（category_id 筛选） |
| GET    | `/api/businesses/{id}` | 否 | 商家详情 |
| POST   | `/api/businesses` | 是 | 创建商家 |
| PUT    | `/api/businesses/{id}` | 是 | 更新商家 |
| DELETE | `/api/businesses/{id}` | 是 | 删除商家 |

### 4.9 公交查询接口（v2 扩展）

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/transit/nearby` | 否 | 周边公交/地铁站点（lon + lat + radius） |
| GET | `/api/transit/arrival` | 否 | 站点实时到站信息（city + station_name） |
| GET | `/api/transit/lines` | 否 | 公交线路查询（city + line_name） |
| GET | `/api/transit/geocode` | 否 | 地址→经纬度 地理编码（address + city） |

### 4.10 文件上传接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/upload` | 是 | 上传图片到 uploads/images/，返回 URL |

---

## 5. 安全与防御层

### 5.1 XSS 防护（sanitize_html）
后端在写入 `news.content` 和 `events.content` 之前，统一调用 `utils/sanitize.py`：
- **块级清除** — 移除 `<script>` `<style>` `<iframe>` `<object>` `<embed>` 标签及其内容
- **属性剥离** — 移除 `onerror` `onclick` 等 JS 事件处理器（含无引号写法）
- **协议过滤** — 移除 `javascript:` 伪协议

### 5.2 并发安全（防超卖）
`POST /events/{id}/register` 使用 `SELECT ... FOR UPDATE` 对 events 行加悲观锁，报名期间其他请求排队等待，配合 `COUNT(registrations.id)` 实时统计已报人数。

### 5.3 身份安全（用户隔离）
`users` 表以 `openid` 唯一索引建立用户身份，所有用户操作通过 `X-User-Id` → `get_or_create_user()` → `users.id`（BIGINT FK）关联，避免直接暴露设备 ID 导致篡改风险。

### 5.4 取消报名（可重新报名）
取消报名直接 DELETE 记录而非软删除，UNIQUE KEY `uk_event_user` 自然允许用户重新报名而不冲突。

---

## 6. 种子数据

系统首次启动时需要初始化以下数据（`python seed.py`）：

```python
# 默认管理员账号
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"   # bcrypt 哈希存储，生产环境须修改

# 默认资讯分类（5 个一级分类）
DEFAULT_CATEGORIES = [
    {"name": "社区公告", "sort_order": 1},
    {"name": "便民服务", "sort_order": 2},
    {"name": "活动资讯", "sort_order": 3},
    {"name": "政策解读", "sort_order": 4},
    {"name": "通知提醒", "sort_order": 5},
]

# 默认电话簿分类（6 个）
DEFAULT_PHONE_CATEGORIES = [
    {"name": "紧急求助", "sort_order": 1},
    {"name": "物业服务", "sort_order": 2},
    {"name": "生活服务", "sort_order": 3},
    {"name": "政府部门", "sort_order": 4},
    {"name": "医疗健康", "sort_order": 5},
    {"name": "教育培训", "sort_order": 6},
]

# 默认商家分类（8 个）
DEFAULT_BUSINESS_CATEGORIES = [
    {"name": "餐饮美食",   "icon": "food",         "sort_order": 1},
    {"name": "超市便利店",  "icon": "store",        "sort_order": 2},
    {"name": "美容美发",   "icon": "beauty",        "sort_order": 3},
    {"name": "家政服务",   "icon": "cleaning",      "sort_order": 4},
    {"name": "维修服务",   "icon": "repair",        "sort_order": 5},
    {"name": "药店诊所",   "icon": "pharmacy",      "sort_order": 6},
    {"name": "教育培训",   "icon": "education",     "sort_order": 7},
    {"name": "休闲娱乐",   "icon": "entertainment", "sort_order": 8},
]
```

### 6.1 演示数据（成信大周边）

`python seed_cuit.py` 可额外写入 5 篇资讯 + 14 条商家 + 14 条电话，覆盖成都信息工程大学航空港校区周边生活服务信息。

---

## 7. 变更记录（v2 vs v1）

| # | 问题 | 修复方案 |
|---|------|----------|
| 1 | 活动报名并发超卖 | events 表移除 `enrolled_count` — 报名时 `SELECT FOR UPDATE` + `COUNT(registrations)` 实时统计 |
| 2 | `VARCHAR user_id` 无主键、可篡改 | 新建 `users` 表（BIGINT PK + openid UNIQUE）— 全部关联表改用 BIGINT FK |
| 3 | news 表缺 category_id 复合索引 | 添加 `INDEX idx_category_status_published (category_id, status, created_at)` |
| 4 | 取消报名后 UNIQUE KEY 阻止再次报名 | 取消 = `DELETE` — 取消报名端点 `POST /events/{id}/cancel` |
| 5a | 富文本无 XSS 过滤 | 新增 `utils/sanitize.py` — 块级清除 `<script>` 等 + 事件属性剥离 |
| 5b | JSON 字段（images）查询效率低 | 新建 `image_attachments` 表 — 多态关联（owner_type + owner_id）替代 JSON |
