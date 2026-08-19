# GoreeCloud Network Dashboard Acceptance Plan

## Purpose

This plan defines the minimum dashboard evidence required before the GoreeCloud Network administration interface may be considered production-ready.

## Build and source gates

The candidate dashboard must pass:

- GoreeCloud privacy-boundary validation;
- deterministic `npm ci`;
- ESLint;
- production `next build` using the pinned required IronRDP build assets;
- container build without publishing when validating non-production branches;
- no direct Google Analytics, Hotjar, Google Tag Manager, HubSpot network behavior, AWS Marketplace attribution, or signup-attribution execution in the GoreeCloud application shell.

## Authentication and session smoke tests

Against an isolated GoreeCloud Network control plane, validate:

1. unauthenticated access redirects or blocks as configured;
2. intended OIDC/identity-provider login completes successfully;
3. callback handling returns to the dashboard without exposing tokens in ordinary UI or URLs beyond provider-required behavior;
4. session expiration and reauthentication behave predictably;
5. logout invalidates the dashboard session as expected;
6. an unauthorized or lower-privilege identity cannot access privileged administrative actions.

## Administration smoke tests

Validate creation, editing, disabling where applicable, and deletion for:

- Devices;
- Groups;
- Access Policies;
- Posture Checks;
- Networks;
- Resources;
- Routing Peers;
- DNS Resolvers;
- DNS Settings;
- DNS Zones;
- People & Identities;
- Service Identities;
- setup/enrollment keys;
- Audit Events visibility where supported.

For each destructive action, verify the GoreeCloud warning accurately describes what is removed and what underlying device/service/data remains.

## Access-model tests

Verify:

- newly created resources remain unreachable without an explicit matching Access Policy;
- resource-group membership does not silently grant access outside existing policies;
- policy source groups, destination resources, protocols, and ports produce expected behavior;
- posture conditions narrow access only where configured;
- device or identity revocation does not unexpectedly affect unrelated principals;
- private-network reachability is never presented as application authorization.

## Routing tests

Verify:

- single-device routing-peer assignment;
- group-based routing-peer assignment where supported;
- source-address masquerade behavior and return-route expectations;
- routing metric/priority behavior;
- confirmation before disabling an active routing peer;
- reachability loss when the only routing peer is disabled;
- recovery after re-enable or replacement;
- routing-peer removal does not imply enrolled-device deletion;
- one-off routing-device setup key remains single-use and expires as configured.

## DNS responsibility tests

Verify the dashboard accurately represents GoreeCloud Network as a DNS-configuration delivery layer. The dashboard must not claim ownership of AdGuard Home filtering/private rewrites, Unbound recursion/caching/DNSSEC, or public authoritative DNS.

Test managed resolver delivery, excluded groups, and network-distributed DNS zone records in an isolated environment without changing production DNS state.

## Privacy and product-boundary tests

Verify:

- no NetBird-hosted documentation/support/commercial surfaces reappear in primary navigation;
- no MSP/distributor/billing/marketplace flows are reachable through the GoreeCloud shell unless explicitly reintroduced by a later architecture decision;
- Caddy remains the reverse-proxy authority rather than a duplicate dashboard feature;
- identity-provider MFA is not presented as a GoreeCloud Network-owned function;
- Wardveil Security state does not assert protected/secure/trusted status without runtime evidence.

## Accessibility and UX

Validate keyboard navigation, visible focus, accessible action names, readable confirmation dialogs, understandable empty/error/loading states, and responsive behavior on supported desktop/tablet widths.

Critical operations must not rely on color alone, hover-only discovery, or inaccessible icon-only actions.

## Failure and recovery tests

Validate the dashboard response to:

- control-plane API unavailable;
- authentication provider unavailable;
- stale/expired session;
- failed resource or policy mutation;
- failed routing-peer update;
- partial network interruption;
- browser reload during a non-destructive workflow.

The UI must not report success when the underlying API operation failed.

## Evidence to retain

Retain commit SHA, workflow/run ID, production-build result, container digest if built, isolated control-plane version, test identity/role descriptions, screenshots for material UI states, API/error evidence with secrets redacted, defects, and pass/fail results.

## Exit criteria

The dashboard may advance from draft only after build/lint/source-validation evidence exists and the isolated authentication/API smoke tests pass without unresolved critical/high defects. Production migration remains separately gated by control-plane, Android, backup/restore, and rollback acceptance.
