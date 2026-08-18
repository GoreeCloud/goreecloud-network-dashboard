import * as React from "react";
import { HubspotFormField } from "@/contexts/AnalyticsProvider";

/**
 * GoreeCloud privacy boundary.
 *
 * The upstream dashboard can submit account, identity, campaign, device, page,
 * cookie, and analytics metadata to HubSpot. GoreeCloud's private self-hosted
 * dashboard does not submit user or account data to external marketing or
 * analytics services.
 *
 * These exports remain as no-op compatibility shims while inherited call sites
 * are removed incrementally. Keeping the public component/function signatures
 * avoids coupling privacy hardening to unrelated UI or networking changes.
 */
export const Hubspot = () => null;

type FormProps = {
  id: string;
  fields: HubspotFormField[];
  onSuccess?: () => void;
  hubspotQueryId?: string;
  gaId?: string;
  portalId?: string;
};

export const HubspotForm = ({ onSuccess }: FormProps) => {
  React.useEffect(() => {
    onSuccess?.();
  }, [onSuccess]);

  return null;
};

export const submitHubspotForm = async (_props: FormProps) => undefined;
