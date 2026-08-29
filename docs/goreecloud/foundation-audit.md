# GoreeCloud Network Dashboard Foundation Audit

## Scope

This audit records the first GoreeCloud review of the inherited NetBird dashboard. It covers licensing, build/CI structure, self-hosted configuration surfaces, privacy-sensitive integrations, and the initial Glaze UI migration boundary.

## Verified baseline characteristics

- The dashboard remains a fork of `netbirdio/dashboard` and is licensed under AGPLv3.
- The current frontend foundation uses Next.js 16, React 19, TypeScript, Playwright, Radix UI, Tailwind-related tooling, and other inherited UI dependencies.
- The inherited workflow set includes build/push, codespell, end-to-end testing, cloud-deployment testing, documentation acknowledgement, and deployment-template synchronization.
- Runtime configuration exposes self-hosted management API and authentication endpoints.
- Runtime configuration also includes optional Hotjar, Google Analytics, Google Tag Manager, HubSpot, and cloud-mode fields.

## GoreeCloud privacy position

GoreeCloud does not assume that merely-present analytics configuration is active. However, the inherited analytics and marketing surfaces are not part of the intended GoreeCloud product role and must be removed or disabled only after their code paths and build dependencies are traced and validated.

## Glaze UI boundary

The first Glaze UI work should focus on the product shell, navigation, surfaces, typography, spacing, status presentation, accessibility, and GoreeCloud identity while preserving API contracts and administrative workflows. Authentication, peer management, policies, routes, setup-key operations, and other security-sensitive behavior remain compatibility-critical during the first visual conversion.

## Next engineering gates

1. Trace every analytics/telemetry/marketing code path and remove it without breaking self-hosted operation.
2. Identify NetBird-cloud-only workflows and configuration assumptions.
3. Run inherited lint, build, and Playwright tests before broad visual changes.
4. Establish GoreeCloud-specific privacy-safe configuration defaults.
5. Build the first Glaze UI application shell while retaining functional parity.
