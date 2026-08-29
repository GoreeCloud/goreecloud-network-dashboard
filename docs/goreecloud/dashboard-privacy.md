# GoreeCloud Network Dashboard Privacy Boundary

## Purpose

This record documents the inherited external analytics and marketing integrations found during the GoreeCloud Network dashboard foundation audit and the compatibility-preserving privacy changes applied before Glaze UI conversion.

## Inherited external analytics behavior

The upstream-derived `AnalyticsProvider` supported production initialization and event submission through:

- Google Analytics through `react-ga4`.
- Hotjar through `react-hotjar`.
- Google Tag Manager through injected head/body scripts and the browser `dataLayer`.

Configuration is exposed through the inherited runtime config using fields for Google Analytics, Hotjar, and Google Tag Manager identifiers.

## Inherited HubSpot behavior

The upstream-derived HubSpot path could submit data to `api.hsforms.com`. Depending on the call site and account state, the submission payload could include:

- Email address.
- First and last name.
- Account identifier.
- Owner state.
- Device type derived from the browser user agent.
- UTM source, medium, content, and campaign parameters.
- HubSpot query identifier.
- Google Analytics identifier.
- `_ga` cookie value.
- `hubspotutk` cookie value.
- Current page title.
- Current page URL.

These behaviors are appropriate to evaluate in an upstream commercial/cloud product but are outside the privacy model of a private, self-hosted GoreeCloud administration interface.

## GoreeCloud changes

The `agent/stable-foundation` branch now preserves the inherited analytics context API as a no-op compatibility layer while disabling external behavior:

- Google Analytics is not initialized.
- Hotjar is not initialized.
- Google Tag Manager scripts are not emitted.
- Analytics event helper calls do not transmit events.
- HubSpot forms do not submit user, account, campaign, cookie, page, or device metadata externally.

The HubSpot component/function exports are temporarily retained as no-op compatibility shims so privacy hardening does not require unrelated application-flow rewrites in the same change set.

## Configuration and dependencies

The inherited runtime configuration fields and package dependencies are not removed in this pass. Keeping them temporarily separates behavioral privacy hardening from dependency-lockfile and deployment-template cleanup.

They should be removed in a later validated cleanup after:

1. Source call sites are inventoried.
2. Dashboard lint/build tests pass with the no-op compatibility layer.
3. Deployment templates are checked for assumptions about these environment variables.
4. Package lockfiles are updated through the normal package-management workflow rather than by manual editing.

## Self-hosted compatibility boundary

This privacy change does not intentionally modify:

- OIDC authentication.
- Management API origin.
- Management gRPC API origin.
- Redirect or silent-redirect behavior.
- Token-source behavior.
- Peer, route, policy, DNS, network, user, or setup-key APIs.
- GoreeCloud production NetBird deployment.

## Validation state

The source paths responsible for external analytics and HubSpot submissions have been identified and disabled on the GoreeCloud branch. Build, lint, and end-to-end acceptance remain required before this branch is considered merge-ready.

## Next steps

- Run dashboard lint and production build validation.
- Run inherited end-to-end tests against an isolated self-hosted environment where practical.
- Remove now-unused analytics packages and configuration fields with lockfile-safe dependency updates.
- Audit remaining `src/cloud` features and distinguish reusable self-hosted capabilities from upstream cloud/commercial product assumptions.
- Begin the Glaze UI shell only after the privacy-clean baseline passes source validation.
