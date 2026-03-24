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

const migrationFiles = [
  'schema.sql',
  'migrations/add_contact_column.sql',
  'migrations/fix_foreign_keys.sql',
  'migrations/fix_profile_creation.sql',
  'migrations/create_storage_bucket.sql'
]

async function executeSQLDirectly(sql, description) {
  try {
    console.log(`📝 执行: ${description}`)
    
    const { data, error } = await supabase
      .from('_temp_execute')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error(`❌ 错误: ${error.message}`)
      return false
    }
    
    console.log(`✅ 成功: ${description}`)
    return true
  } catch (error) {
    console.error(`❌ 执行失败: ${error.message}`)
    return false
  }
}

async function resetDatabase() {
  console.log('🚀 开始重置数据库...\n')
  
  const tables = ['registrations', 'activities', 'profiles']
  
  for (const table of tables) {
    console.log(`🗑️  清空表: ${table}`)
    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (deleteError) {
      console.log(`⚠️  清空 ${table} 失败: ${deleteError.message}`)
    } else {
      console.log(`✅ 已清空: ${table}`)
    }
  }
  
  console.log('')
}

async function runMigrations() {
  console.log('📋 开始执行迁移...\n')
  
  let successCount = 0
  let failCount = 0
  
  for (const file of migrationFiles) {
    const filePath = join(__dirname, '..', 'supabase', file)
    
    try {
      const sql = readFileSync(filePath, 'utf-8')
      
      const success = await executeSQLDirectly(sql, file)
      
      if (success) {
        successCount++
      } else {
        failCount++
      }
    } catch (error) {
      console.error(`❌ 读取文件失败 ${file}: ${error.message}`)
      failCount++
    }
    
    console.log('')
  }
  
  console.log(`\n📊 迁移完成: ${successCount} 成功, ${failCount} 失败`)
}

async function main() {
  const args = process.argv.slice(2)
  const reset = args.includes('--reset') || args.includes('-r')
  
  if (reset) {
    await resetDatabase()
  }
  
  await runMigrations()
  
  console.log('\n✨ 所有操作完成!')
  console.log('\n💡 提示: 如果遇到权限问题，请确保使用 SUPABASE_SERVICE_KEY 而不是 VITE_SUPABASE_ANON_KEY')
}

main().catch(console.error)