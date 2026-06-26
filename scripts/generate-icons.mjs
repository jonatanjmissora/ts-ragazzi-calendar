import sharp from "sharp"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

const svg = readFileSync("public/logo-light.svg", "utf-8")
const svgBuffer = Buffer.from(svg)

// Generate icons
const icons = [
  { name: "logo192.png", size: 192 },
  { name: "logo512.png", size: 512 },
]

for (const { name, size } of icons) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(`public/${name}`)
  console.log(`Generated public/${name} (${size}x${size})`)
}

// Generate placeholder screenshots
const bgColor = "#09090b"

const screenshots = [
  { name: "screenshot-mobile.png", width: 390, height: 844, iconSize: 120 },
  { name: "screenshot-wide.png", width: 1280, height: 720, iconSize: 200 },
]

for (const { name, width, height, iconSize } of screenshots) {
  const icon = await sharp(svgBuffer).resize(iconSize, iconSize).png().toBuffer()
  await sharp({
    create: { width, height, channels: 3, background: bgColor },
  })
    .composite([{ input: icon, top: Math.round((height - iconSize) / 2), left: Math.round((width - iconSize) / 2) }])
    .png()
    .toFile(`public/${name}`)
  console.log(`Generated public/${name} (${width}x${height})`)
}
