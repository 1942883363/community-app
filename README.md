
```markdown
# 社区便民资讯平台

基于 FastAPI + React + 微信小程序的社区便民服务一站式数字化平台，为社区居民提供资讯浏览、便民服务查询、意见反馈等功能，同时为管理者提供高效的信息发布和工单处理工具。

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端框架 | FastAPI (Python 3.10+) |
| ORM | SQLAlchemy 2.0 |
| 数据库 | MySQL 8.0 |
| 认证 | JWT (python-jose) + bcrypt |
| 管理前端 | React 18 + TypeScript + Ant Design 5 |
| 构建工具 | Vite |
| 小程序端 | 微信原生框架 |
| 外部 API | 高德地图公交 API |

## 项目结构

```
├── backend/                 # FastAPI 后端
│   ├── main.py              # 应用入口
│   ├── config.py            # 配置管理
│   ├── .env                 # 环境变量（不入仓库）
│   ├── requirements.txt     # Python 依赖
│   ├── database.py          # 数据库引擎
│   ├── seed.py              # 种子数据
│   ├── seed_cuit.py         # 成信大周边演示数据
│   ├── models/              # SQLAlchemy 模型（13 张表）
│   ├── schemas/             # Pydantic 请求/响应模型
│   ├── routers/             # API 路由
│   ├── utils/               # 工具函数（JWT、XSS 过滤、响应封装）
│   └── sql/init.sql         # 数据库 DDL
├── admin-frontend/          # React 管理后台
│   └── src/
│       ├── api/             # Axios API 封装
│       ├── pages/           # 页面组件（登录/仪表盘/资讯/反馈/电话簿/活动/商家）
│       ├── components/      # 公共组件（布局/图片上传）
│       ├── stores/          # 状态管理（AuthContext）
│       └── types/           # TypeScript 类型定义
├── miniprogram/             # 微信小程序
│   ├── utils/               # 请求封装
│   └── pages/               # 页面（首页/资讯/电话簿/活动/商家/公交/反馈/个人中心）
└── .trae/skills/
    └── bus-metro-query/     # 公交地铁查询 TRAE Skill
```

## 功能模块

| 模块 | 小程序端 | 管理后台 |
|------|----------|----------|
| 资讯 | 分类浏览、详情、点赞、分享 | 分类管理、资讯 CRUD、置顶 |
| 反馈 | 提交反馈、上传图片、查看记录 | 工单列表、状态流转（待处理→处理中→已解决） |
| 电话簿 | 分类查询、一键拨号 | 分类管理、条目 CRUD |
| 活动 | 活动列表、详情、在线报名 | 活动 CRUD、查看报名记录 |
| 商家 | 分类查询、详情、地图导航、一键拨号 | 分类管理、商家 CRUD |
| 公交查询 | 定位周边站点、线路搜索 | API 代理（高德公交 API） |
| 个人中心 | 点赞/报名/反馈记录查看 | — |

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+
- MySQL 8.0
- 微信开发者工具

### 1. 克隆项目

```bash
git clone https://github.com/1942883363/community-app.git
cd 你的仓库名
```

### 2. 后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

# 安装依赖
pip install -r requirements.txt

# 配置 .env（复制模板填入实际值）
copy .env.example .env
# 编辑 .env 填入你的 MySQL 密码和高德 API Key

# 创建数据库并建表
mysql -u root -p < sql\init.sql

# 初始化种子数据
python seed.py

# （可选）导入成信大周边演示数据
python seed_cuit.py

# 启动服务
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API 文档：http://localhost:8000/docs

### 3. 管理后台

```bash
cd admin-frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:5173，默认账号 `admin` / `admin123`

### 4. 微信小程序

1. 下载安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram` 目录，AppID 选"测试号"
3. 修改 `miniprogram/utils/config.js` 中的 `BASE_URL` 为后端地址

```javascript
// 本地开发用 localhost
const BASE_URL = 'http://localhost:8000/api'

// 手机真机调试用电脑局域网 IP
// const BASE_URL = 'http://真实ip/api'
```

4. 点击"编译"运行

### 5. 手机真机调试

1. 手机和电脑连接同一 WiFi（或电脑开热点手机连接）
2. 查看电脑 IP：`ipconfig | findstr IPv4`
3. 将 `miniprogram/utils/config.js` 中的 `BASE_URL` 改为 `http://真实IP:8000/api`
4. 微信开发者工具点击"预览" → 手机扫码

## 环境变量

```env
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=community_db
SECRET_KEY=你的JWT密钥
AMAP_API_KEY=你的高德Web服务API Key
```

高德 API Key 申请：[高德开放平台](https://lbs.amap.com/) → 创建应用 → 添加 Key → 服务平台选「Web服务」

## 数据库表

| 表名 | 说明 |
|------|------|
| admin_users | 管理员用户 |
| users | 统一用户表（OpenID 关联） |
| categories | 资讯分类（支持两级） |
| news | 资讯 |
| news_likes | 资讯点赞记录 |
| feedback | 意见反馈 |
| phone_categories | 电话簿分类 |
| phone_entries | 电话条目 |
| events | 社区活动 |
| registrations | 活动报名记录 |
| business_categories | 商家分类 |
| businesses | 商家信息 |
| image_attachments | 图片附件（多态关联） |

## 安全特性

- XSS 防护：富文本内容写入前经 `sanitize_html` 清洗（移除 script/事件属性）
- 并发安全：活动报名使用 `SELECT FOR UPDATE` 悲观锁 + COUNT 实时统计防超卖
- 身份隔离：用户操作通过 `users` 表 BIGINT FK 关联，避免设备 ID 篡改
- 密码安全：bcrypt 哈希存储，Token 使用 JWT + 过期时间
```

