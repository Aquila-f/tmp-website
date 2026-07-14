# Aquila — Personal website

Minimal personal website built with Astro. It includes four routes: Home, Blog, Portfolio, and Photo.

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
```

## Photos

Each photo lives with one minimal Markdown entry:

```text
src/content/photos/<photo-id>/
├── index.md
└── photo.jpg
```

`index.md` may stay empty:

```md
---
---
```

Date, aperture, focal length, and shutter speed are read from the JPEG EXIF data at build time. Photos are sorted by the original capture date, newest first.

Optional editorial fields can be added only when needed:

```md
---
alt: A descriptive alternative text
caption: Optional caption
location: Optional location
---
```
