import { access, mkdir, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { formatSize, optimizePhoto, PHOTO_MAX_SIZE, PHOTO_QUALITY } from './photo-image.mjs';

const input = process.argv[2];

if (!input) {
  console.error('Usage: npm run photo:add -- /path/to/photo.jpg');
  process.exit(1);
}

const inputPath = resolve(input);
const inputExtension = extname(inputPath);
const extension = inputExtension.toLowerCase();

if (!['.jpg', '.jpeg'].includes(extension)) {
  throw new Error('Only JPEG photos are supported.');
}

await access(inputPath);

const id = basename(inputPath, inputExtension)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

if (!id) {
  throw new Error('Could not create a photo ID from the filename.');
}

const photoDirectory = resolve('src', 'content', 'photos', id);
const outputPath = join(photoDirectory, 'photo.jpg');

try {
  await access(photoDirectory);
  throw new Error(`Photo entry already exists: ${photoDirectory}`);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await mkdir(photoDirectory, { recursive: true });

try {
  const result = await optimizePhoto(inputPath, outputPath);
  await writeFile(join(photoDirectory, 'index.md'), '---\n---\n', { flag: 'wx' });

  console.log(`Added ${id}`);
  console.log(`${formatSize(result.beforeBytes)} → ${formatSize(result.afterBytes)}`);
  console.log(`JPEG quality ${PHOTO_QUALITY}, max ${PHOTO_MAX_SIZE}px, EXIF preserved`);
} catch (error) {
  const { rm } = await import('node:fs/promises');
  await rm(photoDirectory, { recursive: true, force: true });
  throw error;
}
