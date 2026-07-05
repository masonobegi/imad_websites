/**
 * One-time script: merge duplicate "San Francisco Bay" photo categories.
 * Run with: DATABASE_URL="postgresql://..." node scripts/fix-duplicate-sf-category.js
 */
const { PrismaClient } = require('./photography/node_modules/@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const cats = await prisma.photoCategory.findMany({ orderBy: { sortOrder: 'asc' } })

  // Find all categories whose label contains "san francisco" (case-insensitive)
  const sfCats = cats.filter(c => c.label.toLowerCase().includes('san francisco'))
  console.log('Found SF categories:', sfCats.map(c => `${c.slug} (${c.label})`))

  if (sfCats.length < 2) {
    console.log('Only one SF category found — nothing to do.')
    return
  }

  // Count photos in each
  const counts = await Promise.all(
    sfCats.map(c => prisma.photo.count({ where: { category: c.slug } }).then(n => ({ ...c, count: n })))
  )
  counts.forEach(c => console.log(`  ${c.slug}: ${c.count} photos`))

  // Keep the one with the most photos; merge all others into it
  counts.sort((a, b) => b.count - a.count)
  const [primary, ...duplicates] = counts

  console.log(`\nKeeping: ${primary.slug} (${primary.count} photos)`)
  for (const dup of duplicates) {
    console.log(`Merging: ${dup.slug} (${dup.count} photos) → ${primary.slug}`)
    await prisma.photo.updateMany({
      where: { category: dup.slug },
      data: { category: primary.slug },
    })
    await prisma.photoCategory.delete({ where: { slug: dup.slug } })
    console.log(`  Deleted category: ${dup.slug}`)
  }

  console.log('\nDone.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
