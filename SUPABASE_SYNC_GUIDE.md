# Supabase 数据库同步指南

## 📋 概述

本指南提供了将本地 Supabase SQL 文件同步到远程 Supabase 数据库的完整方法。

## 🚀 快速开始

### 方法一：使用 npm 命令（推荐）

#### 1. 配置环境变量

确保项目根目录下有 `.env` 文件，包含以下内容：

```env
VITE_SUPABASE_URL=你的_supabase_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
SUPABASE_SERVICE_KEY=你的_supabase_service_key
```

**获取密钥步骤：**
1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 Settings → API
4. 复制以下信息：
   - Project URL
   - anon public key
   - service_role secret（需要管理员权限）

#### 2. 同步数据库

```bash
# 生成完整的 SQL 脚本（推荐）
npm run supabase:generate

# 清空数据库中的数据（仅清空数据，不删除表结构）
npm run supabase:reset-data
```

**重要提示：**
- `npm run supabase:generate` 会生成 `combined-supabase-setup.sql` 文件
- 需要手动在 Supabase Dashboard 的 SQL Editor 中执行此文件
- 这是目前最可靠的方法，可以避免权限和连接问题

### 方法二：生成 SQL 脚本手动执行

如果你无法使用 npm 命令，可以生成完整的 SQL 脚本并在 Supabase Dashboard 中手动执行：

```bash
# 生成完整的 SQL 脚本
npm run supabase:generate

# 这会生成 combined-supabase-setup.sql 文件
```

**手动执行步骤：**
1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 SQL Editor
4. 复制 `combined-supabase-setup.sql` 的全部内容
5. 粘贴到 SQL Editor 中
6. 点击 "Run" 执行

## 📁 项目结构

```
supabase/
├── schema.sql                          # 主数据库架构
└── migrations/
    ├── add_contact_column.sql          # 添加联系信息列
    ├── fix_foreign_keys.sql            # 修复外键约束
    ├── fix_profile_creation.sql        # 修复用户资料创建
    └── create_storage_bucket.sql       # 创建存储桶

scripts/
├── sync-supabase-simple.js            # 简化版同步脚本
└── generate-sql.js                     # SQL 生成脚本
```

## 🔧 可用命令

| 命令 | 说明 | 是否清空数据 |
|------|------|-------------|
| `npm run supabase:generate` | 生成完整的 SQL 脚本文件 | - |
| `npm run supabase:reset-data` | 清空数据库中的数据 | ✅ 是 |

**使用流程：**
1. 运行 `npm run supabase:generate` 生成 SQL 脚本
2. 在 Supabase Dashboard 的 SQL Editor 中执行生成的脚本
3. 如需清空数据，运行 `npm run supabase:reset-data`

## ⚠️ 注意事项

### 使用 `npm run supabase:reset-data` 时

- 此命令会清空以下表的所有数据：
  - `profiles`
  - `activities`
  - `registrations`
- 建议在执行前备份数据
- 适用于开发环境或需要完全重置的场景
- 此命令仅清空数据，不会删除表结构

### 权限问题

- 使用 `VITE_SUPABASE_ANON_KEY` 可能会遇到权限限制
- 建议使用 `SUPABASE_SERVICE_KEY`（service_role secret）
- service_role secret 拥有完全访问权限，请妥善保管

### 冲突处理

- SQL 文件使用 `IF NOT EXISTS` 和 `DROP IF EXISTS` 语句
- 可以安全地多次执行，不会产生冲突
- 外键约束使用 `ON DELETE CASCADE` 自动清理关联数据

## 🐛 故障排除

### 问题 1: "缺少 Supabase 环境变量"

**解决方案：**
- 检查 `.env` 文件是否存在
- 确认环境变量名称正确
- 重新加载环境变量（重启终端）

### 问题 2: "权限不足"

**解决方案：**
- 使用 `SUPABASE_SERVICE_KEY` 而不是 `VITE_SUPABASE_ANON_KEY`
- 确认 service_role secret 正确
- 检查 Supabase 项目设置中的权限配置

### 问题 3: "表已存在"

**解决方案：**
- 这是正常的，SQL 文件使用 `IF NOT EXISTS`
- 如果需要完全重置，使用 `npm run supabase:reset`

### 问题 4: "外键约束错误"

**解决方案：**
- 检查 `fix_foreign_keys.sql` 是否已执行
- 确认表的创建顺序正确
- 使用 `npm run supabase:reset` 完全重置

## 📊 数据库架构

### 主要表结构

1. **profiles** - 用户资料表
   - id (UUID, 主键)
   - name (姓名)
   - student_id (学号)
   - major (专业)
   - contact (联系方式)
   - bio (个人简介)

2. **activities** - 活动表
   - id (UUID, 主键)
   - title (标题)
   - content (内容)
   - date (日期)
   - location (地点)
   - image_url (图片链接)
   - created_by (创建者)

3. **registrations** - 报名表
   - id (UUID, 主键)
   - activity_id (活动ID)
   - user_id (用户ID)
   - status (状态)

### 安全策略

- 启用行级安全（RLS）
- 用户只能访问自己的数据
- 活动对所有认证用户可见
- 报名记录对所有用户可见

## 🔄 工作流程

### 首次设置

```bash
# 1. 配置环境变量
cp .env.example .env

# 2. 编辑 .env 文件，填入你的 Supabase 凭证

# 3. 生成 SQL 脚本
npm run supabase:generate

# 4. 在 Supabase Dashboard 的 SQL Editor 中执行 combined-supabase-setup.sql
```

### 日常开发

```bash
# 修改 SQL 文件后

# 1. 重新生成 SQL 脚本
npm run supabase:generate

# 2. 在 Supabase Dashboard 的 SQL Editor 中执行生成的脚本

# 3. 如果需要清空数据
npm run supabase:reset-data
```

### 生产环境部署

```bash
# 1. 生成 SQL 脚本
npm run supabase:generate

# 2. 在 Supabase Dashboard 的 SQL Editor 中执行生成的脚本
```

## 📞 获取帮助

如果遇到问题：

1. 检查 [Supabase 文档](https://supabase.com/docs)
2. 查看 SQL 文件中的注释
3. 使用 `npm run supabase:generate` 生成脚本并手动执行
4. 检查 Supabase Dashboard 中的日志

## 🎯 最佳实践

1. **开发环境**：
   - 使用 `npm run supabase:generate` 生成 SQL 脚本
   - 在 Supabase Dashboard 中手动执行
   - 遇到问题时使用 `npm run supabase:reset-data` 清空数据

2. **测试环境**：
   - 使用 `npm run supabase:generate` 生成 SQL 脚本
   - 在 Supabase Dashboard 中手动执行
   - 保留测试数据以便验证功能

3. **生产环境**：
   - 先生成 SQL 脚本：`npm run supabase:generate`
   - 手动审核 `combined-supabase-setup.sql` 的内容
   - 在 Supabase Dashboard 的 SQL Editor 中执行
   - 执行前备份重要数据

4. **定期备份**：在执行重置前备份重要数据
5. **版本控制**：将 SQL 文件纳入 Git 版本控制
6. **权限管理**：妥善保管 SUPABASE_SERVICE_KEY

## 📝 更新日志

- 2026-03-24: 创建同步脚本和使用指南
- 添加一键同步命令到 package.json
- 支持数据库重置功能
- 提供 SQL 脚本生成功能