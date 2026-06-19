# C 端合作申请表单

多类型合作申请表单系统，支持城市合伙人、技能合作、市场合作、孵化合作和职位申请等多种合作类型。

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [环境变量配置](#环境变量配置)
  - [服务器配置](#服务器配置)
  - [文件上传配置](#文件上传配置)
  - [表单审核配置](#表单审核配置)
  - [通知配置](#通知配置)
- [部署指南](#部署指南)
  - [本地部署](#本地部署)
  - [Vercel 部署](#vercel-部署)
- [API 文档](#api-文档)
- [表单类型](#表单类型)
- [数据模型](#数据模型)
- [开发指南](#开发指南)
- [常见问题](#常见问题)

## 功能特性

- 📋 **多表单类型**：支持 5 种合作申请类型
- 📁 **文件上传**：支持多文件拖拽上传，格式/大小校验
- ✅ **表单校验**：前后端双重校验，数据格式验证
- 📧 **通知机制**：新申请邮件通知管理员
- 🔍 **审核流程**：支持自动审核和人工审核
- 📱 **响应式设计**：适配桌面端和移动端
- 🎨 **精致 UI**：克制精致的编辑式商务风格

## 技术栈

### 前端
- **框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **路由**：Vue Router
- **图标**：Lucide Vue

### 后端
- **框架**：Express 4
- **语言**：TypeScript (ESM)
- **文件上传**：Multer 2.0
- **环境变量**：dotenv
- **跨域**：CORS

## 项目结构

```
.
├── api/                      # 后端 API 服务
│   ├── data/                 # JSON 数据文件
│   ├── lib/                  # 公共库
│   │   ├── config.ts         # 配置管理（环境变量）
│   │   └── storage.ts        # 数据存储
│   ├── routes/               # API 路由
│   │   ├── apply.ts          # 城市合伙人申请
│   │   ├── skill-apply.ts    # 技能合作申请
│   │   ├── market-apply.ts   # 市场合作申请
│   │   ├── incubation-apply.ts  # 孵化合作申请
│   │   └── job-apply.ts      # 职位申请
│   ├── app.ts                # Express 应用
│   ├── server.ts             # 本地开发服务器
│   └── index.ts              # Vercel Serverless 入口
├── src/                      # 前端源码
│   ├── components/           # Vue 组件
│   ├── composables/          # Vue Composables
│   ├── pages/                # 页面组件
│   └── router/               # 路由配置
├── uploads/                  # 上传文件存储目录
├── .env.example              # 环境变量模板
├── vercel.json               # Vercel 配置
└── package.json              # 项目依赖
```

## 快速开始

### 环境要求
- Node.js >= 18.x
- pnpm >= 8.x

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

```bash
cp .env.example .env
```

根据需要修改 `.env` 文件中的配置。

### 启动开发服务器

```bash
pnpm run dev
```

- 前端页面：http://localhost:5173
- API 服务：http://localhost:3001

### 构建生产版本

```bash
pnpm run build
```

## 环境变量配置

所有配置项都可以通过环境变量进行设置，配置文件为 `.env`。

### 服务器配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PORT` | number | `3001` | API 服务端口号 |

### 文件上传配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `UPLOAD_DIR` | string | `./uploads` | 上传文件存储目录（相对项目根目录） |
| `UPLOAD_MAX_SIZE` | number | `10485760` | 单文件最大大小（字节，默认 10MB） |
| `UPLOAD_MAX_FILES` | number | `10` | 单次最大上传文件数量 |
| `UPLOAD_ALLOWED_MIME` | string | `application/pdf,image/jpeg,image/png` | 允许的文件 MIME 类型，多个用逗号分隔 |

**配置示例：**
```dotenv
UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE=20971520
UPLOAD_MAX_FILES=5
UPLOAD_ALLOWED_MIME=application/pdf,image/jpeg,image/png,image/webp
```

### 表单审核配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `REVIEW_AUTO_APPROVE` | boolean | `false` | 是否自动审核通过（true 为自动通过） |
| `REVIEW_REQUIRED_FIELDS` | string | `companyName,creditCode,cities,attachments` | 必填校验字段，多个用逗号分隔 |
| `REVIEW_CONTACT_EMAIL` | string | `admin@example.com` | 审核联系人邮箱 |

**配置示例：**
```dotenv
REVIEW_AUTO_APPROVE=true
REVIEW_REQUIRED_FIELDS=companyName,creditCode,cities,attachments
REVIEW_CONTACT_EMAIL=review@example.com
```

### 通知配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NOTIFY_ENABLED` | boolean | `false` | 是否启用邮件通知 |
| `NOTIFY_SMTP_HOST` | string | `` | SMTP 服务器地址 |
| `NOTIFY_SMTP_PORT` | number | `587` | SMTP 端口 |
| `NOTIFY_SMTP_USER` | string | `` | SMTP 用户名 |
| `NOTIFY_SMTP_PASS` | string | `` | SMTP 密码 |
| `NOTIFY_SMTP_SECURE` | boolean | `false` | 是否使用 SSL 连接 |
| `NOTIFY_FROM_NAME` | string | `合作申请平台` | 发件人名称 |
| `NOTIFY_FROM_EMAIL` | string | `noreply@example.com` | 发件人邮箱 |
| `NOTIFY_ADMIN_EMAILS` | string | `` | 管理员通知邮箱，多个用逗号分隔 |
| `NOTIFY_TEMPLATE_APPLY_SUBJECT` | string | `新合作申请提交通知` | 新申请邮件主题 |
| `NOTIFY_TEMPLATE_REVIEW_SUBJECT` | string | `合作申请审核结果通知` | 审核结果邮件主题 |

**配置示例：**
```dotenv
NOTIFY_ENABLED=true
NOTIFY_SMTP_HOST=smtp.qq.com
NOTIFY_SMTP_PORT=465
NOTIFY_SMTP_USER=noreply@example.com
NOTIFY_SMTP_PASS=your_smtp_password
NOTIFY_SMTP_SECURE=true
NOTIFY_FROM_NAME=合作申请平台
NOTIFY_FROM_EMAIL=noreply@example.com
NOTIFY_ADMIN_EMAILS=admin1@example.com,admin2@example.com
NOTIFY_TEMPLATE_APPLY_SUBJECT=【重要】新合作申请提交通知
NOTIFY_TEMPLATE_REVIEW_SUBJECT=合作申请审核结果通知
```

## 部署指南

### 本地部署

1. **克隆项目**
```bash
git clone <repository-url>
cd 010-C端合作申请表单
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，根据需要修改配置
```

4. **构建项目**
```bash
pnpm run build
```

5. **启动服务**
```bash
# 开发模式
pnpm run dev

# 生产模式（需要先构建）
pnpm run server:dev
```

### Vercel 部署

项目已配置好 Vercel 部署所需的文件，可直接一键部署。

#### 1. 准备工作
- 注册 Vercel 账号：https://vercel.com
- 安装 Vercel CLI（可选）：`npm i -g vercel`

#### 2. 配置环境变量

在 Vercel 项目设置中配置环境变量（Settings → Environment Variables）：

| 环境变量 | 说明 | 生产环境 | 预览环境 | 开发环境 |
|----------|------|---------|---------|---------|
| `PORT` | API 端口（Vercel 自动配置，可省略） | ✅ | ✅ | ✅ |
| `UPLOAD_DIR` | 上传目录（建议使用 `/tmp/uploads`） | ✅ | ✅ | ✅ |
| `UPLOAD_MAX_SIZE` | 单文件最大大小 | ✅ | ✅ | ✅ |
| `UPLOAD_MAX_FILES` | 最大文件数量 | ✅ | ✅ | ✅ |
| `UPLOAD_ALLOWED_MIME` | 允许的文件类型 | ✅ | ✅ | ✅ |
| `REVIEW_AUTO_APPROVE` | 是否自动审核 | ✅ | ✅ | ✅ |
| `REVIEW_CONTACT_EMAIL` | 审核联系人 | ✅ | ✅ | ✅ |
| `NOTIFY_ENABLED` | 是否启用通知 | ✅ | ✅ | ✅ |
| `NOTIFY_SMTP_HOST` | SMTP 服务器 | ✅ | ❌ | ❌ |
| `NOTIFY_SMTP_USER` | SMTP 用户名 | ✅ | ❌ | ❌ |
| `NOTIFY_SMTP_PASS` | SMTP 密码 | ✅ | ❌ | ❌ |
| `NOTIFY_ADMIN_EMAILS` | 管理员邮箱 | ✅ | ❌ | ❌ |

> **注意**：Vercel Serverless 环境的文件系统是临时的，上传的文件在函数执行结束后会丢失。
> 生产环境建议使用对象存储服务（如阿里云 OSS、AWS S3 等）存储上传文件。

#### 3. 部署方式

**方式一：通过 Vercel 网站部署**
1. 登录 Vercel，点击 "Add New..." → "Project"
2. 导入你的 Git 仓库
3. 在 "Configure Project" 页面：
   - Framework Preset: Vite
   - Build Command: `pnpm run build`
   - Output Directory: `dist`
4. 点击 "Deploy" 开始部署

**方式二：通过 CLI 部署**
```bash
# 登录 Vercel
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

#### 4. 验证部署

部署成功后，访问 Vercel 分配的域名，验证以下功能：
- 首页是否正常显示
- 表单是否可以正常提交
- API 接口是否正常响应：`GET /api/health`

## API 文档

### 基础信息
- Base URL: `http://localhost:3001/api`（开发环境）
- Content-Type: `multipart/form-data`（文件上传）或 `application/json`

### 接口列表

#### 1. 健康检查
```
GET /api/health
```

**响应示例：**
```json
{
  "success": true,
  "message": "ok"
}
```

#### 2. 获取城市列表
```
GET /api/cities
```

**响应示例：**
```json
{
  "cities": ["北京市", "上海市", "广州市", "深圳市", ...]
}
```

#### 3. 提交城市合伙人申请
```
POST /api/apply
Content-Type: multipart/form-data
```

**请求字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `companyName` | string | 是 | 企业全称（最多 100 字） |
| `creditCode` | string | 是 | 统一社会信用代码（18 位大写字母+数字） |
| `cities` | string | 是 | 覆盖城市 JSON 数组，如 `["北京市","上海市"]` |
| `attachments` | File[] | 是 | 资质附件，支持 PDF/JPG/PNG |

**成功响应：**
```json
{
  "success": true,
  "applicationNo": "CAP-20260620-A1B2",
  "receivedAt": "2026-06-20T10:00:00.000Z",
  "status": "pending"
}
```

**失败响应：**
```json
{
  "success": false,
  "errors": [
    { "field": "companyName", "message": "请填写企业全称" }
  ]
}
```

#### 4. 提交技能合作申请
```
POST /api/skill-apply
Content-Type: multipart/form-data
```

**请求字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `direction` | string | 是 | 合作方向：`hardware` 或 `software` |
| `attachments` | File[] | 是 | 个人作品集附件 |

#### 5. 提交市场合作申请
```
POST /api/market-apply
Content-Type: application/json
```

**请求字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 企业/个人名称 |
| `contact` | string | 是 | 联系人信息 |
| `address` | string | 是 | 地址 |
| `businessIntro` | string | 是 | 业务介绍 |
| `advantages` | string | 是 | 合作优势 |

#### 6. 提交孵化合作申请
```
POST /api/incubation-apply
Content-Type: application/json
```

**请求字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `projectIntro` | string | 是 | 项目介绍 |
| `incubationNeeds` | string | 是 | 孵化需求 |

#### 7. 提交职位申请
```
POST /api/job-apply
Content-Type: application/json
```

**请求字段：**
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 姓名 |
| `phone` | string | 是 | 手机号码（11 位） |
| `email` | string | 是 | 邮箱地址 |
| `city` | string | 是 | 现居城市 |
| `expectedSalary` | string | 是 | 期望薪资 |

## 表单类型

| 表单类型 | 路由 | 前缀 | 说明 |
|---------|------|------|------|
| 城市合伙人 | `/` | `CAP` | 企业申请成为城市合伙人 |
| 技能合作 | `/skill-apply` | `SA` | 个人/团队技能合作 |
| 市场合作 | `/market-apply` | `MAP` | 市场营销合作 |
| 孵化合作 | `/incubation-apply` | `INC` | 项目孵化申请 |
| 职位申请 | `/job-apply` | `JOB` | 人才招聘申请 |

## 数据模型

### 申请状态
- `pending`：待审核
- `approved`：已通过
- `rejected`：已拒绝

### 通用字段
所有申请记录都包含以下字段：
- `applicationNo`：申请编号，格式为 `前缀-日期-随机码`
- `receivedAt`：提交时间（ISO 格式）
- `status`：审核状态
- `reviewedAt`：审核时间（自动审核时等于提交时间）

### 数据存储
- JSON 数据文件：`api/data/*.json`
- 上传文件：`uploads/` 目录

## 开发指南

### 代码检查

```bash
# TypeScript 类型检查
pnpm run check

# ESLint 代码检查
pnpm run lint

# 自动修复
pnpm run lint:fix
```

### 运行测试

```bash
# 运行所有测试
pnpm run test

# 监听模式
pnpm run test:watch

# 测试覆盖率
pnpm run test:coverage
```

### 目录规范

- 新增 API 路由：`api/routes/` 目录
- 新增页面：`src/pages/` 目录
- 新增组件：`src/components/` 目录
- 新增组合式函数：`src/composables/` 目录

## 常见问题

### Q1: 上传的文件丢失了怎么办？

A: 本项目默认使用本地文件系统存储上传文件。在 Vercel Serverless 环境中，文件系统是临时的，建议生产环境使用对象存储服务（如阿里云 OSS、AWS S3）。

### Q2: 如何配置邮件通知？

A: 在 `.env` 文件中设置 `NOTIFY_ENABLED=true`，并正确配置 SMTP 服务器信息。支持 QQ 邮箱、163 邮箱、企业邮箱等。

### Q3: 如何修改表单字段？

A: 前端修改 `src/components/` 目录下对应的表单组件，后端修改 `api/routes/` 目录下对应的路由文件，同时更新 `api/lib/storage.ts` 中的数据模型。

### Q4: 端口被占用怎么办？

A: 修改 `.env` 文件中的 `PORT` 配置，或在启动时指定端口：`PORT=3002 pnpm run dev`。

### Q5: 如何添加新的表单类型？

A: 
1. 在 `src/pages/` 创建新页面
2. 在 `src/components/` 创建表单组件
3. 在 `src/composables/` 创建业务逻辑
4. 在 `src/router/` 配置路由
5. 在 `api/routes/` 创建 API 路由
6. 在 `api/lib/storage.ts` 添加数据模型
7. 在 `api/app.ts` 注册路由

## License

MIT
