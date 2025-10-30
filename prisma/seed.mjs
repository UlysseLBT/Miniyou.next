import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  // 1x1 PNG transparent pour le placeholder si absent
  const uploads = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(uploads)) fs.mkdirSync(uploads, { recursive: true })
  const ph = path.join(uploads, 'placeholder.png')
  if (!fs.existsSync(ph)) {
    const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
    fs.writeFileSync(ph, Buffer.from(b64, 'base64'))
  }

  const password = await bcrypt.hash('password123', 10)

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', username: 'demo', password }
  })

  const tags = await prisma.$transaction(
    ['nature','tech','fun'].map(name =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  )

  await prisma.media.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Bienvenue sur MiniYou',
      description: 'Remplace ce fichier par un vrai upload',
      path: 'uploads/placeholder.png',
      mimeType: 'image/png',
      type: 'IMAGE',
      visibility: 'PUBLIC',
      ownerId: user.id,
      tags: { create: [{ tagId: tags[0].id }] }
    }
  })
}

main().then(async () => {
  await prisma.$disconnect()
}).catch(async (e) => {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
})
