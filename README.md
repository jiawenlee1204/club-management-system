# ClubFlow - 社团管理助手

基于 Supabase 后端服务，采用 Notion 风格视觉设计的轻量化社团成员与活动管理工具。

## 功能特性

### 成员管理
- 信息录入：支持手动添加学生基本信息（姓名、学号、专业、联系方式）
- 成员名册：卡片视图与表格视图切换，实时搜索过滤
- 个人主页：展示成员详细信息，支持编辑

### 活动管理
- 发布活动：创建活动，包含标题、时间、地点、详情描述及图片
- 活动列表：按时间倒序展示活动，显示活动状态
- 一键报名：成员可快速报名活动，防止重复报名

### 数据统计
- 报名看板：实时展示每个活动的报名数据
- 导出清单：支持复制或导出为 CSV 格式

## 技术栈

- **前端框架**：React + Vite
- **样式**：Tailwind CSS
- **后端服务**：Supabase
- **路由**：React Router
- **认证**：Supabase Auth

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd 社团管理
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 在项目设置中获取 API URL 和 anon key
3. 创建 `.env` 文件并添加以下内容：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 初始化数据库

在 Supabase SQL 编辑器中执行 `supabase/schema.sql` 文件中的 SQL 脚本，创建必要的表和策略。

### 5. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

## 数据库结构

### profiles 表
存储成员基础信息

- `id` (UUID, 主键)：关联 auth.users
- `name` (TEXT)：成员姓名
- `student_id` (TEXT, UNIQUE)：学号
- `major` (TEXT)：专业
- `bio` (TEXT)：个人简介
- `created_at` (TIMESTAMP)：创建时间
- `updated_at` (TIMESTAMP)：更新时间

### activities 表
存储活动详情

- `id` (UUID, 主键)：活动 ID
- `title` (TEXT)：活动标题
- `content` (TEXT)：活动详情
- `date` (TIMESTAMP)：活动时间
- `location` (TEXT)：活动地点
- `image_url` (TEXT)：活动图片 URL
- `created_by` (UUID)：创建者 ID
- `created_at` (TIMESTAMP)：创建时间
- `updated_at` (TIMESTAMP)：更新时间

### registrations 表
存储活动报名关系

- `id` (UUID, 主键)：报名 ID
- `activity_id` (UUID)：活动 ID
- `user_id` (UUID)：用户 ID
- `status` (TEXT)：报名状态
- `created_at` (TIMESTAMP)：报名时间

## 部署

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

## 开发指南

### 项目结构

```
src/
├── components/       # 可复用组件
│   ├── Navbar.jsx
│   └── ProtectedRoute.jsx
├── contexts/         # React Context
│   └── AuthContext.jsx
├── lib/             # 工具库
│   └── supabase.js
├── pages/           # 页面组件
│   ├── Dashboard.jsx
│   ├── Members.jsx
│   ├── Activities.jsx
│   └── Stats.jsx
├── App.jsx          # 主应用组件
└── main.tsx         # 入口文件
```

### 样式规范

项目采用 Notion 风格设计：

- **背景色**：#FFFFFF（卡片）、#F7F7F7（页面背景）
- **文字色**：#37352F（正文）、#9B9A97（辅助文字）
- **边框色**：#E9E9E7
- **圆角**：8px-12px
- **字体**：Inter、PingFang SC

### 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run preview` - 预览生产构建

## 常见问题

### 如何添加管理员？

在 Supabase Authentication 中创建用户，该用户即可登录系统。

### 如何修改主题颜色？

编辑 `tailwind.config.js` 文件中的颜色配置。

### 如何添加新功能？

1. 在 `src/pages/` 中创建新页面组件
2. 在 `src/App.jsx` 中添加路由
3. 在 `src/components/Navbar.jsx` 中添加导航链接

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue。
