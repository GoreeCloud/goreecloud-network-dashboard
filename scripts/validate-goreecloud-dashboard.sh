#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'GoreeCloud dashboard validation failed: %s\n' "$1" >&2
  exit 1
}

analytics='src/contexts/AnalyticsProvider.tsx'
hubspot='src/cloud/analytics/Hubspot.tsx'
shell='src/layouts/AppLayout.tsx'

# The GoreeCloud dashboard must not directly load third-party behavioral analytics.
# Keep the shell quoting simple: this expression only needs to catch ordinary
# JavaScript/TypeScript import and require forms for the retired packages.
if grep -RInE \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=out \
  -- 'from ["'\'' ]*react-(ga4|hotjar)["'\'']|require\(["'\'']react-(ga4|hotjar)["'\'']\)' \
  src; then
  fail 'direct GA4/Hotjar runtime import detected'
fi

# The retained compatibility providers must remain inert until removed entirely.
grep -Fq 'GoogleTagManagerHeadScript = () => null' "$analytics" \
  || fail 'Google Tag Manager compatibility boundary is no longer a no-op'
grep -Fq 'initialized: false' "$analytics" \
  || fail 'analytics provider no longer reports disabled state'
grep -Fq 'export const Hubspot = () => null' "$hubspot" \
  || fail 'HubSpot compatibility component is no longer a no-op'
grep -Eq 'submitHubspotForm = async .*=> undefined' "$hubspot" \
  || fail 'HubSpot form submission compatibility function is no longer inert'

if grep -nE 'fetch\(|XMLHttpRequest|navigator\.sendBeacon|api\.hsforms|hubspot\.com' "$hubspot"; then
  fail 'external HubSpot network behavior detected'
fi

# Commercial attribution hooks must not return to the GoreeCloud root shell.
if grep -nE 'useAWSMarketplace|useSignupSource|AWSMarketplace|SignupSource' "$shell"; then
  fail 'commercial attribution hook detected in application shell'
fi

printf 'GoreeCloud dashboard privacy-boundary validation passed.\n'
