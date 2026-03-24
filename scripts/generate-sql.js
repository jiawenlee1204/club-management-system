import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const migrationFiles = [
  'schema.sql',
  'migrations/add_contact_column.sql',
  'migrations/fix_foreign_keys.sql',
  'migrations/fix_profile_creation.sql',
  'migrations/create_storage_bucket.sql'
]

function generateCombinedSQL() {
  console.log('📝 生成完整的 SQL 脚本...\n')
  
  let combinedSQL = `-- ========================================
-- 社团管理系统 - 完整数据库设置脚本
-- 生成时间: ${new Date().toLocaleString('zh-CN')}
-- ========================================

-- 注意: 此脚本会创建所有必要的表、索引、触发器和策略
-- 请在 Supabase SQL Editor 中执行此脚本
-- ========================================

`
  
  for (const file of migrationFiles) {
    const filePath = join(__dirname, '..', 'supabase', file)
    
    try {
      const sql = readFileSync(filePath, 'utf-8')
      
      combinedSQL += `-- ========================================
-- 文件: ${file}
-- ========================================

`
      combinedSQL += sql
      combinedSQL += '\n\n'
      
      console.log(`✅ 已包含: ${file}`)
    } catch (error) {
      console.error(`❌ 读取文件失败 ${file}: ${error.message}`)
    }
  }
  
  combinedSQL += `-- ========================================
-- 执行完成
-- ========================================

-- 验证表是否创建成功
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'activities', 'registrations')
ORDER BY table_name;

-- 验证策略是否创建成功
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 验证触发器是否创建成功
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
`
  
  return combinedSQL
}

async function main() {
  const args = process.argv.slice(2)
  const outputFile = args[0] || 'combined-supabase-setup.sql'
  
  try {
    const sql = generateCombinedSQL()
    
    const outputPath = join(__dirname, '..', outputFile)
    
    const fs = await import('fs')
    fs.writeFileSync(outputPath, sql, 'utf-8')
    
    console.log(`\n✅ 已生成完整的 SQL 脚本: ${outputFile}`)
    console.log(`\n📋 使用说明:`)
    console.log(`1. 打开 Supabase Dashboard`)
    console.log(`2. 进入 SQL Editor`)
    console.log(`3. 复制 ${outputFile} 的内容`)
    console.log(`4. 粘贴到 SQL Editor 中`)
    console.log(`5. 点击 "Run" 执行`)
    console.log(`\n⚠️  注意: 此脚本会创建所有表和策略，但不会删除现有数据`)
    console.log(`   如需清空数据，请在执行前手动删除相关表`)
  } catch (error) {
    console.error(`❌ 生成失败: ${error.message}`)
    process.exit(1)
  }
}

main().catch(console.error)