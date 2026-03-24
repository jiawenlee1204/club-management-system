import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 错误: 缺少 Supabase 环境变量')
  console.error('请确保 .env 文件中包含 VITE_SUPABASE_URL 和 SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function resetDatabase() {
  console.log('🚀 开始重置数据库...\n')
  
  const tables = ['registrations', 'activities', 'profiles']
  
  for (const table of tables) {
    console.log(`🗑️  清空表: ${table}`)
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      if (error) {
        console.log(`⚠️  清空 ${table} 失败: ${error.message}`)
      } else {
        console.log(`✅ 已清空: ${table}`)
      }
    } catch (error) {
      console.log(`⚠️  清空 ${table} 时出错: ${error.message}`)
    }
  }
  
  console.log('')
}

async function main() {
  const args = process.argv.slice(2)
  const reset = args.includes('--reset') || args.includes('-r')
  
  if (reset) {
    await resetDatabase()
    console.log('⚠️  数据已清空，请使用以下步骤完成数据库设置：\n')
  }
  
  console.log('📋 推荐使用方法：\n')
  console.log('方法 1: 使用生成的 SQL 脚本（推荐）')
  console.log('  1. 运行: npm run supabase:generate')
  console.log('  2. 打开 Supabase Dashboard → SQL Editor')
  console.log('  3. 复制 combined-supabase-setup.sql 的内容')
  console.log('  4. 粘贴并执行\n')
  
  console.log('方法 2: 手动执行 SQL 文件')
  console.log('  1. 打开 Supabase Dashboard → SQL Editor')
  console.log('  2. 按顺序执行以下文件：')
  console.log('     - supabase/schema.sql')
  console.log('     - supabase/migrations/add_contact_column.sql')
  console.log('     - supabase/migrations/fix_foreign_keys.sql')
  console.log('     - supabase/migrations/fix_profile_creation.sql')
  console.log('     - supabase/migrations/create_storage_bucket.sql\n')
  
  console.log('💡 提示:')
  console.log('- 如果遇到权限问题，请确保使用 SUPABASE_SERVICE_KEY')
  console.log('- 详细说明请查看 SUPABASE_SYNC_GUIDE.md')
  console.log('- SQL 脚本使用 IF NOT EXISTS，可以安全地多次执行')
}

main().catch(console.error)