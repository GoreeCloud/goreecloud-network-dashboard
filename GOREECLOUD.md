# GoreeCloud Network Dashboard

This repository is the GoreeCloud-maintained administration interface for GoreeCloud Network, derived from the NetBird dashboard.

## Current development state

The dashboard remains upstream-compatible while GoreeCloud establishes a controlled product shell. The initial work focuses on provenance, privacy, build reproducibility, Glaze UI integration planning, Wardveil Security presentation, and removal or replacement of upstream cloud-specific assumptions where doing so is safe.

No production NetBird dashboard is replaced by work on this branch until the GoreeCloud dashboard passes separate functional, security, accessibility, migration, and rollback acceptance.

## Upstream relationship

Upstream project: `netbirdio/dashboard`

The inherited application is a Next.js/React web application. The current fork baseline declares Node.js 20.9 or later and includes Next.js 16, React 19, Playwright end-to-end testing, Radix UI components, Tailwind-related tooling, and multiple visualization/interface dependencies.

## Licensing

The inherited dashboard is licensed under GNU Affero General Public License version 3. GoreeCloud will preserve the license and applicable source-availability, attribution, copyright, and modification requirements.

## GoreeCloud interface direction

- Use **Glaze UI** as the design language for GoreeCloud-controlled screens and components.
- Use **Wardveil Security by GoreeCloud** for security-state presentation, policy-risk indicators, device trust/enrollment status, and security-oriented workflows.
- Preserve accessibility and clear status communication as release requirements.
- Keep ordinary user/device status separate from privileged network administration.
- Prefer self-hosted-first configuration and remove unnecessary hosted-service assumptions only after dependency and behavior review.
- Review analytics, telemetry, hosted integrations, and third-party tracking dependencies before any production build is approved.

## Privacy review targets

The inherited dependency set currently includes packages associated with Google Analytics and Hotjar. Their presence does not by itself prove that telemetry is active in a GoreeCloud deployment, but all related code paths and configuration must be reviewed. GoreeCloud production builds must not enable unnecessary tracking or analytics.

## Current branch purpose

`agent/stable-foundation` is the initial controlled GoreeCloud dashboard development branch. Material UI rebranding and Glaze UI conversion will occur only after the inherited build, tests, authentication flow, configuration model, and self-hosted behavior are understood and validated.
