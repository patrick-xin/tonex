# Rendering — Cache Components (static vs partial prerender)

Governs every `page.tsx` / `layout.tsx` and any `'use cache'`. This app runs `cacheComponents: true` + `reactCompiler: true` (`next.config.ts`) — the **old route-segment config knobs are gone**; caching is a component-level decision. No ADR (framework behavior); sources linked inline. Terms → [../../glossary.md](../../glossary.md).

## Model — dynamic-by-default, per component

A component lands in the prerendered **static shell** one of three ways; anything else is a **request-time hole**:

- **Static** — reads nothing that varies per request (no `params` / `cookies()` / `headers()` / `searchParams` / `Date.now()` / random / uncached `fetch`). Auto-prerendered, no directive.
- **`'use cache'`** — result is cached, and prerendered too **iff its cache-key inputs are known before the request** (e.g. a slug from `generateStaticParams`). Inputs unknown at build → it's a runtime cache fill, not shell.
- **`<Suspense>`** — the *fallback* goes in the shell; the inner async content streams at request time.

## Build symbols

| Symbol | Meaning | Reached when |
| --- | --- | --- |
| `○` Static | prerendered, no request-time work | route has **no dynamic param segment** and no streamed hole |
| `◐` Partial Prerender | static shell + content resolved at request time | a `<Suspense>` streams request-specific data, **or** the route has a dynamic param segment (see below) |
| `ƒ` Dynamic | rendered per request | request data read outside any cache/suspense boundary |

The `Revalidate` / `Expire` columns (e.g. `30d 1y`) come from the `'use cache'` default `cacheLife` profile — their presence confirms the segment is cached.

## Rules

- **Put `'use cache'` *inside* the async component, as its first statement — never at module top of a file that also exports a sync `generateStaticParams`.** Module-level `'use cache'` applies to every export; the sync `generateStaticParams` then fails the build with `"use cache" functions must be async functions`. _(trap hit 2026-06-11)_
- **Never reach for `export const dynamic | dynamicParams | revalidate | fetchCache`.** All are rejected under Cache Components — Next's own text: *"`dynamicParams` is not available when Cache Components is enabled."* Control caching with `'use cache'` + `cacheLife`/`cacheTag`, and request-time work with `<Suspense>`. _([cacheComponents config](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents))_
- **`generateStaticParams` must return ≥1 param.** An empty array fails the build — Cache Components validates the route against a sample param. _([empty-generate-static-params](https://nextjs.org/docs/messages/empty-generate-static-params))_
- **On a dynamic segment, read `params` only inside `'use cache'` or behind `<Suspense>`.** A bare `await params` in an uncached, un-suspended page throws *"Blocking data accessed outside of Suspense"*. Awaiting inside `'use cache'` makes the slug the cache key → every `generateStaticParams` entry prebuilds to a static HTML file. _([dynamic-routes#with-cache-components](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes#with-cache-components))_

## Dynamic-param routes are `◐` by design — don't chase `○`

A `[slug]` / `[...slug]` route under Cache Components **always** keeps a prerendered fallback shell for params outside `generateStaticParams` (Next source: `dynamicParams ? supportsRoutePreGeneration ? isRoutePPREnabled ? FallbackMode.PRERENDER …`). Because `dynamicParams = false` is unavailable, that on-demand fallback can't be closed, so the **route** reports `◐`. This is **not** a bug and **not** fixable by config.

- The enumerated pages (`docs/components/button`, …) are still **real static HTML on disk**, CDN-served — `◐` marks the route's fallback capability, not a per-page verdict.
- A bogus slug renders once at runtime then `notFound()` (saved to disk), instead of a build-time 404. For local MDX that path is essentially never hit.
- Want a fully-`○` route? It must have **no dynamic param segment** (a static page like the landing). Such a route stays `○` until you add a genuinely request-specific `<Suspense>` hole.

Applies here to `app/(content)/docs/[...slug]/page.tsx` and `app/(content)/blog/[...slug]/page.tsx` — both correctly `◐`.
