# GoreeCloud Network Dashboard

GoreeCloud Network Dashboard is the browser-facing administration surface for **GoreeCloud Network**. It provides the web interface for managing peers, access controls, routes, DNS, setup keys, users, and other supported network operations.

This repository is maintained as a GoreeCloud consumer of the canonical **GoreeCloud Network** product identity. It is not an independent GoreeCloud product.

## Upstream foundation

This repository is a fork of the open-source [NetBird Dashboard](https://github.com/netbirdio/dashboard). NetBird remains an upstream technology and codebase dependency; its copyright, license, technical identifiers, compatibility environment variables, and required attribution remain intact.

Upstream NetBird branding is not the official identity of GoreeCloud Network. GoreeCloud-controlled dashboard surfaces use the approved GoreeCloud Network identity documented in [`BRANDING.md`](./BRANDING.md).

## Branding authority

Canonical GoreeCloud Network artwork is maintained in the private `GoreeCloud/goreecloud-branding-assets` repository at:

`products/network/app-icon.svg`

The current approved canonical Git blob is:

`7457cd187d65887189150016b44c28af279635e5`

Dashboard-local copies and generated derivatives are governed by [`BRANDING.md`](./BRANDING.md) and checked by `scripts/validate-branding.mjs`.

## Technology

The upstream dashboard architecture currently includes:

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Flow
- Docker-based deployment support

See `package.json`, the Docker assets, and the upstream NetBird project for implementation-specific dependency and compatibility details.

## Local development

Requirements are defined by `package.json`; Node.js 20.9 or newer is currently required.

```shell
npm install
npm run dev
```

The development server runs on `http://localhost:3000` by default.

To run the GoreeCloud branding provenance check independently:

```shell
node scripts/validate-branding.mjs
```

## Configuration compatibility

The fork retains upstream NetBird-compatible configuration and environment-variable names where required by the underlying dashboard/runtime integration. Names such as `NETBIRD_MGMT_API_ENDPOINT` are technical compatibility interfaces and do not establish product branding or authority.

## Project status and authority

Repository contents, screenshots, build success, branding synchronization, or upstream compatibility do not by themselves establish GoreeCloud production readiness, release acceptance, runtime authority, or Stable status. Those claims are governed by the applicable GoreeCloud project documentation, standards, policies, and release process.

## Licensing and attribution

This fork retains the upstream license and required notices. GoreeCloud-specific branding assets remain governed by GoreeCloud's branding and licensing policies; their presence does not alter third-party license obligations for upstream code or assets.
