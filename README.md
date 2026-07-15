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

## Deployment

Pushes to `master` are automatically deployed to GitHub Pages at:

`https://aquila-f.github.io/tmp-website/`

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** once before the first deployment.

## Photos

Import a JPEG with the photo helper:

```sh
npm run photo:add -- /path/to/photo.jpg
```

The command creates the photo entry, limits the longest edge to 2400px, writes an 85-quality JPEG, and preserves EXIF metadata. Keep full-resolution originals outside this repository.

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

## Reading notes

Reading content is split by purpose rather than source format: multi-part engineering material is a technical series, while general book notes are standalone articles.

Technical series keep an overview and ordered articles:

```text
src/content/reading/<series>/
├── index.md
└── <ordered-article>/
    ├── index.md
    └── images/
```

Their frontmatter uses `section: technical`; article order comes from the `order` field. Series and article routes are generated below `/blog/<series>/`.

Standalone book notes live here:

```text
src/content/reading/books/<book-slug>/
├── index.md
└── images/
```

Book-note frontmatter uses `type: article` and `section: book`. These notes link directly from the Blog page to `/blog/books/<book-slug>/`, without an intermediate one-item series page.

## Essays

Standalone essays live in `src/content/posts/` and are also listed at `/blog/`. Their `permalink` frontmatter determines the generated `/posts/YYYY/MM/slug/` route.

## Portfolio

Portfolio case studies keep their Markdown and images together:

```text
src/content/portfolio/<project>/
├── index.md
└── project-image.jpg
```

They are listed at `/portfolio/`, with detail routes generated from the project directory name.
