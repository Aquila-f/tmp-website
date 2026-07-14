import exifr from 'exifr';
import { rename, rm, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

export const PHOTO_MAX_SIZE = 2400;
export const PHOTO_QUALITY = 85;

const exifFields = ['DateTimeOriginal', 'CreateDate', 'FNumber', 'FocalLength', 'ExposureTime'];

export async function readPhotoExif(filePath) {
  return exifr.parse(filePath, {
    pick: exifFields,
    reviveValues: false,
  });
}

function assertExifPreserved(before, after, filePath) {
  const beforeDate = before?.DateTimeOriginal ?? before?.CreateDate;
  const afterDate = after?.DateTimeOriginal ?? after?.CreateDate;

  if (beforeDate && beforeDate !== afterDate) {
    throw new Error(`EXIF capture date was not preserved for ${filePath}`);
  }

  for (const field of ['FNumber', 'FocalLength', 'ExposureTime']) {
    if (before?.[field] != null && before[field] !== after?.[field]) {
      throw new Error(`EXIF ${field} was not preserved for ${filePath}`);
    }
  }
}

export async function optimizePhoto(inputPath, outputPath) {
  const tempPath = join(dirname(outputPath), `.photo-${process.pid}-${Date.now()}.jpg`);
  const beforeExif = await readPhotoExif(inputPath);

  try {
    await sharp(inputPath)
      .autoOrient()
      .resize({
        width: PHOTO_MAX_SIZE,
        height: PHOTO_MAX_SIZE,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: PHOTO_QUALITY,
        mozjpeg: true,
      })
      .keepMetadata()
      .toFile(tempPath);

    const afterExif = await readPhotoExif(tempPath);
    assertExifPreserved(beforeExif, afterExif, inputPath);

    const [before, after] = await Promise.all([stat(inputPath), stat(tempPath)]);
    await rename(tempPath, outputPath);

    return {
      beforeBytes: before.size,
      afterBytes: after.size,
      exif: afterExif,
    };
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

export function formatSize(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
