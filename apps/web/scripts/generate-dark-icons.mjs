#!/usr/bin/env node
/**
 * Gera ícones PWA no estilo dark mode:
 *   - Fundo: #09090f (preto do app)
 *   - Braço esquerdo (navy → cinza visível com gradiente)
 *   - Braço direito + círculo: teal mantido (#4ECDC4)
 *
 * Executar: node scripts/generate-dark-icons.mjs
 *
 * Análise dos endpoints do logo original (512×512):
 *
 *  Braço cinza (checkmark arm esquerdo "\"):
 *    • topo:  (74, 230)  — superior-esquerdo
 *    • base:  (230, 400) — inferior-centro (vértice do V)
 *    • midpoint: (152, 315), length≈230, half=115
 *    • rotação: -42.6° (no SVG, "\" requer ângulo negativo)
 *
 *  Braço teal (checkmark arm direito "/"):
 *    • base:  (230, 400) — inferior-centro (vértice compartilhado)
 *    • topo:  (420, 160) — superior-direito
 *    • midpoint: (325, 280), length≈306, half=153
 *    • rotação: +38.4°
 *
 *  Círculo: center (440, 98), raio 43
 */

import sharp from 'sharp'
import { mkdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const iconsDir = path.join(__dirname, '..', 'public', 'icons')

if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true })
}

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Gradiente cinza para braço esquerdo (visível no fundo escuro) -->
    <linearGradient id="grayArm" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#C8D6E2"/>
      <stop offset="45%"  stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#556070"/>
    </linearGradient>

    <!-- Gradiente teal para braço direito (sutil profundidade) -->
    <linearGradient id="tealArm" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#5EDDD4"/>
      <stop offset="100%" stop-color="#32AEA5"/>
    </linearGradient>

    <!-- Gradiente radial para o círculo -->
    <radialGradient id="tealDot" cx="38%" cy="32%" r="62%" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#72E8DF"/>
      <stop offset="100%" stop-color="#32AEA5"/>
    </radialGradient>
  </defs>

  <!-- Fundo preto do app -->
  <rect width="512" height="512" fill="#09090f"/>

  <!-- Braço cinza (arm esquerdo "\" do checkmark)
       topo (74,230) → base (230,400) | mid=(152,315) | rot=-42.6° -->
  <g transform="translate(152, 315) rotate(-42.6)">
    <rect
      x="-39" y="-115"
      width="78" height="230"
      rx="39" ry="39"
      fill="url(#grayArm)"
    />
  </g>

  <!-- Braço teal (arm direito "/" do checkmark — renderizado por cima)
       base (230,400) → topo (420,160) | mid=(325,280) | rot=+38.4° -->
  <g transform="translate(325, 280) rotate(38.4)">
    <rect
      x="-39" y="-153"
      width="78" height="306"
      rx="39" ry="39"
      fill="url(#tealArm)"
    />
  </g>

  <!-- Círculo/ponto teal (dot do "i") -->
  <circle cx="440" cy="98" r="43" fill="url(#tealDot)"/>
</svg>`

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA dark mode...\n')

  const svgBuffer = Buffer.from(svgContent)

  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}.png`)

    await sharp(svgBuffer)
      .resize(size, size)
      .png({ compressionLevel: 9, quality: 100 })
      .toFile(outputPath)

    console.log(`  ✓ icon-${size}.png`)
  }

  console.log('\n✅ Todos os ícones dark mode gerados com sucesso!')
  console.log(`   Pasta: ${iconsDir}`)
}

generateIcons().catch((err) => {
  console.error('❌ Erro ao gerar ícones:', err)
  process.exit(1)
})
