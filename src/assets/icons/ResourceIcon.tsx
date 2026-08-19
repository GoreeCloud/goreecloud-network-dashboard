import { GlobeIcon, NetworkIcon, WorkflowIcon } from "lucide-react";
import * as React from "react";

type ResourceType = "domain" | "host" | "subnet";

type Props = {
  type?: ResourceType;
  resource?: {
    type?: ResourceType;
  };
  size?: number;
};

export const ResourceIcon = ({ type, resource, size = 15 }: Props) => {
  const resolvedType = type ?? resource?.type ?? "host";

  switch (resolvedType) {
    case "domain":
      return <GlobeIcon size={size} />;
    case "subnet":
      return <NetworkIcon size={size} />;
    case "host":
      return <WorkflowIcon size={size} />;
    default:
      return <WorkflowIcon size={size} />;
  }
};
