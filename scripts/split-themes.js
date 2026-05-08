/**
 * 数据预处理脚本：拆分 theme_full_shenzhen.json
 * 
 * 输入: docs/biaodan/theme_full_shenzhen.json (76K行, 84个主题)
 * 输出: 
 *   - pc/public/themes/index.json (84条主题索引, ~3KB)
 *   - pc/public/themes/{themeId}.json (每个主题独立文件, 5-20KB)
 * 
 * 用法: node scripts/split-themes.js
 */

const fs = require('fs')
const path = require('path')

const INPUT = path.resolve(__dirname, '../docs/biaodan/theme_full_shenzhen.json')
const OUTPUT_DIR = path.resolve(__dirname, '../pc/public/themes')

// 确保输出目录存在
fs.mkdirSync(OUTPUT_DIR, { recursive: true })

console.log('Reading source data...')
const data = JSON.parse(fs.readFileSync(INPUT, 'utf8'))
console.log(`Found ${data.length} themes`)

// 1. 生成 index.json
const index = data.map(t => ({
  id: t.themeId,
  themeName: t.themeName,
  category: t.category,
  count: t.count
}))

const indexPath = path.join(OUTPUT_DIR, 'index.json')
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
console.log(`Generated index.json (${(Buffer.byteLength(JSON.stringify(index)) / 1024).toFixed(1)}KB)`)

// 2. 生成每个主题的独立文件
let totalItems = 0
for (const theme of data) {
  const simplified = {
    themeName: theme.themeName,
    category: theme.category,
    items: theme.items.map(item => ({
      scopeId: item.scopeId,
      standardItem: item.standardItem,
      scopeCode: item.scopeCode,
      description: item.description,
      permitType: item.permitType,
      detail: item.detail ? {
        isPermission: item.detail.isPermission || '',
        permitExplain: item.detail.permitExplain || '',
        includedItems: item.detail.includedItems || '',
        notIncluded: item.detail.notIncluded || '',
        remarks: item.detail.remarks || '',
        specialTips: item.detail.specialTips || ''
      } : null
    }))
  }

  totalItems += theme.items.length
  const filePath = path.join(OUTPUT_DIR, `${theme.themeId}.json`)
  fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2), 'utf8')
  const sizeKB = (Buffer.byteLength(JSON.stringify(simplified)) / 1024).toFixed(1)
  console.log(`  ${theme.themeName} (${theme.category}) - ${theme.items.length} items - ${sizeKB}KB`)
}

// 3. 统计
console.log('\n--- Summary ---')
console.log(`Themes: ${data.length}`)
console.log(`Total items: ${totalItems}`)
console.log(`Output directory: ${OUTPUT_DIR}`)
console.log(`Files generated: 1 index + ${data.length} theme files = ${data.length + 1} files`)

// 4. 验证：统计分类
const categories = {}
for (const t of data) {
  categories[t.category] = (categories[t.category] || 0) + 1
}
console.log('\nCategories:')
Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} themes`)
})
