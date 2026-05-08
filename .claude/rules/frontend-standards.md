# Frontend Standards

**Applies when:** project uses a web framework with metadata/SEO support — detect via `next.config.*`, `nuxt.config.*`, `svelte.config.*`, `astro.config.*`, or `app/layout.*` (Next.js App Router).

**IMPORTANT:** Every page a public user can land on MUST have proper metadata. Bare `{ title, description }` is not enough — always include OpenGraph + Twitter so shared links render correctly on Facebook, Zalo, Twitter, Telegram previews.

## Required in Every Project

### 1. Root layout metadata (static)

Root `layout.tsx` / `app.vue` / equivalent MUST export:
- `metadataBase` — absolute URL of production domain
- `title` (with `template` for child pages)
- `description`
- `openGraph` — title, description, url, siteName, locale, type, images[]
- `twitter` — card, title, description, images

Next.js App Router example:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com"),
  title: { default: "Site Name", template: "%s · Site Name" },
  description: "One-line value prop.",
  openGraph: {
    title: "Site Name",
    description: "One-line value prop.",
    url: "/",
    siteName: "Site Name",
    locale: "vi_VN",
    type: "website",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Name",
    description: "One-line value prop.",
    images: ["/opengraph-image.png"],
  },
};
```

### 2. OpenGraph image

Provide **one** of:
- `app/opengraph-image.png` (1200×630 static)
- `app/opengraph-image.tsx` (dynamic via `ImageResponse`, preferred when title comes from config/DB)
- `public/opengraph-image.png` + explicit `images: ["/opengraph-image.png"]`

Do NOT ship a project without any OG image — social previews show blank card.

### 3. Dynamic routes MUST export `generateMetadata`

Any route with `[id]`, `[slug]`, `[...path]` must derive title + description from the actual entity — never inherit root title only.

```tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;
  const entity = await fetchEntity(id);
  return {
    title: entity.name,
    description: entity.summary,
    openGraph: { title: entity.name, description: entity.summary },
  };
}
```

### 4. robots + sitemap

- `app/robots.ts` exporting the `MetadataRoute.Robots` config
- `app/sitemap.ts` exporting URLs (at minimum root + main public routes)

For admin/private-only apps where indexing is unwanted, `robots.ts` must return `{ rules: { userAgent: "*", disallow: "/" } }`.

### 5. `<html lang>` must match primary audience

- Vietnamese-first apps: `<html lang="vi">`
- English-first: `<html lang="en">`
- Never leave the default `en` if the UI copy is not English.

## Anti-patterns to Reject

- ❌ `export const metadata = { title: "App" }` and nothing else — incomplete
- ❌ Hard-coding title in `layout.tsx` when every page should override via `title.template`
- ❌ Skipping `metadataBase` — causes `og:image` to resolve against localhost in production
- ❌ Dynamic route page without `generateMetadata` — Facebook shows root title for every deep link
- ❌ Forgetting `twitter` block — Twitter/X falls back to generic card
- ❌ Putting OG image in `/public/og.png` without declaring it in `images: []`

## When Adding/Editing Pages

Before marking a page task complete, verify the page has (or inherits from root that has):
1. `title` present
2. `description` present
3. OG image resolvable
4. If dynamic: `generateMetadata` implemented

## When Scaffolding a New Project

Apply this entire checklist as part of the initial commit. Do not defer to "SEO later" — retrofitting is more expensive than building in from day 1.
