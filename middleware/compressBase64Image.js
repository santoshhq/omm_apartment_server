const sharp = require('sharp');

async function compressBase64Image(base64String, maxKB = 100) {
  // Remove data URL prefix if present
  const matches = base64String.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 image');
  const buffer = Buffer.from(matches[2], 'base64');

  let quality = 80;
  let compressedBuffer = buffer;
  for (let i = 0; i < 5; i++) {
    compressedBuffer = await sharp(buffer)
      .jpeg({ quality })
      .toBuffer();
    if (compressedBuffer.length <= maxKB * 1024) break;
    quality -= 15;
  }
  return 'data:image/jpeg;base64,' + compressedBuffer.toString('base64');
}

module.exports = compressBase64Image;
