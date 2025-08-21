---
title: "Welcome to the starter"
description: "A quick tour of content collections, prose styles, and how to ship a blog."
publishDate: 2025-08-10
tags: ["starter", "content", "astro"]
---

> This is a markdown post living in `src/content/blog/`. Frontmatter is validated by
> the collection schema in `src/content/config.ts`.

## Why content collections?

- **Type-safety** for frontmatter (thanks to Zod)
- Compile-time checks and automatic typing in `.astro` files
- A clean, portable content folder (`src/content/...`)

### Images

Use your `<Img />` helper for imported images, or simple markdown images if
you point to `/public/*` assets:

```
![Example](/og-default.jpg)
```

### Drafts

Set `draft: true` to hide a post from lists and RSS without deleting it.
