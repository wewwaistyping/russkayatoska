const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MAX_WIDTH = 1200;
const QUALITY = 80;
let processed = 0, skipped = 0, errors = 0, totalSavedBytes = 0;

async function compressFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return;

  const stats = fs.statSync(filePath);
  const originalSize = stats.size;

  if (originalSize < 150 * 1024) { skipped++; return; }

  try {
    // Read file into buffer first to avoid path issues
    const inputBuffer = fs.readFileSync(filePath);
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    let pipeline = sharp(inputBuffer);

    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    let outputBuffer;
    if (ext === '.webp') {
      outputBuffer = await pipeline.webp({ quality: QUALITY }).toBuffer();
    } else {
      outputBuffer = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    }

    if (outputBuffer.length < originalSize) {
      if (ext === '.png') {
        const newPath = filePath.replace(/\.png$/i, '.jpg');
        fs.writeFileSync(newPath, outputBuffer);
        fs.unlinkSync(filePath);
        const saved = originalSize - outputBuffer.length;
        totalSavedBytes += saved;
        processed++;
      } else {
        fs.writeFileSync(filePath, outputBuffer);
        const saved = originalSize - outputBuffer.length;
        totalSavedBytes += saved;
        processed++;
      }
    } else {
      skipped++;
    }
  } catch (e) {
    errors++;
    console.error(`ERROR: ${path.basename(filePath)}: ${e.message}`);
  }
}

async function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      // Skip Quotes folder
      if (entry === 'Quotes') continue;
      await walkDir(full);
    } else {
      await compressFile(full);
    }
  }
}

async function main() {
  console.log('Compressing photos (round 2)...\n');
  await walkDir(path.join(__dirname, 'photo'));
  await walkDir(path.join(__dirname, 'images'));
  await walkDir(path.join(__dirname, 'au-vampires-img'));

  console.log(`\n=== DONE ===`);
  console.log(`Compressed: ${processed} files`);
  console.log(`Skipped (already small): ${skipped} files`);
  console.log(`Errors: ${errors} files`);
  console.log(`Total saved: ${(totalSavedBytes / 1024 / 1024).toFixed(1)} MB`);
}

main();
