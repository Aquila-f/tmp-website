import type { ImageMetadata } from 'astro';
import { getCollection } from 'astro:content';
import exifr from 'exifr';
import { join } from 'node:path';

const imageModules = import.meta.glob<{ default: ImageMetadata }>(
  '../content/photos/**/photo.jpg',
  { eager: true },
);

type ExifData = {
  DateTimeOriginal?: string;
  CreateDate?: string;
  ExposureTime?: number;
  FNumber?: number;
  FocalLength?: number;
};

export type Photo = {
  id: string;
  image: ImageMetadata;
  alt: string;
  caption?: string;
  location?: string;
  capturedAt: string;
  date: string;
  aperture: string;
  focalLength: string;
  shutter: string;
};

const formatNumber = (value: number) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));

const formatDate = (value: string) => {
  const [date = ''] = value.split(' ');
  return date ? date.replaceAll(':', '.') : '—';
};

const formatShutter = (seconds?: number) => {
  if (!seconds) return '—';
  if (seconds >= 1) return `${formatNumber(seconds)}s`;
  return `1/${Math.round(1 / seconds)}s`;
};

export async function getPhotos(): Promise<Photo[]> {
  const entries = await getCollection('photos');

  const photos = await Promise.all(entries.map(async (entry) => {
    const imageKey = `../content/photos/${entry.id}/photo.jpg`;
    const image = imageModules[imageKey]?.default;

    if (!image) {
      throw new Error(`Missing photo.jpg for photo entry: ${entry.id}`);
    }

    const filePath = join(process.cwd(), 'src', 'content', 'photos', entry.id, 'photo.jpg');
    const exif = await exifr.parse(filePath, {
      pick: ['DateTimeOriginal', 'CreateDate', 'FNumber', 'FocalLength', 'ExposureTime'],
      reviveValues: false,
    }) as ExifData | undefined;

    const capturedAt = exif?.DateTimeOriginal ?? exif?.CreateDate ?? '';
    const date = formatDate(capturedAt);

    return {
      id: entry.id,
      image,
      alt: entry.data.alt ?? `Photograph taken on ${date}`,
      caption: entry.data.caption,
      location: entry.data.location,
      capturedAt,
      date,
      aperture: exif?.FNumber ? `ƒ/${formatNumber(exif.FNumber)}` : '—',
      focalLength: exif?.FocalLength ? `${formatNumber(exif.FocalLength)}mm` : '—',
      shutter: formatShutter(exif?.ExposureTime),
    };
  }));

  return photos.sort((a, b) => b.capturedAt.localeCompare(a.capturedAt));
}
