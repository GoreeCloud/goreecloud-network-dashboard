import React from "react";

type Props = {
  children: React.ReactNode;
};

export type HubspotFormField = {
  objectTypeId?: string;
  name: string;
  value: string;
};

/**
 * GoreeCloud privacy boundary.
 *
 * The upstream dashboard can initialize Google Analytics, Google Tag Manager,
 * and Hotjar and exposes helpers that send product-usage events. GoreeCloud
 * does not use third-party behavioral analytics for its private self-hosted
 * administration interface.
 *
 * The context API is intentionally preserved as a no-op compatibility layer
 * so inherited UI components continue to compile while GoreeCloud gradually
 * removes analytics-specific call sites during the fork-to-native transition.
 */
const AnalyticsContext = React.createContext(
  {} as {
    initialized: boolean;
    trackPageView: () => void;
    trackEvent: (category: string, action: string, label: string) => void;
    trackEventV2: (
      category: string,
      name: string,
      value?: string,
      userID?: string,
    ) => void;
    trackGTMCustomEvent: (name: string) => void;
  },
);

const noop = () => undefined;

export default function AnalyticsProvider({ children }: Readonly<Props>) {
  const value = React.useMemo(
    () => ({
      initialized: false,
      trackPageView: noop,
      trackEvent: noop,
      trackEventV2: noop,
      trackGTMCustomEvent: noop,
    }),
    [],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Retained for source compatibility with the inherited application shell.
 * GoreeCloud intentionally emits no Google Tag Manager script.
 */
export const GoogleTagManagerHeadScript = () => null;

export const useAnalytics = () => React.useContext(AnalyticsContext);
