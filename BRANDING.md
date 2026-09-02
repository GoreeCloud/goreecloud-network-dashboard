# GoreeCloud Network Dashboard Branding

All GoreeCloud branding authority belongs to `GoreeCloud/goreecloud-branding-assets`.

This repository is the browser-facing dashboard variant of **GoreeCloud Network**. It is not an independent product identity.

## Canonical identity

- Product: GoreeCloud Network
- Canonical repository: `GoreeCloud/goreecloud-branding-assets`
- Canonical asset: `products/network/app-icon.svg`
- Canonical Git blob: `7457cd187d65887189150016b44c28af279635e5`
- Status: approved in the unified branding catalog

## Synchronized dashboard surfaces

The following files are governed derivatives of that canonical identity:

- `src/assets/goreecloud-network.svg` — byte-identical synchronized copy used by the dashboard header.
- `src/app/icon.svg` — byte-identical synchronized copy used by Next.js browser-icon metadata.
- `src/app/apple-icon.tsx` — generated Apple touch-icon derivative using the approved Network geometry and color family.
- `src/components/GoreeCloudNetworkLogo.tsx` — dashboard lockup composed from the canonical Network mark and the product name.

`src/assets/goreecloud-network.svg` and `src/app/icon.svg` must resolve to canonical Git blob `7457cd187d65887189150016b44c28af279635e5`.

## Upstream NetBird boundary

This repository is a fork of `netbirdio/dashboard` and retains upstream NetBird code, technical identifiers, compatibility names, documentation references, and third-party artwork where those are required for upstream attribution or implementation compatibility.

Upstream artwork such as `src/assets/netbird.svg` and `src/assets/netbird-full.svg` is classified as **upstream**, not GoreeCloud identity. It must not be used as the official mark on GoreeCloud-controlled dashboard surfaces such as the primary header, browser metadata, favicon, Apple touch icon, repository presentation, installers, or GoreeCloud promotional material.

The upstream `src/app/favicon.ico` and `src/app/apple-icon.png` are intentionally not shipped by the GoreeCloud dashboard because they are NetBird product-identity assets.

## Validation

`node scripts/validate-branding.mjs` fails closed when:

- synchronized Network SVGs no longer match the approved canonical Git blob;
- upstream NetBird browser identity files reappear;
- the primary dashboard header stops using the GoreeCloud Network identity;
- browser title or product metadata regresses to upstream NetBird product branding; or
- required governed icon surfaces are missing.

`.github/workflows/branding.yml` runs this validation on pull requests and on `main`.

Branding does not establish network authority, runtime acceptance, release readiness, or Stable status. Those claims remain governed by the applicable GoreeCloud project documentation, standards, and release processes.
